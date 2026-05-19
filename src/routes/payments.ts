import express from 'express';
import {
  initializeMoMoPayment,
  verifyPayment,
  paystackWebhook,
} from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post('/momo/initialize', initializeMoMoPayment);
router.post('/momo/verify/:reference', verifyPayment);

// Webhook route (no auth - verified by signature)
router.post('/webhook/paystack', paystackWebhook);

export default router;
