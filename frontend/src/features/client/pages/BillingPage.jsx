import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  ArrowRight,
  Receipt,
  AlertCircle
} from 'lucide-react';
import MetricCard from '../../../components/cards/MetricCard';
import StatusBadge from '../../../components/tickets/StatusBadge';
import { api } from '../../../services/api';

export default function BillingPage({
  requests = [],
  onReload,
}) {
  const [payingTicketId, setPayingTicketId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Group tickets into paid and pending
  const pendingRequests = requests.filter((r) => r.paymentStatus === 'PENDING');
  const paidRequests = requests.filter((r) => r.paymentStatus === 'PAID');

  const totalPaidAmount = paidRequests.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
  const totalPendingAmount = pendingRequests.reduce((acc, r) => acc + (Number(r.price) || 0), 0);

  const handlePayNow = async (ticket) => {
    setPayingTicketId(ticket.id || ticket.ticketId);
    setIsProcessingPayment(true);
    try {
      await api.payRequest(ticket.id || ticket.ticketId, 'Corporate Card (Stripe)');
      alert(`Payment for ${ticket.ticketId} completed successfully!`);
      if (onReload) onReload();
    } catch (err) {
      alert(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessingPayment(false);
      setPayingTicketId(null);
    }
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
          Review payment histories, settle sprint invoices, and download transaction receipts.
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
          trend={`${paidRequests.length} sprint(s) funded`}
          trendDirection="up"
        />

        <MetricCard
          value={requests.length}
          label="Total Invoices"
          icon={Receipt}
          variant="lavender"
          trend="Lifetime sprints"
          trendDirection="neutral"
        />
      </div>

      {/* Pending Payments Section (if any) */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>
            Pending Invoices
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
                  Invoice / Ticket
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Service Sprint
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Amount
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#9CA3AF' }}>
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7C3AED', backgroundColor: '#EDE9FE', padding: '3px 8px', borderRadius: '6px' }}>
                        {req.ticketId}
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                        {req.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {req.service}
                      </div>
                    </td>

                    <td style={{ padding: '16px 24px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      {req.createdDate}
                    </td>

                    <td style={{ padding: '16px 24px', fontSize: '0.90625rem', fontWeight: 800, color: '#111827' }}>
                      ${req.price || 499}
                    </td>

                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          backgroundColor: req.paymentStatus === 'PAID' ? '#ECFDF5' : '#FEF3C7',
                          color: req.paymentStatus === 'PAID' ? '#047857' : '#B45309',
                        }}
                      >
                        {req.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(req)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          color: '#374151',
                          fontSize: '0.78125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
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
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              padding: '28px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Sprint Receipt
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '4px 0 0' }}>
                CreativeGini Technologies Inc.
              </p>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', padding: '16px 0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Ticket Reference:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{selectedInvoice.ticketId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Service:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedInvoice.service}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem' }}>
                <span style={{ color: '#6B7280' }}>Transaction Date:</span>
                <span style={{ color: '#111827' }}>{selectedInvoice.createdDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: 800, marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E5E7EB' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#7C3AED' }}>${selectedInvoice.price || 499}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
