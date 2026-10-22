/**
 * Dynamic Payment SDK Loader for Razorpay & PayPal
 */

let razorpayPromise = null;
export const loadRazorpaySdk = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        razorpayPromise = null;
        reject(new Error('Failed to load Razorpay Checkout SDK. Please check your network connection.'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayPromise;
};

let paypalPromise = null;
let currentPayPalClientId = null;
export const loadPayPalSdk = (clientId, currency = 'USD') => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.paypal && currentPayPalClientId === clientId) {
    return Promise.resolve(window.paypal);
  }

  if (!clientId || clientId.includes('placeholder') || clientId === 'pp_test_simulated') {
    return Promise.resolve(null);
  }

  if (!paypalPromise || currentPayPalClientId !== clientId) {
    currentPayPalClientId = clientId;
    paypalPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('paypal-sdk-script');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.id = 'paypal-sdk-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
      script.async = true;
      script.onload = () => {
        resolve(window.paypal);
      };
      script.onerror = () => {
        paypalPromise = null;
        reject(new Error('Failed to load PayPal SDK. Please check your network connection.'));
      };
      document.body.appendChild(script);
    });
  }

  return paypalPromise;
};
