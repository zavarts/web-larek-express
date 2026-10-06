import {
  NextFunction, Request, Response,
} from 'express';
import { UPLOAD_PATH } from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return next(new BadRequestError('Файл не был загружен'));
    }

    return res.send({
      fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (error) {
    return next(error);
  }
};

export default uploadFile;
