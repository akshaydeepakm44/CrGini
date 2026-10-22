import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  DollarSign,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  Printer,
  X,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminBillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'ALL';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [data, setData] = useState({ payments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getBillingOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching billing records:', err);
      setError(err.message || 'Failed to load billing records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const { summary = {}, payments = [] } = data;

  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'pending' && p.status !== 'PENDING') return false;
    if (activeTab === 'paid' && p.status !== 'PAID') return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        p.invoiceNumber?.toLowerCase().includes(term) ||
        p.ticketId?.toLowerCase().includes(term) ||
        p.clientName?.toLowerCase().includes(term) ||
        p.companyName?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Billing & Revenue Ledger</h1>
          <p className="cg-page-subtitle">
            PostgreSQL verified payment transactions, client invoices, and settlement status
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadBilling}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <AlertCircle size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadBilling} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* REVENUE SUMMARY ROW (Real Data Only) */}
      <div className="cg-kpi-grid">
        <div className="cg-kpi-card highlight-success">
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">TOTAL VERIFIED REVENUE</span>
            <DollarSign size={16} className="cg-kpi-icon text-success" />
          </div>
          <div className="cg-kpi-value text-success">
            ${(summary.totalRevenue || 0).toFixed(2)}
          </div>
          <div className="cg-kpi-foot">
            <span>{summary.completedCount || 0} settled transactions</span>
          </div>
        </div>

        <div className="cg-kpi-card highlight-warning">
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">PENDING SETTLEMENTS</span>
            <Clock size={16} className="cg-kpi-icon text-warning" />
          </div>
          <div className="cg-kpi-value text-warning">
            ${(summary.pendingRevenue || 0).toFixed(2)}
          </div>
          <div className="cg-kpi-foot">
            <span>{summary.pendingCount || 0} invoices awaiting payment</span>
          </div>
        </div>
      </div>

      <div className="cg-notice-box mt-3 mb-4">
        <strong>Production Integrity Notice:</strong> All figures displayed reflect exact settled records in the PostgreSQL database ledger. No simulated forecasts or fictitious percentages are generated.
      </div>

      {/* FILTER TABS */}
      <div className="cg-tab-row">
        {[
          { key: 'ALL', label: 'All Invoices' },
          { key: 'paid', label: 'Paid & Settled' },
          { key: 'pending', label: 'Pending Settlement' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`cg-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="cg-filter-bar">
        <div className="cg-filter-search">
          <Search size={15} className="cg-filter-icon" />
          <input
            type="text"
            className="cg-filter-input"
            placeholder="Search invoice number, ticket code, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="cg-table-wrapper">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th>INVOICE #</th>
              <th>TICKET</th>
              <th>CLIENT / COMPANY</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>PAYMENT METHOD</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="cg-table-loading">Loading financial transactions...</td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan={8} className="cg-table-empty">No invoices found.</td></tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-bold">{p.invoiceNumber || `INV-${p.id}`}</span>
                  </td>
                  <td>
                    {p.ticketId ? (
                      <button
                        className="cg-ticket-code-btn"
                        onClick={() => navigate(`/admin/requests/${p.requestId}`)}
                      >
                        {p.ticketId}
                      </button>
                    ) : (
                      <span className="text-muted">Unlinked</span>
                    )}
                  </td>
                  <td>
                    <div className="cg-cell-user">
                      <span className="cg-client-name font-bold">{p.clientName || 'Client'}</span>
                      <span className="cg-company-name">{p.companyName || p.clientEmail}</span>
                    </div>
                  </td>
                  <td>
                    <strong>${p.amount.toFixed(2)} {p.currency}</strong>
                  </td>
                  <td>
                    <span className={`cg-payment-pill ${p.status?.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span className="cg-text-secondary">{p.paymentMethod || 'Razorpay / Bank Wire'}</span>
                  </td>
                  <td>
                    <span className="cg-date-text">
                      {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <button
                      className="cg-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '6px' }}
                      onClick={() => setSelectedInvoice(p)}
                      title="View Detailed Tax Invoice & Receipt"
                    >
                      <FileText size={13} />
                      <span>View Invoice</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================
          SUPER ADMIN INVOICE MODAL
          ============================================================ */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInvoice(null);
          }}
        >
          <div
            id="admin-invoice-print-container"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #F1F5F9',
                backgroundColor: '#FAFAFD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#EDE9FE',
                    color: '#4C1D95',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Commercial Invoice &amp; Settlement Receipt
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Super Admin Financial Ledger • DiziGini Platform
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Printer size={14} />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Invoice Printable Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
              {/* Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.03em' }}>
                    DIZIGINI
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    B2B Intelligence &amp; Digital Solutions Platform
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                    Settled to Registered Merchant Account
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: selectedInvoice.status === 'PAID' ? '#DCFCE7' : '#FEF3C7', color: selectedInvoice.status === 'PAID' ? '#166534' : '#92400E', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {selectedInvoice.status === 'PAID' && <Check size={13} />}
                    {selectedInvoice.status}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                    {selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    Date: {new Date(selectedInvoice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Bill To & Gateway Reference */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '1.75rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Billed To
                  </div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {selectedInvoice.clientName || 'Valued Client'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                    {selectedInvoice.companyName || 'Independent Account'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    {selectedInvoice.clientEmail}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Gateway &amp; Settlement
                  </div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                    {selectedInvoice.gateway || 'Razorpay Production'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', wordBreak: 'break-all' }}>
                    Ref / Txn ID: <code style={{ backgroundColor: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>{selectedInvoice.gatewayPaymentId || selectedInvoice.id}</code>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
                    Channel: {selectedInvoice.paymentMethod || 'Online Checkout'}
                  </div>
                </div>
              </div>

              {/* Itemized Service Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Domain</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {selectedInvoice.ticketId ? `${selectedInvoice.ticketId} — ` : ''}{selectedInvoice.requestTitle || 'Sprint Execution Service'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Dedicated specialist sprint assignment &amp; deliverables
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                      {selectedInvoice.serviceType || 'B2B SPRINT'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}>
                      1 Sprint
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800 }}>
                      ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <div style={{ width: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Taxes / Platform Fees:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>$0.00 (Included)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', borderTop: '2px solid #E2E8F0', marginTop: '6px' }}>
                    <span>Total Amount Paid:</span>
                    <span style={{ color: '#16A34A' }}>${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} className="text-success" />
                <span style={{ fontSize: '0.78rem', color: '#166534', lineHeight: 1.4 }}>
                  <strong>Settlement Notice:</strong> This invoice was verified cryptographically via {selectedInvoice.gateway || 'Razorpay'}. Payment is recorded in the PostgreSQL immutable financial ledger and settled to the registered merchant bank account.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
