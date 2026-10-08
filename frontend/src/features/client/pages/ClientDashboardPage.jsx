import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import MetricCard from '../../../components/cards/MetricCard';
import ServiceChannelCard from '../../../components/cards/ServiceChannelCard';
import DeliverableCard from '../../../components/cards/DeliverableCard';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import SyncQueueButton from '../../../components/common/SyncQueueButton';

export default function ClientDashboardPage({
  user,
  company,
  metrics = {},
  requests = [],
  deliverables = [],
  onNavigate,
  onOpenNewRequest,
  onViewRequest,
  onViewDeliverable,
  onRefresh,
  isRefreshing = false,
  lastSyncedAt = null,
}) {
  const userName = user?.name || 'Partner';
  const companyName = company?.name || user?.companyName || 'Your Organization';

  // Live accurate metrics calculated directly from in-memory requests and deliverables
  const liveMetrics = {
    activeRequests: requests.filter((r) => !['COMPLETED', 'APPROVED', 'CANCELLED'].includes(r.status)).length,
    completed: requests.filter((r) => ['COMPLETED', 'APPROVED'].includes(r.status)).length,
    verifiedDeliverables: deliverables.filter((d) => d.status === 'APPROVED' || d.status === 'VERIFIED' || d.verified).length,
    pendingPayments: requests.filter((r) => r.paymentStatus === 'PENDING' || r.payment_status === 'PENDING').length,
  };

  // Greeting based on client local time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Active requests (in progress / client review / submitted)
  const activeRequestsList = requests.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'APPROVED'
  );
  const displayRequests = activeRequestsList.length > 0 ? activeRequestsList.slice(0, 5) : requests.slice(0, 5);

  // Recent deliverables (up to 3)
  const recentDeliverablesList = deliverables.slice(0, 3);

  // Recent ticket communications with latest messages
  const recentConversations = requests
    .filter((r) => (r.messageCount && r.messageCount > 0) || r.latestMessage)
    .sort((a, b) => {
      const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ============================================================
          SECTION A: WELCOME SECTION
          ============================================================ */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--cg-purple-600, #7C3AED)',
                backgroundColor: 'var(--cg-purple-50, #FAF5FF)',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid var(--cg-purple-100, #EDE9FE)',
              }}
            >
              {companyName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>Client Portal</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--cg-text-primary, #111827)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {greeting}, {userName}
          </h1>

          <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
            Here's an overview of your CreativeGini activities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SyncQueueButton
            onSync={onRefresh}
            isSyncing={isRefreshing}
            lastSyncedAt={lastSyncedAt}
          />
          <Button
            variant="primary"
            size="md"
            iconLeft={Plus}
            onClick={() => onOpenNewRequest && onOpenNewRequest()}
          >
            Request Sprints
          </Button>
        </div>
      </div>

      {/* ============================================================
          SECTION B: ACCOUNT / REQUEST METRICS
          ============================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '18px',
          marginBottom: '36px',
        }}
      >
        <MetricCard
          value={liveMetrics.activeRequests}
          label="Active Requests"
          icon={Clock}
          variant="lavender"
          trend="In specialist queues"
          trendDirection="neutral"
          onClick={() => onNavigate && onNavigate('/portal/requests')}
        />

        <MetricCard
          value={liveMetrics.completed}
          label="Completed"
          icon={CheckCircle2}
          variant="mint"
          trend="Delivered to date"
          trendDirection="up"
          onClick={() => onNavigate && onNavigate('/portal/requests')}
        />

        <MetricCard
          value={liveMetrics.verifiedDeliverables}
          label="Verified Deliverables"
          icon={ShieldCheck}
          variant="blue"
          trend="Human QA verified"
          trendDirection="up"
          onClick={() => onNavigate && onNavigate('/portal/deliverables')}
        />

        <MetricCard
          value={liveMetrics.pendingPayments}
          label="Pending Payments"
          icon={CreditCard}
          variant="coral"
          trend={liveMetrics.pendingPayments > 0 ? 'Action required' : 'All accounts settled'}
          trendDirection={liveMetrics.pendingPayments > 0 ? 'down' : 'up'}
          onClick={() => onNavigate && onNavigate('/portal/billing')}
        />
      </div>

      {/* ============================================================
          SECTION E: QUICK SERVICE CHANNELS (PROMINENT CARDS)
          ============================================================ */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--cg-text-primary, #111827)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Service Channels
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.84375rem', color: 'var(--cg-text-secondary, #6B7280)' }}>
              Turnkey specialist capabilities aligned to your business growth objectives
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <ServiceChannelCard
            channel="boosting"
            title="BOOSTING"
            description="Grow your brand, content and market presence with specialist campaigns."
            servicesList={['Strategic Planner', 'Content Creator', 'DevRel & Technical Advocacy']}
            onExplore={() => onNavigate && onNavigate('/portal/boosting')}
          />

          <ServiceChannelCard
            channel="digitalising"
            title="DIGITALISING"
            description="Research, insights and business intelligence prepared by the specialist team."
            servicesList={['Lead Research', 'Company Study', 'Key People Research', 'Pitch Support']}
            onExplore={() => onNavigate && onNavigate('/portal/digitalising')}
          />
        </div>
      </div>

      {/* ============================================================
          SECTION C & D: ACTIVE REQUESTS & RECENT DELIVERABLES GRID
          ============================================================ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* SECTION C: ACTIVE REQUESTS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--cg-radius-xl, 20px)',
            border: '1px solid var(--cg-border-light, #E5E7EB)',
            padding: '24px',
            boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--cg-text-primary, #111827)',
                    margin: 0,
                  }}
                >
                  Active Requests
                </h3>
                <span style={{ fontSize: '0.78125rem', color: '#6B7280' }}>
                  {activeRequestsList.length} sprints currently in progress
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/portal/requests')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cg-purple-600, #7C3AED)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {displayRequests.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  backgroundColor: '#FAF5FF',
                  border: '1px dashed #DDD4FA',
                }}
              >
                <Clock size={28} color="#7C3AED" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.90625rem', color: '#1F2937', marginBottom: '4px' }}>
                  No Active Requests
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 14px' }}>
                  Ready to launch your first sprint? Choose a service channel to begin.
                </p>
                <Button variant="primary" size="sm" onClick={() => onOpenNewRequest && onOpenNewRequest()}>
                  Request First Sprint
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => onViewRequest && onViewRequest(req)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #F3F4F6',
                      backgroundColor: '#FAFAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#DDD4FA';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FAFAFC';
                      e.currentTarget.style.borderColor = '#F3F4F6';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          backgroundColor: '#EDE9FE',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.ticketId}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                          {req.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span>{req.service}</span>
                          <span>•</span>
                          <span style={{ color: req.channel === 'Boosting' ? '#BE185D' : '#0369A1', fontWeight: 600 }}>
                            {req.channel}
                          </span>
                          <span>•</span>
                          <span>Updated {req.updatedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StatusBadge status={req.status} size="sm" />
                      <ArrowRight size={14} color="#9CA3AF" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION D: RECENT DELIVERABLES */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--cg-radius-xl, 20px)',
            border: '1px solid var(--cg-border-light, #E5E7EB)',
            padding: '24px',
            boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--cg-text-primary, #111827)',
                    margin: 0,
                  }}
                >
                  Recent Deliverables
                </h3>
                <span style={{ fontSize: '0.78125rem', color: '#6B7280' }}>
                  Hand-verified research and assets ready for review
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/portal/deliverables')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cg-purple-600, #7C3AED)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentDeliverablesList.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  backgroundColor: '#F0F9FF',
                  border: '1px dashed #BAE6FD',
                }}
              >
                <Package size={28} color="#0284C7" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.90625rem', color: '#1F2937', marginBottom: '4px' }}>
                  No Deliverables Yet
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0' }}>
                  When specialists complete drafts and verified dossiers, they will appear here with live preview &amp; approval actions.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentDeliverablesList.map((del) => (
                  <DeliverableCard
                    key={del.id}
                    title={del.title}
                    ticketId={del.ticketId}
                    service={del.service}
                    version={del.version}
                    status={del.status}
                    date={del.date}
                    fileType={del.fileType}
                    onView={() => onViewDeliverable && onViewDeliverable(del)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION F: RECENT COMMUNICATIONS & SPECIALIST REPLIES
          ============================================================ */}
      {recentConversations.length > 0 && (
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#7C3AED" />
                <h2
                  style={{
                    fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--cg-text-primary, #111827)',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Recent Communications & Specialist Updates
                </h2>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84375rem', color: 'var(--cg-text-secondary, #6B7280)' }}>
                Direct conversation threads and status check-ins with your assigned specialists
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/portal/messages')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cg-purple-600, #7C3AED)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Open Chat Channels</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {recentConversations.slice(0, 3).map((req) => {
              const isClientLast =
                req.latestMessage?.senderRole === 'USER' ||
                req.latestMessage?.sender_role === 'USER';
              return (
                <div
                  key={req.id}
                  onClick={() => onNavigate && onNavigate('/portal/messages')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '18px 20px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#7C3AED';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.78125rem',
                          color: '#7C3AED',
                          backgroundColor: '#F5F3FF',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #DDD4FA',
                        }}
                      >
                        {req.ticketId}
                      </span>

                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                        {req.latestMessage?.createdAt ? new Date(req.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', marginBottom: '6px' }}>
                      {req.title}
                    </div>

                    <div
                      style={{
                        backgroundColor: isClientLast ? '#F9FAFB' : '#FAF5FF',
                        border: `1px solid ${isClientLast ? '#E5E7EB' : '#DDD4FA'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '0.8125rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isClientLast ? '#6B7280' : '#7C3AED', marginBottom: '2px' }}>
                        {isClientLast ? 'You sent:' : `${req.latestMessage?.senderName || 'Specialist'} replied:`}
                      </div>
                      <div style={{ color: '#374151', fontStyle: 'italic', wordBreak: 'break-word' }}>
                        "{req.latestMessage?.text}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
                      {req.messageCount} message{req.messageCount > 1 ? 's' : ''} in thread
                    </span>
                    <span style={{ fontSize: '0.78125rem', color: '#7C3AED', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Reply</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
