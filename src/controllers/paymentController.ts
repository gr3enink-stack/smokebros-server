import { Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { PAYSTACK_CONFIG } from '../config/paystack';

// @desc    Initialize Mobile Money payment
// @route   POST /api/payments/momo/initialize
// @access  Public
export const initializeMoMoPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, phone, amount, orderId, provider } = req.body;

    if (!email || !phone || !amount || !orderId) {
      res.status(400).json({
        success: false,
        message: 'Email, phone, amount, and orderId are required',
      });
      return;
    }

    // Convert GHS to pesewas (GHS smallest unit)
    const amountInPesewas = Math.round(amount * 100);

    // Initialize payment with Paystack
    const response = await axios.post(
      `${PAYSTACK_CONFIG.baseUrl}/charge`,
      {
        email,
        amount: amountInPesewas,
        currency: PAYSTACK_CONFIG.currency,
        channel: 'mobile_money',
        phone,
        metadata: {
          order_id: orderId,
          custom_fields: [
            {
              display_name: 'Phone Number',
              variable_name: 'phone_number',
              value: phone,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({
      success: true,
      data: {
        reference: response.data.data.reference,
        authorizationUrl: response.data.data.redirecturl,
        accessCode: response.data.data.access_code,
      },
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.response?.data || error.message,
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/momo/verify/:reference
// @access  Public
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    const response = await axios.get(`${PAYSTACK_CONFIG.baseUrl}/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      },
    });

    const paymentData = response.data.data;

    res.status(200).json({
      success: true,
      data: {
        status: paymentData.status,
        reference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert back to GHS
        currency: paymentData.currency,
        paidAt: paymentData.paid_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// @desc    Paystack webhook handler
// @route   POST /api/payments/webhook/paystack
// @access  Public (Paystack only)
export const paystackWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_CONFIG.secretKey!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const event = req.body;

    // Handle charge success
    if (event.event === 'charge.success') {
      const data = event.data;
      const orderId = data.metadata?.order_id;

      if (!orderId) {
        res.status(400).json({ success: false, message: 'Order ID not found in metadata' });
        return;
      }

      // Find the order
      const order = await Order.findById(orderId);

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      // Check if already processed (idempotency)
      if (order.payment.status === 'success') {
        res.status(200).json({ success: true, message: 'Webhook already processed' });
        return;
      }

      // Update payment status
      order.payment.status = 'success';
      order.payment.reference = data.reference;
      order.payment.paidAt = new Date(data.paid_at);
      order.status = 'confirmed';

      // Decrement stock for each item
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      await order.save();

      console.log(`Order ${orderId} payment confirmed and stock updated`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
