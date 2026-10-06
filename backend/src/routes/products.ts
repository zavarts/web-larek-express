import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import {
  validateProductCreate,
  validateProductId,
  validateProductUpdate,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductCreate, createProduct);
router.patch('/:productId', auth, validateProductUpdate, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
