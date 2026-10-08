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
  Palette,
  Eye,
  Layers,
  Users,
  ExternalLink
} from 'lucide-react';
import { DESIGN_SERVICES } from '../data/designServiceData';

export default function DesignSidebar({
  currentPath = '/design/dashboard',
  onNavigate,
  user,
  onLogout,
  metrics = {},
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [requestsExpanded, setRequestsExpanded] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const da = user?.dashboardAccess || {};
  const hasLeadAccess = isAdmin || da.companyLead === true;
  const hasBoostAccess = isAdmin || da.companyBoost === true;

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
    color: active ? '#0284C7' : '#4B5563',
    backgroundColor: active ? '#F0F9FF' : 'transparent',
    border: active ? '1px solid #BAE6FD' : '1px solid transparent',
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
              background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Palette size={20} />
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                UI / DESIGN
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '2px',
                }}
              >
                Service Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Navigation List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Dashboard */}
        <div
          onClick={() => onNavigate('/design/dashboard')}
          style={itemStyle(isExactActive('/design/dashboard') || isExactActive('/design'))}
          title={isCollapsed ? 'Dashboard' : undefined}
        >
          <LayoutDashboard size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Dashboard</span>}
        </div>

        {/* Requests (Single Page - All lifecycle stages are inside the requests page) */}
        <div
          onClick={() => onNavigate('/design/requests')}
          style={{
            ...itemStyle(isActive('/design/requests')),
            marginTop: '4px',
            justifyContent: 'space-between',
          }}
          title={isCollapsed ? 'Requests' : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox size={18} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Requests</span>}
          </div>
          {!isCollapsed && (metrics.newRequests > 0 || metrics.total > 0) && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: metrics.newRequests > 0 ? '#EFF6FF' : '#F1F5F9',
                color: metrics.newRequests > 0 ? '#2563EB' : '#475569',
                padding: '1px 6px',
                borderRadius: '999px',
                border: metrics.newRequests > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              }}
            >
              {metrics.newRequests > 0 ? metrics.newRequests : metrics.total}
            </span>
          )}
        </div>

        {/* Section Divider */}
        {!isCollapsed && (
          <div
            style={{
              padding: '12px 12px 6px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#9CA3AF',
              letterSpacing: '0.06em',
            }}
          >
            Design Disciplines
          </div>
        )}

        {/* UI/UX Audits */}
        <div
          onClick={() => onNavigate('/design/audits')}
          style={itemStyle(isActive('/design/audits'))}
          title={isCollapsed ? 'UI/UX Audits' : undefined}
        >
          <Search size={18} style={{ color: '#0284C7', flexShrink: 0 }} />
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>UI/UX Audits</span>
              {metrics.serviceStats?.['ui-ux-audit'] > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {metrics.serviceStats['ui-ux-audit']}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Figma Projects */}
        <div
          onClick={() => onNavigate('/design/figma')}
          style={itemStyle(isActive('/design/figma'))}
          title={isCollapsed ? 'Figma Projects' : undefined}
        >
          <PenTool size={18} style={{ color: '#8B5CF6', flexShrink: 0 }} />
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Figma Projects</span>
              {metrics.serviceStats?.['figma-project'] > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {metrics.serviceStats['figma-project']}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Redesign Requests */}
        <div
          onClick={() => onNavigate('/design/redesigns')}
          style={itemStyle(isActive('/design/redesigns'))}
          title={isCollapsed ? 'Redesign Requests' : undefined}
        >
          <Sparkles size={18} style={{ color: '#EC4899', flexShrink: 0 }} />
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Redesign Requests</span>
              {metrics.serviceStats?.['redesign-request'] > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {metrics.serviceStats['redesign-request']}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div
          onClick={() => onNavigate('/design/deliverables')}
          style={itemStyle(isActive('/design/deliverables'))}
          title={isCollapsed ? 'Deliverables' : undefined}
        >
          <Package size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Deliverables</span>}
        </div>

        {/* Messages */}
        <div
          onClick={() => onNavigate('/design/messages')}
          style={itemStyle(isActive('/design/messages'))}
          title={isCollapsed ? 'Messages' : undefined}
        >
          <MessageSquare size={18} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Messages</span>}
        </div>

        {/* Cross-Service Portals for Admin / Multidisciplinary Specialists */}
        {(hasLeadAccess || hasBoostAccess || isAdmin) && !isCollapsed && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
            <div
              style={{
                padding: '4px 12px 8px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#9CA3AF',
                letterSpacing: '0.06em',
              }}
            >
              Other Portals
            </div>
            {hasLeadAccess && (
              <div
                onClick={() => onNavigate('/lead')}
                style={itemStyle(false)}
                title="Company Lead Portal"
              >
                <Compass size={16} style={{ color: '#059669' }} />
                <span>Lead Portal</span>
              </div>
            )}
            {hasBoostAccess && (
              <div
                onClick={() => onNavigate('/boost')}
                style={itemStyle(false)}
                title="Company Boost Portal"
              >
                <Sparkles size={16} style={{ color: '#7C3AED' }} />
                <span>Boost Portal</span>
              </div>
            )}
            {isAdmin && (
              <div
                onClick={() => onNavigate('/admin')}
                style={itemStyle(false)}
                title="Admin Control Center"
              >
                <ShieldCheck size={16} style={{ color: '#DC2626' }} />
                <span>Admin Center</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer / User Details & Logout */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'UI Specialist'}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#6B7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'ui@creativegini.com'}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
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
