import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import DesignSidebar from './components/DesignSidebar';
import DesignHeader from './components/DesignHeader';

// Pages
import DesignDashboardPage from './pages/DesignDashboardPage';
import DesignRequestsPage from './pages/DesignRequestsPage';
import DesignRequestDetailPage from './pages/DesignRequestDetailPage';
import UIUXAuditsPage from './pages/UIUXAuditsPage';
import FigmaProjectsPage from './pages/FigmaProjectsPage';
import RedesignRequestsPage from './pages/RedesignRequestsPage';
import DesignDeliverablesPage from './pages/DesignDeliverablesPage';
import DesignMessagesPage from './pages/DesignMessagesPage';

import { api } from '../../services/api';
import { adaptDesignRequest, computeDesignMetrics } from './data/designAdapters';

export default function DesignPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    totalActive: 0,
    newRequests: 0,
    assignedToMe: 0,
    inProgress: 0,
    clientReview: 0,
    changesRequested: 0,
    completed: 0,
    serviceStats: {
      'ui-ux-audit': 0,
      'figma-project': 0,
      'redesign-request': 0,
    },
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('cg_design_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('cg_design_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [reqsRes, notifsRes] = await Promise.allSettled([
        api.getRequests(),
        api.getNotifications ? api.getNotifications() : Promise.resolve([]),
      ]);

      if (reqsRes.status === 'fulfilled') {
        const rawList = Array.isArray(reqsRes.value)
          ? reqsRes.value
          : reqsRes.value?.requests || [];

        // Enforce LANDING_PAGE / UI/UX Design requests
        const designList = rawList.filter((r) => {
          if (!r) return false;
          if (
            r.serviceType === 'LANDING_PAGE' ||
            r.service_type === 'LANDING_PAGE' ||
            r.serviceType === 'COMPANY_UI' ||
            r.service_type === 'COMPANY_UI' ||
            r.serviceType === 'LANDING_PAGE_ENHANCEMENT' ||
            r.service_type === 'LANDING_PAGE_ENHANCEMENT'
          ) {
            return true;
          }
          // Also match subServices if any
          let sub = (r.subService || r.sub_service || '').toUpperCase();
          if (!sub && r.notes) {
            try {
              const parsed = typeof r.notes === 'string' ? JSON.parse(r.notes) : r.notes;
              if (parsed?.subService) sub = String(parsed.subService).toUpperCase();
            } catch {}
          }
          if (['UI_UX_AUDIT', 'FIGMA_PROJECT', 'REDESIGN', 'REDESIGN_REQUEST', 'LANDING_PAGE'].includes(sub)) {
            return true;
          }
          // If user is specifically LANDING_PAGE role, include all returned (the backend already scopes by role)
          if (user?.role === 'LANDING_PAGE') {
            return true;
          }
          return false;
        });

        const adapted = designList.map(adaptDesignRequest);
        setRequests(adapted);
        setMetrics(computeDesignMetrics(adapted, user?.id));
        setLastSyncedAt(new Date());
      }

      if (notifsRes.status === 'fulfilled' && notifsRes.value) {
        const list = Array.isArray(notifsRes.value)
          ? notifsRes.value
          : notifsRes.value.notifications || [];
        setNotifications(list);
        setUnreadNotifCount(
          notifsRes.value.unreadCount ??
            list.filter((n) => !n.isRead && !n.is_read).length
        );
      }
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Failed to load UI/Design portal operational data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // 5-minute auto-refresh interval

    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      if (api.markNotificationRead) {
        await api.markNotificationRead(notifId);
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId || n._id === notifId
            ? { ...n, isRead: true, is_read: true }
            : n
        )
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (api.markAllNotificationsRead) {
        await api.markAllNotificationsRead();
      }
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, is_read: true }))
      );
      setUnreadNotifCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter requests when user types in global search in header
  const visibleRequests = searchQuery.trim()
    ? requests.filter((r) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          r.ticketId?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.clientCompany?.toLowerCase().includes(q) ||
          r.clientName?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
        );
      })
    : requests;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* 1. Portal Sidebar */}
      <DesignSidebar
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={onLogout}
        metrics={metrics}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Global Header - Fixed at Top */}
        <DesignHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllRead}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          user={user}
        />

        {/* Routed Pages - Scrollable Viewport */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            position: 'relative',
          }}
        >
          <Routes>
            {/* Index -> Dashboard */}
            <Route index element={<Navigate to="/design/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DesignDashboardPage
                  requests={visibleRequests}
                  metrics={metrics}
                  user={user}
                  onNavigate={handleNavigate}
                  onSelectRequest={(r) => navigate(`/design/requests/${r.ticketId || r.id}`)}
                  onRefresh={loadData}
                  isRefreshing={isRefreshing}
                  lastSyncedAt={lastSyncedAt}
                />
              }
            />

            {/* Specific Requests lifecycle sub-routes */}
            <Route
              path="requests/new"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/assigned"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/in-progress"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/client-review"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/changes-requested"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/completed"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />

            {/* Ticket Detail */}
            <Route
              path="requests/:ticketId"
              element={
                <DesignRequestDetailPage
                  user={user}
                  onNavigate={handleNavigate}
                />
              }
            />

            {/* All Requests */}
            <Route
              path="requests"
              element={
                <DesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />

            {/* Specialized Design Disciplines */}
            <Route
              path="audits"
              element={
                <UIUXAuditsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="figma"
              element={
                <FigmaProjectsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="redesigns"
              element={
                <RedesignRequestsPage
                  requests={visibleRequests}
                  metrics={metrics}
                  onRefresh={loadData}
                />
              }
            />

            {/* Deliverables & Messages */}
            <Route
              path="deliverables"
              element={
                <DesignDeliverablesPage
                  requests={visibleRequests}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="messages"
              element={
                <DesignMessagesPage
                  requests={visibleRequests}
                  user={user}
                />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/design/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
