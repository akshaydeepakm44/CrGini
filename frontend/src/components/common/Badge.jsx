import React from 'react';

/**
 * Reusable Badge Component
 * Variants: purple, mint, blue, coral, amber, gray
 * Sizes: sm, md
 */
export default function Badge({
  children,
  variant = 'purple',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const variantStyles = {
    purple: {
      background: 'var(--cg-purple-100)',
      color: 'var(--cg-purple-700)',
      border: '1px solid var(--cg-purple-200)',
      dotColor: 'var(--cg-purple-500)',
    },
    mint: {
      background: 'var(--cg-mint-100)',
      color: 'var(--cg-mint-700)',
      border: '1px solid var(--cg-mint-200)',
      dotColor: 'var(--cg-mint-500)',
    },
    blue: {
      background: 'var(--cg-blue-100)',
      color: 'var(--cg-blue-700)',
      border: '1px solid var(--cg-blue-200)',
      dotColor: 'var(--cg-blue-500)',
    },
    coral: {
      background: 'var(--cg-coral-100)',
      color: 'var(--cg-coral-700)',
      border: '1px solid var(--cg-coral-200)',
      dotColor: 'var(--cg-coral-500)',
    },
    amber: {
      background: 'var(--cg-amber-100)',
      color: 'var(--cg-amber-700)',
      border: '1px solid var(--cg-amber-200)',
      dotColor: 'var(--cg-amber-500)',
    },
    gray: {
      background: 'var(--cg-neutral-100)',
      color: 'var(--cg-neutral-700)',
      border: '1px solid var(--cg-neutral-200)',
      dotColor: 'var(--cg-neutral-400)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.purple;

  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '0.75rem',
      height: '22px',
      gap: '4px',
    },
    md: {
      padding: '3px 10px',
      fontSize: '0.8125rem',
      height: '26px',
      gap: '6px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`cg-badge cg-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: 'var(--cg-radius-pill)',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        transition: 'all var(--cg-transition-fast)',
        ...currentVariant,
        ...currentSize,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: currentVariant.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} style={{ flexShrink: 0 }} />}
      <span>{children}</span>
    </span>
  );
}
