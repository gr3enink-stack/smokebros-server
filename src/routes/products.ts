import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/:slug', getProduct);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
