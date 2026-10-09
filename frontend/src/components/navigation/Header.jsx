import React, { useState } from 'react';
import { Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';

/**
 * Reusable Header Component
 * Matches the reference mockup: Omnibox search, notification bell with badge (3), user organization badge
 */
export default function Header({
  user = { name: 'Data I2I Client', email: 'testclient@datai2i.com', company: { name: 'Data I2I' } },
  searchValue = '',
  onSearchChange,
  unreadNotifications = 3,
  onOpenNotifications,
  onLogout,
  onOpenProfile,
  onToggleMobileSidebar,
  className = '',
  style = {},
}) {
  const userDisplayName = user?.company?.name || user?.name || 'Data I2I';

  const userMenuItems = [
    {
      label: 'Account & Profile',
      icon: User,
      onClick: onOpenProfile,
    },
    {
      label: 'Security Settings',
      icon: Settings,
      onClick: onOpenProfile,
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: LogOut,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <header
      className={`cg-header ${className}`}
      style={{
        height: 'var(--cg-header-height)',
        backgroundColor: 'var(--cg-bg-header)',
        borderBottom: '1px solid var(--cg-border-light)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        ...style,
      }}
    >
      {/* 1. Left Side: Mobile Hamburger & Search Omnibox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="cg-mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cg-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search requests, services, or anything..."
          style={{ width: '100%', maxWidth: '440px' }}
        />
      </div>

      {/* 2. Right Side: Notifications & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: '1px solid var(--cg-border)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cg-text-secondary)',
            cursor: 'pointer',
            boxShadow: 'var(--cg-shadow-xs)',
            transition: 'all var(--cg-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--cg-purple-400)';
            e.currentTarget.style.color = 'var(--cg-purple-600)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--cg-border)';
            e.currentTarget.style.color = 'var(--cg-text-secondary)';
          }}
        >
          <Bell size={18} />

          {unreadNotifications > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--cg-coral-500)',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
              }}
            >
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--cg-radius-pill)',
                transition: 'background var(--cg-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Avatar name={userDisplayName} size="sm" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--cg-text-primary)',
                    fontFamily: 'var(--cg-font-family)',
                  }}
                >
                  {userDisplayName}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--cg-text-muted)' }} />
              </div>
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
