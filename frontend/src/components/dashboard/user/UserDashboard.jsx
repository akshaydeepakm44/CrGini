import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Zap,
  Users,
  LayoutTemplate,
  TicketCheck,
  Receipt,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  Send,
  X,
  CreditCard,
  Building,
  Mail,
  Phone,
  Globe,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  User,
  FileCheck,
  FileText
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import NotificationPanel from '../common/NotificationPanel';
import ClientReviewSection from '../common/ClientReviewSection';
import ActivityTimeline from '../common/ActivityTimeline';

export default function UserDashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [company, setCompany] = useState(user?.company || null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Workflow: Submissions, Review, Activity, and Notifications
  const [ticketSubmissions, setTicketSubmissions] = useState([]);
  const [ticketActivity, setTicketActivity] = useState([]);
  const [activeTicketModalTab, setActiveTicketModalTab] = useState('review');
  const [isProcessingReview, setIsProcessingReview] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Sidebar Collapse, Mobile Drawer, and Topbar Dropdowns
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem('cg_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // New Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestService, setRequestService] = useState('COMPANY_LEAD');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestPriority, setRequestPriority] = useState('MEDIUM');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Payment Confirmation Modal State
  const [pendingPaymentTicket, setPendingPaymentTicket] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  // Invoice Modal State
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Requests search & filter state
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsFilter, setRequestsFilter] = useState('ALL');

  // Settings profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Load Company, Requests, and Notifications from MongoDB
  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, requestsData, notifsData] = await Promise.all([
        api.getMyCompany().catch(() => user?.company || null),
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      if (companyData) setCompany(companyData);
      setRequests(requestsData);
      if (notifsData) {
        setNotifications(notifsData.notifications || []);
        setUnreadNotifCount(notifsData.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
        } else if (viewingInvoice) {
          setViewingInvoice(null);
        } else if (isRequestModalOpen) {
          setIsRequestModalOpen(false);
        } else if (pendingPaymentTicket) {
          setPendingPaymentTicket(null);
        } else if (selectedTicket) {
          setSelectedTicket(null);
        } else if (isHelpModalOpen) {
          setIsHelpModalOpen(false);
        } else if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        } else if (isProfileMenuOpen) {
          setIsProfileMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMobileDrawerOpen, viewingInvoice, isRequestModalOpen, pendingPaymentTicket, selectedTicket,
    isHelpModalOpen, isNotificationsOpen, isProfileMenuOpen
  ]);

  // Open Ticket Detail and Fetch Messages, Submissions, and Activity
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
      if (initialTab) {
        setActiveTicketModalTab(initialTab);
      } else if (subs.length > 0 || ticket.status === 'WORK_SUBMITTED' || ticket.status === 'WORK_RESUBMITTED' || ticket.status === 'CLIENT_REVIEW' || ticket.status === 'CHANGES_REQUESTED') {
        setActiveTicketModalTab('review');
      } else {
        setActiveTicketModalTab('scope');
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      setTicketMessages([]);
      setTicketSubmissions([]);
      setTicketActivity([]);
    }
  };

  // Client Review Handlers
  const handleApproveSubmission = async (submissionId, feedback) => {
    if (!selectedTicket) return;
    try {
      setIsProcessingReview(true);
      const res = await api.approveSubmission(selectedTicket._id, submissionId, feedback);
      setSelectedTicket(res.request);
      setRequests(prev => prev.map(r => r._id === res.request._id ? res.request : r));
      const [subs, act, notifs] = await Promise.all([
        api.getSubmissions(selectedTicket._id).catch(() => []),
        api.getTicketActivity(selectedTicket._id).catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      setTicketSubmissions(subs);
      setTicketActivity(act);
      setNotifications(notifs.notifications || []);
      setUnreadNotifCount(notifs.unreadCount || 0);
    } catch (err) {
      alert('Failed to approve work: ' + err.message);
    } finally {
      setIsProcessingReview(false);
    }
  };

  const handleRequestChanges = async (submissionId, feedback) => {
    if (!selectedTicket) return;
    try {
      setIsProcessingReview(true);
      const res = await api.requestChanges(selectedTicket._id, submissionId, feedback);
      setSelectedTicket(res.request);
      setRequests(prev => prev.map(r => r._id === res.request._id ? res.request : r));
      const [subs, act, notifs] = await Promise.all([
        api.getSubmissions(selectedTicket._id).catch(() => []),
        api.getTicketActivity(selectedTicket._id).catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      setTicketSubmissions(subs);
      setTicketActivity(act);
      setNotifications(notifs.notifications || []);
      setUnreadNotifCount(notifs.unreadCount || 0);
    } catch (err) {
      alert('Failed to request changes: ' + err.message);
    } finally {
      setIsProcessingReview(false);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const stored = localStorage.getItem('cg_auth_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.name = profileName;
          parsed.phone = profilePhone;
          localStorage.setItem('cg_auth_user', JSON.stringify(parsed));
        } catch {}
      }
      setIsEditingProfile(false);
      setProfileSavedNotice(true);
      setTimeout(() => setProfileSavedNotice(false), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Send Message inside Ticket
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket) return;

    try {
      setSendingMessage(true);
      const newMsg = await api.sendMessage(selectedTicket._id, newMessageText);
      setTicketMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Open New Request Modal for a specific service
  const handleOpenNewRequest = (serviceType) => {
    setRequestService(serviceType);
    if (serviceType === 'COMPANY_LEAD') {
      setRequestTitle('Additional Target Leads Research Sprint');
      setRequestDesc('I need 50 additional leads from European SaaS companies and include CTOs and VPs of Engineering.');
    } else if (serviceType === 'COMPANY_BOOST') {
      setRequestTitle('Autonomous Outbound Sequence & Messaging Audit');
      setRequestDesc('Optimize our enterprise value proposition and setup personalized outbound sequences for Tier-1 accounts.');
    } else {
      setRequestTitle('High-Converting Landing Page Enhancement Sprint');
      setRequestDesc('Redesign hero section with interactive capability visualizer and optimize mobile conversion flow.');
    }
    setIsRequestModalOpen(true);
  };

  // Submit New Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDesc.trim()) return;

    const priceMap = {
      COMPANY_LEAD: 499,
      COMPANY_BOOST: 799,
      LANDING_PAGE: 599
    };

    try {
      setIsSubmittingRequest(true);
      const created = await api.createRequest({
        serviceType: requestService,
        title: requestTitle.trim(),
        description: requestDesc.trim(),
        priority: requestPriority,
        price: priceMap[requestService]
      });

      setIsRequestModalOpen(false);
      await loadData();
      
      // Prompt payment flow
      setPendingPaymentTicket(created);
    } catch (err) {
      alert(err.message || 'Failed to create request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Process Simulated Payment
  const handleProcessPayment = async () => {
    if (!pendingPaymentTicket) return;
    try {
      setIsPaying(true);
      await api.payRequest(pendingPaymentTicket._id);
      setPendingPaymentTicket(null);
      await loadData();
      alert(`Payment successful! Ticket ${pendingPaymentTicket.ticketId} is now assigned to the team.`);
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setIsPaying(false);
    }
  };

  // Calculated Metrics
  const activeRequests = requests.filter(r => !['COMPLETED'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const pendingPayments = requests.filter(r => r.paymentStatus === 'PENDING');
  const initialLeadsCount = company?.initialLeads?.length || 0;

  const filteredUserRequests = requests.filter(r => {
    const matchesSearch =
      (r.ticketId || '').toLowerCase().includes(requestsSearch.toLowerCase()) ||
      (r.title || '').toLowerCase().includes(requestsSearch.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(requestsSearch.toLowerCase());
    
    const matchesFilter =
      requestsFilter === 'ALL' ||
      (requestsFilter === 'NEW' && ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)) ||
      (requestsFilter === 'IN_PROGRESS' && r.status === 'IN_PROGRESS') ||
      (requestsFilter === 'CLIENT_REVIEW' && ['WORK_SUBMITTED', 'WORK_RESUBMITTED', 'CLIENT_REVIEW', 'CHANGES_REQUESTED'].includes(r.status)) ||
      (requestsFilter === 'COMPLETED' && r.status === 'COMPLETED');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="portal-root">
      <PortalCosmicBackground />
      {/* 1. CREATIVEGINI SIDEBAR */}
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

        {/* Company Pre-populated badge (hidden when collapsed) */}
        {!isSidebarCollapsed && (
          <div className="portal-company-badge">
            <div className="portal-company-badge-label">Active Workspace</div>
            <div className="portal-company-badge-name" title={company?.name || 'Company Portal'}>
              {company?.name || 'Loading Company...'}
            </div>
          </div>
        )}

        <nav className="portal-sidebar-nav">
          <div className="portal-nav-section-title">Client Workspace</div>
          
          <button
            className={`portal-nav-btn ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveNav('dashboard'); setIsMobileDrawerOpen(false); }}
            title="Executive Dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <div className="portal-nav-section-title">CreativeGini Services</div>

          <button
            className={`portal-nav-btn ${activeNav === 'company-boost' ? 'active' : ''}`}
            onClick={() => { setActiveNav('company-boost'); setIsMobileDrawerOpen(false); }}
            title="Company Boost"
          >
            <Zap size={18} />
            <span>Company Boost</span>
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'company-lead' ? 'active' : ''}`}
            onClick={() => { setActiveNav('company-lead'); setIsMobileDrawerOpen(false); }}
            title="Company Lead"
          >
            <Users size={18} />
            <span>Company Lead</span>
            {initialLeadsCount > 0 && <span className="portal-nav-badge">{initialLeadsCount}</span>}
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'landing-page' ? 'active' : ''}`}
            onClick={() => { setActiveNav('landing-page'); setIsMobileDrawerOpen(false); }}
            title="Landing Page Enhancement"
          >
            <LayoutTemplate size={18} />
            <span>Landing Page</span>
          </button>

          <div className="portal-nav-section-title">Management</div>

          <button
            className={`portal-nav-btn ${activeNav === 'requests' ? 'active' : ''}`}
            onClick={() => { setActiveNav('requests'); setIsMobileDrawerOpen(false); }}
            title="My Requests"
          >
            <TicketCheck size={18} />
            <span>My Requests</span>
            {requests.length > 0 && (
              <span className="portal-nav-badge" style={{ background: '#3b82f6' }}>
                {requests.length}
              </span>
            )}
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'billing' ? 'active' : ''}`}
            onClick={() => { setActiveNav('billing'); setIsMobileDrawerOpen(false); }}
            title="Invoices & Payments"
          >
            <Receipt size={18} />
            <span>Invoices & Payments</span>
            {pendingPayments.length > 0 && (
              <span className="portal-nav-badge" style={{ background: '#f59e0b' }}>
                {pendingPayments.length} Due
              </span>
            )}
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveNav('settings'); setIsMobileDrawerOpen(false); }}
            title="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Footer - Compact avatar chip */}
        <div className="portal-sidebar-footer">
          <div className="portal-user-chip">
            <div className="portal-user-avatar" title={user?.name || 'Client User'}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="portal-user-meta">
                <div className="portal-user-name">{user?.name || 'Client User'}</div>
                <div className="portal-user-role">{company?.name || 'Client Portal'}</div>
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

      {/* 2. MAIN CONTENT AREA */}
      <div className="portal-main-wrapper">
        {/* Top Header */}
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
                {activeNav === 'dashboard' && 'Executive Overview'}
                {activeNav === 'company-boost' && 'Company Boost Growth Engine'}
                {activeNav === 'company-lead' && 'Company Lead Intelligence'}
                {activeNav === 'landing-page' && 'Landing Page Enhancement'}
                {activeNav === 'conversations' && 'Service Conversations'}
                {activeNav === 'requests' && 'Jira-Style Ticket Center'}
                {activeNav === 'billing' && 'Invoices & Billing'}
                {activeNav === 'settings' && 'Workspace Settings'}
              </h2>
              <p>
                {company?.name ? `${company.name} · ${company.industry || 'Technology'}` : 'Loading...'}
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

            {/* Help & Support Button */}
            <button
              type="button"
              className="portal-nav-action-btn"
              onClick={() => {
                setIsHelpModalOpen(true);
                setIsNotificationsOpen(false);
                setIsProfileMenuOpen(false);
              }}
              title="Help & Support Concierge"
            >
              <HelpCircle size={18} />
            </button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="portal-profile-chip-btn"
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                title="Account & Profile"
              >
                <div className="portal-profile-chip-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="portal-profile-chip-name">{user?.name || 'Client User'}</span>
                <ChevronDown size={14} style={{ color: '#64748B' }} />
              </button>
              {isProfileMenuOpen && (
                <div className="portal-topbar-dropdown" style={{ width: '220px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--portal-border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5' }}>{user?.name || 'Client User'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user?.email}</div>
                  </div>
                  <button
                    className="portal-dropdown-item"
                    onClick={() => {
                      setActiveNav('settings');
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <Settings size={15} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    className="portal-dropdown-item"
                    onClick={() => {
                      setIsHelpModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <HelpCircle size={15} />
                    <span>Client Concierge</span>
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

          {/* VIEW: DASHBOARD OVERVIEW */}
          {activeNav === 'dashboard' && (
            <>
              {/* Welcome Section Using Existing Company Info */}
              <div className="portal-welcome-banner">
                <h1 className="portal-welcome-title">
                  Welcome back, {company?.name || user?.name}!
                </h1>
                <p className="portal-welcome-desc">
                  Your CreativeGini growth portal is connected. Initial research, market positioning analysis, and high-value target profiles are ready for review.
                </p>
                <div className="portal-welcome-actions">
                  <button
                    className="portal-btn-primary"
                    onClick={() => handleOpenNewRequest('COMPANY_LEAD')}
                  >
                    <PlusCircle size={16} />
                    <span>Create New Request</span>
                  </button>
                  <button
                    className="portal-btn-secondary"
                    onClick={() => setActiveNav('requests')}
                  >
                    <TicketCheck size={16} />
                    <span>Track Active Tickets ({activeRequests.length})</span>
                  </button>
                </div>
              </div>

              {/* WORK AWAITING YOUR REVIEW SECTION */}
              {requests.filter(r => r.status === 'WORK_SUBMITTED' || r.status === 'WORK_RESUBMITTED' || r.status === 'CLIENT_REVIEW').length > 0 && (
                <div className="portal-review-alert-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D9FF', boxShadow: '0 0 10px rgba(0, 217, 255, 0.4)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F5F5F5', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Work Awaiting Your Review
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                    {requests
                      .filter(r => r.status === 'WORK_SUBMITTED' || r.status === 'WORK_RESUBMITTED' || r.status === 'CLIENT_REVIEW')
                      .map((r) => (
                        <div key={r._id} className="portal-review-alert-card">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#00D9FF', fontSize: '1rem' }}>
                                {r.ticketId}
                              </span>
                              <span className="status-pill CLIENT_REVIEW" style={{ fontSize: '0.72rem' }}>
                                Awaiting Your Review
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.02rem', fontWeight: '700', color: '#F5F5F5', lineHeight: '1.3' }}>
                              {r.title}
                            </h4>
                            <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                              Submission v{r.currentSubmissionVersion || 1} · Submitted by <strong style={{ color: '#00D9FF' }}>{r.assignedTeam}</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="portal-btn-primary"
                            onClick={() => handleOpenTicket(r)}
                            style={{
                              padding: '8px 18px',
                              fontSize: '0.85rem',
                              background: 'linear-gradient(135deg, #2563EB 0%, #0099ff 100%)',
                              color: '#040C12',
                              fontWeight: '700',
                              flexShrink: 0
                            }}
                          >
                            Review Work
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Analytics Metric Cards */}
              <div className="portal-metrics-grid">
                <div className="portal-metric-card">
                  <div className="portal-metric-icon">
                    <TicketCheck size={20} />
                  </div>
                  <div className="portal-metric-body">
                    <div className="portal-metric-value">{activeRequests.length}</div>
                    <div className="portal-metric-label">Active Tickets</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon green">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="portal-metric-body">
                    <div className="portal-metric-value">{completedRequests.length}</div>
                    <div className="portal-metric-label">Completed Sprints</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon purple">
                    <Users size={20} />
                  </div>
                  <div className="portal-metric-body">
                    <div className="portal-metric-value">{initialLeadsCount}</div>
                    <div className="portal-metric-label">Verified Pre-Researched Leads</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon gold">
                    <Receipt size={20} />
                  </div>
                  <div className="portal-metric-body">
                    <div className="portal-metric-value">{pendingPayments.length}</div>
                    <div className="portal-metric-label">Pending Payments</div>
                  </div>
                </div>
              </div>

              {/* Three CreativeGini Services Section */}
              <div style={{ marginBottom: '2.25rem' }}>
                <div className="portal-section-header">
                  <h3 className="portal-section-title">
                    Available CreativeGini Services
                  </h3>
                </div>
                <div className="portal-services-grid">
                  
                  {/* Service 1: Company Lead */}
                  <div className="portal-service-card">
                    <span className="portal-service-badge purple">
                      <Users size={12} /> B2B Prospecting
                    </span>
                    <h4 className="portal-service-title">Company Lead</h4>
                    <p className="portal-service-desc">
                      Custom curated and verified decision maker databases (CTOs, VPs, Directors) with high intent in your target regions.
                    </p>
                    <div className="portal-service-actions">
                      <button
                        className="portal-btn-primary"
                        onClick={() => setActiveNav('company-lead')}
                      >
                        Explore Leads
                      </button>
                      <button
                        className="portal-btn-secondary"
                        onClick={() => handleOpenNewRequest('COMPANY_LEAD')}
                      >
                        <PlusCircle size={15} /> Request More
                      </button>
                    </div>
                  </div>

                  {/* Service 2: Company Boost */}
                  <div className="portal-service-card">
                    <span className="portal-service-badge amber">
                      <Zap size={12} /> Growth Sprint
                    </span>
                    <h4 className="portal-service-title">Company Boost</h4>
                    <p className="portal-service-desc">
                      Autonomous outbound strategies, value proposition optimization, and competitive differentiation playbooks.
                    </p>
                    <div className="portal-service-actions">
                      <button
                        className="portal-btn-primary"
                        onClick={() => setActiveNav('company-boost')}
                      >
                        View Strategy
                      </button>
                      <button
                        className="portal-btn-secondary"
                        onClick={() => handleOpenNewRequest('COMPANY_BOOST')}
                      >
                        <PlusCircle size={15} /> Request Sprint
                      </button>
                    </div>
                  </div>

                  {/* Service 3: Landing Page Enhancement */}
                  <div className="portal-service-card">
                    <span className="portal-service-badge emerald">
                      <LayoutTemplate size={12} /> UI/UX Architecture
                    </span>
                    <h4 className="portal-service-title">Landing Page Enhancement</h4>
                    <p className="portal-service-desc">
                      Modernize your product landing page with WebGL visuals, interactive calculators, and conversion rate optimization.
                    </p>
                    <div className="portal-service-actions">
                      <button
                        className="portal-btn-primary"
                        onClick={() => setActiveNav('landing-page')}
                      >
                        View Audit
                      </button>
                      <button
                        className="portal-btn-secondary"
                        onClick={() => handleOpenNewRequest('LANDING_PAGE')}
                      >
                        <PlusCircle size={15} /> Request Redesign
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Recent Active Tickets / Requests */}
              <div style={{ marginBottom: '2.25rem' }}>
                <div className="portal-section-header">
                  <h3 className="portal-section-title">
                    Active Requests & Jira Tickets
                  </h3>
                  <button className="portal-btn-secondary" onClick={() => setActiveNav('requests')}>
                    View All Tickets ({requests.length})
                  </button>
                </div>

                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Title</th>
                        <th>Service</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Team</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No requests created yet. Click "Create New Request" to get started!
                          </td>
                        </tr>
                      ) : (
                        requests.slice(0, 5).map((req) => (
                          <tr key={req._id}>
                            <td>
                              <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                                {req.ticketId}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.title}</td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {req.serviceType.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className={`priority-pill ${req.priority}`}>{req.priority}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${req.status}`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td style={{ color: '#475569' }}>{req.assignedTeam}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="portal-btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                  onClick={() => handleOpenTicket(req)}
                                >
                                  <MessageSquare size={13} /> Open Ticket
                                </button>
                                {req.paymentStatus === 'PENDING' && (
                                  <button
                                    className="portal-btn-primary"
                                    style={{ padding: '4px 8px', fontSize: '0.78rem', background: '#f59e0b' }}
                                    onClick={() => setPendingPaymentTicket(req)}
                                  >
                                    Pay ${req.price}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VIEW: COMPANY LEAD SERVICE */}
          {activeNav === 'company-lead' && (
            <div>
              {/* Header Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
                    Company Lead Intelligence
                  </h2>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                    Pre-researched leads and key decision makers curated specifically for <strong>{company?.name}</strong>.
                  </p>
                </div>
                <button
                  className="portal-btn-primary"
                  onClick={() => handleOpenNewRequest('COMPANY_LEAD')}
                >
                  <PlusCircle size={16} /> Request More Leads
                </button>
              </div>

              {/* Notice: No re-entry needed */}
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} color="#34d399" />
                <div style={{ fontSize: '0.875rem', color: '#a7f3d0' }}>
                  <strong>Company Details Pre-Verified:</strong> Your company profile, domain, and market research are already loaded into our database. When creating a new lead request, you do NOT need to re-enter your company background.
                </div>
              </div>

              {/* Research Summary Card */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF' }}>
                  <Search size={16} color="#2563EB" /> CreativeGini Initial Research Summary
                </h4>
                <p style={{ color: 'var(--portal-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                  {company?.researchSummary || 'CreativeGini pre-market analysis identified high-affinity European SaaS prospects.'}
                </p>
              </div>

              {/* Initial Leads Table */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                    Initial Researched Leads ({initialLeadsCount})
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 10px', borderRadius: '6px' }}>
                    Status: Verified by CreativeGini
                  </span>
                </div>

                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Lead Name</th>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Direct Contact</th>
                        <th>LinkedIn</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company?.initialLeads && company.initialLeads.length > 0 ? (
                        company.initialLeads.map((lead, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600', color: '#F5F5F5' }}>{lead.name}</td>
                            <td style={{ color: 'var(--portal-text-muted)' }}>{lead.title}</td>
                            <td style={{ fontWeight: '500', color: '#00D9FF' }}>{lead.company}</td>
                            <td style={{ color: 'var(--portal-text-muted)' }}>{lead.location}</td>
                            <td>
                              <a href={`mailto:${lead.email}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>
                                {lead.email}
                              </a>
                            </td>
                            <td>
                              {lead.linkedin ? (
                                <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                  Profile <ExternalLink size={12} />
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              <span className="status-pill COMPLETED">
                                {lead.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No leads loaded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Initial Key People Table */}
              <div className="portal-card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Identified Key Stakeholders ({company?.initialKeyPeople?.length || 0})
                </h4>
                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Stakeholder</th>
                        <th>Executive Role</th>
                        <th>Department</th>
                        <th>Contact Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company?.initialKeyPeople && company.initialKeyPeople.length > 0 ? (
                        company.initialKeyPeople.map((kp, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600' }}>{kp.name}</td>
                            <td>{kp.role}</td>
                            <td>{kp.department}</td>
                            <td>
                              <a href={`mailto:${kp.contact}`} style={{ color: '#7b61ff', textDecoration: 'none' }}>
                                {kp.contact}
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            No stakeholders specified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Previous Company Lead Requests */}
              <div className="portal-card" style={{ marginTop: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: '#F5F5F5' }}>
                  Company Lead Sprints & Requests
                </h4>
                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Sprint Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Team</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.serviceType === 'COMPANY_LEAD').length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No Company Lead requests created yet. Click "Request More Leads" to begin!
                          </td>
                        </tr>
                      ) : (
                        requests.filter(r => r.serviceType === 'COMPANY_LEAD').map((req) => (
                          <tr key={req._id}>
                            <td>
                              <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                                {req.ticketId}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.title}</td>
                            <td>
                              <span className={`priority-pill ${req.priority}`}>{req.priority}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${req.status}`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>{req.assignedTeam}</td>
                            <td>
                              <button
                                type="button"
                                className="portal-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                onClick={() => handleOpenTicket(req)}
                              >
                                View Ticket
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: COMPANY BOOST SERVICE */}
          {activeNav === 'company-boost' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
                    Company Boost Service
                  </h2>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                    Accelerate your market traction and scale your outbound pipeline with specialized growth playbooks.
                  </p>
                </div>
                <button
                  className="portal-btn-primary"
                  onClick={() => handleOpenNewRequest('COMPANY_BOOST')}
                >
                  <PlusCircle size={16} /> Request Growth Playbook
                </button>
              </div>

              {/* Stored Company Profile Card */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Target Company Profile (Stored in Database)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Company</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{company?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Industry</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{company?.industry}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Website</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>
                      <a href={company?.website} target="_blank" rel="noreferrer" style={{ color: '#7b61ff' }}>
                        {company?.website}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Lead Executive</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>{company?.contactPerson}</div>
                  </div>
                </div>
              </div>

              {/* Previous Boost Sprints */}
              <div className="portal-card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Company Boost Sprint History
                </h4>
                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Sprint Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Team</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.serviceType === 'COMPANY_BOOST').length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No Company Boost requests created yet. Click "Create Boost Request" to begin!
                          </td>
                        </tr>
                      ) : (
                        requests.filter(r => r.serviceType === 'COMPANY_BOOST').map((req) => (
                          <tr key={req._id}>
                            <td>
                              <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                                {req.ticketId}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.title}</td>
                            <td>
                              <span className={`priority-pill ${req.priority}`}>{req.priority}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${req.status}`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>{req.assignedTeam}</td>
                            <td>
                              <button
                                className="portal-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                onClick={() => handleOpenTicket(req)}
                              >
                                View Ticket
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LANDING PAGE ENHANCEMENT */}
          {activeNav === 'landing-page' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
                    Landing Page Enhancement
                  </h2>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                    Transform your website into a conversion magnet with high-performance modern UI/UX engineering.
                  </p>
                </div>
                <button
                  className="portal-btn-primary"
                  onClick={() => handleOpenNewRequest('LANDING_PAGE')}
                >
                  <PlusCircle size={16} /> Request Enhancement Sprint
                </button>
              </div>

              {/* Website Info Stored */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', color: '#FFFFFF' }}>
                  Target Website Under Optimization
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', border: '1px solid var(--portal-border)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                  <Globe size={24} color="#2563EB" />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#FFFFFF' }}>{company?.website || 'https://acmecloud.ai'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)', marginTop: '2px' }}>
                      Associated with {company?.name}. No need to re-enter URLs or basic company data.
                    </div>
                  </div>
                </div>
              </div>

              {/* Landing Page Requests */}
              <div className="portal-card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Enhancement Sprints
                </h4>
                <div className="jira-table-wrapper">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Sprint Title</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.serviceType === 'LANDING_PAGE').length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No Landing Page enhancement requests created yet.
                          </td>
                        </tr>
                      ) : (
                        requests.filter(r => r.serviceType === 'LANDING_PAGE').map((req) => (
                          <tr key={req._id}>
                            <td>
                              <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                                {req.ticketId}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>{req.title}</td>
                            <td>
                              <span className={`status-pill ${req.status}`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>${req.price}</td>
                            <td>
                              <span style={{ color: req.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                                {req.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                className="portal-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                onClick={() => handleOpenTicket(req)}
                              >
                                View Ticket
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: MY REQUESTS (JIRA-STYLE SYSTEM) */}
          {activeNav === 'requests' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
                  My Requests & Jira Ticket Center
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                  All paid requests are tracked as Jira-style tickets with status lifecycle, activity history, and direct team conversation.
                </p>
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: `All Requests (${requests.length})` },
                    { id: 'NEW', label: `New / Assigned (${requests.filter(r => ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)).length})` },
                    { id: 'IN_PROGRESS', label: `In Progress (${requests.filter(r => r.status === 'IN_PROGRESS').length})` },
                    { id: 'CLIENT_REVIEW', label: `Under Review (${requests.filter(r => ['WORK_SUBMITTED', 'WORK_RESUBMITTED', 'CLIENT_REVIEW', 'CHANGES_REQUESTED'].includes(r.status)).length})` },
                    { id: 'COMPLETED', label: `Completed (${requests.filter(r => r.status === 'COMPLETED').length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRequestsFilter(tab.id)}
                      className="portal-btn-secondary"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.8rem',
                        background: requestsFilter === tab.id ? 'rgba(37, 99, 235, 0.15)' : undefined,
                        borderColor: requestsFilter === tab.id ? '#2563EB' : undefined,
                        color: requestsFilter === tab.id ? '#2563EB' : undefined,
                        fontWeight: requestsFilter === tab.id ? '700' : '500'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '320px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="portal-form-input"
                    style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
                    placeholder="Search tickets..."
                    value={requestsSearch}
                    onChange={(e) => setRequestsSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="jira-table-wrapper">
                <table className="jira-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Service Type</th>
                      <th>Priority</th>
                      <th>Lifecycle Status</th>
                      <th>Assigned Team</th>
                      <th>Payment</th>
                      <th>Created Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No tickets match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUserRequests.map((req) => (
                        <tr key={req._id}>
                          <td>
                            <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                              {req.ticketId}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>{req.title}</td>
                          <td>{req.serviceType.replace('_', ' ')}</td>
                          <td>
                            <span className={`priority-pill ${req.priority}`}>{req.priority}</span>
                          </td>
                          <td>
                            <span className={`status-pill ${req.status}`}>
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>{req.assignedTeam}</td>
                          <td>
                            <span style={{ color: req.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                              {req.paymentStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="portal-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              onClick={() => handleOpenTicket(req)}
                            >
                              Open
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

          {/* VIEW: INVOICES & PAYMENTS */}
          {activeNav === 'billing' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                Invoices & Payment Records
              </h2>

              <div className="jira-table-wrapper">
                <table className="jira-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Description / Ticket</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter(r => r.paymentStatus === 'PAID').length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No paid invoices recorded yet.
                        </td>
                      </tr>
                    ) : (
                      requests.filter(r => r.paymentStatus === 'PAID').map((req, idx) => (
                        <tr key={req._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#2563EB' }}>
                            INV-2026-00{idx + 1}
                          </td>
                          <td>{req.ticketId} - {req.title}</td>
                          <td style={{ fontWeight: '700', color: '#16A34A' }}>${req.price}.00 USD</td>
                          <td>Stripe Corporate Card</td>
                          <td>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                              PAID
                            </span>
                          </td>
                          <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="portal-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => setViewingInvoice({ ...req, invoiceId: `INV-2026-00${idx + 1}` })}
                            >
                              <Receipt size={13} /> View Invoice
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

          {/* VIEW: NOTIFICATIONS */}
          {activeNav === 'notifications' && (
            <div className="portal-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>
                Activity & Status Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.9rem 1.15rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--portal-border)', borderLeft: '4px solid #a78bfa' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#FFFFFF' }}>Welcome to CreativeGini Portal!</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)', marginTop: '3px' }}>
                    Your pre-researched market positioning and initial leads have been provisioned to your account.
                  </div>
                </div>
                <div style={{ padding: '0.9rem 1.15rem', borderRadius: '8px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#F5F5F5' }}>Ticket CG-1024 Assigned</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)', marginTop: '3px' }}>
                    The Company Lead team has started researching your 50 European SaaS leads.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: HELP & SUPPORT */}
          {activeNav === 'help' && (
            <div className="portal-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: '#F5F5F5' }}>
                CreativeGini Dedicated Concierge
              </h3>
              <p style={{ color: 'var(--portal-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Have questions regarding your research deliverables, ticket timelines, or need custom enterprise sprint scoping?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)' }}>
                  <Mail size={18} color="#00D9FF" />
                  <div style={{ fontWeight: '600', marginTop: '6px', color: '#F5F5F5' }}>Email Support</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginTop: '2px' }}>concierge@creativegini.com</div>
                </div>
                <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)' }}>
                  <Clock size={18} color="#34d399" />
                  <div style={{ fontWeight: '600', marginTop: '6px', color: '#F5F5F5' }}>Response Time</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginTop: '2px' }}>Under 2 hours for active sprints</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeNav === 'settings' && (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0' }}>
                    Company & Account Profile
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                    Manage contact person, telephone number, and view your verified company details.
                  </p>
                </div>
                {!isEditingProfile ? (
                  <button
                    type="button"
                    className="portal-btn-primary"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileName(user?.name || '');
                        setProfilePhone(user?.phone || '');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="portal-btn-primary"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {profileSavedNotice && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#16A34A', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> Profile preferences saved successfully.
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="portal-form-label">Company Name</label>
                    <input className="portal-form-input" value={company?.name || ''} readOnly style={{ opacity: 0.85 }} />
                  </div>
                  <div>
                    <label className="portal-form-label">Contact Person</label>
                    <input
                      className="portal-form-input"
                      value={isEditingProfile ? profileName : (user?.name || '')}
                      onChange={(e) => setProfileName(e.target.value)}
                      readOnly={!isEditingProfile}
                      style={{ borderColor: isEditingProfile ? '#2563EB' : undefined }}
                    />
                  </div>
                  <div>
                    <label className="portal-form-label">Email</label>
                    <input className="portal-form-input" value={user?.email || ''} readOnly style={{ opacity: 0.85 }} />
                  </div>
                  <div>
                    <label className="portal-form-label">Contact Phone</label>
                    <input
                      className="portal-form-input"
                      value={isEditingProfile ? profilePhone : (user?.phone || '+1 (555) 019-2834')}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      readOnly={!isEditingProfile}
                      style={{ borderColor: isEditingProfile ? '#2563EB' : undefined }}
                      placeholder="e.g. +1 (555) 019-2834"
                    />
                  </div>
                  <div>
                    <label className="portal-form-label">Website</label>
                    <input className="portal-form-input" value={company?.website || ''} readOnly style={{ opacity: 0.85 }} />
                  </div>
                </div>
              </form>
            </div>
          )}



        </div>
      </div>

      {/* 3. NEW REQUEST MODAL */}
      {isRequestModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsRequestModalOpen(false)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                  Create New Request / Ticket
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Service: <strong>{requestService.replace('_', ' ')}</strong> · Company: <strong>{company?.name}</strong>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setIsRequestModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest}>
              <div className="portal-modal-body">
                {/* Note reminding user that company info is already known */}
                <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
                  <Building size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#00D9FF' }} />
                  Your company background for <strong>{company?.name}</strong> is already stored. Only specify your new requirements below.
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Service Type</label>
                  <select
                    className="portal-form-select"
                    value={requestService}
                    onChange={(e) => setRequestService(e.target.value)}
                  >
                    <option value="COMPANY_LEAD">Company Lead Service ($499)</option>
                    <option value="COMPANY_BOOST">Company Boost Service ($799)</option>
                    <option value="LANDING_PAGE">Landing Page Enhancement ($599)</option>
                  </select>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Request Title</label>
                  <input
                    className="portal-form-input"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="e.g. 50 Additional CTO Leads from European SaaS"
                    required
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Requirement Description</label>
                  <textarea
                    className="portal-form-textarea"
                    rows="4"
                    value={requestDesc}
                    onChange={(e) => setRequestDesc(e.target.value)}
                    placeholder="Explain what specific work or deliverable you need..."
                    required
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Priority</label>
                  <select
                    className="portal-form-select"
                    value={requestPriority}
                    onChange={(e) => setRequestPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: '8px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Service Fee</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00D9FF' }}>
                      ${requestService === 'COMPANY_LEAD' ? '499' : requestService === 'COMPANY_BOOST' ? '799' : '599'}.00 USD
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> 100% Satisfaction Guaranteed
                  </div>
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isSubmittingRequest}
                >
                  {isSubmittingRequest ? 'Creating Ticket...' : 'Proceed to Checkout & Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PAYMENT CONFIRMATION MODAL */}
      {pendingPaymentTicket && (
        <div className="portal-modal-overlay" onClick={() => setPendingPaymentTicket(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                Complete Payment for {pendingPaymentTicket.ticketId}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setPendingPaymentTicket(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="portal-modal-body">
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                To send this ticket directly to the <strong style={{ color: '#00D9FF' }}>{pendingPaymentTicket.assignedTeam}</strong>, please complete payment authorization.
              </p>

              <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Item</span>
                  <span style={{ fontWeight: '600', color: '#F5F5F5' }}>{pendingPaymentTicket.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Service</span>
                  <span style={{ fontWeight: '600', color: '#00D9FF' }}>{pendingPaymentTicket.serviceType.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--portal-border)', paddingTop: '0.75rem', fontWeight: '700' }}>
                  <span style={{ color: '#F5F5F5' }}>Total Amount</span>
                  <span style={{ color: '#00D9FF', fontSize: '1.2rem', fontFamily: 'monospace' }}>${pendingPaymentTicket.price}.00 USD</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem', background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: '8px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                <CreditCard size={18} style={{ color: '#00D9FF', flexShrink: 0 }} />
                <span>Simulated Secure Stripe Checkout · Instant Activation & Team Assignment</span>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                className="portal-btn-secondary"
                onClick={() => setPendingPaymentTicket(null)}
              >
                Pay Later
              </button>
              <button
                className="portal-btn-primary"
                onClick={handleProcessPayment}
                disabled={isPaying}
              >
                {isPaying ? 'Authorizing Payment...' : `Pay $${pendingPaymentTicket.price}.00 Now`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. JIRA-STYLE TICKET DETAILS & CHAT MODAL */}
      {selectedTicket && (
        <div className="portal-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setSelectedTicket(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tab Navigation Bar */}
            <div className="portal-modal-tab-bar">
              <button
                type="button"
                className={`portal-modal-tab-btn ${activeTicketModalTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTicketModalTab('review')}
              >
                <FileCheck size={15} />
                <span>Deliverables & Review</span>
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
                <span>Jira Conversation</span>
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
                  {/* TAB 1: Deliverables & Review */}
                  {activeTicketModalTab === 'review' && (
                    <ClientReviewSection
                      ticket={selectedTicket}
                      submissions={ticketSubmissions}
                      userRole="USER"
                      onApprove={handleApproveSubmission}
                      onRequestChanges={handleRequestChanges}
                      isProcessing={isProcessingReview}
                    />
                  )}

                  {/* TAB 2: Scope & Requirements */}
                  {activeTicketModalTab === 'scope' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
                          Client Requirement Description & Scope
                        </h5>
                        <p style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                          {selectedTicket.description}
                        </p>
                      </div>

                      {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                        <div>
                          <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
                            Client Attached Files
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

                  {/* TAB 3: Jira Conversation */}
                  {activeTicketModalTab === 'chat' && (
                    <div>
                      <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                        <MessageSquare size={14} /> Jira Conversation Stream
                      </h5>

                      <div className="ticket-chat-container" style={{ height: '300px', overflowY: 'auto' }}>
                        {ticketMessages.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                            No messages yet in this ticket. Send a note to the CreativeGini team below!
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

                      <form onSubmit={handleSendMessage} className="ticket-chat-form">
                        <input
                          type="text"
                          className="portal-form-input"
                          placeholder="Type a message to the CreativeGini team..."
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          disabled={sendingMessage}
                        />
                        <button
                          type="submit"
                          className="portal-btn-primary"
                          style={{ padding: '0 16px' }}
                          disabled={sendingMessage || !newMessageText.trim()}
                        >
                          <Send size={16} />
                        </button>
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

                {/* Right Column: Ticket Metadata Card */}
                <div>
                  <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', padding: '1.25rem', borderRadius: '10px' }}>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 12px 0', letterSpacing: '0.04em' }}>
                      Ticket Specifications
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Team</span>
                        <div style={{ color: '#00D9FF', fontWeight: '700', fontSize: '0.9rem' }}>{selectedTicket.assignedTeam}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Specialist</span>
                        <div style={{ color: '#F5F5F5', fontWeight: '600' }}>
                          {selectedTicket.assignedTo?.name || 'Assigned Lead Specialist'}
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
                        <div style={{ color: '#F5F5F5', fontWeight: '600' }}>{selectedTicket.serviceType.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Current Version</span>
                        <div style={{ color: '#00D9FF', fontWeight: '700' }}>
                          v{selectedTicket.currentSubmissionVersion || 0}
                        </div>
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
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Security & Privacy</span>
                        <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <ShieldCheck size={14} /> Enterprise NDA Protected
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
      )}

      {/* 5. HELP & CONCIERGE MODAL */}
      {isHelpModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsHelpModalOpen(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                  CreativeGini Client Concierge
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '3px' }}>
                  Direct sprint assistance & advisory
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setIsHelpModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="portal-modal-body">
              <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1.25rem 0' }}>
                Have questions regarding your deliverable timelines, custom enterprise lead criteria, or conversion designs?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '1.1rem', borderRadius: '10px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)' }}>
                  <Mail size={20} color="#00D9FF" />
                  <div style={{ fontWeight: '600', marginTop: '8px', color: '#F5F5F5', fontSize: '0.92rem' }}>Email Support</div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '3px' }}>concierge@creativegini.com</div>
                </div>
                <div style={{ padding: '1.1rem', borderRadius: '10px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)' }}>
                  <Clock size={20} color="#34d399" />
                  <div style={{ fontWeight: '600', marginTop: '8px', color: '#F5F5F5', fontSize: '0.92rem' }}>Response SLA</div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '3px' }}>&lt; 2 hours for active sprints</div>
                </div>
              </div>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn-primary" onClick={() => setIsHelpModalOpen(false)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. INVOICE & RECEIPT VIEW MODAL */}
      {viewingInvoice && (
        <div className="portal-modal-overlay" onClick={() => setViewingInvoice(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#F5F5F5' }}>
                    Payment Invoice & Receipt
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                    {viewingInvoice.invoiceId || 'INV-2026-RECEIPT'} · Official Enterprise Receipt
                  </div>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setViewingInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              {/* Invoice details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--portal-border)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Billed To</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#F5F5F5', marginTop: '4px' }}>{company?.name || user?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{user?.email}</div>
                  {company?.website && <div style={{ fontSize: '0.82rem', color: '#00D9FF' }}>{company.website}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Provider</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#F5F5F5', marginTop: '4px' }}>CreativeGini Technologies</div>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>billing@creativegini.com</div>
                  <div style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: '700', marginTop: '4px' }}>✓ TAX EXEMPT / VERIFIED</div>
                </div>
              </div>

              {/* Line Item Table */}
              <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)', fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                  <span>Service Sprint Description</span>
                  <span>Amount</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--portal-border)', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#F5F5F5' }}>{viewingInvoice.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#00D9FF', marginTop: '2px' }}>
                      {viewingInvoice.ticketId} · {viewingInvoice.serviceType?.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#F5F5F5' }}>${viewingInvoice.price || 0}.00 USD</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '1.05rem', fontWeight: '800' }}>
                  <span style={{ color: '#F5F5F5' }}>Total Paid</span>
                  <span style={{ color: '#10B981' }}>${viewingInvoice.price || 0}.00 USD</span>
                </div>
              </div>

              {/* Payment metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(6, 17, 26, 0.85)', padding: '10px', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                  <span style={{ color: '#94A3B8' }}>Payment Method:</span>
                  <div style={{ fontWeight: '600', color: '#F5F5F5', marginTop: '2px' }}>Stripe Corporate Card</div>
                </div>
                <div style={{ background: 'rgba(6, 17, 26, 0.85)', padding: '10px', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                  <span style={{ color: '#94A3B8' }}>Status:</span>
                  <div style={{ fontWeight: '700', color: '#10B981', marginTop: '2px' }}>PAID (Settled)</div>
                </div>
                <div style={{ background: 'rgba(6, 17, 26, 0.85)', padding: '10px', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                  <span style={{ color: '#94A3B8' }}>Settlement Date:</span>
                  <div style={{ fontWeight: '600', color: '#F5F5F5', marginTop: '2px' }}>{new Date(viewingInvoice.updatedAt || viewingInvoice.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="portal-modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => window.print()}
              >
                Print Receipt
              </button>
              <button
                type="button"
                className="portal-btn-primary"
                onClick={() => setViewingInvoice(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
