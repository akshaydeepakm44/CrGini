import React from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  User,
  Building,
  ExternalLink,
  PenTool
} from 'lucide-react';
import { formatDesignDate } from '../data/designAdapters';

export default function DesignRequestCard({ request, onClick }) {
  if (!request) return null;

  const ServiceIcon = request.service?.icon || PenTool;
  const statusCfg = request.statusConfig;
  const priorityCfg = request.priorityConfig;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = request.service?.color || '#0284C7';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(2, 132, 199, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      {/* Top row: Ticket ID & Status / Priority */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#1E293B',
                fontFamily: 'monospace',
                backgroundColor: '#F1F5F9',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              {request.ticketId}
            </span>

            {/* Service tag */}
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: request.service?.color || '#0284C7',
                backgroundColor: request.service?.bgColor || '#F0F9FF',
                border: `1px solid ${request.service?.borderColor || '#BAE6FD'}`,
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ServiceIcon size={12} />
              {request.service?.shortName || request.service?.name}
            </span>
          </div>

          {/* Status pill */}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: statusCfg.color,
              backgroundColor: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
              padding: '2px 10px',
              borderRadius: '999px',
            }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0F172A',
            margin: '0 0 8px 0',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {request.title}
        </h3>

        {/* Client & Description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.8125rem', marginBottom: '8px' }}>
          <Building size={14} style={{ color: '#94A3B8' }} />
          <span style={{ fontWeight: 600, color: '#334155' }}>{request.clientCompany}</span>
          <span>•</span>
          <span>{request.clientName}</span>
        </div>

        {request.description && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#64748B',
              margin: '0 0 16px 0',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {request.description}
          </p>
        )}
      </div>

      {/* Bottom row: Specialist, Deadline & Open Action */}
      <div
        style={{
          borderTop: '1px solid #F1F5F9',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={13} style={{ color: '#94A3B8' }} />
          <span>{request.assignedTo}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {request.deadline ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
              <Clock size={12} />
              <span>{formatDesignDate(request.deadline)}</span>
            </div>
          ) : (
            <span>{formatDesignDate(request.createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
