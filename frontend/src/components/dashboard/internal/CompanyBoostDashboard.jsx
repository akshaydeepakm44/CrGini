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
  Layers,
  Compass,
  Video,
  Image,
  Code2,
  Eye,
  Sparkles,
  Plus,
  Download,
  Trash2
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import WorkSubmissionModal from '../common/WorkSubmissionModal';
import NotificationPanel from '../common/NotificationPanel';
import ActivityTimeline from '../common/ActivityTimeline';
import ChangePasswordSection from '../../common/ChangePasswordSection';

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
  const [isProgressUpdate, setIsProgressUpdate] = useState(false);
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

  // Onboarding Samples Preparation State
  const [onboardingClients, setOnboardingClients] = useState([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [selectedOnboardingClient, setSelectedOnboardingClient] = useState(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [prepPoster, setPrepPoster] = useState(null);
  const [prepVideo, setPrepVideo] = useState(null);
  const [prepStrategicPlan, setPrepStrategicPlan] = useState(null);
  const [prepDevrelPlan, setPrepDevrelPlan] = useState(null);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingSearchQuery, setOnboardingSearchQuery] = useState('');
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState('ALL');

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
      const [data, notifs, onbClients] = await Promise.all([
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getOnboardingClients().catch(() => [])
      ]);
      // Enforce strictly COMPANY_BOOST requests only
      const list = Array.isArray(data) ? data : (data?.requests || []);
      setRequests(list.filter(r => r && r.serviceType === 'COMPANY_BOOST'));
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }
      setOnboardingClients(onbClients || []);
    } catch (err) {
      console.error('Error loading Company Boost requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOnboardingPrep = async (client) => {
    setSelectedOnboardingClient(client);
    setLoadingOnboarding(true);
    setIsPrepModalOpen(true);
    try {
      const res = await api.getCompanyOnboardingAssets(client.id);
      if (res?.assets) {
        setPrepPoster(res.assets.poster || null);
        setPrepVideo(res.assets.video || null);
        setPrepStrategicPlan(res.assets.strategicPlan || null);
        setPrepDevrelPlan(res.assets.devrelPlan || null);
      } else {
        setPrepPoster(null);
        setPrepVideo(null);
        setPrepStrategicPlan(null);
        setPrepDevrelPlan(null);
      }
    } catch (err) {
      console.error('Failed to load company onboarding assets:', err);
    } finally {
      setLoadingOnboarding(false);
    }
  };

  const handleFileUpload = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target.result
      };
      if (type === 'poster') setPrepPoster(fileData);
      else if (type === 'video') setPrepVideo(fileData);
      else if (type === 'strategicPlan') setPrepStrategicPlan(fileData);
      else if (type === 'devrelPlan') setPrepDevrelPlan(fileData);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOnboardingAssets = async () => {
    if (!selectedOnboardingClient) return;
    try {
      setIsSavingOnboarding(true);
      await api.saveCompanyOnboardingAssets(selectedOnboardingClient.id, {
        poster: prepPoster,
        video: prepVideo,
        strategicPlan: prepStrategicPlan,
        devrelPlan: prepDevrelPlan
      });
      alert('Onboarding sample assets saved successfully!');
      setIsPrepModalOpen(false);
      // Reload onboarding clients
      const clients = await api.getOnboardingClients().catch(() => []);
      setOnboardingClients(clients || []);
    } catch (err) {
      alert('Failed to save onboarding assets: ' + err.message);
    } finally {
      setIsSavingOnboarding(false);
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

  // Open ticket directly from URL query parameter (e.g. /company-boost?ticket=CG-1001)
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

  // Close active modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
        } else if (isSubmissionModalOpen) {
          setIsSubmissionModalOpen(false);
        } else if (isPrepModalOpen) {
          setIsPrepModalOpen(false);
        } else if (selectedTicket) {
          setSelectedTicket(null);
        } else if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, isSubmissionModalOpen, isPrepModalOpen, selectedTicket, isNotificationsOpen]);

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

  // Onboarding metrics and filtering
  const pendingOnboardingCount = onboardingClients.filter(c => !c.onboardingStatus?.allPrepared).length;
  const preparedOnboardingCount = onboardingClients.filter(c => c.onboardingStatus?.allPrepared).length;

  const filteredOnboardingClients = onboardingClients.filter(c => {
    const q = onboardingSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q))
    );
    const matchesStatus = onboardingStatusFilter === 'ALL'
      ? true
      : onboardingStatusFilter === 'PENDING'
      ? !c.onboardingStatus?.allPrepared
      : c.onboardingStatus?.allPrepared;
    return matchesSearch && matchesStatus;
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
            className={`portal-nav-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
            onClick={() => { setActiveTab('onboarding'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
            title="Client Onboarding Samples"
          >
            <Sparkles size={18} />
            <span>Onboarding Samples</span>
            {pendingOnboardingCount > 0 && (
              <span className="portal-nav-badge" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)', color: '#030303' }}>
                {pendingOnboardingCount}
              </span>
            )}
          </button>

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
            <span className="portal-nav-badge" style={{ background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303' }}>{requests.length}</span>
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
                {selectedTicket ? (
                  <>
                    <span style={{ color: '#FFB000', marginRight: '8px' }}>{selectedTicket.ticketId}</span>
                    <span>{selectedTicket.title}</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'dashboard' && 'Company Boost Dashboard'}
                    {activeTab === 'onboarding' && 'Client Onboarding Samples & Initial Assets'}
                    {activeTab === 'conversations' && 'Company Boost Client Conversations'}
                    {activeTab === 'tickets' && 'Company Boost Requests & Tickets'}
                    {activeTab === 'settings' && 'Company Boost Settings'}
                  </>
                )}
              </h2>
              <p>
                {selectedTicket ? (
                  <span>Ticket Details & Deliverables • Status: <strong style={{ color: '#FFB000' }}>{selectedTicket.status.replace(/_/g, ' ')}</strong></span>
                ) : (
                  <>
                    {activeTab === 'dashboard' && 'Overview of assigned work, sprint progress and delivery status.'}
                    {activeTab === 'onboarding' && 'Prepare and manage the 4 initial onboarding materials (Poster, Video, Strategic Plan, DevRel Plan) for clients.'}
                    {activeTab === 'conversations' && 'Persistent direct communication channels with your Company Boost clients.'}
                    {activeTab === 'tickets' && 'Manage and track all Company Boost requests and tickets.'}
                    {activeTab === 'settings' && 'Team specialist account configuration and operational settings.'}
                  </>
                )}
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
          {selectedTicket ? (
            <div className="portal-ticket-detail-view">
              <div className="portal-ticket-breadcrumb">
                <button
                  type="button"
                  className="portal-breadcrumb-back-btn"
                  onClick={() => setSelectedTicket(null)}
                >
                  <ChevronLeft size={16} />
                  <span>Back to {activeTab === 'tickets' ? 'Requests / Tickets' : 'Dashboard'}</span>
                </button>
                <div className="portal-breadcrumb-trail">
                  <span>Company Boost</span>
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
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#FFB000', fontSize: '1.2rem' }}>
                        {selectedTicket.ticketId}
                      </span>
                      <span className={'status-pill ' + selectedTicket.status}>
                        {selectedTicket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={'priority-pill ' + selectedTicket.priority}>
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

                <div className="portal-modal-body">
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
          ) : (
            <>
{/* DASHBOARD: OVERVIEW / WORK MANAGEMENT PAGE */}
          {activeTab === 'dashboard' && (
            <>
              {/* Onboarding Callout Banner if any clients need preparation */}
              {pendingOnboardingCount > 0 && (
                <div style={{
                  background: 'rgba(0, 217, 255, 0.08)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(0, 217, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00D9FF'
                    }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div style={{ color: '#F5F5F5', fontWeight: '700', fontSize: '0.95rem' }}>
                        {pendingOnboardingCount} {pendingOnboardingCount === 1 ? 'Client Awaits' : 'Clients Await'} Initial Onboarding Samples
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '2px' }}>
                        Prepare initial deliverables (Branded Poster, Video, Strategic Plan, DevRel Plan) before the client requests full sprints.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="portal-btn-primary"
                    onClick={() => setActiveTab('onboarding')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                      color: '#030303',
                      fontWeight: '700',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Prepare Client Samples →
                  </button>
                </div>
              )}

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

          {/* ONBOARDING: CLIENT ONBOARDING SAMPLES PREPARATION */}
          {activeTab === 'onboarding' && (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                    Client Onboarding Samples Management
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                    When a new client is created, the Company Boost team prepares 4 initial samples: Poster, Showcase Video, Strategic Plan, and DevRel Plan.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.82rem' }}>
                    {onboardingClients.length} Total Clients
                  </span>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.82rem' }}>
                    {pendingOnboardingCount} Pending Prep
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.82rem' }}>
                    {preparedOnboardingCount} Fully Prepared
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    className="portal-form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                    placeholder="Search clients by name, contact, email..."
                    value={onboardingSearchQuery}
                    onChange={(e) => setOnboardingSearchQuery(e.target.value)}
                  />
                  {onboardingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOnboardingSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'ALL', label: `All (${onboardingClients.length})` },
                    { id: 'PENDING', label: `Pending Samples (${pendingOnboardingCount})` },
                    { id: 'PREPARED', label: `Fully Prepared (${preparedOnboardingCount})` }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setOnboardingStatusFilter(pill.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: onboardingStatusFilter === pill.id ? 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.05)',
                        color: onboardingStatusFilter === pill.id ? '#030303' : '#CBD5E1',
                        border: onboardingStatusFilter === pill.id ? '1px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients Table */}
              <div className="request-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="request-table">
                  <thead>
                    <tr>
                      <th>Client / Company</th>
                      <th style={{ width: '180px' }}>Contact Person</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Strategic Plan</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Poster</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Video</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>DevRel Plan</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Overall Status</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOnboardingClients.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                          No client companies match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOnboardingClients.map(client => {
                        const st = client.onboardingStatus || {};
                        const allDone = st.allPrepared;
                        return (
                          <tr key={client.id}>
                            <td>
                              <div style={{ fontWeight: '700', color: '#F5F5F5' }}>{client.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                                {client.industry || 'Tech'} · Added {new Date(client.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>{client.contactPerson}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{client.email}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.strategicPlan === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.strategicPlan === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.strategicPlan === 'Uploaded' ? 'Uploaded' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.poster === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.poster === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.poster === 'Uploaded' ? 'Uploaded' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.video === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.video === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.video === 'Uploaded' ? 'Uploaded' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.devrelPlan === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.devrelPlan === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.devrelPlan === 'Uploaded' ? 'Uploaded' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: allDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: allDone ? '#34D399' : '#F59E0B',
                                border: allDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                              }}>
                                {allDone ? 'Complete' : 'Action Needed'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="portal-btn-primary"
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.8rem',
                                  background: allDone ? 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                                  color: '#030303',
                                  fontWeight: '700'
                                }}
                                onClick={() => handleOpenOnboardingPrep(client)}
                              >
                                {allDone ? 'Update Samples' : 'Prepare Samples'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
              <ChangePasswordSection />
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
                  Direct conversation channels for your Company Boost tickets. Select any ticket to communicate directly with the client.
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

      {/* ONBOARDING PREPARATION MODAL */}
      {isPrepModalOpen && selectedOnboardingClient && (
        <div className="portal-modal-overlay" onClick={() => setIsPrepModalOpen(false)}>
          <div
            className="portal-modal-card"
            style={{ maxWidth: '840px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="portal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} color="#00D9FF" />
                  <span style={{ fontSize: '0.85rem', color: '#00D9FF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Company Boost Workspace Onboarding
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                  Prepare Onboarding Samples: {selectedOnboardingClient.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  Upload sample assets to be showcased in the client's Company Boost dashboard. Files are stored securely in the company assets system.
                </p>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8fa0b5' }}
                onClick={() => setIsPrepModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
              {loadingOnboarding ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  Loading existing onboarding assets...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {/* 1. Strategic Plan Sample */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--portal-border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Compass size={18} color="#FFB000" />
                        <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.95rem' }}>Strategic Plan Sample</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: prepStrategicPlan ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: prepStrategicPlan ? '#34D399' : '#F59E0B'
                      }}>
                        {prepStrategicPlan ? 'Uploaded' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 14px 0' }}>
                      Sample multi-quarter growth strategy, positioning audit, or expansion roadmap (PDF / Word / Text).
                    </p>

                    {prepStrategicPlan ? (
                      <div style={{
                        background: 'rgba(4, 12, 18, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prepStrategicPlan.name || 'strategic_plan.pdf'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{prepStrategicPlan.size || 'Ready'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(prepStrategicPlan.url || prepStrategicPlan.streamUrl) && (
                            <a
                              href={prepStrategicPlan.url || prepStrategicPlan.streamUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="portal-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#00D9FF' }}
                              title="View Document"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <label
                            className="portal-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                            title="Replace File"
                          >
                            <Upload size={13} />
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload('strategicPlan', e)}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label style={{
                        marginTop: 'auto',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        fontSize: '0.82rem',
                        display: 'block'
                      }}>
                        <Upload size={22} style={{ margin: '0 auto 6px', color: '#FFB000', opacity: 0.8 }} />
                        <div>Click to <strong>Upload Strategic Plan</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>PDF, DOCX or TXT</div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload('strategicPlan', e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* 2. Branded Poster / Image */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--portal-border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Image size={18} color="#00D9FF" />
                        <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.95rem' }}>Branded Showcase Poster</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: prepPoster ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: prepPoster ? '#34D399' : '#F59E0B'
                      }}>
                        {prepPoster ? 'Uploaded' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 14px 0' }}>
                      High-impact branded graphic or product announcement poster (PNG, JPG, WEBP).
                    </p>

                    {prepPoster ? (
                      <div style={{
                        background: 'rgba(4, 12, 18, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        marginTop: 'auto'
                      }}>
                        <div style={{ height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={prepPoster.dataUrl || prepPoster.url || prepPoster.streamUrl}
                            alt="Poster Preview"
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {prepPoster.name || 'poster.png'}
                          </div>
                          <label
                            className="portal-btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Upload size={12} /> Replace
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload('poster', e)}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label style={{
                        marginTop: 'auto',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        fontSize: '0.82rem',
                        display: 'block'
                      }}>
                        <Upload size={22} style={{ margin: '0 auto 6px', color: '#00D9FF', opacity: 0.8 }} />
                        <div>Click to <strong>Upload Poster Image</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>PNG, JPG or WEBP</div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload('poster', e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* 3. Company Video Preview */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--portal-border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Video size={18} color="#c084fc" />
                        <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.95rem' }}>Company Showcase Video</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: prepVideo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: prepVideo ? '#34D399' : '#F59E0B'
                      }}>
                        {prepVideo ? 'Uploaded' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 14px 0' }}>
                      Demo teaser or pitch clip that plays directly in the client dashboard (MP4 / WebM).
                    </p>

                    {prepVideo ? (
                      <div style={{
                        background: 'rgba(4, 12, 18, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        marginTop: 'auto'
                      }}>
                        <div style={{ height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
                          <video
                            src={prepVideo.dataUrl || prepVideo.url || prepVideo.streamUrl}
                            controls
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {prepVideo.name || 'showcase_video.mp4'}
                          </div>
                          <label
                            className="portal-btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Upload size={12} /> Replace
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload('video', e)}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label style={{
                        marginTop: 'auto',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        fontSize: '0.82rem',
                        display: 'block'
                      }}>
                        <Upload size={22} style={{ margin: '0 auto 6px', color: '#c084fc', opacity: 0.8 }} />
                        <div>Click to <strong>Upload Video Clip</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>MP4, WebM or MOV</div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload('video', e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* 4. DevRel Plan Sample */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--portal-border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Code2 size={18} color="#34D399" />
                        <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.95rem' }}>DevRel Plan Sample</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: prepDevrelPlan ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: prepDevrelPlan ? '#34D399' : '#F59E0B'
                      }}>
                        {prepDevrelPlan ? 'Uploaded' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 14px 0' }}>
                      Developer advocacy blueprint, documentation overhaul, or technical ecosystem strategy.
                    </p>

                    {prepDevrelPlan ? (
                      <div style={{
                        background: 'rgba(4, 12, 18, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prepDevrelPlan.name || 'devrel_plan.pdf'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{prepDevrelPlan.size || 'Ready'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(prepDevrelPlan.url || prepDevrelPlan.streamUrl) && (
                            <a
                              href={prepDevrelPlan.url || prepDevrelPlan.streamUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="portal-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#00D9FF' }}
                              title="View Document"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <label
                            className="portal-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                            title="Replace File"
                          >
                            <Upload size={13} />
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload('devrelPlan', e)}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label style={{
                        marginTop: 'auto',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        fontSize: '0.82rem',
                        display: 'block'
                      }}>
                        <Upload size={22} style={{ margin: '0 auto 6px', color: '#34D399', opacity: 0.8 }} />
                        <div>Click to <strong>Upload DevRel Plan</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>PDF, DOCX or TXT</div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload('devrelPlan', e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="portal-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => setIsPrepModalOpen(false)}
                disabled={isSavingOnboarding}
              >
                Cancel
              </button>
              <button
                type="button"
                className="portal-btn-primary"
                onClick={handleSaveOnboardingAssets}
                disabled={isSavingOnboarding}
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                  color: '#030303',
                  fontWeight: '700',
                  padding: '8px 20px'
                }}
              >
                {isSavingOnboarding ? 'Saving Assets...' : 'Save Onboarding Samples'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
