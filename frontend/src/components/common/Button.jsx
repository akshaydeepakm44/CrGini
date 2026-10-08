import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Variants: primary, secondary, outline, ghost, danger, success
 * Sizes: sm, md, lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  style = {},
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--cg-font-family)',
    fontWeight: 600,
    borderRadius: 'var(--cg-radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all var(--cg-transition-fast)',
    textDecoration: 'none',
    border: '1px solid transparent',
    outline: 'none',
    userSelect: 'none',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: {
      height: '34px',
      padding: '0 12px',
      fontSize: '0.8125rem',
      gap: '6px',
    },
    md: {
      height: '42px',
      padding: '0 18px',
      fontSize: '0.875rem',
      gap: '8px',
    },
    lg: {
      height: '48px',
      padding: '0 24px',
      fontSize: '0.9375rem',
      gap: '10px',
    },
  };

  const variantStyles = {
    primary: {
      background: 'var(--cg-gradient-button)',
      color: '#FFFFFF',
      borderColor: 'transparent',
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
    },
    secondary: {
      background: 'var(--cg-purple-50)',
      color: 'var(--cg-purple-700)',
      borderColor: 'var(--cg-purple-200)',
    },
    outline: {
      background: '#FFFFFF',
      color: 'var(--cg-text-primary)',
      borderColor: 'var(--cg-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--cg-text-secondary)',
      borderColor: 'transparent',
    },
    danger: {
      background: 'var(--cg-coral-500)',
      color: '#FFFFFF',
      borderColor: 'transparent',
      boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)',
    },
    success: {
      background: 'var(--cg-mint-500)',
      color: '#FFFFFF',
      borderColor: 'transparent',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={disabled || isLoading ? undefined : onClick}
      className={`cg-button cg-button-${variant} cg-button-${size} ${className}`}
      style={{
        ...baseStyle,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 18} className="cg-spinner" style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} style={{ flexShrink: 0 }} />
      ) : null}

      <span>{children}</span>

      {!isLoading && IconRight && (
        <IconRight size={size === 'sm' ? 14 : 18} style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}
