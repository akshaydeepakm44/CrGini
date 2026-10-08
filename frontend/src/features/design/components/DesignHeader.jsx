import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  CheckCheck,
  ExternalLink,
  X,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DesignHeader({
  searchQuery = '',
  onSearchChange,
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false,
  user
}) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (onMarkNotificationRead && (notif.id || notif._id)) {
      onMarkNotificationRead(notif.id || notif._id);
    }
    setShowNotifications(false);
    if (notif.requestId || notif.ticketId || notif.request_id) {
      const ticket = notif.requestId || notif.ticketId || notif.request_id;
      navigate(`/design/requests/${ticket}`);
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
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
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search design tickets, clients, Figma projects..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            fontSize: '0.875rem',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            color: '#111827',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#FFFFFF';
            e.target.style.borderColor = '#0284C7';
            e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh operational data"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <RefreshCw
              size={16}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        )}

        {/* Global Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: showNotifications ? '#F0F9FF' : '#FFFFFF',
              color: showNotifications ? '#0284C7' : '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = showNotifications ? '#F0F9FF' : '#FFFFFF')
            }
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  height: '18px',
                  minWidth: '18px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '380px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FAFAFA',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                    Design Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#E0F2FE',
                        color: '#0284C7',
                        padding: '2px 6px',
                        borderRadius: '999px',
                      }}
                    >
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#0284C7',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <Sparkles size={24} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                    No new design notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.isRead && !n.is_read;
                    return (
                      <div
                        key={n.id || n._id || Math.random()}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F3F4F6',
                          backgroundColor: isUnread ? '#F0F9FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          display: 'flex',
                          gap: '12px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isUnread ? '#F0F9FF' : '#FFFFFF')
                        }
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isUnread ? '#0284C7' : 'transparent',
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: isUnread ? 700 : 500,
                              color: '#111827',
                              marginBottom: '2px',
                            }}
                          >
                            {n.title || 'Ticket Update'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6B7280',
                              lineHeight: '1.4',
                            }}
                          >
                            {n.message || n.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 6px',
            borderRadius: '999px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', lineHeight: 1 }}>
              {user?.name || 'UI/Design Specialist'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
              UI / UX Team
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
