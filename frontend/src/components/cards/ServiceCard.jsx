import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

/**
 * Reusable ServiceCard Component
 * Displays individual specialist services (Strategic Planner, Content Creator, Lead Research, etc.)
 */
export default function ServiceCard({
  icon: Icon,
  title,
  description,
  price,
  channel, // 'boosting' | 'digitalising'
  statusBadge,
  ctaText = 'Request Service',
  onRequest,
  onViewDetails,
  className = '',
  style = {},
}) {
  const channelBadgeVariant = channel === 'boosting' ? 'purple' : 'blue';

  return (
    <div
      className={`cg-service-card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--cg-border-light)',
        borderRadius: 'var(--cg-radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--cg-shadow-card)',
        transition: 'all var(--cg-transition-fast)',
        minHeight: '230px',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-hover)';
        e.currentTarget.style.borderColor = 'var(--cg-purple-200)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-card)';
        e.currentTarget.style.borderColor = 'var(--cg-border-light)';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          {Icon ? (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: channel === 'boosting' ? 'var(--cg-purple-50)' : 'var(--cg-blue-50)',
                color: channel === 'boosting' ? 'var(--cg-purple-600)' : 'var(--cg-blue-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} />
            </div>
          ) : (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--cg-purple-50)',
                color: 'var(--cg-purple-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {channel && (
              <Badge variant={channelBadgeVariant} size="sm">
                {channel.toUpperCase()}
              </Badge>
            )}
            {statusBadge}
          </div>
        </div>

        <h4
          style={{
            fontFamily: 'var(--cg-font-heading)',
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--cg-text-primary)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h4>

        <p
          style={{
            fontSize: '0.84375rem',
            color: 'var(--cg-text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>

      <div>
        {price !== undefined && (
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cg-text-muted)', fontWeight: 500 }}>Starting at</span>
            <span style={{ fontFamily: 'var(--cg-font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--cg-text-primary)' }}>
              ${price}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            fullWidth
            onClick={onRequest}
          >
            {ctaText}
          </Button>

          {onViewDetails && (
            <Button
              variant="outline"
              size="md"
              onClick={onViewDetails}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
