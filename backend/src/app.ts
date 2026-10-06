import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { errors as celebrateErrors } from 'celebrate';
import {
  DB_ADDRESS,
  ORIGIN_ALLOW,
  PORT,
  PUBLIC_PATH,
  TEMP_PATH,
  UPLOAD_PATH,
} from './config';
import routes from './routes';
import { errorLogger, requestLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';

const app = express();

fs.mkdirSync(TEMP_PATH, { recursive: true });
fs.mkdirSync(path.join(PUBLIC_PATH, UPLOAD_PATH), { recursive: true });

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(PUBLIC_PATH));
app.use(requestLogger);

app.use(routes);

app.use(errorLogger);
app.use(celebrateErrors());
app.use(errorHandler);

// очистка временных файлов старше 1 часа каждый час
cron.schedule('0 * * * *', async () => {
  try {
    const files = await fs.promises.readdir(TEMP_PATH);
    const now = Date.now();

    await Promise.all(files.map(async (file) => {
      const filePath = path.join(TEMP_PATH, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtimeMs > 60 * 60 * 1000) {
        await fs.promises.unlink(filePath);
      }
    }));
  } catch {
    // игнорируем ошибки очистки
  }
});

mongoose.connect(DB_ADDRESS)
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Ошибка подключения к MongoDB:', err);
  });
