import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LeadSidebar from './components/LeadSidebar';
import LeadHeader from './components/LeadHeader';
import LeadDashboardPage from './pages/LeadDashboardPage';
import LeadRequestsPage from './pages/LeadRequestsPage';
import LeadRequestDetailPage from './pages/LeadRequestDetailPage';
import LeadListPage from './pages/LeadListPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import CompanyStudiesPage from './pages/CompanyStudiesPage';
import KeyPeoplePage from './pages/KeyPeoplePage';
import ResearchWorkspacePage from './pages/ResearchWorkspacePage';
import LeadDeliverablesPage from './pages/LeadDeliverablesPage';
import LeadMessagesPage from './pages/LeadMessagesPage';
import LeadShowcasesPage from './pages/LeadShowcasesPage';

import { api } from '../../services/api';
import { adaptLeadRequest, computeLeadMetrics } from './data/leadAdapters';

export default function LeadPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    newRequests: 0,
    assignedToMe: 0,
    inProgress: 0,
    clientReview: 0,
    completed: 0,
    totalActive: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [reqsRes, notifsRes] = await Promise.allSettled([
        api.getRequests(),
        api.getNotifications ? api.getNotifications() : Promise.resolve([]),
      ]);

      if (reqsRes.status === 'fulfilled' && Array.isArray(reqsRes.value)) {
        const adapted = reqsRes.value.map(adaptLeadRequest);
        setRequests(adapted);
        setMetrics(computeLeadMetrics(adapted, user?.id));
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
      console.error('Failed to load lead portal operational data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 10000);

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
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true, is_read: true } : n))
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, is_read: true })));
      setUnreadNotifCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        backgroundColor: '#F8F9FA',
        color: '#111827',
        fontFamily: 'var(--cg-font-body, "Inter", sans-serif)',
      }}
    >
      {/* 1. Left Operational Sidebar */}
      <LeadSidebar
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={onLogout}
        metrics={metrics}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Work Area */}
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
        {/* Top Header - Fixed at Top */}
        <LeadHeader
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

        {/* Dynamic Route Content - Dedicated Scrollable Viewport */}
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
            <Route
              index
              element={
                <LeadDashboardPage
                  requests={requests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                  isRefreshing={isRefreshing}
                  lastSyncedAt={lastSyncedAt}
                />
              }
            />
            <Route
              path="dashboard"
              element={
                <LeadDashboardPage
                  requests={requests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                  isRefreshing={isRefreshing}
                  lastSyncedAt={lastSyncedAt}
                />
              }
            />
            <Route
              path="requests"
              element={
                <LeadRequestsPage
                  requests={requests}
                  onNavigate={handleNavigate}
                  loading={loading}
                />
              }
            />
            <Route
              path="requests/:ticketId"
              element={
                <LeadRequestDetailPage
                  onNavigate={handleNavigate}
                  user={user}
                />
              }
            />
            <Route
              path="leads"
              element={<LeadListPage onNavigate={handleNavigate} />}
            />
            <Route
              path="leads/:leadId"
              element={<LeadDetailsPage onNavigate={handleNavigate} />}
            />
            <Route
              path="studies"
              element={<CompanyStudiesPage onNavigate={handleNavigate} />}
            />
            <Route
              path="key-people"
              element={<KeyPeoplePage onNavigate={handleNavigate} />}
            />
            <Route
              path="research"
              element={<ResearchWorkspacePage onNavigate={handleNavigate} />}
            />
            <Route
              path="research/:ticketId"
              element={<ResearchWorkspacePage onNavigate={handleNavigate} />}
            />
            <Route
              path="deliverables"
              element={<LeadDeliverablesPage onNavigate={handleNavigate} />}
            />
            <Route
              path="messages"
              element={<LeadMessagesPage onNavigate={handleNavigate} />}
            />
            <Route
              path="messages/:ticketId"
              element={<LeadMessagesPage onNavigate={handleNavigate} />}
            />
            <Route
              path="showcases"
              element={<LeadShowcasesPage onNavigate={handleNavigate} />}
            />
            <Route path="*" element={<Navigate to="/lead/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
