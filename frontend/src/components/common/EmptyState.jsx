import React from 'react';
import Button from './Button';

/**
 * Reusable EmptyState Component
 */
export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--cg-radius-lg)',
        border: '1px dashed var(--cg-border)',
        ...style,
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--cg-radius-pill)',
            backgroundColor: 'var(--cg-purple-50)',
            color: 'var(--cg-purple-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Icon size={28} />
        </div>
      )}

      <h3
        style={{
          fontFamily: 'var(--cg-font-heading)',
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--cg-text-primary)',
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--cg-text-secondary)',
          maxWidth: '400px',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
