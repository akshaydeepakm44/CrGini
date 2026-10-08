import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Building2,
  RefreshCw,
  Clock,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptLeadRequest, formatDateTime } from '../data/leadAdapters';

export default function LeadMessagesPage({ onNavigate }) {
  const { ticketId: routeTicketId } = useParams();
  const [requests, setRequests] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isProgressUpdate, setIsProgressUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTicket]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const rawReqs = await api.getRequests().catch(() => []);
      const adapted = (rawReqs || []).map(adaptLeadRequest);
      setRequests(adapted);

      let active = null;
      if (routeTicketId) {
        active = adapted.find(
          (r) => String(r.id) === String(routeTicketId) || String(r.ticketId) === String(routeTicketId)
        );
      }
      if (!active && adapted.length > 0) {
        active = adapted[0];
      }

      if (active) {
        await selectTicket(active);
      }
    } catch (err) {
      console.error('Failed to load tickets for messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const msgs = await api.getTicketMessages(ticket.ticketId || ticket.id).catch(() => []);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [routeTicketId]);

  // Real-time polling for incoming client messages on active ticket
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await api.getTicketMessages(selectedTicket.ticketId || selectedTicket.id).catch(() => []);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      setSending(true);
      await api.sendMessage(selectedTicket.ticketId || selectedTicket.id, {
        message: newMessage.trim(),
        isProgressUpdate,
      });

      setNewMessage('');
      setIsProgressUpdate(false);
      // Reload messages
      const updated = await api.getTicketMessages(selectedTicket.ticketId || selectedTicket.id);
      setMessages(Array.isArray(updated) ? updated : []);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredRequests = requests
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.title?.toLowerCase().includes(q) ||
        r.ticketId?.toLowerCase().includes(q) ||
        r.clientCompany?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

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
      {/* 1. Page Header */}
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
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
            Client Communications
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
            Specialist Message Threads
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Research Sprint Messages
        </h1>
        <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
          Clarify criteria, send progress milestone updates, and collaborate directly with client partners.
        </p>
      </div>

      {/* 2. Chat Layout (Left list of threads + Right conversation thread) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
          height: '100%',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Left: Threads List */}
        <div
          style={{
            borderRight: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAFAFC',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                color="#9CA3AF"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search ticket threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredRequests.map((r) => {
              const isSelected = selectedTicket && selectedTicket.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => selectTicket(r)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #8B5CF6' : '1px solid transparent',
                    backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED' }}>
                        {r.ticketId}
                      </span>
                      {r.latestMessage && (r.latestMessage.senderRole === 'USER' || r.latestMessage.sender_role === 'USER') && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#6D28D9', backgroundColor: '#EDE9FE', padding: '1px 5px', borderRadius: '4px' }}>
                          Client Msg
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                      {formatDateTime(r.latestMessage?.createdAt || r.updatedAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#111827',
                      lineHeight: 1.3,
                      marginBottom: '3px',
                    }}
                  >
                    Chat with Client: {r.clientCompany || r.clientName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.title}
                  </div>

                  {r.latestMessage && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '4px 8px',
                        backgroundColor: (r.latestMessage.senderRole === 'USER' || r.latestMessage.sender_role === 'USER') ? '#F5F3FF' : '#F9FAFB',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        color: (r.latestMessage.senderRole === 'USER' || r.latestMessage.sender_role === 'USER') ? '#6D28D9' : '#4B5563',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <strong style={{ fontWeight: 700 }}>
                        {r.latestMessage.senderRole === 'USER' || r.latestMessage.sender_role === 'USER' ? 'Client: ' : 'You: '}
                      </strong>
                      <span>{r.latestMessage.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        {selectedTicket ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Thread Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED' }}>
                    {selectedTicket.ticketId}
                  </span>
                  <span style={{ fontSize: '0.90625rem', fontWeight: 800, color: '#111827' }}>
                    Chat with Client: {selectedTicket.clientCompany || selectedTicket.clientName}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  Direct Lead Channel • Requirement: <strong>{selectedTicket.title}</strong> • Client: {selectedTicket.clientName} ({selectedTicket.clientCompany})
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate(`/lead/requests/${selectedTicket.id}`)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#7C3AED',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                View Full Ticket
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#FAFAFC',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#9CA3AF' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>No messages yet</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                    Post a progress milestone or question to the client partner.
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isSpecialist = m.senderRole !== 'USER' && m.sender_role !== 'USER' && m.senderType !== 'CLIENT';

                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSpecialist ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#6B7280',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <strong>{m.senderName || (isSpecialist ? 'Specialist Team' : 'Client')}</strong>
                        <span>•</span>
                        <span>{formatDateTime(m.createdAt)}</span>
                        {m.isProgressUpdate && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Milestone Update
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '12px 16px',
                          borderRadius: isSpecialist ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          backgroundColor: isSpecialist ? '#7C3AED' : '#FFFFFF',
                          color: isSpecialist ? '#FFFFFF' : '#1F2937',
                          border: isSpecialist ? 'none' : '1px solid #E5E7EB',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {m.message || m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Composer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isProgressUpdate}
                    onChange={(e) => setIsProgressUpdate(e.target.checked)}
                    style={{ accentColor: '#7C3AED' }}
                  />
                  Mark as Milestone Progress Update
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type an update or reply to the client..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    backgroundColor: '#FAFAFC',
                  }}
                />

                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !newMessage.trim() ? 0.6 : 1,
                  }}
                >
                  <Send size={15} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>No Sprint Selected</div>
            <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>
              Select a thread from the list on the left to read messages.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
