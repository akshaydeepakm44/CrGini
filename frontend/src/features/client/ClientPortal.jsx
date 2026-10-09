import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import ClientLayout from '../../layouts/ClientLayout';
import ClientDashboardPage from './pages/ClientDashboardPage';
import BoostingChannelPage from './pages/BoostingChannelPage';
import DigitalisingChannelPage from './pages/DigitalisingChannelPage';
import DesignChannelPage from './pages/DesignChannelPage';
import DevelopmentChannelPage from './pages/DevelopmentChannelPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import MyRequestsPage from './pages/MyRequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DeliverablesPage from './pages/DeliverablesPage';
import MessagesPage from './pages/MessagesPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import CustomPage from './pages/CustomPage';
import OfferBundlePage from './pages/OfferBundlePage';
import CustomBundlePage from './pages/CustomBundlePage';
import NewRequestModal from './components/NewRequestModal';

import { api } from '../../services/api';
import { adaptRequest, computeDashboardMetrics, adaptDeliverables } from './utils/clientAdapters';

/**
 * Service Slug Router Helper
 */
function ServiceDetailWrapper({ onOpenNewRequest, channel }) {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();

  if (serviceSlug === 'custom') {
    return (
      <CustomPage
        onRequestService={(serviceId, customData) => onOpenNewRequest(serviceId || 'custom', customData)}
        onNavigate={navigate}
      />
    );
  }

  return (
    <ServiceDetailPage
      slug={serviceSlug}
      onBackToChannel={() => navigate(`/portal/${channel}`)}
      onRequestService={(serviceId) => onOpenNewRequest(serviceId)}
    />
  );
}

/**
 * Request Detail Router Helper
 */
function RequestDetailWrapper({ requests, onBack, onReload }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const ticket = requests.find(
    (r) => String(r.ticketId).toLowerCase() === String(ticketId).toLowerCase() || String(r.id) === String(ticketId)
  ) || requests[0];

  return (
    <RequestDetailPage
      ticket={ticket}
      onBack={onBack || (() => navigate('/portal/requests'))}
      onStatusUpdated={onReload}
    />
  );
}

