import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Sparkles,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminReportsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getReportsOverview(range);
      setData(res);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [range]);

  const {
    statusDistribution = [],
    serviceDistribution = [],
    teamWorkload = [],
    financial = {}
  } = data || {};

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Operational Reports & Analytics</h1>
          <p className="cg-page-subtitle">
            Derived PostgreSQL metrics across service workflows, team performance, and revenue
          </p>
        </div>

        <div className="cg-page-header-actions">
          <div className="cg-date-filter-group">
            {[
              { key: 'today', label: 'Today' },
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: 'all', label: 'All Time' },
            ].map((btn) => (
              <button
                key={btn.key}
                className={`cg-filter-chip ${range === btn.key ? 'active' : ''}`}
                onClick={() => setRange(btn.key)}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button className="cg-btn-secondary" onClick={loadReports}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <RefreshCw size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadReports} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="cg-admin-loading">
          <div className="cg-admin-spinner" />
          <span>Aggregating operational reports...</span>
        </div>
      ) : (
        <div className="cg-reports-grid">
          {/* SECTION 1: OPERATIONS STATUS DISTRIBUTION */}
          <div className="cg-card">
            <h3 className="cg-card-title">Request Status Distribution ({range})</h3>
            <div className="cg-report-bar-list mt-3">
              {statusDistribution.length === 0 ? (
                <div className="cg-empty-table">No requests created in this date range.</div>
              ) : (
                statusDistribution.map((s) => (
                  <div key={s.status} className="cg-report-bar-item">
                    <div className="cg-rb-label">
                      <span>{s.status}</span>
                      <strong>{s.count}</strong>
                    </div>
                    <div className="cg-progress-track">
                      <div
                        className="cg-progress-fill"
                        style={{
                          width: `${Math.min(100, (parseInt(s.count, 10) / 10) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 2: SERVICES VOLUME */}
          <div className="cg-card">
            <h3 className="cg-card-title">Requests by Service Line ({range})</h3>
            <div className="cg-report-bar-list mt-3">
              {serviceDistribution.length === 0 ? (
                <div className="cg-empty-table">No service volume in this date range.</div>
              ) : (
                serviceDistribution.map((serv) => (
                  <div key={serv.service_type} className="cg-report-bar-item">
                    <div className="cg-rb-label">
                      <span>{serv.service_type}</span>
                      <strong>{serv.count}</strong>
                    </div>
                    <div className="cg-progress-track">
                      <div
                        className="cg-progress-fill info"
                        style={{
                          width: `${Math.min(100, (parseInt(serv.count, 10) / 10) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 3: TEAM PERFORMANCE */}
          <div className="cg-card">
            <h3 className="cg-card-title">Specialist Deliveries ({range})</h3>
            <div className="cg-team-report-table mt-3">
              {teamWorkload.length === 0 ? (
                <div className="cg-empty-table">No team activity recorded in this period.</div>
              ) : (
                <table className="cg-data-table">
                  <thead>
                    <tr>
                      <th>SPECIALIST</th>
                      <th>ROLE</th>
                      <th>COMPLETED</th>
                      <th>ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamWorkload.map((t) => (
                      <tr key={t.name}>
                        <td><strong>{t.name}</strong></td>
                        <td><span className="cg-role-tag">{t.role}</span></td>
                        <td><span className="text-success font-bold">{t.completed}</span></td>
                        <td><span>{t.active}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* SECTION 4: FINANCIAL SETTLEMENT SUMMARY */}
          <div className="cg-card">
            <h3 className="cg-card-title">Settlement Revenue ({range})</h3>
            <div className="cg-finance-report-stats mt-3">
              <div className="cg-fin-stat">
                <span className="cg-fin-label">Settled Revenue</span>
                <span className="cg-fin-val text-success">
                  ${parseFloat(financial.revenue || 0).toFixed(2)}
                </span>
                <span className="cg-fin-sub">{financial.paid_count || 0} paid invoices</span>
              </div>
              <div className="cg-fin-stat">
                <span className="cg-fin-label">Pending Invoices</span>
                <span className="cg-fin-val text-warning">
                  ${parseFloat(financial.pending_amount || 0).toFixed(2)}
                </span>
                <span className="cg-fin-sub">{financial.pending_count || 0} invoices awaiting settlement</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
