import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  HelpCircle,
  X,
} from 'lucide-react';
import Button from '../common/Button';

/**
 * Reusable Sidebar Component
 * Supports Client, Specialist, and Admin navigation structures.
 * Features collapsible state, nested sub-items, and bottom promotional card.
 */
export default function Sidebar({
  navItems = [],
  activePath,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  roleBadge = 'Client Portal',
  onExploreServices,
  isMobileOpen = false,
  onCloseMobile,
  className = '',
  style = {},
}) {
  const [expandedSections, setExpandedSections] = useState({
    boosting: true,
    digitalising: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 99,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside
        className={`cg-sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}
        style={{
          width: isCollapsed ? 'var(--cg-sidebar-collapsed)' : 'var(--cg-sidebar-width)',
          backgroundColor: 'var(--cg-bg-sidebar)',
          borderRight: '1px solid var(--cg-border-light)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          position: isMobileOpen ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: isMobileOpen ? 100 : 50,
          transition: 'width var(--cg-transition-normal)',
          boxShadow: 'var(--cg-shadow-xs)',
          userSelect: 'none',
          flexShrink: 0,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* 1. Logo Header */}
        <div
          style={{
            padding: isCollapsed ? '20px 14px' : '20px 20px 16px',
            borderBottom: '1px solid var(--cg-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            flexShrink: 0,
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCollapsed ? (
            <img
              src="/logo-icon.png"
              alt="CreativeGini"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <img
                src="/logo.png"
                alt="CreativeGini"
                style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
              />
              {roleBadge && (
                <div
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--cg-purple-600)',
                    lineHeight: 1,
                    marginTop: '2px',
                  }}
                >
                  {roleBadge}
                </div>
              )}
            </div>
          )}
        </div>

        {isMobileOpen && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cg-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--cg-radius-xs)',
            }}
          >
            <X size={18} />
          </button>
        ) : onToggleCollapse && !isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cg-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--cg-radius-xs)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        ) : null}
      </div>

      {/* 2. Navigation Items */}
      <nav
        style={{
          flex: 1,
          padding: '14px 10px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSection = Array.isArray(item.children) && item.children.length > 0;
          const isExpanded = expandedSections[item.id] ?? false;
          const isActive = activePath === item.path || (isSection && item.children.some((c) => c.path === activePath));

          const sectionHeading = item.sectionTitle && !isCollapsed ? (
            <div
              key={`section-title-${item.id}`}
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
                padding: '14px 12px 4px',
              }}
            >
              {item.sectionTitle}
            </div>
          ) : null;

          if (isSection && !isCollapsed) {
            return (
              <React.Fragment key={item.id}>
                {sectionHeading}
                <div style={{ marginBottom: '2px' }}>
                <button
                  type="button"
                  onClick={() => toggleSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--cg-radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--cg-purple-50)' : 'transparent',
                    color: isActive ? 'var(--cg-purple-700)' : 'var(--cg-text-secondary)',
                    fontFamily: 'var(--cg-font-family)',
                    fontSize: '0.84375rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--cg-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={18} style={{ color: isActive ? 'var(--cg-purple-600)' : 'var(--cg-text-muted)' }} />}
                    <span>{item.label}</span>
                  </div>

                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isExpanded && (
                  <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    {item.children.map((sub) => {
                      const isSubActive = activePath === sub.path;
                      return (
                        <button
                          key={sub.id || sub.path}
                          type="button"
                          onClick={() => onNavigate && onNavigate(sub.path)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '7px 10px',
                            borderRadius: 'var(--cg-radius-sm)',
                            border: 'none',
                            backgroundColor: isSubActive ? 'var(--cg-purple-100)' : 'transparent',
                            color: isSubActive ? 'var(--cg-purple-800)' : 'var(--cg-text-secondary)',
                            fontFamily: 'var(--cg-font-family)',
                            fontSize: '0.8125rem',
                            fontWeight: isSubActive ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all var(--cg-transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        }

        // Standalone Nav Item
        return (
          <React.Fragment key={item.id || item.path}>
            {sectionHeading}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate(item.path)}
              title={isCollapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                borderRadius: 'var(--cg-radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--cg-purple-50)' : 'transparent',
                color: isActive ? 'var(--cg-purple-700)' : 'var(--cg-text-secondary)',
                fontFamily: 'var(--cg-font-family)',
                fontSize: '0.84375rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--cg-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {Icon && <Icon size={18} style={{ color: isActive ? 'var(--cg-purple-600)' : 'var(--cg-text-muted)' }} />}
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: 'var(--cg-coral-500)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--cg-radius-pill)',
                    padding: '1px 6px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          </React.Fragment>
        );
        })}
      </nav>

      {/* 3. Promotional Service Card (Near Bottom - Matches Reference Mockup) */}
      {!isCollapsed && (
        <div style={{ padding: '12px', margin: '0 8px 14px', flexShrink: 0 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)',
              border: '1px solid var(--cg-purple-200)',
              borderRadius: 'var(--cg-radius-lg)',
              padding: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: 'var(--cg-purple-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)',
              }}
            >
              <Sparkles size={18} />
            </div>

            <div style={{ fontFamily: 'var(--cg-font-heading)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--cg-text-primary)' }}>
              Need Something More?
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--cg-text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Explore our full range of digital marketing & research services.
            </p>

            <button
              type="button"
              onClick={onExploreServices}
              style={{
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--cg-purple-600)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--cg-radius-pill)',
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background var(--cg-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cg-purple-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--cg-purple-600)')}
            >
              <span>Explore Services</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
