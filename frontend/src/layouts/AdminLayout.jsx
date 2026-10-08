import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Package,
  CreditCard,
  BarChart3,
  Activity,
  Settings,
} from 'lucide-react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import '../styles/light-theme.css';

/**
 * Reusable AdminLayout Component
 * Master application shell for the Executive Platform Administration
 */
export default function AdminLayout({
  children,
  currentPath = '/admin/dashboard',
  onNavigate,
  user = { name: 'Platform Admin', email: 'admin@creativegini.com', role: 'ADMIN' },
  unreadNotifications = 2,
  notifications = [],
  onLogout,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Lock outer window scrolling so the header and sidebar remain strictly fixed
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHeight = document.body.style.height;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.height = prevHeight;
    };
  }, []);

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    {
      id: 'clients',
      label: 'Clients',
      path: '/admin/clients',
      icon: Users,
      children: [
        { id: 'all-clients', label: 'All Clients', path: '/admin/clients' },
        { id: 'onboarding', label: 'Client Onboarding', path: '/admin/clients/onboarding' },
      ],
    },
    { id: 'requests', label: 'Requests & Tickets', path: '/admin/requests', icon: FileText, badge: 5 },
    { id: 'team', label: 'Team & Specialists', path: '/admin/team', icon: UserCheck },
    { id: 'deliverables', label: 'Deliverables', path: '/admin/deliverables', icon: Package },
    { id: 'payments', label: 'Payments & Revenue', path: '/admin/payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { id: 'activity', label: 'Activity Logs', path: '/admin/activity', icon: Activity },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div
      className="cg-light-theme cg-admin-layout"
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        backgroundColor: 'var(--cg-bg-page)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        navItems={adminNavItems}
        activePath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        roleBadge="Master Admin"
      />

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
        <Header
          user={user}
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          unreadNotifications={unreadNotifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={onLogout}
        />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </main>
      </div>

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}
