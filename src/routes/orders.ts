import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController';
import { protect, authorize, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public routes (guest checkout allowed)
router.post('/', optionalAuth, createOrder);

// Protected routes
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllOrders);
router.put('/admin/:id/status', protect, authorize('admin'), updateOrderStatus);
router.get('/admin/stats', protect, authorize('admin'), getOrderStats);

export default router;
