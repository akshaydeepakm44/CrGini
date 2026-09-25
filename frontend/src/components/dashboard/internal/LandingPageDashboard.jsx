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
import ChangePasswordSection from '../../common/ChangePasswordSection';

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

  // Onboarding Samples Preparation State
  const [onboardingClients, setOnboardingClients] = useState([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [selectedOnboardingClient, setSelectedOnboardingClient] = useState(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [prepUiAnalysis, setPrepUiAnalysis] = useState(null);
  const [prepLandingPageEnhancement, setPrepLandingPageEnhancement] = useState(null);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingSearchQuery, setOnboardingSearchQuery] = useState('');
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState('ALL');

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
      const [data, notifs, onbClients] = await Promise.all([
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getOnboardingClients().catch(() => [])
      ]);
      // Enforce strictly LANDING_PAGE requests only
      const list = Array.isArray(data) ? data : (data?.requests || []);
      setRequests(list.filter(r => r && r.serviceType === 'LANDING_PAGE'));
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }
      setOnboardingClients(onbClients || []);
    } catch (err) {
      console.error('Error loading Landing Page requests:', err);
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
      const res = await api.getCompanyUiOnboardingAssets(client.id);
      if (res?.assets) {
        setPrepUiAnalysis(res.assets.uiAnalysis || null);
        setPrepLandingPageEnhancement(res.assets.landingPageEnhancement || null);
      } else {
        setPrepUiAnalysis(null);
        setPrepLandingPageEnhancement(null);
      }
    } catch (err) {
      console.error('Failed to load company UI onboarding assets:', err);
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
      if (type === 'uiAnalysis') setPrepUiAnalysis(fileData);
      else if (type === 'landingPageEnhancement') setPrepLandingPageEnhancement(fileData);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOnboarding = async () => {
    if (!selectedOnboardingClient) return;
    try {
      setIsSavingOnboarding(true);
      await api.saveCompanyUiOnboardingAssets(selectedOnboardingClient.id, {
        uiAnalysis: prepUiAnalysis,
        landingPageEnhancement: prepLandingPageEnhancement
      });
      alert('Landing page onboarding sample assets saved successfully.');
      setIsPrepModalOpen(false);
      const onbClients = await api.getOnboardingClients();
      setOnboardingClients(onbClients || []);
    } catch (err) {
      alert('Failed to save UI onboarding assets: ' + err.message);
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

  // Open ticket directly from URL query parameter (e.g. /landing-page-enhancement?ticket=CG-1001)
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
        } else if (isPrepModalOpen) {
          setIsPrepModalOpen(false);
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
  }, [isMobileDrawerOpen, isPrepModalOpen, isSubmissionModalOpen, selectedTicket, isNotificationsOpen]);

  const pendingOnboardingCount = onboardingClients.filter(c => !(c.uiOnboardingStatus?.allPrepared)).length;
  const preparedOnboardingCount = onboardingClients.filter(c => Boolean(c.uiOnboardingStatus?.allPrepared)).length;
  const filteredOnboardingClients = onboardingClients.filter(c => {
    if (onboardingStatusFilter === 'PENDING') return !(c.uiOnboardingStatus?.allPrepared);
    if (onboardingStatusFilter === 'PREPARED') return Boolean(c.uiOnboardingStatus?.allPrepared);
    return true;
  }).filter(c => {
    if (!onboardingSearchQuery) return true;
    const q = onboardingSearchQuery.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.contactPerson || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

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

          <div className="portal-nav-section-title" style={{ marginTop: '12px' }}>Workspace</div>

          <button
            className={`portal-nav-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
            onClick={() => { setActiveTab('onboarding'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
            title="Client Onboarding Samples"
          >
            <Sparkles size={18} />
            <span>Client Onboarding</span>
            {pendingOnboardingCount > 0 && (
              <span className="portal-nav-badge" style={{ background: '#FFB000', color: '#030303', fontWeight: '800' }}>
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
            onClick={() => { setActiveTab('settings'); setSelectedTicket(null); setIsMobileDrawerOpen(false); }}
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
              <h2>
                {selectedTicket ? (
                  <>
                    <span style={{ color: '#34D399', marginRight: '8px' }}>{selectedTicket.ticketId}</span>
                    <span>{selectedTicket.title}</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'dashboard' && 'Company UI Dashboard'}
                    {activeTab === 'conversations' && 'Company UI Client Conversations'}
                    {activeTab === 'tickets' && 'Company UI Requests & Tickets'}
                    {activeTab === 'settings' && 'Company UI Settings'}
                  </>
                )}
              </h2>
              <p>
                {selectedTicket ? (
                  <span>Ticket Details & Deliverables • Status: <strong style={{ color: '#34D399' }}>{selectedTicket.status.replace(/_/g, ' ')}</strong></span>
                ) : (
                  <>
                    {activeTab === 'dashboard' && 'Overview of assigned work, sprint progress and delivery status.'}
                    {activeTab === 'conversations' && 'Persistent direct communication channels with your Company UI clients.'}
                    {activeTab === 'tickets' && 'Manage and track all Company UI requests and tickets.'}
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
                  <span>Company UI</span>
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
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#34D399', fontSize: '1.2rem' }}>
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
                      Manage, filter, and track all landing page enhancement sprints. Click any row to inspect request details, chat with client, and submit deliverables.
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

              {/* High-Contrast Requests Table */}
              <div className="request-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="request-table">
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
              <ChangePasswordSection />
            </div>
          )}

          {/* Conversations View (Ticket-Specific Conversations for Landing Page) */}
          {activeTab === 'conversations' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: '#FFFFFF' }}>
                  Landing Page UI Ticket Conversations
                </h2>
                <p style={{ color: '#8fa0b5', margin: 0, fontSize: '0.88rem' }}>
                  Direct conversation channels for your Landing Page tickets. Select any ticket to communicate directly with the client.
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="portal-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#8fa0b5' }}>
                  <MessageSquare size={36} color="#a855f7" style={{ opacity: 0.5, margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 6px 0' }}>No Active Tickets</h4>
                  <p style={{ fontSize: '0.84rem', maxWidth: '400px', margin: '0 auto' }}>
                    When Landing Page tickets are assigned to you, their conversations will appear here.
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
                            <span className="ticket-key" style={{ color: '#a855f7', fontWeight: '700' }}>
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
                                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                color: '#ffffff',
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

          {/* ONBOARDING: CLIENT ONBOARDING SAMPLE WORK VIEW */}
          {activeTab === 'onboarding' && (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>
                    Client Onboarding Sample Work
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                    When a new client is onboarded, prepare the initial UI/UX Analysis and Sample Landing Page Enhancement.
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
                      <th style={{ width: '220px' }}>Contact Person</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Initial UI/UX Analysis</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>Landing Page Enhancement</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Overall Status</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOnboarding ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                          Loading onboarding clients...
                        </td>
                      </tr>
                    ) : filteredOnboardingClients.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                          No client companies match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOnboardingClients.map(client => {
                        const st = client.uiOnboardingStatus || {};
                        const allDone = st.allPrepared;
                        return (
                          <tr key={client.id}>
                            <td>
                              <div style={{ fontWeight: '700', color: '#F5F5F5' }}>{client.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                                {client.industry || 'General'} · Added {new Date(client.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>{client.contactPerson}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{client.email}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.uiAnalysis === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.uiAnalysis === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.uiAnalysis === 'Uploaded' ? '✓ Uploaded' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: st.landingPageEnhancement === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: st.landingPageEnhancement === 'Uploaded' ? '#34D399' : '#F59E0B'
                              }}>
                                {st.landingPageEnhancement === 'Uploaded' ? '✓ Uploaded' : 'Pending'}
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
                                {allDone ? 'Update Sample Work' : 'Submit Sample Work'}
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

      {/* COMPANY UI ONBOARDING PREP MODAL */}
      {isPrepModalOpen && selectedOnboardingClient && (
        <div className="portal-modal-backdrop" onClick={() => !isSavingOnboarding && setIsPrepModalOpen(false)}>
          <div
            className="portal-modal-card"
            style={{ maxWidth: '800px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="portal-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} style={{ color: '#00D9FF' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Company UI Onboarding Sample Work
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F5F5F5', margin: 0 }}>
                  {selectedOnboardingClient.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  Upload the initial UI/UX analysis and sample landing page enhancement. These files automatically become visible to the client and appear in their Assets workspace.
                </p>
              </div>
              <button
                type="button"
                className="portal-modal-close-btn"
                onClick={() => setIsPrepModalOpen(false)}
                disabled={isSavingOnboarding}
              >
                <X size={18} />
              </button>
            </div>

            <div className="portal-modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {/* 1. INITIAL UI/UX ANALYSIS */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: prepUiAnalysis ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} style={{ color: '#00D9FF' }} />
                      <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.92rem' }}>
                        1. Initial UI/UX Analysis
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: prepUiAnalysis ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: prepUiAnalysis ? '#34D399' : '#F59E0B'
                    }}>
                      {prepUiAnalysis ? '✓ Prepared' : 'Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    Comprehensive initial UI/UX audit, design findings, and recommendations for the client.
                  </p>

                  {prepUiAnalysis ? (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prepUiAnalysis.name || 'ui_ux_analysis.pdf'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{prepUiAnalysis.size || 'Ready'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(prepUiAnalysis.url || prepUiAnalysis.streamUrl) && (
                          <a
                            href={prepUiAnalysis.url || prepUiAnalysis.streamUrl}
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
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload('uiAnalysis', e)}
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
                      <div>Click to <strong>Upload UI/UX Analysis</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>PDF or Word Document</div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload('uiAnalysis', e)}
                      />
                    </label>
                  )}
                </div>

                {/* 2. SAMPLE LANDING PAGE ENHANCEMENT */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: prepLandingPageEnhancement ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutTemplate size={18} style={{ color: '#34D399' }} />
                      <span style={{ fontWeight: '700', color: '#F5F5F5', fontSize: '0.92rem' }}>
                        2. Sample Landing Page Enhancement
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: prepLandingPageEnhancement ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: prepLandingPageEnhancement ? '#34D399' : '#F59E0B'
                    }}>
                      {prepLandingPageEnhancement ? '✓ Prepared' : 'Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
                    High-fidelity landing page enhancement mockup, redesign wireframe, or prototype asset.
                  </p>

                  {prepLandingPageEnhancement ? (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prepLandingPageEnhancement.name || 'landing_page_enhancement'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{prepLandingPageEnhancement.size || 'Ready'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(prepLandingPageEnhancement.url || prepLandingPageEnhancement.streamUrl) && (
                          <a
                            href={prepLandingPageEnhancement.url || prepLandingPageEnhancement.streamUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="portal-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#34D399' }}
                            title="View Asset"
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
                            accept=".png,.jpg,.jpeg,.webp,.pdf,.zip"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload('landingPageEnhancement', e)}
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
                      <div>Click to <strong>Upload Landing Page Enhancement</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>Image (PNG/JPG), PDF or ZIP</div>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf,.zip"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload('landingPageEnhancement', e)}
                      />
                    </label>
                  )}
                </div>
              </div>
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
                onClick={handleSaveOnboarding}
                disabled={isSavingOnboarding}
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                  color: '#030303',
                  fontWeight: '700',
                  padding: '8px 20px'
                }}
              >
                {isSavingOnboarding ? 'Saving Assets...' : 'Save Sample Work'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
