import React from 'react';
import {
  Inbox,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  PenTool,
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  Building,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import DesignRequestCard from '../components/DesignRequestCard';
import { DESIGN_SERVICES } from '../data/designServiceData';
import { formatDesignDate } from '../data/designAdapters';
import SyncQueueButton from '../../../components/common/SyncQueueButton';

export default function DesignDashboardPage({
  requests = [],
  metrics = {},
  user,
  onNavigate,
  onSelectRequest,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt = null,
}) {
  // Tickets that have active messages/inquiries
  const inquiryRequests = requests
    .filter((r) => (r.messageCount && r.messageCount > 0) || r.latestMessage)
    .sort((a, b) => {
      const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  // Calculate accurate live metrics directly from requests
  const liveMetrics = {
    total: requests.length,
    newRequests: requests.filter((r) => ['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)).length,
    assignedToMe: requests.filter((r) => user?.id && (String(r.assignedToId) === String(user.id) || (typeof r.assignedTo === 'string' && r.assignedTo.toLowerCase().includes('me')))).length,
    inProgress: requests.filter((r) => ['IN_PROGRESS', 'ASSIGNED', 'UNDER_REVIEW'].includes(r.status)).length,
    clientReview: requests.filter((r) => ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)).length,
    changesRequested: requests.filter((r) => r.status === 'CHANGES_REQUESTED').length,
    completed: requests.filter((r) => ['COMPLETED', 'APPROVED'].includes(r.status)).length,
    clientMessages: inquiryRequests.length,
  };

  // Calculate live breakdown for each design discipline
  const liveServiceStats = {};
  DESIGN_SERVICES.forEach((s) => {
    liveServiceStats[s.slug] = requests.filter((r) => {
      const matchSlug = r.serviceSlug === s.slug;
      const matchSub = (r.subService || '').toLowerCase().replace(/_/g, '-') === s.slug;
      return matchSlug || matchSub;
    }).length;
  });

  // Operational metrics cards
  const metricCards = [
    {
      label: 'New Requests',
      value: liveMetrics.newRequests,
      icon: Inbox,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/design/requests/new',
      desc: 'Awaiting triage / assignment',
    },
    {
      label: 'Assigned to Me',
      value: liveMetrics.assignedToMe,
      icon: UserCheck,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      path: '/design/requests/assigned',
      desc: 'Active specialist workload',
    },
    {
      label: 'In Progress',
      value: liveMetrics.inProgress,
      icon: Clock,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      path: '/design/requests/in-progress',
      desc: 'Design / audit sprints active',
    },
    {
      label: 'Client Review',
      value: liveMetrics.clientReview,
      icon: Sparkles,
      color: '#DB2777',
      bg: '#FDF2F8',
      border: '#FBCFE8',
      path: '/design/requests/client-review',
      desc: 'Deliverables submitted to client',
    },
    {
      label: 'Changes Requested',
      value: liveMetrics.changesRequested,
      icon: AlertCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      path: '/design/requests/changes-requested',
      desc: 'Requires design revision',
    },
    {
      label: 'Completed',
      value: liveMetrics.completed,
      icon: CheckCircle2,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      path: '/design/requests/completed',
      desc: 'Approved design deliveries',
    },
    {
      label: 'Client Messages',
      value: liveMetrics.clientMessages,
      icon: MessageSquare,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      path: '/design/messages',
      desc: 'Live client communication',
    },
  ];

  // "My Active Work" items:
  // Shows items assigned to user or currently active in progress / revision
  const myActiveWork = requests.filter((r) => {
    if (['COMPLETED', 'APPROVED', 'CANCELLED'].includes(r.status)) return false;
    if (user?.id && (String(r.assignedToId) === String(user.id) || (typeof r.assignedTo === 'string' && r.assignedTo.toLowerCase().includes('me')))) {
      return true;
    }
    // If not specifically assigned, show active tickets requiring attention
    return ['IN_PROGRESS', 'CHANGES_REQUESTED', 'ASSIGNED'].includes(r.status);
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Dashboard Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            UI / Design Service
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#64748B',
              margin: '6px 0 0',
            }}
          >
            Manage UX audits, Figma projects and redesign requests.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SyncQueueButton
            onSync={onRefresh}
            isSyncing={isRefreshing}
            lastSyncedAt={lastSyncedAt}
          />
          <button
            type="button"
            onClick={() => onNavigate('/design/requests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <span>View All Requests ({liveMetrics.total})</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 2. Operational Metrics Grid (6 cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => onNavigate(card.path)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = card.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px -2px ${card.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: card.bg,
                    color: card.color,
                    border: `1px solid ${card.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}
              >
                {card.value}
              </div>

              <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2.5 Recent Client Inquiries & Active Communications */}
      {inquiryRequests.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquare size={16} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Recent Client Messages & Inquiries ({inquiryRequests.length})
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Direct communication channels on design and UX audit tickets
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/design/messages')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #DDD6FE',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>View All Messages</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '14px',
            }}
          >
            {inquiryRequests.slice(0, 4).map((ticket) => {
              const isClientSender =
                ticket.latestMessage?.senderRole === 'USER' ||
                ticket.latestMessage?.sender_role === 'USER';
              return (
                <div
                  key={ticket.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: isClientSender ? '1px solid #DDD6FE' : '1px solid #E2E8F0',
                    padding: '16px 18px',
                    boxShadow: isClientSender
                      ? '0 2px 8px rgba(124, 58, 237, 0.08)'
                      : '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.8125rem',
                            color: '#7C3AED',
                            backgroundColor: '#F5F3FF',
                            padding: '2px 6px',
                            borderRadius: '6px',
                          }}
                        >
                          {ticket.ticketId}
                        </span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                          {ticket.clientCompany || ticket.clientName}
                        </span>
                      </div>

                      {isClientSender ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6D28D9', backgroundColor: '#EDE9FE', padding: '2px 8px', borderRadius: '999px' }}>
                          Client Replied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
                          Design Pod Update
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        backgroundColor: isClientSender ? '#FAF5FF' : '#F8FAFC',
                        border: `1px solid ${isClientSender ? '#EDE9FE' : '#F1F5F9'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.72rem', color: '#64748B' }}>
                        <span style={{ fontWeight: 700, color: isClientSender ? '#7C3AED' : '#475569' }}>
                          {ticket.latestMessage?.senderName || 'Client'}
                        </span>
                        <span>{formatDesignDate(ticket.latestMessage?.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#1E293B', lineHeight: 1.4, wordBreak: 'break-word', fontStyle: 'italic' }}>
                        "{ticket.latestMessage?.text}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate('/design/messages')}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid #DDD6FE',
                        backgroundColor: '#FAF5FF',
                        color: '#7C3AED',
                        fontSize: '0.78125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>Reply in Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/design/requests/${ticket.ticketId || ticket.id}`)}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#334155',
                        fontSize: '0.78125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>Open Ticket</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Section: "My Active Work" (Prominent requirement) */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              My Active Work
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0' }}>
              What design work do I need to complete today?
            </p>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#F1F5F9',
              color: '#475569',
              padding: '4px 10px',
              borderRadius: '999px',
            }}
          >
            {myActiveWork.length} Active Tasks
          </span>
        </div>

        {myActiveWork.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '36px 24px',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <CheckCircle2 size={32} style={{ color: '#059669', margin: '0 auto 10px' }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
              All caught up! No active tasks pending.
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '0 auto', maxWidth: '380px' }}>
              Check the New Requests queue to pick up new client briefs or review recent submissions.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {myActiveWork.map((req) => (
              <DesignRequestCard
                key={req.id || req.ticketId}
                request={req}
                onClick={() => onSelectRequest && onSelectRequest(req)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Section: Design Disciplines Overview */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Disciplines & Specialized Workspaces
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {DESIGN_SERVICES.map((s) => {
            const Icon = s.icon;
            const count = liveServiceStats[s.slug] ?? (metrics.serviceStats?.[s.slug] || 0);
            return (
              <div
                key={s.slug}
                onClick={() => onNavigate(`/design/${s.category === 'audit' ? 'audits' : s.category === 'figma' ? 'figma' : 'redesigns'}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px -2px ${s.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: s.bgColor,
                        color: s.color,
                        border: `1px solid ${s.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: s.bgColor,
                        color: s.color,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {count} Tickets
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    {s.name}
                  </h3>

                  <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {s.headline}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: s.color,
                  }}
                >
                  <span>Open {s.shortName} Workspace</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
