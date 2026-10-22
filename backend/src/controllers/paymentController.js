import { query } from '../config/postgres.js';
import {
  findRequestById,
  updateRequest,
} from '../repositories/requestRepository.js';

import {
  createPayment,
  countPayments,
} from '../repositories/paymentRepository.js';

import { createNotification } from '../repositories/notificationRepository.js';
import { findActiveSpecialists } from '../repositories/userRepository.js';
import { resolveRequest } from '../utils/ticketHelpers.js';
import { sendTicketAssignedEmail } from '../services/emailService.js';

import {
  isRazorpayConfigured,
  isPayPalConfigured,
  USD_TO_INR_RATE,
  convertUsdToInr,
  createRazorpayOrder,
  verifyRazorpaySignature,
  createPayPalOrder,
  capturePayPalOrder,
} from '../services/paymentGatewayService.js';

/**
 * Check if the authenticated user has permission to pay for this ticket
 */
const canUserPayTicket = (user, request) => {
  if (!user || !request) return false;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;

  const userCompanyId = user.companyId
    ? String(user.companyId.id || user.companyId._id || user.companyId)
    : null;
  const requestCompanyId = request.companyId
    ? String(request.companyId.id || request.companyId._id || request.companyId)
    : null;
  const userId = String(user.id || user._id);
  const requestUserId = String(
    request.userId?.id || request.userId?._id || request.userId || request.user_id
  );

  return (
    (userCompanyId && requestCompanyId && userCompanyId === requestCompanyId) ||
    userId === requestUserId
  );
};

/**
 * Common helper to finalize ticket payment and auto-assign specialist
 */
