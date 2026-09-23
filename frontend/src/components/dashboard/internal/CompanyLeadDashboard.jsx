import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
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
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Search,
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
  FileCheck,
  FileText,
  UserCheck,
  TrendingUp,
  Layers
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import WorkSubmissionModal from '../common/WorkSubmissionModal';
import NotificationPanel from '../common/NotificationPanel';
import ActivityTimeline from '../common/ActivityTimeline';

export default function CompanyLeadDashboard({ user, onLogout }) {
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
  const [isProgressUpdate, setIsProgressUpdate] = useState(false);
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
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  // Sidebar Collapse, Mobile Drawer, Profile Dropdown
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_lead_sidebar_collapsed') === 'true';
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
        sessionStorage.setItem('cg_lead_sidebar_collapsed', String(next));
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
      // Enforce only COMPANY_LEAD requests
      const list = Array.isArray(data) ? data : (data?.requests || []);
      setRequests(list.filter(r => r && r.serviceType === 'COMPANY_LEAD'));
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading Company Lead requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, isSubmissionModalOpen, selectedTicket, isNotificationsOpen]);

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

  // Open ticket directly from URL query parameter (e.g. /company-lead?ticket=CG-1001)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket');
    const tabParam = params.get('tab');
    if (ticketParam) {
      handleOpenTicketById(ticketParam, tabParam || undefined);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [requests.length]);

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
      const newMsg = await api.sendMessage(selectedTicket._id, newMessageText, isProgressUpdate);
      setTicketMessages(prev => [...prev, newMsg]);
      setNewMessageText('');
      setIsProgressUpdate(false);
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

  // Priority queue for lead intelligence operations
  const actionRequiredTickets = requests.filter(r =>
    ['CHANGES_REQUESTED', 'ASSIGNED', 'PAYMENT_COMPLETED', 'IN_PROGRESS'].includes(r.status)
  );

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
            <img src="/logo.png" alt="CreativeGini" className="portal-sidebar-logo portal-sidebar-logo-full" />
            <img src="/logo-icon.png" alt="CreativeGini" className="portal-sidebar-logo portal-sidebar-logo-icon" />
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
          <div className="portal-company-badge" style={{ background: 'rgba(0, 217, 255, 0.08)', borderColor: 'rgba(0, 217, 255, 0.25)' }}>
            <div className="portal-company-badge-label" style={{ color: '#00D9FF' }}>Internal Team</div>
            <div className="portal-company-badge-name" style={{ color: '#F5F5F5' }}>
              Company Lead Team
            </div>
          </div>
        )}

        <nav className="portal-sidebar-nav">
          <div className="portal-nav-section-title">Navigation & Dashboards</div>
          
          <button
            className={`portal-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
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
            onClick={() => { setActiveTab('conversations'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
            title="Ticket Conversations"
          >
            <MessageSquare size={18} />
            <span>Conversations</span>
          </button>

          <button
            className={`portal-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
            title="Requests / Tickets"
          >
            <TicketCheck size={18} />
            <span>Requests / Tickets</span>
            <span className="portal-nav-badge">{requests.length}</span>
          </button>

          <button
            className={`portal-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
            title="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="portal-sidebar-footer">
          <div className="portal-user-chip">
            <div className="portal-user-avatar" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #00AEEF 100%)', color: '#030303', fontWeight: '800' }}>L</div>
            {!isSidebarCollapsed && (
              <div className="portal-user-meta">
                <div className="portal-user-name">{user?.name || 'Company Lead Specialist'}</div>
                <div className="portal-user-role">lead@creativegini.com</div>
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
                {selectedTicket ? `Ticket ${selectedTicket.ticketId}: ${selectedTicket.title}` : (
                  <>
                    {activeTab === 'dashboard' && 'Company Lead Dashboard'}
                    {activeTab === 'conversations' && 'Company Lead Client Conversations'}
                    {activeTab === 'tickets' && 'Company Lead Requests & Tickets'}
                    {activeTab === 'settings' && 'Company Lead Settings'}
                  </>
                )}
              </h2>
              <p>
                {selectedTicket
                  ? `Status: ${selectedTicket.status.replace(/_/g, ' ')} • Priority: ${selectedTicket.priority} • Service: ${selectedTicket.serviceType ? selectedTicket.serviceType.replace(/_/g, ' ') : 'General'}`
                  : (
                    <>
                      {activeTab === 'dashboard' && 'Overview of prospect intelligence pipelines, lead research progress and delivery status.'}
                      {activeTab === 'conversations' && 'Persistent direct communication channels with your Company Lead clients.'}
                      {activeTab === 'tickets' && 'Manage and track all Company Lead requests and tickets.'}
                      {activeTab === 'settings' && 'Data provider configurations, compliance standards and team specifications.'}
                    </>
                  )}
              </p>
            </div>
          </div>

          <div className="portal-topbar-actions">
            {/* Notifications Button & Dropdown */}
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadNotifCount}
              isOpen={isNotificationsOpen}
              onToggle={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileMenuOpen(false);
              }}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
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
                <div className="portal-profile-chip-avatar" style={{ background: 'linear-gradient(135deg, #2563EB, #00AEEF)' }}>
                  L
                </div>
                <span className="portal-profile-chip-name">{user?.name || 'Lead Specialist'}</span>
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </button>
              {isProfileMenuOpen && (
                <div className="portal-topbar-dropdown" style={{ width: '220px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--portal-border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5' }}>{user?.name || 'Lead Specialist'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>lead@creativegini.com</div>
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
          {selectedTicket ? (
            <div className="portal-ticket-detail-view">
              <div className="portal-ticket-breadcrumb">
                <button
                  type="button"
                  className="portal-breadcrumb-back-btn"
                  onClick={() => setSelectedTicket(null)}
                >
                  <ChevronLeft size={16} />
                  <span>Back to {activeTab === 'tickets' ? 'Tickets' : 'Dashboard'}</span>
                </button>
                <div className="portal-breadcrumb-trail">
                  <span>Company Lead</span>
                  <span className="portal-breadcrumb-sep">/</span>
                  <span>{selectedTicket.serviceType ? selectedTicket.serviceType.replace(/_/g, ' ') : 'Tickets'}</span>
                  <span className="portal-breadcrumb-sep">/</span>
                  <span className="portal-breadcrumb-current">{selectedTicket.ticketId}</span>
                </div>
              </div>

              <div className="portal-ticket-detail-card">
                <div className="portal-modal-header portal-ticket-header">
                  <div>
                    <div className="portal-modal-header-badges">
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#00D9FF', fontSize: '1.2rem' }}>
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
                    type="button"
                    className="portal-btn-secondary"
                    style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    onClick={() => setSelectedTicket(null)}
                  >
                    <X size={16} />
                    <span>Close</span>
                  </button>
                </div>

                {/* Modal Tab Bar */}
                <div className="portal-modal-tab-bar">
                  <button
                    type="button"
                    className={`portal-modal-tab-btn ${activeTicketModalTab === 'deliverables' ? 'active' : ''}`}
                    onClick={() => setActiveTicketModalTab('deliverables')}
                  >
                    <FileCheck size={15} />
                    <span>Deliverables & Submissions</span>
                    {ticketSubmissions.length > 0 && (
                      <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        v{selectedTicket.currentSubmissionVersion || ticketSubmissions.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`portal-modal-tab-btn ${activeTicketModalTab === 'scope' ? 'active' : ''}`}
                    onClick={() => setActiveTicketModalTab('scope')}
                  >
                    <FileText size={15} />
                    <span>Scope & Requirements</span>
                  </button>
                  <button
                    type="button"
                    className={`portal-modal-tab-btn ${activeTicketModalTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTicketModalTab('chat')}
                  >
                    <MessageSquare size={15} />
                    <span>Request Conversation</span>
                    {ticketMessages.length > 0 && (
                      <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#CBD5E1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        {ticketMessages.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`portal-modal-tab-btn ${activeTicketModalTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTicketModalTab('activity')}
                  >
                    <Clock size={15} />
                    <span>Activity Timeline</span>
                    {ticketActivity.length > 0 && (
                      <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#CBD5E1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                        {ticketActivity.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="portal-modal-body">
                  <div className="portal-modal-two-col">
                    {/* Left Column: Switchable Views */}
                    <div>
                      {/* TAB 1: Deliverables & Submissions */}
                      {activeTicketModalTab === 'deliverables' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: 0, letterSpacing: '0.04em' }}>
                              Submitted Work & Deliverables
                            </h5>
                            {selectedTicket.status !== 'COMPLETED' && (
                              <button
                                type="button"
                                className="portal-btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                onClick={() => setIsSubmissionModalOpen(true)}
                              >
                                <Upload size={13} />
                                <span>Submit Deliverables</span>
                              </button>
                            )}
                          </div>

                          {ticketSubmissions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2.5rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                              <FileCheck size={32} style={{ color: '#00D9FF', margin: '0 auto 8px', opacity: 0.5 }} />
                              <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem' }}>No deliverables have been submitted yet.</p>
                              {selectedTicket.status !== 'COMPLETED' && (
                                <button
                                  type="button"
                                  className="portal-btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                  onClick={() => setIsSubmissionModalOpen(true)}
                                >
                                  <Upload size={14} />
                                  <span>Submit Version 1 Deliverables</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {ticketSubmissions.map((sub) => (
                                <div
                                  key={sub._id}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    padding: '14px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: '800', color: '#00D9FF', fontSize: '0.95rem' }}>
                                        v{sub.version}
                                      </span>
                                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#F5F5F5' }}>
                                        {sub.title}
                                      </span>
                                    </div>
                                    <span className={`status-pill ${sub.status}`}>
                                      {sub.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>

                                  <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                                    {sub.notes}
                                  </p>

                                  {sub.files && sub.files.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                      {sub.files.map((file, fIdx) => (
                                        <div
                                          key={fIdx}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '6px 10px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '6px',
                                            fontSize: '0.82rem'
                                          }}
                                        >
                                          <span style={{ color: '#F5F5F5' }}>{file.name}</span>
                                          <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="portal-btn-secondary"
                                            style={{ padding: '2px 8px', fontSize: '0.72rem', textDecoration: 'none' }}
                                          >
                                            Download
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {sub.review && (
                                    <div
                                      style={{
                                        background: sub.review.status === 'APPROVED' ? 'rgba(52, 211, 153, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                        border: sub.review.status === 'APPROVED' ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        marginTop: '8px'
                                      }}
                                    >
                                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: sub.review.status === 'APPROVED' ? '#34D399' : '#FFB000', marginBottom: '4px' }}>
                                        Client Feedback ({sub.review.reviewerName || 'Client'}):
                                      </div>
                                      <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                                        "{sub.review.feedback}"
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: Scope & Requirements */}
                      {activeTicketModalTab === 'scope' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
                              Client Requirement Description
                            </h5>
                            <p style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                              {selectedTicket.description}
                            </p>
                          </div>

                          {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                            <div>
                              <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
                                Attached Reference Documents
                              </h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {selectedTicket.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      background: 'rgba(255, 255, 255, 0.03)',
                                      border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                  >
                                    <span style={{ fontSize: '0.84rem', color: '#FFFFFF' }}>{att.name}</span>
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="portal-btn-secondary"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                                    >
                                      Download
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: Request Conversation */}
                      {activeTicketModalTab === 'chat' && (
                        <div>
                          <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                            <MessageSquare size={14} /> Request Conversation Stream
                          </h5>

                          <div className="ticket-chat-container" style={{ height: '300px', overflowY: 'auto' }}>
                            {ticketMessages.length === 0 ? (
                              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                                No messages yet in this ticket. Send a note to the client below!
                              </div>
                            ) : (
                              ticketMessages.map((msg) => {
                                const isClient = msg.senderRole === 'USER';
                                return (
                                  <div
                                    key={msg._id}
                                    className={`chat-bubble ${isClient ? 'client' : 'team'}`}
                                  >
                                    <div className="chat-bubble-sender" style={{ color: isClient ? '#FFB000' : '#00D9FF' }}>
                                      {msg.senderName} ({msg.senderRole.replace('_', ' ')})
                                    </div>
                                    <div>{msg.text}</div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <form onSubmit={handleSendMessage} className="ticket-chat-form" style={{ flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                              <input
                                type="text"
                                className="portal-form-input"
                                placeholder="Type an update or question for the client..."
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                              />
                              <button
                                type="submit"
                                className="portal-btn-primary"
                                style={{ padding: '0 16px' }}
                                disabled={!newMessageText.trim()}
                              >
                                <Send size={16} />
                              </button>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', cursor: 'pointer', userSelect: 'none' }}>
                              <input
                                type="checkbox"
                                checked={isProgressUpdate}
                                onChange={(e) => setIsProgressUpdate(e.target.checked)}
                                style={{ accentColor: '#10B981', cursor: 'pointer' }}
                              />
                              <span>Send as Progress Update (notifies client via email)</span>
                            </label>
                          </form>
                        </div>
                      )}

                      {/* TAB 4: Activity Timeline */}
                      {activeTicketModalTab === 'activity' && (
                        <div>
                          <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 12px 0', letterSpacing: '0.04em' }}>
                            Lifecycle Activity & Audit Timeline
                          </h5>
                          <ActivityTimeline logs={ticketActivity} />
                        </div>
                      )}
                    </div>

                    {/* Right Column: Ticket Specifications & Actions */}
                    <div>
                      <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', padding: '1.25rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 12px 0', letterSpacing: '0.04em' }}>
                            Ticket Specifications
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Client Company</span>
                              <div style={{ color: '#F5F5F5', fontWeight: '700' }}>{selectedTicket.companyId?.name || '—'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Specialist</span>
                              <div style={{ color: '#F5F5F5', fontWeight: '600' }}>
                                {selectedTicket.assignedTo?.name || 'Unassigned'}
                              </div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Due Date</span>
                              <div style={{ color: '#CBD5E1' }}>
                                {selectedTicket.dueDate
                                  ? new Date(selectedTicket.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                  : 'Active Delivery Sprint'}
                              </div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Service Category</span>
                              <div style={{ color: '#00D9FF', fontWeight: '600' }}>{selectedTicket.serviceType ? selectedTicket.serviceType.replace(/_/g, ' ') : 'General'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Payment Status</span>
                              <div style={{ fontWeight: '700', color: selectedTicket.paymentStatus === 'PAID' ? '#34d399' : '#f59e0b' }}>
                                {selectedTicket.paymentStatus} (${selectedTicket.price}.00 USD)
                              </div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Created Date</span>
                              <div style={{ color: '#CBD5E1' }}>
                                {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Workflow Actions */}
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h6 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', margin: 0, letterSpacing: '0.04em' }}>
                            Workflow Actions
                          </h6>
                          {(selectedTicket.status === 'CREATED' || selectedTicket.status === 'PAID' || selectedTicket.status === 'ASSIGNED') && (
                            <button
                              type="button"
                              className="portal-btn-primary"
                              onClick={handleStartWork}
                              disabled={startingWork}
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <RotateCcw size={14} />
                              <span>{startingWork ? 'Starting...' : 'Start Work (In Progress)'}</span>
                            </button>
                          )}
                          {(selectedTicket.status === 'IN_PROGRESS' || selectedTicket.status === 'CHANGES_REQUESTED' || selectedTicket.status === 'CLIENT_REVIEW') && (
                            <button
                              type="button"
                              className="portal-btn-primary"
                              onClick={() => setIsSubmissionModalOpen(true)}
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <Upload size={14} />
                              <span>Submit Deliverables</span>
                            </button>
                          )}
                        </div>

                        {/* Client Info */}
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                          <h6 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
                            Client Info
                          </h6>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Contact:</span>
                              <div style={{ color: '#F5F5F5' }}>{selectedTicket.userId?.name || '—'}</div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Email:</span>
                              <div><a href={`mailto:${selectedTicket.companyId?.email}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>{selectedTicket.companyId?.email || '—'}</a></div>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>NDA Protection:</span>
                              <div style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}>
                                <ShieldCheck size={14} /> Enterprise NDA Verified
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
          ) : (
            <>
              {/* DASHBOARD: OPERATIONAL OVERVIEW / WORK MANAGEMENT PAGE */}
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
                    <div className="portal-metric-label" style={{ color: '#94A3B8' }}>Researching</div>
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
                    <Users size={24} />
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
                {/* Left Column: Active Prospecting & Research Queue */}
                <div className="portal-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                        Active Prospecting & Research Queue
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                        What do I need to work on right now? Lead intelligence requests needing data verification or review.
                      </p>
                    </div>
                    <span style={{ 
                      background: 'rgba(0, 217, 255, 0.12)', 
                      color: '#00D9FF', 
                      border: '1px solid rgba(0, 217, 255, 0.3)',
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
                        <div style={{ color: '#F5F5F5', fontWeight: '600', fontSize: '0.95rem' }}>All prospecting assignments are current</div>
                        <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '4px' }}>No pending lead research revisions or unassigned requests.</div>
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
                              <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#00D9FF', fontSize: '0.85rem' }}>
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
                                : 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)', 
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

                {/* Right Column: Pipeline Health & Specialist Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Stage-by-Stage Breakdown */}
                  <div className="portal-card" style={{ marginBottom: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 14px 0', color: '#F5F5F5' }}>
                      Prospect Intelligence Pipeline Health
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'New Assignments', count: newRequestsCount, color: '#00D9FF' },
                        { label: 'Leads Currently Researched', count: inProgressCount, color: '#FFB000' },
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
                      Lead Specialist Operational Info
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Specialist:</span>
                        <span style={{ color: '#F5F5F5', fontWeight: '600' }}>{user?.name || 'Lead Specialist'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Operational Email:</span>
                        <span style={{ color: '#00D9FF', fontWeight: '600' }}>lead@creativegini.com</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Lead SLA:</span>
                        <span style={{ color: '#34D399', fontWeight: '600' }}>24 - 48 Hours Verified</span>
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
                      Recent Prospecting Activity
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
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#00D9FF', marginRight: '10px' }}>{r.ticketId}</span>
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
                    Company Lead Ticket Management
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                    Which tickets exist and what is their current state? Filter, inspect scope and deliver verified intelligence lists.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Total:</span>
                  <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', padding: '2px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '0.82rem' }}>
                    {requests.length} Tickets
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
                        background: filterStatus === pill.id ? 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)' : 'rgba(255, 255, 255, 0.05)',
                        color: filterStatus === pill.id ? '#030303' : '#CBD5E1',
                        border: filterStatus === pill.id ? '1px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.1)',
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

              {/* Requests Table */}
              <div className="request-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="request-table">
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
                          No Company Lead tickets match your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(r)}>
                          <td>
                            <span className="ticket-key" style={{ color: '#00D9FF', fontWeight: '700' }}>
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
                            {r.assignedTeam || 'Company Lead Team'}
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
                                background: 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)', 
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
                Company Lead Specialist Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Team Specialist</label>
                  <input className="portal-form-input" value={user?.name || 'Company Lead Specialist'} readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Operational Email</label>
                  <input className="portal-form-input" value="lead@creativegini.com" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Specialization Scope</label>
                  <input className="portal-form-input" value="B2B Prospect Intelligence & Executive Outreach" readOnly />
                </div>
                <div>
                  <label className="portal-form-label" style={{ color: '#CBD5E1' }}>Active Ticket Pipeline</label>
                  <input className="portal-form-input" value={`${requests.length} Active Tickets`} readOnly />
                </div>
              </div>
            </div>
          )}

          {/* Conversations View (Ticket-Specific Conversations for Company Lead) */}
          {activeTab === 'conversations' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
                  Company Lead Ticket Conversations
                </h2>
                <p style={{ color: '#8fa0b5', margin: 0, fontSize: '0.88rem' }}>
                  Direct conversation channels for your Company Lead tickets. Select any ticket to communicate directly with the client.
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="portal-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#8fa0b5' }}>
                  <MessageSquare size={36} color="#00D9FF" style={{ opacity: 0.5, margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 6px 0' }}>No Active Tickets</h4>
                  <p style={{ fontSize: '0.84rem', maxWidth: '400px', margin: '0 auto' }}>
                    When Company Lead tickets are assigned to you, their conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="request-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                  <table className="request-table">
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
                            <span className="ticket-key" style={{ color: '#00D9FF', fontWeight: '700' }}>
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
                                background: 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)',
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
                              <MessageSquare size={13} /> Open Conversation
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
          </>
        )}
      </div>
    </div>

      {/* WORK SUBMISSION MODAL */}
      {isSubmissionModalOpen && selectedTicket && (
        <WorkSubmissionModal
          ticket={selectedTicket}
          nextVersion={(selectedTicket.currentSubmissionVersion || 0) + 1}
          onClose={() => setIsSubmissionModalOpen(false)}
          onSubmit={handleSubmitWork}
          isSubmitting={isSubmittingWork}
        />
      )}

    </div>
  );
}
