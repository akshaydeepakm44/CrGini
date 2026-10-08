import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Clock,
  Inbox
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatDesignDateTime, formatDesignDate } from '../data/designAdapters';

export default function DesignMessagesPage({ requests = [], user }) {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, activeTicket]);

  // Load latest message for each ticket
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const convList = await Promise.all(
          requests.map(async (r) => {
            try {
              const msgs = await api.getMessages(r.id || r._id);
              const sorted = (Array.isArray(msgs) ? msgs : []).sort(
                (a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
              );
              return {
                ticket: r,
                messages: sorted,
                latestMessage: sorted[0] || null,
                messageCount: sorted.length,
              };
            } catch {
              return { ticket: r, messages: [], latestMessage: null, messageCount: 0 };
            }
          })
        );

        // Sort conversations with newest message first
        const sortedConv = convList.sort((a, b) => {
          const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt || a.latestMessage.created_at || 0).getTime() : 0;
          const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt || b.latestMessage.created_at || 0).getTime() : 0;
          return bTime - aTime;
        });

        setConversations(sortedConv);
        if (sortedConv.length > 0 && !activeTicket) {
          setActiveTicket(sortedConv[0].ticket);
          setActiveMessages(sortedConv[0].messages.slice().reverse());
        }
      } catch (err) {
        console.error('Failed to load design conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    if (requests.length > 0) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [requests.length]);

  const handleSelectConversation = async (conv) => {
    setActiveTicket(conv.ticket);
    try {
      const msgs = await api.getMessages(conv.ticket.id || conv.ticket._id);
      setActiveMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setActiveMessages(conv.messages.slice().reverse());
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeTicket) return;

    try {
      setIsSending(true);
      const newMsg = await api.sendMessage(
        activeTicket.id || activeTicket._id,
        newMessageText.trim(),
        false
      );
      setActiveMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');

      // Update conversations list latest message
      setConversations((prev) =>
        prev.map((c) =>
          c.ticket.id === activeTicket.id
            ? {
                ...c,
                latestMessage: newMsg,
                messageCount: c.messageCount + 1,
              }
            : c
        )
      );
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchTicket = c.ticket.ticketId?.toLowerCase().includes(q);
    const matchClient = c.ticket.clientCompany?.toLowerCase().includes(q) || c.ticket.clientName?.toLowerCase().includes(q);
    const matchMsg = c.latestMessage?.text?.toLowerCase().includes(q);
    return matchTicket || matchClient || matchMsg;
  });

  return (
    <div
      style={{
        padding: '24px 32px 24px',
        maxWidth: '1600px',
        margin: '0 auto',
        height: 'calc(100vh - 84px)',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          Design Communications & Ticket Messages
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: '6px 0 0' }}>
          Engage directly with clients regarding project briefs, wireframes, design revisions, and approvals.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading ticket conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <Inbox size={36} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
            No active conversations
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            Ticket messages will appear here when clients or specialists communicate on active tickets.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
            height: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left Column: Conversations List */}
          <div
            style={{
              borderRight: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Search Box */}
            <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter messages..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    fontSize: '0.8125rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {filteredConversations.map((conv) => {
                const isSelected = activeTicket?.id === conv.ticket.id;
                return (
                  <div
                    key={conv.ticket.id}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                      borderLeft: isSelected ? '4px solid #0284C7' : '4px solid transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: isSelected ? '#0284C7' : '#0F172A',
                        }}
                      >
                        {conv.ticket.ticketId}
                      </span>
                      {conv.latestMessage && (
                        <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                          {formatDesignDate(conv.latestMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', marginBottom: '2px' }}>
                      Chat with Client: {conv.ticket.clientCompany || conv.ticket.clientName}
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {conv.latestMessage?.text || 'No messages yet'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Pane */}
          {activeTicket ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Active Ticket Chat Header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FAFAFA',
                  flexShrink: 0,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.8125rem',
                        backgroundColor: '#F1F5F9',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        color: '#0F172A',
                      }}
                    >
                      {activeTicket.ticketId}
                    </span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Chat with Client: {activeTicket.clientCompany || activeTicket.clientName}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Direct UI/Design Channel • Requirement: {activeTicket.title} • Client: {activeTicket.clientCompany} ({activeTicket.clientName})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/design/requests/${activeTicket.ticketId || activeTicket.id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#0284C7',
                    cursor: 'pointer',
                  }}
                >
                  <span>Open Full Ticket</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Messages Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  minHeight: 0,
                  padding: '20px 24px',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {activeMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '0.875rem' }}>
                    No messages yet on this ticket. Start the conversation below.
                  </div>
                ) : (
                  activeMessages.map((msg, i) => {
                    const isSpecialist =
                      msg.senderRole !== 'USER' &&
                      msg.sender_role !== 'USER' &&
                      msg.senderType !== 'CLIENT';

                    return (
                      <div
                        key={msg.id || i}
                        style={{
                          alignSelf: isSpecialist ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          backgroundColor: isSpecialist ? '#0284C7' : '#FFFFFF',
                          color: isSpecialist ? '#FFFFFF' : '#0F172A',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: isSpecialist ? 'none' : '1px solid #E2E8F0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            marginBottom: '4px',
                            fontSize: '0.6875rem',
                            opacity: 0.85,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {msg.senderName || (isSpecialist ? 'UI Specialist' : activeTicket.clientName)}
                          </span>
                          <span>{formatDesignDateTime(msg.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  gap: '10px',
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Send message to ${activeTicket.clientCompany}...`}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim()}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: isSending ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontSize: '0.875rem',
              }}
            >
              Select a conversation to view chat history
            </div>
          )}
        </div>
      )}
    </div>
  );
}
