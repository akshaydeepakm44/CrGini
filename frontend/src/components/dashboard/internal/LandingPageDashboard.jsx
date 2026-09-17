import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  TicketCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  LogOut,
  X,
  Send,
  Building,
  Mail,
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  FileCheck,
  FileText,
  LayoutDashboard,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Bell,
  Upload,
  RotateCcw,
  Paperclip,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Users,
  TrendingUp
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import WorkSubmissionModal from '../common/WorkSubmissionModal';
import NotificationPanel from '../common/NotificationPanel';
import ActivityTimeline from '../common/ActivityTimeline';

export default function LandingPageDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Permissions & Role Access
  const isAdmin = user?.role === 'ADMIN';
  const da = user?.dashboardAccess || {};
  const hasLeadAccess = isAdmin || da.companyLead === true;
  const hasBoostAccess = isAdmin || da.companyBoost === true;
  const hasUIAccess = isAdmin || da.companyUI === true;
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow State: Submissions, Activity, Notifications
  const [ticketSubmissions, setTicketSubmissions] = useState([]);
  const [ticketActivity, setTicketActivity] = useState([]);
  const [activeTicketModalTab, setActiveTicketModalTab] = useState('deliverables');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sidebar Collapse, Mobile Drawer, Profile Dropdown
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_landing_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem('cg_landing_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [data, notifs] = await Promise.all([
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      // Enforce strictly LANDING_PAGE requests only
      const list = Array.isArray(data) ? data : (data?.requests || []);
      setRequests(list.filter(r => r && r.serviceType === 'LANDING_PAGE'));
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading Landing Page requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const [messages, subs, act] = await Promise.all([
        api.getMessages(ticket._id).catch(() => []),
        api.getSubmissions(ticket._id).catch(() => []),
        api.getTicketActivity(ticket._id).catch(() => [])
      ]);
      setTicketMessages(messages);
      setTicketSubmissions(subs);
      setTicketActivity(act);
      setActiveTicketModalTab('deliverables');
    } catch (err) {
      setTicketMessages([]);
      setTicketSubmissions([]);
      setTicketActivity([]);
    }
  };

  const handleStartWork = async () => {
    if (!selectedTicket) return;
    try {
      setIsUpdatingStatus(true);
      const res = await api.startWork(selectedTicket._id);
      setSelectedTicket(res.request);
      setRequests(prev => prev.map(r => r._id === res.request._id ? res.request : r));
      const act = await api.getTicketActivity(selectedTicket._id).catch(() => []);
      setTicketActivity(act);
    } catch (err) {
      alert('Failed to start work: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitWork = async (payload) => {
    if (!selectedTicket) return;
    try {
      setIsSubmittingWork(true);
      const res = await api.submitWork(selectedTicket._id, payload);
      setSelectedTicket(res.request);
      setRequests(prev => prev.map(r => r._id === res.request._id ? res.request : r));
      const [subs, act] = await Promise.all([
        api.getSubmissions(selectedTicket._id).catch(() => []),
        api.getTicketActivity(selectedTicket._id).catch(() => [])
      ]);
      setTicketSubmissions(subs);
      setTicketActivity(act);
      setIsSubmissionModalOpen(false);
    } catch (err) {
      alert('Failed to submit work: ' + err.message);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleOpenTicketById = async (ticketId) => {
    let t = requests.find(r => r._id === ticketId || r.ticketId === ticketId);
    if (!t) {
      try {
        t = await api.getRequestById(ticketId);
      } catch (e) {
        console.error('Could not find ticket:', e);
      }
    }
    if (t) {
      handleOpenTicket(t);
      setIsNotificationsOpen(false);
    }
  };

  // Close active modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSubmissionModalOpen) {
          setIsSubmissionModalOpen(false);
        } else if (selectedTicket) {
          setSelectedTicket(null);
        } else if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmissionModalOpen, selectedTicket, isNotificationsOpen]);

  const handleMarkNotifRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket) return;

    try {
      const newMsg = await api.sendMessage(selectedTicket._id, newMessageText);
      setTicketMessages(prev => [...prev, newMsg]);
      setNewMessageText('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await api.updateRequestStatus(selectedTicket._id, newStatus, statusUpdateNote);
      setSelectedTicket(updated);
      await loadTickets();
      setStatusUpdateNote('');
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics requested:
  // - New Requests
  // - In Progress
  // - Under Review
  // - Client Review
  // Operational metrics
  const newRequestsCount = requests.filter(r => ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)).length;
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const underReviewCount = requests.filter(r => r.status === 'UNDER_REVIEW').length;
  const clientReviewCount = requests.filter(r => ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)).length;
  const changesRequestedCount = requests.filter(r => r.status === 'CHANGES_REQUESTED').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
  const actionRequiredTickets = requests.filter(r => r.status === 'CHANGES_REQUESTED' || r.status === 'ASSIGNED');

  const filteredRequests = requests.filter(r => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.ticketId?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchCompany = r.companyId?.name?.toLowerCase().includes(q);
      const matchContact = r.companyId?.contactPerson?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchCompany && !matchContact) return false;
    }
    return true;
  });

  return (
    <div className="portal-root">
      <PortalCosmicBackground />

      {/* Sidebar */}
      <aside className={`portal-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileDrawerOpen ? 'mobile-open' : ''}`}>
        <div className="portal-sidebar-brand">
          <div className="portal-sidebar-brand-logo-area">
            <img src="/logo.png" alt="CreativeGini" className="portal-sidebar-logo" />
          </div>
          <button
            type="button"
            className="portal-sidebar-toggle-btn"
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="portal-company-badge" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(52, 211, 153, 0.25)' }}>
            <div className="portal-company-badge-label" style={{ color: '#10B981' }}>Internal Team</div>
            <div className="portal-company-badge-name" style={{ color: '#34D399', fontWeight: '700' }}>
              Landing Page Team
            </div>
          </div>
        )}

        <nav className="portal-sidebar-nav">
          <div className="portal-nav-section-title">Navigation & Dashboards</div>
          
          <button
            className={`portal-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setIsMobileDrawerOpen(false); }}
            title="Dashboard Overview"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {isAdmin && (
            <button
              className="portal-nav-btn"
              onClick={() => navigate('/admin')}
              title="Return to Master Admin Portal"
            >
              <ShieldCheck size={18} style={{ color: '#FFB000' }} />
              <span style={{ color: '#FFB000' }}>Admin Central</span>
            </button>
          )}

          {hasLeadAccess && (
            <button
              className="portal-nav-btn"
              onClick={() => navigate('/company-lead')}
              title="Switch to Company Lead Dashboard"
            >
              <Users size={18} />
              <span>Company Lead</span>
            </button>
          )}

          {hasBoostAccess && (
            <button
              className="portal-nav-btn"
              onClick={() => navigate('/company-boost')}
              title="Switch to Company Boost Dashboard"
            >
              <TrendingUp size={18} />
              <span>Company Boost</span>
            </button>
          )}

          {hasUIAccess && (
            <button
              className="portal-nav-btn active"
              onClick={() => { setActiveTab('dashboard'); setIsMobileDrawerOpen(false); }}
              title="Landing Page Enhancement Dashboard"
            >
              <Layers size={18} />
              <span>Company UI</span>
            </button>
          )}

          <div className="portal-nav-section-title" style={{ marginTop: '12px' }}>Workspace</div>

          <button
            className={`portal-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tickets'); setIsMobileDrawerOpen(false); }}
            title="Requests / Tickets"
          >
            <TicketCheck size={18} />
            <span>Requests / Tickets</span>
            <span className="portal-nav-badge" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff' }}>{requests.length}</span>
          </button>

          <button
            className={`portal-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => { setActiveTab('projects'); setIsMobileDrawerOpen(false); }}
            title="Projects / Deliveries"
          >
            <Globe size={18} />
            <span>Projects / Deliveries</span>
          </button>

          <button
            className={`portal-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setIsMobileDrawerOpen(false); }}
            title="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="portal-sidebar-footer">
          <div className="portal-user-chip">
            <div className="portal-user-avatar" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#030303', fontWeight: '800' }}>UI</div>
            {!isSidebarCollapsed && (
              <div className="portal-user-meta">
                <div className="portal-user-name" style={{ color: '#F5F5F5' }}>{user?.name || 'UI/UX Architect'}</div>
                <div className="portal-user-role" style={{ color: '#94A3B8' }}>ui@creativegini.com</div>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button className="portal-logout-btn" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileDrawerOpen && (
        <div
          className="portal-mobile-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="portal-main-wrapper">
        <header className="portal-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <button
              type="button"
              className="portal-mobile-menu-btn"
              onClick={() => setIsMobileDrawerOpen(true)}
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="portal-topbar-title-group">
              <h2 style={{ color: '#F5F5F5' }}>
                {activeTab === 'dashboard' && 'Landing Page Enhancement Dashboard'}
                {activeTab === 'tickets' && 'Landing Page Enhancement Requests & Tickets'}
                {activeTab === 'projects' && 'Landing Page Projects & Deliveries'}
                {activeTab === 'settings' && 'Landing Page Enhancement Settings'}
              </h2>
              <p style={{ color: '#CBD5E1' }}>
                {activeTab === 'dashboard' && 'Overview of active UI/UX engineering sprints, WebGL architecture and conversion deliverables.'}
                {activeTab === 'tickets' && 'Manage and track all Landing Page enhancement requests and tickets.'}
                {activeTab === 'projects' && 'Production deployments, Figma handoffs and responsive design releases.'}
                {activeTab === 'settings' && 'UI architect preferences, WebGL pipeline settings and team specs.'}
              </p>
            </div>
          </div>

          <div className="portal-topbar-actions">
            {/* Notification Bell & Panel */}
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadNotifCount}
              isOpen={isNotificationsOpen}
              onToggle={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileMenuOpen(false);
              }}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkAsRead={handleMarkNotifRead}
              onMarkAllAsRead={handleMarkAllNotifsRead}
              onOpenTicket={handleOpenTicketById}
            />

            {/* Team Specialist Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="portal-profile-chip-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Team Account"
              >
                <div className="portal-profile-chip-avatar" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#030303', fontWeight: '800' }}>
                  UI
                </div>
                <span className="portal-profile-chip-name" style={{ color: '#F5F5F5' }}>{user?.name || 'UI Architect'}</span>
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </button>
              {isProfileMenuOpen && (
                <div className="portal-topbar-dropdown" style={{ width: '220px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--portal-border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5' }}>{user?.name || 'UI/UX Architect'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ui@creativegini.com</div>
                  </div>
                  <button
                    className="portal-dropdown-item"
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <Settings size={15} />
                    <span>Team Settings</span>
                  </button>
                  <div style={{ height: '1px', background: 'var(--portal-border)', margin: '4px 0' }} />
                  <button
                    className="portal-dropdown-item danger"
                    onClick={onLogout}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="portal-content-container">
          {/* TAB: DASHBOARD - OPERATIONAL WORK OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 5 Column Metric Cards Grid */}
              <div className="portal-metrics-grid cols-5">
                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF' }}>
                    <TicketCheck size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{newRequestsCount}</div>
                    <div className="portal-metric-label">New Assignments</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(255, 176, 0, 0.12)', color: '#FFB000' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{inProgressCount}</div>
                    <div className="portal-metric-label">In Progress</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#F87171' }}>
                    <RotateCcw size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{changesRequestedCount}</div>
                    <div className="portal-metric-label">Changes Requested</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#C084FC' }}>
                    <Layers size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{clientReviewCount}</div>
                    <div className="portal-metric-label">Client Review</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34D399' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{completedCount}</div>
                    <div className="portal-metric-label">Completed</div>
                  </div>
                </div>
              </div>

              {/* Action Required / Active Sprints Highlight */}
              <div className="portal-card" style={{ borderLeft: '4px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F5F5F5', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#10B981" />
                      Active UI/UX Sprints & Build Deliverables
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                      Sprints requiring UI architect attention, design iteration, or submission review.
                    </p>
                  </div>
                  <button
                    className="portal-btn-secondary"
                    onClick={() => setActiveTab('tickets')}
                    style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    View All Tickets <ArrowUpRight size={14} />
                  </button>
                </div>

                {actionRequiredTickets.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', background: 'rgba(6, 17, 26, 0.6)', borderRadius: '8px', border: '1px dashed var(--portal-border)' }}>
                    All design queues clear! No revisions or unassigned sprints pending action.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                    {actionRequiredTickets.slice(0, 4).map((ticket) => (
                      <div
                        key={ticket._id}
                        style={{
                          background: 'rgba(6, 17, 26, 0.85)',
                          border: ticket.status === 'CHANGES_REQUESTED' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.35)',
                          borderRadius: '8px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#34D399', fontSize: '0.85rem' }}>
                              {ticket.ticketId}
                            </span>
                            <span className={`status-pill ${ticket.status}`}>
                              {ticket.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F5F5F5', margin: '0 0 4px 0' }}>
                            {ticket.title}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                            Client: <span style={{ color: '#00D9FF' }}>{ticket.companyId?.name || 'Client'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--portal-border)' }}>
                          <span className={`priority-pill ${ticket.priority}`}>{ticket.priority}</span>
                          <button
                            type="button"
                            className="portal-btn-primary"
                            style={{ padding: '4px 12px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                            onClick={() => handleOpenTicket(ticket)}
                          >
                            Open Ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Two-Column Operational Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {/* Conversion Architecture Pipeline */}
                <div className="portal-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#00D9FF" />
                    Conversion Architecture Pipeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#CBD5E1' }}>In Progress (Design & Code)</span>
                        <span style={{ color: '#FFB000', fontWeight: '600' }}>{inProgressCount} Sprints</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${requests.length ? (inProgressCount / requests.length) * 100 : 0}%`, height: '100%', background: '#FFB000', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#CBD5E1' }}>Under Client Review</span>
                        <span style={{ color: '#C084FC', fontWeight: '600' }}>{clientReviewCount} Deliveries</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${requests.length ? (clientReviewCount / requests.length) * 100 : 0}%`, height: '100%', background: '#C084FC', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#CBD5E1' }}>Revisions Requested</span>
                        <span style={{ color: '#F87171', fontWeight: '600' }}>{changesRequestedCount} Sprints</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${requests.length ? (changesRequestedCount / requests.length) * 100 : 0}%`, height: '100%', background: '#F87171', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: '#CBD5E1' }}>Completed & Finalized</span>
                        <span style={{ color: '#34D399', fontWeight: '600' }}>{completedCount} Sprints</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${requests.length ? (completedCount / requests.length) * 100 : 0}%`, height: '100%', background: '#34D399', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* UI Engineering Operational Guidelines */}
                <div className="portal-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} color="#34D399" />
                    UI Engineering Operational Overview
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(6, 17, 26, 0.75)', border: '1px solid var(--portal-border)' }}>
                      <div style={{ fontWeight: '600', color: '#F5F5F5', marginBottom: '2px' }}>⚡ 60fps WebGL & Framer Performance</div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>Ensure canvas shaders, lightweight geometries, and mobile fallbacks meet strict 90+ Lighthouse targets.</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(6, 17, 26, 0.75)', border: '1px solid var(--portal-border)' }}>
                      <div style={{ fontWeight: '600', color: '#F5F5F5', marginBottom: '2px' }}>📱 Mobile-First Breakpoint Architecture</div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>Strict verification across 375px (iPhone), 768px (iPad portrait), and 1440px (Ultra-wide desktop).</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(6, 17, 26, 0.75)', border: '1px solid var(--portal-border)' }}>
                      <div style={{ fontWeight: '600', color: '#F5F5F5', marginBottom: '2px' }}>⏱️ 24h Review Turnaround SLA</div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>Changes requested by clients must be acknowledged and re-submitted within 24 operational hours.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Snapshot */}
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5', margin: 0 }}>
                    Recent UI Engineering Activity
                  </h3>
                  <button
                    className="portal-btn-secondary"
                    onClick={() => setActiveTab('tickets')}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    View All Tickets
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {requests.slice(0, 5).map((r, i) => (
                    <div
                      key={r._id || i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'rgba(6, 17, 26, 0.75)',
                        border: '1px solid var(--portal-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenTicket(r)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#34D399', fontSize: '0.82rem' }}>{r.ticketId}</span>
                        <span style={{ color: '#F5F5F5', fontWeight: '600', fontSize: '0.88rem' }}>{r.title}</span>
                        <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>· {r.companyId?.name || 'Client'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-pill ${r.status}`}>{r.status.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REQUESTS / TICKETS - DEDICATED TICKET MANAGEMENT */}
          {activeTab === 'tickets' && (
            <div className="portal-card">
              {/* Header & Controls Toolbar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                      All Landing Page Requests & Tickets
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                      Manage, filter, and track all landing page enhancement sprints. Click any row to inspect Jira details, chat with client, and submit deliverables.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Showing {filteredRequests.length} of {requests.length} tickets</span>
                  </div>
                </div>

                {/* Search Bar + Priority Filter */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="Search tickets by ID, sprint title, or client company..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={15} style={{ color: '#94A3B8' }} />
                    <select
                      className="portal-form-select"
                      style={{ width: 'auto', height: '38px', fontSize: '0.85rem', background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }}
                      value={filterPriority}
                      onChange={e => setFilterPriority(e.target.value)}
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  {[
                    { key: 'ALL', label: 'All Tickets', count: requests.length },
                    { key: 'REQUEST_CREATED', label: 'New', count: newRequestsCount },
                    { key: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
                    { key: 'CHANGES_REQUESTED', label: 'Changes Requested', count: changesRequestedCount },
                    { key: 'CLIENT_REVIEW', label: 'Client Review', count: clientReviewCount },
                    { key: 'COMPLETED', label: 'Completed', count: completedCount },
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilterStatus(f.key)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: filterStatus === f.key ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: filterStatus === f.key ? '#34D399' : '#CBD5E1',
                        border: filterStatus === f.key ? '1px solid #34D399' : '1px solid var(--portal-border)',
                      }}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* High-Contrast Jira Table */}
              <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="jira-table">
                  <thead>
                    <tr>
                      <th style={{ width: '110px', color: '#CBD5E1' }}>Ticket ID</th>
                      <th style={{ color: '#CBD5E1' }}>Sprint Title</th>
                      <th style={{ width: '150px', color: '#CBD5E1' }}>Client / Company</th>
                      <th style={{ width: '120px', color: '#CBD5E1' }}>Website URL</th>
                      <th style={{ width: '140px', color: '#CBD5E1' }}>Status</th>
                      <th style={{ width: '100px', color: '#CBD5E1' }}>Priority</th>
                      <th style={{ width: '110px', color: '#CBD5E1' }}>Created Date</th>
                      <th style={{ width: '120px', textAlign: 'right', color: '#CBD5E1' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                          No Landing Page enhancement tickets found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(r)}>
                          <td>
                            <span className="ticket-key" style={{ color: '#34D399', fontWeight: '700' }}>
                              {r.ticketId}
                            </span>
                          </td>
                          <td className="cell-truncate" title={r.title} style={{ fontWeight: '600', color: '#F5F5F5' }}>{r.title}</td>
                          <td style={{ color: '#CBD5E1' }}>{r.companyId?.name || 'Client'}</td>
                          <td>
                            {r.companyId?.website ? (
                              <a 
                                href={r.companyId.website} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ color: '#00D9FF', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Website <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>—</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${r.status}`}>
                              {r.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-pill ${r.priority}`}>{r.priority}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="portal-btn-primary"
                              style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                              onClick={(e) => { e.stopPropagation(); handleOpenTicket(r); }}
                            >
                              Open Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects / Deliveries View */}
          {activeTab === 'projects' && (
            <div className="portal-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#F5F5F5' }}>
                Client Landing Page Modernization Deliveries
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {requests.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', gridColumn: '1 / -1' }}>No project deliveries scheduled.</div>
                ) : (
                  requests.map((r, i) => (
                    <div key={r._id || i} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#34D399' }}>{r.ticketId}</span>
                        <span className={`status-pill ${r.status}`}>{r.status.replace(/_/g, ' ')}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#F5F5F5', margin: '0 0 6px 0' }}>{r.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0 0 12px 0', lineHeight: '1.4' }}>{r.description?.slice(0, 100)}...</p>
                      <button
                        className="portal-btn-secondary"
                        style={{ width: '100%', fontSize: '0.82rem' }}
                        onClick={() => handleOpenTicket(r)}
                      >
                        Inspect UI Specs
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="portal-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#F5F5F5' }}>
                Landing Page UI Architect Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Team Specialist</label>
                  <input className="portal-form-input" style={{ background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }} value={user?.name || 'UI/UX Architect'} readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Operational Email</label>
                  <input className="portal-form-input" style={{ background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }} value="ui@creativegini.com" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Specialization Scope</label>
                  <input className="portal-form-input" style={{ background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }} value="WebGL Architecture, Design Systems & High-Conversion UI" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Active Sprint Pipeline</label>
                  <input className="portal-form-input" style={{ background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }} value={`${requests.length} Active Sprints`} readOnly />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TICKET DETAIL & CHAT MODAL - 2-COLUMN BALANCED LAYOUT */}
      {selectedTicket && (
        <div className="portal-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="portal-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#34D399', fontSize: '1.2rem' }}>
                    {selectedTicket.ticketId}
                  </span>
                  <span className={`status-pill ${selectedTicket.status}`}>
                    {selectedTicket.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`priority-pill ${selectedTicket.priority}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: '4px', marginBottom: 0, color: '#F5F5F5' }}>
                  {selectedTicket.title}
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setSelectedTicket(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              {/* Modal Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '1rem',
                  paddingBottom: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('deliverables')}
                  style={{
                    background: activeTicketModalTab === 'deliverables' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'deliverables' ? '#34D399' : '#94A3B8',
                    border: activeTicketModalTab === 'deliverables' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileCheck size={15} /> Deliverables & Submissions ({ticketSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('requirements')}
                  style={{
                    background: activeTicketModalTab === 'requirements' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'requirements' ? '#34D399' : '#94A3B8',
                    border: activeTicketModalTab === 'requirements' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <TicketCheck size={15} /> Enhancement Scope
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('chat')}
                  style={{
                    background: activeTicketModalTab === 'chat' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'chat' ? '#34D399' : '#94A3B8',
                    border: activeTicketModalTab === 'chat' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquare size={15} /> Jira Conversation ({ticketMessages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('activity')}
                  style={{
                    background: activeTicketModalTab === 'activity' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'activity' ? '#34D399' : '#94A3B8',
                    border: activeTicketModalTab === 'activity' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Activity size={15} /> Activity Timeline
                </button>
              </div>

              {/* TAB 1: DELIVERABLES & WORK SUBMISSION */}
              {activeTicketModalTab === 'deliverables' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Lifecycle Action Banner */}
                  {selectedTicket.status === 'CHANGES_REQUESTED' && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ color: '#FFB000', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={16} /> Client Requested Design Revisions
                        </div>
                        <div style={{ color: '#CBD5E1', fontSize: '0.82rem', marginTop: '4px' }}>
                          Review client feedback below and submit updated deliverables (v{(selectedTicket.currentSubmissionVersion || 1) + 1}).
                        </div>
                      </div>
                      <button
                        type="button"
                        className="portal-btn-primary"
                        onClick={() => setIsSubmissionModalOpen(true)}
                        style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                      >
                        <RotateCcw size={14} /> Submit Revised Work (v{(selectedTicket.currentSubmissionVersion || 1) + 1})
                      </button>
                    </div>
                  )}

                  {(selectedTicket.status === 'ASSIGNED' || selectedTicket.status === 'PAYMENT_COMPLETED') && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ color: '#34D399', fontWeight: '700', fontSize: '0.88rem' }}>
                          Ticket Assigned to You
                        </div>
                        <div style={{ color: '#CBD5E1', fontSize: '0.78rem', marginTop: '2px' }}>
                          Ready to begin UI/UX design and enhancement sprint?
                        </div>
                      </div>
                      <button
                        type="button"
                        className="portal-btn-primary"
                        onClick={handleStartWork}
                        disabled={isUpdatingStatus}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                      >
                        <Clock size={14} /> Start Work (Set IN PROGRESS)
                      </button>
                    </div>
                  )}

                  {selectedTicket.status === 'IN_PROGRESS' && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ color: '#34D399', fontWeight: '700', fontSize: '0.88rem' }}>
                          Enhancement Sprint in Progress
                        </div>
                        <div style={{ color: '#CBD5E1', fontSize: '0.78rem', marginTop: '2px' }}>
                          When design mocks, codebase, or staging links are ready, submit them through the portal for client review.
                        </div>
                      </div>
                      <button
                        type="button"
                        className="portal-btn-primary"
                        onClick={() => setIsSubmissionModalOpen(true)}
                        style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                      >
                        <Upload size={14} /> Submit Work to Client
                      </button>
                    </div>
                  )}

                  {(selectedTicket.status === 'WORK_SUBMITTED' || selectedTicket.status === 'WORK_RESUBMITTED' || selectedTicket.status === 'CLIENT_REVIEW') && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.25)'
                      }}
                    >
                      <div style={{ color: '#34D399', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} /> Deliverables Submitted (v{selectedTicket.currentSubmissionVersion})
                      </div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.8rem', marginTop: '4px' }}>
                        Deliverables have been submitted through the portal. The client has received a review notification. You will be alerted when the client approves or requests changes.
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'COMPLETED' && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.3)'
                      }}
                    >
                      <div style={{ color: '#34D399', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Enhancement Sprint Completed
                      </div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.8rem', marginTop: '4px' }}>
                        Client has approved all landing page deliverables. Ticket finalized.
                      </div>
                    </div>
                  )}

                  {/* Submission History List */}
                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#34D399', margin: '8px 0 10px 0', letterSpacing: '0.04em' }}>
                      Submission History ({ticketSubmissions.length})
                    </h5>
                    {ticketSubmissions.length === 0 ? (
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem', padding: '16px', textAlign: 'center', background: 'rgba(6, 17, 26, 0.75)', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        No deliverables submitted yet.
                      </div>
                    ) : (
                      ticketSubmissions.map((sub) => (
                        <div
                          key={sub._id}
                          style={{
                            background: 'rgba(6, 17, 26, 0.85)',
                            border: '1px solid var(--portal-border)',
                            borderRadius: '8px',
                            padding: '14px',
                            marginBottom: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: '700', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                                  Version v{sub.version}
                                </span>
                                <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#F5F5F5' }}>
                                  {sub.title}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '4px' }}>
                                Submitted by {sub.submittedByName || 'Specialist'} on{' '}
                                {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div>
                              {sub.status === 'APPROVED' && (
                                <span className="status-pill COMPLETED" style={{ fontSize: '0.7rem' }}>Approved</span>
                              )}
                              {sub.status === 'CHANGES_REQUESTED' && (
                                <span className="status-pill CHANGES_REQUESTED" style={{ fontSize: '0.7rem' }}>Changes Requested</span>
                              )}
                              {sub.status === 'PENDING_REVIEW' && (
                                <span className="status-pill CLIENT_REVIEW" style={{ fontSize: '0.7rem' }}>Under Review</span>
                              )}
                            </div>
                          </div>

                          <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.5', margin: '8px 0', background: 'rgba(4, 12, 18, 0.7)', padding: '10px', borderRadius: '6px', border: '1px solid var(--portal-border)' }}>
                            {sub.description}
                          </p>

                          {sub.files && sub.files.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                              {sub.files.map((file, fIdx) => (
                                <div
                                  key={fIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(4, 12, 18, 0.7)',
                                    border: '1px solid var(--portal-border)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={15} color="#34d399" />
                                    <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{file.name}</span>
                                    {file.size && <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({file.size})</span>}
                                  </div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="portal-btn-secondary"
                                    style={{ padding: '3px 8px', fontSize: '0.74rem', textDecoration: 'none' }}
                                  >
                                    View
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {sub.externalLink && (
                            <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                              <span style={{ color: '#CBD5E1' }}>Staging / Figma Link: </span>
                              <a
                                href={sub.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#00D9FF', textDecoration: 'none' }}
                              >
                                {sub.externalLink}
                              </a>
                            </div>
                          )}

                          {sub.notes && (
                            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#CBD5E1' }}>
                              <span style={{ color: '#94A3B8', fontWeight: '600' }}>Design Notes: </span>
                              {sub.notes}
                            </div>
                          )}

                          {sub.review && (
                            <div
                              style={{
                                marginTop: '10px',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                background: sub.review.status === 'APPROVED' ? 'rgba(52, 211, 153, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                border: sub.review.status === 'APPROVED' ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'
                              }}
                            >
                              <div style={{ fontWeight: '700', fontSize: '0.78rem', color: sub.review.status === 'APPROVED' ? '#34D399' : '#FFB000' }}>
                                Client Feedback ({sub.review.reviewerName || 'Client'}):
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '2px' }}>
                                "{sub.review.feedback}"
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: REQUIREMENTS & CLIENT METADATA */}
              {activeTicketModalTab === 'requirements' && (
                <div className="portal-modal-two-col">
                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#34D399', margin: '0 0 6px 0', letterSpacing: '0.04em' }}>
                      Enhancement Scope & Requirements
                    </h5>
                    <p style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', padding: '0.85rem', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                      {selectedTicket.description}
                    </p>
                  </div>
                  <div>
                    <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', padding: '1rem', borderRadius: '10px' }}>
                      <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#34D399', margin: '0 0 10px 0', letterSpacing: '0.04em' }}>
                        Client & Target Site Details
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Company:</span>
                          <div style={{ color: '#F5F5F5', fontWeight: '700' }}>{selectedTicket.companyId?.name || '—'}</div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Contact:</span>
                          <div style={{ color: '#F5F5F5', fontWeight: '600' }}>{selectedTicket.companyId?.contactPerson || '—'}</div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Email:</span>
                          <div><a href={`mailto:${selectedTicket.companyId?.email}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>{selectedTicket.companyId?.email || '—'}</a></div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Target Website:</span>
                          <div>
                            {selectedTicket.companyId?.website ? (
                              <a href={selectedTicket.companyId.website} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', fontWeight: '600', textDecoration: 'none' }}>
                                {selectedTicket.companyId.website}
                              </a>
                            ) : <span style={{ color: '#94A3B8' }}>Not specified</span>}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Sprint Price:</span>
                          <div style={{ color: '#10B981', fontWeight: '700' }}>${selectedTicket.price || 599}.00 (PAID)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: JIRA CHAT CONVERSATION */}
              {activeTicketModalTab === 'chat' && (
                <div>
                  <div className="ticket-chat-container" style={{ height: '280px', overflowY: 'auto' }}>
                    {ticketMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                        No messages recorded yet. Send a design update to the client!
                      </div>
                    ) : (
                      ticketMessages.map((msg) => {
                        const isTeam = msg.senderRole !== 'USER';
                        return (
                          <div
                            key={msg._id}
                            className={`chat-bubble ${isTeam ? 'team' : 'client'}`}
                          >
                            <div className="chat-bubble-sender" style={{ color: isTeam ? '#34d399' : '#00D9FF' }}>
                              {msg.senderName} ({msg.senderRole.replace('_', ' ')})
                            </div>
                            <div>{msg.text}</div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="Send landing page enhancement update to client..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      style={{ background: 'rgba(6, 17, 26, 0.75)', color: '#F5F5F5' }}
                    />
                    <button type="submit" className="portal-btn-primary" style={{ padding: '0 14px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: AUDIT ACTIVITY TIMELINE */}
              {activeTicketModalTab === 'activity' && (
                <div>
                  <ActivityTimeline activity={ticketActivity} />
                </div>
              )}
            </div>

            <div className="portal-modal-footer">
              <button
                className="portal-btn-secondary"
                onClick={() => setSelectedTicket(null)}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORK SUBMISSION MODAL - Strictly rendered only on user demand */}
      {isSubmissionModalOpen && selectedTicket && (
        <WorkSubmissionModal
          isOpen={isSubmissionModalOpen}
          ticket={selectedTicket}
          nextVersion={(selectedTicket?.currentSubmissionVersion || 0) + 1}
          onSubmit={handleSubmitWork}
          onClose={() => setIsSubmissionModalOpen(false)}
          loading={isSubmittingWork}
        />
      )}

    </div>
  );
}
