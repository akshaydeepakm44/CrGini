import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserPlus,
  TicketCheck,
  DollarSign,
  TrendingUp,
  LogOut,
  X,
  CheckCircle2,
  Building,
  Mail,
  Lock,
  Phone,
  Globe,
  Briefcase,
  Search,
  MessageSquare,
  Clock,
  Layers,
  Activity,
  Receipt,
  Eye,
  Edit3,
  KeyRound,
  UserX,
  UserCheck,
  Copy,
  Check,
  Settings,
  AlertTriangle,
  AlertCircle,
  FileText,
  FileCheck,
  Upload,
  RotateCcw,
  ExternalLink,
  Trash2,
  Server,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Bell
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import ActionMenu from '../common/ActionMenu';
import NotificationPanel from '../common/NotificationPanel';
import ActivityTimeline from '../common/ActivityTimeline';

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  // Navigation Tabs: overview, clients, teams, services, tickets, payments, settings
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workflow State: Notifications, Deliverables, Timeline
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [ticketSubmissions, setTicketSubmissions] = useState([]);
  const [ticketActivity, setTicketActivity] = useState([]);
  const [activeTicketModalTab, setActiveTicketModalTab] = useState('scope');

  // Admin Override Modal State
  const [overrideModalTicket, setOverrideModalTicket] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  // Sidebar Collapse, Mobile Drawer, and Profile Dropdown
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_admin_sidebar_collapsed') === 'true';
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
        sessionStorage.setItem('cg_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Search & Filters for Client Users
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, DISABLED
  const [clientsPage, setClientsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationSuccessData, setCreationSuccessData] = useState(null); // shows created user + temp pass
  const [viewingUser, setViewingUser] = useState(null); // user detail modal
  const [viewUserData, setViewUserData] = useState(null); // full populated details
  const [editingUser, setEditingUser] = useState(null); // user edit modal
  const [editFormData, setEditFormData] = useState({});
  const [resettingUser, setResettingUser] = useState(null); // password reset modal
  const [resetSuccessPass, setResetSuccessPass] = useState(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState(null); // disable/enable confirm
  const [deletingUser, setDeletingUser] = useState(null); // delete confirmation modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);

  // Form State for creating new client user
  const [createFormData, setCreateFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: 'Enterprise SaaS / AI',
    companyInfo: '',
    researchSummary: '',
    password: 'Client@123'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastNotice, setToastNotice] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const showNotice = (msg) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(''), 4500);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, requestsData, notifs] = await Promise.all([
        api.adminGetUsers().catch(() => []),
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      setUsers(usersData);
      setRequests(requestsData);
      if (notifs) {
        setNotifications(notifs.notifications || []);
        setUnreadNotifCount(notifs.unreadCount || 0);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
    };
  }, []);

  useEffect(() => {
    setClientsPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
        } else if (overrideModalTicket) {
          setOverrideModalTicket(null);
        } else if (deletingUser) {
          setDeletingUser(null);
        } else if (statusConfirmUser) {
          setStatusConfirmUser(null);
        } else if (resetSuccessPass || resettingUser) {
          setResettingUser(null);
          setResetSuccessPass(null);
        } else if (editingUser) {
          setEditingUser(null);
        } else if (viewingUser) {
          setViewingUser(null);
          setViewUserData(null);
        } else if (creationSuccessData) {
          setCreationSuccessData(null);
        } else if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
        } else if (selectedTicket) {
          setSelectedTicket(null);
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
    isMobileDrawerOpen, overrideModalTicket, deletingUser, statusConfirmUser, resetSuccessPass,
    resettingUser, editingUser, viewingUser, creationSuccessData, isCreateModalOpen,
    selectedTicket, isNotificationsOpen, isProfileMenuOpen
  ]);

  // 1. CREATE CLIENT USER
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.companyName || !createFormData.contactPerson || !createFormData.email) {
      alert('Please provide Company Name, Client Name, and Email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.adminCreateClient({
        companyName: createFormData.companyName.trim(),
        contactPerson: createFormData.contactPerson.trim(),
        email: createFormData.email.trim(),
        phone: createFormData.phone.trim(),
        website: createFormData.website.trim(),
        industry: createFormData.industry.trim(),
        companyInfo: createFormData.companyInfo.trim(),
        researchSummary: createFormData.researchSummary.trim(),
        password: createFormData.password.trim(),
        initialLeads: [
          {
            name: 'Senior Decision Maker (Sample)',
            title: 'VP of Engineering / CTO',
            company: createFormData.companyName.trim(),
            email: `executive@${createFormData.email.split('@')[1] || 'client.com'}`,
            location: 'Global',
            status: 'Verified'
          }
        ],
        initialKeyPeople: [
          {
            name: createFormData.contactPerson.trim(),
            role: 'Executive Sponsor',
            department: 'Management',
            contact: createFormData.email.trim()
          }
        ]
      });

      setIsCreateModalOpen(false);
      setCreationSuccessData({
        name: createFormData.contactPerson,
        email: createFormData.email,
        company: createFormData.companyName,
        role: 'USER',
        temporaryPassword: res.temporaryPassword || createFormData.password,
        id: res.user?.id
      });

      setCreateFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        industry: 'Enterprise SaaS / AI',
        companyInfo: '',
        researchSummary: '',
        password: 'Client@123'
      });

      await loadAdminData();
    } catch (err) {
      alert('Failed to create client user: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. VIEW USER
  const handleOpenView = async (userId) => {
    try {
      setViewingUser(userId);
      setViewUserData(null);
      const data = await api.adminGetUserById(userId);
      setViewUserData(data);
    } catch (err) {
      alert('Failed to load user details: ' + err.message);
      setViewingUser(null);
    }
  };

  // 3. EDIT USER
  const handleOpenEdit = (clientUser) => {
    setEditingUser(clientUser);
    setEditFormData({
      name: clientUser.name || '',
      email: clientUser.email || '',
      phone: clientUser.phone || '',
      status: clientUser.status || 'ACTIVE',
      companyName: clientUser.companyId?.name || '',
      website: clientUser.companyId?.website || '',
      industry: clientUser.companyId?.industry || '',
      companyInfo: clientUser.companyId?.companyInfo || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setIsSubmitting(true);
      await api.adminUpdateUser(editingUser._id, editFormData);
      setEditingUser(null);
      showNotice('Client user updated successfully.');
      await loadAdminData();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. RESET PASSWORD
  const handleConfirmResetPassword = async () => {
    if (!resettingUser) return;
    try {
      setIsSubmitting(true);
      const res = await api.adminResetPassword(resettingUser._id);
      setResetSuccessPass(res.temporaryPassword);
      await loadAdminData();
    } catch (err) {
      alert('Failed to reset password: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. STATUS TOGGLE (ACTIVE / DISABLED)
  const handleToggleStatus = async (clientUser) => {
    const nextStatus = clientUser.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      await api.adminUpdateUserStatus(clientUser._id, nextStatus);
      showNotice(`Account has been ${nextStatus === 'DISABLED' ? 'disabled' : 'enabled'} successfully.`);
      await loadAdminData();
      if (viewingUser === clientUser._id && viewUserData) {
        setViewUserData({
          ...viewUserData,
          user: { ...viewUserData.user, status: nextStatus }
        });
      }
    } catch (err) {
      alert('Failed to change status: ' + err.message);
    }
  };

  // 6. DELETE USER
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    const targetId = deletingUser._id || deletingUser.id;
    try {
      setIsSubmitting(true);
      await api.adminDeleteUser(targetId);
      // Immediately remove from Client Users table
      setUsers(prev => prev.filter(u => String(u._id || u.id) !== String(targetId)));
      setDeletingUser(null);
      showNotice('Client user deleted successfully.');
      await loadAdminData();
    } catch (err) {
      alert('Failed to delete user: ' + (err.message || 'An error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = (pass) => {
    navigator.clipboard.writeText(pass);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Ticket inspection
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
      setActiveTicketModalTab(initialTab === 'review' ? 'deliverables' : (initialTab || 'scope'));
    } catch (err) {
      setTicketMessages([]);
      setTicketSubmissions([]);
      setTicketActivity([]);
    }
  };

  // Open Admin Override Modal
  const handleOpenOverrideModal = (ticket) => {
    setOverrideModalTicket(ticket);
    setOverrideReason('');
  };

  // Confirm Admin Override
  const handleConfirmAdminOverride = async (e) => {
    e.preventDefault();
    if (!overrideModalTicket) return;
    if (!overrideReason.trim()) {
      alert('Please provide a mandatory audit explanation for this administrative override.');
      return;
    }
    try {
      setIsOverriding(true);
      const res = await api.adminOverride(overrideModalTicket._id, overrideReason.trim());
      setRequests(prev => prev.map(r => r._id === res.request._id ? res.request : r));
      if (selectedTicket && selectedTicket._id === res.request._id) {
        setSelectedTicket(res.request);
      }
      setOverrideModalTicket(null);
      setOverrideReason('');
      showNotice(`Ticket ${res.request.ticketId} marked COMPLETED via Admin Override.`);
    } catch (err) {
      alert('Failed to execute admin override: ' + err.message);
    } finally {
      setIsOverriding(false);
    }
  };

  // Notifications Handlers
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

  // Data aggregates
  const clientUsers = users.filter(u => u.role === 'USER' && !u.isDeleted);
  const teamMembers = users.filter(u => u.role !== 'USER' && !u.isDeleted);
  const activeClients = clientUsers.filter(u => u.status === 'ACTIVE');
  const disabledClients = clientUsers.filter(u => u.status === 'DISABLED');
  const totalRevenue = requests
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((acc, r) => acc + (r.price || 0), 0);

  // Team permissions editing state
  const [editingPermissionsUserId, setEditingPermissionsUserId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({
    companyBoost: false,
    companyLead: false,
    companyUI: false
  });
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const startEditingPermissions = (member) => {
    setEditingPermissionsUserId(member._id);
    const da = member.dashboardAccess || {};
    setEditingPermissions({
      companyBoost: Boolean(da.companyBoost),
      companyLead: Boolean(da.companyLead),
      companyUI: Boolean(da.companyUI)
    });
  };

  const cancelEditingPermissions = () => {
    setEditingPermissionsUserId(null);
  };

  const savePermissions = async (memberId) => {
    try {
      setIsSavingPermissions(true);
      await api.adminUpdateUserPermissions(memberId, editingPermissions);
      showNotice('Dashboard permissions updated successfully and recorded in audit log.');
      setEditingPermissionsUserId(null);
      await loadAdminData();
    } catch (err) {
      showNotice(err.message || 'Failed to update dashboard permissions.');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Add Team User Modal State & Handlers
  const [isAddTeamUserModalOpen, setIsAddTeamUserModalOpen] = useState(false);
  const [newTeamUserData, setNewTeamUserData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'ACTIVE',
    dashboardAccess: {
      companyBoost: false,
      companyLead: false,
      companyUI: false
    }
  });
  const [isCreatingTeamUser, setIsCreatingTeamUser] = useState(false);

  const handleOpenAddTeamUserModal = () => {
    setNewTeamUserData({
      name: '',
      email: '',
      password: '',
      status: 'ACTIVE',
      dashboardAccess: {
        companyBoost: false,
        companyLead: false,
        companyUI: false
      }
    });
    setIsAddTeamUserModalOpen(false);
    setTimeout(() => setIsAddTeamUserModalOpen(true), 10);
  };

  const handleCreateTeamUser = async (e) => {
    e.preventDefault();
    if (!newTeamUserData.name.trim() || !newTeamUserData.email.trim() || !newTeamUserData.password.trim()) {
      showNotice('Please provide full name, email, and password.');
      return;
    }
    const hasAnyAccess = newTeamUserData.dashboardAccess.companyBoost || 
                         newTeamUserData.dashboardAccess.companyLead || 
                         newTeamUserData.dashboardAccess.companyUI;
    if (!hasAnyAccess) {
      showNotice('Please select at least one dashboard to grant access to.');
      return;
    }

    try {
      setIsCreatingTeamUser(true);
      await api.adminCreateTeamUser({
        name: newTeamUserData.name.trim(),
        email: newTeamUserData.email.trim(),
        password: newTeamUserData.password.trim(),
        status: newTeamUserData.status,
        dashboardAccess: newTeamUserData.dashboardAccess
      });
      showNotice(`Team member ${newTeamUserData.name} created successfully with selected dashboard access.`);
      setIsAddTeamUserModalOpen(false);
      await loadAdminData();
    } catch (err) {
      showNotice(err.message || 'Failed to create team member.');
    } finally {
      setIsCreatingTeamUser(false);
    }
  };

  // Delete Team Member State & Handler (Requirement 4)
  const [deletingTeamMember, setDeletingTeamMember] = useState(null);
  const [isDeletingTeamMember, setIsDeletingTeamMember] = useState(false);

  const handleConfirmDeleteTeamMember = async () => {
    if (!deletingTeamMember) return;
    const targetId = deletingTeamMember._id || deletingTeamMember.id;
    try {
      setIsDeletingTeamMember(true);
      await api.adminDeleteTeamMember(targetId);
      // Immediately remove from UI state
      setUsers(prev => prev.filter(u => String(u._id || u.id) !== String(targetId)));
      showNotice(`Team user "${deletingTeamMember.name}" deleted successfully.`);
      setDeletingTeamMember(null);
      await loadAdminData();
    } catch (err) {
      showNotice(err.message || 'Failed to delete team member.');
    } finally {
      setIsDeletingTeamMember(false);
    }
  };

  // Filter clients
  const filteredClients = clientUsers.filter(c => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalClientPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const paginatedClients = filteredClients.slice((clientsPage - 1) * ITEMS_PER_PAGE, clientsPage * ITEMS_PER_PAGE);

  const totalTicketPages = Math.ceil(requests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTickets = requests.slice((ticketsPage - 1) * ITEMS_PER_PAGE, ticketsPage * ITEMS_PER_PAGE);

  return (
    <div className="portal-root">
      {/* 0. AMBIENT COSMIC BACKGROUND (LAYERED AT Z-INDEX: 0, NON-BLOCKING) */}
      <PortalCosmicBackground />

      {/* 1. SIDEBAR */}
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
          <div className="portal-company-badge">
            <div className="portal-company-badge-label">Master Portal</div>
            <div className="portal-company-badge-name">
              SUPER ADMIN
            </div>
          </div>
        )}

        <nav className="portal-sidebar-nav">
          <div className="portal-nav-section-title">Administration</div>
          
          <button 
            className={`portal-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setIsMobileDrawerOpen(false); }}
            title="Admin Central"
          >
            <ShieldCheck size={18} />
            <span>Admin Central</span>
          </button>

          <button 
            className={`portal-nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => { setActiveTab('clients'); setIsMobileDrawerOpen(false); }}
            title="Client Users"
          >
            <Building size={18} />
            <span>Client Users</span>
            <span className="portal-nav-badge">{clientUsers.length}</span>
          </button>

          <button 
            className={`portal-nav-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => { setActiveTab('teams'); setIsMobileDrawerOpen(false); }}
            title="Team & Dashboard Permissions"
          >
            <UserCheck size={18} />
            <span>Team & Permissions</span>
            <span className="portal-nav-badge" style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF' }}>{teamMembers.length}</span>
          </button>

          <button 
            className={`portal-nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => { setActiveTab('services'); setIsMobileDrawerOpen(false); }}
            title="Service Requests"
          >
            <Layers size={18} />
            <span>Service Requests</span>
          </button>

          <button 
            className={`portal-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tickets'); setIsMobileDrawerOpen(false); }}
            title="Tickets"
          >
            <TicketCheck size={18} />
            <span>Tickets</span>
            <span className="portal-nav-badge" style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF' }}>{requests.length}</span>
          </button>

          <button 
            className={`portal-nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('payments'); setIsMobileDrawerOpen(false); }}
            title="Payments"
          >
            <Receipt size={18} />
            <span>Payments</span>
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

        {/* Admin Footer */}
        <div className="portal-sidebar-footer">
          <div className="portal-user-chip">
            <div className="portal-user-avatar" title="Master Admin">A</div>
            {!isSidebarCollapsed && (
              <div className="portal-user-meta">
                <div className="portal-user-name">{user?.name || 'Administrator'}</div>
                <div className="portal-user-role">admin@creativegini.com</div>
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

      {/* 2. MAIN WRAPPER */}
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
                {activeTab === 'overview' && 'CreativeGini Master Admin Dashboard'}
                {activeTab === 'clients' && 'Client Users Management'}
                {activeTab === 'teams' && 'Internal Team Members & Dashboard Permissions'}
                {activeTab === 'services' && 'Service Requests Breakdown'}
                {activeTab === 'tickets' && 'Jira-Style Ticket Center'}
                {activeTab === 'payments' && 'Payment & Revenue Ledger'}
                {activeTab === 'settings' && 'Global Administration Settings'}
              </h2>
              <p>Full system control, user provisioning, revenue monitoring, and global ticket oversight.</p>
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

            {['overview', 'clients'].includes(activeTab) && (
              <button
                className="portal-btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <UserPlus size={16} />
                <span>Create Client User</span>
              </button>
            )}

            {/* Admin Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="portal-profile-chip-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Master Administrator"
              >
                <div className="portal-profile-chip-avatar" style={{ background: 'linear-gradient(135deg, #00AEEF, #00D9FF)', color: '#030303', fontWeight: '800' }}>
                  A
                </div>
                <span className="portal-profile-chip-name">{user?.name || 'Admin'}</span>
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </button>
              {isProfileMenuOpen && (
                <div className="portal-topbar-dropdown" style={{ width: '220px' }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--portal-border)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F5F5F5' }}>{user?.name || 'Master Admin'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>admin@creativegini.com</div>
                  </div>
                  <button
                    className="portal-dropdown-item"
                    onClick={() => {
                      setActiveTab('settings');
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <Settings size={15} />
                    <span>Admin Settings</span>
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
          {toastNotice && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#16A34A', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <CheckCircle2 size={18} />
              <span>{toastNotice}</span>
            </div>
          )}

          {/* TAB 1: ADMIN CENTRAL OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Overview Metrics with Clickable 'Total Clients' - 3 Column Layout for Perfect 2-Row Symmetry */}
              <div className="portal-metrics-grid cols-3">
                <div 
                  className="portal-metric-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('clients')}
                  title="Click to manage Client Users"
                >
                  <div className="portal-metric-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{clientUsers.length}</div>
                    <div className="portal-metric-label">Total Clients (Manage →)</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#16A34A' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{activeClients.length}</div>
                    <div className="portal-metric-label">Active Clients</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' }}>
                    <UserX size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{disabledClients.length}</div>
                    <div className="portal-metric-label">Disabled Clients</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc' }}>
                    <TicketCheck size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{requests.length}</div>
                    <div className="portal-metric-label">Total Requests</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(255, 176, 0, 0.12)', color: '#D97706' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">
                      {requests.filter(r => ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(r.status)).length}
                    </div>
                    <div className="portal-metric-label">Pending Requests</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#16A34A' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">${totalRevenue.toLocaleString()}</div>
                    <div className="portal-metric-label">Total Revenue</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Clients Preview */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>Client User Quick Access</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      Provisioned client accounts linked to pre-researched companies in MongoDB.
                    </p>
                  </div>
                  <button className="portal-btn-primary" onClick={() => setActiveTab('clients')}>
                    Open Client Users ({clientUsers.length})
                  </button>
                </div>

                <div className="jira-table-wrapper table-container">
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Requests</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientUsers.slice(0, 5).map(u => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: '600', color: '#F5F5F5' }}>{u.name}</td>
                          <td style={{ color: '#00D9FF' }}>{u.email}</td>
                          <td style={{ fontWeight: '600', color: '#CBD5E1' }}>{u.companyId?.name || '—'}</td>
                          <td><span style={{ fontSize: '0.72rem', fontWeight: '700', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>USER</span></td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'ACTIVE' ? '#34d399' : '#f87171', border: u.status === 'ACTIVE' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(248, 113, 113, 0.35)' }}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#F5F5F5' }}>{u.requestsCount || 0} Requests</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button 
                                className="portal-btn-secondary" 
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => handleOpenView(u._id)}
                              >
                                View
                              </button>
                              <button 
                                className="portal-btn-secondary" 
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => handleOpenEdit(u)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CLIENT USERS (DEDICATED MANAGEMENT SYSTEM) */}
          {activeTab === 'clients' && (
            <div className="portal-card">
              {/* Header with Search & Filters - Clean and Non-Redundant */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#F5F5F5' }}>Client Users Management</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Manage client profiles, passwords, account statuses, and linked companies in MongoDB.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="portal-form-input"
                      style={{ paddingLeft: '32px', width: '250px' }}
                      placeholder="Search name, email, company..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    className="portal-form-select"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses ({clientUsers.length})</option>
                    <option value="ACTIVE">Active ({activeClients.length})</option>
                    <option value="DISABLED">Disabled ({disabledClients.length})</option>
                  </select>
                </div>
              </div>

              {/* Client Users Table with ActionMenu Popover (Zero Clipping) */}
              <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <table className="jira-table client-users-table" style={{ width: '100%', minWidth: '880px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Client Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th style={{ width: '70px' }}>Role</th>
                      <th style={{ width: '90px' }}>Status</th>
                      <th style={{ width: '85px' }}>Requests</th>
                      <th style={{ width: '95px' }}>Created</th>
                      <th style={{ width: '95px' }}>Last Login</th>
                      <th style={{ textAlign: 'right', width: '175px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No client users match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map(u => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: '700', color: '#F5F5F5' }}>{u.name}</td>
                          <td className="cell-truncate" title={u.email}>
                            <a href={`mailto:${u.email}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>
                              {u.email}
                            </a>
                          </td>
                          <td className="cell-truncate" title={u.companyId?.name || '—'} style={{ fontWeight: '600', color: '#CBD5E1' }}>
                            {u.companyId?.name || '—'}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                              USER
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'ACTIVE' ? '#34d399' : '#f87171', border: u.status === 'ACTIVE' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(248, 113, 113, 0.35)' }}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#F5F5F5' }}>{u.requestsCount || 0} Req</td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <ActionMenu
                              user={u}
                              onView={handleOpenView}
                              onEdit={handleOpenEdit}
                              onResetPassword={(user) => { setResettingUser(user); setResetSuccessPass(null); }}
                              onToggleStatus={handleToggleStatus}
                              onDelete={(user) => setDeletingUser(user)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalClientPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--portal-border)', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>
                    Showing {(clientsPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(clientsPage * ITEMS_PER_PAGE, filteredClients.length)} of {filteredClients.length} users
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      disabled={clientsPage <= 1}
                      onClick={() => setClientsPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: '#00D9FF', fontWeight: '700' }}>
                      {clientsPage} / {totalClientPages}
                    </span>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      disabled={clientsPage >= totalClientPages}
                      onClick={() => setClientsPage(p => Math.min(totalClientPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2.5: INTERNAL TEAM MEMBERS & DASHBOARD PERMISSIONS */}
          {activeTab === 'teams' && (
            <div className="portal-tab-content">
              {/* Header card with summary & architecture callout */}
              <div style={{
                background: '#06111A',
                border: '1px solid var(--portal-border)',
                borderRadius: '14px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F5F5F5', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserCheck size={22} style={{ color: '#00D9FF' }} />
                      <span>Team Member Dashboard Access & Permissions</span>
                    </h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                      Super Admin controls granular dashboard access for each internal team member. Changes take effect immediately and are recorded in the audit log.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: '8px', padding: '6px 14px', color: '#00D9FF', fontSize: '0.85rem', fontWeight: '600' }}>
                      {teamMembers.length} Internal Accounts
                    </div>
                    <button
                      type="button"
                      className="portal-btn-primary"
                      onClick={handleOpenAddTeamUserModal}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.88rem' }}
                    >
                      <UserPlus size={16} />
                      <span>Add User</span>
                    </button>
                  </div>
                </div>

                {/* Security Architecture Notice */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 217, 255, 0.04)',
                  border: '1px solid rgba(0, 217, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <ShieldCheck size={20} style={{ color: '#00D9FF', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <strong style={{ color: '#F5F5F5' }}>Access Control Policy:</strong> Super Admins bypass all dashboard restrictions and possess universal platform access. Team members can only access dashboards explicitly granted below. Automatic ticket assignment upon client payment remains fully autonomous.
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {teamMembers.map((member) => {
                  const isEditing = editingPermissionsUserId === member._id;
                  const isMemberAdmin = member.role === 'ADMIN';
                  const da = member.dashboardAccess || {};

                  return (
                    <div
                      key={member._id}
                      style={{
                        background: '#06111A',
                        border: isEditing ? '1px solid #00D9FF' : '1px solid var(--portal-border)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: isEditing ? '0 0 25px rgba(0, 217, 255, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                        {/* Member Identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 'min(260px, 100%)' }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: isMemberAdmin ? 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)' : 'linear-gradient(135deg, #00D9FF 0%, #0284C7 100%)',
                            color: '#030712',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            flexShrink: 0
                          }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ color: '#F5F5F5', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                                {member.name}
                              </h4>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '700',
                                background: member.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: member.status === 'ACTIVE' ? '#34D399' : '#EF4444'
                              }}>
                                {member.status || 'ACTIVE'}
                              </span>
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '2px' }}>
                              {member.email}
                            </div>
                            <div style={{ color: '#00D9FF', fontSize: '0.8rem', fontWeight: '600', marginTop: '2px' }}>
                              {member.role === 'ADMIN' ? 'Super Admin' : member.role === 'COMPANY_LEAD' ? 'Company Lead Specialist' : member.role === 'COMPANY_BOOST' ? 'Growth Strategist' : member.role === 'LANDING_PAGE' ? 'UI/UX Architect' : member.role}
                            </div>
                          </div>
                        </div>

                        {/* Dashboard Access Checklist */}
                        <div style={{ flex: 1, minWidth: 'min(280px, 100%)', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: '700', marginBottom: '10px' }}>
                            Dashboard Access:
                          </div>

                          {isMemberAdmin ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFB000', fontSize: '0.92rem', fontWeight: '700' }}>
                                <ShieldCheck size={18} />
                                <span>Super Admin</span>
                              </div>
                              <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                                Universal Access
                              </div>
                            </div>
                          ) : isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F5F5F5', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={editingPermissions.companyBoost}
                                  onChange={(e) => setEditingPermissions(prev => ({ ...prev, companyBoost: e.target.checked }))}
                                  style={{ width: '18px', height: '18px', accentColor: '#00D9FF', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: editingPermissions.companyBoost ? '600' : '400' }}>
                                  Company Boost
                                </span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F5F5F5', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={editingPermissions.companyLead}
                                  onChange={(e) => setEditingPermissions(prev => ({ ...prev, companyLead: e.target.checked }))}
                                  style={{ width: '18px', height: '18px', accentColor: '#00D9FF', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: editingPermissions.companyLead ? '600' : '400' }}>
                                  Company Lead
                                </span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F5F5F5', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={editingPermissions.companyUI}
                                  onChange={(e) => setEditingPermissions(prev => ({ ...prev, companyUI: e.target.checked }))}
                                  style={{ width: '18px', height: '18px', accentColor: '#00D9FF', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: editingPermissions.companyUI ? '600' : '400' }}>
                                  Company UI
                                </span>
                              </label>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.8rem',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                background: da.companyBoost ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: da.companyBoost ? '#00D9FF' : '#64748B',
                                border: `1px solid ${da.companyBoost ? 'rgba(0, 217, 255, 0.3)' : 'transparent'}`
                              }}>
                                {da.companyBoost ? '✓ Company Boost' : '✕ Company Boost'}
                              </span>

                              <span style={{
                                fontSize: '0.8rem',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                background: da.companyLead ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: da.companyLead ? '#00D9FF' : '#64748B',
                                border: `1px solid ${da.companyLead ? 'rgba(0, 217, 255, 0.3)' : 'transparent'}`
                              }}>
                                {da.companyLead ? '✓ Company Lead' : '✕ Company Lead'}
                              </span>

                              <span style={{
                                fontSize: '0.8rem',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                background: da.companyUI ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: da.companyUI ? '#34D399' : '#64748B',
                                border: `1px solid ${da.companyUI ? 'rgba(52, 211, 153, 0.3)' : 'transparent'}`
                              }}>
                                {da.companyUI ? '✓ Company UI' : '✕ Company UI'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Edit Access / Delete User / Save Changes / Cancel */}
                        <div style={{ minWidth: 'auto', textAlign: 'right' }}>
                          {isMemberAdmin ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#64748B', fontSize: '0.82rem', fontWeight: '600' }}>
                              <ShieldCheck size={16} style={{ color: '#FFB000' }} />
                              <span>Protected Super Admin</span>
                            </div>
                          ) : isEditing ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="portal-btn-primary"
                                onClick={() => savePermissions(member._id)}
                                disabled={isSavingPermissions}
                                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                              >
                                <Check size={14} />
                                <span>{isSavingPermissions ? 'Saving...' : 'Save Changes'}</span>
                              </button>
                              <button
                                type="button"
                                className="portal-btn-secondary"
                                onClick={cancelEditingPermissions}
                                disabled={isSavingPermissions}
                                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                              >
                                <X size={14} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="portal-btn-secondary"
                                onClick={() => startEditingPermissions(member)}
                                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                              >
                                <Edit3 size={14} />
                                <span>Edit Access</span>
                              </button>
                              <button
                                type="button"
                                className="portal-btn-secondary"
                                onClick={() => setDeletingTeamMember(member)}
                                style={{
                                  padding: '8px 14px',
                                  fontSize: '0.85rem',
                                  color: '#EF4444',
                                  borderColor: 'rgba(239, 68, 68, 0.35)',
                                  background: 'rgba(239, 68, 68, 0.06)'
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE REQUESTS BREAKDOWN */}
          {activeTab === 'services' && (
            <>
              {/* Service Cards with Dark Cosmic Styling */}
              <div className="portal-metrics-grid cols-3" style={{ marginBottom: '24px' }}>
                {[
                  {
                    key: 'COMPANY_LEAD',
                    title: 'Company Lead',
                    subtitle: 'B2B Outbound & Prospect Intelligence',
                    color: '#2563EB',
                    bg: 'rgba(0, 217, 255, 0.12)',
                    borderColor: 'rgba(0, 217, 255, 0.25)',
                    icon: Users
                  },
                  {
                    key: 'COMPANY_BOOST',
                    title: 'Company Boost',
                    subtitle: 'Autonomous Growth & Strategy Playbooks',
                    color: '#c084fc',
                    bg: 'rgba(139, 92, 246, 0.12)',
                    borderColor: 'rgba(139, 92, 246, 0.25)',
                    icon: TrendingUp
                  },
                  {
                    key: 'LANDING_PAGE',
                    title: 'Landing Page Enhancement',
                    subtitle: 'WebGL Architecture & Conversion Optimization',
                    color: '#16A34A',
                    bg: 'rgba(16, 185, 129, 0.12)',
                    borderColor: 'rgba(16, 185, 129, 0.25)',
                    icon: Globe
                  }
                ].map(srv => {
                  const sRequests = requests.filter(r => r.serviceType === srv.key);
                  const completed = sRequests.filter(r => r.status === 'COMPLETED').length;
                  const active = sRequests.filter(r => r.status !== 'COMPLETED').length;
                  const IconComp = srv.icon;
                  return (
                    <div key={srv.key} className="portal-card" style={{ marginBottom: 0, borderColor: srv.borderColor }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: srv.bg, color: srv.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconComp size={20} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: srv.bg, color: srv.color }}>
                          {sRequests.length} Total Sprints
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: '#F5F5F5' }}>{srv.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.4 }}>{srv.subtitle}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid var(--portal-border)', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ACTIVE SPRINTS</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: srv.color }}>{active}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>COMPLETED</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34D399' }}>{completed}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Service Requests Detail Ledger */}
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>Service Sprints Breakdown</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      Complete registry of all requested CreativeGini sprints with real-time assignment tracking.
                    </p>
                  </div>
                </div>

                <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                  <table className="jira-table">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Sprint ID</th>
                        <th style={{ width: '130px' }}>Service Type</th>
                        <th>Sprint Scope</th>
                        <th style={{ width: '140px' }}>Client</th>
                        <th style={{ width: '130px' }}>Status</th>
                        <th style={{ width: '90px' }}>Priority</th>
                        <th style={{ width: '80px' }}>Price</th>
                        <th style={{ width: '110px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr key={r._id}>
                          <td><span className="ticket-key" onClick={() => handleOpenTicket(r)}>{r.ticketId}</span></td>
                          <td><span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF' }}>{r.serviceType.replace('_', ' ')}</span></td>
                          <td className="cell-truncate" title={r.title} style={{ fontWeight: '600', color: '#F5F5F5' }}>{r.title}</td>
                          <td style={{ color: '#CBD5E1' }}>{r.companyId?.name || 'Client'}</td>
                          <td><span className={`status-pill ${r.status}`}>{r.status.replace(/_/g, ' ')}</span></td>
                          <td><span className={`priority-pill ${r.priority}`}>{r.priority}</span></td>
                          <td style={{ fontWeight: '700', color: '#34D399' }}>${r.price || 0}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="portal-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleOpenTicket(r)}
                            >
                              View Ticket
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 4: TICKETS */}
          {activeTab === 'tickets' && (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>All System Tickets</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    Global ticket management overview with client conversation streams and lifecycle transition.
                  </p>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#00D9FF', fontWeight: '600', background: 'rgba(0, 217, 255, 0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(0, 217, 255, 0.3)' }}>
                  Total Tickets: {requests.length}
                </div>
              </div>

              <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                <table className="jira-table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Ticket ID</th>
                      <th>Request Title</th>
                      <th style={{ width: '130px' }}>Client</th>
                      <th style={{ width: '120px' }}>Service</th>
                      <th style={{ width: '150px' }}>Assigned Specialist</th>
                      <th style={{ width: '130px' }}>Status</th>
                      <th style={{ width: '90px' }}>Deliverables</th>
                      <th style={{ width: '95px' }}>Created Date</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No tickets created in the system yet.
                        </td>
                      </tr>
                    ) : (
                      paginatedTickets.map(r => (
                        <tr key={r._id}>
                          <td><span className="ticket-key" onClick={() => handleOpenTicket(r)}>{r.ticketId}</span></td>
                          <td className="cell-truncate" title={r.title} style={{ fontWeight: '600', color: '#F5F5F5' }}>{r.title}</td>
                          <td style={{ color: '#CBD5E1' }}>{r.companyId?.name || 'Client'}</td>
                          <td><span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#00D9FF' }}>{r.serviceType.replace('_', ' ')}</span></td>
                          <td>
                            {r.assignedTo ? (
                              <span style={{ fontSize: '0.8rem', color: '#F5F5F5', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <UserCheck size={13} color="#34d399" />
                                {r.assignedTo.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                {r.assignedTeam ? `${r.assignedTeam.replace('_', ' ')} (Unassigned)` : 'Unassigned'}
                              </span>
                            )}
                          </td>
                          <td><span className={`status-pill ${r.status}`}>{r.status.replace(/_/g, ' ')}</span></td>
                          <td>
                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: r.currentSubmissionVersion ? '#00D9FF' : '#94A3B8' }}>
                              {r.currentSubmissionVersion ? `v${r.currentSubmissionVersion}` : '—'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                className="portal-btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                onClick={() => handleOpenTicket(r)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalTicketPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--portal-border)', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>
                    Showing {(ticketsPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(ticketsPage * ITEMS_PER_PAGE, requests.length)} of {requests.length} tickets
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      disabled={ticketsPage <= 1}
                      onClick={() => setTicketsPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: '#2563EB', fontWeight: '700' }}>
                      {ticketsPage} / {totalTicketPages}
                    </span>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      disabled={ticketsPage >= totalTicketPages}
                      onClick={() => setTicketsPage(p => Math.min(totalTicketPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <>
              {/* Payment Summary Metrics */}
              <div className="portal-metrics-grid cols-3" style={{ marginBottom: '24px' }}>
                <div className="portal-metric-card">
                  <div className="portal-metric-icon green">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">${totalRevenue.toLocaleString()}.00</div>
                    <div className="portal-metric-label">Total Revenue Collected</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon green">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{requests.filter(r => r.paymentStatus === 'PAID').length}</div>
                    <div className="portal-metric-label">Paid Transactions</div>
                  </div>
                </div>

                <div className="portal-metric-card">
                  <div className="portal-metric-icon gold">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="portal-metric-value">{requests.filter(r => r.paymentStatus !== 'PAID').length}</div>
                    <div className="portal-metric-label">Pending Invoices</div>
                  </div>
                </div>
              </div>

              {/* Payment Ledger Table */}
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#F5F5F5' }}>Payment Ledger</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      Complete transaction history for all client service requests and platform sprints.
                    </p>
                  </div>
                </div>

                <div className="jira-table-wrapper table-container" style={{ overflowX: 'auto' }}>
                  <table className="jira-table" style={{ minWidth: '950px' }}>
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Ticket ID & Title</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r, i) => (
                        <tr key={r._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#00D9FF' }}>INV-2026-00{i + 1}</td>
                          <td>
                            <span className="ticket-key" onClick={() => handleOpenTicket(r)} style={{ marginRight: '8px' }}>
                              {r.ticketId}
                            </span>
                            <span style={{ color: '#F5F5F5' }}>{r.title}</span>
                          </td>
                          <td style={{ color: '#CBD5E1' }}>{r.companyId?.name || 'Client'}</td>
                          <td style={{ fontWeight: '700', color: '#34D399' }}>${r.price}.00</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: r.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                              color: r.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24',
                              border: r.paymentStatus === 'PAID' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(251, 191, 36, 0.35)'
                            }}>
                              {r.paymentStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              <div className="portal-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5' }}>Database & Infrastructure</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MongoDB Atlas Cluster Health</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Cluster Status:</span>
                    <span style={{ color: '#34D399', fontWeight: '700' }}>ONLINE (Connected)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Cluster Name:</span>
                    <span style={{ color: '#CBD5E1', fontWeight: '600' }}>CreativeGiniCluster</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Multi-Tenant Isolation:</span>
                    <span style={{ color: '#00D9FF', fontWeight: '600' }}>Company ID Scoped</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Database Engine:</span>
                    <span style={{ color: '#F5F5F5' }}>Mongoose ODM 8.x</span>
                  </div>
                </div>
              </div>

              <div className="portal-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5' }}>Security & Authorization</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cryptographic & Access Tokens</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Password Hashing:</span>
                    <span style={{ color: '#CBD5E1', fontWeight: '600' }}>bcryptjs (10 Salt Rounds)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Authentication Type:</span>
                    <span style={{ color: '#00D9FF', fontWeight: '600' }}>Stateless JWT Bearer</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>JWT Token Lifetime:</span>
                    <span style={{ color: '#F5F5F5' }}>7 Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>RBAC Enforced:</span>
                    <span style={{ color: '#34D399', fontWeight: '700' }}>5 Protected Roles</span>
                  </div>
                </div>
              </div>

              <div className="portal-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255, 176, 0, 0.12)', color: '#FFB000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#F5F5F5' }}>Master Administrator</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Session Privileges</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Operator:</span>
                    <span style={{ color: '#F5F5F5', fontWeight: '700' }}>{user?.name || 'CreativeGini Admin'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Email:</span>
                    <span style={{ color: '#00D9FF' }}>{user?.email || 'admin@creativegini.com'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--portal-border)' }}>
                    <span style={{ color: '#94a3b8' }}>Privileges:</span>
                    <span style={{ color: '#FFB000', fontWeight: '700' }}>SUPER ADMIN (Full Override)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Environment:</span>
                    <span style={{ color: '#F5F5F5' }}>Production-Ready Node/Vite</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CREATE CLIENT USER FORM */}
      {isCreateModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                  Create Client User
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                  Role is strictly USER. Client company background and initial research are stored in MongoDB.
                </p>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="portal-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Client Name *</label>
                    <input
                      className="portal-form-input"
                      value={createFormData.contactPerson}
                      onChange={e => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
                      placeholder="e.g. John Smith"
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Email *</label>
                    <input
                      type="email"
                      className="portal-form-input"
                      value={createFormData.email}
                      onChange={e => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Company Name *</label>
                    <input
                      className="portal-form-input"
                      value={createFormData.companyName}
                      onChange={e => setCreateFormData({ ...createFormData, companyName: e.target.value })}
                      placeholder="e.g. ABC Technologies"
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Temporary Password *</label>
                    <input
                      className="portal-form-input"
                      value={createFormData.password}
                      onChange={e => setCreateFormData({ ...createFormData, password: e.target.value })}
                      placeholder="Client@123"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Phone (Optional)</label>
                    <input
                      className="portal-form-input"
                      value={createFormData.phone}
                      onChange={e => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Website (Optional)</label>
                    <input
                      className="portal-form-input"
                      value={createFormData.website}
                      onChange={e => setCreateFormData({ ...createFormData, website: e.target.value })}
                      placeholder="https://abctech.com"
                    />
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Company Description / Research Summary</label>
                  <textarea
                    className="portal-form-textarea"
                    rows="2"
                    value={createFormData.companyInfo}
                    onChange={e => setCreateFormData({ ...createFormData, companyInfo: e.target.value })}
                    placeholder="Initial details and market positioning..."
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating User in MongoDB...' : 'Create Client User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATION SUCCESS SCREEN (WITH ONE-TIME TEMPORARY PASSWORD) */}
      {creationSuccessData && (
        <div className="portal-modal-overlay" onClick={() => setCreationSuccessData(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '520px', border: '1px solid rgba(16, 185, 129, 0.35)' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header" style={{ borderBottom: '1px solid var(--portal-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#F5F5F5' }}>
                    Client User Created
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#34D399' }}>Provisioned successfully in MongoDB Atlas</span>
                </div>
              </div>
            </div>

            <div className="portal-modal-body" style={{ paddingTop: '1rem' }}>
              <div style={{ background: 'var(--portal-surface-card)', border: '1px solid var(--portal-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: '#94a3b8' }}>Client Name:</span> <div style={{ fontWeight: '700', color: '#F5F5F5' }}>{creationSuccessData.name}</div></div>
                <div><span style={{ color: '#94a3b8' }}>Role:</span> <div><span style={{ fontSize: '0.72rem', fontWeight: '700', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>USER</span></div></div>
                <div><span style={{ color: '#94a3b8' }}>Email:</span> <div style={{ fontWeight: '600', color: '#00D9FF' }}>{creationSuccessData.email}</div></div>
                <div><span style={{ color: '#94a3b8' }}>Company:</span> <div style={{ fontWeight: '700', color: '#CBD5E1' }}>{creationSuccessData.company}</div></div>
              </div>

              {/* Temporary Password Box */}
              <div style={{ background: 'rgba(255, 176, 0, 0.08)', border: '1px solid rgba(255, 176, 0, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#FFB000', marginBottom: '6px', letterSpacing: '0.04em' }}>
                  Temporary Password
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(4, 12, 18, 0.95)', border: '1px solid rgba(255, 176, 0, 0.35)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  <code style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFB000', letterSpacing: '0.05em' }}>
                    {creationSuccessData.temporaryPassword}
                  </code>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => handleCopyPassword(creationSuccessData.temporaryPassword)}
                  >
                    {copiedKey ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#FFB000', marginTop: '8px', lineHeight: '1.4' }}>
                  Make sure you save this temporary password. It will not be shown again.
                </div>
              </div>
            </div>

            <div className="portal-modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                className="portal-btn-secondary"
                onClick={() => {
                  setCreationSuccessData(null);
                  setIsCreateModalOpen(true);
                }}
              >
                Create Another User
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="portal-btn-secondary"
                  onClick={() => setCreationSuccessData(null)}
                >
                  Close
                </button>
                {creationSuccessData.id && (
                  <button
                    className="portal-btn-primary"
                    onClick={() => {
                      const id = creationSuccessData.id;
                      setCreationSuccessData(null);
                      handleOpenView(id);
                    }}
                  >
                    View User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW USER DETAIL MODAL (REQUIREMENT 2) */}
      {viewingUser && (
        <div className="portal-modal-overlay" onClick={() => { setViewingUser(null); setViewUserData(null); }}>
          <div className="portal-modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F5F5F5' }}>
                  Client User Profile
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Complete account overview, company relationship, requests & payments
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => { setViewingUser(null); setViewUserData(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              {!viewUserData ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading user details from MongoDB...</div>
              ) : (
                <>
                  {/* CLIENT INFORMATION */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      Client Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.875rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Name:</span> <div style={{ fontWeight: '700', color: '#F5F5F5' }}>{viewUserData.user?.name}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Email:</span> <div style={{ fontWeight: '600', color: '#00D9FF' }}>{viewUserData.user?.email}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Phone:</span> <div style={{ fontWeight: '600', color: '#F5F5F5' }}>{viewUserData.user?.phone || '—'}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Role:</span> <div><span style={{ fontSize: '0.72rem', fontWeight: '700', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', border: '1px solid rgba(0, 217, 255, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>USER</span></div></div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Account Status:</span>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: viewUserData.user?.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: viewUserData.user?.status === 'ACTIVE' ? '#34d399' : '#f87171', border: viewUserData.user?.status === 'ACTIVE' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(248, 113, 113, 0.35)' }}>
                            {viewUserData.user?.status}
                          </span>
                        </div>
                      </div>
                      <div><span style={{ color: '#94a3b8' }}>Created Date:</span> <div style={{ fontWeight: '600', color: '#F5F5F5' }}>{new Date(viewUserData.user?.createdAt).toLocaleDateString()}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Last Login:</span> <div style={{ fontWeight: '600', color: '#F5F5F5' }}>{viewUserData.user?.lastLogin ? new Date(viewUserData.user.lastLogin).toLocaleString() : 'Never'}</div></div>
                    </div>
                  </div>

                  {/* COMPANY INFORMATION */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      Company Information (Linked via MongoDB)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.875rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Company Name:</span> <div style={{ fontWeight: '700', color: '#CBD5E1' }}>{viewUserData.user?.companyId?.name || '—'}</div></div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Website:</span> 
                        <div>
                          {viewUserData.user?.companyId?.website ? (
                            <a href={viewUserData.user.companyId.website} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', fontWeight: '600' }}>
                              {viewUserData.user.companyId.website}
                            </a>
                          ) : '—'}
                        </div>
                      </div>
                      <div><span style={{ color: '#94a3b8' }}>Industry:</span> <div style={{ fontWeight: '600', color: '#F5F5F5' }}>{viewUserData.user?.companyId?.industry || 'Technology'}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Location:</span> <div style={{ fontWeight: '600', color: '#F5F5F5' }}>Global / Remote</div></div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#94a3b8' }}>Description:</span> 
                        <div style={{ color: '#CBD5E1', marginTop: '4px', lineHeight: '1.5', background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                          {viewUserData.user?.companyId?.companyInfo || viewUserData.user?.companyId?.researchSummary || 'Pre-researched company record provided by CreativeGini.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNT INFORMATION */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      Account Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.875rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>User ID:</span> <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#00D9FF' }}>{viewUserData.user?._id}</div></div>
                      <div><span style={{ color: '#94a3b8' }}>Company ID:</span> <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#00D9FF' }}>{viewUserData.user?.companyId?._id || '—'}</div></div>
                    </div>
                  </div>

                  {/* REQUEST SUMMARY */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      Request Summary
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Requests</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F5F5F5' }}>{viewUserData.requestSummary?.total || 0}</div>
                      </div>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Company Lead</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00D9FF' }}>{viewUserData.requestSummary?.companyLead || 0}</div>
                      </div>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Company Boost</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFB000' }}>{viewUserData.requestSummary?.companyBoost || 0}</div>
                      </div>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Landing Page</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34D399' }}>{viewUserData.requestSummary?.landingPage || 0}</div>
                      </div>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34D399' }}>{viewUserData.requestSummary?.completed || 0}</div>
                      </div>
                      <div style={{ background: 'var(--portal-surface-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFB000' }}>{viewUserData.requestSummary?.pending || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT SUMMARY */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      Payment Summary
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Total Paid</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#34D399' }}>${(viewUserData.paymentSummary?.totalPaid || 0).toLocaleString()} USD</div>
                      </div>
                      <div style={{ background: 'rgba(255, 176, 0, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 176, 0, 0.25)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#FFB000' }}>Pending Payments</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFB000' }}>{viewUserData.paymentSummary?.pending || 0}</div>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.25)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#EF4444' }}>Failed Payments</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EF4444' }}>{viewUserData.paymentSummary?.failed || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* CLIENT TICKETS & JIRA CONVERSATIONS */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', margin: 0, letterSpacing: '0.04em' }}>
                        Client Tickets & Jira Conversations
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {(viewUserData.requests || []).length} Total Ticket{(viewUserData.requests || []).length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {(!viewUserData.requests || viewUserData.requests.length === 0) ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', background: 'var(--portal-surface-card)', borderRadius: '8px', border: '1px dashed var(--portal-border)', color: '#94a3b8', fontSize: '0.82rem' }}>
                        No tickets submitted by this client yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {viewUserData.requests.map(req => {
                          const svcColor = req.serviceType === 'COMPANY_BOOST' ? '#FFB000' : req.serviceType === 'COMPANY_LEAD' ? '#00D9FF' : '#a855f7';
                          const svcName = req.serviceType === 'COMPANY_BOOST' ? 'Company Boost' : req.serviceType === 'COMPANY_LEAD' ? 'Company Lead' : 'Landing Page';
                          return (
                            <div
                              key={req._id}
                              style={{
                                background: 'var(--portal-surface-card)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderLeft: `3px solid ${svcColor}`,
                                borderRadius: '8px',
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '8px'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#FFFFFF' }}>{req.ticketId}</span>
                                  <span style={{ fontSize: '0.7rem', color: svcColor, fontWeight: '700' }}>{svcName}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#F5F5F5', fontWeight: '600', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {req.title}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                  Status: <span style={{ color: '#00D9FF', fontWeight: '600' }}>{req.status}</span>
                                  {req.assignedTo && <span> • {req.assignedTo.name || 'Specialist'}</span>}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingUser(null);
                                  setViewUserData(null);
                                  handleOpenTicket(req, 'chat');
                                }}
                                style={{
                                  background: 'rgba(0, 217, 255, 0.1)',
                                  border: '1px solid rgba(0, 217, 255, 0.25)',
                                  color: '#00D9FF',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  marginTop: '4px'
                                }}
                              >
                                <MessageSquare size={13} /> Open Jira Conversation
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* RECENT ACTIVITY */}
                  {viewUserData.activity && viewUserData.activity.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', borderBottom: '1px solid rgba(0, 217, 255, 0.15)', paddingBottom: '0.4rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                        Recent Account Activity
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {viewUserData.activity.map(act => (
                          <div key={act._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--portal-surface-card)', border: '1px solid var(--portal-border)', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#F5F5F5' }}>{act.details || act.action}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="portal-modal-footer">
              <button
                className="portal-btn-secondary"
                onClick={() => { setViewingUser(null); setViewUserData(null); }}
              >
                Close
              </button>
              {viewUserData && (
                <button
                  className="portal-btn-primary"
                  onClick={() => {
                    const u = viewUserData.user;
                    setViewingUser(null);
                    setViewUserData(null);
                    handleOpenEdit(u);
                  }}
                >
                  Edit User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT USER MODAL (REQUIREMENT 3) */}
      {editingUser && (
        <div className="portal-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                  Edit Client User
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Passwords cannot be directly edited here; use Reset Password.
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setEditingUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="portal-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Client Name *</label>
                    <input
                      className="portal-form-input"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Email *</label>
                    <input
                      type="email"
                      className="portal-form-input"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Phone</label>
                    <input
                      className="portal-form-input"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Account Status</label>
                    <select
                      className="portal-form-select"
                      value={editFormData.status}
                      onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Company Name</label>
                    <input
                      className="portal-form-input"
                      value={editFormData.companyName}
                      onChange={e => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Website</label>
                    <input
                      className="portal-form-input"
                      value={editFormData.website}
                      onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Industry</label>
                  <input
                    className="portal-form-input"
                    value={editFormData.industry}
                    onChange={e => setEditFormData({ ...editFormData, industry: e.target.value })}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Company Description</label>
                  <textarea
                    className="portal-form-textarea"
                    rows="2"
                    value={editFormData.companyInfo}
                    onChange={e => setEditFormData({ ...editFormData, companyInfo: e.target.value })}
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RESET PASSWORD CONFIRMATION & DISPLAY (REQUIREMENT 4) */}
      {resettingUser && (
        <div className="portal-modal-overlay" onClick={() => { setResettingUser(null); setResetSuccessPass(null); }}>
          <div className="portal-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                {resetSuccessPass ? 'Password Reset Complete' : 'Reset Password'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => { setResettingUser(null); setResetSuccessPass(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              {!resetSuccessPass ? (
                <div>
                  <p style={{ color: '#F5F5F5', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Reset password for this client?
                  </p>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '4px' }}><strong style={{ color: '#94A3B8' }}>Client:</strong> <span style={{ color: '#F5F5F5', fontWeight: '700' }}>{resettingUser.name}</span></div>
                    <div style={{ marginBottom: '4px' }}><strong style={{ color: '#94A3B8' }}>Email:</strong> <span style={{ color: '#00D9FF' }}>{resettingUser.email}</span></div>
                    <div><strong style={{ color: '#94A3B8' }}>Company:</strong> <span style={{ color: '#CBD5E1', fontWeight: '600' }}>{resettingUser.companyId?.name || '—'}</span></div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                    A new secure temporary password will be generated and hashed in MongoDB with bcrypt. The temporary password will only be shown to you once so you can provide it to the client.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: '700', marginBottom: '1rem' }}>
                    <CheckCircle2 size={20} />
                    <span>Password has been reset successfully.</span>
                  </div>

                  <div style={{ background: 'rgba(255, 176, 0, 0.08)', border: '1px solid rgba(255, 176, 0, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#D97706', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      New Temporary Password
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: '#F8FAFC', border: '1px solid rgba(255, 176, 0, 0.35)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                      <code style={{ fontSize: '1.05rem', fontWeight: '800', color: '#D97706', letterSpacing: '0.05em' }}>
                        {resetSuccessPass}
                      </code>
                      <button
                        type="button"
                        className="portal-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleCopyPassword(resetSuccessPass)}
                      >
                        {copiedKey ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        {copiedKey ? 'Copied' : 'Copy Password'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#D97706', marginTop: '8px', lineHeight: '1.4' }}>
                      Make sure you save this temporary password. It will not be shown again.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="portal-modal-footer">
              {!resetSuccessPass ? (
                <>
                  <button
                    className="portal-btn-secondary"
                    onClick={() => setResettingUser(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="portal-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    onClick={handleConfirmResetPassword}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              ) : (
                <button
                  className="portal-btn-primary"
                  onClick={() => { setResettingUser(null); setResetSuccessPass(null); }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: TICKET INSPECTION & WORKFLOW OVERSIGHT MODAL */}
      {selectedTicket && (
        <div className="portal-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="portal-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div>
                <div className="portal-modal-header-badges">
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#00D9FF', fontSize: '1.15rem' }}>
                    {selectedTicket.ticketId}
                  </span>
                  <span className={`status-pill ${selectedTicket.status}`}>
                    {selectedTicket.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`priority-pill ${selectedTicket.priority}`}>
                    {selectedTicket.priority}
                  </span>
                  {selectedTicket.currentSubmissionVersion ? (
                    <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', fontWeight: '700', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                      Deliverables v{selectedTicket.currentSubmissionVersion}
                    </span>
                  ) : null}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px', marginBottom: 0, color: '#F5F5F5' }}>
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
                  paddingBottom: '8px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('scope')}
                  style={{
                    background: activeTicketModalTab === 'scope' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'scope' ? '#00D9FF' : '#94A3B8',
                    border: activeTicketModalTab === 'scope' ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid transparent',
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
                  <TicketCheck size={15} /> Scope & Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('deliverables')}
                  style={{
                    background: activeTicketModalTab === 'deliverables' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'deliverables' ? '#00D9FF' : '#94A3B8',
                    border: activeTicketModalTab === 'deliverables' ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid transparent',
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
                  onClick={() => setActiveTicketModalTab('chat')}
                  style={{
                    background: activeTicketModalTab === 'chat' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'chat' ? '#00D9FF' : '#94A3B8',
                    border: activeTicketModalTab === 'chat' ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid transparent',
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
                  <MessageSquare size={15} /> Conversation ({ticketMessages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModalTab('activity')}
                  style={{
                    background: activeTicketModalTab === 'activity' ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                    color: activeTicketModalTab === 'activity' ? '#00D9FF' : '#94A3B8',
                    border: activeTicketModalTab === 'activity' ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid transparent',
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
                  <Activity size={15} /> Audit Activity Timeline
                </button>
              </div>

              {/* TAB 1: SCOPE & ASSIGNMENT */}
              {activeTicketModalTab === 'scope' && (
                <div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Client:</span>
                      <div style={{ color: '#F5F5F5', fontWeight: '700' }}>{selectedTicket.companyId?.name || 'Client'}</div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Service:</span>
                      <div style={{ color: '#00D9FF', fontWeight: '700' }}>{selectedTicket.serviceType.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Assigned Specialist:</span>
                      <div style={{ color: '#34D399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <UserCheck size={14} />
                        {selectedTicket.assignedTo?.name || (selectedTicket.assignedTeam ? `${selectedTicket.assignedTeam} (Unassigned)` : 'Not Assigned')}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Price & Payment:</span>
                      <div style={{ color: '#34D399', fontWeight: '700' }}>
                        ${selectedTicket.price || 0}.00 ({selectedTicket.paymentStatus || 'PAID'})
                      </div>
                    </div>
                  </div>

                  <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#00D9FF', marginBottom: '6px', letterSpacing: '0.04em' }}>Requirement Scope</h5>
                  <p style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', margin: '0 0 1rem 0', color: '#CBD5E1', lineHeight: 1.5 }}>
                    {selectedTicket.description}
                  </p>

                  {/* Override Warning or Notification if Overridden */}
                  {selectedTicket.adminOverride?.isOverridden && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={15} /> Administratively Overridden to COMPLETED
                      </div>
                      <div style={{ color: '#CBD5E1', fontSize: '0.8rem', marginTop: '4px' }}>
                        Reason logged: "{selectedTicket.adminOverride.reason}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DELIVERABLES & SUBMISSIONS */}
              {activeTicketModalTab === 'deliverables' && (
                <div>
                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 10px 0', letterSpacing: '0.04em' }}>
                    All Submitted Deliverables ({ticketSubmissions.length})
                  </h5>
                  {ticketSubmissions.length === 0 ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.85rem', padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                      No formal deliverables submitted through the portal yet.
                    </div>
                  ) : (
                    ticketSubmissions.map((sub) => (
                      <div
                        key={sub._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '14px',
                          marginBottom: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', fontWeight: '700', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                                Version v{sub.version}
                              </span>
                              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#F5F5F5' }}>
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
                              <span className="status-pill COMPLETED" style={{ fontSize: '0.7rem' }}>Approved by Client</span>
                            )}
                            {sub.status === 'CHANGES_REQUESTED' && (
                              <span className="status-pill CHANGES_REQUESTED" style={{ fontSize: '0.7rem' }}>Changes Requested</span>
                            )}
                            {sub.status === 'PENDING_REVIEW' && (
                              <span className="status-pill CLIENT_REVIEW" style={{ fontSize: '0.7rem' }}>Under Client Review</span>
                            )}
                          </div>
                        </div>

                        <p style={{ color: '#CBD5E1', fontSize: '0.84rem', lineHeight: '1.5', margin: '8px 0', background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px' }}>
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
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FileText size={15} color="#00D9FF" />
                                  <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{file.name}</span>
                                </div>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="portal-btn-secondary"
                                  style={{ padding: '3px 8px', fontSize: '0.74rem', textDecoration: 'none' }}
                                >
                                  View / Download
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        {sub.externalLink && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                            <span style={{ color: '#94A3B8' }}>External Link: </span>
                            <a href={sub.externalLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00D9FF', textDecoration: 'none' }}>
                              {sub.externalLink}
                            </a>
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
                              Client Review Feedback ({sub.review.reviewerName || 'Client'}):
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
              )}

              {/* TAB 3: CONVERSATION */}
              {activeTicketModalTab === 'chat' && (
                <div className="ticket-chat-container" style={{ height: '300px', overflowY: 'auto' }}>
                  {ticketMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                      No messages recorded yet.
                    </div>
                  ) : (
                    ticketMessages.map(m => (
                      <div key={m._id} className={`chat-bubble ${m.senderRole === 'USER' ? 'client' : 'team'}`}>
                        <div className="chat-bubble-sender">{m.senderName} ({m.senderRole})</div>
                        <div>{m.text}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: AUDIT ACTIVITY TIMELINE */}
              {activeTicketModalTab === 'activity' && (
                <div>
                  <ActivityTimeline activity={ticketActivity} />
                </div>
              )}
            </div>

            <div className="portal-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedTicket.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    style={{ fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
                    onClick={() => handleOpenOverrideModal(selectedTicket)}
                    title="Administrative override to force mark ticket as COMPLETED"
                  >
                    <ShieldCheck size={14} /> Admin Override: Complete
                  </button>
                )}
              </div>
              <button className="portal-btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN OVERRIDE TO FORCE COMPLETE */}
      {overrideModalTicket && (
        <div className="portal-modal-overlay" onClick={() => setOverrideModalTicket(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '500px', borderTop: '4px solid #ef4444' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
                <ShieldCheck size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                  Administrative Override: Force Complete
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setOverrideModalTicket(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAdminOverride}>
              <div className="portal-modal-body">
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    color: '#FCA5A5',
                    lineHeight: '1.4'
                  }}
                >
                  <strong>Strict Policy Guardrail:</strong> Specialist teams cannot directly mark tickets completed without formal client portal approval. Overriding this restriction requires recording a permanent audit reason.
                </div>

                <div style={{ marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>Target Ticket: </span>
                  <strong style={{ color: '#00D9FF' }}>{overrideModalTicket.ticketId}</strong> — <span style={{ color: '#F5F5F5' }}>{overrideModalTicket.title}</span>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">
                    Mandatory Audit Override Reason *
                  </label>
                  <textarea
                    className="portal-form-textarea"
                    rows="3"
                    placeholder="E.g., Client approved via verified executive email, or fast-track verbal approval on partner call..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setOverrideModalTicket(null)}
                  disabled={isOverriding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#FFFFFF'
                  }}
                  disabled={isOverriding}
                >
                  {isOverriding ? 'Executing Override...' : 'Confirm Force Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE CLIENT USER CONFIRMATION (REQUIREMENT 2) */}
      {deletingUser && (
        <div className="portal-modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '480px', borderTop: '4px solid #ef4444' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
                <AlertTriangle size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                  Delete Client User?
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setDeletingUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              <p style={{ color: '#CBD5E1', fontSize: '0.92rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete this client user? This action cannot be undone.
              </p>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem', color: '#CBD5E1' }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Client Name:</span>
                  <span style={{ fontWeight: '700', color: '#F5F5F5' }}>{deletingUser.name}</span>
                </div>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Email:</span>
                  <span style={{ fontWeight: '600', color: '#00D9FF' }}>{deletingUser.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Company:</span>
                  <span style={{ fontWeight: '600', color: '#CBD5E1' }}>{deletingUser.companyId?.name || '—'}</span>
                </div>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => setDeletingUser(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="portal-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#FFFFFF', fontWeight: '700',
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.35)'
                }}
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ADD NEW INTERNAL TEAM USER (REQUIREMENTS 2, 3, 4, 5) */}
      {isAddTeamUserModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsAddTeamUserModalOpen(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D9FF' }}>
                <UserPlus size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                  Add New Team User
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setIsAddTeamUserModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeamUser}>
              <div className="portal-modal-body">
                {/* Important Role Rule Guardrail Notice */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    marginBottom: '1.25rem',
                    fontSize: '0.84rem',
                    color: '#CBD5E1',
                    lineHeight: '1.45'
                  }}
                >
                  <strong style={{ color: '#00D9FF' }}>Strict Security Guardrail:</strong> This form creates internal specialist accounts. The new user will <strong style={{ color: '#F87171' }}>NEVER</strong> receive Admin Dashboard, Super Admin, or user management permissions. Their platform access is strictly scoped to the checked service dashboards below.
                </div>

                <div className="portal-form-group" style={{ marginBottom: '1rem' }}>
                  <label className="portal-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. Alex Morgan"
                    value={newTeamUserData.name}
                    onChange={(e) => setNewTeamUserData({ ...newTeamUserData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="portal-form-group" style={{ marginBottom: '1rem' }}>
                  <label className="portal-form-label">Email Address *</label>
                  <input
                    type="email"
                    className="portal-form-input"
                    placeholder="e.g. alex@creativegini.com"
                    value={newTeamUserData.email}
                    onChange={(e) => setNewTeamUserData({ ...newTeamUserData, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Password *</label>
                    <input
                      type="password"
                      className="portal-form-input"
                      placeholder="Minimum 6 characters"
                      value={newTeamUserData.password}
                      onChange={(e) => setNewTeamUserData({ ...newTeamUserData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Account Status</label>
                    <select
                      className="portal-form-select"
                      value={newTeamUserData.status}
                      onChange={(e) => setNewTeamUserData({ ...newTeamUserData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Dashboard Access Permissions *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Company Boost */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: newTeamUserData.dashboardAccess.companyBoost ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: newTeamUserData.dashboardAccess.companyBoost ? '1px solid rgba(0, 217, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={newTeamUserData.dashboardAccess.companyBoost}
                          onChange={(e) => setNewTeamUserData({
                            ...newTeamUserData,
                            dashboardAccess: { ...newTeamUserData.dashboardAccess, companyBoost: e.target.checked }
                          })}
                          style={{ accentColor: '#00D9FF', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F5F5F5' }}>
                            Company Boost
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                            SEO, Organic Traffic, Content, Brand Architecture
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: newTeamUserData.dashboardAccess.companyBoost ? '#00D9FF' : '#64748B' }}>
                        {newTeamUserData.dashboardAccess.companyBoost ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </label>

                    {/* Company Lead */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: newTeamUserData.dashboardAccess.companyLead ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: newTeamUserData.dashboardAccess.companyLead ? '1px solid rgba(0, 217, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={newTeamUserData.dashboardAccess.companyLead}
                          onChange={(e) => setNewTeamUserData({
                            ...newTeamUserData,
                            dashboardAccess: { ...newTeamUserData.dashboardAccess, companyLead: e.target.checked }
                          })}
                          style={{ accentColor: '#00D9FF', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F5F5F5' }}>
                            Company Lead
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                            B2B Lead Generation, Prospecting, Outreach Pipeline
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: newTeamUserData.dashboardAccess.companyLead ? '#00D9FF' : '#64748B' }}>
                        {newTeamUserData.dashboardAccess.companyLead ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </label>

                    {/* Company UI */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: newTeamUserData.dashboardAccess.companyUI ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: newTeamUserData.dashboardAccess.companyUI ? '1px solid rgba(0, 217, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={newTeamUserData.dashboardAccess.companyUI}
                          onChange={(e) => setNewTeamUserData({
                            ...newTeamUserData,
                            dashboardAccess: { ...newTeamUserData.dashboardAccess, companyUI: e.target.checked }
                          })}
                          style={{ accentColor: '#00D9FF', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F5F5F5' }}>
                            Company UI
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                            Landing Page Enhancement, Conversion Rate Optimization
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: newTeamUserData.dashboardAccess.companyUI ? '#00D9FF' : '#64748B' }}>
                        {newTeamUserData.dashboardAccess.companyUI ? 'GRANTED' : 'RESTRICTED'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setIsAddTeamUserModalOpen(false)}
                  disabled={isCreatingTeamUser}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn-primary"
                  disabled={isCreatingTeamUser}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={16} />
                  <span>{isCreatingTeamUser ? 'Creating User...' : 'Create Team User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: DELETE TEAM USER CONFIRMATION (REQUIREMENT 4) */}
      {deletingTeamMember && (
        <div className="portal-modal-overlay" onClick={() => setDeletingTeamMember(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '480px', borderTop: '4px solid #ef4444' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
                <AlertTriangle size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
                  Delete User?
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                onClick={() => setDeletingTeamMember(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body">
              <p style={{ color: '#CBD5E1', fontSize: '0.92rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                This user will no longer have access to CreativeGini service dashboards.
              </p>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem', color: '#CBD5E1' }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>User Name:</span>
                  <span style={{ fontWeight: '700', color: '#F5F5F5' }}>{deletingTeamMember.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>User Email:</span>
                  <span style={{ fontWeight: '600', color: '#00D9FF' }}>{deletingTeamMember.email}</span>
                </div>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => setDeletingTeamMember(null)}
                disabled={isDeletingTeamMember}
              >
                Cancel
              </button>
              <button
                type="button"
                className="portal-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#FFFFFF', fontWeight: '700',
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.35)'
                }}
                onClick={handleConfirmDeleteTeamMember}
                disabled={isDeletingTeamMember}
              >
                {isDeletingTeamMember ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
