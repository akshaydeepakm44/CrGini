import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable Breadcrumb Component
 * items: Array of { label, href, onClick, icon }
 */
export default function Breadcrumb({ items = [], className = '', style = {} }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`cg-breadcrumb ${className}`} style={{ ...style }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.84375rem',
          color: 'var(--cg-text-muted)',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: isLast ? 600 : 400,
                  color: isLast ? 'var(--cg-text-primary)' : 'var(--cg-text-secondary)',
                }}
              >
                {Icon && <Icon size={14} style={{ color: 'var(--cg-text-muted)' }} />}
                {item.onClick || item.href ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'inherit',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      fontWeight: 'inherit',
                      textDecoration: 'none',
                      transition: 'color var(--cg-transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cg-purple-600)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>

              {!isLast && (
                <ChevronRight size={14} style={{ color: 'var(--cg-neutral-400)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