export default function ClientPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [company, setCompany] = useState(user?.company || null);
  const [rawRequests, setRawRequests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [metrics, setMetrics] = useState(() => computeDashboardMetrics([]));
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // New Request Modal state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestInitialService, setNewRequestInitialService] = useState(null);
  const [newRequestCustomData, setNewRequestCustomData] = useState(null);

  // Data fetching
  const loadPortalData = async () => {
    try {
      setIsRefreshing(true);
      const [companyRes, reqsRes, notifsRes] = await Promise.allSettled([
        api.getMyCompany(),
        api.getRequests(),
        api.getNotifications()
      ]);

      if (companyRes.status === 'fulfilled' && companyRes.value) {
        setCompany(companyRes.value);
      }

      let adaptedList = [];
      if (reqsRes.status === 'fulfilled' && Array.isArray(reqsRes.value)) {
        setRawRequests(reqsRes.value);
        adaptedList = reqsRes.value.map(adaptRequest);
        setRequests(adaptedList);
        const adaptedDeliverables = adaptDeliverables(adaptedList);
        setDeliverables(adaptedDeliverables);
        setMetrics(computeDashboardMetrics(adaptedList, adaptedDeliverables));
      } else {
        setRequests([]);
        setMetrics(computeDashboardMetrics([]));
        setDeliverables([]);
      }

      if (notifsRes.status === 'fulfilled' && notifsRes.value) {
        const notifData = notifsRes.value;
        const list = Array.isArray(notifData) ? notifData : notifData.notifications || [];
        setNotifications(list);
        setUnreadNotifications(notifData.unreadCount ?? list.filter(n => !n.isRead && !n.is_read).length);
      }
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Portal initialization error:', err);
      setRequests([]);
      setDeliverables([]);
      setMetrics(computeDashboardMetrics([]));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    const interval = setInterval(() => {
      loadPortalData();
    }, 10000);

    const onFocus = () => loadPortalData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleOpenNewRequest = (serviceId = null, customData = null) => {
    setNewRequestInitialService(serviceId || 'custom');
    setNewRequestCustomData(customData);
    setIsNewRequestOpen(true);
  };

  const handleRequestCreated = async (newRawTicket) => {
    await loadPortalData();
    navigate('/portal/requests');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Messages where specialist posted the latest update
  const unreadMessagesCount = requests.filter(
    (r) => r.latestMessage && r.latestMessage.senderRole !== 'USER' && r.latestMessage.sender_role !== 'USER'
  ).length;

  return (
    <ClientLayout
      currentPath={location.pathname}
      onNavigate={handleNavigate}
      user={{
        name: user?.name || company?.name || 'Client Partner',
        email: user?.email || 'client@company.com',
        companyName: company?.name || user?.companyName || 'Enterprise Partner',
        role: user?.role || 'CLIENT',
      }}
      unreadNotifications={unreadNotifications}
      unreadMessagesCount={unreadMessagesCount}
      notifications={notifications}
      onLogout={onLogout}
      onOpenProfile={() => navigate('/portal/profile')}
      onExploreServices={() => navigate('/portal/boosting')}
    >
      <Routes>
        {/* 1. Dashboard Root */}
        <Route
          index
          element={
            <ClientDashboardPage
              user={user}
              company={company}
              metrics={metrics}
              requests={requests}
              deliverables={deliverables}
              onNavigate={handleNavigate}
              onOpenNewRequest={() => handleOpenNewRequest(null)}
              onViewRequest={(req) => navigate(`/portal/requests/${req.ticketId || req.id}`)}
              onViewDeliverable={(del) => navigate('/portal/deliverables')}
              onRefresh={loadPortalData}
              isRefreshing={isRefreshing}
              lastSyncedAt={lastSyncedAt}
            />
          }
        />
        <Route
          path="dashboard"
          element={
            <ClientDashboardPage
              user={user}
              company={company}
              metrics={metrics}
              requests={requests}
              deliverables={deliverables}
              onNavigate={handleNavigate}
              onOpenNewRequest={() => handleOpenNewRequest(null)}
              onViewRequest={(req) => navigate(`/portal/requests/${req.ticketId || req.id}`)}
              onViewDeliverable={(del) => navigate('/portal/deliverables')}
              onRefresh={loadPortalData}
              isRefreshing={isRefreshing}
              lastSyncedAt={lastSyncedAt}
            />
          }
        />

        {/* 2. Boosting Channel & Services */}
        <Route
          path="boosting"
          element={
            <BoostingChannelPage
              onSelectService={(slug) => navigate(`/portal/boosting/${slug}`)}
              onRequestService={(serviceId, customData) => handleOpenNewRequest(serviceId, customData)}
            />
          }
        />
        <Route
          path="boosting/:serviceSlug"
          element={
            <ServiceDetailWrapper
              onOpenNewRequest={handleOpenNewRequest}
              channel="boosting"
            />
          }
        />

        {/* 3. Digitalising Channel & Services */}
        <Route
          path="digitalising"
          element={
            <DigitalisingChannelPage
              onSelectService={(slug) => navigate(`/portal/digitalising/${slug}`)}
              onRequestService={(serviceId, customData) => handleOpenNewRequest(serviceId, customData)}
            />
          }
        />
        <Route
          path="digitalising/custom"
          element={
            <CustomPage
              onRequestService={(serviceId, customData) => handleOpenNewRequest(serviceId || 'custom', customData)}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="custom"
          element={<Navigate to="/portal/digitalising/custom" replace />}
        />
        <Route
          path="digitalising/:serviceSlug"
          element={
            <ServiceDetailWrapper
              onOpenNewRequest={handleOpenNewRequest}
              channel="digitalising"
            />
          }
        />

        {/* 3b. UI / Design Channel & Services */}
        <Route
          path="design"
          element={
            <DesignChannelPage
              onSelectService={(slug) => navigate(`/portal/design/${slug}`)}
              onRequestService={(serviceId, customData) => handleOpenNewRequest(serviceId, customData)}
            />
          }
        />
        <Route
          path="design/:serviceSlug"
          element={
            <ServiceDetailWrapper
              onOpenNewRequest={handleOpenNewRequest}
              channel="design"
            />
          }
        />

        {/* 3c. App Development Channel & Services */}
        <Route
          path="development"
          element={
            <DevelopmentChannelPage
              onSelectService={(slug) => navigate(`/portal/development/${slug}`)}
              onRequestService={(serviceId, customData) => handleOpenNewRequest(serviceId, customData)}
            />
          }
        />
        <Route
          path="development/:serviceSlug"
          element={
            <ServiceDetailWrapper
              onOpenNewRequest={handleOpenNewRequest}
              channel="development"
            />
          }
        />

        {/* 3d. Bundles Channel & Sub Pages */}
        <Route
          path="bundles"
          element={<Navigate to="/portal/bundles/offer" replace />}
        />
        <Route
          path="bundles/offer"
          element={
            <OfferBundlePage
              onRequestBundle={handleOpenNewRequest}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="bundles/custom"
          element={
            <CustomBundlePage
              onRequestCustomBundle={handleOpenNewRequest}
              onNavigate={handleNavigate}
            />
          }
        />

        {/* 4. My Requests */}
        <Route
          path="requests"
          element={
            <MyRequestsPage
              requests={requests}
              onViewRequest={(req) => navigate(`/portal/requests/${req.ticketId || req.id}`)}
              onOpenNewRequest={() => handleOpenNewRequest(null)}
            />
          }
        />
        <Route
          path="requests/:ticketId"
          element={
            <RequestDetailWrapper
              requests={requests}
              onBack={() => navigate('/portal/requests')}
              onReload={loadPortalData}
            />
          }
        />

        {/* 5. Deliverables */}
        <Route
          path="deliverables"
          element={
            <DeliverablesPage
              deliverables={deliverables}
              onViewRequest={(req) => navigate(`/portal/requests/${req.ticketId || req.id}`)}
              onReload={loadPortalData}
            />
          }
        />

        {/* 6. Messages */}
        <Route
          path="messages"
          element={
            <MessagesPage
              requests={requests}
            />
          }
        />

        {/* 7. Billing */}
        <Route
          path="billing"
          element={
            <BillingPage
              requests={requests}
              onReload={loadPortalData}
            />
          }
        />

        {/* 8. Profile */}
        <Route
          path="profile"
          element={
            <ProfilePage
              user={user}
              company={company}
              onLogout={onLogout}
            />
          }
        />

        {/* Catch-all redirect to /portal */}
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        initialServiceId={newRequestInitialService}
        initialCustomData={newRequestCustomData}
        onSuccess={handleRequestCreated}
      />
    </ClientLayout>
  );
}