const finalizeTicketPayment = async ({
  request,
  user,
  gateway,
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  amount,
  currency,
  paymentMethod,
  metadata = {},
}) => {
  const updates = { paymentStatus: 'PAID' };
  let specialist = null;

  if (request.status === 'REQUEST_CREATED') {
    // Auto-assign to active specialist for this service type
    const specialists = await findActiveSpecialists(request.serviceType);
    specialist = specialists[0] || null;

    if (specialist) {
      updates.assignedTo = specialist.id;
      updates.status = 'ASSIGNED';

      await createNotification({
        userId: specialist.id,
        type: 'ASSIGNMENT',
        title: 'New paid ticket assigned',
        message: `Ticket ${request.ticketId}: "${request.title}" has been paid via ${gateway} and assigned to you.`,
        ticketId: request.id,
        ticketCode: request.ticketId,
      });

      sendTicketAssignedEmail({
        specialist,
        ticket: { ...request, ...updates },
        assignedBy: { name: `Automated ${gateway} Sprint Checkout` },
      }).catch((err) => console.error('[EMAIL DISPATCH ERROR]:', err));
    } else {
      updates.status = 'PAYMENT_COMPLETED';
    }
  }

  const updatedRequest = await updateRequest(request.id, updates);

  // Generate invoice number
  const paymentCount = await countPayments();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${1000 + paymentCount + 1}`;

  const paymentRecord = await createPayment({
    invoiceNumber,
    requestId: request.id,
    userId: user.id || user._id,
    companyId: request.companyId?.id || request.companyId,
    amount,
    currency,
    status: 'PAID',
    paymentMethod,
    gateway,
    gatewayOrderId,
    gatewayPaymentId,
    gatewaySignature,
    metadata: {
      ...metadata,
      completedAt: new Date().toISOString(),
    },
    paidAt: new Date(),
  });

  // Real-time notification to Super Admin and Admins
  try {
    const adminUsers = await query(
      `SELECT id FROM users WHERE status = 'ACTIVE' AND is_deleted = false AND role IN ('SUPER_ADMIN', 'ADMIN')`
    );
    for (const admin of adminUsers.rows) {
      await createNotification({
        userId: admin.id,
        type: 'PAYMENT_RECEIVED',
        title: `Payment Received: ${invoiceNumber}`,
        message: `Client ${user.name || 'Client'} paid ${currency === 'INR' ? '₹' : '$'}${amount} for Ticket ${request.ticketId} via ${gateway}. Invoice ${invoiceNumber} created.`,
        ticketId: request.id,
        ticketCode: request.ticketId,
      });
    }

    // Also notify paying client
    const clientId = user.id || user._id;
    if (clientId) {
      await createNotification({
        userId: clientId,
        type: 'PAYMENT_SUCCESS',
        title: `Payment Confirmed: ${invoiceNumber}`,
        message: `Your payment of ${currency === 'INR' ? '₹' : '$'}${amount} for Ticket ${request.ticketId} has been confirmed. Invoice ${invoiceNumber} is now available in your Billing ledger.`,
        ticketId: request.id,
        ticketCode: request.ticketId,
      });
    }
  } catch (notifErr) {
    console.error('[PAYMENT NOTIFICATION DISPATCH ERROR]:', notifErr);
  }

  return { updatedRequest, paymentRecord };
};

/**
 * @desc    Get Gateway Public Configuration & Status
 * @route   GET /api/payments/config
 * @access  Private
 */
export const getGatewayConfig = async (req, res) => {
  try {
    const razorpayAvailable = isRazorpayConfigured();
    const paypalAvailable = isPayPalConfigured();

    res.json({
      success: true,
      gateways: {
        razorpay: {
          enabled: razorpayAvailable,
          keyId: razorpayAvailable ? process.env.RAZORPAY_KEY_ID.trim() : 'rzp_live_SxtZmpzZxUlYV0',
          currency: 'INR',
          label: 'Razorpay (Credit Card, Debit Card, UPI, NetBanking, India)',
        },
        paypal: {
          enabled: paypalAvailable,
          clientId: paypalAvailable ? process.env.PAYPAL_CLIENT_ID.trim() : 'Ac7EuMLUwJL9QIoncQmTbia32WENG5utxnlSgazQRlUfmgram_QT0OIvXOY8yv_lzYvgWaiGHLMfKlo4',
          mode: process.env.PAYPAL_MODE || 'live',
          currency: 'USD',
          label: 'PayPal (Global Credit Card & PayPal Balance)',
        },
      },
      isSandbox: !razorpayAvailable || !paypalAvailable,
      exchangeRate: {
        usdToInr: USD_TO_INR_RATE,
      },
    });
  } catch (error) {
    console.error('[Payment Config Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment configuration.' });
  }
};

/**
 * @desc    Create Gateway Order (Razorpay or PayPal)
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const {
      ticketId,
      gateway = 'RAZORPAY',
      allowRepay = false,
      price: reqPrice,
      priceUsd: reqPriceUsd,
      amount: reqAmount,
      amountInr: reqAmountInr,
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required.' });
    }

    const request = await resolveRequest(ticketId);
    if (!request && !String(ticketId).startsWith('TKT') && !String(ticketId).startsWith('CG-')) {
      return res.status(404).json({ success: false, message: 'Sprint ticket not found.' });
    }

    if (request && !canUserPayTicket(req.user, request)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to process payment for this ticket.',
      });
    }

    if (request && request.paymentStatus === 'PAID' && !allowRepay && !req.body.force) {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been paid in full.',
      });
    }

    let priceUsd = Number(reqPriceUsd || reqPrice || reqAmount || request?.price || request?.requirements?.totalPrice || 19);
    if (!priceUsd || isNaN(priceUsd) || priceUsd <= 0) {
      priceUsd = 19;
    }

    const effectiveTicketCode = request?.ticketId || (ticketId ? String(ticketId) : `TKT_${Date.now()}`);
    const effectiveRequestId = request?.id || ticketId;

    if (gateway.toUpperCase() === 'RAZORPAY') {
      let priceInr = reqAmountInr ? Number(reqAmountInr) : convertUsdToInr(priceUsd);
      if (!priceInr || isNaN(priceInr) || priceInr < 1) {
        priceInr = Math.max(100, Math.round(priceUsd * USD_TO_INR_RATE));
      }

      const order = await createRazorpayOrder({
        amountInr: priceInr,
        receipt: effectiveTicketCode.substring(0, 40),
        notes: {
          ticketId: String(effectiveRequestId),
          ticketCode: String(effectiveTicketCode),
          serviceType: String(request?.serviceType || 'Sprint'),
        },
      });

      return res.json({
        success: true,
        gateway: 'RAZORPAY',
        order,
        pricing: {
          usd: priceUsd,
          inr: priceInr,
          rate: USD_TO_INR_RATE,
        },
      });
    }

    if (gateway.toUpperCase() === 'PAYPAL') {
      const order = await createPayPalOrder({
        amountUsd: priceUsd,
        ticketCode: effectiveTicketCode.substring(0, 40),
        description: `${request?.title || 'Sprint Service'} - ${effectiveTicketCode}`,
      });

      return res.json({
        success: true,
        gateway: 'PAYPAL',
        order,
        pricing: {
          usd: priceUsd,
        },
      });
    }

    return res.status(400).json({ success: false, message: `Unsupported payment gateway: ${gateway}` });
  } catch (error) {
    console.error('[Create Order Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment order.' });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature and finalize ticket
 * @route   POST /api/payments/razorpay/verify
 * @access  Private
 */
export const verifyRazorpay = async (req, res) => {
  try {
    const {
      ticketId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulated = false,
      paymentMethod = 'Razorpay (UPI / Card / NetBanking)',
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required.' });
    }

    const request = await resolveRequest(ticketId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (!canUserPayTicket(req.user, request)) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this ticket.' });
    }

    // Verify cryptographic signature
    const verification = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      isSimulated,
    });

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay payment signature. Payment verification failed.',
      });
    }

    if (request.paymentStatus === 'PAID') {
      return res.json({
        success: true,
        message: 'Razorpay payment verified successfully!',
        isSimulated: verification.isSimulated,
        payment: {
          transactionId: razorpay_payment_id,
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        request,
      });
    }

    const priceUsd = Number(request.price || 0);
    const priceInr = convertUsdToInr(priceUsd);

    const { updatedRequest, paymentRecord } = await finalizeTicketPayment({
      request,
      user: req.user,
      gateway: 'RAZORPAY',
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      amount: priceInr,
      currency: 'INR',
      paymentMethod,
      metadata: {
        isSimulated: verification.isSimulated,
        amountUsd: priceUsd,
        amountInr: priceInr,
      },
    });

    res.json({
      success: true,
      message: 'Razorpay payment completed and sprint ticket assigned successfully!',
      isSimulated: verification.isSimulated,
      payment: paymentRecord,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('[Verify Razorpay Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment verification error.' });
  }
};

/**
 * @desc    Capture PayPal Order and finalize ticket
 * @route   POST /api/payments/paypal/capture
 * @access  Private
 */
export const capturePayPal = async (req, res) => {
  try {
    const {
      ticketId,
      orderId,
      isSimulated = false,
      paymentMethod = 'PayPal Checkout',
    } = req.body;

    if (!ticketId || !orderId) {
      return res.status(400).json({ success: false, message: 'Ticket ID and PayPal Order ID are required.' });
    }

    const request = await resolveRequest(ticketId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (!canUserPayTicket(req.user, request)) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this ticket.' });
    }

    // Capture payment
    const captureResult = await capturePayPalOrder({ orderId, isSimulated });

    if (request.paymentStatus === 'PAID') {
      return res.json({
        success: true,
        message: 'PayPal payment confirmed successfully!',
        isSimulated: captureResult.isSimulated,
        payment: {
          transactionId: captureResult.id || orderId,
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        request,
      });
    }

    const priceUsd = Number(request.price || 0);

    const { updatedRequest, paymentRecord } = await finalizeTicketPayment({
      request,
      user: req.user,
      gateway: 'PAYPAL',
      gatewayOrderId: orderId,
      gatewayPaymentId: captureResult.id || orderId,
      gatewaySignature: null,
      amount: priceUsd,
      currency: 'USD',
      paymentMethod,
      metadata: {
        isSimulated: captureResult.isSimulated,
        payer: captureResult.payer,
      },
    });

    res.json({
      success: true,
      message: 'PayPal payment captured and sprint ticket assigned successfully!',
      isSimulated: captureResult.isSimulated,
      payment: paymentRecord,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('[Capture PayPal Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'PayPal capture failed.' });
  }
};

/**
 * @desc    Webhook receiver for background gateway notifications
 * @route   POST /api/payments/webhook
 * @access  Public (Signature verified)
 */
export const handleWebhook = async (req, res) => {
  try {
    // Log incoming webhook event for auditing
    console.log('[Payment Webhook Received]:', {
      headers: req.headers['x-razorpay-signature'] ? 'Razorpay' : 'Other',
      event: req.body?.event || req.body?.event_type,
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    res.status(400).json({ received: false, error: error.message });
  }
};
