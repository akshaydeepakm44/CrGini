import React from 'react';
import {
  ArrowRight,
  UserCheck,
  Clock,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatDateTime } from '../data/leadAdapters';

export default function RequestQueueTable({
  requests = [],
  onSelectRequest,
  onOpenWorkspace,
  loading = false,
}) {
  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
        <div style={{ fontSize: '0.875rem' }}>Loading research request queue...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
          No requests in this queue
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '4px' }}>
          New client research tickets will appear here automatically.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ticket ID
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Client / Company
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Service & Title
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned To
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Created
              </th>
              <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => {
              const statusCfg = LEAD_STATUS_CONFIG[req.status] || {
                label: req.status,
                color: '#6B7280',
                bg: '#F3F4F6',
                border: '#E5E7EB',
              };
              const prioCfg = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.MEDIUM;

              return (
                <tr
                  key={req.id || idx}
                  onClick={() => onSelectRequest ? onSelectRequest(req.ticketId || req.id) : (onOpenWorkspace && onOpenWorkspace(req.ticketId || req.id))}
                  style={{
                    borderBottom: idx < requests.length - 1 ? '1px solid #F1F5F9' : 'none',
                    transition: 'background-color 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Ticket ID */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      onClick={() => onSelectRequest && onSelectRequest(req.ticketId)}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#7C3AED',
                        fontSize: '0.84375rem',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: '#F5F3FF',
                      }}
                    >
                      {req.ticketId}
                    </span>
                  </td>

                  {/* Client / Company */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                      {req.clientCompany}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      {req.clientName}
                    </div>
                  </td>

                  {/* Service & Title */}
                  <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                    <div
                      style={{
                        fontSize: '0.84375rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {req.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                        {req.subService ? req.subService.replace('_', ' ') : 'Target Research'}
                      </span>

                      {((req.messageCount && req.messageCount > 0) || req.latestMessage) && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              req.latestMessage?.senderRole === 'USER' || req.latestMessage?.sender_role === 'USER'
                                ? '#FAF5FF'
                                : '#F3F4F6',
                            color:
                              req.latestMessage?.senderRole === 'USER' || req.latestMessage?.sender_role === 'USER'
                                ? '#7C3AED'
                                : '#4B5563',
                            border: `1px solid ${
                              req.latestMessage?.senderRole === 'USER' || req.latestMessage?.sender_role === 'USER'
                                ? '#DDD4FA'
                                : '#E5E7EB'
                            }`,
                          }}
                          title={
                            req.latestMessage
                              ? `Latest from ${req.latestMessage.senderName || 'Client'}: "${req.latestMessage.text}"`
                              : `${req.messageCount} messages`
                          }
                        >
                          <MessageSquare size={11} />
                          <span>{req.messageCount || 1} msg{(req.messageCount || 1) > 1 ? 's' : ''}</span>
                          {(req.latestMessage?.senderRole === 'USER' || req.latestMessage?.sender_role === 'USER') && (
                            <span style={{ color: '#6D28D9' }}>• Client replied</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Specialist */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: req.assignedTo ? '#10B981' : '#F59E0B',
                        }}
                      />
                      <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
                        {typeof req.assignedTo === 'object' ? (req.assignedTo?.name || 'Assigned') : (req.assignedTo || 'Unassigned')}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: statusCfg.color,
                        backgroundColor: statusCfg.bg,
                        border: `1px solid ${statusCfg.border}`,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#6B7280' }}>
                    {formatDateTime(req.createdAt)}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', color: '#9CA3AF' }}>
                      <ChevronRight size={18} />
                    </div>
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
