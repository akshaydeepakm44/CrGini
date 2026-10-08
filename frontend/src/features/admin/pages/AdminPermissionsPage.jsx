import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  ArrowLeft,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  Users,
  Briefcase,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

const ROLES = [
  { value: 'COMPANY_LEAD', label: 'Lead Specialist (COMPANY_LEAD)' },
  { value: 'COMPANY_BOOST', label: 'Boost Strategist (COMPANY_BOOST)' },
  { value: 'LANDING_PAGE', label: 'UI Architect (LANDING_PAGE)' },
  { value: 'ADMIN', label: 'Administrative Lead (ADMIN)' },
  { value: 'SUPER_ADMIN', label: 'Super Administrator (SUPER_ADMIN)' },
];

export default function AdminPermissionsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [savingUserId, setSavingUserId] = useState(null);
  const [savedUserFeedback, setSavedUserFeedback] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userList = await adminApi.getAllUsers();
      // Only internal team specialists and administrators receive permissions
      const staffList = (userList || []).filter((u) => u.role !== 'USER');
      setUsers(staffList);
    } catch (err) {
      console.error('Error fetching users for permission access:', err);
      setError(err.message || 'Failed to load user access permissions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Telemetry counts for internal specialists
  const telemetry = useMemo(() => {
    let leadCount = 0;
    let boostCount = 0;
    let uiCount = 0;
    let adminCount = 0;

    users.forEach((u) => {
      const da = u.dashboardAccess || {};
      if (da.companyLead || u.role === 'COMPANY_LEAD') leadCount++;
      if (da.companyBoost || u.role === 'COMPANY_BOOST') boostCount++;
      if (da.companyUI || u.role === 'LANDING_PAGE') uiCount++;
      if (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') adminCount++;
    });

    return { leadCount, boostCount, uiCount, adminCount };
  }, [users]);

  // Handle portal access toggle (companyLead, companyBoost, companyUI)
  const handleTogglePortal = async (user, portalKey) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('Root Super Administrator automatically has access across all modules and portals.');
      return;
    }

    const currentAccess = user.dashboardAccess || {};
    const updatedAccess = {
      ...currentAccess,
      [portalKey]: !currentAccess[portalKey],
    };

    try {
      setSavingUserId(user.id);
      await adminApi.updateUserPermissions(user.id, updatedAccess);

      // Optimistic local state update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, dashboardAccess: updatedAccess }
            : u
        )
      );

      setSavedUserFeedback((prev) => ({ ...prev, [user.id]: 'Updated ✓' }));
      setTimeout(() => {
        setSavedUserFeedback((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
      }, 2000);

      const portalLabel =
        portalKey === 'companyLead' ? 'Lead' : portalKey === 'companyBoost' ? 'Boost' : 'UI/Design';
      const action = updatedAccess[portalKey] ? 'Granted' : 'Revoked';
      showToast(`${action} ${portalLabel} Portal access for ${user.name}`);
    } catch (err) {
      alert(`Failed to update portal access: ${err.message}`);
    } finally {
      setSavingUserId(null);
    }
  };

  // Handle Role change
  const handleChangeRole = async (user, newRole) => {
    if (user.email === 'admin@creativegini.com' && newRole !== 'SUPER_ADMIN') {
      alert('Cannot demote primary system administrator.');
      return;
    }

    try {
      setSavingUserId(user.id);
      const currentAccess = user.dashboardAccess || {};
      const updatedAccess = { ...currentAccess };

      if (newRole === 'COMPANY_LEAD') updatedAccess.companyLead = true;
      if (newRole === 'COMPANY_BOOST') updatedAccess.companyBoost = true;
      if (newRole === 'LANDING_PAGE') updatedAccess.companyUI = true;
      if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
        updatedAccess.companyLead = true;
        updatedAccess.companyBoost = true;
        updatedAccess.companyUI = true;
      }

      await adminApi.updateUserPermissions(user.id, updatedAccess, newRole);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, role: newRole, dashboardAccess: updatedAccess }
            : u
        )
      );

      setSavedUserFeedback((prev) => ({ ...prev, [user.id]: 'Role Updated ✓' }));
      setTimeout(() => {
        setSavedUserFeedback((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
      }, 2000);

      showToast(`Assigned role '${newRole}' to ${user.name}`);
    } catch (err) {
      alert(`Failed to change role: ${err.message}`);
    } finally {
      setSavingUserId(null);
    }
  };

  // Grant All Specialist Portals
  const handleGrantAll = async (user) => {
    const allAccess = {
      companyLead: true,
      companyBoost: true,
      companyUI: true,
    };
    try {
      setSavingUserId(user.id);
      await adminApi.updateUserPermissions(user.id, allAccess);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, dashboardAccess: allAccess } : u))
      );
      showToast(`Granted all specialist portals to ${user.name}`);
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setSavingUserId(null);
    }
  };

  // Reset Specialist to Primary Role Only
  const handleResetSpecialist = async (user) => {
    if (user.role === 'SUPER_ADMIN' || user.email === 'admin@creativegini.com') {
      alert('Cannot reset root Super Administrator.');
      return;
    }
    const defaultAccess = {
      companyLead: user.role === 'COMPANY_LEAD',
      companyBoost: user.role === 'COMPANY_BOOST',
      companyUI: user.role === 'LANDING_PAGE',
    };
    try {
      setSavingUserId(user.id);
      await adminApi.updateUserPermissions(user.id, defaultAccess, user.role);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, dashboardAccess: defaultAccess }
            : u
        )
      );
      showToast(`Reset ${user.name} to default primary role access`);
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setSavingUserId(null);
    }
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      if (!matchSearch) return false;

      const da = u.dashboardAccess || {};
      if (activeTab === 'LEAD') return Boolean(da.companyLead || u.role === 'COMPANY_LEAD');
      if (activeTab === 'BOOST') return Boolean(da.companyBoost || u.role === 'COMPANY_BOOST');
      if (activeTab === 'UI') return Boolean(da.companyUI || u.role === 'LANDING_PAGE');
      if (activeTab === 'ADMIN') return u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
      return true;
    });
  }, [users, searchQuery, activeTab]);

  return (
    <div className="cg-admin-page">
      {/* 1. PAGE HEADER */}
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <button className="cg-btn-link" onClick={() => navigate('/admin/team')}>
            <ArrowLeft size={14} />
            <span>Team & Specialists</span>
          </button>
          <h1 className="cg-page-title">Team Specialist Portal Access & Roles</h1>
          <p className="cg-page-subtitle">
            Configure direct specialist portal authorizations (Lead, Boost, UI/Design) and assign operational roles across internal staff. (Client accounts access only their client portal).
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadUsers} disabled={loading} title="Reload accounts">
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. TELEMETRY STATS GRID */}
      <div className="cg-access-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="cg-access-stat-card">
          <div className="cg-access-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Users size={18} />
          </div>
          <div className="cg-access-stat-meta">
            <span className="cg-access-stat-count">{telemetry.leadCount}</span>
            <span className="cg-access-stat-label">Lead Specialists</span>
          </div>
        </div>

        <div className="cg-access-stat-card">
          <div className="cg-access-stat-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Sparkles size={18} />
          </div>
          <div className="cg-access-stat-meta">
            <span className="cg-access-stat-count">{telemetry.boostCount}</span>
            <span className="cg-access-stat-label">Boost Strategists</span>
          </div>
        </div>

        <div className="cg-access-stat-card">
          <div className="cg-access-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Layers size={18} />
          </div>
          <div className="cg-access-stat-meta">
            <span className="cg-access-stat-count">{telemetry.uiCount}</span>
            <span className="cg-access-stat-label">UI/Design Team</span>
          </div>
        </div>

        <div className="cg-access-stat-card">
          <div className="cg-access-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <ShieldCheck size={18} />
          </div>
          <div className="cg-access-stat-meta">
            <span className="cg-access-stat-count">{telemetry.adminCount}</span>
            <span className="cg-access-stat-label">Administrators</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & ROLE TABS */}
      <div className="cg-access-toolbar">
        <div className="cg-access-search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by specialist name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="cg-tab-row" style={{ margin: 0 }}>
          {[
            { key: 'ALL', label: `All Staff (${users.length})` },
            { key: 'LEAD', label: `Lead (${telemetry.leadCount})` },
            { key: 'BOOST', label: `Boost (${telemetry.boostCount})` },
            { key: 'UI', label: `UI/Design (${telemetry.uiCount})` },
            { key: 'ADMIN', label: `Admin (${telemetry.adminCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`cg-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadUsers} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. USER PORTAL ACCESS TABLE */}
      <div className="cg-table-card">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>USER & EMAIL</th>
              <th style={{ width: '22%' }}>PRIMARY ROLE</th>
              <th style={{ width: '35%' }}>PORTAL ACCESS (CLICK TO TOGGLE)</th>
              <th style={{ width: '15%' }} className="text-right">QUICK ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="cg-table-loading">
                  Loading user authorization and portal permissions...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="cg-table-empty">
                  No accounts found matching search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const da = u.dashboardAccess || {};
                const isSuperAdmin = u.role === 'SUPER_ADMIN';
                const isRootAdmin = u.email === 'admin@creativegini.com';
                const isSaving = savingUserId === u.id;
                const feedback = savedUserFeedback[u.id];

                return (
                  <tr key={u.id}>
                    {/* 1. USER & EMAIL */}
                    <td>
                      <div className="cg-cell-user">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="cg-client-name font-bold">{u.name}</span>
                          {feedback && (
                            <span className="cg-save-badge saved">
                              <Check size={11} /> {feedback}
                            </span>
                          )}
                          {isSaving && (
                            <span className="cg-save-badge saving">
                              <RefreshCw size={10} className="cg-spin" /> Saving...
                            </span>
                          )}
                        </div>
                        <span className="cg-company-name">{u.email}</span>
                        {u.company_name && (
                          <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
                            Organization: {u.company_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. PRIMARY ROLE SELECTOR */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <select
                          className="cg-role-select-input"
                          value={u.role}
                          disabled={isSuperAdmin || isRootAdmin || isSaving}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          title={isSuperAdmin ? 'Root Super Administrator is protected' : 'Change primary role'}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {(isSuperAdmin || isRootAdmin) && (
                          <Lock size={13} className="text-warning" title="Protected root administrator" />
                        )}
                      </div>
                    </td>

                    {/* 3. PORTAL ACCESS SWITCHES */}
                    <td>
                      <div className="cg-portal-toggles-group">
                        {/* LEAD PORTAL TOGGLE */}
                        <button
                          type="button"
                          className={`cg-portal-toggle-pill ${
                            da.companyLead || isSuperAdmin ? 'lead-on' : 'lead-off'
                          }`}
                          onClick={() => handleTogglePortal(u, 'companyLead')}
                          disabled={isSuperAdmin || isSaving}
                          title={
                            da.companyLead
                              ? 'Lead Portal: Active (Click to revoke)'
                              : 'Lead Portal: Restricted (Click to grant access)'
                          }
                        >
                          {da.companyLead || isSuperAdmin ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          <span>Lead Portal</span>
                        </button>

                        {/* BOOST PORTAL TOGGLE */}
                        <button
                          type="button"
                          className={`cg-portal-toggle-pill ${
                            da.companyBoost || isSuperAdmin ? 'boost-on' : 'boost-off'
                          }`}
                          onClick={() => handleTogglePortal(u, 'companyBoost')}
                          disabled={isSuperAdmin || isSaving}
                          title={
                            da.companyBoost
                              ? 'Boost Portal: Active (Click to revoke)'
                              : 'Boost Portal: Restricted (Click to grant access)'
                          }
                        >
                          {da.companyBoost || isSuperAdmin ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          <span>Boost Portal</span>
                        </button>

                        {/* UI/DESIGN PORTAL TOGGLE */}
                        <button
                          type="button"
                          className={`cg-portal-toggle-pill ${
                            da.companyUI || isSuperAdmin ? 'ui-on' : 'ui-off'
                          }`}
                          onClick={() => handleTogglePortal(u, 'companyUI')}
                          disabled={isSuperAdmin || isSaving}
                          title={
                            da.companyUI
                              ? 'UI/Design Portal: Active (Click to revoke)'
                              : 'UI/Design Portal: Restricted (Click to grant access)'
                          }
                        >
                          {da.companyUI || isSuperAdmin ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          <span>UI / Design</span>
                        </button>
                      </div>
                    </td>

                    {/* 4. QUICK ACTIONS */}
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="cg-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.6875rem' }}
                          onClick={() => handleGrantAll(u)}
                          disabled={isSuperAdmin || isSaving}
                          title="Grant access to all 3 specialist portals"
                        >
                          All Workspaces
                        </button>
                        <button
                          type="button"
                          className="cg-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.6875rem' }}
                          onClick={() => handleResetSpecialist(u)}
                          disabled={isSuperAdmin || isRootAdmin || isSaving}
                          title="Reset to default primary role workspace"
                        >
                          Default Role
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
