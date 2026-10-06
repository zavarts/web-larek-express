import {
  NextFunction, Request, Response,
} from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IAuthRequest extends Request {
  user?: {
    _id: string;
  };
}

interface IJwtPayload {
  _id: string;
}

const auth = (req: IAuthRequest, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as IJwtPayload;
    req.user = { _id: payload._id };
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
