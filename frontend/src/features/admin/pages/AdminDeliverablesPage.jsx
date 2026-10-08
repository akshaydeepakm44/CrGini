import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderCheck,
  Search,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminDeliverablesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'ALL';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadDeliverables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDeliverablesOverview();
      setDeliverables(data);
    } catch (err) {
      console.error('Error fetching deliverables:', err);
      setError(err.message || 'Failed to load deliverables from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliverables();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'ALL') next.delete('filter');
      else next.set('filter', tab);
      return next;
    });
  };

  const filteredDeliverables = deliverables.filter((d) => {
    // Status filter
    if (activeTab === 'pending_review' && d.status !== 'PENDING_REVIEW') return false;
    if (activeTab === 'changes_requested' && d.status !== 'CHANGES_REQUESTED') return false;
    if (activeTab === 'approved' && d.status !== 'APPROVED') return false;

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        d.ticketCode?.toLowerCase().includes(term) ||
        d.title?.toLowerCase().includes(term) ||
        d.requestTitle?.toLowerCase().includes(term) ||
        d.submittedByName?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Deliverables Lifecycle & Reviews</h1>
          <p className="cg-page-subtitle">
            Inspect all uploaded specialist blueprints, work packages, versions, and client review feedback
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadDeliverables}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="cg-tab-row">
        {[
          { key: 'ALL', label: 'All Deliverables' },
          { key: 'pending_review', label: 'Awaiting Client Review' },
          { key: 'changes_requested', label: 'Changes Requested' },
          { key: 'approved', label: 'Approved Packages' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`cg-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadDeliverables} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="cg-filter-bar">
        <div className="cg-filter-search">
          <Search size={15} className="cg-filter-icon" />
          <input
            type="text"
            className="cg-filter-input"
            placeholder="Search deliverable title, ticket code, or specialist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DELIVERABLES TABLE */}
      <div className="cg-table-wrapper">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th>TICKET</th>
              <th>PACKAGE & VERSION</th>
              <th>SERVICE</th>
              <th>SUBMITTED BY</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>EXTERNAL RESOURCE</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="cg-table-loading">Loading deliverables...</td></tr>
            ) : filteredDeliverables.length === 0 ? (
              <tr><td colSpan={8} className="cg-table-empty">No deliverables found.</td></tr>
            ) : (
              filteredDeliverables.map((d) => (
                <tr key={d.id}>
                  <td>
                    <button
                      className="cg-ticket-code-btn"
                      onClick={() => navigate(`/admin/requests/${d.requestId}`)}
                    >
                      {d.ticketCode}
                    </button>
                  </td>
                  <td>
                    <div className="cg-cell-user">
                      <span className="cg-client-name font-bold">
                        V{d.version}: {d.title}
                      </span>
                      <span className="cg-company-name">{d.requestTitle}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cg-service-tag">{d.serviceType}</span>
                  </td>
                  <td>
                    <span>{d.submittedByName || 'Specialist'}</span>
                  </td>
                  <td>
                    <span className="cg-date-text">
                      {new Date(d.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <span className={`cg-status-chip ${d.status?.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    {d.externalLink ? (
                      <a
                        href={d.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cg-link-btn"
                      >
                        <span>Blueprint URL</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-muted">None attached</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      className="cg-action-btn-primary"
                      onClick={() => navigate(`/admin/requests/${d.requestId}`)}
                    >
                      <span>Inspect</span>
                      <ArrowRight size={13} />
                    </button>
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
