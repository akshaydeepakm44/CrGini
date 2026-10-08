import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  DollarSign,
  ArrowRight,
  RefreshCw,
  FolderCheck,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AttentionRequiredBanner from '../components/AttentionRequiredBanner';
import OperationalHealthWidget from '../components/OperationalHealthWidget';
import SyncQueueButton from '../../../components/common/SyncQueueButton';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('30d');

  const loadOverview = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await adminApi.getOverview();
      setData(res);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Error fetching admin overview:', err);
      setError(err.message || 'Failed to load operational telemetry from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="cg-admin-loading">
        <div className="cg-admin-spinner" />
        <span>Loading operational telemetry...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="cg-admin-page">
        <div className="cg-panel-box" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginTop: '2rem' }}>
          <AlertCircle size={40} className="text-danger" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Unable to Load Admin Command Center</h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {error}
          </p>
          <button className="cg-btn-primary" onClick={() => loadOverview()} style={{ margin: '0 auto' }}>
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    kpi = {},
    operationalHealth = {},
    attentionRequired = [],
    serviceWorkload = [],
    specialists = [],
    recentActivity = [],
    recentDeliverables = [],
    recentMessages = []
  } = data || {};

  return (
    <div className="cg-admin-page">
      {/* Top Controls Bar */}
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Super Admin Command Center</h1>
          <p className="cg-page-subtitle">
            Global operational observability, request queues, and enterprise governance
          </p>
        </div>

        <div className="cg-page-header-actions">
          <div className="cg-date-filter-group">
            <button
              className={`cg-filter-chip ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
            <button
              className={`cg-filter-chip ${dateFilter === '7d' ? 'active' : ''}`}
              onClick={() => setDateFilter('7d')}
            >
              7D
            </button>
            <button
              className={`cg-filter-chip ${dateFilter === '30d' ? 'active' : ''}`}
              onClick={() => setDateFilter('30d')}
            >
              30D
            </button>
            <button
              className={`cg-filter-chip ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDateFilter('all')}
            >
              All Time
            </button>
          </div>

          <SyncQueueButton
            onSync={() => loadOverview(true)}
            isSyncing={refreshing}
            lastSyncedAt={lastSyncedAt}
          />
        </div>
      </div>

      {/* ROW 1: PRIMARY OPERATIONAL KPIS (All Clickable) */}
      <div className="cg-kpi-grid">
        <div
          className="cg-kpi-card"
          onClick={() => navigate('/admin/requests')}
          title="Click to view all active requests"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">ACTIVE REQUESTS</span>
            <ClipboardList size={16} className="cg-kpi-icon text-primary" />
          </div>
          <div className="cg-kpi-value">{kpi.activeRequests ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>In queue</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          className="cg-kpi-card highlight-warning"
          onClick={() => navigate('/admin/requests?filter=unassigned')}
          title="Click to view unassigned requests"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">UNASSIGNED</span>
            <AlertCircle size={16} className="cg-kpi-icon text-warning" />
          </div>
          <div className="cg-kpi-value text-warning">{kpi.unassignedRequests ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>Needs assignment</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          className="cg-kpi-card"
          onClick={() => navigate('/admin/requests?filter=in_progress')}
          title="Click to view requests in progress"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">IN PROGRESS</span>
            <Clock size={16} className="cg-kpi-icon text-info" />
          </div>
          <div className="cg-kpi-value">{kpi.inProgressRequests ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>Under development</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          className="cg-kpi-card highlight-info"
          onClick={() => navigate('/admin/deliverables?filter=pending_review')}
          title="Click to inspect deliverables awaiting client review"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">CLIENT REVIEW</span>
            <FolderCheck size={16} className="cg-kpi-icon text-info" />
          </div>
          <div className="cg-kpi-value text-info">{kpi.clientReviewRequests ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>Awaiting sign-off</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          className="cg-kpi-card highlight-alert"
          onClick={() => navigate('/admin/deliverables?filter=changes_requested')}
          title="Click to inspect revisions requested"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">CHANGES REQUESTED</span>
            <RotateCcw size={16} className="cg-kpi-icon text-alert" />
          </div>
          <div className="cg-kpi-value text-alert">{kpi.changesRequested ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>Revisions active</span>
            <ArrowRight size={13} />
          </div>
        </div>

        <div
          className="cg-kpi-card highlight-success"
          onClick={() => navigate('/admin/requests?filter=completed')}
          title="Click to view completed requests"
        >
          <div className="cg-kpi-top">
            <span className="cg-kpi-label">COMPLETED</span>
            <CheckCircle2 size={16} className="cg-kpi-icon text-success" />
          </div>
          <div className="cg-kpi-value text-success">{kpi.completedRequests ?? 0}</div>
          <div className="cg-kpi-foot">
            <span>Delivered & closed</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* ROW 2: OPERATIONAL HEALTH & ATTENTION REQUIRED */}
      <div className="cg-overview-row-two">
        <div className="cg-col-half">
          <OperationalHealthWidget health={operationalHealth} />
        </div>
        <div className="cg-col-half">
          <AttentionRequiredBanner observations={attentionRequired} />
        </div>
      </div>

      {/* ROW 3: SERVICE WORKLOAD & TEAM WORKLOAD */}
      <div className="cg-overview-row-three">
        <div className="cg-col-half">
          <div className="cg-panel-box">
            <div className="cg-panel-header">
              <div className="cg-panel-title-group">
                <Sparkles size={16} className="text-primary" />
                <h3 className="cg-panel-title">Service Workload</h3>
              </div>
              <button
                className="cg-link-btn"
                onClick={() => navigate('/admin/services')}
              >
                All Services <ArrowRight size={12} />
              </button>
            </div>

            <div className="cg-service-workload-list">
              {serviceWorkload.length === 0 ? (
                <div className="cg-empty-table">No active service workload data found.</div>
              ) : (
                serviceWorkload.map((s) => (
                  <div
                    key={s.serviceType}
                    className="cg-service-workload-item"
                    onClick={() => navigate(`/admin/requests?service=${s.serviceType}`)}
                  >
                    <div className="cg-sw-left">
                      <span className="cg-sw-name">{s.serviceName}</span>
                      <span className="cg-sw-type">{s.serviceType}</span>
                    </div>
                    <div className="cg-sw-counts">
                      <div className="cg-sw-badge active" title="Active">
                        {s.active} active
                      </div>
                      <div className="cg-sw-badge review" title="In Review">
                        {s.inReview} review
                      </div>
                      <div className="cg-sw-badge completed" title="Completed">
                        {s.completed} done
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="cg-col-half">
          <div className="cg-panel-box">
            <div className="cg-panel-header">
              <div className="cg-panel-title-group">
                <Users size={16} className="text-info" />
                <h3 className="cg-panel-title">Specialist Workload</h3>
              </div>
              <button
                className="cg-link-btn"
                onClick={() => navigate('/admin/team')}
              >
                Team Directory <ArrowRight size={12} />
              </button>
            </div>

            <div className="cg-team-workload-list">
              {specialists.length === 0 ? (
                <div className="cg-empty-table">No specialist records found.</div>
              ) : (
                specialists.map((sp) => (
                  <div
                    key={sp.id}
                    className="cg-specialist-row"
                    onClick={() => navigate(`/admin/team/${sp.id}`)}
                  >
                    <div className="cg-sp-avatar">
                      {sp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="cg-sp-meta">
                      <span className="cg-sp-name">{sp.name}</span>
                      <span className="cg-sp-role">{sp.role}</span>
                    </div>
                    <div className="cg-sp-workload">
                      <span className="cg-sp-count">
                        <strong>{sp.activeCount}</strong> active
                      </span>
                      <span className="cg-sp-subcount">
                        {sp.completedCount} closed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: RECENT DELIVERABLES & RECENT AUDIT TIMELINE */}
      <div className="cg-overview-row-four">
        <div className="cg-col-half">
          <div className="cg-panel-box">
            <div className="cg-panel-header">
              <div className="cg-panel-title-group">
                <FolderCheck size={16} className="text-success" />
                <h3 className="cg-panel-title">Recent Deliverables</h3>
              </div>
              <button
                className="cg-link-btn"
                onClick={() => navigate('/admin/deliverables')}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="cg-deliverables-compact-table">
              {recentDeliverables.length === 0 ? (
                <div className="cg-empty-table">No recent deliverables recorded.</div>
              ) : (
                recentDeliverables.map((d) => (
                  <div
                    key={d.id}
                    className="cg-deliverable-compact-row"
                    onClick={() => navigate(`/admin/requests/${d.request_id}`)}
                  >
                    <div className="cg-dc-code">{d.ticket_code}</div>
                    <div className="cg-dc-info">
                      <span className="cg-dc-title">{d.title}</span>
                      <span className="cg-dc-version">V{d.version} • {d.submitted_by_name || 'Specialist'}</span>
                    </div>
                    <span className={`cg-status-chip ${d.status?.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="cg-col-half">
          <div className="cg-panel-box">
            <div className="cg-panel-header">
              <div className="cg-panel-title-group">
                <Calendar size={16} className="text-neutral" />
                <h3 className="cg-panel-title">Recent Platform Activity</h3>
              </div>
              <button
                className="cg-link-btn"
                onClick={() => navigate('/admin/audit')}
              >
                Full Audit Log <ArrowRight size={12} />
              </button>
            </div>

            <div className="cg-activity-timeline-compact">
              {recentActivity.length === 0 ? (
                <div className="cg-empty-table">No recent activity logs found.</div>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="cg-activity-compact-row">
                    <span className="cg-activity-dot" />
                    <div className="cg-activity-compact-meta">
                      <span className="cg-activity-action">{log.action}</span>
                      <span className="cg-activity-details">{log.details}</span>
                    </div>
                    <span className="cg-activity-time">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: RECENT CLIENT & SPECIALIST COMMUNICATIONS */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="cg-panel-box">
          <div className="cg-panel-header">
            <div className="cg-panel-title-group">
              <MessageSquare size={16} className="text-accent" />
              <h3 className="cg-panel-title">Live Communications & Ticket Inquiries</h3>
            </div>
            <button
              className="cg-link-btn"
              onClick={() => navigate('/admin/messages')}
            >
              Open Message Center <ArrowRight size={12} />
            </button>
          </div>

          <div className="cg-deliverables-compact-table">
            {recentMessages.length === 0 ? (
              <div className="cg-empty-table">No message exchanges recorded on active tickets.</div>
            ) : (
              recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="cg-deliverable-compact-row"
                  onClick={() => navigate(`/admin/messages?requestId=${m.requestId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="cg-dc-code" style={{ minWidth: '85px' }}>{m.ticketCode}</div>
                  <div className="cg-dc-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{m.senderName}</span>
                      <span style={{
                        fontSize: '0.6875rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        background: m.senderRole === 'USER' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: m.senderRole === 'USER' ? '#3b82f6' : '#10b981',
                        fontWeight: 600
                      }}>
                        {m.senderRole === 'USER' ? 'Client' : 'Team'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      "{m.text}"
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
