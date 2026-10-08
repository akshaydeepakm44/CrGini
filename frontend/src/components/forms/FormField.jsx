import React from 'react';

/**
 * Reusable FormField Wrapper Component
 * Provides accessible label, required asterisk, helper text, and error messages
 */
export default function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-form-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '18px',
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.84375rem',
            fontWeight: 600,
            color: 'var(--cg-text-primary)',
            fontFamily: 'var(--cg-font-family)',
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: 'var(--cg-coral-500)' }}>*</span>}
        </label>
      )}

      {children}

      {hint && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--cg-text-muted)', lineHeight: 1.4 }}>
          {hint}
        </span>
      )}

      {error && (
        <span
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--cg-coral-600)',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
