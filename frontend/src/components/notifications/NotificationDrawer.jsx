import React, { useEffect } from 'react';
import { X, Bell, CheckCheck, Clock, ShieldCheck, PlayCircle, Eye } from 'lucide-react';
import Button from '../common/Button';

/**
 * Reusable NotificationDrawer Component
 * Slide-out panel for system & ticket alerts
 */
export default function NotificationDrawer({
  isOpen = false,
  onClose,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  className = '',
  style = {},
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ASSIGNMENT':
        return PlayCircle;
      case 'REVIEW':
        return Eye;
      case 'APPROVED':
        return ShieldCheck;
      default:
        return Bell;
    }
  };

  return (
    <div
      className="cg-notification-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 16, 64, 0.35)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`cg-notification-drawer ${className}`}
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--cg-shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--cg-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} style={{ color: 'var(--cg-purple-600)' }} />
            <h3 style={{ fontFamily: 'var(--cg-font-heading)', fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--cg-text-primary)' }}>
              Notifications
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cg-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Subheader Actions */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--cg-border-light)',
            backgroundColor: 'var(--cg-bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: 'var(--cg-text-secondary)',
          }}
        >
          <span>Recent Updates</span>

          {onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--cg-purple-600)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--cg-text-muted)', fontSize: '0.875rem' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = getTypeIcon(n.type);

              return (
                <div
                  key={n.id}
                  onClick={() => onNotificationClick && onNotificationClick(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--cg-radius-md)',
                    backgroundColor: n.isRead ? 'transparent' : 'var(--cg-purple-50)',
                    marginBottom: '6px',
                    cursor: onNotificationClick ? 'pointer' : 'default',
                    border: `1px solid ${n.isRead ? 'transparent' : 'var(--cg-purple-100)'}`,
                    transition: 'all var(--cg-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'var(--cg-purple-50)';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: n.isRead ? 'var(--cg-neutral-100)' : 'var(--cg-purple-100)',
                      color: n.isRead ? 'var(--cg-text-muted)' : 'var(--cg-purple-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: n.isRead ? 500 : 700, color: 'var(--cg-text-primary)', marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cg-text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                      {n.message}
                    </div>
                    {n.createdAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--cg-text-muted)' }}>
                        <Clock size={11} />
                        <span>{n.createdAt}</span>
                      </div>
                    )}
                  </div>

                  {!n.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--cg-purple-600)',
                        flexShrink: 0,
                        marginTop: '4px',
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
