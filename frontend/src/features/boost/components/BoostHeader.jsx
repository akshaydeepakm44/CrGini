import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  CheckCheck,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BoostHeader({
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
      navigate(`/boost/requests/${ticket}`);
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
          placeholder="Search requests, clients, services, tickets..."
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
            e.target.style.borderColor = '#7C3AED';
            e.target.style.backgroundColor = '#FFFFFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.backgroundColor = '#F9FAFB';
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Operational Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sync/Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Operational Queue"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#4B5563',
            cursor: isRefreshing ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => !isRefreshing && (e.currentTarget.style.backgroundColor = '#F9FAFB')}
          onMouseLeave={(e) => !isRefreshing && (e.currentTarget.style.backgroundColor = '#FFFFFF')}
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? 'animate-spin' : ''}
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              color: isRefreshing ? '#7C3AED' : '#6B7280',
            }}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Queue'}</span>
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: showNotifications ? '#F5F3FF' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={18} color={showNotifications ? '#7C3AED' : '#4B5563'} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '360px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E5E7EB',
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
                  backgroundColor: '#FAFAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#7C3AED',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                    No notifications right now
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
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: isUnread ? '#FDF4FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isUnread ? '#FDF4FF' : '#FFFFFF')
                        }
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          {isUnread && (
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#7C3AED',
                                marginTop: '6px',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: isUnread ? 700 : 500, color: '#111827' }}>
                              {n.title || n.message || 'Notification'}
                            </div>
                            {n.description && (
                              <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '2px' }}>
                                {n.description}
                              </div>
                            )}
                            <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '4px' }}>
                              {n.createdAt || n.created_at ? new Date(n.createdAt || n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </div>
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

        {/* Specialist Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            backgroundColor: '#F5F3FF',
            border: '1px solid #DDD6FE',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D28D9' }}>
            Boost Specialist Active
          </span>
        </div>
      </div>
    </header>
  );
}
