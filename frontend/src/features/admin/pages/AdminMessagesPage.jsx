import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  RefreshCw,
  ArrowRight,
  User,
  Building2,
  Clock,
  Send
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminMessagesPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTicketId]);

  const [error, setError] = useState(null);

  const loadActiveThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOperations();
      const list = res.requests || [];
      setTickets(list);
      if (list.length > 0 && !selectedTicketId) {
        setSelectedTicketId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading threads:', err);
      setError(err.message || 'Failed to load conversations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveThreads();
  }, []);

  useEffect(() => {
    if (!selectedTicketId) return;
    const fetchMsgs = async () => {
      try {
        setLoadingMessages(true);
        const res = await adminApi.getMessages(selectedTicketId);
        setMessages(Array.isArray(res) ? res : (res?.messages || []));
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMsgs();
  }, [selectedTicketId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;
    try {
      setSending(true);
      await adminApi.sendMessage(selectedTicketId, replyText.trim());
      setReplyText('');
      const res = await adminApi.getMessages(selectedTicketId);
      setMessages(Array.isArray(res) ? res : (res?.messages || []));
    } catch (err) {
      alert(`Send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      t.ticketId?.toLowerCase().includes(term) ||
      t.title?.toLowerCase().includes(term) ||
      t.client?.name?.toLowerCase().includes(term) ||
      t.company?.name?.toLowerCase().includes(term)
    );
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Communications & Message Center</h1>
          <p className="cg-page-subtitle">
            Global view of all client-specialist messaging threads across active service tickets
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-secondary" onClick={loadActiveThreads}>
            <RefreshCw size={14} className={loading ? 'cg-spin' : ''} />
            <span>Refresh Threads</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="cg-notice-box error mb-3">
          <RefreshCw size={16} className="text-danger" />
          <span className="flex-1"><strong>Error:</strong> {error}</span>
          <button className="cg-btn-secondary" onClick={loadActiveThreads} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="cg-comms-layout">
        {/* THREADS SIDEBAR */}
        <div className="cg-comms-sidebar">
          <div className="cg-filter-search mb-2">
            <Search size={14} className="cg-filter-icon" />
            <input
              type="text"
              className="cg-filter-input"
              placeholder="Filter threads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cg-thread-list">
            {loading ? (
              <div className="cg-search-status">Loading conversation threads...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="cg-search-status">No active threads found.</div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className={`cg-thread-item ${t.id === selectedTicketId ? 'active' : ''}`}
                  onClick={() => setSelectedTicketId(t.id)}
                >
                  <div className="cg-thread-top">
                    <span className="cg-thread-code">{t.ticketId}</span>
                    <span className={`cg-status-chip ${t.status?.toLowerCase()}`}>{t.status}</span>
                  </div>
                  <div className="cg-thread-title">{t.title}</div>
                  <div className="cg-thread-user">
                    {t.client?.name} • {t.company?.name || 'Company'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTIVE CONVERSATION PANE */}
        <div className="cg-comms-pane">
          {activeTicket ? (
            <>
              <div className="cg-comms-pane-header">
                <div>
                  <h3 className="cg-pane-title">{activeTicket.ticketId}: {activeTicket.title}</h3>
                  <span className="cg-pane-meta">
                    Client: {activeTicket.client?.name} ({activeTicket.client?.email}) • Assigned: {activeTicket.specialist?.name || 'Unassigned'}
                  </span>
                </div>
                <button
                  className="cg-btn-secondary"
                  onClick={() => navigate(`/admin/requests/${activeTicket.id}`)}
                >
                  <span>Open Ticket</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="cg-comms-messages-body">
                {loadingMessages ? (
                  <div className="cg-search-status">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="cg-empty-table">No conversation messages in this ticket yet.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="cg-chat-bubble">
                      <div className="cg-chat-meta">
                        <span className="cg-chat-author">{m.senderName} ({m.senderRole})</span>
                        <span className="cg-chat-stamp">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="cg-chat-content">{m.text}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="cg-comms-input-bar">
                <input
                  type="text"
                  placeholder="Post an administrative message to this conversation..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !replyText.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="cg-empty-table">Select a ticket to inspect communications.</div>
          )}
        </div>
      </div>
    </div>
  );
}
