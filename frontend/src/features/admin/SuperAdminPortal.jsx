import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import GlobalSearchModal from './components/GlobalSearchModal';

// Pages
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminOperationsPage from './pages/AdminOperationsPage';
import AdminRequestDetailPage from './pages/AdminRequestDetailPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminTeamPage from './pages/AdminTeamPage';
import AdminPermissionsPage from './pages/AdminPermissionsPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminDeliverablesPage from './pages/AdminDeliverablesPage';
import AdminBillingPage from './pages/AdminBillingPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminAuditPage from './pages/AdminAuditPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminSamplesPage from './pages/AdminSamplesPage';

import { adminApi } from './services/adminApi';
import './adminPortal.css';

export default function SuperAdminPortal({ user, onLogout }) {
  const [overviewData, setOverviewData] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Load telemetry for sidebar badges
  const loadSidebarBadges = async () => {
    try {
      const data = await adminApi.getOverview();
      setOverviewData(data);
    } catch (err) {
      console.error('Error fetching admin badges:', err);
    }
  };

  useEffect(() => {
    loadSidebarBadges();
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const kpi = overviewData?.kpi || {};
  const attentionCount = overviewData?.attentionRequired?.length || 0;

  return (
    <div className="cg-admin-portal-root">
      {/* FIXED TOP HEADER */}
      <AdminHeader
        user={user}
        onLogout={onLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        attentionCount={attentionCount}
      />

      <div className="cg-admin-layout-body">
        {/* FIXED LEFT SIDEBAR */}
        <AdminSidebar
          unassignedCount={kpi.unassignedRequests || 0}
          reviewCount={kpi.clientReviewRequests || 0}
          changesCount={kpi.changesRequested || 0}
          pendingPaymentsCount={kpi.pendingPaymentsCount || 0}
        />

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="cg-admin-content-area">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverviewPage />} />
            <Route path="requests" element={<AdminOperationsPage />} />
            <Route path="operations" element={<AdminOperationsPage />} />
            <Route path="requests/:id" element={<AdminRequestDetailPage />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="clients/onboarding" element={<AdminClientsPage />} />
            <Route path="clients/:id" element={<AdminClientsPage />} />
            <Route path="companies" element={<AdminClientsPage />} />
            <Route path="team" element={<AdminTeamPage />} />
            <Route path="team/roles" element={<AdminTeamPage />} />
            <Route path="team/permissions" element={<AdminPermissionsPage />} />
            <Route path="team/:id" element={<AdminTeamPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="deliverables" element={<AdminDeliverablesPage />} />
            <Route path="billing" element={<AdminBillingPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
            <Route path="audit/activity" element={<AdminAuditPage />} />
            <Route path="audit/security" element={<AdminAuditPage />} />
            <Route path="samples" element={<AdminSamplesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
