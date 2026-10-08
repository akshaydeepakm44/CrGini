import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  FileText,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';
import RequestQueueTable from '../components/RequestQueueTable';
import SyncQueueButton from '../../../components/common/SyncQueueButton';
import { formatDateTime } from '../data/leadAdapters';

export default function LeadDashboardPage({
  requests = [],
  metrics = {},
  onNavigate,
  loading = false,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt = null,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'IN_PROGRESS' | 'CLIENT_REVIEW' | 'COMPLETED' | 'INQUIRIES'

  const activeRequests = useMemo(
    () => requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'),
    [requests]
  );
  const urgentRequests = useMemo(
    () => requests.filter((r) => r.priority === 'URGENT' || r.priority === 'HIGH'),
    [requests]
  );

  // Tickets that have active messages/inquiries
  const inquiryRequests = useMemo(
    () =>
      requests
        .filter((r) => (r.messageCount && r.messageCount > 0) || r.latestMessage)
        .sort((a, b) => {
          const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
          const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
    [requests]
  );

  // Accurate real-time calculations directly from live request records
  const newRequestsList = useMemo(
    () => requests.filter((r) => ['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)),
    [requests]
  );
  const inProgressList = useMemo(
    () => requests.filter((r) => ['IN_PROGRESS', 'ASSIGNED', 'UNDER_REVIEW'].includes(r.status)),
    [requests]
  );
  const clientReviewList = useMemo(
    () => requests.filter((r) => ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED', 'CHANGES_REQUESTED'].includes(r.status)),
    [requests]
  );
  const completedList = useMemo(
    () => requests.filter((r) => ['COMPLETED', 'APPROVED'].includes(r.status)),
    [requests]
  );

  const liveMetrics = {
    newRequests: newRequestsList.length,
    inProgress: inProgressList.length,
    clientReview: clientReviewList.length,
    completed: completedList.length,
    clientInquiries: inquiryRequests.length,
  };

  const metricCards = [
    {
      id: 'NEW',
      label: 'New Requests',
      value: liveMetrics.newRequests,
      sub: 'Awaiting triage & assignment',
      icon: Inbox,
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      targetTab: 'NEW',
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      value: liveMetrics.inProgress,
      sub: 'Active research execution',
      icon: Clock,
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      targetTab: 'IN_PROGRESS',
    },
    {
      id: 'CLIENT_REVIEW',
      label: 'Client Review',
      value: liveMetrics.clientReview,
      sub: 'Deliverables pending approval',
      icon: AlertCircle,
      color: '#EC4899',
      bg: '#FDF2F8',
      border: '#FBCFE8',
      targetTab: 'CLIENT_REVIEW',
    },
    {
      id: 'COMPLETED',
      label: 'Completed Sprints',
      value: liveMetrics.completed,
      sub: 'Approved & delivered',
      icon: CheckCircle2,
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      targetTab: 'COMPLETED',
    },
    {
      id: 'INQUIRIES',
      label: 'Client Inquiries',
      value: liveMetrics.clientInquiries,
      sub: liveMetrics.clientInquiries > 0 ? 'Client messages waiting' : 'All messages up to date',
      icon: MessageSquare,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD4FA',
      targetTab: 'INQUIRIES',
    },
  ];

  const displayedRequests = useMemo(() => {
    if (activeFilter === 'NEW') return newRequestsList;
    if (activeFilter === 'IN_PROGRESS') return inProgressList;
    if (activeFilter === 'CLIENT_REVIEW') return clientReviewList;
    if (activeFilter === 'COMPLETED') return completedList;
    if (activeFilter === 'INQUIRIES') return inquiryRequests;
    return activeRequests;
  }, [activeFilter, newRequestsList, inProgressList, clientReviewList, completedList, inquiryRequests, activeRequests]);

  const handleCardClick = (card) => {
    if (activeFilter === card.id) {
      setActiveFilter('ALL');
    } else {
      setActiveFilter(card.id);
    }
  };

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Banner with Live Sync Queue Option */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #DDD4FA',
              }}
            >
              Internal Operations Console
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Specialist Research Pod
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Lead Research Workspace
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
            Operational overview: incoming ticket queues, research milestones, client reviews, and account dossiers.
          </p>
        </div>

        {/* Sync Queue Option Above Dashboard */}
        <SyncQueueButton
          onSync={onRefresh}
          isSyncing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
        />
      </div>

      {/* 2. Operational Metrics Cards (Clickable & Real-time Live) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {metricCards.map((card) => {
          const IconComponent = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: isActive ? `2px solid ${card.color}` : '1px solid #E5E7EB',
                padding: '18px 20px',
                boxShadow: isActive ? `0 4px 16px ${card.color}26` : '0 1px 3px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                transform: isActive ? 'translateY(-2px)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = card.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }
              }}
              title={`Click to filter queue by ${card.label}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: isActive ? 800 : 600, color: isActive ? card.color : '#6B7280' }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent size={16} />
                </div>
              </div>

              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  {card.sub}
                </span>
                {isActive && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: card.color, backgroundColor: card.bg, padding: '1px 6px', borderRadius: '4px' }}>
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2.5 Recent Client Inquiries & Active Communications */}
      {inquiryRequests.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
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
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                  Recent Client Messages & Inquiries ({inquiryRequests.length})
                </h2>
                <p style={{ margin: '1px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
                  Live client communication threads across research tickets
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/lead/messages')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #DDD6FE',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                fontSize: '0.78125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>Open All Threads</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
                    border: isClientSender ? '1px solid #DDD6FE' : '1px solid #E5E7EB',
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
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
                        <span
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#111827',
                          }}
                        >
                          {ticket.clientCompany || ticket.clientName}
                        </span>
                      </div>

                      {isClientSender ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#6D28D9',
                            backgroundColor: '#EDE9FE',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          Client Replied
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#4B5563',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          Specialist Update
                        </span>
                      )}
                    </div>

                    {/* Message snippet box */}
                    <div
                      style={{
                        backgroundColor: isClientSender ? '#FAF5FF' : '#F9FAFB',
                        border: `1px solid ${isClientSender ? '#EDE9FE' : '#F3F4F6'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          fontSize: '0.72rem',
                          color: '#6B7280',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isClientSender ? '#7C3AED' : '#4B5563' }}>
                          {ticket.latestMessage?.senderName || 'Client'}
                        </span>
                        <span>{formatDateTime(ticket.latestMessage?.createdAt)}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: '#1F2937',
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                          fontStyle: 'italic',
                        }}
                      >
                        "{ticket.latestMessage?.text}"
                      </div>
                    </div>
                  </div>

                  {/* Quick navigation actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/lead/messages/${ticket.ticketId}`)}
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
                      onClick={() => onNavigate(`/lead/research/${ticket.ticketId}`)}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        fontSize: '0.78125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Active Request Queue Table (Dynamically Filtered by Clicked Metric Card) */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                {activeFilter === 'ALL'
                  ? 'Incoming & Active Research Queue'
                  : `${metricCards.find((c) => c.id === activeFilter)?.label || 'Filtered'} Queue`}
              </h2>
              {activeFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                  title="Reset filter and view all active research sprints"
                >
                  ✕ Clear Filter (Show All)
                </button>
              )}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
              Showing {displayedRequests.length} {activeFilter === 'ALL' ? 'active tickets' : 'filtered tickets'} • Click any metric card above to filter or click a row to open workspace
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeFilter !== 'ALL' && activeFilter !== 'INQUIRIES' && (
              <button
                type="button"
                onClick={() => onNavigate(`/lead/requests?tab=${activeFilter}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #C4B5FD',
                  backgroundColor: '#FAF5FF',
                  color: '#7C3AED',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>Navigate to {activeFilter} Tab</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('/lead/requests')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#4B5563',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>View Full Queue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <RequestQueueTable
          requests={displayedRequests.slice(0, 20)}
          onSelectRequest={(ticketId) => onNavigate(`/lead/research/${ticketId}`)}
          onOpenWorkspace={(ticketId) => onNavigate(`/lead/research/${ticketId}`)}
          loading={loading}
        />
      </div>
    </div>
  );
}
