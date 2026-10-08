import React, { useState, useEffect, useRef } from 'react';
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
import { formatBoostDateTime, formatBoostDate } from '../data/boostAdapters';

export default function BoostMessagesPage({ requests = [], onNavigate, user }) {
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
        console.error('Failed to load conversations:', err);
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
      const newMsg = await api.sendMessage(activeTicket.id || activeTicket._id, newMessageText.trim(), false);
      setActiveMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');

      // Update latest message in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.ticket.id === activeTicket.id
            ? { ...c, latestMessage: newMsg, messageCount: c.messageCount + 1 }
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
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          Boost Client Conversations
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#6B7280',
            margin: '6px 0 0',
          }}
        >
          Ticket-linked real-time messages and communication threads with clients across all Boost requests.
        </p>
      </div>

      {/* Main Two-Pane Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
          height: '100%',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Left Pane: Conversation List */}
        <div
          style={{
            borderRight: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Search Bar */}
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFC', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* List items */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280', fontSize: '0.8125rem' }}>
                Loading conversation threads...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280', fontSize: '0.8125rem' }}>
                No active conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeTicket?.id === conv.ticket.id;
                const latest = conv.latestMessage;

                return (
                  <div
                    key={conv.ticket.id || conv.ticket.ticketId}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      padding: '16px 18px',
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                      borderLeft: isSelected ? '4px solid #7C3AED' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                        {conv.ticket.ticketId}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                        {latest ? formatBoostDate(latest.createdAt || latest.created_at) : ''}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                      Chat with Client: {conv.ticket.clientCompany || conv.ticket.clientName}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '6px' }}>
                      {conv.ticket.title}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: latest ? '#4B5563' : '#9CA3AF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {latest ? (latest.text || latest.message) : 'No messages yet'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Live Chat Pane */}
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
            {/* Chat header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                    {activeTicket.ticketId}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
                    Chat with Client: {activeTicket.clientCompany || activeTicket.clientName}
                  </span>
                  {activeTicket.clientName && (
                    <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      ({activeTicket.clientName})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
                  {activeTicket.title} • {activeTicket.service?.name}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(`/boost/requests/${activeTicket.ticketId || activeTicket.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#7C3AED',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span>View Full Ticket</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#FAFAFC',
              }}
            >
              {activeMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
                  <MessageSquare size={32} style={{ color: '#D1D5DB', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>No messages exchanged on this ticket yet</div>
                  <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                    Send an update to {activeTicket.clientName} below.
                  </div>
                </div>
              ) : (
                activeMessages.map((msg, idx) => {
                  const isClient = msg.senderType === 'CLIENT' || msg.senderRole === 'USER' || msg.sender_role === 'USER' || msg.isClient;
                  return (
                    <div
                      key={msg.id || msg._id || idx}
                      style={{
                        alignSelf: isClient ? 'flex-start' : 'flex-end',
                        maxWidth: '70%',
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: isClient ? '#FFFFFF' : '#7C3AED',
                          color: isClient ? '#111827' : '#FFFFFF',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          border: isClient ? '1px solid #E5E7EB' : 'none',
                        }}
                      >
                        {msg.text || msg.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: '#9CA3AF',
                          marginTop: '4px',
                          textAlign: isClient ? 'left' : 'right',
                          padding: '0 4px',
                        }}
                      >
                        {msg.senderName || (isClient ? activeTicket.clientName : (user?.name || 'Boost Specialist'))} • {formatBoostDateTime(msg.createdAt || msg.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '18px 24px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={`Type a response or update to ${activeTicket.clientName}...`}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSending || !newMessageText.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: newMessageText.trim() ? 'pointer' : 'default',
                  opacity: newMessageText.trim() ? 1 : 0.6,
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            Select a conversation on the left
          </div>
        )}
      </div>
    </div>
  );
}
