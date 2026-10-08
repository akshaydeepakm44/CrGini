import React from 'react';

/**
 * Reusable Tabs Component
 * Variants: 'pills' | 'line'
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
  style = {},
}) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      className={`cg-tabs cg-tabs-${variant} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '8px' : '20px',
        borderBottom: variant === 'line' ? '1px solid var(--cg-border-light)' : 'none',
        paddingBottom: variant === 'line' ? '2px' : 0,
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--cg-radius-pill)',
                border: `1px solid ${isActive ? 'var(--cg-purple-200)' : 'transparent'}`,
                backgroundColor: isActive ? 'var(--cg-purple-50)' : 'transparent',
                color: isActive ? 'var(--cg-purple-700)' : 'var(--cg-text-secondary)',
                fontFamily: 'var(--cg-font-family)',
                fontSize: '0.84375rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--cg-transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: '1px 6px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    borderRadius: 'var(--cg-radius-pill)',
                    backgroundColor: isActive ? 'var(--cg-purple-600)' : 'var(--cg-neutral-200)',
                    color: isActive ? '#FFFFFF' : 'var(--cg-text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        // Line variant
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 4px',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--cg-purple-600)' : 'transparent'}`,
              backgroundColor: 'transparent',
              color: isActive ? 'var(--cg-purple-700)' : 'var(--cg-text-secondary)',
              fontFamily: 'var(--cg-font-family)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all var(--cg-transition-fast)',
              whiteSpace: 'nowrap',
              marginBottom: '-2px',
            }}
          >
            {Icon && <Icon size={16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  padding: '1px 6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  borderRadius: 'var(--cg-radius-pill)',
                  backgroundColor: isActive ? 'var(--cg-purple-100)' : 'var(--cg-neutral-100)',
                  color: isActive ? 'var(--cg-purple-700)' : 'var(--cg-text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
