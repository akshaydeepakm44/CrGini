import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Reusable InfoCard Component
 * Callout / Announcement card with soft pastel background
 */
export default function InfoCard({
  title,
  children,
  variant = 'info', // 'info' | 'success' | 'warning' | 'error' | 'purple'
  icon: CustomIcon,
  action,
  className = '',
  style = {},
}) {
  const variantConfig = {
    info: {
      icon: Info,
      bg: 'var(--cg-blue-50)',
      border: 'var(--cg-blue-200)',
      iconColor: 'var(--cg-blue-600)',
      textColor: 'var(--cg-blue-700)',
    },
    success: {
      icon: CheckCircle2,
      bg: 'var(--cg-mint-50)',
      border: 'var(--cg-mint-200)',
      iconColor: 'var(--cg-mint-600)',
      textColor: 'var(--cg-mint-700)',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'var(--cg-amber-50)',
      border: 'var(--cg-amber-200)',
      iconColor: 'var(--cg-amber-600)',
      textColor: 'var(--cg-amber-700)',
    },
    error: {
      icon: AlertCircle,
      bg: 'var(--cg-coral-50)',
      border: 'var(--cg-coral-200)',
      iconColor: 'var(--cg-coral-600)',
      textColor: 'var(--cg-coral-700)',
    },
    purple: {
      icon: Info,
      bg: 'var(--cg-purple-50)',
      border: 'var(--cg-purple-200)',
      iconColor: 'var(--cg-purple-600)',
      textColor: 'var(--cg-purple-700)',
    },
  };

  const config = variantConfig[variant] || variantConfig.info;
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={`cg-info-card cg-info-${variant} ${className}`}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--cg-radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        ...style,
      }}
    >
      <div style={{ color: config.iconColor, flexShrink: 0, marginTop: '2px' }}>
        <Icon size={20} />
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontFamily: 'var(--cg-font-heading)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--cg-text-primary)',
              margin: '0 0 4px 0',
            }}
          >
            {title}
          </h4>
        )}
        <div style={{ fontSize: '0.84375rem', color: config.textColor, lineHeight: 1.5 }}>
          {children}
        </div>
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
