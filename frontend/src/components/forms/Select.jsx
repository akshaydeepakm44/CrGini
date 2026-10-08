import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Select Component
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error = false,
  fullWidth = true,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`cg-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 36px 0 14px',
          backgroundColor: disabled ? 'var(--cg-neutral-100)' : '#FFFFFF',
          border: `1px solid ${error ? 'var(--cg-coral-500)' : 'var(--cg-border)'}`,
          borderRadius: 'var(--cg-radius-md)',
          fontFamily: 'var(--cg-font-family)',
          fontSize: '0.875rem',
          color: value ? 'var(--cg-text-primary)' : 'var(--cg-text-muted)',
          outline: 'none',
          boxShadow: 'var(--cg-shadow-xs)',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--cg-transition-fast)',
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
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <span
        style={{
          position: 'absolute',
          right: '12px',
          color: 'var(--cg-text-muted)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ChevronDown size={16} />
      </span>
    </div>
  );
}
