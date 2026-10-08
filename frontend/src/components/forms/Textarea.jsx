import React from 'react';

/**
 * Reusable Textarea Component
 */
export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  error = false,
  maxLength,
  fullWidth = true,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        className={`cg-textarea ${className}`}
        style={{
          width: '100%',
          padding: '12px 14px',
          backgroundColor: disabled ? 'var(--cg-neutral-100)' : '#FFFFFF',
          border: `1px solid ${error ? 'var(--cg-coral-500)' : 'var(--cg-border)'}`,
          borderRadius: 'var(--cg-radius-md)',
          fontFamily: 'var(--cg-font-family)',
          fontSize: '0.875rem',
          color: 'var(--cg-text-primary)',
          outline: 'none',
          boxShadow: 'var(--cg-shadow-xs)',
          resize: 'vertical',
          lineHeight: 1.5,
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

      {maxLength && (
        <div
          style={{
            textAlign: 'right',
            fontSize: '0.6875rem',
            color: 'var(--cg-text-muted)',
            marginTop: '4px',
          }}
        >
          {value ? value.length : 0} / {maxLength}
        </div>
      )}
    </div>
  );
}
