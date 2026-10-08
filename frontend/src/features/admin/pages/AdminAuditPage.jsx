import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ScrollText,
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminAuditPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('security') ? 'security' : 'all'
  );

  useEffect(() => {
    if (location.pathname.includes('security')) {
      setActiveTab('security');
    } else if (location.pathname.includes('activity')) {
      setActiveTab('all');
    }
  }, [location.pathname]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err.message || 'Failed to load activity logs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const SECURITY_ACTIONS = [
    'USER_ROLE_CHANGED',
    'PERMISSIONS_MATRIX_UPDATED',
    'PERMISSIONS_UPDATED',
    'ADMIN_OVERRIDE',
    'CLIENT_DELETED',
    'TEAM_USER_DELETED',
    'USER_STATUS_UPDATED'
  ];

  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'security') {
      const isSec = SECURITY_ACTIONS.includes(log.action) || log.action?.includes('PERMISSION') || log.action?.includes('STATUS');
      if (!isSec) return false;
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Audit Trail & Security Telemetry</h1>
          <p className="cg-page-subtitle">
            Cryptographically timestamped audit log of all administrative actions, role modifications, and system events
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadLogs}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="cg-tab-row">
        <button
          className={`cg-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <ScrollText size={15} />
          <span>All Platform Activity ({logs.length})</span>
        </button>
        <button
          className={`cg-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldAlert size={15} />
          <span>Security & Governance Events</span>
        </button>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadLogs} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="cg-filter-bar">
        <div className="cg-filter-search">
          <Search size={15} className="cg-filter-icon" />
          <input
            type="text"
            className="cg-filter-input"
            placeholder="Search by actor, action name, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="cg-table-wrapper">
        <table className="cg-data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>ACTOR</th>
              <th>ACTION EVENT</th>
              <th>DETAILS & JUSTIFICATION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="cg-table-loading">Loading audit records...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={4} className="cg-table-empty">No activity records found matching filters.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="cg-nowrap">
                    <span className="cg-date-text font-mono">
                      {new Date(log.created_at || log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className="cg-cell-user">
                      <span className="font-bold">{log.userName || log.user_name || 'System Admin'}</span>
                      <span className="cg-text-muted text-xs">ID: {log.userId || log.user_id || 'System'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`cg-action-badge ${SECURITY_ACTIONS.includes(log.action) ? 'security' : 'standard'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <p className="cg-log-details">{log.details}</p>
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
