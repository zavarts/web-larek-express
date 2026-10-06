import {
  NextFunction, Request, Response,
} from 'express';
import multer from 'multer';

interface IError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: IError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'На сервере произошла ошибка'
    : err.message;

  return res.status(statusCode).send({ message });
};

export default errorHandler;
