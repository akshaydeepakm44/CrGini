import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Reusable MetricCard Component
 * Exactly matches the 4 signature metric cards from the CreativeGini reference mockup
 * Variants: 'lavender' | 'mint' | 'blue' | 'coral'
 */
export default function MetricCard({
  value,
  label,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  variant = 'lavender',
  onClick,
  className = '',
  style = {},
}) {
  const variantConfig = {
    lavender: {
      bg: 'var(--cg-purple-50)',
      border: 'var(--cg-purple-100)',
      iconBg: 'var(--cg-purple-100)',
      iconColor: 'var(--cg-purple-600)',
    },
    mint: {
      bg: 'var(--cg-mint-50)',
      border: 'var(--cg-mint-100)',
      iconBg: 'var(--cg-mint-100)',
      iconColor: 'var(--cg-mint-600)',
    },
    blue: {
      bg: 'var(--cg-blue-50)',
      border: 'var(--cg-blue-100)',
      iconBg: 'var(--cg-blue-100)',
      iconColor: 'var(--cg-blue-600)',
    },
    coral: {
      bg: 'var(--cg-coral-50)',
      border: 'var(--cg-coral-100)',
      iconBg: 'var(--cg-coral-100)',
      iconColor: 'var(--cg-coral-600)',
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.lavender;
  const isTrendUp = trendDirection === 'up';

  return (
    <div
      className={`cg-metric-card cg-metric-card-${variant} ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: currentVariant.bg,
        border: `1px solid ${currentVariant.border}`,
        borderRadius: 'var(--cg-radius-lg)',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--cg-transition-fast)',
        boxShadow: 'var(--cg-shadow-xs)',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--cg-shadow-card)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--cg-shadow-xs)';
        }
      }}
    >
      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: currentVariant.iconBg,
            color: currentVariant.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontFamily: 'var(--cg-font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--cg-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--cg-text-secondary)',
          }}
        >
          {label}
        </div>

        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isTrendUp ? 'var(--cg-mint-600)' : 'var(--cg-coral-600)',
              marginTop: '2px',
            }}
          >
            {isTrendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
