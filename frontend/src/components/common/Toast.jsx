import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Reusable Toast Component
 * Types: 'success' | 'error' | 'info' | 'warning'
 */
export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000,
  className = '',
  style = {},
}) {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'var(--cg-mint-50)',
      border: 'var(--cg-mint-200)',
      color: 'var(--cg-mint-700)',
      iconColor: 'var(--cg-mint-500)',
    },
    error: {
      icon: AlertCircle,
      bg: 'var(--cg-coral-50)',
      border: 'var(--cg-coral-200)',
      color: 'var(--cg-coral-700)',
      iconColor: 'var(--cg-coral-500)',
    },
    warning: {
      icon: AlertCircle,
      bg: 'var(--cg-amber-50)',
      border: 'var(--cg-amber-200)',
      color: 'var(--cg-amber-700)',
      iconColor: 'var(--cg-amber-500)',
    },
    info: {
      icon: Info,
      bg: 'var(--cg-blue-50)',
      border: 'var(--cg-blue-200)',
      color: 'var(--cg-blue-700)',
      iconColor: 'var(--cg-blue-500)',
    },
  };

  const currentConfig = typeConfig[type] || typeConfig.info;
  const Icon = currentConfig.icon;

  return (
    <div
      role="alert"
      className={`cg-toast cg-toast-${type} ${className}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: 'var(--cg-radius-md)',
        backgroundColor: currentConfig.bg,
        border: `1px solid ${currentConfig.border}`,
        boxShadow: 'var(--cg-shadow-hover)',
        color: currentConfig.color,
        fontSize: '0.875rem',
        fontWeight: 500,
        fontFamily: 'var(--cg-font-family)',
        maxWidth: '420px',
        animation: 'slideUp 0.25s ease-out',
        ...style,
      }}
    >
      <Icon size={18} style={{ color: currentConfig.iconColor, flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
