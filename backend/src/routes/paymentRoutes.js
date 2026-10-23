import express from 'express';
import { protect, optionalProtect } from '../middleware/auth.js';
import {
  getGatewayConfig,
  createOrder,
  verifyRazorpay,
  capturePayPal,
  handleWebhook,
  getMyPayments,
} from '../controllers/paymentController.js';

const router = express.Router();

// Configuration & Public key discovery
router.get('/config', optionalProtect, getGatewayConfig);

// Invoices & Payment Ledger for Authenticated Client
router.get('/my-payments', protect, getMyPayments);

// Unified Order Creation
router.post('/create-order', protect, createOrder);

// Gateway Verification & Capture
router.post('/razorpay/verify', protect, verifyRazorpay);
router.post('/paypal/capture', protect, capturePayPal);

// Webhook for gateway background events
router.post('/webhook', handleWebhook);

export default router;
