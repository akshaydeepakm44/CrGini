import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Building2,
  Users,
  Presentation,
  Target,
  Palette,
  Code2,
  Terminal,
  Smartphone,
  Globe
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useServiceVisibility } from '../../client/context/ServiceVisibilityContext';

const CHANNELS_META = [
  {
    id: 'boosting',
    channelKey: 'channel:boosting',
    name: 'BOOSTING',
    title: 'Brand, Content & Growth Outreach',
    description: 'Grow your brand, content and market presence with specialist campaigns.',
    badge: 'Channel 01',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    borderColor: '#FCE7F3'
  },
  {
    id: 'digitalising',
    channelKey: 'channel:digitalising',
    name: 'DIGITALISING',
    title: 'Research, Insights & Market Intelligence',
    description: 'Research, insights and business intelligence prepared by the specialist team.',
    badge: 'Channel 02',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#EDE9FE'
  },
  {
    id: 'design',
    channelKey: 'channel:design',
    name: 'UI / DESIGN',
    title: 'Interface Design & Conversion Architecture',
    description: 'Professional interface design, heuristic audits, and design system engineering.',
    badge: 'Channel 03',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#E0F2FE'
  },
  {
    id: 'development',
    channelKey: 'channel:development',
    name: 'APP DEVELOPMENT',
    title: 'Full-Stack Software MVP & Prototyping',
    description: 'Turnkey full-stack web applications, mobile apps, and scalable API systems.',
    badge: 'Channel 04',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#D1FAE5'
  }
];

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'page-view'; // Default directly to "Services Channel : Page View"
  const { refreshVisibility } = useServiceVisibility();

  // Workload telemetry state
  const [workloadData, setWorkloadData] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  // Services visibility state
  const [visibilitySettings, setVisibilitySettings] = useState([]);
  const [loadingVisibility, setLoadingVisibility] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('ALL');
  const [statusNotice, setStatusNotice] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoadingVisibility(true);
      setError(null);
      const [visibility, overview] = await Promise.all([
        adminApi.getServiceVisibility(),
        adminApi.getOverview().catch(() => ({ serviceWorkload: [] }))
      ]);
      setVisibilitySettings(visibility || []);
      setWorkloadData(overview?.serviceWorkload || []);
    } catch (err) {
      console.error('Error fetching services settings:', err);
      setError(err.message || 'Failed to load services data from server.');
    } finally {
      setLoadingVisibility(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      setUpdatingId(id);
      setStatusNotice(null);
      const res = await adminApi.updateServiceVisibility(id, nextStatus);
      if (res.services) {
        setVisibilitySettings(res.services);
      } else {
        await loadData();
      }
      refreshVisibility();
      setStatusNotice({
        type: 'success',
        message: res.message || `Updated status successfully.`
      });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      console.error('Error toggling service status:', err);
      setStatusNotice({
        type: 'error',
        message: err.message || 'Failed to toggle service status.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper lookups
  const isChannelActive = (channelSlug) => {
    const item = visibilitySettings.find(
      (s) => s.id === `channel:${channelSlug}` || (s.is_channel && s.channel === channelSlug)
    );
    return item ? Boolean(item.is_active) : true;
  };

  const getServiceStatus = (serviceId) => {
    const item = visibilitySettings.find((s) => s.id === serviceId);
    return item ? Boolean(item.is_active) : true;
  };

  const filteredServices = visibilitySettings.filter((item) => {
    if (item.is_channel) return false;
    if (selectedChannelFilter !== 'ALL' && item.channel !== selectedChannelFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchId) return false;
    }
    return true;
  });

  const activeCount = visibilitySettings.filter((s) => !s.is_channel && s.is_active).length;
  const deactivatedCount = visibilitySettings.filter((s) => !s.is_channel && !s.is_active).length;

  return (
    <div className="cg-admin-page">
      {/* PAGE HEADER */}
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366F1', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
              Super Admin Control
            </span>
          </div>
          <h1 className="cg-page-title">Services Channel : Page View</h1>
          <p className="cg-page-subtitle">
            Configure live page views and toggle visibility of service channels and individual capabilities in the Client Portal.
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadData}>
            <RefreshCw size={14} className={loadingVisibility ? 'cg-spin' : ''} />
            <span>Refresh Settings</span>
          </button>
        </div>
      </div>

      {/* MODULE NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'page-view' })}
          style={{
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'page-view' ? '700' : '500',
            color: activeTab === 'page-view' ? '#4F46E5' : '#64748B',
            borderBottom: activeTab === 'page-view' ? '2px solid #4F46E5' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <SlidersHorizontal size={16} />
          <span>Services Channel : Page View</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: activeTab === 'page-view' ? '#EEF2FF' : '#F1F5F9', color: activeTab === 'page-view' ? '#4F46E5' : '#64748B' }}>
            Live Toggles
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'workload' })}
          style={{
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'workload' ? '700' : '500',
            color: activeTab === 'workload' ? '#4F46E5' : '#64748B',
            borderBottom: activeTab === 'workload' ? '2px solid #4F46E5' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          <span>Workload &amp; Queue Observability</span>
        </button>
      </div>

      {statusNotice && (
        <div className={`cg-notice-box ${statusNotice.type === 'error' ? 'error' : 'success'} mb-3`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', background: statusNotice.type === 'error' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${statusNotice.type === 'error' ? '#FCA5A5' : '#BBF7D0'}`, color: statusNotice.type === 'error' ? '#991B1B' : '#166534', marginBottom: '16px' }}>
          {statusNotice.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{statusNotice.message}</span>
        </div>
      )}

      {error && (
        <div className="cg-notice-box error mb-3" style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', marginBottom: '16px' }}>
          <ShieldAlert size={16} className="text-danger" />
          <span className="flex-1" style={{ fontSize: '0.875rem' }}><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadData} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', marginLeft: '12px' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SERVICES CHANNEL : PAGE VIEW (ACTIVATION / DEACTIVATION CONTROLS) */}
      {/* ========================================================================= */}
      {activeTab === 'page-view' && (
        <div>
          {/* STATS BANNER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Active Services</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>{activeCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Visible in Client Portal</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Deactivated Services</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>{deactivatedCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Hidden from Client Portal</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Digitalising Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: isChannelActive('digitalising') ? '#10B981' : '#EF4444' }} />
                <span style={{ fontSize: '1rem', fontWeight: '700', color: isChannelActive('digitalising') ? '#10B981' : '#EF4444' }}>
                  {isChannelActive('digitalising') ? 'Active' : 'Deactivated (Hidden)'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                {isChannelActive('digitalising') ? 'Clients can view & request' : 'No client can view in portal'}
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
              <Search size={16} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search services by title, description or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#1E293B', background: 'transparent' }}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>Channel Filter:</span>
              {['ALL', 'boosting', 'digitalising', 'design', 'development'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedChannelFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: selectedChannelFilter === f ? '700' : '500',
                    background: selectedChannelFilter === f ? '#4F46E5' : '#F1F5F9',
                    color: selectedChannelFilter === f ? '#FFFFFF' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f === 'ALL' ? 'All Channels' : f}
                </button>
              ))}
            </div>
          </div>

          {/* CHANNELS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {CHANNELS_META.filter((c) => selectedChannelFilter === 'ALL' || c.id === selectedChannelFilter).map((channel) => {
              const channelActive = isChannelActive(channel.id);
              const channelServices = filteredServices.filter((s) => s.channel === channel.id);
              const channelItem = visibilitySettings.find((s) => s.id === channel.channelKey);

              return (
                <div
                  key={channel.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: `1px solid ${channelActive ? '#E2E8F0' : '#FECACA'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* CHANNEL HEADER BLOCK */}
                  <div
                    style={{
                      padding: '20px 24px',
                      background: channelActive ? channel.bgColor : '#FEF2F2',
                      borderBottom: `1px solid ${channelActive ? channel.borderColor : '#FEE2E2'}`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.06em', color: channel.color, background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${channel.borderColor}` }}>
                          {channel.badge}
                        </span>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                          {channel.name} CHANNEL
                        </h2>
                        {channelActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
                            <Check size={12} /> Active in Portal
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#991B1B', background: '#FEE2E2', padding: '2px 8px', borderRadius: '12px' }}>
                            <EyeOff size={12} /> Deactivated (Hidden)
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                        {channel.description}
                      </p>
                    </div>

                    {/* CHANNEL-LEVEL TOGGLE BUTTON */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        disabled={updatingId === channel.channelKey}
                        onClick={() => handleToggle(channel.channelKey, channelActive)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: 'none',
                          background: channelActive ? '#EF4444' : '#10B981',
                          color: '#FFFFFF',
                          boxShadow: channelActive ? '0 2px 4px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        {updatingId === channel.channelKey ? (
                          <RefreshCw size={15} className="cg-spin" />
                        ) : channelActive ? (
                          <>
                            <EyeOff size={16} />
                            <span>Deactivate Channel</span>
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            <span>Activate Channel</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CHILD SERVICES LIST */}
                  <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                        Service Offerings &amp; Page Views ({channelServices.length})
                      </span>
                      {!channelActive && (
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: '600' }}>
                          Notice: All sub-services are hidden because this channel is deactivated.
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {channelServices.map((svc) => {
                        const svcActive = Boolean(svc.is_active);
                        const isEffectivelyActive = channelActive && svcActive;
                        const isUpdating = updatingId === svc.id;

                        return (
                          <div
                            key={svc.id}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              border: `1px solid ${isEffectivelyActive ? '#E2E8F0' : '#FECACA'}`,
                              background: isEffectivelyActive ? '#FFFFFF' : '#FFF5F5',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                                <div>
                                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', margin: '0 0 2px 0' }}>
                                    {svc.name}
                                  </h3>
                                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                                    {svc.id}
                                  </span>
                                </div>

                                {isEffectivelyActive ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: '700', color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                                    <Check size={11} /> Visible
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: '700', color: '#991B1B', background: '#FEE2E2', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                                    <X size={11} /> Hidden
                                  </span>
                                )}
                              </div>

                              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4', margin: '0 0 14px 0' }}>
                                {svc.description || 'Service offering in this channel.'}
                              </p>
                            </div>

                            {/* TOGGLE BUTTON FOR THIS SERVICE */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isEffectivelyActive ? '#059669' : '#DC2626' }}>
                                {isEffectivelyActive ? 'Active in Client Portal' : 'Hidden from Client Portal'}
                              </span>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleToggle(svc.id, svcActive)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  border: 'none',
                                  transition: 'all 0.15s ease',
                                  background: svcActive ? '#FEE2E2' : '#DCFCE7',
                                  color: svcActive ? '#991B1B' : '#166534',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {isUpdating ? (
                                  <RefreshCw size={12} className="cg-spin" />
                                ) : svcActive ? (
                                  <>
                                    <EyeOff size={13} />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye size={13} />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORKLOAD & QUEUE OBSERVABILITY (EXISTING TELEMETRY) */}
      {/* ========================================================================= */}
      {activeTab === 'workload' && (
        <div className="cg-services-grid">
          {[
            {
              type: 'COMPANY_BOOST',
              name: 'Boosting (Growth, GTM & Content)',
              subServices: ['Strategic Planner', 'Content Creator', 'Posters / Creatives', 'Videos & Reels', 'Ad Creatives', 'GTM Strategy', 'DevRel & Community']
            },
            {
              type: 'COMPANY_LEAD',
              name: 'Digitalising (Lead & Research)',
              subServices: ['Lead Research', 'Company Study', 'Key People Research', 'Pitch Support', 'Verified Account Sourcing']
            },
            {
              type: 'LANDING_PAGE',
              name: 'Landing Page & UI/UX Architecture',
              subServices: ['Interactive Hero Experience', 'Conversion & Performance Audit', 'Figma Blueprint & Prototyping', 'Production Web Implementation']
            }
          ].map((cat) => {
            const stats = (workloadData || []).find((s) => s.serviceType === cat.type) || {
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
      )}
    </div>
  );
}
