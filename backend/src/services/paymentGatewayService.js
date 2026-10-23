import crypto from 'crypto';
import Razorpay from 'razorpay';

import {
  getLiveUsdToInrRate,
  getCurrentUsdToInrRate,
  convertUsdToInr,
  convertInrToUsd,
  calculateGst,
  calculateTicketPricing,
} from './currencyService.js';

export {
  getLiveUsdToInrRate,
  getCurrentUsdToInrRate,
  convertUsdToInr,
  convertInrToUsd,
  calculateGst,
  calculateTicketPricing,
};

export const USD_TO_INR_RATE = getCurrentUsdToInrRate();


// Check if credentials exist and are non-placeholder
export const isRazorpayConfigured = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  return Boolean(
    keyId &&
    secret &&
    !keyId.includes('YOUR_') &&
    !keyId.includes('rzp_test_placeholder')
  );
};

export const isPayPalConfigured = () => {
  const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
  return Boolean(
    clientId &&
    secret &&
    !clientId.includes('YOUR_') &&
    !clientId.includes('placeholder')
  );
};

// Get PayPal Base URL based on environment
const getPayPalBaseUrl = () => {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

/**
 * -------------------------------------------------------------
 * RAZORPAY METHODS
 * -------------------------------------------------------------
 */
let razorpayInstance = null;
const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    });
  }
  return razorpayInstance;
};

/**
 * Create Razorpay Order
 * @param {number} amountInr - Amount in Indian Rupees (e.g. 500)
 * @param {string} receipt - Identifier, typically ticketId (e.g. TKT-2026-001)
 * @param {object} notes - Key-value metadata
 */
export const createRazorpayOrder = async ({ amountInr, receipt, notes = {} }) => {
  const amountPaise = Math.round(Number(amountInr) * 100);

  if (!isRazorpayConfigured()) {
    // Return structured simulated order for pre-integration sandbox testing
    const simulatedOrderId = `order_sim_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: simulatedOrderId,
      entity: 'order',
      amount: amountPaise,
      amount_paid: 0,
      amount_due: amountPaise,
      currency: 'INR',
      receipt: String(receipt || 'REC_SIM'),
      status: 'created',
      isSimulated: true,
      keyId: 'rzp_test_simulated',
    };
  }

  const rzp = getRazorpayInstance();
  const options = {
    amount: amountPaise,
    currency: 'INR',
    receipt: String(receipt || `REC_${Date.now()}`).substring(0, 40),
    payment_capture: 1,
    notes: {
      ...notes,
      source: 'DiziGini Portal',
    },
  };

  const order = await rzp.orders.create(options);
  return {
    ...order,
    isSimulated: false,
    keyId: process.env.RAZORPAY_KEY_ID.trim(),
  };
};

/**
 * Verify Razorpay HMAC SHA256 Signature
 */
export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
  isSimulated = false,
}) => {
  // If in sandbox preview mode or simulated order
  if (isSimulated || !isRazorpayConfigured()) {
    return {
      isValid: true,
      isSimulated: true,
      message: 'Simulated Razorpay transaction verified successfully.',
    };
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET.trim();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );

    return {
      isValid,
      isSimulated: false,
      message: isValid ? 'Signature verified' : 'Invalid Razorpay signature',
    };
  } catch (err) {
    return {
      isValid: false,
      isSimulated: false,
      message: err.message,
    };
  }
};

/**
 * -------------------------------------------------------------
 * PAYPAL METHODS (REST API v2)
 * -------------------------------------------------------------
 */
const getPayPalAccessToken = async () => {
  if (!isPayPalConfigured()) return null;

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID.trim()}:${process.env.PAYPAL_CLIENT_SECRET.trim()}`
  ).toString('base64');

  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain PayPal OAuth token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Create PayPal Checkout Order
 * @param {number} amountUsd - Sprint fee in USD
 * @param {string} ticketCode - Ticket identifier
 * @param {string} description - Item description
 */
export const createPayPalOrder = async ({ amountUsd, ticketCode, description = 'DiziGini Service Sprint' }) => {
  const formattedAmount = Number(amountUsd || 0).toFixed(2);

  if (!isPayPalConfigured()) {
    // Return structured simulated order for pre-integration testing
    const simulatedOrderId = `order_sim_pp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: simulatedOrderId,
      status: 'CREATED',
      isSimulated: true,
      amount: formattedAmount,
      currency: 'USD',
      clientId: 'pp_test_simulated',
    };
  }

  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: ticketCode || `TKT_${Date.now()}`,
          description: description.substring(0, 127),
          amount: {
            currency_code: 'USD',
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: 'DiziGini',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal Order Creation Failed: ${err}`);
  }

  const data = await response.json();
  return {
    ...data,
    isSimulated: false,
    clientId: process.env.PAYPAL_CLIENT_ID.trim(),
  };
};

/**
 * Capture PayPal Order Payment
 */
export const capturePayPalOrder = async ({ orderId, isSimulated = false }) => {
  if (isSimulated || !isPayPalConfigured()) {
    return {
      id: `capture_sim_pp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'COMPLETED',
      isSimulated: true,
      payer: {
        email_address: 'client-sandbox@dizigini.com',
        name: { given_name: 'Client', surname: 'Partner' },
      },
    };
  }

  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal Capture Failed: ${err}`);
  }

  const data = await response.json();
  return {
    ...data,
    isSimulated: false,
  };
};
