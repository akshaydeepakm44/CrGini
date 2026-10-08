import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  FileText,
  Briefcase,
  Layers,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  Search,
  CheckSquare,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function LeadSidebar({
  currentPath = '/lead/dashboard',
  onNavigate,
  user,
  onLogout,
  metrics = {},
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [requestsExpanded, setRequestsExpanded] = useState(true);
  const [researchExpanded, setResearchExpanded] = useState(true);

  const isActive = (path) => currentPath === path || currentPath.startsWith(path + '/');
  const isExactActive = (path) => currentPath === path;

  const itemStyle = (active, isSubItem = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: isSubItem ? '8px 12px 8px 36px' : '9px 14px',
    borderRadius: '10px',
    fontSize: isSubItem ? '0.8125rem' : '0.875rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#7C3AED' : '#4B5563',
    backgroundColor: active ? '#F5F3FF' : 'transparent',
    border: active ? '1px solid #DDD4FA' : '1px solid transparent',
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
          padding: '18px 20px',
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
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              flexShrink: 0,
            }}
          >
            <Compass size={20} />
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
                Lead Workspace
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
                Operations Portal
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
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Dashboard */}
        <div
          onClick={() => onNavigate('/lead/dashboard')}
          style={itemStyle(isExactActive('/lead') || isExactActive('/lead/dashboard'))}
          title="Dashboard"
        >
          <LayoutDashboard size={18} color={isExactActive('/lead') || isExactActive('/lead/dashboard') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Dashboard</span>}
        </div>

        {/* Requests (Single Page - No dropdown sub-channels) */}
        <div
          onClick={() => onNavigate('/lead/requests')}
          style={{
            ...itemStyle(isActive('/lead/requests')),
            marginTop: '4px',
            justifyContent: 'space-between',
          }}
          title="Requests"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox size={18} color={isActive('/lead/requests') ? '#7C3AED' : '#6B7280'} />
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

        {/* Research Workspace (Active workbench with all tickets) */}
        <div
          onClick={() => onNavigate('/lead/research')}
          style={{ ...itemStyle(isActive('/lead/research')), marginTop: '4px' }}
          title="Research Workspace"
        >
          <Briefcase size={18} color={isActive('/lead/research') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Research Workspace</span>}
        </div>

        {/* Prospect Showcases (Cold Outreach / No Ticket Showcases) */}
        <div
          onClick={() => onNavigate('/lead/showcases')}
          style={{ ...itemStyle(isActive('/lead/showcases')), marginTop: '4px' }}
          title="Prospect Showcases"
        >
          <Sparkles size={18} color={isActive('/lead/showcases') ? '#7C3AED' : '#6B7280'} />
          {!isCollapsed && <span style={{ flex: 1 }}>Prospect Showcases</span>}
        </div>

        {/* Messages (Client conversations) */}
        <div
          onClick={() => onNavigate('/lead/messages')}
          style={{ ...itemStyle(isActive('/lead/messages')), marginTop: '4px' }}
          title={isCollapsed ? `Messages ${metrics?.clientInquiries ? `(${metrics.clientInquiries} new)` : ''}` : undefined}
        >
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <MessageSquare size={18} color={isActive('/lead/messages') ? '#7C3AED' : '#6B7280'} />
            {isCollapsed && metrics?.clientInquiries > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#7C3AED',
                }}
              />
            )}
          </div>
          {!isCollapsed && <span style={{ flex: 1 }}>Messages</span>}
          {!isCollapsed && metrics?.clientInquiries > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD4FA',
                padding: '1px 6px',
                borderRadius: '999px',
              }}
            >
              {metrics.clientInquiries}
            </span>
          )}
        </div>
      </div>

      {/* 3. Bottom Specialist Profile & Logout */}
      <div
        style={{
          padding: '14px 16px',
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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
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
                {user?.name || 'Lead Specialist'}
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
                {user?.role === 'ADMIN' ? 'Administrator' : 'Company Lead'}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          title="Log Out"
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
