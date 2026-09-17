import React, { useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  FileCheck,
  RotateCcw,
  CheckCheck,
  X
} from 'lucide-react';

export default function NotificationPanel({
  notifications = [],
  unreadCount = 0,
  isOpen = undefined,
  onToggle,
  onClose,
  onMarkRead,
  onMarkAsRead,
  onMarkAllRead,
  onMarkAllAsRead,
  onOpenTicket
}) {
  const containerRef = useRef(null);
  const markReadFn = onMarkRead || onMarkAsRead;
  const markAllReadFn = onMarkAllRead || onMarkAllAsRead;

  // Determine if panel is open: controlled via isOpen, or true if parent rendered it conditionally
  const isPanelOpen = isOpen !== undefined ? isOpen : true;
  const hasTrigger = typeof onToggle === 'function';

  // Reliable click-outside and Escape key handlers
  useEffect(() => {
    if (!isPanelOpen) return;

    const handlePointerDown = (event) => {
      // If the target is outside our notification container, close the panel
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanelOpen, onClose]);

  const handleBellClick = (e) => {
    e.stopPropagation();
    if (isPanelOpen) {
      onClose?.();
    } else if (onToggle) {
      onToggle();
    }
  };

  const handleNotificationClick = (n, e) => {
    e.stopPropagation();
    if (!n.isRead && markReadFn) {
      markReadFn(n._id);
    }
    if (n.ticketId && onOpenTicket) {
      onOpenTicket(n.ticketId);
    }
    onClose?.();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'WORK_SUBMITTED':
      case 'WORK_RESUBMITTED':
        return <FileCheck size={16} color="#00D9FF" />;
      case 'CHANGES_REQUESTED':
        return <RotateCcw size={16} color="#FFB000" />;
      case 'WORK_APPROVED':
      case 'TICKET_COMPLETED':
        return <CheckCircle2 size={16} color="#34d399" />;
      case 'ASSIGNMENT':
        return <Clock size={16} color="#a855f7" />;
      default:
        return <Bell size={16} color="#00D9FF" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={containerRef}
      className="portal-notification-container"
      style={{ position: 'relative' }}
    >
      {/* 1. Controlled Bell Trigger Button (rendered if onToggle is passed) */}
      {hasTrigger && (
        <button
          type="button"
          className={`portal-nav-action-btn ${isPanelOpen ? 'active' : ''}`}
          onClick={handleBellClick}
          title="Notifications"
          aria-expanded={isPanelOpen}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="portal-nav-action-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* 2. Notification Panel Dropdown */}
      {isPanelOpen && (
        <>
          {/* Mobile touch backdrop for easy outside dismissal */}
          <div
            className="portal-notification-backdrop-mobile"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-hidden="true"
          />

          <div
            className="portal-topbar-dropdown notification-panel"
            style={{
              width: '380px',
              maxHeight: '520px',
              right: 0,
              top: '100%',
              marginTop: '8px',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
            role="region"
            aria-label="Notification Center"
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#00D9FF" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#FF3B30',
                      color: '#FFF',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '10px'
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unreadCount > 0 && markAllReadFn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllReadFn();
                    }}
                    title="Mark all as read"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00D9FF',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
                {/* Close (X) Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose?.();
                  }}
                  title="Close notifications"
                  aria-label="Close notifications"
                  className="portal-notification-close-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8fa0b5',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease, background 0.15s ease'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '420px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#8fa0b5', fontSize: '0.85rem' }}>
                  <Bell size={28} color="#8fa0b5" style={{ opacity: 0.4, margin: '0 auto 10px' }} />
                  <div>No notifications yet</div>
                  <div style={{ fontSize: '0.76rem', marginTop: '4px', opacity: 0.7 }}>
                    Workflow updates and reviews will appear here.
                  </div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={(e) => handleNotificationClick(n, e)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: n.isRead ? 'transparent' : 'rgba(0, 217, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                    className="notification-item-hover"
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(4, 12, 18, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {getNotificationIcon(n.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: n.isRead ? '600' : '700',
                            color: n.isRead ? '#cbd5e1' : '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {n.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#8fa0b5', flexShrink: 0 }}>
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#8fa0b5',
                          marginTop: '3px',
                          lineHeight: '1.4'
                        }}
                      >
                        {n.message}
                      </div>
                      {n.ticketCode && (
                        <div style={{ marginTop: '5px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              color: '#00D9FF',
                              background: 'rgba(0, 217, 255, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}
                          >
                            {n.ticketCode}
                          </span>
                        </div>
                      )}
                    </div>
                    {!n.isRead && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#00D9FF',
                          marginTop: '8px',
                          flexShrink: 0
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
