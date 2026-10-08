import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers, RefreshCw, ArrowRight, CheckCircle2, Clock, RotateCcw, ShieldAlert } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOverview();
      setData(res?.serviceWorkload || []);
    } catch (err) {
      console.error('Error fetching service workload:', err);
      setError(err.message || 'Failed to load service telemetry from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const SERVICE_CATALOG = [
    {
      type: 'COMPANY_BOOST',
      name: 'Boosting (Growth, GTM & Content)',
      subServices: [
        'Strategic Planner',
        'Content Creator',
        'Posters / Creatives',
        'Videos & Reels',
        'Ad Creatives',
        'GTM Strategy',
        'DevRel & Community'
      ]
    },
    {
      type: 'COMPANY_LEAD',
      name: 'Digitalising (Lead & Research)',
      subServices: [
        'Lead Research',
        'Company Study',
        'Key People Research',
        'Pitch Support',
        'Verified Account Sourcing'
      ]
    },
    {
      type: 'LANDING_PAGE',
      name: 'Landing Page & UI/UX Architecture',
      subServices: [
        'Interactive Hero Experience',
        'Conversion & Performance Audit',
        'Figma Blueprint & Prototyping',
        'Production Web Implementation'
      ]
    }
  ];

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Services Observability & Management</h1>
          <p className="cg-page-subtitle">
            Operational service lines, sub-service offerings, and volume distribution
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadServices}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadServices} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="cg-services-grid">
        {SERVICE_CATALOG.map((cat) => {
          const stats = (data || []).find((s) => s.serviceType === cat.type) || {
            active: 0,
            completed: 0,
            inReview: 0,
            total: 0
          };

          return (
            <div key={cat.type} className="cg-service-card">
              <div className="cg-service-card-top">
                <div className="cg-service-badge">{cat.type}</div>
                <h3 className="cg-service-name">{cat.name}</h3>
              </div>

              {/* STATS ROW */}
              <div className="cg-service-stats-grid">
                <div className="cg-service-stat">
                  <span className="cg-stat-num text-primary">{stats.active}</span>
                  <span className="cg-stat-lbl">Active</span>
                </div>
                <div className="cg-service-stat">
                  <span className="cg-stat-num text-info">{stats.inReview}</span>
                  <span className="cg-stat-lbl">In Review</span>
                </div>
                <div className="cg-service-stat">
                  <span className="cg-stat-num text-success">{stats.completed}</span>
                  <span className="cg-stat-lbl">Completed</span>
                </div>
                <div className="cg-service-stat">
                  <span className="cg-stat-num text-neutral">{stats.total}</span>
                  <span className="cg-stat-lbl">Total</span>
                </div>
              </div>

              {/* SUB SERVICES LIST */}
              <div className="cg-sub-services-block">
                <h4 className="cg-sub-services-title">Available Service Capabilities</h4>
                <div className="cg-sub-services-chips">
                  {cat.subServices.map((sub) => (
                    <span key={sub} className="cg-sub-chip">{sub}</span>
                  ))}
                </div>
              </div>

              <div className="cg-service-card-foot">
                <button
                  className="cg-btn-link"
                  onClick={() => navigate(`/admin/requests?service=${cat.type}`)}
                >
                  <span>View Service Queue</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
