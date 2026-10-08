import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminTeamPage() {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Role change modal
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [targetRole, setTargetRole] = useState('COMPANY_LEAD');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Status toggle modal
  const [statusUser, setStatusUser] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getTeamOverview();
      setTeam(data);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.message || 'Failed to load team directory from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleOpenRoleModal = (u) => {
    setRoleChangeUser(u);
    setTargetRole(u.role);
  };

  const handleConfirmRoleChange = async (reason) => {
    if (!roleChangeUser) return;
    try {
      setIsUpdatingRole(true);
      await adminApi.changeUserRole(roleChangeUser.id, targetRole);
      setRoleChangeUser(null);
      await loadTeam();
    } catch (err) {
      alert(`Role change failed: ${err.message}`);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusUser) return;
    const nextStatus = statusUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      setIsUpdatingStatus(true);
      await adminApi.updateUserStatus(statusUser.id, nextStatus);
      setStatusUser(null);
      await loadTeam();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredTeam = team.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Team & Specialists Governance</h1>
          <p className="cg-page-subtitle">
            Internal service specialists, active ticket allocation, and administrative role management
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button
            className="cg-btn-primary"
            onClick={() => navigate('/admin/team/permissions')}
          >
            <ShieldCheck size={15} />
            <span>Portal Access & Roles</span>
          </button>

          <button className="cg-btn-secondary" onClick={loadTeam} title="Refresh Team">
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadTeam} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* FILTER SEARCH */}
      <div className="cg-filter-bar">
        <div className="cg-filter-search">
          <Search size={15} className="cg-filter-icon" />
          <input
            type="text"
            className="cg-filter-input"
            placeholder="Search specialists by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SPECIALISTS TABLE */}
      <div className="cg-table-wrapper">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th>SPECIALIST</th>
              <th>PRIMARY ROLE</th>
              <th>SERVICE ACCESS</th>
              <th>ACTIVE WORKLOAD</th>
              <th>COMPLETED</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="cg-table-loading">Loading specialist accounts...</td></tr>
            ) : filteredTeam.length === 0 ? (
              <tr><td colSpan={8} className="cg-table-empty">No team members found.</td></tr>
            ) : (
              filteredTeam.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cg-cell-user">
                      <span className="cg-client-name font-bold">{u.name}</span>
                      <span className="cg-company-name">{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cg-role-tag">{u.role}</span>
                  </td>
                  <td>
                    <div className="cg-service-tags-cell">
                      {u.dashboardAccess?.companyLead && <span className="cg-tag-lead">Lead</span>}
                      {u.dashboardAccess?.companyBoost && <span className="cg-tag-boost">Boost</span>}
                      {u.dashboardAccess?.companyUI && <span className="cg-tag-ui">UI/Design</span>}
                    </div>
                  </td>
                  <td>
                    <span className="cg-workload-val">
                      <strong>{u.activeWorkload}</strong> active tickets
                    </span>
                  </td>
                  <td>
                    <span>{u.completedWorkload} closed</span>
                  </td>
                  <td>
                    <span className={`cg-status-chip ${u.status?.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span className="cg-date-text">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="cg-row-actions">
                      <button
                        className="cg-action-btn"
                        onClick={() => handleOpenRoleModal(u)}
                        title="Change role or promote"
                      >
                        <Edit3 size={13} />
                        <span>Role</span>
                      </button>
                      <button
                        className={`cg-action-btn ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => setStatusUser(u)}
                        title={u.status === 'ACTIVE' ? 'Deactivate account' : 'Restore account'}
                      >
                        <span>{u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ROLE CHANGE MODAL */}
      {roleChangeUser && (
        <div className="cg-modal-backdrop">
          <div className="cg-modal-box">
            <div className="cg-modal-header">
              <div className="cg-modal-header-icon">
                <ShieldAlert size={20} className="text-warning" />
              </div>
              <div className="cg-modal-header-text">
                <h3 className="cg-modal-title">Change Specialist Role</h3>
                <span className="cg-modal-subtitle">{roleChangeUser.name} ({roleChangeUser.email})</span>
              </div>
            </div>

            <div className="cg-modal-body">
              <div className="cg-form-group">
                <label className="cg-form-label">Assign New Platform Role</label>
                <select
                  className="cg-form-select"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={isUpdatingRole}
                >
                  <option value="COMPANY_LEAD">COMPANY_LEAD (Digitalising / Lead Research)</option>
                  <option value="COMPANY_BOOST">COMPANY_BOOST (Boosting / Growth & Outbound)</option>
                  <option value="LANDING_PAGE">LANDING_PAGE (Landing Page & UI/UX Architect)</option>
                  <option value="ADMIN">ADMIN (Administrative Specialist)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Governance)</option>
                  <option value="USER">USER (Client User)</option>
                </select>
              </div>

              <div className="cg-notice-box">
                Updating role will automatically recalibrate dashboard workspace permissions and record an entry in the platform audit log.
              </div>
            </div>

            <div className="cg-modal-footer">
              <button
                className="cg-btn-secondary"
                onClick={() => setRoleChangeUser(null)}
                disabled={isUpdatingRole}
              >
                Cancel
              </button>
              <button
                className="cg-btn-primary"
                onClick={() => handleConfirmRoleChange()}
                disabled={isUpdatingRole || targetRole === roleChangeUser.role}
              >
                {isUpdatingRole ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(statusUser)}
        onClose={() => setStatusUser(null)}
        onConfirm={handleConfirmStatusToggle}
        title={statusUser?.status === 'ACTIVE' ? 'Deactivate Specialist Account' : 'Reactivate Specialist Account'}
        message={
          statusUser?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate ${statusUser?.name}? They will immediately lose access to internal queues.`
            : `Are you sure you want to restore active status for ${statusUser?.name}?`
        }
        confirmText={statusUser?.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
        isDestructive={statusUser?.status === 'ACTIVE'}
        isSubmitting={isUpdatingStatus}
      />
    </div>
  );
}
