import React, { useState } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function LeadHeader({
  searchQuery = '',
  onSearchChange,
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false,
  user,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* 1. Global Search Box */}
      <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
        <Search
          size={16}
          color="#9CA3AF"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search ticket ID, company, lead, or criteria..."
          style={{
            width: '100%',
            height: '38px',
            padding: '0 14px 0 36px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '0.84375rem',
            color: '#111827',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#FFFFFF';
            e.target.style.borderColor = '#7C3AED';
            e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* 2. Operational Status & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Operational Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#059669',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
          <span>Research Pod Active</span>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            color: '#4B5563',
            cursor: isRefreshing ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) e.currentTarget.style.backgroundColor = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            if (!isRefreshing) e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              border: '1px solid #E5E7EB',
              backgroundColor: showNotifications ? '#F5F3FF' : '#FFFFFF',
              color: showNotifications ? '#7C3AED' : '#4B5563',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '360px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
                  Operational Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onMarkAllRead && onMarkAllRead()}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#7C3AED',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F8FAFC',
                        backgroundColor: notif.is_read || notif.isRead ? '#FFFFFF' : '#F5F3FF',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '2px' }}>
                        {notif.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
