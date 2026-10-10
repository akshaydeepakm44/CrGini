import React, { useState } from 'react';
import {
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Clock,
  Building,
  User,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { formatBoostDate } from '../data/boostAdapters';

export default function BoostRequestTable({
  requests = [],
  onSelectRequest,
  emptyMessage = 'No Boost requests matching current filters'
}) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (requests.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#F3F4F6',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Inbox size={24} />
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
          {emptyMessage}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6B7280', maxWidth: '420px' }}>
          New client requests submitted for Boost services (Strategy, Content, Creatives, Video, Ads, GTM, DevRel) will appear here.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('ticketId')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Ticket</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 16px' }}>Client</th>
              <th style={{ padding: '12px 16px' }}>Service</th>
              <th style={{ padding: '12px 16px', minWidth: '220px' }}>Title & Requirement</th>
              <th
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('priority')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Priority</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Specialist</th>
              <th
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('createdAt')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Created</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('updatedAt')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Updated</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((req) => {
              const service = req.service;
              const statusCfg = req.statusConfig;
              const priorityCfg = req.priorityConfig;
              const ServiceIcon = service?.icon || Inbox;

              return (
                <tr
                  key={req.id || req.ticketId}
                  onClick={() => onSelectRequest && onSelectRequest(req)}
                  style={{
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  {/* 1. Ticket ID */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          color: '#7C3AED',
                          fontFamily: 'monospace',
                        }}
                      >
                        {req.ticketId}
                      </span>
                    </div>
                  </td>

                  {/* 2. Client Company */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#111827' }}>
                      {req.clientCompany}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {req.clientName}
                    </div>
                  </td>

                  {/* 3. Service Discipline */}
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: service?.bgColor || '#F5F3FF',
                        border: `1px solid ${service?.borderColor || '#DDD6FE'}`,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: service?.color || '#7C3AED',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <ServiceIcon size={12} />
                      <span>{service?.shortName || service?.name || 'Boost'}</span>
                    </div>
                  </td>

                  {/* 4. Title / Requirement */}
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: '#111827',
                        lineHeight: 1.3,
                        marginBottom: '2px',
                      }}
                    >
                      {req.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '260px',
                      }}
                    >
                      {req.description || 'Sprint deliverables requirement'}
                    </div>
                  </td>

                  {/* 5. Priority */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: priorityCfg?.bg || '#F3F4F6',
                        color: priorityCfg?.color || '#6B7280',
                        border: `1px solid ${priorityCfg?.border || '#E5E7EB'}`,
                      }}
                    >
                      {priorityCfg?.label || req.priority}
                    </span>
                  </td>

                  {/* 6. Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: statusCfg?.bg || '#F3F4F6',
                        color: statusCfg?.color || '#4B5563',
                        border: `1px solid ${statusCfg?.border || '#E5E7EB'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: statusCfg?.color || '#6B7280',
                        }}
                      />
                      {statusCfg?.label || req.status}
                    </span>
                  </td>

                  {/* 7. Assigned Specialist */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
                      {req.assignedTo || 'Unassigned'}
                    </div>
                  </td>

                  {/* 8. Created Date */}
                  <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {formatBoostDate(req.createdAt)}
                  </td>

                  {/* 9. Last Updated */}
                  <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {formatBoostDate(req.updatedAt)}
                  </td>

                  {/* 10. Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectRequest) onSelectRequest(req);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#F5F3FF',
                        border: '1px solid #DDD6FE',
                        color: '#7C3AED',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7C3AED';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F5F3FF';
                        e.currentTarget.style.color = '#7C3AED';
                      }}
                    >
                      <span>Open</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
