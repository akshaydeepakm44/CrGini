import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Compass,
  PenTool,
  Image,
  Video,
  Sparkles,
  Target,
  Code2,
  MessageSquare
} from 'lucide-react';
import { BOOST_SERVICES } from '../data/boostServiceData';
import BoostRequestTable from '../components/BoostRequestTable';
import BoostRequestFilters from '../components/BoostRequestFilters';
import SyncQueueButton from '../../../components/common/SyncQueueButton';

export default function BoostDashboardPage({
  requests = [],
  metrics = {},
  onNavigate,
  loading = false,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt = null,
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterService, setFilterService] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    newRequests: requests.filter((r) => ['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)).length,
    inProgress: requests.filter((r) => ['IN_PROGRESS', 'ASSIGNED', 'UNDER_REVIEW'].includes(r.status)).length,
    clientReview: requests.filter((r) => ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)).length,
    changesRequested: requests.filter((r) => r.status === 'CHANGES_REQUESTED').length,
    completed: requests.filter((r) => ['COMPLETED', 'APPROVED'].includes(r.status)).length,
    clientInquiries: inquiryRequests.length,
  };

  // Calculate live breakdown for each boost service discipline directly from requests
  const liveServiceStats = {};
  BOOST_SERVICES.forEach((s) => {
    const sReqs = requests.filter((r) => r.serviceSlug === s.slug);
    liveServiceStats[s.slug] = {
      total: sReqs.length,
      active: sReqs.filter((r) => ['IN_PROGRESS', 'ASSIGNED', 'UNDER_REVIEW', 'REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)).length,
      completed: sReqs.filter((r) => ['COMPLETED', 'APPROVED'].includes(r.status)).length,
    };
  });

  // Operational metrics cards
  const metricCards = [
    {
      id: 'NEW',
      label: 'New Requests',
      value: liveMetrics.newRequests,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: Inbox,
      onClick: () => setFilterStatus(filterStatus === 'NEW' ? 'ALL' : 'NEW')
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      value: liveMetrics.inProgress,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      icon: Clock,
      onClick: () => setFilterStatus(filterStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')
    },
    {
      id: 'CLIENT_REVIEW',
      label: 'Client Review',
      value: liveMetrics.clientReview,
      color: '#DB2777',
      bg: '#FDF2F8',
      border: '#FBCFE8',
      icon: FileText,
      onClick: () => setFilterStatus(filterStatus === 'CLIENT_REVIEW' ? 'ALL' : 'CLIENT_REVIEW')
    },
    {
      id: 'CHANGES_REQUESTED',
      label: 'Changes Requested',
      value: liveMetrics.changesRequested,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      icon: AlertCircle,
      onClick: () => setFilterStatus(filterStatus === 'CHANGES_REQUESTED' ? 'ALL' : 'CHANGES_REQUESTED')
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      value: liveMetrics.completed,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      icon: CheckCircle2,
      onClick: () => setFilterStatus(filterStatus === 'COMPLETED' ? 'ALL' : 'COMPLETED')
    },
    {
      id: 'MESSAGES',
      label: 'Client Messages',
      value: liveMetrics.clientInquiries,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      icon: MessageSquare,
      onClick: () => onNavigate('/boost/messages')
    }
  ];

  // Filter requests for the table
  const filteredRequests = requests.filter((r) => {
    // Status
    if (filterStatus === 'NEW' && !['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)) return false;
    if (filterStatus === 'ASSIGNED' && r.status !== 'ASSIGNED') return false;
    if (filterStatus === 'IN_PROGRESS' && !['IN_PROGRESS', 'UNDER_REVIEW'].includes(r.status)) return false;
    if (filterStatus === 'CLIENT_REVIEW' && !['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)) return false;
    if (filterStatus === 'CHANGES_REQUESTED' && r.status !== 'CHANGES_REQUESTED') return false;
    if (filterStatus === 'COMPLETED' && !['COMPLETED', 'APPROVED'].includes(r.status)) return false;

    // Service
    if (filterService !== 'ALL' && r.serviceSlug !== filterService) return false;

    // Priority
    if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = r.ticketId?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchClient = r.clientCompany?.toLowerCase().includes(q) || r.clientName?.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      if (!matchTicket && !matchTitle && !matchClient && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Boost Service
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6B7280',
              margin: '6px 0 0',
            }}
          >
            Manage creative, strategic and growth requests across the Boost team.
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
            onClick={() => onNavigate('/boost/requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)',
            }}
          >
            <Inbox size={15} />
            <span>View Full Queue ({requests.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {metricCards.map((card, idx) => {
          const CardIcon = card.icon;
          const isActive = filterStatus === card.id;

          return (
            <div
              key={idx}
              onClick={card.onClick}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: isActive ? `2px solid ${card.color}` : '1px solid #E5E7EB',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 4px 14px ${card.color}26` : '0 1px 2px rgba(0, 0, 0, 0.04)',
                transform: isActive ? 'translateY(-2px)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                }
              }}
              title={`Click to filter queue by ${card.label}`}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: card.bg,
                  border: `1px solid ${card.border}`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CardIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280', marginTop: '4px' }}>
                  {card.label}
                </div>
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
                  Live client communication threads across active growth sprints
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/boost/messages')}
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
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827' }}>
                          {ticket.clientCompany || ticket.clientName}
                        </span>
                      </div>

                      {isClientSender ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6D28D9', backgroundColor: '#EDE9FE', padding: '2px 8px', borderRadius: '999px' }}>
                          Client Replied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4B5563', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '999px' }}>
                          Boost Specialist
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        backgroundColor: isClientSender ? '#FAF5FF' : '#F9FAFB',
                        border: `1px solid ${isClientSender ? '#EDE9FE' : '#F3F4F6'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.72rem', color: '#6B7280' }}>
                        <span style={{ fontWeight: 700, color: isClientSender ? '#7C3AED' : '#4B5563' }}>
                          {ticket.latestMessage?.senderName || 'Client'}
                        </span>
                        <span>{ticket.latestMessage?.createdAt ? new Date(ticket.latestMessage.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#111827', lineHeight: 1.4, wordBreak: 'break-word', fontStyle: 'italic' }}>
                        "{ticket.latestMessage?.text}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate('/boost/messages')}
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
                      onClick={() => onNavigate(`/boost/requests/${ticket.ticketId || ticket.id}`)}
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

      {/* 3. Service Mix Section (Section 10) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Boost Service Workload Distribution
            </h2>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
              Operational breakdown across all active creative and strategic disciplines
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {BOOST_SERVICES.map((s) => {
            const SIcon = s.icon;
            const stats = liveServiceStats[s.slug] || metrics.serviceStats?.[s.slug] || { total: 0, active: 0, review: 0, completed: 0 };
            return (
              <div
                key={s.slug}
                onClick={() => onNavigate(`/boost/${s.slug}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: s.bgColor,
                        border: `1px solid ${s.borderColor}`,
                        color: s.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SIcon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                        {s.categoryLabel}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#9CA3AF" />
                </div>

                {/* Metrics Pill Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #F3F4F6',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: '#374151', fontWeight: 600 }}>
                    <strong style={{ color: '#111827' }}>{stats.total}</strong> total
                  </span>
                  <span style={{ color: '#9CA3AF' }}>•</span>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>
                    <strong>{stats.active}</strong> active
                  </span>
                  <span style={{ color: '#9CA3AF' }}>•</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>
                    <strong>{stats.completed}</strong> done
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Operational Request Queue (Section 9) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Live Request Queue
            </h2>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
              Real-time operational tickets across all Boost services
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <BoostRequestFilters
          activeStatus={filterStatus}
          onStatusChange={setFilterStatus}
          activeService={filterService}
          onServiceChange={setFilterService}
          activePriority={filterPriority}
          onPriorityChange={setFilterPriority}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          metrics={metrics}
        />

        {/* Request Table */}
        <BoostRequestTable
          requests={filteredRequests}
          onSelectRequest={(req) => onNavigate(`/boost/requests/${req.ticketId || req.id}`)}
          emptyMessage="No Boost requests matching current filters"
        />
      </div>
    </div>
  );
}
