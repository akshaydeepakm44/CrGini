import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Rocket,
  Search,
  FileText,
  Package,
  MessageSquare,
  CreditCard,
  User,
  Palette,
} from 'lucide-react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import '../styles/light-theme.css';

/**
 * Reusable ClientLayout Component
 * Master application shell for the Client Portal matching the reference mockup
 */
export default function ClientLayout({
  children,
  currentPath = '/portal/dashboard',
  onNavigate,
  user = { name: 'Data I2I Client', email: 'testclient@datai2i.com', company: { name: 'Data I2I' } },
  unreadNotifications = 0,
  unreadMessagesCount = 0,
  notifications = [],
  onExploreServices,
  onLogout,
  onOpenProfile,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Client Portal Navigation Architecture (Strict Hierarchy)
  const clientNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/portal/dashboard',
      icon: LayoutDashboard,
    },
    {
      sectionTitle: 'SERVICES',
      id: 'boosting',
      label: 'Boosting',
      path: '/portal/boosting',
      icon: Rocket,
      children: [
        { id: 'strategic-planner', label: 'Strategic Planner', path: '/portal/boosting/strategic-planner' },
        { id: 'content-creator', label: 'Content Creator', path: '/portal/boosting/content-creator' },
        { id: 'devrel', label: 'DevRel', path: '/portal/boosting/devrel' },
      ],
    },
    {
      id: 'digitalising',
      label: 'Digitalising',
      path: '/portal/digitalising',
      icon: Search,
      children: [
        { id: 'lead-research', label: 'Lead Research', path: '/portal/digitalising/lead-research' },
        { id: 'company-study', label: 'Company Study', path: '/portal/digitalising/company-study' },
        { id: 'key-people', label: 'Key People Research', path: '/portal/digitalising/key-people' },
        { id: 'pitch-support', label: 'Pitch Support', path: '/portal/digitalising/pitch-support' },
        { id: 'custom', label: 'Custom', path: '/portal/digitalising/custom' },
      ],
    },
    {
      id: 'design',
      label: 'UI / Design',
      path: '/portal/design',
      icon: Palette,
      children: [
        { id: 'ui-ux-audit', label: 'UI/UX Audit', path: '/portal/design/ui-ux-audit' },
        { id: 'figma-project', label: 'Figma Project', path: '/portal/design/figma-project' },
        { id: 'redesign-request', label: 'Redesign Request', path: '/portal/design/redesign-request' },
      ],
    },
    {
      sectionTitle: 'WORK',
      id: 'requests',
      label: 'My Requests',
      path: '/portal/requests',
      icon: FileText,
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      path: '/portal/deliverables',
      icon: Package,
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/portal/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      sectionTitle: 'ACCOUNT',
      id: 'billing',
      label: 'Billing',
      path: '/portal/billing',
      icon: CreditCard,
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/portal/profile',
      icon: User,
    },
  ];

  const handleNavigate = (path) => {
    setIsMobileOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div
      className="cg-light-theme cg-client-layout"
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
      {/* 1. Left Sidebar - Fixed */}
      <Sidebar
        navItems={clientNavItems}
        activePath={currentPath}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        roleBadge="Client Portal"
        onExploreServices={onExploreServices || (() => handleNavigate('/portal/boosting'))}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Content Canvas */}
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
        {/* Global Top Header - Permanently Fixed at Top */}
        <Header
          user={user}
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          unreadNotifications={unreadNotifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={onLogout}
          onOpenProfile={onOpenProfile || (() => handleNavigate('/portal/profile'))}
          onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
        />

        {/* Scrollable Page Body - Only inner main body scrolls */}
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

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => console.log('Mark all read')}
        onNotificationClick={(notif) => {
          setIsNotificationsOpen(false);
          handleNavigate(notif.ticketCode ? `/portal/requests/${notif.ticketCode}` : '/portal/requests');
        }}
      />
    </div>
  );
}
