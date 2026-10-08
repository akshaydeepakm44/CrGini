import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { api } from '../../../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminClientsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('onboarding') ? 'onboarding' : 'companies'
  );

  useEffect(() => {
    if (location.pathname.includes('onboarding')) {
      setActiveTab('onboarding');
    }
  }, [location.pathname]);
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status toggle confirmation modal
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [magicLinkCopied, setMagicLinkCopied] = useState(null);
  const [generatingLinkFor, setGeneratingLinkFor] = useState(null);

  const handleCopyMagicLink = async (email) => {
    try {
      setGeneratingLinkFor(email);
      const res = await api.post('/auth/magic-link', { email });
      if (res?.magicLink) {
        await navigator.clipboard.writeText(res.magicLink);
        setMagicLinkCopied(email);
        setTimeout(() => setMagicLinkCopied(null), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to generate magic link');
    } finally {
      setGeneratingLinkFor(null);
    }
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getClientsOverview();
      setCompanies(res.companies || []);
      setClientUsers(res.clientUsers || []);
    } catch (err) {
      console.error('Error fetching clients overview:', err);
      setError(err.message || 'Failed to load clients overview from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleToggleStatus = (u) => {
    setSelectedUserForStatus(u);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedUserForStatus) return;
    const newStatus = selectedUserForStatus.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      setIsUpdatingStatus(true);
      await adminApi.updateUserStatus(selectedUserForStatus.id, newStatus);
      setSelectedUserForStatus(null);
      await loadClients();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.contactPerson?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.industry?.toLowerCase().includes(term)
    );
  });

  const filteredUsers = clientUsers.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.company?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Client & Company Management</h1>
          <p className="cg-page-subtitle">
            Client enterprises, authorized user accounts, and tenant governance
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadClients}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="cg-tab-row">
        <button
          className={`cg-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          <Building2 size={15} />
          <span>Companies ({companies.length})</span>
        </button>
        <button
          className={`cg-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>Client Users ({clientUsers.length})</span>
        </button>
        <button
          className={`cg-tab-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          <UserPlus size={15} />
          <span>Client Onboarding</span>
        </button>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadClients} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* SEARCH BAR (For Companies / Users) */}
      {activeTab !== 'onboarding' && (
        <div className="cg-filter-bar">
          <div className="cg-filter-search">
            <Search size={15} className="cg-filter-icon" />
            <input
              type="text"
              className="cg-filter-input"
              placeholder={activeTab === 'companies' ? 'Filter companies by name, contact or email...' : 'Filter users by name, email or company...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* TAB 1: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="cg-table-wrapper">
          <table className="cg-data-table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>CONTACT PERSON</th>
                <th>INDUSTRY</th>
                <th>USERS</th>
                <th>ACTIVE TICKETS</th>
                <th>COMPLETED</th>
                <th>TOTAL PAID</th>
                <th>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="cg-table-loading">Loading company profiles...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={8} className="cg-table-empty">No companies found.</td></tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cg-cell-user">
                        <span className="cg-client-name font-bold">{c.name}</span>
                        <span className="cg-company-name">{c.email || c.website || 'No email provided'}</span>
                      </div>
                    </td>
                    <td>{c.contactPerson || 'N/A'}</td>
                    <td><span className="cg-service-tag">{c.industry || 'Enterprise'}</span></td>
                    <td>{c.usersCount} users</td>
                    <td>
                      <span className={`cg-sw-badge ${c.activeRequests > 0 ? 'active' : ''}`}>
                        {c.activeRequests} active
                      </span>
                    </td>
                    <td>{c.completedRequests} closed</td>
                    <td><strong>${c.totalPaid.toFixed(2)}</strong></td>
                    <td>{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CLIENT USERS */}
      {activeTab === 'users' && (
        <div className="cg-table-wrapper">
          <table className="cg-data-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>COMPANY</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST LOGIN</th>
                <th className="text-right">GOVERNANCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="cg-table-loading">Loading client users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="cg-table-empty">No client users found.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.company?.name || 'Unassigned'}</td>
                    <td><span className="cg-role-tag">{u.role}</span></td>
                    <td>
                      <span className={`cg-status-chip ${u.status?.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        className="cg-btn-sm"
                        style={{
                          background: magicLinkCopied === u.email ? '#059669' : '#ecfdf5',
                          color: magicLinkCopied === u.email ? '#ffffff' : '#059669',
                          borderColor: '#a7f3d0',
                          fontWeight: 600
                        }}
                        title="Generate instant passwordless magic login link"
                        onClick={() => handleCopyMagicLink(u.email)}
                        disabled={generatingLinkFor === u.email}
                      >
                        <Sparkles size={12} />
                        {generatingLinkFor === u.email
                          ? 'Generating...'
                          : magicLinkCopied === u.email
                          ? 'Copied Link! ✓'
                          : 'Magic Link'}
                      </button>
                      <button
                        className={`cg-btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CLIENT ONBOARDING */}
      {activeTab === 'onboarding' && (
        <div className="cg-onboarding-panel">
          <div className="cg-card">
            <h3 className="cg-card-title">Bulk Client Enterprise Onboarding</h3>
            <p className="cg-card-description">
              Upload multiple client companies and users simultaneously with pre-verified lead intelligence.
            </p>

            <div className="cg-onboarding-actions-row">
              <a
                href="/api/admin/users/bulk-template"
                download
                className="cg-btn-secondary"
              >
                <Download size={15} />
                <span>Download CSV Template</span>
              </a>
            </div>

            <div className="cg-notice-box mt-4">
              <strong>Template Specifications:</strong> Include column headers: <code>companyName, contactPerson, email, phone, website, industry, description</code>. Accounts will be initialized with secure credentials and mapped automatically.
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(selectedUserForStatus)}
        onClose={() => setSelectedUserForStatus(null)}
        onConfirm={handleConfirmStatusToggle}
        title={selectedUserForStatus?.status === 'ACTIVE' ? 'Deactivate Client Account' : 'Reactivate Client Account'}
        message={
          selectedUserForStatus?.status === 'ACTIVE'
            ? `Are you sure you want to disable access for ${selectedUserForStatus?.name} (${selectedUserForStatus?.email})? They will be unable to log in until reactivated.`
            : `Are you sure you want to restore active access for ${selectedUserForStatus?.name} (${selectedUserForStatus?.email})?`
        }
        confirmText={selectedUserForStatus?.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
        isDestructive={selectedUserForStatus?.status === 'ACTIVE'}
        isSubmitting={isUpdatingStatus}
      />
    </div>
  );
}
