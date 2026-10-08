import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import BoostSidebar from './components/BoostSidebar';
import BoostHeader from './components/BoostHeader';

// Pages
import BoostDashboardPage from './pages/BoostDashboardPage';
import BoostRequestsPage from './pages/BoostRequestsPage';
import BoostRequestDetailPage from './pages/BoostRequestDetailPage';
import StrategicPlansPage from './pages/StrategicPlansPage';
import ContentPage from './pages/ContentPage';
import AdCreativesPage from './pages/AdCreativesPage';
import GTMStrategyPage from './pages/GTMStrategyPage';
import DevRelPage from './pages/DevRelPage';
import BoostDeliverablesPage from './pages/BoostDeliverablesPage';
import BoostMessagesPage from './pages/BoostMessagesPage';

import { api } from '../../services/api';
import { adaptBoostRequest, computeBoostMetrics } from './data/boostAdapters';

export default function BoostPortal({ user, onLogout }) {
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
    serviceStats: {}
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

      if (reqsRes.status === 'fulfilled') {
        const rawList = Array.isArray(reqsRes.value) ? reqsRes.value : (reqsRes.value?.requests || []);
        // Enforce COMPANY_BOOST tickets, or tickets belonging to the 7 Boost disciplines
        const boostList = rawList.filter((r) => {
          if (!r) return false;
          if (r.serviceType === 'COMPANY_BOOST' || r.service_type === 'COMPANY_BOOST') return true;
          // Subservices mapping
          let sub = (r.subService || r.sub_service || '').toUpperCase();
          if (!sub && r.notes) {
            try {
              const parsed = typeof r.notes === 'string' ? JSON.parse(r.notes) : r.notes;
              if (parsed?.subService) sub = String(parsed.subService).toUpperCase();
            } catch {}
          }
          if (['STRATEGIC_PLAN', 'CONTENT', 'POSTER', 'CREATIVE', 'VIDEO', 'AD_CREATIVE', 'GTM_STRATEGY', 'DEVREL', 'DEVREL_PLAN', 'DEVELOPER_RELATIONS'].includes(sub)) {
            return true;
          }
          return false;
        });

        const adapted = boostList.map(adaptBoostRequest);
        setRequests(adapted);
        setMetrics(computeBoostMetrics(adapted, user?.id));
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
      console.error('Failed to load boost portal operational data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        prev.map((n) => (n.id === notifId || n._id === notifId ? { ...n, isRead: true, is_read: true } : n))
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
      <BoostSidebar
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
        <BoostHeader
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

        {/* Dynamic Route Content - Scrollable Viewport */}
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
                <BoostDashboardPage
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
                <BoostDashboardPage
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

            {/* Requests Queue */}
            <Route
              path="requests"
              element={
                <BoostRequestsPage
                  requests={requests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="requests/:ticketId"
              element={
                <BoostRequestsRouteWrapper
                  requests={requests}
                  metrics={metrics}
                  onNavigate={handleNavigate}
                  loading={loading}
                  onRefresh={loadData}
                  user={user}
                />
              }
            />

            {/* The 7 Boost Service Workspaces */}
            <Route
              path="strategic-plans"
              element={<StrategicPlansPage requests={requests} onRefresh={loadData} user={user} />}
            />
            <Route
              path="content"
              element={<ContentPage requests={requests} onRefresh={loadData} user={user} />}
            />
            <Route
              path="posters"
              element={<Navigate to="/boost/requests" replace />}
            />
            <Route
              path="videos"
              element={<Navigate to="/boost/requests" replace />}
            />
            <Route
              path="ad-creatives"
              element={<AdCreativesPage requests={requests} onRefresh={loadData} user={user} />}
            />
            <Route
              path="gtm-strategy"
              element={<GTMStrategyPage requests={requests} onRefresh={loadData} user={user} />}
            />
            <Route
              path="devrel"
              element={<DevRelPage requests={requests} onRefresh={loadData} user={user} />}
            />

            {/* Deliverables & Messages */}
            <Route
              path="deliverables"
              element={<BoostDeliverablesPage requests={requests} onNavigate={handleNavigate} />}
            />
            <Route
              path="messages"
              element={<BoostMessagesPage requests={requests} onNavigate={handleNavigate} user={user} />}
            />
            <Route
              path="messages/:ticketId"
              element={<BoostMessagesPage requests={requests} onNavigate={handleNavigate} user={user} />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/boost/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * Dispatches between a status view (e.g. /boost/requests/new) and ticket detail (e.g. /boost/requests/CG-1018)
 */
function BoostRequestsRouteWrapper({ requests, metrics, onNavigate, loading, onRefresh, user }) {
  const { ticketId, statusParam } = useParams();
  const idOrStatus = ticketId || statusParam;
  const knownStatuses = ['new', 'assigned', 'in-progress', 'client-review', 'changes-requested', 'completed'];

  if (idOrStatus && knownStatuses.includes(idOrStatus.toLowerCase())) {
    return (
      <BoostRequestsPage
        requests={requests}
        metrics={metrics}
        onNavigate={onNavigate}
        loading={loading}
        onRefresh={onRefresh}
      />
    );
  }

  return <BoostRequestDetailPage onNavigate={onNavigate} user={user} ticketIdProp={idOrStatus} />;
}
