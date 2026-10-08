import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Search,
  Rocket,
  Target,
  Palette,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../services/api';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import { formatDateTime } from '../utils/clientAdapters';

/**
 * Derives dedicated channel metadata and chat naming for each ticket
 */
function getChatMeta(req) {
  if (!req) {
    return {
      channelKey: 'boost',
      channelName: 'Growth Boosting',
      teamTitle: 'Growth Boosting Team',
      specialistName: 'Growth Boosting Specialist',
      specialistEmail: 'boost@creativegini.com',
      chatTitle: 'Chat with Boosting Team',
      badgeColor: '#2563EB',
      badgeBg: '#EFF6FF',
      badgeBorder: '#BFDBFE',
      icon: Rocket,
    };
  }

  const st = req.serviceType || req.service_type;
  if (st === 'COMPANY_LEAD' || req.channel === 'Digitalising') {
    return {
      channelKey: 'lead',
      channelName: 'Lead Research',
      teamTitle: 'Lead Research Team',
      specialistName: req.assignedSpecialist || 'Company Lead Specialist',
      specialistEmail: 'lead@creativegini.com',
      chatTitle: `Chat with Lead Team: ${req.ticketId}`,
      badgeColor: '#7C3AED',
      badgeBg: '#F5F3FF',
      badgeBorder: '#DDD4FA',
      icon: Target,
    };
  }

  if (st === 'LANDING_PAGE') {
    return {
      channelKey: 'design',
      channelName: 'UI / Design',
      teamTitle: 'UI/Design Studio',
      specialistName: req.assignedSpecialist || 'Landing Page UI/UX Architect',
      specialistEmail: 'ui@creativegini.com',
      chatTitle: `Chat with UI/Design Team: ${req.ticketId}`,
      badgeColor: '#0284C7',
      badgeBg: '#F0F9FF',
      badgeBorder: '#BAE6FD',
      icon: Palette,
    };
  }

  return {
    channelKey: 'boost',
    channelName: 'Growth Boosting',
    teamTitle: 'Growth Boosting Team',
    specialistName: req.assignedSpecialist || 'Company Boost Specialist',
    specialistEmail: 'boost@creativegini.com',
    chatTitle: `Chat with Boosting Team: ${req.ticketId}`,
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    icon: Rocket,
  };
}

