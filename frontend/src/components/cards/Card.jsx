import React from 'react';

/**
 * Reusable Card Component
 * Rounded corners (16px), subtle border, soft shadow, optional header/footer
 */
export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default', // 'default' | 'subtle' | 'bordered' | 'interactive'
  padding = '24px',
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const variantStyles = {
    default: {
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--cg-border-light)',
      boxShadow: 'var(--cg-shadow-card)',
    },
    subtle: {
      backgroundColor: 'var(--cg-bg-card-subtle)',
      border: '1px solid var(--cg-border-light)',
      boxShadow: 'none',
    },
    bordered: {
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--cg-border)',
      boxShadow: 'none',
    },
    interactive: {
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--cg-border-light)',
      boxShadow: 'var(--cg-shadow-card)',
      cursor: 'pointer',
      transition: 'all var(--cg-transition-fast)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`cg-card cg-card-${variant} ${className}`}
      onClick={onClick}
      style={{
        borderRadius: 'var(--cg-radius-lg)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        ...currentVariant,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === 'interactive' || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--cg-shadow-hover)';
          e.currentTarget.style.borderColor = 'var(--cg-purple-300)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'interactive' || onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--cg-shadow-card)';
          e.currentTarget.style.borderColor = 'var(--cg-border-light)';
        }
      }}
      {...props}
    >
      {(title || headerAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontFamily: 'var(--cg-font-heading)',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'var(--cg-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--cg-text-muted)',
                  margin: '4px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div style={{ flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--cg-border-light)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
