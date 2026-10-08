import React from 'react';

/**
 * Reusable Input Component
 * Prefix/suffix icon support, focus ring, error state styling
 */
export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = true,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`cg-input-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {Icon && (
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--cg-text-muted)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon size={16} />
        </span>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          height: '42px',
          padding: `0 ${IconRight ? '36px' : '14px'} 0 ${Icon ? '36px' : '14px'}`,
          backgroundColor: disabled ? 'var(--cg-neutral-100)' : '#FFFFFF',
          border: `1px solid ${error ? 'var(--cg-coral-500)' : 'var(--cg-border)'}`,
          borderRadius: 'var(--cg-radius-md)',
          fontFamily: 'var(--cg-font-family)',
          fontSize: '0.875rem',
          color: 'var(--cg-text-primary)',
          outline: 'none',
          boxShadow: 'var(--cg-shadow-xs)',
          transition: 'all var(--cg-transition-fast)',
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = error ? 'var(--cg-coral-500)' : 'var(--cg-purple-500)';
            e.target.style.boxShadow = error
              ? '0 0 0 3px rgba(244, 63, 94, 0.15)'
              : '0 0 0 3px rgba(139, 92, 246, 0.15)';
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--cg-coral-500)' : 'var(--cg-border)';
          e.target.style.boxShadow = 'var(--cg-shadow-xs)';
        }}
        {...props}
      />

      {IconRight && (
        <span
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--cg-text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconRight size={16} />
        </span>
      )}
    </div>
  );
}
