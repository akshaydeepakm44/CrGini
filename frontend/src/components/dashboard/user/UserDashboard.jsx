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
  FileText,
  FolderArchive,
  Eye,
  MapPin,
  Filter,
  ArrowUpRight,
  Sparkles,
  Layers,
  Compass,
  Video,
  Image,
  Code2,
  Download,
  CheckSquare,
  Square,
  Lock
} from 'lucide-react';
import { api } from '../../../services/api';
import PortalCosmicBackground from '../common/PortalCosmicBackground';
import NotificationPanel from '../common/NotificationPanel';
import ClientReviewSection from '../common/ClientReviewSection';
import ActivityTimeline from '../common/ActivityTimeline';
import ChangePasswordSection from '../../common/ChangePasswordSection';
import AssetsView from './AssetsView';
import PdfViewerModal from '../../common/PdfViewerModal';

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

  // Company Lead Workspace State
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [leadSortBy, setLeadSortBy] = useState('NEWEST');

  // Settings profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Company Boost Workspace & Onboarding Assets State
  const [onboardingAssets, setOnboardingAssets] = useState({
    poster: null,
    video: null,
    strategicPlan: null,
    devrelPlan: null
  });
  const [onboardingStatus, setOnboardingStatus] = useState({
    poster: 'Pending',
    video: 'Pending',
    strategicPlan: 'Pending',
    devrelPlan: 'Pending'
  });

  // Company UI Workspace & Onboarding Assets State
  const [uiOnboardingAssets, setUiOnboardingAssets] = useState({
    uiAnalysis: null,
    landingPageEnhancement: null
  });
  const [uiOnboardingStatus, setUiOnboardingStatus] = useState({
    uiAnalysis: 'Pending',
    landingPageEnhancement: 'Pending'
  });

  // Company Lead Workspace & Onboarding Assets State
  const [leadOnboardingAssets, setLeadOnboardingAssets] = useState(null);
  const [viewingLeadPdf, setViewingLeadPdf] = useState(null);

  const [customServices, setCustomServices] = useState({
    strategicPlan: false,
    content: false,
    devrel: false
  });
  const [lightboxPoster, setLightboxPoster] = useState(null);

  // Helper to generate authenticated media URLs with token for audio/video/image tags and download links
  const getAuthenticatedAssetUrl = (asset, action = 'stream') => {
    if (!asset) return '';
    const token = localStorage.getItem('cg_auth_token') || '';
    if (asset.id) {
      if (action === 'download') {
        return api.getAssetDownloadUrl(asset.id);
      }
      return api.getAssetStreamUrl(asset.id);
    }
    if (asset.dataUrl) return asset.dataUrl;
    if (asset.url && (asset.url.startsWith('data:') || asset.url.startsWith('blob:'))) return asset.url;
    if (asset.url && (asset.url.startsWith('http') || asset.url.startsWith('/'))) {
      return token ? `${asset.url}${asset.url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : asset.url;
    }
    if (asset.streamUrl) {
      return token ? `${asset.streamUrl}${asset.streamUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : asset.streamUrl;
    }
    return '';
  };

  // Requirement Modal State (Multi-step flow for Company Boost)
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirementSubService, setRequirementSubService] = useState('STRATEGIC_PLAN'); // 'STRATEGIC_PLAN' | 'CONTENT' | 'DEVREL' | 'CUSTOM'
  const [requirementStep, setRequirementStep] = useState(1); // 1: Input, 2: Review, 3: Pricing
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [configuredPriceData, setConfiguredPriceData] = useState(null);
  const [requirementErrors, setRequirementErrors] = useState({});

  // 1. Strategic Plan fields
  const [strategicPlanForm, setStrategicPlanForm] = useState({
    mainGoal: '',
    targetMarket: '',
    focusArea: '',
    currentStage: '',
    painPoints: '',
    competitors: '',
    expectedOutcome: '',
    additionalRequirements: '',
    referenceLinks: ''
  });

  // 2. Content for Your Company fields
  const [contentForm, setContentForm] = useState({
    contentTypes: {
      poster: true,
      productVideo: true,
      socialContent: false,
      productShowcase: false,
      other: false
    },
    deliverablesCount: '1 Poster + 1 Showcase Video',
    mainPurpose: '',
    targetAudience: '',
    productHighlight: '',
    preferredPlatforms: '',
    keyMessage: '',
    brandRequirements: '',
    referenceExamples: '',
    existingBrandAssets: '',
    additionalRequirements: ''
  });

  // 3. DevRel Plan fields
  const [devrelForm, setDevrelForm] = useState({
    mainDevrelGoal: '',
    productApiSdk: '',
    targetDeveloperAudience: '',
    developerPlatforms: '',
    developerAdoptionChallenges: '',
    documentationRequirements: '',
    communityRequirements: '',
    openSourceRequirements: '',
    developerContentRequirements: '',
    expectedOutcome: '',
    referenceLinks: '',
    additionalRequirements: ''
  });

  // 4. Custom Request fields
  const [customForm, setCustomForm] = useState({
    selectedServices: {
      strategicPlan: true,
      content: false,
      devrel: false
    },
    requirements: '',
    expectedOutcome: '',
    additionalRequirements: '',
    referenceLinks: ''
  });

  // Lead Requirement Modal State ("Request More Leads" flow - simplified 2-step)
  const [isLeadReqModalOpen, setIsLeadReqModalOpen] = useState(false);
  const [leadReqStep, setLeadReqStep] = useState(1); // 1: Number of Leads, 2: Pricing & Payment
  const [calculatingLeadPrice, setCalculatingLeadPrice] = useState(false);
  const [leadPriceData, setLeadPriceData] = useState(null);
  const [leadReqErrors, setLeadReqErrors] = useState({});
  const [leadReqForm, setLeadReqForm] = useState({
    leadsCount: '50'
  });

  // Load Company, Requests, and Notifications
  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, requestsData, notifsData, onbData, uiOnbData, leadOnbData] = await Promise.all([
        api.getMyCompany().catch(() => user?.company || null),
        api.getRequests().catch(() => []),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getMyOnboardingAssets().catch(() => null),
        api.getMyUiOnboardingAssets().catch(() => null),
        api.getMyLeadOnboardingAssets().catch(() => null)
      ]);
      if (companyData) setCompany(companyData);
      setRequests(requestsData);
      if (notifsData) {
        setNotifications(notifsData.notifications || []);
        setUnreadNotifCount(notifsData.unreadCount || 0);
      }
      if (onbData?.assets) {
        setOnboardingAssets(onbData.assets);
        setOnboardingStatus(onbData.status || {});
      }
      if (uiOnbData?.assets) {
        setUiOnboardingAssets(uiOnbData.assets);
        setUiOnboardingStatus(uiOnbData.status || {});
      }
      if (leadOnbData) {
        setLeadOnboardingAssets(leadOnbData);
      }
    } catch (err) {
      console.error('Error loading user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

    // Centralized Navigation Handler: always resets any active ticket or create ticket view
  const handleNavigate = (navKey) => {
    setActiveNav(navKey);
    setSelectedTicket(null);
    setSelectedLeadDetail(null);
    setViewingLeadPdf(null);
    setIsRequestModalOpen(false);
    setIsRequirementModalOpen(false);
    setIsLeadReqModalOpen(false);
    setIsMobileDrawerOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ nav: navKey }, '');
    }
  };

  const handleCancelRequest = () => {
    setIsRequestModalOpen(false);
    if (window.history.state?.modal === 'create-request') {
      window.history.back();
    }
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    if (window.history.state?.modal === 'ticket-detail') {
      window.history.back();
    }
  };

  // Reactive safety: whenever activeNav changes, automatically close open tickets and lead modals
  useEffect(() => {
    setSelectedTicket(null);
    setSelectedLeadDetail(null);
    setViewingLeadPdf(null);
    setIsRequestModalOpen(false);
    setIsRequirementModalOpen(false);
    setIsLeadReqModalOpen(false);
  }, [activeNav]);

  // Listen for browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (isRequestModalOpen) {
        setIsRequestModalOpen(false);
      }
      if (isRequirementModalOpen) {
        setIsRequirementModalOpen(false);
      }
      if (isLeadReqModalOpen) {
        setIsLeadReqModalOpen(false);
      }
      if (selectedTicket) {
        setSelectedTicket(null);
      }
      if (selectedLeadDetail) {
        setSelectedLeadDetail(null);
      }
      if (viewingLeadPdf) {
        setViewingLeadPdf(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isRequestModalOpen, isRequirementModalOpen, isLeadReqModalOpen, selectedTicket, selectedLeadDetail, viewingLeadPdf]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewingLeadPdf) {
          setViewingLeadPdf(null);
        } else if (isLeadReqModalOpen) {
          setIsLeadReqModalOpen(false);
        } else if (isRequirementModalOpen) {
          setIsRequirementModalOpen(false);
        } else if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false);
        } else if (viewingInvoice) {
          setViewingInvoice(null);
        } else if (selectedLeadDetail) {
          setSelectedLeadDetail(null);
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
    viewingLeadPdf, isLeadReqModalOpen, isRequirementModalOpen, isMobileDrawerOpen, viewingInvoice, selectedLeadDetail, isRequestModalOpen, pendingPaymentTicket, selectedTicket,
    isHelpModalOpen, isNotificationsOpen, isProfileMenuOpen
  ]);

  // Open Ticket Detail and Fetch Messages, Submissions, and Activity
  const handleOpenTicket = async (ticket, initialTab) => {
    setIsRequestModalOpen(false);
    setSelectedTicket(ticket);
    window.history.pushState({ modal: 'ticket-detail', ticketId: ticket.ticketId }, '');
    setIsRequestModalOpen(false);
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

  // Open ticket directly from URL query parameter (e.g. /dashboard?ticket=CG-1001&tab=review)
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
    setSelectedTicket(null);
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
    window.history.pushState({ modal: 'create-request' }, '');
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

  // Custom Request Handler: opens requirement modal
  const handleRequestCustomService = (e) => {
    if (e) e.preventDefault();
    handleOpenRequirementModal('CUSTOM');
  };

  // Company Boost Requirement Modal Handler
  const handleOpenRequirementModal = (subService) => {
    setRequirementSubService(subService);
    setRequirementStep(1);
    setRequirementErrors({});
    setConfiguredPriceData(null);
    if (subService === 'CUSTOM') {
      setCustomForm(prev => ({
        ...prev,
        selectedServices: {
          strategicPlan: customServices.strategicPlan || (!customServices.content && !customServices.devrel),
          content: customServices.content,
          devrel: customServices.devrel
        }
      }));
    }
    setIsRequirementModalOpen(true);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors = {};
    if (requirementSubService === 'STRATEGIC_PLAN') {
      if (!strategicPlanForm.mainGoal.trim()) errors.mainGoal = 'Main goal is required';
      if (!strategicPlanForm.targetMarket.trim()) errors.targetMarket = 'Target market / audience is required';
      if (!strategicPlanForm.painPoints.trim()) errors.painPoints = 'Key challenges or pain points are required';
    } else if (requirementSubService === 'CONTENT') {
      const hasType = Object.values(contentForm.contentTypes).some(Boolean);
      if (!hasType) errors.contentTypes = 'Select at least one content type';
      if (!contentForm.deliverablesCount.trim()) errors.deliverablesCount = 'Deliverables count / scope is required';
      if (!contentForm.mainPurpose.trim()) errors.mainPurpose = 'Main purpose of the content is required';
      if (!contentForm.productHighlight.trim()) errors.productHighlight = 'Product or service to highlight is required';
    } else if (requirementSubService === 'DEVREL') {
      if (!devrelForm.mainDevrelGoal.trim()) errors.mainDevrelGoal = 'Main DevRel goal is required';
      if (!devrelForm.productApiSdk.trim()) errors.productApiSdk = 'Product, API, or SDK name is required';
      if (!devrelForm.targetDeveloperAudience.trim()) errors.targetDeveloperAudience = 'Target developer audience is required';
      if (!devrelForm.expectedOutcome.trim()) errors.expectedOutcome = 'Expected outcome is required';
    } else if (requirementSubService === 'CUSTOM') {
      const hasService = Object.values(customForm.selectedServices).some(Boolean);
      if (!hasService) errors.selectedServices = 'Select at least one service area';
      if (!customForm.requirements.trim()) errors.requirements = 'Requirements description is required';
    }

    setRequirementErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToReview = (e) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setRequirementStep(2);
    }
  };

  const handleProceedToPricing = async () => {
    try {
      setCalculatingPrice(true);
      const selected = [];
      if (requirementSubService === 'CUSTOM') {
        if (customForm.selectedServices.strategicPlan) selected.push('Strategic Plan');
        if (customForm.selectedServices.content) selected.push('Content for Your Company');
        if (customForm.selectedServices.devrel) selected.push('DevRel Plan');
      }

      let reqData = {};
      if (requirementSubService === 'STRATEGIC_PLAN') reqData = strategicPlanForm;
      else if (requirementSubService === 'CONTENT') reqData = contentForm;
      else if (requirementSubService === 'DEVREL') reqData = devrelForm;
      else if (requirementSubService === 'CUSTOM') reqData = customForm;

      const res = await api.calculatePrice({
        serviceType: 'COMPANY_BOOST',
        subService: requirementSubService,
        requirements: reqData,
        selectedServices: selected
      });
      setConfiguredPriceData(res);
      setRequirementStep(3);
    } catch (err) {
      alert('Failed to configure pricing: ' + err.message);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleConfirmAndProceedToPayment = async () => {
    try {
      setIsSubmittingRequest(true);

      let title = '';
      let formattedDescription = '';
      let reqData = {};
      let selectedList = [];

      if (requirementSubService === 'STRATEGIC_PLAN') {
        title = `Strategic Growth Plan Sprint · ${company?.name || user?.name}`;
        formattedDescription = `[STRATEGIC PLAN REQUIREMENT SPECIFICATION]
• Main Goal: ${strategicPlanForm.mainGoal}
• Target Market / Audience: ${strategicPlanForm.targetMarket}
• Primary Focus Areas: ${strategicPlanForm.focusArea}
• Key Challenges & Pain Points: ${strategicPlanForm.painPoints}
• Expected Outcome: ${strategicPlanForm.expectedOutcome}
${strategicPlanForm.currentStage ? `• Current Business Stage: ${strategicPlanForm.currentStage}\n` : ''}${strategicPlanForm.competitors ? `• Competitors / Reference Companies: ${strategicPlanForm.competitors}\n` : ''}${strategicPlanForm.additionalRequirements ? `• Additional Requirements: ${strategicPlanForm.additionalRequirements}\n` : ''}${strategicPlanForm.referenceLinks ? `• Reference Links: ${strategicPlanForm.referenceLinks}\n` : ''}`.trim();
        reqData = strategicPlanForm;
      } else if (requirementSubService === 'CONTENT') {
        title = `Branded Content & Media Sprint · ${company?.name || user?.name}`;
        const selectedTypes = Object.entries(contentForm.contentTypes)
          .filter(([_, v]) => v)
          .map(([k]) => k === 'productVideo' ? 'Product Video' : k === 'socialContent' ? 'Social Media Content' : k === 'productShowcase' ? 'Product Showcase' : k === 'poster' ? 'Poster' : 'Other')
          .join(', ');
        formattedDescription = `[CONTENT PRODUCTION REQUIREMENT SPECIFICATION]
• Content Types: ${selectedTypes}
• Deliverables Scope: ${contentForm.deliverablesCount}
• Main Purpose: ${contentForm.mainPurpose}
• Target Audience: ${contentForm.targetAudience}
• Product / Service to Highlight: ${contentForm.productHighlight}
${contentForm.preferredPlatforms ? `• Preferred Platforms: ${contentForm.preferredPlatforms}\n` : ''}${contentForm.keyMessage ? `• Key Message: ${contentForm.keyMessage}\n` : ''}${contentForm.brandRequirements ? `• Brand / Style Guidelines: ${contentForm.brandRequirements}\n` : ''}${contentForm.referenceExamples ? `• Reference Examples / Links: ${contentForm.referenceExamples}\n` : ''}${contentForm.existingBrandAssets ? `• Existing Brand Assets: ${contentForm.existingBrandAssets}\n` : ''}${contentForm.additionalRequirements ? `• Additional Requirements: ${contentForm.additionalRequirements}\n` : ''}`.trim();
        reqData = contentForm;
      } else if (requirementSubService === 'DEVREL') {
        title = `Developer Relations (DevRel) Strategy Sprint · ${company?.name || user?.name}`;
        formattedDescription = `[DEVREL STRATEGY REQUIREMENT SPECIFICATION]
• Main DevRel Goal: ${devrelForm.mainDevrelGoal}
• Product / API / SDK: ${devrelForm.productApiSdk}
• Target Developer Audience: ${devrelForm.targetDeveloperAudience}
• Expected Outcome: ${devrelForm.expectedOutcome}
${devrelForm.developerPlatforms ? `• Target Platforms / Communities: ${devrelForm.developerPlatforms}\n` : ''}${devrelForm.developerAdoptionChallenges ? `• Adoption Challenges: ${devrelForm.developerAdoptionChallenges}\n` : ''}${devrelForm.documentationRequirements ? `• Documentation Scope: ${devrelForm.documentationRequirements}\n` : ''}${devrelForm.communityRequirements ? `• Community Building Scope: ${devrelForm.communityRequirements}\n` : ''}${devrelForm.openSourceRequirements ? `• Open Source Scope: ${devrelForm.openSourceRequirements}\n` : ''}${devrelForm.developerContentRequirements ? `• Developer Content Scope: ${devrelForm.developerContentRequirements}\n` : ''}${devrelForm.referenceLinks ? `• Reference Links: ${devrelForm.referenceLinks}\n` : ''}${devrelForm.additionalRequirements ? `• Additional Requirements: ${devrelForm.additionalRequirements}\n` : ''}`.trim();
        reqData = devrelForm;
      } else if (requirementSubService === 'CUSTOM') {
        if (customForm.selectedServices.strategicPlan) selectedList.push('Strategic Plan');
        if (customForm.selectedServices.content) selectedList.push('Content for Your Company');
        if (customForm.selectedServices.devrel) selectedList.push('DevRel Plan');
        title = `Custom Boost Sprint: ${selectedList.join(' + ')} · ${company?.name || user?.name}`;
        formattedDescription = `[CUSTOM COMPANY BOOST SPRINT SPECIFICATION]
• Selected Services: ${selectedList.join(', ')}
• Client Requirements & Scope: ${customForm.requirements}
${customForm.expectedOutcome ? `• Expected Outcome: ${customForm.expectedOutcome}\n` : ''}${customForm.additionalRequirements ? `• Additional Requirements: ${customForm.additionalRequirements}\n` : ''}${customForm.referenceLinks ? `• Reference Links: ${customForm.referenceLinks}\n` : ''}`.trim();
        reqData = customForm;
      }

      // Create request in backend (which calculates and protects the final price)
      const created = await api.createRequest({
        serviceType: 'COMPANY_BOOST',
        subService: requirementSubService,
        title,
        description: formattedDescription,
        priority: requirementSubService === 'CUSTOM' ? 'HIGH' : 'MEDIUM',
        requirements: reqData,
        selectedServices: selectedList
      });

      // Close requirement modal
      setIsRequirementModalOpen(false);
      await loadData();

      // Launch existing payment confirmation modal
      setPendingPaymentTicket(created);
    } catch (err) {
      alert('Failed to submit service request: ' + err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Company Lead Requirement Modal Handlers ("Request More Leads" flow)
  // Company Lead Requirement Modal Handlers ("Request More Leads" flow - simplified 2-step)
  const handleOpenLeadRequirementModal = () => {
    setLeadReqStep(1);
    setLeadReqErrors({});
    setLeadPriceData(null);
    setLeadReqForm({ leadsCount: '50' });
    setIsLeadReqModalOpen(true);
  };

  const validateLeadCount = () => {
    const errors = {};
    const val = leadReqForm.leadsCount;
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.leadsCount = 'Number of leads is required';
    } else {
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num)) {
        errors.leadsCount = 'Please enter a valid whole integer';
      } else if (num <= 0) {
        errors.leadsCount = 'Number of leads must be greater than 0';
      } else if (num > 5000) {
        errors.leadsCount = 'Maximum limit is 5,000 leads per request';
      }
    }
    setLeadReqErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedLeadToPricing = async (e) => {
    if (e) e.preventDefault();
    if (!validateLeadCount()) return;

    try {
      setCalculatingLeadPrice(true);
      const count = Number(leadReqForm.leadsCount) || 50;
      const res = await api.calculatePrice({
        serviceType: 'COMPANY_LEAD',
        requirements: { leadsCount: count }
      });
      setLeadPriceData(res);
      setLeadReqStep(2);
    } catch (err) {
      alert('Failed to configure pricing: ' + err.message);
    } finally {
      setCalculatingLeadPrice(false);
    }
  };

  const handleConfirmLeadRequestAndPay = async () => {
    try {
      setIsSubmittingRequest(true);
      const leads = Number(leadReqForm.leadsCount) || 50;
      const title = `Target Leads Research Sprint (${leads} Leads) · ${company?.name || user?.name}`;
      const formattedDescription = `Requested Leads: ${leads}`;

      const created = await api.createRequest({
        serviceType: 'COMPANY_LEAD',
        title,
        description: formattedDescription,
        priority: 'HIGH',
        requirements: { leadsCount: leads }
      });

      setIsLeadReqModalOpen(false);
      await loadData();

      // Launch existing payment confirmation modal
      setPendingPaymentTicket(created);
    } catch (err) {
      alert('Failed to submit lead research request: ' + err.message);
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

  // Unlock Key People feature flow
  const handleUnlockKeyPeople = async () => {
    try {
      setIsSubmittingRequest(true);
      const res = await api.unlockKeyPeople();
      if (res.alreadyUnlocked) {
        alert(res.message || 'Key People access is already unlocked.');
        await loadData();
      } else if (res.request) {
        setPendingPaymentTicket(res.request);
      }
    } catch (err) {
      alert('Failed to initiate Key People unlock: ' + err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Calculated Metrics
  const activeRequests = requests.filter(r => !['COMPLETED'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const pendingPayments = requests.filter(r => r.paymentStatus === 'PENDING');
  
  // Real database-driven Company Leads metrics
  const leadsList = Array.isArray(leadOnboardingAssets?.leads) && leadOnboardingAssets.leads.length > 0
    ? leadOnboardingAssets.leads
    : (Array.isArray(company?.initialLeads) ? company.initialLeads : (Array.isArray(company?.leads) ? company.leads : []));
  const sampleLeads = leadsList.slice(0, 5);
  const verifiedLeadsCount = leadsList.filter(
    l => (l.status || '').toUpperCase() === 'VERIFIED' && Boolean(l.notes && l.notes.trim().length > 0)
  ).length;
  const pendingLeadsCount = leadsList.filter(
    l => (l.status || '').toUpperCase() === 'PENDING'
  ).length;
  const researchedLeadsCount = leadsList.filter(
    l => (l.status || '').toUpperCase() === 'RESEARCHED'
  ).length;
  const totalLeadsCount = leadsList.length;
  const keyPeopleCount = Array.isArray(company?.initialKeyPeople) ? company.initialKeyPeople.length : 0;
  const initialLeadsCount = totalLeadsCount;
  const hasOnboardingLeadData = totalLeadsCount > 0 || Boolean(company?.researchSummary && company.researchSummary.trim().length > 0) || keyPeopleCount > 0;

  // Company Lead Requests
  const companyLeadRequests = requests
    .filter(r => r && r.serviceType === 'COMPANY_LEAD')
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  const activeLeadRequest = companyLeadRequests[0] || null;

  // Filtered Company Leads
  const filteredCompanyLeads = leadsList.filter(lead => {
    const statusUpper = (lead.status || 'PENDING').toUpperCase();
    const isVerified = statusUpper === 'VERIFIED' && Boolean(lead.notes && lead.notes.trim().length > 0);

    if (leadStatusFilter === 'VERIFIED' && !isVerified) return false;
    if (leadStatusFilter === 'PENDING' && statusUpper !== 'PENDING') return false;
    if (leadStatusFilter === 'RESEARCHED' && statusUpper !== 'RESEARCHED') return false;

    if (leadSearchQuery.trim()) {
      const q = leadSearchQuery.toLowerCase();
      const matchName = (lead.name || '').toLowerCase().includes(q);
      const matchTitle = (lead.title || '').toLowerCase().includes(q);
      const matchCompany = (lead.company || '').toLowerCase().includes(q);
      const matchLocation = (lead.location || '').toLowerCase().includes(q);
      const matchNotes = (lead.notes || '').toLowerCase().includes(q);
      const matchEmail = (lead.email || '').toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchCompany && !matchLocation && !matchNotes && !matchEmail) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (leadSortBy === 'NAME_ASC') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (leadSortBy === 'COMPANY') {
      return (a.company || '').localeCompare(b.company || '');
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const formatLeadDate = (dateVal) => {
    if (!dateVal) return 'Not available';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Not available';
    }
  };

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
            onClick={() => handleNavigate('dashboard')}
            title="Executive Dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <div className="portal-nav-section-title">CreativeGini Services</div>

          <button
            className={`portal-nav-btn ${activeNav === 'company-boost' ? 'active' : ''}`}
            onClick={() => handleNavigate('company-boost')}
            title="Company Boost"
          >
            <Zap size={18} />
            <span>Company Boost</span>
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'company-lead' ? 'active' : ''}`}
            onClick={() => handleNavigate('company-lead')}
            title="Company Lead"
          >
            <Users size={18} />
            <span>Company Lead</span>
            {initialLeadsCount > 0 && <span className="portal-nav-badge">{initialLeadsCount}</span>}
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'landing-page' ? 'active' : ''}`}
            onClick={() => handleNavigate('landing-page')}
            title="Landing Page Enhancement"
          >
            <LayoutTemplate size={18} />
            <span>Landing Page</span>
          </button>

          <div className="portal-nav-section-title">Management</div>

          <button
            className={`portal-nav-btn ${activeNav === 'requests' ? 'active' : ''}`}
            onClick={() => handleNavigate('requests')}
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
            className={`portal-nav-btn ${activeNav === 'assets' ? 'active' : ''}`}
            onClick={() => handleNavigate('assets')}
            title="Assets & Media Library"
          >
            <FolderArchive size={18} />
            <span>Assets</span>
          </button>

          <button
            className={`portal-nav-btn ${activeNav === 'billing' ? 'active' : ''}`}
            onClick={() => handleNavigate('billing')}
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
            onClick={() => handleNavigate('settings')}
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
                {selectedTicket ? (
                  <>
                    <span style={{ color: '#00D9FF', marginRight: '8px' }}>{selectedTicket.ticketId}</span>
                    <span>{selectedTicket.title}</span>
                  </>
                ) : isRequestModalOpen ? (
                  'Create New Request / Ticket'
                ) : (
                  <>
                    {activeNav === 'dashboard' && 'Executive Growth Overview'}
                    {activeNav === 'company-boost' && 'Company Boost Pipeline'}
                    {activeNav === 'company-lead' && 'Pre-Researched Lead Intelligence'}
                    {activeNav === 'landing-page' && 'Landing Page Sprint Queue'}
                    {activeNav === 'requests' && 'Service Requests & Deliverable Approvals'}
                    {activeNav === 'assets' && 'Assets Media Library'}
                    {activeNav === 'billing' && 'Invoices & Transaction Ledger'}
                    {activeNav === 'settings' && 'Company Profile & Security Settings'}
                  </>
                )}
              </h2>
              <p>
                {selectedTicket ? (
                  <span>Ticket Details & Deliverables • Status: <strong style={{ color: '#00D9FF' }}>{selectedTicket.status.replace(/_/g, ' ')}</strong></span>
                ) : isRequestModalOpen ? (
                  <span>Specify requirements & deliverables for <strong style={{ color: '#00D9FF' }}>{requestService.replace(/_/g, ' ')}</strong></span>
                ) : (
                  company?.name ? `${company.name} · ${company.industry || 'Technology'}` : 'Loading...'
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
                    onClick={() => handleNavigate('settings')}
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
          {selectedTicket ? (
            <div className="portal-ticket-detail-view">
              <div className="portal-ticket-breadcrumb">
                <button
                  type="button"
                  className="portal-breadcrumb-back-btn"
                  onClick={handleCloseTicket}
                >
                  <ChevronLeft size={16} />
                  <span>Back to {activeNav === 'requests' ? 'My Requests' : 'Dashboard'}</span>
                </button>
                <div className="portal-breadcrumb-trail">
                  <span>{company?.name || 'Client Portal'}</span>
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
                      <span className={'status-pill ' + selectedTicket.status}>
                        {selectedTicket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={'priority-pill ' + selectedTicket.priority}>
                        {selectedTicket.priority}
                      </span>
                      {selectedTicket.currentSubmissionVersion ? (
                        <span style={{ background: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', fontWeight: '700', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px' }}>
                          Deliverables v{selectedTicket.currentSubmissionVersion}
                        </span>
                      ) : null}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '6px', marginBottom: 0, color: '#F5F5F5' }}>
                      {selectedTicket.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    onClick={handleCloseTicket}
                  >
                    <X size={16} />
                    <span>Close</span>
                  </button>
                </div>

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

                  {/* TAB 3: Request Conversation */}
                  {activeTicketModalTab === 'chat' && (
                    <div>
                      <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#00D9FF', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                        <MessageSquare size={14} /> Request Conversation Stream
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
                onClick={handleCloseTicket}
              >
                Close Ticket
              </button>
                </div>
              </div>
            </div>
          ) : isRequestModalOpen ? (
            <div className="portal-ticket-detail-view">
              <div className="portal-ticket-breadcrumb">
                <button
                  type="button"
                  className="portal-breadcrumb-back-btn"
                  onClick={handleCancelRequest}
                >
                  <ChevronLeft size={16} />
                  <span>Back to {activeNav === 'requests' ? 'My Requests' : activeNav === 'dashboard' ? 'Dashboard' : 'Service Page'}</span>
                </button>
                <div className="portal-breadcrumb-trail">
                  <span>Dashboard</span>
                  <span className="portal-breadcrumb-sep">/</span>
                  <span>Requests</span>
                  <span className="portal-breadcrumb-sep">/</span>
                  <span className="portal-breadcrumb-current">Create New Ticket</span>
                </div>
              </div>

              <div className="portal-ticket-detail-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
                <div className="portal-modal-header portal-ticket-header">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#F5F5F5' }}>
                      Create New Request / Ticket
                    </h3>
                    <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>
                      Service: <strong style={{ color: '#00D9FF' }}>{requestService.replace(/_/g, ' ')}</strong> · Company: <strong style={{ color: '#F5F5F5' }}>{company?.name}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    onClick={handleCancelRequest}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest}>
                  <div className="portal-modal-body" style={{ maxHeight: 'none', overflow: 'visible' }}>
                    <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.84rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
                      <Building size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#00D9FF' }} />
                      Your company background for <strong>{company?.name}</strong> is already on file. Only specify your new requirements below.
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
                        rows="5"
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

                    <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Service Fee</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#00D9FF' }}>
                          ${requestService === 'COMPANY_LEAD' ? '499' : requestService === 'COMPANY_BOOST' ? '799' : '599'}.00 USD
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> 100% Satisfaction Guaranteed
                      </div>
                    </div>
                  </div>

                  <div className="portal-modal-footer">
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      onClick={handleCancelRequest}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="portal-btn-primary"
                      disabled={isSubmittingRequest}
                      style={{ padding: '8px 24px', fontSize: '0.88rem' }}
                    >
                      {isSubmittingRequest ? 'Creating Ticket...' : 'Proceed to Checkout & Create Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <>
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
                    onClick={() => handleNavigate('requests')}
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
                      Custom curated and verified decision-maker prospect intelligence lists (CTOs, VPs, Directors) with high intent in your target regions.
                    </p>
                    <div className="portal-service-actions">
                      <button
                        className="portal-btn-primary"
                        onClick={() => handleNavigate('company-lead')}
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
                        onClick={() => handleNavigate('company-boost')}
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
                        onClick={() => handleNavigate('landing-page')}
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
                    Active Requests & Tickets
                  </h3>
                  <button className="portal-btn-secondary" onClick={() => handleNavigate('requests')}>
                    View All Tickets ({requests.length})
                  </button>
                </div>

                <div className="request-table-wrapper">
                  <table className="request-table">
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#F5F5F5' }}>
                      Company Lead
                    </h2>
                    {company?.name && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0, 217, 255, 0.12)', border: '1px solid rgba(0, 217, 255, 0.3)', color: '#00D9FF', fontWeight: '600' }}>
                        {company.name}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                    Research relevant companies and decision-makers for your business.
                  </p>
                </div>
                <button
                  id="header-btn-request-more-leads"
                  className="portal-btn-primary"
                  onClick={handleOpenLeadRequirementModal}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={16} /> Request More Leads
                </button>
              </div>

              {/* Onboarding Preparation State Banner (for brand-new client without sample work yet) */}
              {!hasOnboardingLeadData ? (
                <div className="portal-card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)', border: '1px dashed rgba(0, 217, 255, 0.4)', padding: '2.5rem 1.75rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 217, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <Clock size={28} color="#00D9FF" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F5F5F5', margin: '0 0 0.6rem 0' }}>
                    Your Company Lead workspace is being prepared.
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
                    Once our Company Lead team completes your initial research, your sample leads, company study, and key people will appear here.
                  </p>
                </div>
              ) : activeLeadRequest && (
                <div className="portal-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid #00D9FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="ticket-key" onClick={() => handleOpenTicket(activeLeadRequest)}>
                          {activeLeadRequest.ticketId}
                        </span>
                        <span className={`status-pill ${activeLeadRequest.status}`}>
                          {activeLeadRequest.status.replace(/_/g, ' ')}
                        </span>
                        <span className={`priority-pill ${activeLeadRequest.priority}`}>
                          {activeLeadRequest.priority}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F5F5F5', margin: 0 }}>
                        {activeLeadRequest.title}
                      </h3>
                    </div>
                    <button
                      className="portal-btn-secondary"
                      onClick={() => handleOpenTicket(activeLeadRequest)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      <ExternalLink size={14} /> Open Ticket
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Created Date</div>
                      <div style={{ fontWeight: '600', color: '#e2e8f0', marginTop: '2px', fontSize: '0.9rem' }}>
                        {formatLeadDate(activeLeadRequest.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Last Updated</div>
                      <div style={{ fontWeight: '600', color: '#e2e8f0', marginTop: '2px', fontSize: '0.9rem' }}>
                        {formatLeadDate(activeLeadRequest.updatedAt || activeLeadRequest.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Assigned Team</div>
                      <div style={{ fontWeight: '600', color: '#e2e8f0', marginTop: '2px', fontSize: '0.9rem' }}>
                        {activeLeadRequest.assignedTeam || 'Company Lead Team'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Payment Status</div>
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: activeLeadRequest.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b' }}>
                          {activeLeadRequest.paymentStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Summary Cards (derived strictly from actual DB records) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {/* 1. Total Leads */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Total Leads</span>
                    <Users size={18} color="#00D9FF" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    {totalLeadsCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    All researched accounts
                  </div>
                </div>

                {/* 2. Verified Leads */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Verified Leads</span>
                    <ShieldCheck size={18} color={verifiedLeadsCount > 0 ? '#10b981' : '#f59e0b'} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: verifiedLeadsCount > 0 ? '#10b981' : '#94a3b8', marginBottom: '0.25rem' }}>
                    {verifiedLeadsCount}
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>
                    {verifiedLeadsCount === 0 ? (
                      <span style={{ color: '#f59e0b', fontWeight: '600' }}>No verified leads yet</span>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: '600' }}>Verified with research proof</span>
                    )}
                  </div>
                </div>

                {/* 3. Pending Verification */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Pending Verification</span>
                    <Clock size={18} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    {pendingLeadsCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {pendingLeadsCount > 0 ? 'Verification in progress' : 'No pending records'}
                  </div>
                </div>

                {/* 4. Key People */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Key People</span>
                    <Briefcase size={18} color="#a855f7" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    {keyPeopleCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Identified company contacts
                  </div>
                </div>
              </div>

              {/* Target Company Profile & Strategic Context Card (Company Boost consistency) */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: '#F5F5F5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={18} color="#00D9FF" /> Target Company Profile (On File)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Company</div>
                    <div style={{ fontWeight: '600', marginTop: '2px', color: '#e2e8f0' }}>{company?.name || 'Not available'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Industry</div>
                    <div style={{ fontWeight: '600', marginTop: '2px', color: '#e2e8f0' }}>{company?.industry || 'Not available'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Website</div>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>
                      {company?.website ? (
                        <a href={company.website} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', textDecoration: 'none' }}>
                          {company.website}
                        </a>
                      ) : (
                        <span style={{ color: '#64748b' }}>Not available</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Lead Executive</div>
                    <div style={{ fontWeight: '600', marginTop: '2px', color: '#e2e8f0' }}>{company?.contactPerson || 'Not available'}</div>
                  </div>
                </div>

                {company?.researchSummary && company.researchSummary.trim() ? (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Search size={14} color="#00D9FF" /> Company Study / Initial Research Summary
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {company.researchSummary}
                    </p>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '0.85rem 1rem', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#64748b" /> Initial Company Study is currently being conducted by our lead specialists.
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Leads Cards Section */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: '#F5F5F5' }}>
                      Sample Leads ({leadsList.length})
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                      Verified target accounts, company studies, custom pitch decks, and Key People intelligence dossiers.
                    </p>
                  </div>
                </div>

                {leadsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <Users size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                    <div style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '0.35rem' }}>
                      Sample leads are being researched.
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Your 5 sample lead cards will appear here once verified by our lead team.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: '1.25rem'
                    }}
                  >
                    {leadsList.map((lead, idx) => {
                      const companyName = lead.companyName || lead.lead_company || lead.company || lead.name || `Lead ${idx + 1}`;
                      let rawWeb = (lead.website || lead.linkedin || (lead.notes?.match(/https?:\/\/[^\s\]]+/)?.[0]) || '').trim();
                      const websiteUrl = rawWeb ? (/^https?:\/\//i.test(rawWeb) ? rawWeb : `https://${rawWeb}`) : '';
                      const displayUrl = rawWeb.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
                      const logoUrl = lead.logoUrl || (lead.notes?.match(/\[Logo:\s*([^\]]+)\]/)?.[1]) || null;

                      const studyDoc = lead.leadStudy || (lead.pdf?.streamUrl ? lead.pdf : null);
                      const pitchDoc = lead.pitchDeck;
                      const isKpUnlocked = lead.keyPeopleUnlocked;

                      const peopleList = Array.isArray(lead.keyPeople?.people) && lead.keyPeople.people.length > 0
                        ? lead.keyPeople.people
                        : ((Array.isArray(lead.keyPeople?.emails) && lead.keyPeople.emails.length > 0)
                            ? lead.keyPeople.emails.map(e => ({ name: '', email: e }))
                            : (lead.email ? [{ name: lead.name || '', email: lead.email }] : []));

                      return (
                        <div
                          key={lead.id || idx}
                          style={{
                            background: 'rgba(15, 23, 42, 0.65)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '1.25rem 1.4rem',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '260px',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.35)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                          }}
                        >
                          {/* Top Section: Company Name, URL & Company Logo */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '1.25rem' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4
                                style={{
                                  margin: '0 0 4px 0',
                                  fontSize: '1.15rem',
                                  fontWeight: '700',
                                  color: '#F5F5F5',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={companyName}
                              >
                                {companyName}
                              </h4>
                              {websiteUrl ? (
                                <a
                                  href={websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#00D9FF',
                                    textDecoration: 'none',
                                    fontSize: '0.84rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                  }}
                                  title={websiteUrl}
                                >
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayUrl || websiteUrl}</span>
                                  <ExternalLink size={12} style={{ flexShrink: 0 }} />
                                </a>
                              ) : (
                                <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Website in preparation</span>
                              )}
                            </div>

                            {/* Top-Right: Company Logo */}
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}
                              title={`${companyName} Logo`}
                            >
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={companyName}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '800',
                                    color: '#00D9FF'
                                  }}
                                >
                                  {companyName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle Section: Key People */}
                          <div style={{ marginBottom: '1.25rem', flex: 1 }}>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#94A3B8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '0.5rem'
                              }}
                            >
                              Key People
                            </div>

                            {isKpUnlocked ? (
                              peopleList.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {peopleList.map((person, pIdx) => (
                                    <div
                                      key={pIdx}
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                      }}
                                    >
                                      {person.name && (
                                        <div style={{ fontSize: '0.86rem', fontWeight: '600', color: '#F5F5F5' }}>
                                          {person.name}
                                        </div>
                                      )}
                                      <a
                                        href={`mailto:${person.email}`}
                                        style={{
                                          fontSize: '0.8rem',
                                          color: '#34d399',
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px'
                                        }}
                                        title={`Email ${person.email}`}
                                      >
                                        <Mail size={12} style={{ flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {person.email}
                                        </span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                                  Key People not available
                                </div>
                              )
                            ) : (
                              <div
                                style={{
                                  background: 'rgba(245, 158, 11, 0.06)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>
                                  Key People locked ({lead.keyPeople?.count || 1} available)
                                </div>
                                <button
                                  type="button"
                                  onClick={handleUnlockKeyPeople}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.76rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '600',
                                    background: 'rgba(245, 158, 11, 0.18)',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    color: '#fbbf24',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                  title="Unlock Key People Intelligence"
                                >
                                  <Lock size={12} />
                                  <span>Unlock</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Bottom Section: Company Study & Pitch Deck Buttons */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '10px',
                              marginTop: 'auto',
                              paddingTop: '12px',
                              borderTop: '1px solid rgba(255, 255, 255, 0.07)'
                            }}
                          >
                            {/* Company Study */}
                            {studyDoc && (studyDoc.streamUrl || studyDoc.id) ? (
                              <button
                                type="button"
                                className="portal-btn-primary"
                                style={{
                                  padding: '8px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  width: '100%'
                                }}
                                onClick={() => setViewingLeadPdf({
                                  title: `${companyName} — Company Study`,
                                  documentType: 'Company Study',
                                  companyName,
                                  assetId: studyDoc.assetId || studyDoc.id || null,
                                  streamUrl: getAuthenticatedAssetUrl(studyDoc),
                                  downloadUrl: getAuthenticatedAssetUrl(studyDoc, 'download'),
                                  fileName: studyDoc.name || `${companyName.replace(/\s+/g, '_')}_Company_Study.pdf`
                                })}
                                title={`Open Company Study for ${companyName}`}
                              >
                                <FileText size={14} />
                                <span>Company Study</span>
                              </button>
                            ) : (
                              <div
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                                  color: '#64748B',
                                  fontSize: '0.76rem',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Clock size={12} />
                                <span>Company Study not available</span>
                              </div>
                            )}

                            {/* Pitch Deck */}
                            {pitchDoc && (pitchDoc.streamUrl || pitchDoc.id) ? (
                              <button
                                type="button"
                                className="portal-btn-primary"
                                style={{
                                  padding: '8px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  width: '100%'
                                }}
                                onClick={() => setViewingLeadPdf({
                                  title: `${companyName} — Pitch Deck`,
                                  documentType: 'Pitch Deck',
                                  companyName,
                                  assetId: pitchDoc.assetId || pitchDoc.id || null,
                                  streamUrl: getAuthenticatedAssetUrl(pitchDoc),
                                  downloadUrl: getAuthenticatedAssetUrl(pitchDoc, 'download'),
                                  fileName: pitchDoc.name || `${companyName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`
                                })}
                                title={`Open Pitch Deck for ${companyName}`}
                              >
                                <FileText size={14} />
                                <span>Pitch Deck</span>
                              </button>
                            ) : (
                              <div
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                                  color: '#64748B',
                                  fontSize: '0.76rem',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Clock size={12} />
                                <span>Pitch Deck not available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>



              {/* Dedicated "Request More Leads" Card & CTA (Above Sprint History) */}
              <div
                className="portal-card"
                style={{
                  marginBottom: '1.75rem',
                  background: 'linear-gradient(135deg, rgba(10, 18, 32, 0.95) 0%, rgba(17, 28, 48, 0.85) 100%)',
                  border: '1px solid rgba(0, 217, 255, 0.25)',
                  padding: '1.75rem 2rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#00D9FF', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                    <Sparkles size={13} /> Dedicated Outbound Prospecting
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
                    Need Custom or High-Volume Lead Prospecting?
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                    Commission a dedicated lead research sprint tailored to your ICP. Our specialized team sources, enriches, and validates verified decision-maker contacts and company intelligence.
                  </p>
                </div>
                <button
                  id="btn-request-more-leads"
                  type="button"
                  className="portal-btn-primary"
                  onClick={handleOpenLeadRequirementModal}
                  style={{
                    padding: '10px 22px',
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={16} /> Request More Leads
                </button>
              </div>

              {/* Company Lead Sprints & Requests (Full History) */}
              <div className="portal-card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: '#F5F5F5' }}>
                  Company Lead Sprint History ({companyLeadRequests.length})
                </h4>
                <div className="request-table-wrapper">
                  <table className="request-table">
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
                      {companyLeadRequests.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No Company Lead requests created yet. Click "Request Company Lead" to begin!
                          </td>
                        </tr>
                      ) : (
                        companyLeadRequests.map((req) => (
                          <tr key={req._id}>
                            <td>
                              <span className="ticket-key" onClick={() => handleOpenTicket(req)}>
                                {req.ticketId}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600', color: '#e2e8f0' }}>{req.title}</td>
                            <td>
                              <span className={`priority-pill ${req.priority}`}>{req.priority}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${req.status}`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{req.assignedTeam}</td>
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

              {/* INTERNAL PDF VIEWER MODAL */}
              {viewingLeadPdf && (
                <PdfViewerModal
                  isOpen={Boolean(viewingLeadPdf)}
                  title={viewingLeadPdf.title || `${viewingLeadPdf.companyName} — Document`}
                  documentType={viewingLeadPdf.documentType || 'PDF Document'}
                  companyName={viewingLeadPdf.companyName}
                  streamUrl={viewingLeadPdf.streamUrl}
                  downloadUrl={viewingLeadPdf.downloadUrl}
                  fileName={viewingLeadPdf.fileName || `${(viewingLeadPdf.companyName || 'Lead').replace(/\s+/g, '_')}_Document.pdf`}
                  onClose={() => setViewingLeadPdf(null)}
                />
              )}

              {/* LEAD DETAIL MODAL */}
              {selectedLeadDetail && (
                <div className="portal-modal-overlay" onClick={() => setSelectedLeadDetail(null)}>
                  <div
                    className="portal-modal-card"
                    style={{ maxWidth: '640px', width: '92%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                            {selectedLeadDetail.name}
                          </h3>
                          {(() => {
                            const stUpper = (selectedLeadDetail.status || 'PENDING').toUpperCase();
                            const isV = stUpper === 'VERIFIED' && Boolean(selectedLeadDetail.notes && selectedLeadDetail.notes.trim().length > 0);
                            if (isV) {
                              return (
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399' }}>
                                  VERIFIED
                                </span>
                              );
                            }
                            if (stUpper === 'RESEARCHED') {
                              return (
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 217, 255, 0.15)', border: '1px solid rgba(0, 217, 255, 0.3)', color: '#00D9FF' }}>
                                  RESEARCHED
                                </span>
                              );
                            }
                            return (
                              <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                                PENDING
                              </span>
                            );
                          })()}
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                          {selectedLeadDetail.title || 'Decision Maker'} • {selectedLeadDetail.company || 'Target Account'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedLeadDetail(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Modal Content: 5 Required Sections */}
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Section 1: COMPANY */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          1. Target Company & Executive Profile
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Full Name</div>
                            <div style={{ fontWeight: '600', color: '#F5F5F5', fontSize: '0.88rem' }}>{selectedLeadDetail.name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Job Title</div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{selectedLeadDetail.title || 'Not available'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Company</div>
                            <div style={{ color: '#00D9FF', fontWeight: '600', fontSize: '0.88rem' }}>{selectedLeadDetail.company || 'Not available'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Location</div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>{selectedLeadDetail.location || 'Not available'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Direct Email</div>
                            <div style={{ fontSize: '0.88rem' }}>
                              {selectedLeadDetail.email ? (
                                <a href={`mailto:${selectedLeadDetail.email}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>
                                  {selectedLeadDetail.email}
                                </a>
                              ) : (
                                <span style={{ color: '#64748b' }}>Not available</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>LinkedIn</div>
                            <div style={{ fontSize: '0.88rem' }}>
                              {selectedLeadDetail.linkedin ? (
                                <a href={selectedLeadDetail.linkedin} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}>
                                  Profile <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span style={{ color: '#64748b' }}>Not available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: RELEVANCE */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          2. Relevance & Research Rationale
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                            {selectedLeadDetail.notes || 'Research notes in progress by CreativeGini specialist.'}
                          </p>
                        </div>
                      </div>

                      {/* Section 3: VERIFICATION */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          3. Verification Status & Audit
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status:</span>
                            <span style={{ fontWeight: '700', fontSize: '0.82rem', color: (selectedLeadDetail.status || '').toUpperCase() === 'VERIFIED' && selectedLeadDetail.notes ? '#34d399' : '#fbbf24' }}>
                              {(selectedLeadDetail.status || 'PENDING').toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            {(selectedLeadDetail.status || '').toUpperCase() === 'VERIFIED' && selectedLeadDetail.notes ? (
                              <span style={{ color: '#a7f3d0' }}>
                                ✓ Verified by CreativeGini specialist. Contact details and executive profile confirmed active via research sources.
                              </span>
                            ) : (
                              <span>
                                Verification is currently in progress. This lead has been identified through initial market research but has not yet met full verification criteria.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 4: KEY PEOPLE */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          4. Related Account Stakeholders ({keyPeopleCount})
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          {keyPeopleCount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {company.initialKeyPeople.map((kp, kidx) => (
                                <div key={kidx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: kidx < keyPeopleCount - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                                  <div>
                                    <span style={{ fontWeight: '600', color: '#F5F5F5', fontSize: '0.85rem' }}>{kp.name}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '6px' }}>({kp.role || 'Stakeholder'})</span>
                                  </div>
                                  <div style={{ fontSize: '0.82rem' }}>
                                    {kp.contact ? (
                                      <a href={`mailto:${kp.contact}`} style={{ color: '#00D9FF', textDecoration: 'none' }}>{kp.contact}</a>
                                    ) : (
                                      <span style={{ color: '#64748b' }}>Not available</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Not available</div>
                          )}
                        </div>
                      </div>

                      {/* Section 5: LEAD RESEARCH DOSSIER / PDF */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          5. Lead Research Dossier & PDF Documentation
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          {(selectedLeadDetail.source_reference || selectedLeadDetail.sourceReference) ? (
                            <>
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#F5F5F5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <FileText size={16} color="#00D9FF" />
                                  <span>{selectedLeadDetail.name} — Research Intelligence Dossier</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                  Official lead profile document prepared by Company Lead specialists.
                                </div>
                              </div>
                              <a
                                href={selectedLeadDetail.source_reference || selectedLeadDetail.sourceReference}
                                target="_blank"
                                rel="noreferrer"
                                className="portal-btn-primary"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '0.82rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  textDecoration: 'none',
                                  background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                                  color: '#030303',
                                  fontWeight: '700'
                                }}
                              >
                                <FileText size={14} /> View Lead PDF
                              </a>
                            </>
                          ) : (
                            <div style={{ color: '#94a3b8', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} color="#f59e0b" />
                              <span>Lead documentation PDF is currently in preparation by the Company Lead specialist.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 6: RELATED REQUEST / TICKET */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00D9FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                          6. Related Service Request & Ticket
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {activeLeadRequest ? (
                            <>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <span style={{ fontWeight: '700', color: '#00D9FF', fontSize: '0.88rem' }}>{activeLeadRequest.ticketId}</span>
                                  <span className={`status-pill ${activeLeadRequest.status}`} style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                                    {activeLeadRequest.status.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{activeLeadRequest.title}</div>
                              </div>
                              <button
                                className="portal-btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                onClick={() => {
                                  setSelectedLeadDetail(null);
                                  handleOpenTicket(activeLeadRequest);
                                }}
                              >
                                <ExternalLink size={13} /> Open Ticket
                              </button>
                            </>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                              General Account Lead (No active sprint ticket linked)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="portal-btn-secondary"
                        onClick={() => setSelectedLeadDetail(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: COMPANY BOOST SERVICE */}
          {activeNav === 'company-boost' && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.12em', color: '#FFB000', textTransform: 'uppercase', background: 'rgba(255, 176, 0, 0.12)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255, 176, 0, 0.3)' }}>
                    Company Boost
                  </span>
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#F8FAFC', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  Your Company Growth Workspace
                </h1>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0, maxWidth: '750px', lineHeight: 1.6 }}>
                  Access tailored strategic plans, company-specific branded content previews, and developer relations frameworks prepared for {company?.name || 'your company'}, or request high-impact execution sprints.
                </p>
              </div>

              {/* THREE CORE SERVICE CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* CARD 1: Strategic Plan */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255, 176, 0, 0.25)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #FFB000, #F59E0B)' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 176, 0, 0.12)', border: '1px solid rgba(255, 176, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB000' }}>
                          <Compass size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                            Strategic Plan
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Growth & Market Architecture</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: onboardingStatus.strategicPlan === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                        color: onboardingStatus.strategicPlan === 'Uploaded' ? '#34D399' : '#FBBF24',
                        border: onboardingStatus.strategicPlan === 'Uploaded' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        {onboardingStatus.strategicPlan === 'Uploaded' ? 'Sample Ready' : 'In Preparation'}
                      </span>
                    </div>

                    <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      Comprehensive strategic roadmap tailored for {company?.name || 'your company'} covering market positioning, ICP pain-point mapping, outbound sequences, and growth playbooks.
                    </p>

                    {/* Onboarding Sample Plan View */}
                    <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Company Strategic Plan Sample
                      </div>
                      {onboardingAssets.strategicPlan ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <FileText size={20} style={{ color: '#FFB000', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {onboardingAssets.strategicPlan.name || 'Company Strategic Plan.pdf'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                {onboardingAssets.strategicPlan.size || 'PDF Document'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <a
                              href={getAuthenticatedAssetUrl(onboardingAssets.strategicPlan, 'stream')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="portal-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                              title="View Document"
                            >
                              <Eye size={14} /> View PDF
                            </a>
                            <a
                              href={getAuthenticatedAssetUrl(onboardingAssets.strategicPlan, 'download')}
                              download
                              className="portal-btn-secondary"
                              style={{ padding: '6px 9px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                              title="Download Strategic Plan"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.82rem' }}>
                          <Clock size={16} style={{ color: '#FFB000' }} />
                          <span>The Company Boost team is preparing the initial strategic plan sample for this company.</span>
                        </div>
                      )}
                    </div>

                    {/* What is Included */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                        What is Included:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Comprehensive market positioning audit</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Target ICP definition & pain-point matrix</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Tier-1 multi-channel outbound sequence architecture</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Executive presentation & implementation timeline</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Action */}
                  <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pricing Model</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFB000' }}>Pricing based on scope</span>
                    </div>
                    <button
                      className="portal-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #FFB000 0%, #f59e0b 100%)', color: '#030303', fontWeight: '800' }}
                      onClick={() => handleOpenRequirementModal('STRATEGIC_PLAN')}
                    >
                      <PlusCircle size={16} /> Request Strategic Plan
                    </button>
                  </div>
                </div>

                {/* CARD 2: Content for Your Company */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0, 217, 255, 0.25)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #00D9FF, #0088ff)' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 217, 255, 0.12)', border: '1px solid rgba(0, 217, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D9FF' }}>
                          <Video size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                            Content for Your Company
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Branded Posters & Showcase Videos</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: (onboardingStatus.poster === 'Uploaded' || onboardingStatus.video === 'Uploaded') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                        color: (onboardingStatus.poster === 'Uploaded' || onboardingStatus.video === 'Uploaded') ? '#34D399' : '#FBBF24',
                        border: (onboardingStatus.poster === 'Uploaded' || onboardingStatus.video === 'Uploaded') ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        {(onboardingStatus.poster === 'Uploaded' && onboardingStatus.video === 'Uploaded') ? 'Samples Ready' : 'In Production'}
                      </span>
                    </div>

                    <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      Engaging, high-converting visual assets and demo videos engineered to captivate prospects, demonstrate product value, and drive inbound engagement.
                    </p>

                    {/* Previews: 1 Poster + 1 Video */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
                      {/* Poster Preview */}
                      <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>
                          1 Poster
                        </div>
                        {onboardingAssets.poster ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={getAuthenticatedAssetUrl(onboardingAssets.poster, 'stream')}
                              alt="Company Poster"
                              style={{ width: '100%', height: '140px', objectFit: 'contain', background: '#030712', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                              onClick={() => setLightboxPoster(onboardingAssets.poster)}
                              title="Click to expand poster"
                            />
                            <div style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => setLightboxPoster(onboardingAssets.poster)}
                                style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '3px 8px', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
                                title="Expand Poster"
                              >
                                <Eye size={12} /> View
                              </button>
                              <a
                                href={getAuthenticatedAssetUrl(onboardingAssets.poster, 'download')}
                                download
                                style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '3px 6px', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                title="Download Poster"
                              >
                                <Download size={12} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <Image size={24} style={{ color: '#00D9FF', opacity: 0.7 }} />
                            <span style={{ fontSize: '0.72rem' }}>Poster in production</span>
                          </div>
                        )}
                      </div>

                      {/* Video Preview with Native Player */}
                      <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>
                          1 Video
                        </div>
                        {onboardingAssets.video ? (
                          <div style={{ position: 'relative' }}>
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '6px', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
                              src={getAuthenticatedAssetUrl(onboardingAssets.video, 'stream')}
                            >
                              <source src={getAuthenticatedAssetUrl(onboardingAssets.video, 'stream')} type={onboardingAssets.video.type || 'video/mp4'} />
                              Your browser does not support inline video preview.
                            </video>
                          </div>
                        ) : (
                          <div style={{ height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <Video size={24} style={{ color: '#00D9FF', opacity: 0.7 }} />
                            <span style={{ fontSize: '0.72rem' }}>Video in production</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What is Included */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                        What is Included:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>1 High-Resolution Branded Poster sprint deliverable</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>1 High-Definition Product Showcase Video</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Multi-channel ad & social formats</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Full source files & commercial rights</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Action */}
                  <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pricing Model</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#00D9FF' }}>Pricing based on scope</span>
                    </div>
                    <button
                      className="portal-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleOpenRequirementModal('CONTENT')}
                    >
                      <PlusCircle size={16} /> Request Content
                    </button>
                  </div>
                </div>

                {/* CARD 3: DevRel Plan */}
                <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(123, 97, 255, 0.25)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7b61ff, #a855f7)' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(123, 97, 255, 0.12)', border: '1px solid rgba(123, 97, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                          <Code2 size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                            DevRel Plan
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Technical & Developer Advocacy</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: onboardingStatus.devrelPlan === 'Uploaded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                        color: onboardingStatus.devrelPlan === 'Uploaded' ? '#34D399' : '#FBBF24',
                        border: onboardingStatus.devrelPlan === 'Uploaded' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        {onboardingStatus.devrelPlan === 'Uploaded' ? 'Sample Ready' : 'In Preparation'}
                      </span>
                    </div>

                    <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      Developer relations playbook engineered for technical products, API/SDK evangelism, developer community building, and technical content workflows.
                    </p>

                    {/* Onboarding Sample Plan View */}
                    <div style={{ background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        Company DevRel Plan Sample
                      </div>
                      {onboardingAssets.devrelPlan ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <FileText size={20} style={{ color: '#a855f7', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {onboardingAssets.devrelPlan.name || 'Company DevRel Plan.pdf'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                {onboardingAssets.devrelPlan.size || 'PDF Document'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <a
                              href={getAuthenticatedAssetUrl(onboardingAssets.devrelPlan, 'stream')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="portal-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                              title="View Document"
                            >
                              <Eye size={14} /> View Plan
                            </a>
                            <a
                              href={getAuthenticatedAssetUrl(onboardingAssets.devrelPlan, 'download')}
                              download
                              className="portal-btn-secondary"
                              style={{ padding: '6px 9px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                              title="Download DevRel Plan"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.82rem' }}>
                          <Clock size={16} style={{ color: '#a855f7' }} />
                          <span>The Company Boost team is preparing the initial DevRel plan sample for this company.</span>
                        </div>
                      )}
                    </div>

                    {/* What is Included */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                        What is Included:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Developer ecosystem & API adoption roadmap</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Documentation audit & quickstart enhancement</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Open-source community engagement strategy</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>Technical advocacy & developer outreach playbook</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Action */}
                  <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pricing Model</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a855f7' }}>Pricing based on scope</span>
                    </div>
                    <button
                      className="portal-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #7b61ff 0%, #6366f1 100%)' }}
                      onClick={() => handleOpenRequirementModal('DEVREL')}
                    >
                      <PlusCircle size={16} /> Request DevRel Plan
                    </button>
                  </div>
                </div>

              </div>

              {/* 5. CUSTOM REQUEST SECTION */}
              <div className="portal-card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(8, 20, 32, 0.95) 0%, rgba(6, 17, 26, 0.98) 100%)', border: '1px solid rgba(0, 217, 255, 0.25)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Sparkles size={18} style={{ color: '#00D9FF' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
                        Custom Request
                      </h3>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0 }}>
                      Select a combination of services or define customized deliverables for your growth sprint.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Pricing Model</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#00D9FF' }}>
                      Pricing based on scope
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRequestCustomService}>
                  {/* Service Multi-Select Checkboxes */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Select what you need:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      
                      <div
                        onClick={() => setCustomServices(prev => ({ ...prev, strategicPlan: !prev.strategicPlan }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: customServices.strategicPlan ? 'rgba(255, 176, 0, 0.12)' : 'rgba(6, 17, 26, 0.7)',
                          border: customServices.strategicPlan ? '1px solid #FFB000' : '1px solid var(--portal-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {customServices.strategicPlan ? (
                          <CheckSquare size={18} style={{ color: '#FFB000' }} />
                        ) : (
                          <Square size={18} style={{ color: '#64748B' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: customServices.strategicPlan ? '#F8FAFC' : '#CBD5E1' }}>
                            Strategic Plan
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Positioning & ICP Roadmap</div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCustomServices(prev => ({ ...prev, content: !prev.content }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: customServices.content ? 'rgba(0, 217, 255, 0.12)' : 'rgba(6, 17, 26, 0.7)',
                          border: customServices.content ? '1px solid #00D9FF' : '1px solid var(--portal-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {customServices.content ? (
                          <CheckSquare size={18} style={{ color: '#00D9FF' }} />
                        ) : (
                          <Square size={18} style={{ color: '#64748B' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: customServices.content ? '#F8FAFC' : '#CBD5E1' }}>
                            Content for Your Company
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Branded Posters & Demo Videos</div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCustomServices(prev => ({ ...prev, devrel: !prev.devrel }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: customServices.devrel ? 'rgba(123, 97, 255, 0.12)' : 'rgba(6, 17, 26, 0.7)',
                          border: customServices.devrel ? '1px solid #7b61ff' : '1px solid var(--portal-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {customServices.devrel ? (
                          <CheckSquare size={18} style={{ color: '#7b61ff' }} />
                        ) : (
                          <Square size={18} style={{ color: '#64748B' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: customServices.devrel ? '#F8FAFC' : '#CBD5E1' }}>
                            DevRel Plan
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Developer Relations Strategy</div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Requirements Textarea */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '8px' }}>
                      What would you like CreativeGini to prepare for you?
                    </label>
                    <textarea
                      rows="4"
                      className="portal-form-textarea"
                      placeholder="Describe your specific requirements, key goals, target market, or customized deliverables..."
                      value={customForm.requirements}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, requirements: e.target.value }))}
                      required
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="portal-btn-primary"
                      onClick={() => handleOpenRequirementModal('CUSTOM')}
                      style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                    >
                      Configure Custom Request →
                    </button>
                  </div>
                </form>
              </div>

              {/* Verified Company Profile Card */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Target Company Profile (Verified on File)
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
                <div className="portal-target-website-card">
                  <Globe size={24} className="portal-target-website-icon" color="#00D9FF" />
                  <div>
                    <div className="portal-target-website-url">{company?.website || 'https://acmecloud.ai'}</div>
                    <div className="portal-target-website-desc">
                      Associated with {company?.name}. No need to re-enter URLs or basic company data.
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Sample Work Section */}
              <div className="portal-card" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#F5F5F5', margin: '0 0 4px 0' }}>
                      Onboarding Sample Work
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
                      Initial sample deliverables prepared for your company by the CreativeGini UI/UX team.
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: (uiOnboardingAssets.uiAnalysis && uiOnboardingAssets.landingPageEnhancement) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: (uiOnboardingAssets.uiAnalysis && uiOnboardingAssets.landingPageEnhancement) ? '#34D399' : '#F59E0B',
                    border: (uiOnboardingAssets.uiAnalysis && uiOnboardingAssets.landingPageEnhancement) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {(uiOnboardingAssets.uiAnalysis && uiOnboardingAssets.landingPageEnhancement) ? 'Samples Complete' : 'In Preparation'}
                  </span>
                </div>

                {(!uiOnboardingAssets.uiAnalysis && !uiOnboardingAssets.landingPageEnhancement) ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center'
                  }}>
                    <Clock size={28} color="#00D9FF" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#F5F5F5', marginBottom: '4px' }}>
                      Your onboarding sample work is being prepared by our team.
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '520px', margin: '0 auto' }}>
                      Our UI/UX architects are currently reviewing your target digital touchpoints to prepare an initial UI/UX analysis and landing page enhancement concept.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Item 1: UI/UX Analysis */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: uiOnboardingAssets.uiAnalysis ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F5F5F5' }}>
                            1. Initial UI/UX Analysis
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: uiOnboardingAssets.uiAnalysis ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: uiOnboardingAssets.uiAnalysis ? '#34D399' : '#F59E0B'
                          }}>
                            {uiOnboardingAssets.uiAnalysis ? 'Ready' : 'In Preparation'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 12px 0' }}>
                          Complete UX critique, conversion friction points, and visual hierarchy review.
                        </p>
                      </div>

                      {uiOnboardingAssets.uiAnalysis ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#F5F5F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uiOnboardingAssets.uiAnalysis.name || 'ui_ux_analysis.pdf'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{uiOnboardingAssets.uiAnalysis.size || 'PDF'}</div>
                          </div>
                          <a
                            href={uiOnboardingAssets.uiAnalysis.streamUrl || uiOnboardingAssets.uiAnalysis.url}
                            target="_blank"
                            rel="noreferrer"
                            className="portal-btn-primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              textDecoration: 'none',
                              background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                              color: '#030303',
                              fontWeight: '700',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={13} /> View Analysis
                          </a>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.8rem' }}>
                          <Clock size={14} color="#f59e0b" />
                          <span>Specialist is finalizing your UI/UX analysis.</span>
                        </div>
                      )}
                    </div>

                    {/* Item 2: Landing Page Enhancement */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: uiOnboardingAssets.landingPageEnhancement ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F5F5F5' }}>
                            2. Landing Page Enhancement
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: uiOnboardingAssets.landingPageEnhancement ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: uiOnboardingAssets.landingPageEnhancement ? '#34D399' : '#F59E0B'
                          }}>
                            {uiOnboardingAssets.landingPageEnhancement ? 'Ready' : 'In Preparation'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 12px 0' }}>
                          Sample concept prototype, high-fidelity mockups, and layout recommendations.
                        </p>
                      </div>

                      {uiOnboardingAssets.landingPageEnhancement ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '6px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#F5F5F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uiOnboardingAssets.landingPageEnhancement.name || 'landing_page_sample'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{uiOnboardingAssets.landingPageEnhancement.size || 'Design Asset'}</div>
                          </div>
                          <a
                            href={uiOnboardingAssets.landingPageEnhancement.streamUrl || uiOnboardingAssets.landingPageEnhancement.url}
                            target="_blank"
                            rel="noreferrer"
                            className="portal-btn-primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              textDecoration: 'none',
                              background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)',
                              color: '#030303',
                              fontWeight: '700',
                              flexShrink: 0
                            }}
                          >
                            <ExternalLink size={13} /> View Sample
                          </a>
                        </div>
                      ) : (
                        <div style={{ display: 'center', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.8rem' }}>
                          <Clock size={14} color="#f59e0b" />
                          <span>Specialist is finalizing your landing page concept.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Landing Page Requests */}
              <div className="portal-card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Enhancement Sprints
                </h4>
                <div className="request-table-wrapper">
                  <table className="request-table">
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

          {/* VIEW: MY REQUESTS (TICKET SYSTEM) */}
          {activeNav === 'requests' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
                  My Requests & Ticket Center
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                  All paid requests are tracked as tickets with status lifecycle, activity history, and direct team conversation.
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
              <div className="request-table-wrapper">
                <table className="request-table">
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No tickets match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUserRequests.map((req) => (
                        <tr
                          key={req._id}
                          className="clickable-row"
                          onClick={() => handleOpenTicket(req)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenTicket(req);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Click to view ticket details for ${req.ticketId}`}
                        >
                          <td>
                            <span className="ticket-key">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: ASSETS MEDIA LIBRARY */}
          {activeNav === 'assets' && (
            <AssetsView
              user={user}
              company={company}
              onNavigate={handleNavigate}
            />
          )}

          {/* VIEW: INVOICES & PAYMENTS */}
          {activeNav === 'billing' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                Invoices & Payment History
              </h2>

              <div className="request-table-wrapper">
                <table className="request-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Description / Ticket</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter(r => r.paymentStatus === 'PAID').length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No paid invoices recorded yet.
                        </td>
                      </tr>
                    ) : (
                      requests.filter(r => r.paymentStatus === 'PAID').map((req, idx) => (
                        <tr
                          key={req._id}
                          className="clickable-row"
                          onClick={() => setViewingInvoice({ ...req, invoiceId: `INV-2026-00${idx + 1}` })}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setViewingInvoice({ ...req, invoiceId: `INV-2026-00${idx + 1}` });
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Click to view invoice details for INV-2026-00${idx + 1}`}
                        >
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
                <div style={{ padding: '0.9rem 1.15rem', borderRadius: '8px', background: 'rgba(6, 17, 26, 0.85)', border: '1px solid var(--portal-border)', borderLeft: '4px solid #a78bfa' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#F5F5F5' }}>Welcome to CreativeGini Portal!</div>
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
            <>
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

              {/* Change Password Section */}
              <ChangePasswordSection />
            </>
          )}
            </>
          )}
        </div>
      </div>

      {/* 3.5. COMPANY BOOST REQUIREMENT MODAL (MULTI-STEP FLOW) */}
      {isRequirementModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsRequirementModalOpen(false)}>
          <div
            className="portal-modal-card"
            style={{
              maxWidth: '820px',
              width: '94vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              background: '#07101E',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 217, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--portal-border)',
                background: 'rgba(6, 17, 26, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexShrink: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(0, 217, 255, 0.12)',
                      color: '#00D9FF',
                      border: '1px solid rgba(0, 217, 255, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {requirementSubService === 'STRATEGIC_PLAN'
                      ? 'Strategic Plan Sprint'
                      : requirementSubService === 'CONTENT'
                      ? 'Content Production Sprint'
                      : requirementSubService === 'DEVREL'
                      ? 'DevRel Strategy Sprint'
                      : 'Custom Boost Sprint'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Company Boost Service</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                  {requirementStep === 1 && 'Tell us what you need'}
                  {requirementStep === 2 && 'Review Your Requirements'}
                  {requirementStep === 3 && 'Your Request Price'}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Stepper Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[
                    { num: 1, label: 'Scope' },
                    { num: 2, label: 'Review' },
                    { num: 3, label: 'Price' }
                  ].map((s, idx) => (
                    <React.Fragment key={s.num}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: requirementStep === s.num
                            ? 'rgba(0, 217, 255, 0.2)'
                            : requirementStep > s.num
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(255,255,255,0.05)',
                          color: requirementStep === s.num
                            ? '#00D9FF'
                            : requirementStep > s.num
                            ? '#10B981'
                            : '#64748B',
                          border: requirementStep === s.num ? '1px solid #00D9FF' : '1px solid transparent'
                        }}
                      >
                        <span>{s.num}</span>
                        <span>{s.label}</span>
                      </div>
                      {idx < 2 && <span style={{ color: '#475569', fontSize: '0.7rem' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsRequirementModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '1.5rem',
                overflowY: 'auto',
                flexGrow: 1,
                background: 'rgba(6, 17, 26, 0.4)'
              }}
            >
              {/* STEP 1: FORM FIELDS */}
              {requirementStep === 1 && (
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: 0, marginBottom: '1.25rem' }}>
                    Provide your requirements below. Required fields are marked with an asterisk (<span style={{ color: '#EF4444' }}>*</span>).
                  </p>

                  {/* 1. STRATEGIC PLAN FORM */}
                  {requirementSubService === 'STRATEGIC_PLAN' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label className="portal-form-label">
                          Main Goal <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          className="portal-form-input"
                          placeholder="e.g. Enterprise account expansion, market repositioning, GTM outbound strategy"
                          value={strategicPlanForm.mainGoal}
                          onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, mainGoal: e.target.value })}
                          style={{ borderColor: requirementErrors.mainGoal ? '#EF4444' : undefined }}
                        />
                        {requirementErrors.mainGoal && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {requirementErrors.mainGoal}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">
                            Target Market / Audience <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. North American B2B SaaS, Seed to Series B"
                            value={strategicPlanForm.targetMarket}
                            onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, targetMarket: e.target.value })}
                            style={{ borderColor: requirementErrors.targetMarket ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.targetMarket && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.targetMarket}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="portal-form-label">
                            What Should CreativeGini Focus On?
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Ideal customer profile definition, positioning copy, competitive moats"
                            value={strategicPlanForm.focusArea}
                            onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, focusArea: e.target.value })}
                            style={{ borderColor: requirementErrors.focusArea ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.focusArea && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.focusArea}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="portal-form-label">
                          Current Challenges / Pain Points <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          className="portal-form-input"
                          rows={3}
                          placeholder="Describe your current bottlenecks, conversion issues, or competitive headwinds..."
                          value={strategicPlanForm.painPoints}
                          onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, painPoints: e.target.value })}
                          style={{ borderColor: requirementErrors.painPoints ? '#EF4444' : undefined, resize: 'vertical' }}
                        />
                        {requirementErrors.painPoints && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {requirementErrors.painPoints}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="portal-form-label">
                          Expected Outcome
                        </label>
                        <textarea
                          className="portal-form-input"
                          rows={2}
                          placeholder="e.g. Actionable 60-day outbound roadmap, clear pitch deck narrative, sales collateral templates"
                          value={strategicPlanForm.expectedOutcome}
                          onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, expectedOutcome: e.target.value })}
                          style={{ borderColor: requirementErrors.expectedOutcome ? '#EF4444' : undefined, resize: 'vertical' }}
                        />
                        {requirementErrors.expectedOutcome && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {requirementErrors.expectedOutcome}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Competitors / Reference Companies</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Acme Corp, Linear, Retool"
                            value={strategicPlanForm.competitors}
                            onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, competitors: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Reference Links</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. https://yourcompany.com/pitch or Notion link"
                            value={strategicPlanForm.referenceLinks}
                            onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, referenceLinks: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="portal-form-label">Additional Requirements</label>
                        <textarea
                          className="portal-form-input"
                          rows={2}
                          placeholder="Any specific constraints, timelines, or tone preferences..."
                          value={strategicPlanForm.additionalRequirements}
                          onChange={(e) => setStrategicPlanForm({ ...strategicPlanForm, additionalRequirements: e.target.value })}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. CONTENT FORM */}
                  {requirementSubService === 'CONTENT' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label className="portal-form-label">
                          Content Type <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                          {[
                            { key: 'poster', label: 'Poster / Visual Asset' },
                            { key: 'productVideo', label: 'Product Video' },
                            { key: 'socialContent', label: 'Social Media Content' },
                            { key: 'productShowcase', label: 'Product Showcase' },
                            { key: 'other', label: 'Other' }
                          ].map((t) => (
                            <label
                              key={t.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: contentForm.contentTypes[t.key] ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                                border: contentForm.contentTypes[t.key] ? '1px solid #00D9FF' : '1px solid var(--portal-border)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: contentForm.contentTypes[t.key] ? '#00D9FF' : '#CBD5E1',
                                userSelect: 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!contentForm.contentTypes[t.key]}
                                onChange={(e) =>
                                  setContentForm({
                                    ...contentForm,
                                    contentTypes: { ...contentForm.contentTypes, [t.key]: e.target.checked }
                                  })
                                }
                                style={{ display: 'none' }}
                              />
                              {contentForm.contentTypes[t.key] ? <CheckSquare size={16} color="#00D9FF" /> : <Square size={16} color="#64748B" />}
                              <span>{t.label}</span>
                            </label>
                          ))}
                        </div>
                        {requirementErrors.contentTypes && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '6px' }}>
                            {requirementErrors.contentTypes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">
                            Number / Type of Deliverables <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. 1 High-res Poster + 1 60s Showcase Video"
                            value={contentForm.deliverablesCount}
                            onChange={(e) => setContentForm({ ...contentForm, deliverablesCount: e.target.value })}
                            style={{ borderColor: requirementErrors.deliverablesCount ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.deliverablesCount && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.deliverablesCount}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="portal-form-label">
                            Product / Service to Highlight <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. AI Workflow Engine, Enterprise Data Layer"
                            value={contentForm.productHighlight}
                            onChange={(e) => setContentForm({ ...contentForm, productHighlight: e.target.value })}
                            style={{ borderColor: requirementErrors.productHighlight ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.productHighlight && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.productHighlight}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">
                            Main Purpose <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Product launch announcement, LinkedIn paid campaign, lead generation"
                            value={contentForm.mainPurpose}
                            onChange={(e) => setContentForm({ ...contentForm, mainPurpose: e.target.value })}
                            style={{ borderColor: requirementErrors.mainPurpose ? '#EF4444' : undefined, resize: 'vertical' }}
                          />
                          {requirementErrors.mainPurpose && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.mainPurpose}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="portal-form-label">
                            Target Audience
                          </label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Enterprise CTOs, VP Product, Web3 Developers"
                            value={contentForm.targetAudience}
                            onChange={(e) => setContentForm({ ...contentForm, targetAudience: e.target.value })}
                            style={{ borderColor: requirementErrors.targetAudience ? '#EF4444' : undefined, resize: 'vertical' }}
                          />
                          {requirementErrors.targetAudience && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.targetAudience}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Preferred Platforms</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. LinkedIn, Twitter / X, YouTube, Website Hero"
                            value={contentForm.preferredPlatforms}
                            onChange={(e) => setContentForm({ ...contentForm, preferredPlatforms: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Key Message</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. The fastest way to build enterprise apps in 2026"
                            value={contentForm.keyMessage}
                            onChange={(e) => setContentForm({ ...contentForm, keyMessage: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Brand / Style Requirements</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Dark mode aesthetics, futuristic cyberpunk accents, clean minimalist typography"
                            value={contentForm.brandRequirements}
                            onChange={(e) => setContentForm({ ...contentForm, brandRequirements: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Reference Examples</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Links to visual styles, videos, or competitor creative you like"
                            value={contentForm.referenceExamples}
                            onChange={(e) => setContentForm({ ...contentForm, referenceExamples: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Existing Brand Assets</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Vector logo in Google Drive, brand kit available upon kickoff"
                            value={contentForm.existingBrandAssets}
                            onChange={(e) => setContentForm({ ...contentForm, existingBrandAssets: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Additional Requirements</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. 16:9 widescreen format, subtitle/caption file required"
                            value={contentForm.additionalRequirements}
                            onChange={(e) => setContentForm({ ...contentForm, additionalRequirements: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DEVREL PLAN FORM */}
                  {requirementSubService === 'DEVREL' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">
                            Main DevRel Goal <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Increase SDK installs, launch developer hackathon, build dev docs"
                            value={devrelForm.mainDevrelGoal}
                            onChange={(e) => setDevrelForm({ ...devrelForm, mainDevrelGoal: e.target.value })}
                            style={{ borderColor: requirementErrors.mainDevrelGoal ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.mainDevrelGoal && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.mainDevrelGoal}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="portal-form-label">
                            Product / API / SDK <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. CreativeGini TypeScript SDK, GraphQL Data API"
                            value={devrelForm.productApiSdk}
                            onChange={(e) => setDevrelForm({ ...devrelForm, productApiSdk: e.target.value })}
                            style={{ borderColor: requirementErrors.productApiSdk ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.productApiSdk && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.productApiSdk}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">
                            Target Developer Audience <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Senior Frontend Engineers, DevOps/SREs, Python Data Scientists"
                            value={devrelForm.targetDeveloperAudience}
                            onChange={(e) => setDevrelForm({ ...devrelForm, targetDeveloperAudience: e.target.value })}
                            style={{ borderColor: requirementErrors.targetDeveloperAudience ? '#EF4444' : undefined }}
                          />
                          {requirementErrors.targetDeveloperAudience && (
                            <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                              {requirementErrors.targetDeveloperAudience}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="portal-form-label">Developer Platforms / Communities</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. GitHub, Discord, Hacker News, Reddit r/webdev, StackOverflow"
                            value={devrelForm.developerPlatforms}
                            onChange={(e) => setDevrelForm({ ...devrelForm, developerPlatforms: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="portal-form-label">Current Developer Adoption / Challenges</label>
                        <textarea
                          className="portal-form-input"
                          rows={2}
                          placeholder="e.g. High initial drop-off during onboarding, missing code samples, complex auth setup..."
                          value={devrelForm.developerAdoptionChallenges}
                          onChange={(e) => setDevrelForm({ ...devrelForm, developerAdoptionChallenges: e.target.value })}
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Documentation Requirements</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Quickstart guide, interactive API playground, SDK reference..."
                            value={devrelForm.documentationRequirements}
                            onChange={(e) => setDevrelForm({ ...devrelForm, documentationRequirements: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Community Requirements</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Discord server structure, developer advocate office hours, community badges..."
                            value={devrelForm.communityRequirements}
                            onChange={(e) => setDevrelForm({ ...devrelForm, communityRequirements: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Open-Source Requirements</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. GitHub starter template, good first issues, contribution guidelines..."
                            value={devrelForm.openSourceRequirements}
                            onChange={(e) => setDevrelForm({ ...devrelForm, openSourceRequirements: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Developer Content Requirements</label>
                          <textarea
                            className="portal-form-input"
                            rows={2}
                            placeholder="e.g. Technical tutorials, architecture deep dives, benchmark blog posts..."
                            value={devrelForm.developerContentRequirements}
                            onChange={(e) => setDevrelForm({ ...devrelForm, developerContentRequirements: e.target.value })}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="portal-form-label">
                          Expected Outcome <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          className="portal-form-input"
                          rows={2}
                          placeholder="e.g. Complete DevRel operational blueprint, 30-day developer acquisition sprint plan"
                          value={devrelForm.expectedOutcome}
                          onChange={(e) => setDevrelForm({ ...devrelForm, expectedOutcome: e.target.value })}
                          style={{ borderColor: requirementErrors.expectedOutcome ? '#EF4444' : undefined, resize: 'vertical' }}
                        />
                        {requirementErrors.expectedOutcome && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {requirementErrors.expectedOutcome}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Reference Links</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. https://github.com/your-repo or API docs link"
                            value={devrelForm.referenceLinks}
                            onChange={(e) => setDevrelForm({ ...devrelForm, referenceLinks: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Additional Requirements</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. Integration with Stripe dev portal style"
                            value={devrelForm.additionalRequirements}
                            onChange={(e) => setDevrelForm({ ...devrelForm, additionalRequirements: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. CUSTOM REQUEST FORM */}
                  {requirementSubService === 'CUSTOM' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label className="portal-form-label">
                          Select Services Needed <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                          {[
                            { key: 'strategicPlan', label: 'Strategic Plan' },
                            { key: 'content', label: 'Content for Your Company' },
                            { key: 'devrel', label: 'DevRel Plan' }
                          ].map((srv) => (
                            <label
                              key={srv.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                background: customForm.selectedServices[srv.key] ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                                border: customForm.selectedServices[srv.key] ? '1px solid #00D9FF' : '1px solid var(--portal-border)',
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                                color: customForm.selectedServices[srv.key] ? '#00D9FF' : '#CBD5E1',
                                userSelect: 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!customForm.selectedServices[srv.key]}
                                onChange={(e) =>
                                  setCustomForm({
                                    ...customForm,
                                    selectedServices: { ...customForm.selectedServices, [srv.key]: e.target.checked }
                                  })
                                }
                                style={{ display: 'none' }}
                              />
                              {customForm.selectedServices[srv.key] ? <CheckSquare size={16} color="#00D9FF" /> : <Square size={16} color="#64748B" />}
                              <span>{srv.label}</span>
                            </label>
                          ))}
                        </div>
                        {requirementErrors.selectedServices && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '6px' }}>
                            {requirementErrors.selectedServices}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="portal-form-label">
                          Requirements / Description <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          className="portal-form-input"
                          rows={4}
                          placeholder="Describe the multidisciplinary scope, goals, target deliverables, or custom assistance needed..."
                          value={customForm.requirements}
                          onChange={(e) => setCustomForm({ ...customForm, requirements: e.target.value })}
                          style={{ borderColor: requirementErrors.requirements ? '#EF4444' : undefined, resize: 'vertical' }}
                        />
                        {requirementErrors.requirements && (
                          <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {requirementErrors.requirements}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="portal-form-label">Expected Outcome</label>
                        <textarea
                          className="portal-form-input"
                          rows={2}
                          placeholder="e.g. End-to-end positioning narrative and matching hero visual asset"
                          value={customForm.expectedOutcome}
                          onChange={(e) => setCustomForm({ ...customForm, expectedOutcome: e.target.value })}
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label className="portal-form-label">Additional Requirements</label>
                          <input
                            className="portal-form-input"
                            placeholder="Any specific tools, frameworks, or deadlines"
                            value={customForm.additionalRequirements}
                            onChange={(e) => setCustomForm({ ...customForm, additionalRequirements: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="portal-form-label">Reference Links</label>
                          <input
                            className="portal-form-input"
                            placeholder="e.g. https://yourcompany.com or design docs"
                            value={customForm.referenceLinks}
                            onChange={(e) => setCustomForm({ ...customForm, referenceLinks: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: REVIEW REQUIREMENTS */}
              {requirementStep === 2 && (
                <div>
                  <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D9FF', fontWeight: '700', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> Review Your Requirements Brief
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: '#CBD5E1', fontSize: '0.82rem' }}>
                      Review everything you entered below before proceeding to backend price calculation. No ticket has been created yet.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(6, 17, 26, 0.95)', border: '1px solid var(--portal-border)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--portal-border)', paddingBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Area</span>
                      <span style={{ fontWeight: '700', color: '#00D9FF' }}>
                        {requirementSubService === 'STRATEGIC_PLAN' && 'Strategic Plan Sprint'}
                        {requirementSubService === 'CONTENT' && 'Content for Your Company Sprint'}
                        {requirementSubService === 'DEVREL' && 'DevRel Plan Sprint'}
                        {requirementSubService === 'CUSTOM' && 'Custom Boost Sprint'}
                      </span>
                    </div>

                    {requirementSubService === 'STRATEGIC_PLAN' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Main Goal</div>
                          <div style={{ color: '#F8FAFC', fontWeight: '600', marginTop: '2px' }}>{strategicPlanForm.mainGoal}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Target Market / Audience</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px' }}>{strategicPlanForm.targetMarket}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Focus Area</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px' }}>{strategicPlanForm.focusArea || <span style={{ color: '#64748B' }}>Not specified</span>}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Current Challenges / Pain Points</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{strategicPlanForm.painPoints}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Expected Outcome</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{strategicPlanForm.expectedOutcome || <span style={{ color: '#64748B' }}>Not specified</span>}</div>
                        </div>
                        {strategicPlanForm.competitors && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Competitors / References</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{strategicPlanForm.competitors}</div>
                          </div>
                        )}
                        {strategicPlanForm.additionalRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Additional Requirements</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{strategicPlanForm.additionalRequirements}</div>
                          </div>
                        )}
                        {strategicPlanForm.referenceLinks && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reference Links</div>
                            <div style={{ color: '#00D9FF', marginTop: '2px', wordBreak: 'break-all' }}>{strategicPlanForm.referenceLinks}</div>
                          </div>
                        )}
                      </>
                    )}

                    {requirementSubService === 'CONTENT' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Content Types Selected</div>
                          <div style={{ color: '#00D9FF', fontWeight: '600', marginTop: '2px' }}>
                            {Object.entries(contentForm.contentTypes)
                              .filter(([_, v]) => v)
                              .map(([k]) => k === 'productVideo' ? 'Product Video' : k === 'socialContent' ? 'Social Media Content' : k === 'productShowcase' ? 'Product Showcase' : k === 'poster' ? 'Poster' : 'Other')
                              .join(', ') || 'None selected'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Deliverables Scope</div>
                          <div style={{ color: '#F8FAFC', fontWeight: '600', marginTop: '2px' }}>{contentForm.deliverablesCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Product / Service to Highlight</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px' }}>{contentForm.productHighlight}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Main Purpose</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{contentForm.mainPurpose}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Target Audience</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px' }}>{contentForm.targetAudience || <span style={{ color: '#64748B' }}>Not specified</span>}</div>
                        </div>
                        {contentForm.preferredPlatforms && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Preferred Platforms</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{contentForm.preferredPlatforms}</div>
                          </div>
                        )}
                        {contentForm.keyMessage && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Key Message</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{contentForm.keyMessage}</div>
                          </div>
                        )}
                        {contentForm.brandRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Brand / Style Requirements</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{contentForm.brandRequirements}</div>
                          </div>
                        )}
                        {contentForm.referenceExamples && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reference Examples</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{contentForm.referenceExamples}</div>
                          </div>
                        )}
                        {contentForm.existingBrandAssets && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Existing Brand Assets</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{contentForm.existingBrandAssets}</div>
                          </div>
                        )}
                        {contentForm.additionalRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Additional Requirements</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{contentForm.additionalRequirements}</div>
                          </div>
                        )}
                      </>
                    )}

                    {requirementSubService === 'DEVREL' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Main DevRel Goal</div>
                          <div style={{ color: '#F8FAFC', fontWeight: '600', marginTop: '2px' }}>{devrelForm.mainDevrelGoal}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Product / API / SDK</div>
                          <div style={{ color: '#F8FAFC', fontWeight: '600', marginTop: '2px' }}>{devrelForm.productApiSdk}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Target Developer Audience</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px' }}>{devrelForm.targetDeveloperAudience}</div>
                        </div>
                        {devrelForm.developerPlatforms && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Platforms & Communities</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{devrelForm.developerPlatforms}</div>
                          </div>
                        )}
                        {devrelForm.developerAdoptionChallenges && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Adoption Challenges</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{devrelForm.developerAdoptionChallenges}</div>
                          </div>
                        )}
                        {devrelForm.documentationRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Documentation Scope</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{devrelForm.documentationRequirements}</div>
                          </div>
                        )}
                        {devrelForm.communityRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Community Scope</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{devrelForm.communityRequirements}</div>
                          </div>
                        )}
                        {devrelForm.openSourceRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Open-Source Scope</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{devrelForm.openSourceRequirements}</div>
                          </div>
                        )}
                        {devrelForm.developerContentRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Developer Content Scope</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{devrelForm.developerContentRequirements}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Expected Outcome</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{devrelForm.expectedOutcome}</div>
                        </div>
                        {devrelForm.referenceLinks && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reference Links</div>
                            <div style={{ color: '#00D9FF', marginTop: '2px', wordBreak: 'break-all' }}>{devrelForm.referenceLinks}</div>
                          </div>
                        )}
                        {devrelForm.additionalRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Additional Requirements</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{devrelForm.additionalRequirements}</div>
                          </div>
                        )}
                      </>
                    )}

                    {requirementSubService === 'CUSTOM' && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Selected Service Components</div>
                          <div style={{ color: '#00D9FF', fontWeight: '600', marginTop: '2px' }}>
                            {[
                              customForm.selectedServices.strategicPlan && 'Strategic Plan',
                              customForm.selectedServices.content && 'Content for Your Company',
                              customForm.selectedServices.devrel && 'DevRel Plan'
                            ].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Requirements / Scope Description</div>
                          <div style={{ color: '#F8FAFC', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{customForm.requirements}</div>
                        </div>
                        {customForm.expectedOutcome && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Expected Outcome</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{customForm.expectedOutcome}</div>
                          </div>
                        )}
                        {customForm.additionalRequirements && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Additional Requirements</div>
                            <div style={{ color: '#CBD5E1', marginTop: '2px' }}>{customForm.additionalRequirements}</div>
                          </div>
                        )}
                        {customForm.referenceLinks && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Reference Links</div>
                            <div style={{ color: '#00D9FF', marginTop: '2px', wordBreak: 'break-all' }}>{customForm.referenceLinks}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: YOUR REQUEST PRICE */}
              {requirementStep === 3 && (
                <div>
                  <div style={{ background: 'rgba(6, 17, 26, 0.95)', border: '1px solid var(--portal-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Configured Service
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC', margin: '4px 0 0 0' }}>
                          {configuredPriceData?.serviceLabel || 'Company Boost Sprint'}
                        </h4>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Authoritative Sprint Fee
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00D9FF', fontFamily: 'monospace' }}>
                          ${configuredPriceData?.price || 799}.00 <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>{configuredPriceData?.currency || 'USD'}</span>
                        </div>
                        <div style={{ display: 'inline-block', marginTop: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                          ✓ {configuredPriceData?.pricingStatus || 'CONFIGURED'}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    {configuredPriceData?.breakdown && configuredPriceData.breakdown.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                          Itemized Scope Breakdown
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {configuredPriceData.breakdown.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '6px 0', borderBottom: idx < configuredPriceData.breakdown.length - 1 ? '1px dashed rgba(255,255,255,0.06)' : undefined }}>
                              <span style={{ color: '#CBD5E1' }}>• {item.item}</span>
                              <span style={{ fontWeight: '700', color: '#F8FAFC', fontFamily: 'monospace' }}>${item.amount}.00 USD</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCard size={22} color="#00D9FF" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                      Pricing is dynamically configured and validated server-side. Clicking <strong>Confirm & Continue</strong> will create your sprint ticket and direct you to the existing secure checkout. You will not be charged until you confirm payment authorization.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="portal-modal-footer"
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--portal-border)',
                background: 'rgba(6, 17, 26, 0.95)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              {requirementStep === 1 && (
                <>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    onClick={() => setIsRequirementModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="portal-btn-primary"
                    onClick={handleProceedToReview}
                  >
                    Review Requirements →
                  </button>
                </>
              )}

              {requirementStep === 2 && (
                <>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    onClick={() => setRequirementStep(1)}
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    className="portal-btn-primary"
                    onClick={handleProceedToPricing}
                    disabled={calculatingPrice}
                  >
                    {calculatingPrice ? 'Configuring Price...' : 'Continue to Pricing →'}
                  </button>
                </>
              )}

              {requirementStep === 3 && (
                <>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    onClick={() => setRequirementStep(2)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="portal-btn-primary"
                    onClick={handleConfirmAndProceedToPayment}
                    disabled={isSubmittingRequest}
                    style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #0284c7 100%)', color: '#030303', fontWeight: '800' }}
                  >
                    {isSubmittingRequest ? 'Creating Ticket...' : 'Confirm & Continue →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3B. REQUEST MORE LEADS REQUIREMENT MODAL (Company Lead - Simplified 2-Step Flow) */}
      {isLeadReqModalOpen && (
        <div className="lead-req-modal-overlay" onClick={() => setIsLeadReqModalOpen(false)}>
          <div
            className="lead-req-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="lead-req-modal-header">
              <div>
                <div className="lead-req-header-top">
                  <span className="lead-req-badge">
                    COMPANY LEAD
                  </span>
                  <span className="lead-req-subtitle">• Dedicated Outbound Research Sprint</span>
                </div>
                <h3 className="lead-req-title">
                  Request More Leads
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '3px' }}>
                  Tell us how many leads you need.
                </div>
              </div>
              <button
                type="button"
                className="lead-req-close-btn"
                onClick={() => setIsLeadReqModalOpen(false)}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Progress Bar (Simplified 2-Step) */}
            <div className="lead-req-stepper">
              {[
                { num: 1, label: '1. Number of Leads' },
                { num: 2, label: '2. Pricing & Payment' }
              ].map((s) => (
                <div
                  key={s.num}
                  className={`lead-req-step-item ${
                    leadReqStep === s.num ? 'active' : leadReqStep > s.num ? 'completed' : 'inactive'
                  }`}
                >
                  <span className="lead-req-step-num">
                    {leadReqStep > s.num ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="lead-req-modal-body">
              {/* STEP 1: HOW MANY LEADS DO YOU WANT? */}
              {leadReqStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="lead-req-info-card" style={{ marginBottom: 0 }}>
                    <div className="lead-req-info-title">
                      How many leads do you want?
                    </div>
                    <div className="lead-req-info-text">
                      Enter the target volume of leads for your outbound sprint. Our research specialists will prospect and verify decision-makers matching your company criteria.
                    </div>
                  </div>

                  <div className="lead-req-form-group" style={{ marginBottom: 0 }}>
                    <label className="lead-req-label" htmlFor="lead-input-count">
                      Number of Leads Required <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      id="lead-input-count"
                      type="number"
                      min="1"
                      max="5000"
                      step="1"
                      className={`lead-req-input ${leadReqErrors.leadsCount ? 'error' : ''}`}
                      placeholder="e.g. 50"
                      value={leadReqForm.leadsCount}
                      onChange={(e) => {
                        setLeadReqForm({ leadsCount: e.target.value });
                        if (leadReqErrors.leadsCount) {
                          setLeadReqErrors({});
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleProceedLeadToPricing();
                        }
                      }}
                      autoFocus
                    />
                    {leadReqErrors.leadsCount ? (
                      <div className="lead-req-error-msg" id="lead-error-count">
                        {leadReqErrors.leadsCount}
                      </div>
                    ) : (
                      <div className="lead-req-hint">
                        Standard sprint provides 50 fully verified leads.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: PRICING & PAYMENT */}
              {leadReqStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="lead-req-elevated-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Your Request
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F5F5F5', margin: '4px 0 0 0' }}>
                          {leadPriceData?.serviceLabel || 'Company Lead Target Research'}
                        </h4>
                        <div style={{ fontSize: '0.9rem', color: '#00D9FF', fontWeight: '700', marginTop: '4px' }}>
                          {leadReqForm.leadsCount} Verified Leads
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Price
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#00D9FF', fontFamily: 'monospace' }}>
                          ${leadPriceData?.price || 499}.00 <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>{leadPriceData?.currency || 'USD'}</span>
                        </div>
                        <div style={{ display: 'inline-block', marginTop: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
                          ✓ {leadPriceData?.pricingStatus || 'CONFIGURED'}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Table if available from backend */}
                    {leadPriceData?.breakdown && leadPriceData.breakdown.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(0, 217, 255, 0.12)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                          Itemized Scope Breakdown
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {leadPriceData.breakdown.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderBottom: idx < leadPriceData.breakdown.length - 1 ? '1px dashed rgba(255,255,255,0.06)' : undefined }}>
                              <span style={{ color: '#CBD5E1' }}>• {item.item}</span>
                              <span style={{ fontWeight: '700', color: '#F5F5F5', fontFamily: 'monospace' }}>${item.amount}.00 USD</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lead-req-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 0 }}>
                    <CreditCard size={22} color="#00D9FF" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                      Pricing is strictly validated server-side. Clicking <strong>Proceed to Payment</strong> will create your sprint ticket and launch the payment gateway.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="lead-req-modal-footer">
              {leadReqStep === 1 && (
                <>
                  <button
                    type="button"
                    className="lead-req-btn-secondary"
                    onClick={() => setIsLeadReqModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-lead-step1-continue"
                    type="button"
                    className="lead-req-btn-primary"
                    onClick={handleProceedLeadToPricing}
                    disabled={calculatingLeadPrice}
                  >
                    {calculatingLeadPrice ? 'Calculating Price...' : 'Continue →'}
                  </button>
                </>
              )}

              {leadReqStep === 2 && (
                <>
                  <button
                    type="button"
                    className="lead-req-btn-secondary"
                    onClick={() => setLeadReqStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    id="btn-lead-step2-confirm"
                    type="button"
                    className="lead-req-btn-primary"
                    onClick={handleConfirmLeadRequestAndPay}
                    disabled={isSubmittingRequest}
                    style={{ background: '#00D9FF', color: '#06111A', fontWeight: '800' }}
                  >
                    {isSubmittingRequest ? 'Creating Sprint Ticket...' : 'Proceed to Payment →'}
                  </button>
                </>
              )}
            </div>
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

      {/* 7. POSTER LIGHTBOX MODAL */}
      {lightboxPoster && (
        <div className="portal-modal-overlay" onClick={() => setLightboxPoster(null)}>
          <div className="portal-modal-card" style={{ maxWidth: '800px', padding: '1rem', background: 'rgba(6, 17, 26, 0.98)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--portal-border)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#F8FAFC', fontWeight: '700' }}>
                  {lightboxPoster.name || 'Company Branded Poster'}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lightboxPoster.size || 'Image Deliverable'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={getAuthenticatedAssetUrl(lightboxPoster, 'download')}
                  download
                  className="portal-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Download Image"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
                  onClick={() => setLightboxPoster(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'center', maxHeight: '75vh', overflow: 'auto' }}>
              <img
                src={getAuthenticatedAssetUrl(lightboxPoster, 'stream')}
                alt="Full Branded Poster"
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. HELP & SUPPORT CONCIERGE MODAL */}
      {isHelpModalOpen && (
        <div className="portal-modal-overlay" onClick={() => setIsHelpModalOpen(false)}>
          <div
            className="portal-modal-card"
            style={{ maxWidth: '600px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00D9FF'
                }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                    Dedicated Client Concierge
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                    CreativeGini Enterprise Support & Guidance
                  </div>
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                onClick={() => setIsHelpModalOpen(false)}
                aria-label="Close Help Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ color: 'var(--portal-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Have questions regarding your deliverables, ticket timelines, custom sprint scoping, or revision requests? Your dedicated concierge team is available to assist you.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#06111A', border: '1px solid var(--portal-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00D9FF', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Mail size={16} /> Direct Email Concierge
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F5F5F5', marginTop: '6px' }}>
                    concierge@creativegini.com
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                    Monitored directly by Senior Engagement Leads
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#06111A', border: '1px solid var(--portal-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Clock size={16} /> Guaranteed SLA
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F5F5F5', marginTop: '6px' }}>
                    &lt; 2 Hours Response Time
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                    Standard response for active subscription tiers
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(0, 217, 255, 0.04)', border: '1px solid rgba(0, 217, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#00D9FF" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.4' }}>
                  All conversations and uploaded client brand assets are protected under the CreativeGini Mutual Confidentiality & NDA framework.
                </div>
              </div>
            </div>

            <div className="portal-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <a
                href="mailto:concierge@creativegini.com?subject=CreativeGini Concierge Inquiry"
                className="portal-btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsHelpModalOpen(false)}
              >
                <Mail size={15} /> Compose Email
              </a>
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => setIsHelpModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
