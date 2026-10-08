import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable SearchInput Omnibox Component
 * Clean light input with search icon and clear button
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search requests, services, or anything...',
  onClear,
  shortcut = null,
  width = '100%',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`cg-search-input-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width,
        maxWidth: '480px',
        ...style,
      }}
    >
      <Search
        size={17}
        style={{
          position: 'absolute',
          left: '14px',
          color: 'var(--cg-text-muted)',
          pointerEvents: 'none',
        }}
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 40px 0 40px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--cg-border)',
          borderRadius: 'var(--cg-radius-pill)',
          fontFamily: 'var(--cg-font-family)',
          fontSize: '0.875rem',
          color: 'var(--cg-text-primary)',
          outline: 'none',
          boxShadow: '0 1px 3px rgba(124, 58, 237, 0.04)',
          transition: 'all var(--cg-transition-fast)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--cg-purple-400)';
          e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.12)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--cg-border)';
          e.target.style.boxShadow = '0 1px 3px rgba(124, 58, 237, 0.04)';
        }}
        {...props}
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--cg-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
        >
          <X size={15} />
        </button>
      ) : shortcut ? (
        <kbd
          style={{
            position: 'absolute',
            right: '12px',
            fontSize: '0.6875rem',
            fontFamily: 'inherit',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 'var(--cg-radius-xs)',
            backgroundColor: 'var(--cg-neutral-100)',
            color: 'var(--cg-text-muted)',
            border: '1px solid var(--cg-border)',
          }}
        >
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}
