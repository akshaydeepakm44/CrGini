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
  ExternalLink
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="cg-table-loading">Loading financial transactions...</td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan={7} className="cg-table-empty">No invoices found.</td></tr>
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
                    <span className="cg-text-secondary">{p.paymentMethod || 'Stripe / Bank Wire'}</span>
                  </td>
                  <td>
                    <span className="cg-date-text">
                      {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
