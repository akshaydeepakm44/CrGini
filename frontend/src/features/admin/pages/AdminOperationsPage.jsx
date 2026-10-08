import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import ReassignModal from '../components/ReassignModal';

export default function AdminOperationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParam = searchParams.get('filter') || 'ALL';
  const serviceParam = searchParams.get('service') || 'ALL';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState(serviceParam);
  const [specialistFilter, setSpecialistFilter] = useState('ALL');

  const [requests, setRequests] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [reassigningTicket, setReassigningTicket] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [opsRes, teamRes] = await Promise.all([
        adminApi.getOperations({
          filter: activeTab !== 'ALL' ? activeTab : undefined,
          service: serviceFilter !== 'ALL' ? serviceFilter : undefined,
          specialistId: specialistFilter !== 'ALL' ? specialistFilter : undefined,
          search: search.trim() || undefined,
        }),
        adminApi.getTeamOverview().catch(() => [])
      ]);

      setRequests(opsRes.requests || []);
      setSpecialists(teamRes || []);
    } catch (err) {
      console.error('Error loading operations queue:', err);
      setError(err.message || 'Failed to load requests from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, serviceFilter, specialistFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'ALL') next.delete('filter');
      else next.set('filter', tab);
      return next;
    });
  };

  const handleReassignSubmit = async (payload) => {
    if (!reassigningTicket) return;
    try {
      setIsReassigning(true);
      await adminApi.reassignRequest(reassigningTicket.id, payload);
      setReassigningTicket(null);
      await loadData();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Operations Request Queue</h1>
          <p className="cg-page-subtitle">
            Central operational queue for all client requests, lifecycle assignments, and delivery tracking
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadData} title="Refresh Queue">
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="cg-tab-row">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'unassigned', label: 'Unassigned' },
          { key: 'new', label: 'New' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'client_review', label: 'Client Review' },
          { key: 'changes_requested', label: 'Changes Requested' },
          { key: 'completed', label: 'Completed' },
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
          <button className="cg-btn-secondary" onClick={loadData} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="cg-filter-bar">
        <form onSubmit={handleSearchSubmit} className="cg-filter-search">
          <Search size={15} className="cg-filter-icon" />
          <input
            type="text"
            className="cg-filter-input"
            placeholder="Search ticket code, title, client or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="cg-filter-select-group">
          <select
            className="cg-filter-select"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="ALL">All Services</option>
            <option value="COMPANY_LEAD">Digitalising (Company Lead)</option>
            <option value="COMPANY_BOOST">Boosting (Company Boost)</option>
            <option value="LANDING_PAGE">Landing Page & UI/UX</option>
          </select>

          <select
            className="cg-filter-select"
            value={specialistFilter}
            onChange={(e) => setSpecialistFilter(e.target.value)}
          >
            <option value="ALL">All Specialists</option>
            {specialists.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name} ({sp.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REQUESTS TABLE */}
      <div className="cg-table-wrapper">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th>TICKET</th>
              <th>CLIENT / COMPANY</th>
              <th>SERVICE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>SPECIALIST / TEAM</th>
              <th>PRICE</th>
              <th>DATE</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="cg-table-loading">
                  Loading operational tickets...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={9} className="cg-table-empty">
                  No requests matching selected filters.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="cg-ticket-code-btn"
                      onClick={() => navigate(`/admin/requests/${r.id}`)}
                    >
                      {r.ticketId}
                    </button>
                  </td>
                  <td>
                    <div className="cg-cell-user">
                      <span className="cg-client-name">{r.client?.name || 'Client'}</span>
                      <span className="cg-company-name">{r.company?.name || r.client?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cg-service-tag">{r.serviceType}</span>
                  </td>
                  <td>
                    <span className={`cg-priority-badge ${r.priority?.toLowerCase()}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`cg-status-chip ${r.status?.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.specialist ? (
                      <div className="cg-specialist-cell">
                        <span className="cg-spec-name">{r.specialist.name}</span>
                        <span className="cg-spec-team">{r.assignedTeam || 'Team'}</span>
                      </div>
                    ) : (
                      <span className="cg-unassigned-tag">Unassigned Pool</span>
                    )}
                  </td>
                  <td>
                    <div className="cg-price-cell">
                      <span>${r.price.toFixed(2)}</span>
                      <span className={`cg-payment-pill ${r.paymentStatus?.toLowerCase()}`}>
                        {r.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="cg-date-text">
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="cg-row-actions">
                      <button
                        className="cg-action-btn"
                        onClick={() => setReassigningTicket(r)}
                        title="Assign or reassign specialist"
                      >
                        <UserCheck size={14} />
                        <span>Assign</span>
                      </button>
                      <button
                        className="cg-action-btn-primary"
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        title="Open 360-degree request detail"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REASSIGN MODAL */}
      <ReassignModal
        isOpen={Boolean(reassigningTicket)}
        ticket={reassigningTicket}
        specialists={specialists}
        onClose={() => setReassigningTicket(null)}
        onReassign={handleReassignSubmit}
        isSubmitting={isReassigning}
      />
    </div>
  );
}
