import React from 'react';
import {
  Building,
  User,
  ArrowRight,
  Clock,
  PenTool,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatDesignDate } from '../data/designAdapters';

export default function DesignRequestTable({ requests = [], onSelectRequest }) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '12px 18px', width: '110px' }}>Ticket</th>
              <th style={{ padding: '12px 18px' }}>Client</th>
              <th style={{ padding: '12px 18px', width: '150px' }}>Service</th>
              <th style={{ padding: '12px 18px' }}>Title</th>
              <th style={{ padding: '12px 18px', width: '130px' }}>Status</th>
              <th style={{ padding: '12px 18px', width: '100px' }}>Priority</th>
              <th style={{ padding: '12px 18px', width: '160px' }}>Specialist</th>
              <th style={{ padding: '12px 18px', width: '110px' }}>Date</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => {
              const ServiceIcon = req.service?.icon || PenTool;
              const statusCfg = req.statusConfig;
              const priorityCfg = req.priorityConfig;
              const isEven = idx % 2 === 0;

              return (
                <tr
                  key={req.id || req.ticketId}
                  onClick={() => onSelectRequest && onSelectRequest(req)}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: isEven ? '#FFFFFF' : '#FBFDFE',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F9FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isEven ? '#FFFFFF' : '#FBFDFE')}
                >
                  {/* Ticket Code */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: '#0F172A',
                        backgroundColor: '#F1F5F9',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {req.ticketId}
                    </span>
                  </td>

                  {/* Client */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                        {req.clientCompany}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {req.clientName}
                      </span>
                    </div>
                  </td>

                  {/* Service Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: req.service?.color || '#0284C7',
                        backgroundColor: req.service?.bgColor || '#F0F9FF',
                        border: `1px solid ${req.service?.borderColor || '#BAE6FD'}`,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <ServiceIcon size={12} />
                      {req.service?.shortName || req.service?.name}
                    </span>
                  </td>

                  {/* Title */}
                  <td style={{ padding: '14px 18px' }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        maxWidth: '300px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={req.title}
                    >
                      {req.title}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: statusCfg.color,
                        backgroundColor: statusCfg.bg,
                        border: `1px solid ${statusCfg.border}`,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: priorityCfg.color,
                        backgroundColor: priorityCfg.bg,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      {priorityCfg.label}
                    </span>
                  </td>

                  {/* Specialist */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#475569' }}>
                      <User size={13} style={{ color: '#94A3B8' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                        {req.assignedTo}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {formatDesignDate(req.createdAt)}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <span
                      style={{
                        color: '#0284C7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: '#F0F9FF',
                      }}
                    >
                      <ChevronRight size={16} />
                    </span>
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
