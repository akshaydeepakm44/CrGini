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
  const activeRequestsList = requests.filter(
    (r) => !['COMPLETED', 'APPROVED', 'CANCELLED'].includes(String(r.status).toUpperCase())
  );
  const completedList = requests.filter(
    (r) => ['COMPLETED', 'APPROVED'].includes(String(r.status).toUpperCase())
  );
  const totalDeliverablesCount = deliverables.length > 0
    ? deliverables.length
    : requests.reduce((acc, r) => acc + (r.submissions?.length || 0), 0);
  const pendingPaymentsCount = requests.filter(
    (r) => String(r.paymentStatus || r.payment_status).toUpperCase() === 'PENDING'
  ).length;

  const liveMetrics = {
    activeRequests: activeRequestsList.length,
    completed: completedList.length,
    verifiedDeliverables: totalDeliverablesCount,
    pendingPayments: pendingPaymentsCount,
  };

  // Greeting based on client local time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const displayRequests = activeRequestsList.length > 0 ? activeRequestsList.slice(0, 5) : requests.slice(0, 5);
  const recentDeliverablesList = deliverables.slice(0, 4);

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
          trend={liveMetrics.activeRequests > 0 ? `${liveMetrics.activeRequests} in queue` : 'In specialist queues'}
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
          label="Recent Deliverables"
          icon={ShieldCheck}
          variant="blue"
          trend={liveMetrics.verifiedDeliverables > 0 ? `${liveMetrics.verifiedDeliverables} ready for review` : 'Human QA verified'}
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
            servicesList={['Strategic Planner', 'Content Creator', 'DevRel & Technical Advocacy', 'GTM Strategy']}
            onExplore={() => onNavigate && onNavigate('/portal/boosting')}
          />

          <ServiceChannelCard
            channel="digitalising"
            title="DIGITALISING"
            description="Research, insights and business intelligence prepared by the specialist team."
            servicesList={['Lead Research', 'Company Study', 'Key People Research', 'Pitch Support']}
            onExplore={() => onNavigate && onNavigate('/portal/digitalising')}
          />

          <ServiceChannelCard
            channel="design"
            title="UI / DESIGN"
            description="Professional interface design, heuristic audits, and design system engineering."
            servicesList={['UI/UX Audit', 'Figma Project', 'Redesign Request', 'Design Systems']}
            onExplore={() => onNavigate && onNavigate('/portal/design')}
          />

          <ServiceChannelCard
            channel="development"
            title="APP DEVELOPMENT"
            description="Turnkey full-stack web applications, mobile apps, and scalable API systems."
            servicesList={['Web Application MVP', 'Mobile App Development', 'API & Backend Systems']}
            onExplore={() => onNavigate && onNavigate('/portal/development')}
          />
        </div>
      </div>

      {/* ============================================================
          SECTION C, D & F: ACTIVE SPRINT ACTIVITY (3 BALANCED CARDS)
          ============================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* CARD 1: ACTIVE REQUESTS */}
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
            minHeight: '380px',
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
                  {activeRequestsList.length} sprint{activeRequestsList.length !== 1 ? 's' : ''} currently in progress
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
                {displayRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => onViewRequest && onViewRequest(req)}
                    style={{
                      padding: '12px 14px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          backgroundColor: '#EDE9FE',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {req.ticketId}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.84375rem',
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {req.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <span style={{ color: req.channel === 'Boosting' ? '#BE185D' : req.channel === 'UI / Design' ? '#9333EA' : req.channel === 'App Development' ? '#059669' : '#0369A1', fontWeight: 600 }}>
                            {req.channel}
                          </span>
                          <span>•</span>
                          <span>{req.updatedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                      <StatusBadge status={req.status} size="sm" />
                      <ArrowRight size={13} color="#9CA3AF" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {displayRequests.length > 0 && (
            <div style={{ paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Showing top active tickets
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/portal/requests')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cg-purple-600, #7C3AED)',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>All Requests ({requests.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* CARD 2: RECENT DELIVERABLES */}
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
            minHeight: '380px',
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
                  {deliverables.length} verified asset{deliverables.length !== 1 ? 's' : ''} available
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentDeliverablesList.slice(0, 3).map((del) => (
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

          {deliverables.length > 0 && (
            <div style={{ paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                QA-checked outputs
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/portal/deliverables')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284C7',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Browse Deliverables Hub</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* CARD 3: SPECIALIST UPDATES & SUPPORT */}
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
            minHeight: '380px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: 'var(--cg-text-primary, #111827)',
                      margin: 0,
                    }}
                  >
                    Specialist Updates
                  </h3>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      padding: '1px 7px',
                      borderRadius: '9999px',
                      border: '1px solid #A7F3D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                    Pod Active
                  </span>
                </div>
                <span style={{ fontSize: '0.78125rem', color: '#6B7280' }}>
                  Direct conversation threads &amp; sprint check-ins
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/portal/messages')}
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
                <span>Open Chat</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentConversations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentConversations.slice(0, 3).map((req) => {
                  const isClientLast =
                    req.latestMessage?.senderRole === 'USER' ||
                    req.latestMessage?.sender_role === 'USER';
                  return (
                    <div
                      key={req.id}
                      onClick={() => onNavigate && onNavigate('/portal/messages')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #F3F4F6',
                        backgroundColor: '#FAFAFC',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            color: '#7C3AED',
                            backgroundColor: '#EDE9FE',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {req.ticketId}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          {req.latestMessage?.createdAt ? new Date(req.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.78125rem',
                          color: '#374151',
                          lineHeight: 1.35,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isClientLast ? '#6B7280' : '#7C3AED' }}>
                          {isClientLast ? 'You: ' : 'Specialist: '}
                        </span>
                        "{req.latestMessage?.text || 'Review updated.'}"
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '28px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#FAF5FF',
                  border: '1px dashed #DDD4FA',
                  textAlign: 'center',
                }}
              >
                <MessageSquare size={26} color="#7C3AED" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1F2937', marginBottom: '4px' }}>
                  Direct Specialist Pod Access
                </div>
                <p style={{ fontSize: '0.78125rem', color: '#6B7280', margin: '0 0 14px', lineHeight: 1.4 }}>
                  Have questions about your sprint requirements or scope adjustments? Connect directly with your assigned specialist team.
                </p>
                <Button variant="primary" size="sm" onClick={() => onNavigate && onNavigate('/portal/messages')}>
                  Message Specialists
                </Button>
              </div>
            )}
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Average response: &lt;1 hour
            </span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/portal/messages')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--cg-purple-600, #7C3AED)',
                fontSize: '0.78125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Chat Channels</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
