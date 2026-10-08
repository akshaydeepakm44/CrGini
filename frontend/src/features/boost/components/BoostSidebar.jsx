import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  Search,
  ShieldCheck,
  Compass,
  PenTool,
  Image,
  Video,
  Target,
  Code2,
  Layers,
  Users,
  ExternalLink
} from 'lucide-react';
import { BOOST_SERVICES } from '../data/boostServiceData';

export default function BoostSidebar({
  currentPath = '/boost/dashboard',
  onNavigate,
  user,
  onLogout,
  metrics = {},
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [requestsExpanded, setRequestsExpanded] = useState(true);
  const [servicesExpanded, setServicesExpanded] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const da = user?.dashboardAccess || {};
  const hasLeadAccess = isAdmin || da.companyLead === true;
  const hasUIAccess = isAdmin || da.companyUI === true;

  const isActive = (path) => currentPath === path || currentPath.startsWith(path + '/');
  const isExactActive = (path) => currentPath === path;

  const itemStyle = (active, isSubItem = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: isSubItem ? '7px 12px 7px 32px' : '9px 12px',
    borderRadius: '8px',
    fontSize: isSubItem ? '0.8125rem' : '0.875rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#7C3AED' : '#4B5563',
    backgroundColor: active ? '#F5F3FF' : 'transparent',
    border: active ? '1px solid #DDD6FE' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    userSelect: 'none',
  });

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'width 0.2s ease',
        flexShrink: 0,
      }}
    >
      {/* 1. Portal Brand Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Boost Service
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#7C3AED',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '1px',
                }}
              >
                Specialist Workspace
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation Items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        {/* Section Label: Operations */}
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#9CA3AF',
              letterSpacing: '0.05em',
              padding: '6px 10px 4px',
            }}
          >
            Operations
          </div>
        )}

        {/* Dashboard */}
        <div
          onClick={() => onNavigate('/boost/dashboard')}
          style={itemStyle(isExactActive('/boost') || isExactActive('/boost/dashboard'))}
          title="Dashboard"
        >
          <LayoutDashboard size={18} color={isExactActive('/boost') || isExactActive('/boost/dashboard') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Dashboard</span>}
        </div>

        {/* Requests (Single Level - Subheadings are inside the requests page) */}
        <div
          onClick={() => onNavigate('/boost/requests')}
          style={{
            ...itemStyle(isActive('/boost/requests')),
            justifyContent: 'space-between',
          }}
          title="All Requests"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox size={18} color={isActive('/boost/requests') ? '#7C3AED' : '#6B7280'} />
            {!isCollapsed && <span>Requests</span>}
          </div>
          {!isCollapsed && metrics.newRequests > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '1px 6px',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
              }}
            >
              {metrics.newRequests}
            </span>
          )}
        </div>

        {/* Section Label: Boost Disciplines */}
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#9CA3AF',
              letterSpacing: '0.05em',
              padding: '12px 10px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Boost Services</span>
          </div>
        )}

        {/* 1. Strategic Plans */}
        <div
          onClick={() => onNavigate('/boost/strategic-plans')}
          style={itemStyle(isActive('/boost/strategic-plans'))}
          title="Strategic Plans"
        >
          <Compass size={18} color={isActive('/boost/strategic-plans') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Strategic Plans</span>}
        </div>

        {/* 2. Content Creator */}
        <div
          onClick={() => onNavigate('/boost/content')}
          style={itemStyle(isActive('/boost/content'))}
          title="Content Creator"
        >
          <PenTool size={18} color={isActive('/boost/content') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Content Creator</span>}
        </div>

        {/* 3. Ad Creatives */}
        <div
          onClick={() => onNavigate('/boost/ad-creatives')}
          style={itemStyle(isActive('/boost/ad-creatives'))}
          title="Ad Creatives"
        >
          <Sparkles size={18} color={isActive('/boost/ad-creatives') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Ad Creatives</span>}
        </div>

        {/* 6. GTM Strategy */}
        <div
          onClick={() => onNavigate('/boost/gtm-strategy')}
          style={itemStyle(isActive('/boost/gtm-strategy'))}
          title="GTM Strategy"
        >
          <Target size={18} color={isActive('/boost/gtm-strategy') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>GTM Strategy</span>}
        </div>

        {/* 7. DevRel */}
        <div
          onClick={() => onNavigate('/boost/devrel')}
          style={itemStyle(isActive('/boost/devrel'))}
          title="DevRel"
        >
          <Code2 size={18} color={isActive('/boost/devrel') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>DevRel</span>}
        </div>

        {/* Section Label: Submissions & Messaging */}
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#9CA3AF',
              letterSpacing: '0.05em',
              padding: '12px 10px 4px',
            }}
          >
            Delivery & Comm
          </div>
        )}

        {/* Deliverables */}
        <div
          onClick={() => onNavigate('/boost/deliverables')}
          style={itemStyle(isActive('/boost/deliverables'))}
          title="Deliverables"
        >
          <Package size={18} color={isActive('/boost/deliverables') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Deliverables</span>}
        </div>

        {/* Messages */}
        <div
          onClick={() => onNavigate('/boost/messages')}
          style={itemStyle(isActive('/boost/messages'))}
          title="Messages"
        >
          <MessageSquare size={18} color={isActive('/boost/messages') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Messages</span>}
        </div>

        {/* Cross Dashboard Switchers for Admin & Multi-Team Members */}
        {(isAdmin || hasLeadAccess || hasUIAccess) && !isCollapsed && (
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#9CA3AF',
              letterSpacing: '0.05em',
              padding: '12px 10px 4px',
            }}
          >
            Switch Workspace
          </div>
        )}

        {isAdmin && (
          <div
            onClick={() => onNavigate('/admin')}
            style={itemStyle(false)}
            title="Admin Portal"
          >
            <ShieldCheck size={18} color="#D97706" />
            {!isCollapsed && <span style={{ color: '#B45309' }}>Admin Central</span>}
          </div>
        )}

        {hasLeadAccess && (
          <div
            onClick={() => onNavigate('/lead')}
            style={itemStyle(false)}
            title="Lead Workspace"
          >
            <Users size={18} color="#6B7280" />
            {!isCollapsed && <span>Lead Workspace</span>}
          </div>
        )}

        {hasUIAccess && (
          <div
            onClick={() => onNavigate('/design')}
            style={itemStyle(false)}
            title="UI/Design Workspace"
          >
            <Layers size={18} color="#6B7280" />
            {!isCollapsed && <span>UI & Design</span>}
          </div>
        )}
      </div>

      {/* 3. Bottom Specialist Profile & Logout */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#FAFAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '10px',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#EDE9FE',
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'Boost Specialist'}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.role === 'ADMIN' ? 'Administrator' : 'Company Boost'}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
