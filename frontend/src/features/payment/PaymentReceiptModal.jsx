import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building,
  Mail,
} from 'lucide-react';

/**
 * PaymentReceiptModal
 * High-fidelity print-ready invoice & payment receipt matching Jobber/enterprise billing specifications
 */
export default function PaymentReceiptModal({
  isOpen,
  onClose,
  invoice,
}) {
  if (!isOpen || !invoice) return null;

  const invoiceNumber = invoice.invoiceNumber || `INV-${invoice.id || '2026-1001'}`;
  const transactionId = invoice.transactionId || invoice.gatewayPaymentId || 'pay_verified';
  const paymentMethod = invoice.paymentMethod || (invoice.gateway === 'PAYPAL' ? 'PayPal Checkout (Global Card / Balance)' : 'Razorpay (Credit / Debit Card, UPI, NetBanking)');
  const clientName = invoice.userName || invoice.clientName || invoice.contactName || invoice.rawRequest?.user?.name || 'Authorized Client';
  const companyName = invoice.companyName || invoice.clientCompany || invoice.rawRequest?.company?.name || 'Partner Account';
  const clientEmail = invoice.userEmail || invoice.email || invoice.rawRequest?.user?.email || 'client@company.com';
  const serviceTitle = invoice.requestTitle || invoice.serviceTitle || invoice.serviceType || invoice.rawRequest?.title || 'Digitalising Sprint Service';
  const ticketRef = invoice.ticketId || invoice.rawRequest?.ticketId || (invoice.requestId ? `CG-${invoice.requestId}` : 'CG-SPRINT');

  const rawAmount = Number(invoice.amountUsd || invoice.price || invoice.amount || 1);
  const totalAmountUsd = isNaN(rawAmount) || rawAmount <= 0 ? 1 : rawAmount;
  
  // Tax breakdown (18% GST standard on platform)
  const gstRate = 18;
  const subtotalUsd = Number((totalAmountUsd / (1 + gstRate / 100)).toFixed(2));
  const taxAmountUsd = Number((totalAmountUsd - subtotalUsd).toFixed(2));

  // Dynamic line items calculation
  const reqs = invoice.requirements || invoice.rawRequest?.requirements || {};
  let lineItems = [];

  if (Array.isArray(invoice.items) && invoice.items.length > 0) {
    lineItems = invoice.items;
  } else if (Array.isArray(invoice.breakdown) && invoice.breakdown.length > 0) {
    lineItems = invoice.breakdown.map((b, idx) => ({
      name: b.item || `Scope Item #${idx + 1}`,
      description: b.description || 'Enterprise sprint deliverable module',
      qty: 1,
      cost: Number(b.amount || 0),
      total: Number(b.amount || 0)
    }));
  } else if (reqs.leadsCount && Number(reqs.leadsCount) > 0) {
    const qty = Number(reqs.leadsCount);
    const unitCost = Number(reqs.unitPrice || 2);
    lineItems = [
      {
        name: 'Hand-Verified Lead Research (0% Bounce Guarantee)',
        description: `Prospect intelligence tailored to ICP: ${reqs.targetMarket || 'Target Accounts'}. Direct emails, phones & title telemetry.`,
        qty,
        cost: unitCost,
        total: qty * unitCost
      }
    ];
  } else if (reqs.targetCompany) {
    lineItems = [
      {
        name: `Company Study Dossier: ${reqs.targetCompany}`,
        description: `Full organizational hierarchy, tech stack telemetry, and target account intelligence (${reqs.companyDomain || 'Verified domain'}).`,
        qty: 1,
        cost: totalAmountUsd,
        total: totalAmountUsd
      }
    ];
  } else if (reqs.targetOrganizations) {
    lineItems = [
      {
        name: `Key People Research: ${reqs.targetOrganizations}`,
        description: `Buying committee mapping, direct work emails, and phone telemetry for decision-makers.`,
        qty: 1,
        cost: totalAmountUsd,
        total: totalAmountUsd
      }
    ];
  } else {
    lineItems = [
      {
        name: serviceTitle,
        description: 'Verified enterprise intelligence deliverable package with 0% bounce telemetry, specialist audit, and executive research.',
        qty: 1,
        cost: totalAmountUsd,
        total: totalAmountUsd
      }
    ];
  }

  const formattedDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
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
          #dizigini-printable-receipt, #dizigini-printable-receipt * {
            visibility: visible;
          }
          #dizigini-printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          .dizigini-receipt-actions {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="dizigini-printable-receipt"
        style={{
          width: '100%',
          maxWidth: '780px',
          backgroundColor: '#EDEDED',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #D1D5DB',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: '#1F2937',
          padding: '36px 42px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          className="dizigini-receipt-actions"
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4B5563',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          <X size={18} />
        </button>

        {/* ============================================================
            1. TOP HEADER: LOGO & PROVIDER (LEFT) vs GREEN RECEIPT BADGE (RIGHT)
            ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          {/* Provider Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#0369A1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 10px rgba(3, 105, 161, 0.3)',
                }}
              >
                D
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E3A8A', margin: 0, letterSpacing: '-0.02em' }}>
                DiziGini Technologies
              </h1>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5 }}>
              DLF Cyber City, Tower B, Phase II, Gurugram, HR 122002<br />
              (0124) 456-7890 • support@dizigini.com • www.dizigini.com
            </div>
          </div>

          {/* Green Receipt Banner matching image */}
          <div
            style={{
              backgroundColor: '#65A30D',
              borderRadius: '8px',
              padding: '12px 20px',
              color: '#FFFFFF',
              minWidth: '220px',
              boxShadow: '0 4px 12px rgba(101, 163, 13, 0.25)',
            }}
          >
            <div style={{ fontSize: '1.1875rem', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>
              Receipt for #{invoiceNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ECFCCB', fontWeight: 500 }}>
              Transaction Date: {formattedDate}
            </div>
          </div>
        </div>

        {/* ============================================================
            2. RECIPIENT / BILLED TO
            ============================================================ */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', marginBottom: '4px' }}>
            RECIPIENT:
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
            {clientName}
          </div>
          <div style={{ fontSize: '0.84375rem', color: '#374151', fontWeight: 600 }}>
            {companyName}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
            {clientEmail} • Ticket Reference: <strong style={{ color: '#0369A1' }}>{ticketRef}</strong>
          </div>
        </div>

        {/* ============================================================
            3. PRODUCT / SERVICE TABLE WITH OLIVE/GREEN BANNER
            ============================================================ */}
        <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '28px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#65A30D', color: '#FFFFFF' }}>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PRODUCT / SERVICE
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  DESCRIPTION
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>
                  QTY.
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>
                  COST
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                  <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                      {item.name || serviceTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      Sprint Ref: {ticketRef}
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px', fontSize: '0.8125rem', color: '#4B5563', verticalAlign: 'top', lineHeight: 1.5 }}>
                    {item.description || 'Verified enterprise intelligence deliverable package with 0% bounce telemetry, specialist audit, and executive research.'}
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', verticalAlign: 'top' }}>
                    {item.qty ?? 1}
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, verticalAlign: 'top' }}>
                    ${Number(item.cost || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 800, fontSize: '0.90625rem', color: '#111827', verticalAlign: 'top' }}>
                    ${Number(item.total || totalAmountUsd).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================
            4. PAYMENT SUMMARY & PAYMENT METHOD CHOSEN
            ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
          {/* Left: Gratitude & Payment Method Info */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
              Thanks for your business!
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#047857' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Payment Status: PAID IN FULL</span>
              </div>
              <div style={{ fontSize: '0.78125rem', color: '#374151' }}>
                <strong>Payment Method:</strong> {paymentMethod}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                <strong>Transaction ID:</strong> {transactionId}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.71875rem', color: '#059669', fontWeight: 600 }}>
                <ShieldCheck size={13} />
                <span>256-Bit SSL Cryptographically Verified</span>
              </div>
            </div>
          </div>

          {/* Right: Receipt for Payment Totals */}
          <div style={{ minWidth: '260px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
              Receipt for Payment
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D1D5DB', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84375rem', color: '#4B5563', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>${subtotalUsd.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84375rem', color: '#4B5563', marginBottom: '10px' }}>
                <span>Tax (GST {gstRate}%):</span>
                <span style={{ fontWeight: 600 }}>${taxAmountUsd.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.0625rem',
                  fontWeight: 800,
                  color: '#111827',
                  paddingTop: '10px',
                  borderTop: '2px solid #E5E7EB',
                }}
              >
                <span>Total:</span>
                <span style={{ color: '#65A30D' }}>${totalAmountUsd.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            5. FOOTER: POWERED BY & ACTION BUTTONS
            ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '16px', borderTop: '1px solid #D1D5DB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: '#0369A1', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>
              D
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563', letterSpacing: '0.04em' }}>
              POWERED BY DIZIGINI
            </span>
          </div>

          <div className="dizigini-receipt-actions" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #9CA3AF',
                color: '#111827',
                fontSize: '0.84375rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                backgroundColor: '#65A30D',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.84375rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(101, 163, 13, 0.3)',
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
