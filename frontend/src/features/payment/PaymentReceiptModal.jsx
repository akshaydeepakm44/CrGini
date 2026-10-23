import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

/**
 * PaymentReceiptModal
 * Matches the official TAX INVOICE format (DATAI2i Pvt. Ltd. / DiziGini)
 * Displays authentic DiziGini transaction details in the corporate Tax Invoice layout.
 */
export default function PaymentReceiptModal({
  isOpen,
  onClose,
  invoice,
}) {
  if (!isOpen || !invoice) return null;

  // Clean Invoice Number matching "Di2i-2627-DZ-xxx" format or existing DB invoice number
  const rawId = invoice.invoiceNumber || invoice.id || invoice.ticketId || '1001';
  let invoiceNumber = '';
  if (invoice.invoiceNumber && !String(invoice.invoiceNumber).includes('undefined')) {
    invoiceNumber = String(invoice.invoiceNumber);
  } else {
    const cleanNum = String(rawId).replace(/[^0-9]/g, '') || '1001';
    invoiceNumber = `Di2i-2627-DZ-${cleanNum.padStart(3, '0')}`;
  }

  // Authentic Transaction / UTR ID (e.g. pay_... from Razorpay or capture id from PayPal)
  const rawTxn = invoice.transactionId || invoice.gatewayPaymentId || invoice.gateway_payment_id || '';
  const isSyntheticTxn = String(rawTxn).startsWith('TXN-');
  const utrNumber = invoice.utrNumber || 
                    invoice.metadata?.utrNumber || 
                    invoice.metadata?.bankRrn || 
                    invoice.metadata?.rrn || 
                    invoice.metadata?.bank_transaction_id || 
                    invoice.metadata?.acquirer_data?.rrn || 
                    invoice.metadata?.acquirer_data?.upi_transaction_id || 
                    (!isSyntheticTxn && rawTxn ? rawTxn : null);
  const transactionId = utrNumber || rawTxn || (invoice.ticketId ? `TXN-${invoice.ticketId}` : (invoice.id ? `TXN-DZ-${invoice.id}` : 'Verified Payment'));

  // Payment method
  const gateway = (invoice.gateway || (String(transactionId).startsWith('pay_') ? 'RAZORPAY' : (String(transactionId).startsWith('PAYID') ? 'PAYPAL' : 'RAZORPAY'))).toUpperCase();
  const paymentVia = gateway === 'PAYPAL' ? 'PayPal' : 'Razorpay';

  // Client Details (dynamic from invoice payload or active user session)
  const clientName = invoice.userName || 
                     invoice.clientName || 
                     invoice.contactName || 
                     invoice.rawRequest?.user?.name || 
                     invoice.companyName || 
                     invoice.clientCompany || 
                     (typeof window !== 'undefined' ? localStorage.getItem('cg_user_name') : null) || 
                     'DiziGini Client';
  const clientEmail = invoice.userEmail || 
                      invoice.email || 
                      invoice.rawRequest?.user?.email || 
                      (typeof window !== 'undefined' ? localStorage.getItem('cg_user_email') : null) || 
                      'billing@dizigini.com';
  const clientCompany = invoice.companyName || invoice.clientCompany || invoice.rawRequest?.company?.name || '';

  // Service Description (Authentic DiziGini Sprint Services)
  const serviceTitle = invoice.requestTitle || invoice.serviceTitle || invoice.serviceType || invoice.rawRequest?.title || 'Intelligence Sprint Execution';
  const ticketRef = invoice.ticketId || invoice.rawRequest?.ticketId || (invoice.id ? `CG-${invoice.id}` : null);
  const descriptionText = serviceTitle.toLowerCase().startsWith('dizigini')
    ? serviceTitle
    : `DiziGini Sprint Execution — ${serviceTitle}`;

  // Amount and Tax calculation
  // Check if this payment was settled in INR or USD
  const isUSD = (invoice.currency === 'USD' && gateway === 'PAYPAL') || (invoice.currency === 'USD' && !invoice.baseAmountInr && !invoice.totalAmountInr && gateway !== 'RAZORPAY');
  const currencySymbol = isUSD ? '$' : '₹';

  let taxableAmount = 190.00;
  let gstAmount = 34.00;
  let totalPaid = 224.00;

  if (invoice.baseAmountInr && invoice.totalAmountInr) {
    taxableAmount = Number(invoice.baseAmountInr);
    gstAmount = Number(invoice.gstAmountInr || (invoice.totalAmountInr - taxableAmount).toFixed(2));
    totalPaid = Number(invoice.totalAmountInr);
  } else if (invoice.metadata?.baseAmountInr && invoice.metadata?.totalAmountInr) {
    taxableAmount = Number(invoice.metadata.baseAmountInr);
    gstAmount = Number(invoice.metadata.gstAmountInr || (invoice.metadata.totalAmountInr - taxableAmount).toFixed(2));
    totalPaid = Number(invoice.metadata.totalAmountInr);
  } else if (invoice.baseAmountInr) {
    taxableAmount = Number(invoice.baseAmountInr);
    gstAmount = Number(invoice.gstAmountInr || (taxableAmount * 0.18).toFixed(2));
    totalPaid = Number(invoice.totalAmountInr || (taxableAmount + gstAmount).toFixed(2));
  } else if (invoice.totalAmountInr) {
    totalPaid = Number(invoice.totalAmountInr);
    taxableAmount = Number((totalPaid / 1.18).toFixed(2));
    gstAmount = Number((totalPaid - taxableAmount).toFixed(2));
  } else if (invoice.price || invoice.amount || invoice.amountUsd) {
    const rawVal = Number(invoice.price || invoice.amount || invoice.amountUsd);
    if (!isUSD) {
      if (invoice.currency === 'INR' && rawVal >= 50) {
        totalPaid = rawVal;
        if (Math.round(totalPaid) === 112) {
          taxableAmount = 95.00;
          gstAmount = 17.00;
        } else if (Math.round(totalPaid) === 224) {
          taxableAmount = 190.00;
          gstAmount = 34.00;
        } else if (Math.round(totalPaid) === 11198) {
          taxableAmount = 9490.00;
          gstAmount = 1708.00;
        } else {
          taxableAmount = Math.round(totalPaid / 1.18);
          gstAmount = Number((totalPaid - taxableAmount).toFixed(2));
        }
      } else {
        taxableAmount = Math.round(rawVal * 94.90);
        gstAmount = Math.round(taxableAmount * 0.18);
        totalPaid = taxableAmount + gstAmount;
      }
    } else {
      totalPaid = rawVal;
      taxableAmount = Number((totalPaid / 1.18).toFixed(2));
      gstAmount = Number((totalPaid - taxableAmount).toFixed(2));
    }
  }

  // Formatted date (e.g. "23 October 2026")
  const invoiceDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #dizigini-tax-invoice, #dizigini-tax-invoice * {
            visibility: visible;
          }
          #dizigini-tax-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .dizigini-invoice-actions {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="dizigini-tax-invoice"
        style={{
          width: '100%',
          maxWidth: '840px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          color: '#1E293B',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="dizigini-invoice-actions"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        >
          <X size={18} />
        </button>

        {/* ============================================================
            1. TAX INVOICE BLUE HEADER BANNER (EXACT IMAGE 2 REPLICA)
            ============================================================ */}
        <div
          style={{
            backgroundColor: '#1B3673',
            color: '#FFFFFF',
            padding: '28px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {/* Left Header: TAX INVOICE & GSTIN */}
          <div>
            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                margin: 0,
                lineHeight: 1.1,
                color: '#FFFFFF',
              }}
            >
              TAX INVOICE
            </h1>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#E0E7FF',
                marginTop: '8px',
              }}
            >
              DiziGini • Powered by DATAI2i
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#CBD5E1',
                marginTop: '3px',
              }}
            >
              GSTIN: 37AAHCD5140J1ZL
            </div>
          </div>

          {/* Right Header: Invoice Metadata */}
          <div
            style={{
              textAlign: 'right',
              fontSize: '0.9rem',
              lineHeight: '1.7',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '8px 24px', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: '#E0E7FF', textAlign: 'right' }}>Invoice No:</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{invoiceNumber}</span>

              <span style={{ fontWeight: 600, color: '#E0E7FF', textAlign: 'right' }}>Date:</span>
              <span style={{ fontWeight: 500, color: '#FFFFFF' }}>{invoiceDate}</span>

              <span style={{ fontWeight: 600, color: '#E0E7FF', textAlign: 'right' }}>Payment Via:</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{paymentVia}</span>

              <span style={{ fontWeight: 600, color: '#E0E7FF', textAlign: 'right' }}>Transaction ID:</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {transactionId}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            2. BILLED TO & BILLED BY COLUMNS
            ============================================================ */}
        <div
          style={{
            padding: '32px 36px 24px 36px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
          }}
        >
          {/* BILLED TO */}
          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#1B3673',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              BILLED TO
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '4px',
              }}
            >
              {clientName}
            </div>
            {clientCompany && (
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                {clientCompany}
              </div>
            )}
            <div style={{ fontSize: '0.92rem', color: '#475569' }}>
              {clientEmail}
            </div>
          </div>

          {/* BILLED BY */}
          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#1B3673',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              BILLED BY
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '4px',
              }}
            >
              DATAI2i Pvt. Ltd.
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
              1st Floor, A-Hub, Andhra University Incubation Centre,<br />
              College of Engineering, North Campus, Andhra University,<br />
              Visakhapatnam, Andhra Pradesh – 530003<br />
              <span style={{ fontWeight: 600, color: '#334155' }}>GSTIN: 37AAHCD5140J1ZL</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. PRODUCT LINE ITEMS TABLE (SOLID BLUE HEADER)
            ============================================================ */}
        <div style={{ padding: '0 36px 20px 36px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              marginTop: '8px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#1B3673', color: '#FFFFFF' }}>
                <th style={{ padding: '10px 16px', fontSize: '0.8125rem', fontWeight: 800, width: '40px' }}>
                  #
                </th>
                <th style={{ padding: '10px 16px', fontSize: '0.8125rem', fontWeight: 800 }}>
                  Description
                </th>
                <th style={{ padding: '10px 16px', fontSize: '0.8125rem', fontWeight: 800, width: '100px' }}>
                  SAC
                </th>
                <th style={{ padding: '10px 16px', fontSize: '0.8125rem', fontWeight: 800, textAlign: 'right', width: '130px' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                <td style={{ padding: '16px 16px', fontSize: '0.9rem', color: '#334155', fontWeight: 600, verticalAlign: 'top' }}>
                  1
                </td>
                <td style={{ padding: '16px 16px', fontSize: '0.9rem', color: '#0F172A', fontWeight: 600, verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    {descriptionText}
                  </div>
                  {ticketRef && (
                    <div style={{ fontSize: '0.78125rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
                      Ticket Ref: {ticketRef} • Verified Decision-Maker Intelligence Sprint
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 16px', fontSize: '0.9rem', color: '#334155', verticalAlign: 'top' }}>
                  9983
                </td>
                <td style={{ padding: '16px 16px', fontSize: '0.9rem', color: '#0F172A', fontWeight: 700, textAlign: 'right', verticalAlign: 'top' }}>
                  {currencySymbol}{taxableAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ============================================================
            4. TOTALS BLOCK (RIGHT ALIGNED, EXACT REPLICA OF IMAGE 2)
            ============================================================ */}
        <div style={{ padding: '0 36px 24px 36px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: '#475569' }}>
              <span>Taxable Amount:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{taxableAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem', color: '#475569' }}>
              <span>IGST (18%):</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{gstAmount.toFixed(2)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                marginTop: '6px',
                borderTop: '2px solid #E2E8F0',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#1B3673',
              }}
            >
              <span>Total Paid:</span>
              <span>{currencySymbol}{totalPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            5. FOOTER NOTE & PRINT ACTION BUTTONS
            ============================================================ */}
        <div
          style={{
            padding: '16px 36px 28px 36px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>
            * All prices are inclusive of GST. Tax is calculated on the base amount.
          </div>

          <div className="dizigini-invoice-actions" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#1B3673',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(27, 54, 115, 0.25)',
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
