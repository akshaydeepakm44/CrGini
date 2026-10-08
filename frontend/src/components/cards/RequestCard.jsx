import React from 'react';
import { Clock, Calendar, User, ArrowRight } from 'lucide-react';
import StatusBadge from '../tickets/StatusBadge';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * Reusable RequestCard Component
 * Displays a summary of a ticket/request in card format
 */
export default function RequestCard({
  ticketId,
  title,
  service,
  channel, // 'Boosting' | 'Digitalising'
  status = 'IN_PROGRESS',
  clientName,
  assignedSpecialist,
  createdDate,
  updatedDate,
  price,
  onView,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-request-card ${className}`}
      onClick={onView}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--cg-border-light)',
        borderRadius: 'var(--cg-radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--cg-shadow-card)',
        transition: 'all var(--cg-transition-fast)',
        minHeight: '180px',
        cursor: onView ? 'pointer' : 'default',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--cg-font-heading)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--cg-purple-700)',
                backgroundColor: 'var(--cg-purple-50)',
                padding: '3px 8px',
                borderRadius: 'var(--cg-radius-sm)',
              }}
            >
              {ticketId}
            </span>

            {channel && (
              <Badge variant={channel.toLowerCase() === 'boosting' ? 'purple' : 'blue'} size="sm">
                {channel}
              </Badge>
            )}
          </div>

          <StatusBadge status={status} size="sm" />
        </div>

        <h4
          style={{
            fontFamily: 'var(--cg-font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--cg-text-primary)',
            margin: '0 0 6px 0',
            lineHeight: 1.35,
          }}
        >
          {title}
        </h4>

        {service && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--cg-text-secondary)', fontWeight: 500, marginBottom: '12px' }}>
            Service: <strong>{service}</strong>
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--cg-border-light)',
            fontSize: '0.75rem',
            color: 'var(--cg-text-muted)',
            marginBottom: '12px',
          }}
        >
          {createdDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              {createdDate}
            </span>
          )}

          {assignedSpecialist && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cg-text-secondary)' }}>
              <User size={13} />
              {assignedSpecialist}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
