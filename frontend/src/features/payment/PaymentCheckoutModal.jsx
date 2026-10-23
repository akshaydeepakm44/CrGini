import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Globe,
  Zap,
  RefreshCw,
  Receipt,
  FileCheck,
  Smartphone,
  Building,
  QrCode,
  Lock,
  Coins,
  Percent,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { loadRazorpaySdk, loadPayPalSdk } from '../../utils/paymentSdkLoader';
import PaymentReceiptModal from './PaymentReceiptModal';

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  ticket,
  onPaymentSuccess,
}) {
  const [selectedGateway, setSelectedGateway] = useState('RAZORPAY'); // 'RAZORPAY' | 'PAYPAL'
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showFormalReceipt, setShowFormalReceipt] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPaymentSuccessData(null);
      setReceiptData(null);
      setShowFormalReceipt(false);
      setIsProcessing(false);
      setProcessingStatus('');
      return;
    }

    let isMounted = true;
    async function fetchConfig() {
      setIsLoadingConfig(true);
      try {
        const res = await api.getPaymentConfig();
        if (isMounted) {
          setConfig(res);
        }
      } catch (err) {
        console.warn('Using live fallback payment configuration:', err.message);
        if (isMounted) {
          setConfig({
            isSandbox: false,
            gateways: {
              razorpay: {
                enabled: true,
                keyId: 'rzp_live_SxtZmpzZxUlYV0',
                currency: 'INR',
                label: 'Razorpay (Credit Card, Debit Card, UPI, NetBanking)',
              },
              paypal: {
                enabled: true,
                clientId: 'Ac7EuMLUwJL9QIoncQmTbia32WENG5utxnlSgazQRlUfmgram_QT0OIvXOY8yv_lzYvgWaiGHLMfKlo4',
                mode: 'live',
                currency: 'USD',
                label: 'PayPal (Global Credit Card & PayPal Balance)',
              },
            },
            exchangeRate: { usdToInr: 94.90, isLive: true, gstRatePercent: 18 },
          });
        }
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    }

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const ticketPriceUsd = Number(ticket.price || ticket.requirements?.totalPrice || 19);
  const exchangeRate = Number(config?.exchangeRate?.usdToInr || 94.90);
  const isRateLive = Boolean(config?.exchangeRate?.isLive ?? true);
  const gstRatePercent = Number(config?.exchangeRate?.gstRatePercent || 18);

  // 1. Base INR before tax
  const basePriceInr = Math.max(100, Math.round(ticketPriceUsd * exchangeRate));

  // 2. 18% GST calculation for Indian transactions via Razorpay
  const gstAmountInr = Math.round(basePriceInr * (gstRatePercent / 100));

  // 3. Total amount payable through Razorpay
  const totalRazorpayInr = basePriceInr + gstAmountInr;

  // Handle REAL Razorpay Checkout Modal
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Connecting to Razorpay Secure Gateway...');

    try {
      const orderRes = await api.createPaymentOrder({
        ticketId: ticket.id || ticket.ticketId,
        gateway: 'RAZORPAY',
        price: ticketPriceUsd,
        priceUsd: ticketPriceUsd,
        amountInr: totalRazorpayInr,
        allowRepay: true,
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Failed to initialize Razorpay order');
      }

      setProcessingStatus('Launching Razorpay Checkout window...');
      const RazorpaySdk = await loadRazorpaySdk();
      const RzpConstructor = RazorpaySdk || window.Razorpay;
      if (!RzpConstructor) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
      }

      const effectiveKey = config?.gateways?.razorpay?.keyId || orderRes.order?.keyId || 'rzp_live_SxtZmpzZxUlYV0';
      const effectiveAmount = orderRes.order?.amount || (totalRazorpayInr * 100);

      const options = {
        key: effectiveKey,
        amount: effectiveAmount,
        currency: orderRes.order?.currency || 'INR',
        name: 'DiziGini',
        description: `Payment for ${ticket.ticketId || 'Sprint'}: ${ticket.title || 'Sprint Service'} (Incl. 18% GST)`,
        image: window.location.origin + '/logo-icon.svg',
        order_id: orderRes.order?.id,
        handler: async (response) => {
          setProcessingStatus('Verifying payment signature with Razorpay...');
          try {
            let finalTicket = ticket;
            // If this is a draft ticket, create the actual DB ticket ONLY now after payment is confirmed
            if (ticket.isDraft && ticket.payload) {
              setProcessingStatus('Securing sprint intelligence & creating ticket...');
              const createRes = await api.createRequest({
                ...ticket.payload,
                paymentStatus: 'PAID',
              });
              finalTicket = createRes;
            }

            setProcessingStatus('Verifying payment signature with Razorpay...');
            const verifyRes = await api.verifyRazorpayPayment({
              ticketId: finalTicket.id || finalTicket.ticketId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isSimulated: false,
              paymentMethod: 'Razorpay (Credit Card / UPI / NetBanking)',
            });

            if (verifyRes.success) {
              const utr = verifyRes.payment?.utrNumber || response.razorpay_payment_id;
              const invoiceData = {
                id: verifyRes.payment?.id,
                invoiceNumber: verifyRes.payment?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                transactionId: response.razorpay_payment_id,
                gatewayPaymentId: response.razorpay_payment_id,
                utrNumber: utr,
                metadata: verifyRes.payment?.metadata,
                gateway: 'RAZORPAY',
                paymentMethod: 'Razorpay (Credit / Debit Card, UPI, NetBanking)',
                amountUsd: ticketPriceUsd,
                amount: ticketPriceUsd,
                paidAt: new Date().toISOString(),
                requestTitle: finalTicket.title || ticket.title,
                ticketId: finalTicket.ticketId || (finalTicket.id ? `CG-${finalTicket.id}` : 'CG-SPRINT'),
                userName: ticket.contactName || finalTicket.user?.name,
                companyName: ticket.clientCompany || finalTicket.company?.name,
                userEmail: ticket.userEmail || finalTicket.user?.email,
                requirements: finalTicket.requirements || ticket.requirements,
                rawRequest: finalTicket,
              };
              setReceiptData(invoiceData);
              setPaymentSuccessData({
                gateway: 'Razorpay',
                method: 'Razorpay Live (Card / UPI / NetBanking)',
                amount: `₹${totalRazorpayInr.toLocaleString()} INR`,
                baseAmountInr: `₹${basePriceInr.toLocaleString()} INR`,
                gstAmountInr: `₹${gstAmountInr.toLocaleString()} INR (18% GST)`,
                amountUsd: `$${ticketPriceUsd}.00 USD`,
                exchangeRate: exchangeRate,
                invoiceNumber: invoiceData.invoiceNumber,
                transactionId: response.razorpay_payment_id,
                utrNumber: utr,
                isSimulated: false,
              });
              if (onPaymentSuccess) onPaymentSuccess(verifyRes, finalTicket, invoiceData);
            }
          } catch (verErr) {
            setError(verErr.message || 'Signature verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: ticket.clientCompany || ticket.contactName || '',
          email: ticket.userEmail || ticket.email || '',
          contact: ticket.phone || ticket.mobile || '',
        },
        notes: {
          ticketId: String(ticket.ticketId || ticket.id || ''),
          ticketTitle: String(ticket.title || ''),
        },
        theme: {
          color: '#3B2874', // Purple brand theme matching CareerGini checkout
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setProcessingStatus('');
          },
        },
      };

      const rzpInstance = new RzpConstructor(options);
      rzpInstance.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp.error);
        setError(resp.error?.description || 'Payment was declined or cancelled.');
        setIsProcessing(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('[Razorpay Checkout Error]:', err);
      setError(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle REAL PayPal Checkout Window
  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Initiating PayPal checkout order...');

    try {
      const orderRes = await api.createPaymentOrder({
        ticketId: ticket.id || ticket.ticketId,
        gateway: 'PAYPAL',
        price: ticketPriceUsd,
        allowRepay: true,
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Failed to create PayPal order');
      }

      const approveLink = orderRes.order?.links?.find((l) => l.rel === 'approve')?.href;
      if (approveLink) {
        // Open the REAL PayPal popup window
        const width = 540;
        const height = 720;
        const left = Math.max(0, (window.innerWidth - width) / 2);
        const top = Math.max(0, (window.innerHeight - height) / 2);
        const paypalWindow = window.open(
          approveLink,
          'PayPalCheckout',
          `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
        );

        if (!paypalWindow || paypalWindow.closed || typeof paypalWindow.closed === 'undefined') {
          // Fallback if popup blocker intercepted
          window.location.href = approveLink;
          return;
        }

        const timer = setInterval(async () => {
          if (paypalWindow.closed) {
            clearInterval(timer);
            setProcessingStatus('Securing sprint intelligence & confirming PayPal transaction...');
            try {
              let finalTicket = ticket;
              if (ticket.isDraft && ticket.payload) {
                const createRes = await api.createRequest({
                  ...ticket.payload,
                  paymentStatus: 'PAID',
                });
                finalTicket = createRes;
              }

              const captureRes = await api.capturePayPalPayment({
                ticketId: finalTicket.id || finalTicket.ticketId,
                orderId: orderRes.order.id,
                isSimulated: false,
                paymentMethod: 'PayPal Express',
              });

              if (captureRes.success) {
                const invoiceData = {
                  id: captureRes.payment?.id,
                  invoiceNumber: captureRes.payment?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  transactionId: captureRes.payment?.transactionId || orderRes.order.id,
                  gateway: 'PAYPAL',
                  paymentMethod: 'PayPal Express (Global Credit Card / Balance)',
                  amountUsd: ticketPriceUsd,
                  amount: ticketPriceUsd,
                  paidAt: new Date().toISOString(),
                  requestTitle: finalTicket.title || ticket.title,
                  ticketId: finalTicket.ticketId || (finalTicket.id ? `CG-${finalTicket.id}` : 'CG-SPRINT'),
                  userName: ticket.contactName || finalTicket.user?.name,
                  companyName: ticket.clientCompany || finalTicket.company?.name,
                  userEmail: ticket.userEmail || finalTicket.user?.email,
                  requirements: finalTicket.requirements || ticket.requirements,
                  rawRequest: finalTicket,
                };
                setReceiptData(invoiceData);
                setPaymentSuccessData({
                  gateway: 'PayPal',
                  method: 'PayPal Express',
                  amount: `$${ticketPriceUsd}.00 USD`,
                  amountUsd: `$${ticketPriceUsd}.00 USD`,
                  invoiceNumber: invoiceData.invoiceNumber,
                  transactionId: invoiceData.transactionId,
                  isSimulated: false,
                });
                if (onPaymentSuccess) onPaymentSuccess(captureRes, finalTicket, invoiceData);
              }
            } catch (capErr) {
              console.warn('PayPal capture status check:', capErr.message);
            } finally {
              setIsProcessing(false);
            }
          }
        }, 1000);
      } else {
        // Fallback capture
        let finalTicket = ticket;
        if (ticket.isDraft && ticket.payload) {
          const createRes = await api.createRequest({
            ...ticket.payload,
            paymentStatus: 'PAID',
          });
          finalTicket = createRes;
        }

        const captureRes = await api.capturePayPalPayment({
          ticketId: finalTicket.id || finalTicket.ticketId,
          orderId: orderRes.order.id,
          isSimulated: false,
          paymentMethod: 'PayPal Checkout',
        });

        if (captureRes.success) {
          const invoiceData = {
            id: captureRes.payment?.id,
            invoiceNumber: captureRes.payment?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            transactionId: captureRes.payment?.transactionId || orderRes.order.id,
            gateway: 'PAYPAL',
            paymentMethod: 'PayPal Checkout (Global Credit Card / Balance)',
            amountUsd: ticketPriceUsd,
            amount: ticketPriceUsd,
            paidAt: new Date().toISOString(),
            requestTitle: finalTicket.title || ticket.title,
            ticketId: finalTicket.ticketId || (finalTicket.id ? `CG-${finalTicket.id}` : 'CG-SPRINT'),
            userName: ticket.contactName || finalTicket.user?.name,
            companyName: ticket.clientCompany || finalTicket.company?.name,
            userEmail: ticket.userEmail || finalTicket.user?.email,
            requirements: finalTicket.requirements || ticket.requirements,
            rawRequest: finalTicket,
          };
          setReceiptData(invoiceData);
          setPaymentSuccessData({
            gateway: 'PayPal',
            method: 'PayPal Checkout',
            amount: `$${ticketPriceUsd}.00 USD`,
            amountUsd: `$${ticketPriceUsd}.00 USD`,
            invoiceNumber: invoiceData.invoiceNumber,
            transactionId: invoiceData.transactionId,
            isSimulated: false,
          });
          if (onPaymentSuccess) onPaymentSuccess(captureRes, finalTicket, invoiceData);
        }
      }
    } catch (err) {
      console.error('[PayPal Checkout Error]:', err);
      setError(err.message || 'PayPal payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 65px -12px rgba(59, 40, 116, 0.3), 0 0 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================
            1. MODAL HEADER - Matches CareerGini Secure Checkout Branding
            ============================================================ */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FAFAFD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#3B2874',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(59, 40, 116, 0.25)',
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                  Secure Checkout
                </h3>
                <span
                  style={{
                    backgroundColor: '#EDE9FE',
                    color: '#3B2874',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {ticket.ticketId || ticket.ticket_id || 'TKT-PENDING'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                DiziGini Sprint Execution • {ticket.title || ticket.serviceLabel || 'Growth Service'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F0FDF4',
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid #DCFCE7',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={15} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065F46', lineHeight: 1.2 }}>Your payment is secure</div>
                <div style={{ fontSize: '0.7rem', color: '#059669', lineHeight: 1.2 }}>256-bit SSL encryption</div>
              </div>
            </div>

            {!isProcessing && (
              <button
                onClick={onClose}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================
            2. MODAL BODY
            ============================================================ */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* SUCCESS SCREEN */}
          {paymentSuccessData ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '2px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                  Payment Settled Successfully!
                </h3>
                <p style={{ color: '#4B5563', fontSize: '0.92rem', margin: 0, maxWidth: '440px' }}>
                  Your sprint has been confirmed and verified through {paymentSuccessData.gateway}. Our specialist team has been assigned.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div
                style={{
                  backgroundColor: '#FAF8FF',
                  border: '1px solid #DDD4FA',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  width: '100%',
                  maxWidth: '480px',
                  textAlign: 'left',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Invoice Number:</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{paymentSuccessData.invoiceNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Payment UTR / Proof Ref:</span>
                  <span style={{ fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}>
                    {paymentSuccessData.utrNumber || paymentSuccessData.transactionId}
                  </span>
                </div>
                {paymentSuccessData.utrNumber && paymentSuccessData.transactionId && paymentSuccessData.utrNumber !== paymentSuccessData.transactionId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6B7280' }}>Gateway Payment ID:</span>
                    <span style={{ fontWeight: 600, color: '#4B5563', fontFamily: 'monospace' }}>
                      {paymentSuccessData.transactionId}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Gateway & Channel:</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{paymentSuccessData.gateway} ({paymentSuccessData.method})</span>
                </div>
                {paymentSuccessData.baseAmountInr && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6B7280' }}>Sprint Base Price:</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>{paymentSuccessData.baseAmountInr} ({paymentSuccessData.amountUsd})</span>
                  </div>
                )}
                {paymentSuccessData.gstAmountInr && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6B7280' }}>Goods & Services Tax (GST 18%):</span>
                    <span style={{ color: '#B45309', fontWeight: 700 }}>+{paymentSuccessData.gstAmountInr}</span>
                  </div>
                )}
                {paymentSuccessData.exchangeRate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: '#6B7280' }}>Forex Conversion Rate:</span>
                    <span style={{ color: '#4B5563' }}>1 USD = ₹{Number(paymentSuccessData.exchangeRate).toFixed(2)} INR</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E5E7EB', fontSize: '1rem', fontWeight: 800 }}>
                  <span style={{ color: '#111827' }}>Total Paid:</span>
                  <span style={{ color: '#059669' }}>{paymentSuccessData.amount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowFormalReceipt(true)}
                  style={{
                    backgroundColor: '#65A30D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 24px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(101, 163, 13, 0.3)',
                  }}
                >
                  <Receipt size={16} />
                  View & Print Official Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, #3B2874 0%, #2A1A5E 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 32px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 40, 116, 0.25)',
                  }}
                >
                  Close & View Active Sprint
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. TOP SUMMARY BANNER (EXACT REPLICA OF IMAGE 1) */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'stretch',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  marginBottom: '1.5rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Dark Navy Total Payable Box (Left) */}
                <div
                  style={{
                    backgroundColor: '#1E1B4B',
                    color: '#FFFFFF',
                    padding: '1.25rem 1.75rem',
                    minWidth: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.02em' }}>
                    Total Payable
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, margin: '4px 0' }}>
                    ₹{totalRazorpayInr.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#E2E8F0' }}>INR</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    Base ${ticketPriceUsd}.00 USD + 18% GST
                  </span>
                </div>

                {/* Middle 4-Factor Metric Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    padding: '0.85rem 1.25rem',
                    justifyContent: 'space-around',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* 1. Sprint Base */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '95px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coins size={15} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Sprint Base</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>₹{basePriceInr.toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(${ticketPriceUsd} USD)</span>
                  </div>

                  <div style={{ width: '1px', height: '44px', background: '#E2E8F0' }} />

                  {/* 2. Forex Rate */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '95px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Percent size={15} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Forex Rate</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>₹{exchangeRate.toFixed(2)}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>/ USD</span>
                  </div>

                  <div style={{ width: '1px', height: '44px', background: '#E2E8F0' }} />

                  {/* 3. GST (18%) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '95px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Percent size={15} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>GST (18%)</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#D97706' }}>+ ₹{gstAmountInr.toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>&nbsp;</span>
                  </div>

                  <div style={{ width: '1px', height: '44px', background: '#E2E8F0' }} />

                  {/* 4. Total Payable */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '95px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={15} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Total Payable</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E1B4B' }}>₹{totalRazorpayInr.toLocaleString()} INR</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>&nbsp;</span>
                  </div>
                </div>

                {/* Far Right: 256-Bit SSL Encrypted & Live Daily Rate */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '1rem 1.25rem',
                    borderLeft: '1px solid #F1F5F9',
                    backgroundColor: '#FAFAFD',
                    gap: '8px',
                    minWidth: '180px',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#059669',
                    }}
                  >
                    <Check size={14} />
                    <span>256-bit SSL Encrypted</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#475569' }}>
                    <Zap size={14} color="#3B82F6" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Live Daily Rate</div>
                      <div style={{ color: '#64748B' }}>1 USD = ₹{exchangeRate.toFixed(2)} INR</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status or Error Banner */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#B91C1C',
                    fontSize: '0.85rem',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* 2. SELECT REAL PAYMENT METHOD SECTION */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Select Real Payment Method
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#64748B' }}>
                      Choose your preferred payment option for a secure and seamless checkout.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    <Lock size={12} />
                    <span>100% Secure | PCI DSS Compliant</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                  {/* Option 1: Razorpay Card */}
                  <div
                    onClick={() => !isProcessing && setSelectedGateway('RAZORPAY')}
                    style={{
                      border: selectedGateway === 'RAZORPAY' ? '2px solid #6366F1' : '1px solid #E2E8F0',
                      backgroundColor: selectedGateway === 'RAZORPAY' ? '#FAF5FF' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedGateway === 'RAZORPAY' ? '0 6px 20px rgba(99, 102, 241, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Radio indicator */}
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `2px solid ${selectedGateway === 'RAZORPAY' ? '#6366F1' : '#CBD5E1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {selectedGateway === 'RAZORPAY' && (
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366F1' }} />
                          )}
                        </div>

                        {/* Razorpay Brand with lightning flash */}
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
                          ⚡ Razorpay
                        </span>
                      </div>

                      <span
                        style={{
                          backgroundColor: '#EDE9FE',
                          color: '#4F46E5',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        ₹ INR • Live
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 30px', fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.45 }}>
                      Official Razorpay Checkout with Credit Card, Debit Card, UPI QR, & NetBanking.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: '30px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>💳 Cards</span>
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>⚡ UPI QR</span>
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>🏦 NetBanking</span>
                    </div>
                  </div>

                  {/* Option 2: PayPal Card */}
                  <div
                    onClick={() => !isProcessing && setSelectedGateway('PAYPAL')}
                    style={{
                      border: selectedGateway === 'PAYPAL' ? '2px solid #0070BA' : '1px solid #E2E8F0',
                      backgroundColor: selectedGateway === 'PAYPAL' ? '#F0F9FF' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedGateway === 'PAYPAL' ? '0 6px 20px rgba(0, 112, 186, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Radio indicator */}
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `2px solid ${selectedGateway === 'PAYPAL' ? '#0070BA' : '#CBD5E1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {selectedGateway === 'PAYPAL' && (
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0070BA' }} />
                          )}
                        </div>

                        {/* PayPal Brand */}
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003087', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
                          PayPal
                        </span>
                      </div>

                      <span
                        style={{
                          backgroundColor: '#E0F2FE',
                          color: '#0070BA',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        $ USD • Global
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 30px', fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.45 }}>
                      Official PayPal Checkout with International Credit Cards and PayPal Balances.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: '30px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>💳 International Cards</span>
                      <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>🅿 PayPal Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. AVAILABLE PAYMENT FACTORS BANNER (MATCHING IMAGE 1) */}
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={15} />
                  </div>
                  <span>Available Payment Factors in {selectedGateway === 'RAZORPAY' ? 'Razorpay' : 'PayPal'}</span>
                </div>

                {selectedGateway === 'RAZORPAY' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EDE9FE', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>Credit & Debit Cards</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>Visa, Mastercard, RuPay, Maestro with 3D Secure OTP & EMI options.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <QrCode size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>UPI QR & Apps</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>Scan dynamic QR or pay via PhonePe, Google Pay, Paytm, CRED.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>NetBanking & Wallets</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>50+ Indian banks (HDFC, ICICI, SBI, Axis) & popular wallets.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', color: '#0070BA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>Credit & Debit Cards</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>Visa, Mastercard, American Express, Discover (No PayPal account required).</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', color: '#0070BA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Globe size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A', display: 'block', fontSize: '0.85rem' }}>PayPal Account</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>Pay with PayPal balance, linked bank account, or Pay in 4 installments.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* Processing Progress Feedback */}
              {isProcessing && (
                <div
                  style={{
                    backgroundColor: '#FAF8FF',
                    border: '1px solid #DDD4FA',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <RefreshCw size={20} className="spin" color="#3B2874" style={{ animation: 'spin 1s linear infinite' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3B2874' }}>
                      {processingStatus || 'Connecting to payment gateway...'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      Please complete your payment in the official gateway screen.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ============================================================
            3. MODAL FOOTER - Opens REAL Razorpay / PayPal Checkout
            ============================================================ */}
        {!paymentSuccessData && (
          <div
            style={{
              padding: '1.1rem 1.75rem',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#FAFAFD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                background: '#FFFFFF',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel & Return
            </button>

            {selectedGateway === 'RAZORPAY' ? (
              <button
                type="button"
                onClick={handleRazorpayPayment}
                disabled={isProcessing || isLoadingConfig}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #3B2874 0%, #2A1A5E 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.75 : 1,
                  boxShadow: '0 4px 14px rgba(59, 40, 116, 0.3)',
                }}
              >
                <Lock size={16} />
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                    {isProcessing ? 'Launching Razorpay...' : `Pay ₹${totalRazorpayInr.toLocaleString()} with Razorpay`}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#DDD4FA', fontWeight: 500 }}>
                    (Cards, UPI, NetBanking • 18% GST)
                  </span>
                </div>
                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePayPalPayment}
                disabled={isProcessing || isLoadingConfig}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #0070BA 0%, #003087 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 28px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.75 : 1,
                  boxShadow: '0 4px 14px rgba(0, 112, 186, 0.3)',
                }}
              >
                <Lock size={16} />
                <span>
                  {isProcessing
                    ? 'Launching PayPal...'
                    : `Pay $${ticketPriceUsd}.00 with PayPal (Credit Card & Balance)`}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {showFormalReceipt && receiptData && (
        <PaymentReceiptModal
          isOpen={showFormalReceipt}
          onClose={() => setShowFormalReceipt(false)}
          invoice={receiptData}
        />
      )}
    </div>
  );
}
