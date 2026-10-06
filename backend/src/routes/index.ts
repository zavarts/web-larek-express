import { Router } from 'express';
import NotFoundError from '../errors/not-found-error';
import productsRouter from './products';
import orderRouter from './order';
import authRouter from './auth';
import uploadRouter from './upload';

const router = Router();

router.use('/product', productsRouter);
router.use('/order', orderRouter);
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);

router.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

export default router;
