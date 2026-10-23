import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  ArrowRight,
  Receipt,
  AlertCircle,
  Printer,
  X,
  ExternalLink,
} from 'lucide-react';
import MetricCard from '../../../components/cards/MetricCard';
import StatusBadge from '../../../components/tickets/StatusBadge';
import { api } from '../../../services/api';
import PaymentCheckoutModal from '../../payment/PaymentCheckoutModal';

export default function BillingPage({
  requests = [],
  onReload,
}) {
  const [dbPayments, setDbPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState(null);
  const [payingTicketId, setPayingTicketId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch real payment ledger records from PostgreSQL backend
  const loadInvoices = async () => {
    try {
      setIsLoadingPayments(true);
      const res = await api.getMyPayments();
      setDbPayments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('[BillingPage] Failed to fetch db payments:', err.message);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Pending requests that require payment
  const pendingRequests = requests.filter(
    (r) => String(r.paymentStatus || r.payment_status).toUpperCase() === 'PENDING'
  );

  // Merge database payments with requests that were paid
  const paidRequests = requests.filter(
    (r) => String(r.paymentStatus || r.payment_status).toUpperCase() === 'PAID'
  );

  // Combined ledger entries: database payments prioritized
  const ledgerEntries = (() => {
    const list = [...dbPayments];
    const coveredTicketIds = new Set(dbPayments.map((p) => String(p.ticketId || p.requestId)));

    // If there are paid requests without a DB payment record, add them as ledger entries
    paidRequests.forEach((req) => {
      const tId = String(req.ticketId || req.id);
      if (!coveredTicketIds.has(tId)) {
        list.push({
          id: `req-${req.id}`,
          invoiceNumber: `INV-${new Date().getFullYear()}-${1000 + Number(req.id || 1)}`,
          ticketId: req.ticketId,
          requestTitle: req.title,
          serviceType: req.service,
          amount: Number(req.price) || 0,
          currency: 'USD',
          status: 'PAID',
          gateway: 'RAZORPAY',
          paymentMethod: 'Live Checkout',
          transactionId: `TXN-${req.ticketId}`,
          paidAt: req.createdDate || new Date().toISOString(),
          createdAt: req.createdDate,
          rawRequest: req,
        });
      }
    });

    return list.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
  })();

  const totalPaidAmount = ledgerEntries.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalPendingAmount = pendingRequests.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  const handlePayNow = (ticket) => {
    setSelectedTicketForPayment(ticket);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--cg-text-primary, #111827)',
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Billing & Invoices
        </h1>
        <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
          Review verified payment histories, settle pending sprint invoices, and download official transaction receipts.
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        <MetricCard
          value={`$${totalPendingAmount.toLocaleString()}`}
          label="Pending Payments"
          icon={Clock}
          variant="coral"
          trend={pendingRequests.length > 0 ? `${pendingRequests.length} invoice(s) due` : 'Zero balance'}
          trendDirection={pendingRequests.length > 0 ? 'down' : 'up'}
        />

        <MetricCard
          value={`$${totalPaidAmount.toLocaleString()}`}
          label="Total Settled"
          icon={CheckCircle2}
          variant="mint"
          trend={`${ledgerEntries.length} sprint(s) funded`}
          trendDirection="up"
        />

        <MetricCard
          value={ledgerEntries.length}
          label="Settled Invoices"
          icon={Receipt}
          variant="lavender"
          trend="Lifetime invoices"
          trendDirection="neutral"
        />
      </div>

      {/* Pending Payments Section (if any) */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>
            Pending Invoices ({pendingRequests.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: '16px',
                  border: '1px solid #FDE68A',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                      {req.ticketId}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                      {req.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                    {req.service} • Created {req.createdDate}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                      ${req.price || 499}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>
                      Payment Required
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingPayment && payingTicketId === (req.id || req.ticketId)}
                    onClick={() => handlePayNow(req)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    <CreditCard size={15} />
                    <span>
                      {isProcessingPayment && payingTicketId === (req.id || req.ticketId)
                        ? 'Processing...'
                        : 'Settle Payment'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Transaction History
            </h3>
            <span style={{ fontSize: '0.78125rem', color: '#6B7280' }}>
              All settled and completed service sprint transactions
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #EDE9FE' }}>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Invoice Number
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Ticket Reference
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Service Sprint
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Date Paid
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Gateway / Method
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Amount
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF' }}>
                    <Receipt size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#374151' }}>No transaction history found</div>
                    <div style={{ fontSize: '0.8125rem' }}>Paid sprint invoices will appear here automatically.</div>
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7C3AED', backgroundColor: '#EDE9FE', padding: '3px 8px', borderRadius: '6px' }}>
                        {p.invoiceNumber || `INV-${p.id}`}
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0284C7' }}>
                        {p.ticketId || `REQ-${p.requestId}`}
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                        {p.requestTitle || 'Intelligence Sprint'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {p.serviceType || 'Digitalising'}
                      </div>
                    </td>

                    <td style={{ padding: '16px 24px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </td>

                    <td style={{ padding: '16px 24px', fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={13} color="#6B7280" />
                        {p.gateway || 'Razorpay'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px', fontSize: '0.90625rem', fontWeight: 800, color: '#111827' }}>
                      ${p.amount || 1}.00
                    </td>

                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          backgroundColor: '#ECFDF5',
                          color: '#047857',
                        }}
                      >
                        PAID
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(p)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          fontSize: '0.78125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Receipt size={13} />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', backgroundColor: '#EDE9FE', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedInvoice.invoiceNumber || 'INV-OFFICIAL'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '9999px' }}>
                    SETTLED
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Sprint Invoice Receipt
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '4px 0 0' }}>
                  DiziGini Technologies Inc.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Line items */}
            <div style={{ borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', padding: '16px 0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Ticket Reference:</span>
                <span style={{ fontWeight: 700, color: '#0284C7' }}>{selectedInvoice.ticketId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Service Sprint:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedInvoice.requestTitle || selectedInvoice.serviceType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Payment Gateway:</span>
                <span style={{ color: '#111827', fontWeight: 600 }}>{selectedInvoice.gateway || 'Razorpay Live'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Transaction ID:</span>
                <span style={{ color: '#4B5563', fontFamily: 'monospace', fontSize: '0.78125rem' }}>{selectedInvoice.transactionId || 'pay_verified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Date Paid:</span>
                <span style={{ color: '#111827' }}>
                  {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString() : 'Recent'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E5E7EB' }}>
                <span>Total Settled:</span>
                <span style={{ color: '#7C3AED' }}>${selectedInvoice.amount || 1}.00 USD</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handlePrintReceipt}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.84375rem',
                  cursor: 'pointer',
                }}
              >
                <Printer size={15} />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84375rem',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Payment Modal (Razorpay & PayPal) */}
      {selectedTicketForPayment && (
        <PaymentCheckoutModal
          isOpen={Boolean(selectedTicketForPayment)}
          ticket={selectedTicketForPayment}
          onClose={() => setSelectedTicketForPayment(null)}
          onPaymentSuccess={() => {
            setSelectedTicketForPayment(null);
            loadInvoices();
            if (onReload) onReload();
          }}
        />
      )}
    </div>
  );
}