export default function MessagesPage({
  requests = [],
  initialTicketId = null,
}) {
  const [selectedTicketId, setSelectedTicketId] = useState(
    initialTicketId || (requests.length > 0 ? requests[0].ticketId : null)
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Selected ticket
  const selectedTicket = useMemo(() => {
    return requests.find((r) => r.ticketId === selectedTicketId) || requests[0] || null;
  }, [requests, selectedTicketId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTicketId]);

  const selectedMeta = useMemo(() => {
    return getChatMeta(selectedTicket);
  }, [selectedTicket]);

  // Counts for channel tabs
  const channelCounts = useMemo(() => {
    let boost = 0;
    let lead = 0;
    let design = 0;
    for (const r of requests) {
      const meta = getChatMeta(r);
      if (meta.channelKey === 'lead') lead++;
      else if (meta.channelKey === 'design') design++;
      else boost++;
    }
    return { all: requests.length, boost, lead, design };
  }, [requests]);

  // Filtered requests by tab and search
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const meta = getChatMeta(r);
      if (activeChannelTab !== 'ALL' && meta.channelKey !== activeChannelTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTicket = r.ticketId?.toLowerCase().includes(q);
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchService = r.service?.toLowerCase().includes(q);
        const matchTeam = meta.teamTitle.toLowerCase().includes(q);
        if (!matchTicket && !matchTitle && !matchService && !matchTeam) return false;
      }
      return true;
    });
  }, [requests, activeChannelTab, searchQuery]);

  // Load messages whenever selectedTicketId changes and poll for replies
  useEffect(() => {
    let isMounted = true;
    if (!selectedTicketId) return;

    const loadMessages = async () => {
      try {
        const res = await api.getMessages(selectedTicketId);
        if (isMounted && Array.isArray(res)) {
          setMessages(res);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    setIsLoadingMessages(true);
    loadMessages().finally(() => {
      if (isMounted) setIsLoadingMessages(false);
    });

    const interval = setInterval(loadMessages, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedTicketId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedTicketId) return;

    setIsSending(true);
    try {
      const sent = await api.sendMessage(selectedTicketId, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
      // Refresh conversation list to get latest state
      const updated = await api.getMessages(selectedTicketId).catch(() => null);
      if (Array.isArray(updated)) {
        setMessages(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px 32px 24px',
        maxWidth: '1440px',
        margin: '0 auto',
        height: 'calc(100vh - 84px)',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Banner */}
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#2563EB',
              backgroundColor: '#EFF6FF',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #BFDBFE',
            }}
          >
            Direct Team Communicator
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
            Dedicated channels for Boosting, Lead Research & UI/Design
          </span>
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
          Team Messages & Chats
        </h1>
        <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
          Chat directly with the dedicated specialist assigned to each of your active service sprints.
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <MessageSquare size={32} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            No Active Conversations
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
            Submit a service request to start communicating directly with your assigned specialist.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) 1fr',
            flex: 1,
            minHeight: 0,
            height: '100%',
          }}
        >
          {/* Left Column: Tickets & Channels List */}
          <div
            style={{
              borderRight: '1px solid #F3F4F6',
              backgroundColor: '#FAFAFC',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Channel Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '12px 14px',
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              {[
                { id: 'ALL', label: 'All', count: channelCounts.all },
                { id: 'boost', label: 'Boosting', count: channelCounts.boost, color: '#2563EB' },
                { id: 'lead', label: 'Lead Research', count: channelCounts.lead, color: '#7C3AED' },
                { id: 'design', label: 'UI/Design', count: channelCounts.design, color: '#0284C7' },
              ].map((tab) => {
                const isActive = activeChannelTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveChannelTab(tab.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #D1D5DB' : '1px solid transparent',
                      backgroundColor: isActive ? '#F3F4F6' : 'transparent',
                      color: isActive ? '#111827' : '#6B7280',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: isActive ? '#E5E7EB' : '#F3F4F6',
                        color: tab.color || '#4B5563',
                        padding: '1px 5px',
                        borderRadius: '999px',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6', position: 'relative', flexShrink: 0 }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search chats by ticket or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 12px 0 32px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* List of Conversations */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {filteredRequests.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  No active conversations matching criteria.
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = req.ticketId === selectedTicketId;
                  const meta = getChatMeta(req);
                  const Icon = meta.icon;

                  return (
                    <div
                      key={req.id || req.ticketId}
                      onClick={() => setSelectedTicketId(req.ticketId)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        cursor: 'pointer',
                        borderLeft: isSelected ? `4px solid ${meta.badgeColor}` : '4px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Top badge row: Channel & Ticket */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: meta.badgeColor,
                              backgroundColor: meta.badgeBg,
                              border: `1px solid ${meta.badgeBorder}`,
                              padding: '2px 7px',
                              borderRadius: '6px',
                            }}
                          >
                            <Icon size={11} />
                            <span>{meta.channelName}</span>
                          </span>

                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: '#374151',
                              fontFamily: 'monospace',
                            }}
                          >
                            {req.ticketId}
                          </span>
                        </div>

                        <StatusBadge status={req.status} size="sm" />
                      </div>

                      {/* Chat Name / Recipient */}
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: '3px',
                          lineHeight: 1.3,
                        }}
                      >
                        {meta.chatTitle}
                      </div>

                      {/* Subtitle: Request requirement */}
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {req.title}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {selectedTicket ? (
              <>
                {/* Conversation Header */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    flexWrap: 'wrap',
                    gap: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    {/* Channel & Chat Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: selectedMeta.badgeColor,
                          backgroundColor: selectedMeta.badgeBg,
                          border: `1px solid ${selectedMeta.badgeBorder}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {selectedMeta.channelName} Channel
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
                        {selectedMeta.chatTitle}
                      </span>
                    </div>

                    {/* Subtitle with recipient specialist details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78125rem', color: '#4B5563', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                        Direct Specialist: <strong>{selectedMeta.specialistName}</strong>
                      </span>
                      <span>•</span>
                      <span>Ticket: {selectedTicket.title}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StatusBadge status={selectedTicket.status} size="sm" />
                  </div>
                </div>

                {/* Counterparty Guardrail Notice */}
                <div
                  style={{
                    padding: '8px 24px',
                    backgroundColor: selectedMeta.badgeBg,
                    borderBottom: `1px solid ${selectedMeta.badgeBorder}`,
                    fontSize: '0.75rem',
                    color: selectedMeta.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    <span>
                      Direct isolated channel with <strong>{selectedMeta.teamTitle}</strong>. Only assigned specialists receive messages sent here.
                    </span>
                  </div>
                  <span style={{ fontWeight: 600 }}>
                    {selectedMeta.specialistEmail}
                  </span>
                </div>

                {/* Messages Body */}
                <div
                  style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    backgroundColor: '#FAF5FF',
                  }}
                >
                  {isLoadingMessages ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      style={{
                        padding: '32px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px dashed #DDD4FA',
                        margin: 'auto',
                        maxWidth: '440px',
                      }}
                    >
                      <MessageSquare size={28} color={selectedMeta.badgeColor} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.90625rem', color: '#1F2937', marginBottom: '4px' }}>
                        Start Chatting with {selectedMeta.teamTitle}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                        Have questions, scope adjustments, or criteria clarifications for <strong>{selectedTicket.ticketId}</strong>? Send a message directly to your specialist below.
                      </p>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        Messages notify specialist instantly
                      </span>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      // Check if message is from specialist or counterparty
                      const isSpecialist = Boolean(
                        (msg.senderRole && msg.senderRole !== 'USER') ||
                        (msg.sender_role && msg.sender_role !== 'USER') ||
                        msg.isSpecialist ||
                        msg.is_specialist
                      );

                      const senderDisplayName = isSpecialist
                        ? msg.senderName || msg.sender_name || selectedMeta.teamTitle
                        : 'You (Client)';

                      const timestamp = msg.createdAt || msg.created_at;

                      return (
                        <div
                          key={msg.id || idx}
                          style={{
                            alignSelf: isSpecialist ? 'flex-start' : 'flex-end',
                            maxWidth: '78%',
                            backgroundColor: isSpecialist ? '#FFFFFF' : '#7C3AED',
                            color: isSpecialist ? '#111827' : '#FFFFFF',
                            borderRadius: '16px',
                            padding: '12px 18px',
                            boxShadow: isSpecialist
                              ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                              : '0 2px 10px rgba(124, 58, 237, 0.25)',
                            border: isSpecialist ? '1px solid #E5E7EB' : 'none',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: isSpecialist ? selectedMeta.badgeColor : '#E9D5FF',
                              marginBottom: '3px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{senderDisplayName}</span>
                            {isSpecialist && (
                              <span
                                style={{
                                  fontSize: '0.6rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: selectedMeta.badgeBg,
                                  border: `1px solid ${selectedMeta.badgeBorder}`,
                                }}
                              >
                                {selectedMeta.channelName} Specialist
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                            {msg.text || msg.message}
                          </div>

                          {timestamp && (
                            <div
                              style={{
                                fontSize: '0.65rem',
                                color: isSpecialist ? '#9CA3AF' : '#DDD6FE',
                                marginTop: '4px',
                                textAlign: 'right',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '3px',
                              }}
                            >
                              <Clock size={10} />
                              <span>{formatDateTime(timestamp)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="text"
                    placeholder={`Type your message to the ${selectedMeta.teamTitle}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: selectedMeta.badgeColor,
                      color: '#FFFFFF',
                      cursor: isSending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      opacity: isSending || !newMessage.trim() ? 0.6 : 1,
                      boxShadow: `0 2px 8px ${selectedMeta.badgeColor}40`,
                    }}
                  >
                    <span>Send</span>
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
