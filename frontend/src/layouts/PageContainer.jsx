import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';

/**
 * Reusable PageContainer Component
 * Provides consistent spacing, headers, breadcrumbs, and action rows
 */
export default function PageContainer({
  title,
  subtitle,
  breadcrumbItems,
  actions,
  banner,
  children,
  maxWidth = 'var(--cg-max-content-width)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-page-container ${className}`}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '28px 32px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Optional Breadcrumbs */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} />
      )}

      {/* Optional Top Hero/Welcome Banner (e.g. "Good morning, Acme Corp") */}
      {banner}

      {/* Standard Page Title Header Row */}
      {(title || actions) && !banner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            {title && (
              <h1
                style={{
                  fontFamily: 'var(--cg-font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--cg-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
            )}

            {subtitle && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--cg-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{actions}</div>}
        </div>
      )}

      {/* Page Content Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </div>
    </div>
  );
}
