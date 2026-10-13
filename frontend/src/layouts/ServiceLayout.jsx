import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  UserCheck,
  PlayCircle,
  Eye,
  CheckCircle2,
  Package,
  MessageSquare,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import '../styles/light-theme.css';

/**
 * Reusable ServiceLayout Component
 * Master application shell for the Internal Human Specialist fulfillment queues:
 * - Lead Service Portal
 * - Boost Service Portal
 * - UI / Design Service Portal
 */
export default function ServiceLayout({
  children,
  domain = 'lead', // 'lead' | 'boost' | 'ui'
  currentPath = '/internal/lead/dashboard',
  onNavigate,
  user = { name: 'Lead Specialist', email: 'lead@creativegini.com', role: 'COMPANY_LEAD' },
  unreadNotifications = 1,
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

  const domainConfig = {
    lead: {
      roleBadge: 'Lead Specialist Queue',
      domainNav: [
        { id: 'dashboard', label: 'Dashboard', path: '/internal/lead/dashboard', icon: LayoutDashboard },
        { id: 'new-requests', label: 'New Requests', path: '/internal/lead/requests?status=NEW', icon: Inbox, badge: 3 },
        { id: 'in-progress', label: 'In Progress', path: '/internal/lead/requests?status=IN_PROGRESS', icon: PlayCircle },
        { id: 'client-review', label: 'Client Review', path: '/internal/lead/requests?status=REVIEW', icon: Eye },
        { id: 'completed', label: 'Completed', path: '/internal/lead/requests?status=COMPLETED', icon: CheckCircle2 },
        { id: 'company-leads', label: 'Company Leads', path: '/internal/lead/leads', icon: Users },
        { id: 'deliverables', label: 'Deliverables', path: '/internal/lead/deliverables', icon: Package },
        { id: 'messages', label: 'Messages', path: '/internal/lead/messages', icon: MessageSquare },
      ],
    },
    boost: {
      roleBadge: 'Boost Specialist Queue',
      domainNav: [
        { id: 'dashboard', label: 'Dashboard', path: '/internal/boost/dashboard', icon: LayoutDashboard },
        { id: 'requests', label: 'Requests Queue', path: '/internal/boost/requests', icon: Inbox, badge: 2 },
        { id: 'strategic-plans', label: 'Strategic Plans', path: '/internal/boost/strategic-plans', icon: Sparkles },
        { id: 'creatives', label: 'Posters & Videos', path: '/internal/boost/creatives', icon: Layers },
        { id: 'deliverables', label: 'Deliverables', path: '/internal/boost/deliverables', icon: Package },
        { id: 'messages', label: 'Messages', path: '/internal/boost/messages', icon: MessageSquare },
      ],
    },
    ui: {
      roleBadge: 'UI / Design Queue',
      domainNav: [
        { id: 'dashboard', label: 'Dashboard', path: '/internal/ui/dashboard', icon: LayoutDashboard },
        { id: 'requests', label: 'Design Requests', path: '/internal/ui/requests', icon: Inbox, badge: 1 },
        { id: 'audits', label: 'UI/UX Audits', path: '/internal/ui/audits', icon: Eye },
        { id: 'figma', label: 'Figma Projects', path: '/internal/ui/figma', icon: Layers },
        { id: 'deliverables', label: 'Deliverables', path: '/internal/ui/deliverables', icon: Package },
        { id: 'messages', label: 'Messages', path: '/internal/ui/messages', icon: MessageSquare },
      ],
    },
  };

  const currentDomain = domainConfig[domain.toLowerCase()] || domainConfig.lead;

  return (
    <div
      className="cg-light-theme cg-service-layout"
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
        navItems={currentDomain.domainNav}
        activePath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        roleBadge={currentDomain.roleBadge}
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
