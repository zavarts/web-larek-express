import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { TEMP_PATH } from '../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_PATH);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'));
  }
};

const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default fileMiddleware;
