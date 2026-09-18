import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
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
  TrendingUp,
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
  ExternalLink,
  Search,
  ShieldCheck,
  Users,
  Layers
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import WorkSubmissionModal from '../common/WorkSubmissionModal';
import NotificationPanel from '../common/NotificationPanel';
import ActivityTimeline from '../common/ActivityTimeline';

export default function CompanyBoostDashboard({ user, onLogout }) {
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
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow State: Submissions, Activity, Notifications
  const [ticketSubmissions, setTicketSubmissions] = useState([]);
  const [ticketActivity, setTicketActivity] = useState([]);
  const [activeTicketModalTab, setActiveTicketModalTab] = useState('deliverables');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sidebar Collapse, Mobile Drawer, Profile Dropdown
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_boost_sidebar_collapsed') === 'true';
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
        sessionStorage.setItem('cg_boost_sidebar_collapsed', String(next));
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
      // Enforce strictly COMPANY_BOOST requests only
      const list = Array.isArray(data) ? data : (data?.requests || []);
      setRequests(list.filter(r => r && r.serviceType === 'COMPANY_BOOST'));
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading Company Boost requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenTicket = async (ticket, initialTab) => {
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
      setActiveTicketModalTab(initialTab === 'review' ? 'deliverables' : (initialTab || 'deliverables'));
    } catch (err) {
      setTicketMessages([]);
      setTicketSubmissions([]);
      setTicketActivity([]);
    }
  };

  const handleOpenTicketById = async (ticketId, defaultTab) => {
    let t = requests.find(r => String(r._id) === String(ticketId) || r.ticketId === ticketId);
    if (!t && ticketId) {
      try {
        t = await api.getRequestById(ticketId);
      } catch (e) {}
    }
    if (t) {
      handleOpenTicket(t, defaultTab);
      setIsNotificationsOpen(false);
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

  // Close active modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
        } else if (isSubmissionModalOpen) {
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
  }, [isMobileDrawerOpen, isSubmissionModalOpen, selectedTicket, isNotificationsOpen]);

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
  // - Completed
  const newRequestsCount = requests.filter(r => ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)).length;
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const underReviewCount = requests.filter(r => r.status === 'UNDER_REVIEW').length;
  const changesRequestedCount = requests.filter(r => r.status === 'CHANGES_REQUESTED').length;
  const clientReviewCount = requests.filter(r => ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

  // Tickets requiring active work or urgent revision
  const actionRequiredTickets = requests.filter(r =>
    ['CHANGES_REQUESTED', 'ASSIGNED', 'PAYMENT_COMPLETED', 'IN_PROGRESS'].includes(r.status)
  );

  // Dedicated filtering for Requests & Tickets tab
  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL'
      ? true
      : filterStatus === 'NEW'
      ? ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)
      : filterStatus === 'CLIENT_REVIEW'
      ? ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)
      : r.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || r.priority === filterPriority;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (r.ticketId && r.ticketId.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.companyId?.name && r.companyId.name.toLowerCase().includes(q)) ||
      (r.assignedTeam && r.assignedTeam.toLowerCase().includes(q))
    );
    return matchesStatus && matchesPriority && matchesSearch;
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
            className="portal-mobile-drawer-close"
            onClick={() => setIsMobileDrawerOpen(false)}
            title="Close navigation drawer"
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>
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
          <div className="portal-company-badge" style={{ background: 'rgba(255, 176, 0, 0.08)', borderColor: 'rgba(255, 176, 0, 0.25)' }}>
            <div className="portal-company-badge-label" style={{ color: '#FFB000' }}>Internal Team</div>
            <div className="portal-company-badge-name" style={{ color: '#F5F5F5' }}>
              Company Boost Team
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

          {hasUIAccess && (
            <button
              className="portal-nav-btn"
              onClick={() => navigate('/landing-page-enhancement')}
              title="Switch to Company UI / Landing Page Dashboard"
            >
              <Layers size={18} />
              <span>Company UI</span>
            </button>
          )}

          <div className="portal-nav-section-title" style={{ marginTop: '12px' }}>Workspace</div>

          <button
            className={`portal-nav-btn ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('conversations'); setIsMobileDrawerOpen(false); }}
            title="Ticket Conversations"
          >
            <MessageSquare size={18} />
            <span>Conversations</span>
          </button>

          <button
            className={`portal-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tickets'); setIsMobileDrawerOpen(false); }}
            title="Requests / Tickets"
          >
            <TicketCheck size={18} />
            <span>Requests / Tickets</span>
            <span className="portal-nav-badge" style={{ background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}>{requests.length}</span>
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
            <div className="portal-user-avatar" style={{ background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303', fontWeight: '800' }}>B</div>
            {!isSidebarCollapsed && (
              <div className="portal-user-meta">
                <div className="portal-user-name">{user?.name || 'Growth Strategist'}</div>
                <div className="portal-user-role">boost@creativegini.com</div>
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
              <h2>
                {activeTab === 'dashboard' && 'Company Boost Dashboard'}
                {activeTab === 'conversations' && 'Company Boost Client Conversations'}
                {activeTab === 'tickets' && 'Company Boost Requests & Tickets'}
                {activeTab === 'settings' && 'Company Boost Settings'}
              </h2>
              <p>
                {activeTab === 'dashboard' && 'Overview of assigned work, sprint progress and delivery status.'}
                {activeTab === 'conversations' && 'Persistent direct communication channels with your Company Boost clients.'}
                {activeTab === 'tickets' && 'Manage and track all Company Boost requests and tickets.'}
                {activeTab === 'settings' && 'Team specialist account configuration and operational settings.'}
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
                <div className="portal-profile-chip-avatar" style={{ background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}>
                  B
                </div>
                <span className="portal-profile-chip-name">{user?.name || 'Growth Strategist'}</span>
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </button>
              {isProfileMenuOpen && (
                <div className="portal-topbar-dropdown" style={{ width: '220px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--portal-border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5' }}>{user?.name || 'Growth Strategist'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>boost@creativegini.com</div>
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
          {/* DASHBOARD: OVERVIEW / WORK MANAGEMENT PAGE */}
          {activeTab === 'dashboard' && (
            <>
              {/* 5 KPI / Summary Cards */}
              <div className="portal-metrics-grid cols-5">
                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF' }}>
                    <TicketCheck size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value" style={{ color: '#F5F5F5' }}>{newRequestsCount}</div>
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>New Assignments</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(255, 176, 0, 0.14)', color: '#FFB000' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value" style={{ color: '#F5F5F5' }}>{inProgressCount}</div>
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>In Progress</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                    <RotateCcw size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value" style={{ color: '#F5F5F5' }}>{changesRequestedCount}</div>
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>Changes Requested</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value" style={{ color: '#F5F5F5' }}>{clientReviewCount}</div>
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>Client Review</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value" style={{ color: '#F5F5F5' }}>{completedCount}</div>
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>Completed</div>
                  </div>
                </div>
              </div>

              {/* Work Management Board: 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Left Column: Action Required & My Active Sprints */}
                <div className="portal-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                        Action Required & Active Sprints
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                        What do I need to work on right now? Priority tasks awaiting development or revisions.
                      </p>
                    </div>
                    <span style={{ 
                      background: 'rgba(255, 176, 0, 0.15)', 
                      color: '#FFB000', 
                      border: '1px solid rgba(255, 176, 0, 0.3)',
                      borderRadius: '20px', 
                      padding: '3px 12px', 
                      fontSize: '0.78rem', 
                      fontWeight: '700' 
                    }}>
                      {actionRequiredTickets.length} Priority
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {actionRequiredTickets.length === 0 ? (
                      <div style={{ 
                        padding: '36px 16px', 
                        textAlign: 'center', 
                        background: 'rgba(4, 12, 18, 0.6)', 
                        borderRadius: '10px', 
                        border: '1px dashed var(--portal-border)' 
                      }}>
                        <CheckCircle2 size={32} color="#34D399" style={{ margin: '0 auto 8px' }} />
                        <div style={{ color: '#F5F5F5', fontWeight: '600', fontSize: '0.95rem' }}>All active assignments are current</div>
                        <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '4px' }}>No pending revisions or unassigned sprints in queue.</div>
                      </div>
                    ) : (
                      actionRequiredTickets.map(ticket => (
                        <div 
                          key={ticket._id}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            background: 'rgba(4, 12, 18, 0.85)',
                            border: ticket.status === 'CHANGES_REQUESTED' 
                              ? '1px solid rgba(245, 158, 11, 0.4)' 
                              : '1px solid var(--portal-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#FFB000', fontSize: '0.85rem' }}>
                                {ticket.ticketId}
                              </span>
                              <span className={`status-pill ${ticket.status}`}>
                                {ticket.status.replace(/_/g, ' ')}
                              </span>
                              <span className={`priority-pill ${ticket.priority}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ticket.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '4px', display: 'flex', gap: '12px' }}>
                              <span>Client: <strong style={{ color: '#00D9FF' }}>{ticket.companyId?.name || 'Client'}</strong></span>
                              <span style={{ color: '#94A3B8' }}>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="portal-btn-primary"
                            onClick={() => handleOpenTicket(ticket)}
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.82rem', 
                              fontWeight: '700', 
                              background: ticket.status === 'CHANGES_REQUESTED'
                                ? 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', 
                              color: '#030303',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ticket.status === 'CHANGES_REQUESTED' ? 'View Feedback & Revise' : 'Open Ticket'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Growth Operations & Stage Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Stage-by-Stage Breakdown */}
                  <div className="portal-card" style={{ marginBottom: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 14px 0', color: '#F5F5F5' }}>
                      Sprint Pipeline Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'New Assignments', count: newRequestsCount, color: '#00D9FF' },
                        { label: 'In Progress', count: inProgressCount, color: '#FFB000' },
                        { label: 'Awaiting Submission / Review', count: underReviewCount, color: '#c084fc' },
                        { label: 'Changes Requested', count: changesRequestedCount, color: '#F59E0B' },
                        { label: 'Submitted for Client Review', count: clientReviewCount, color: '#fbbf24' },
                        { label: 'Completed Deliverables', count: completedCount, color: '#34D399' }
                      ].map((stage, idx) => {
                        const pct = requests.length > 0 ? Math.round((stage.count / requests.length) * 100) : 0;
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                              <span style={{ color: '#CBD5E1' }}>{stage.label}</span>
                              <span style={{ fontWeight: '700', color: '#F5F5F5' }}>{stage.count} <span style={{ color: '#94A3B8', fontWeight: 'normal' }}>({pct}%)</span></span>
                            </div>
                            <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: stage.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Summary Card */}
                  <div className="portal-card" style={{ marginBottom: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 10px 0', color: '#F5F5F5' }}>
                      Specialist Operational Info
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Growth Strategist:</span>
                        <span style={{ color: '#F5F5F5', fontWeight: '600' }}>{user?.name || 'Team Specialist'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Team Dispatch:</span>
                        <span style={{ color: '#00D9FF', fontWeight: '600' }}>boost@creativegini.com</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Turnaround SLA:</span>
                        <span style={{ color: '#34D399', fontWeight: '600' }}>24 - 48 Hours Target</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      onClick={() => setActiveTab('tickets')}
                      style={{ width: '100%', marginTop: '16px', fontSize: '0.82rem', justifyContent: 'center' }}
                    >
                      Manage All Tickets & Requests →
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                      Recent Operations Activity
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                      Latest lifecycle updates, submissions and client review changes.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="portal-btn-secondary" 
                    onClick={() => setActiveTab('tickets')}
                    style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  >
                    View All Tickets
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requests.slice(0, 5).map(r => (
                    <div
                      key={r._id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'rgba(4, 12, 18, 0.75)',
                        border: '1px solid var(--portal-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenTicket(r)}
                      title="Click to view ticket details"
                    >
                      <div>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#FFB000', marginRight: '10px' }}>{r.ticketId}</span>
                        <span style={{ color: '#F5F5F5', fontWeight: '600' }}>{r.title}</span>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                          Client: {r.companyId?.name || 'Client'} · Created {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`status-pill ${r.status}`}>{r.status.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TICKETS: DEDICATED TICKET MANAGEMENT PAGE */}
          {activeTab === 'tickets' && (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                    Company Boost Ticket Management
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                    Which tickets exist and what is their current state? Filter, inspect scope and execute sprint deliverables.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Total:</span>
                  <span style={{ background: 'rgba(255, 176, 0, 0.15)', color: '#FFB000', padding: '2px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '0.82rem' }}>
                    {requests.length} Sprints
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ 
                background: 'rgba(4, 12, 18, 0.85)', 
                border: '1px solid var(--portal-border)', 
                borderRadius: '10px', 
                padding: '14px 16px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                {/* Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px', maxWidth: '380px', position: 'relative' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    className="portal-form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                    placeholder="Search by Ticket ID, Title, Client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { id: 'ALL', label: `All (${requests.length})` },
                    { id: 'NEW', label: `New (${newRequestsCount})` },
                    { id: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
                    { id: 'CHANGES_REQUESTED', label: `Revisions (${changesRequestedCount})` },
                    { id: 'CLIENT_REVIEW', label: `Client Review (${clientReviewCount})` },
                    { id: 'COMPLETED', label: `Completed (${completedCount})` }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setFilterStatus(pill.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: filterStatus === pill.id ? 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)' : 'rgba(255, 255, 255, 0.05)',
                        color: filterStatus === pill.id ? '#030303' : '#CBD5E1',
                        border: filterStatus === pill.id ? '1px solid #FFB000' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Priority Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Priority:</span>
                  <select
                    className="portal-form-select"
                    style={{ width: 'auto', height: '38px', fontSize: '0.82rem', padding: '0 28px 0 10px' }}
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* Jira Table */}
              <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="jira-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Ticket ID</th>
                      <th>Request Title</th>
                      <th style={{ width: '160px' }}>Client / Company</th>
                      <th style={{ width: '140px' }}>Status</th>
                      <th style={{ width: '100px' }}>Priority</th>
                      <th style={{ width: '150px' }}>Assigned Person</th>
                      <th style={{ width: '110px' }}>Created Date</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                          No Company Boost tickets match your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(r)}>
                          <td>
                            <span className="ticket-key" style={{ color: '#FFB000', fontWeight: '700' }}>
                              {r.ticketId}
                            </span>
                          </td>
                          <td className="cell-truncate" title={r.title} style={{ fontWeight: '600', color: '#F5F5F5' }}>
                            {r.title}
                          </td>
                          <td style={{ color: '#CBD5E1' }}>
                            {r.companyId?.name || 'Client'}
                          </td>
                          <td>
                            <span className={`status-pill ${r.status}`}>
                              {r.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-pill ${r.priority}`}>{r.priority}</span>
                          </td>
                          <td style={{ color: '#CBD5E1' }}>
                            {r.assignedTeam || 'Company Boost Team'}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="portal-btn-primary"
                              style={{ 
                                padding: '5px 14px', 
                                fontSize: '0.8rem', 
                                background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', 
                                color: '#030303', 
                                fontWeight: '700' 
                              }}
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

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="portal-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#F5F5F5' }}>
                Company Boost Growth Strategist Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Team Specialist</label>
                  <input className="portal-form-input" value={user?.name || 'Growth Strategist'} readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Operational Email</label>
                  <input className="portal-form-input" value="boost@creativegini.com" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Specialization Scope</label>
                  <input className="portal-form-input" value="Autonomous Outbound Sequencing & Positioning Playbooks" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Active Sprint Pipeline</label>
                  <input className="portal-form-input" value={`${requests.length} Active Sprints`} readOnly />
                </div>
              </div>
            </div>
          )}

          {/* Conversations View (Ticket-Specific Conversations for Company Boost) */}
          {activeTab === 'conversations' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
                  Company Boost Ticket Conversations
                </h2>
                <p style={{ color: '#8fa0b5', margin: 0, fontSize: '0.88rem' }}>
                  Isolated Jira conversation channels for your Company Boost tickets. Select any ticket to communicate directly with the client.
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="portal-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#8fa0b5' }}>
                  <MessageSquare size={36} color="#FFB000" style={{ opacity: 0.5, margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 6px 0' }}>No Active Tickets</h4>
                  <p style={{ fontSize: '0.84rem', maxWidth: '400px', margin: '0 auto' }}>
                    When Company Boost tickets are assigned to you, their conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th style={{ width: '120px' }}>Ticket ID</th>
                        <th>Ticket Title</th>
                        <th style={{ width: '180px' }}>Client / Company</th>
                        <th style={{ width: '140px' }}>Status</th>
                        <th style={{ width: '120px' }}>Priority</th>
                        <th style={{ width: '180px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(r, 'chat')}>
                          <td>
                            <span className="ticket-key" style={{ color: '#FFB000', fontWeight: '700' }}>
                              {r.ticketId}
                            </span>
                          </td>
                          <td className="cell-truncate" title={r.title} style={{ fontWeight: '600', color: '#F5F5F5' }}>
                            {r.title}
                          </td>
                          <td style={{ color: '#CBD5E1' }}>
                            {r.companyId?.name || r.userId?.name || 'Client'}
                          </td>
                          <td>
                            <span className={`status-pill ${r.status}`}>
                              {r.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-pill ${r.priority}`}>{r.priority}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="portal-btn-primary"
                              style={{
                                padding: '5px 14px',
                                fontSize: '0.8rem',
                                background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)',
                                color: '#030303',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTicket(r, 'chat');
                              }}
                            >
                              <MessageSquare size={13} /> Open Jira Conversation
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <div className="portal-modal-header-badges">
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#FFB000', fontSize: '1.2rem' }}>
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
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '1rem',
                  paddingBottom: '8px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('deliverables')}
                  style={{
                    background: activeTicketModalTab === 'deliverables' ? 'rgba(255, 176, 0, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'deliverables' ? '#FFB000' : '#94A3B8',
                    border: activeTicketModalTab === 'deliverables' ? '1px solid rgba(255, 176, 0, 0.4)' : '1px solid transparent',
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
                    background: activeTicketModalTab === 'requirements' ? 'rgba(255, 176, 0, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'requirements' ? '#FFB000' : '#94A3B8',
                    border: activeTicketModalTab === 'requirements' ? '1px solid rgba(255, 176, 0, 0.4)' : '1px solid transparent',
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
                  <TicketCheck size={15} /> Growth Scope
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('chat')}
                  style={{
                    background: activeTicketModalTab === 'chat' ? 'rgba(255, 176, 0, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'chat' ? '#FFB000' : '#94A3B8',
                    border: activeTicketModalTab === 'chat' ? '1px solid rgba(255, 176, 0, 0.4)' : '1px solid transparent',
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
                    background: activeTicketModalTab === 'activity' ? 'rgba(255, 176, 0, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'activity' ? '#FFB000' : '#94A3B8',
                    border: activeTicketModalTab === 'activity' ? '1px solid rgba(255, 176, 0, 0.4)' : '1px solid transparent',
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
                        padding: '16px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        marginBottom: '4px'
                      }}
                    >
                      <div style={{ color: '#F59E0B', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={16} /> Changes Requested
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.84rem', color: '#CBD5E1', background: 'rgba(8, 20, 32, 0.95)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <strong style={{ color: '#FFB000' }}>Client Feedback: </strong>
                        "{ticketSubmissions[0]?.review?.feedback || ticketSubmissions[ticketSubmissions.length - 1]?.review?.feedback || 'Please update the deliverables according to client specifications.'}"
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="portal-btn-primary"
                          onClick={() => setIsSubmissionModalOpen(true)}
                          style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}
                        >
                          <Upload size={14} /> Submit Completed Work
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedTicket.status === 'ASSIGNED' || selectedTicket.status === 'PAYMENT_COMPLETED') && (
                    <div
                      className="portal-ticket-action-banner"
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 176, 0, 0.08)',
                        border: '1px solid rgba(255, 176, 0, 0.25)'
                      }}
                    >
                      <div>
                        <div style={{ color: '#FFB000', fontWeight: '700', fontSize: '0.88rem' }}>
                          Ticket Assigned to You
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '2px' }}>
                          Ready to begin growth strategy sprint?
                        </div>
                      </div>
                      <div className="portal-ticket-action-buttons">
                        <button
                          type="button"
                          className="portal-btn-primary"
                          onClick={handleStartWork}
                          disabled={isUpdatingStatus}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}
                        >
                          <Clock size={14} /> Start Work (Set IN PROGRESS)
                        </button>
                        <button
                          type="button"
                          className="portal-btn-secondary"
                          onClick={() => setIsSubmissionModalOpen(true)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: 'rgba(255, 176, 0, 0.35)', color: '#FFB000' }}
                        >
                          <Upload size={14} /> Submit Completed Work
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'IN_PROGRESS' && (
                    <div
                      className="portal-ticket-action-banner"
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(0, 217, 255, 0.08)',
                        border: '1px solid rgba(0, 217, 255, 0.25)'
                      }}
                    >
                      <div>
                        <div style={{ color: '#00D9FF', fontWeight: '700', fontSize: '0.88rem' }}>
                          Sprint In Progress
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '2px' }}>
                          Deliverables underway by Growth & Boost Specialist
                        </div>
                      </div>
                      <div className="portal-ticket-action-buttons">
                        <button
                          type="button"
                          className="portal-btn-primary"
                          onClick={() => setIsSubmissionModalOpen(true)}
                          style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}
                        >
                          <Upload size={14} /> Submit Completed Work
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedTicket.status === 'WORK_SUBMITTED' || selectedTicket.status === 'WORK_RESUBMITTED' || selectedTicket.status === 'CLIENT_REVIEW') && (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 176, 0, 0.08)',
                        border: '1px solid rgba(255, 176, 0, 0.25)'
                      }}
                    >
                      <div style={{ color: '#FFB000', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} /> Deliverables Submitted (v{selectedTicket.currentSubmissionVersion})
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px' }}>
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
                        <CheckCircle2 size={16} /> Growth Sprint Completed
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '4px' }}>
                        Client has approved all growth deliverables. Ticket finalized.
                      </div>
                    </div>
                  )}

                  {/* Submission History List */}
                  <div>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#FFB000', margin: '8px 0 10px 0', letterSpacing: '0.04em' }}>
                      Submission History ({ticketSubmissions.length})
                    </h5>
                    {ticketSubmissions.length === 0 ? (
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem', padding: '16px', textAlign: 'center', background: 'rgba(4, 12, 18, 0.8)', borderRadius: '8px', border: '1px dashed var(--portal-border)' }}>
                        No deliverables submitted yet.
                      </div>
                    ) : (
                      ticketSubmissions.map((sub) => (
                        <div
                          key={sub._id}
                          style={{
                            background: 'rgba(4, 12, 18, 0.85)',
                            border: '1px solid var(--portal-border)',
                            borderRadius: '8px',
                            padding: '14px',
                            marginBottom: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: 'rgba(255, 176, 0, 0.15)', color: '#FFB000', fontWeight: '700', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
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

                          <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.5', margin: '8px 0', background: 'rgba(8, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '6px' }}>
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
                                    background: 'rgba(10, 24, 38, 0.85)',
                                    border: '1px solid rgba(0, 217, 255, 0.15)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={15} color="#FFB000" />
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
                              <span style={{ color: '#94A3B8' }}>External Assets: </span>
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
                            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#94A3B8' }}>
                              <span style={{ color: '#CBD5E1', fontWeight: '600' }}>Internal Notes: </span>
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
                              <div style={{ fontWeight: '700', fontSize: '0.78rem', color: sub.review.status === 'APPROVED' ? '#34d399' : '#FFB000' }}>
                                Client Feedback ({sub.review.reviewerName || 'Client'}):
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#F5F5F5', marginTop: '2px' }}>
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
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#FFB000', margin: '0 0 6px 0', letterSpacing: '0.04em' }}>
                      Boost Requirement Scope
                    </h5>
                    <p style={{ background: 'rgba(4, 12, 18, 0.85)', border: '1px solid var(--portal-border)', padding: '0.85rem', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                      {selectedTicket.description}
                    </p>
                  </div>
                  <div>
                    <div style={{ background: 'rgba(4, 12, 18, 0.85)', border: '1px solid var(--portal-border)', padding: '1rem', borderRadius: '10px' }}>
                      <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#FFB000', margin: '0 0 10px 0', letterSpacing: '0.04em' }}>
                        Client & Company Details
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: '#94A3B8' }}>Company:</span>
                          <div style={{ color: '#00D9FF', fontWeight: '700' }}>{selectedTicket.companyId?.name || '—'}</div>
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
                          <span style={{ color: '#94A3B8' }}>Sprint Price:</span>
                          <div style={{ color: '#34D399', fontWeight: '700' }}>${selectedTicket.price || 799}.00 (PAID)</div>
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
                        No messages recorded yet. Send a growth update to the client!
                      </div>
                    ) : (
                      ticketMessages.map((msg) => {
                        const isTeam = msg.senderRole !== 'USER';
                        return (
                          <div
                            key={msg._id}
                            className={`chat-bubble ${isTeam ? 'team' : 'client'}`}
                          >
                            <div className="chat-bubble-sender" style={{ color: isTeam ? '#FFB000' : '#00D9FF' }}>
                              {msg.senderName} ({msg.senderRole.replace('_', ' ')})
                            </div>
                            <div>{msg.text}</div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="ticket-chat-form">
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="Send growth sprint update to client..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />
                    <button type="submit" className="portal-btn-primary" style={{ padding: '0 14px', background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}>
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
