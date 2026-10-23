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
  Code2,
  Boxes,
} from 'lucide-react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import { useServiceVisibility } from '../features/client/context/ServiceVisibilityContext';
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

  // DiziGini Client Portal Navigation Architecture (Clean Single-Platform Focus)
  const clientNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/portal/dashboard',
      icon: LayoutDashboard,
    },
    {
      sectionTitle: 'DIGITALISING PLATFORM',
      id: 'digitalising',
      label: 'Digitalising Requests',
      path: '/portal/digitalising',
      icon: Search,
      children: [
        { id: 'lead-research', label: 'Lead Research', path: '/portal/digitalising/lead-research' },
        { id: 'company-study', label: 'Company Study', path: '/portal/digitalising/company-study' },
        { id: 'key-people', label: 'Key People Research', path: '/portal/digitalising/key-people' },
        { id: 'pitch-support', label: 'Pitch Support', path: '/portal/digitalising/pitch-support' },
      ],
    },
    {
      id: 'requests',
      label: 'My Requests',
      path: '/portal/requests',
      icon: FileText,
    },
    {
      sectionTitle: 'COLLABORATION & ASSETS',
      id: 'messages',
      label: 'Messages',
      path: '/portal/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      path: '/portal/deliverables',
      icon: Package,
    },
    {
      sectionTitle: 'FINANCE & BILLING',
      id: 'billing',
      label: 'Billing & Invoices',
      path: '/portal/billing',
      icon: CreditCard,
    },
    {
      sectionTitle: 'ACCOUNT',
      id: 'profile',
      label: 'Profile',
      path: '/portal/profile',
      icon: User,
    },
  ];

  const { isChannelActive, isServiceActive } = useServiceVisibility();

  const filteredNavItems = clientNavItems
    .map((item) => {
      if (['boosting', 'digitalising', 'design', 'development', 'bundles'].includes(item.id)) {
        if (!isChannelActive(item.id)) return null;
        if (item.children) {
          const visibleChildren = item.children.filter((ch) => isServiceActive(ch.id));
          if (visibleChildren.length === 0) return null;
          return { ...item, children: visibleChildren };
        }
      }
      return item;
    })
    .filter(Boolean);

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
        navItems={filteredNavItems}
        activePath={currentPath}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        roleBadge="DiziGini Client"
        onExploreServices={onExploreServices || (() => handleNavigate('/portal/digitalising'))}
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
