import { Router } from 'express';
import createOrder from '../controllers/order';
import { validateOrderCreate } from '../middlewares/validations';

const router = Router();

router.post('/', validateOrderCreate, createOrder);

export default router;
