import {
  NextFunction, Response,
} from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { Error as MongooseError, Types } from 'mongoose';
import { StringValue } from 'ms';
import User from '../models/user';
import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  cookieOptions,
} from '../config';
import { IAuthRequest } from '../middlewares/auth';
import BadRequestError from '../errors/bad-request-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';

interface ITokenPayload extends JwtPayload {
  _id: string;
}

const createTokens = (_id: string) => {
  const accessToken = jwt.sign(
    { _id },
    JWT_SECRET,
    { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as StringValue } as SignOptions,
  );

  const refreshToken = jwt.sign(
    { _id },
    JWT_REFRESH_SECRET,
    { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as StringValue } as SignOptions,
  );

  return { accessToken, refreshToken };
};

const sendAuthResponse = (
  res: Response,
  user: { email: string; name: string },
  accessToken: string,
  refreshToken: string,
) => {
  res
    .cookie('refreshToken', refreshToken, cookieOptions)
    .send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
};

export const login = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const { accessToken, refreshToken } = createTokens(user._id.toString());

    user.tokens.push({ token: refreshToken });
    await user.save();

    return sendAuthResponse(res, user, accessToken, refreshToken);
  } catch {
    return next(new UnauthorizedError('Неправильные почта или пароль'));
  }
};

export const register = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = createTokens(user._id.toString());

    user.tokens = [{ token: refreshToken }];
    await user.save();

    return sendAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

export const getCurrentUser = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    let payload: ITokenPayload;

    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as ITokenPayload;
    } catch {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    if (!Types.ObjectId.isValid(payload._id)) {
      return next(new BadRequestError('Некорректный идентификатор пользователя'));
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    user.tokens = user.tokens.filter((item) => item.token !== refreshToken);
    await user.save();

    return res
      .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 0 })
      .send({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    let payload: ITokenPayload;

    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as ITokenPayload;
    } catch {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    const tokenExists = user.tokens.some((item) => item.token === refreshToken);

    if (!tokenExists) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }

    const tokens = createTokens(user._id.toString());

    user.tokens = user.tokens
      .filter((item) => item.token !== refreshToken)
      .concat({ token: tokens.refreshToken });
    await user.save();

    return sendAuthResponse(res, user, tokens.accessToken, tokens.refreshToken);
  } catch (error) {
    return next(error);
  }
};
