import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  Play,
  RotateCcw,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptBoostRequest, formatBoostDate, formatBoostDateTime } from '../data/boostAdapters';
import { canStartWork, canSubmitDeliverables, canMarkCompleted, WORKFLOW_STAGES, getWorkflowCurrentStep } from '../utils/boostStatusUtils';
import DeliverableUploadModal from '../components/DeliverableUploadModal';
import DeliverableList from '../components/DeliverableList';
import ReviewStatus from '../components/ReviewStatus';

export default function BoostRequestDetailPage({ onNavigate, user, ticketIdProp }) {
  const { ticketId: paramTicketId, statusParam } = useParams();
  const ticketId = ticketIdProp || paramTicketId || statusParam;
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'deliverables' | 'messages'

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      // 1. Fetch ticket by ID or ticketId
      const rawTicket = await api.getRequestById(ticketId);
      if (!rawTicket) {
        setError('Ticket not found.');
        return;
      }
      const adapted = adaptBoostRequest(rawTicket);
      setTicket(adapted);

      // 2. Fetch submissions & messages
      const [subsRes, msgsRes] = await Promise.allSettled([
        api.getSubmissions(rawTicket.id || rawTicket._id),
        api.getMessages(rawTicket.id || rawTicket._id),
      ]);

      if (subsRes.status === 'fulfilled') {
        setSubmissions(Array.isArray(subsRes.value) ? subsRes.value : []);
      }
      if (msgsRes.status === 'fulfilled') {
        setMessages(Array.isArray(msgsRes.value) ? msgsRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      setError(err.message || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicketData();
    }
  }, [ticketId]);

  const handleStartWork = async () => {
    if (!ticket) return;
    try {
      setIsActionLoading(true);
      await api.startWork(ticket.id || ticket._id);
      await loadTicketData();
    } catch (err) {
      alert('Failed to start work: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!ticket) return;
    try {
      setIsActionLoading(true);
      await api.updateRequestStatus(ticket.id || ticket._id, 'COMPLETED', 'Marked completed by Boost team');
      await loadTicketData();
    } catch (err) {
      alert('Failed to complete ticket: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !ticket) return;
    try {
      setIsSendingMessage(true);
      const newMsg = await api.sendMessage(ticket.id || ticket._id, newMessageText.trim(), false);
      setMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: '#6B7280' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading request details...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: '#EF4444' }}>
        <AlertCircle size={36} style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{error || 'Ticket not found'}</div>
        <button
          type="button"
          onClick={() => navigate('/boost/requests')}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Return to Boost Requests
        </button>
      </div>
    );
  }

  const currentStep = getWorkflowCurrentStep(ticket.status);
  const ServiceIcon = ticket.service?.icon || Layers;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. Back link */}
      <button
        type="button"
        onClick={() => navigate('/boost/requests')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#6B7280',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '16px',
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Requests</span>
      </button>

      {/* 2. HEADER CARD */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                {ticket.ticketId}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: ticket.service?.bgColor || '#F5F3FF',
                  color: ticket.service?.color || '#7C3AED',
                  border: `1px solid ${ticket.service?.borderColor || '#DDD6FE'}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <ServiceIcon size={12} />
                <span>{ticket.service?.name}</span>
              </span>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  backgroundColor: ticket.statusConfig?.bg,
                  color: ticket.statusConfig?.color,
                  border: `1px solid ${ticket.statusConfig?.border}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {ticket.statusConfig?.label}
              </span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: ticket.priorityConfig?.bg,
                  color: ticket.priorityConfig?.color,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {ticket.priorityConfig?.label} Priority
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              {ticket.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '18px', fontSize: '0.8125rem', color: '#6B7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building size={14} />
                <strong style={{ color: '#374151' }}>{ticket.clientCompany}</strong> ({ticket.clientName})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={14} />
                Specialist: <strong style={{ color: '#374151' }}>{ticket.assignedTo}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                Created {formatBoostDate(ticket.createdAt)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsSubmissionModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              <span>Submit Deliverables</span>
            </button>

            {canMarkCompleted(ticket.status) && ticket.status !== 'COMPLETED' && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isActionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Mark Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. WORK STATUS LIFECYCLE STEPPER */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
            Request Lifecycle
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              maxWidth: '900px',
            }}
          >
            {WORKFLOW_STAGES.map((st, sIdx) => {
              const isPast = currentStep > st.step;
              const isCurrent = currentStep === st.step;
              const isFuture = currentStep < st.step;

              return (
                <div
                  key={st.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 2,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isPast ? '#059669' : (isCurrent ? '#7C3AED' : '#F3F4F6'),
                      color: (isPast || isCurrent) ? '#FFFFFF' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      border: isCurrent ? '3px solid #DDD6FE' : 'none',
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : st.step}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#7C3AED' : (isPast ? '#111827' : '#9CA3AF'),
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review feedback alert banner if changes requested */}
        <div style={{ marginTop: '20px' }}>
          <ReviewStatus
            status={ticket.status}
            latestFeedback={ticket.raw?.feedback || ''}
            onOpenResubmit={() => setIsSubmissionModalOpen(true)}
          />
        </div>
      </div>

      {/* 4. Tab Navigation Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {[
          { key: 'details', label: 'Request Details & Attachments' },
          { key: 'deliverables', label: `Deliverables & Versions (${submissions.length})` },
          { key: 'messages', label: `Client Messages (${messages.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#7C3AED' : '#4B5563',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                border: isActive ? '1px solid #DDD6FE' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. TAB CONTENT */}

      {/* Tab 1: Details & Attachments */}
      {activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Left Column: Scope & Requirements */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                Client Requirement & Description
              </h3>
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: '#1F2937',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ticket.description || 'No detailed scope provided.'}
              </div>
            </div>

            {/* Structured requirements if available */}
            {ticket.requirements && Object.keys(ticket.requirements).length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Requirement Specifications
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                  {Object.entries(ticket.requirements).map(([k, v]) => {
                    if (typeof v === 'object' || k === 'rawNotes') return null;
                    return (
                      <div
                        key={k}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                          {String(v)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Attachments & Client Context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Attachments Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '12px' }}>
                Client Files & Assets ({ticket.attachments?.length || 0})
              </h3>
              {(!ticket.attachments || ticket.attachments.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#6B7280', fontSize: '0.8125rem' }}>
                  No files uploaded by client
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ticket.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <FileText size={16} color="#7C3AED" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name || `File-${idx + 1}`}
                        </span>
                      </div>
                      {file.url && (
                        <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#7C3AED', padding: '2px' }}>
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Specs Guide */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '10px' }}>
                Service Production Checklist
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ticket.service?.checklist?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: '#4B5563' }}>
                    <span style={{ color: '#7C3AED', fontWeight: 700 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Deliverables */}
      {activeTab === 'deliverables' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Submitted Deliverables & Versions
              </h2>
              <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
                All version packages uploaded for client inspection and sign-off
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmissionModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              <span>Submit New Version</span>
            </button>
          </div>

          <DeliverableList submissions={submissions} currentStatus={ticket.status} />
        </div>
      )}

      {/* Tab 3: Messages */}
      {activeTab === 'messages' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#FAFAFC',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Chat with Client: {ticket.clientCompany || ticket.clientName} • {ticket.ticketId}
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
              Direct Boosting Channel • Ticket: {ticket.ticketId} • Client: {ticket.clientName} ({ticket.clientCompany})
            </div>
          </div>

          <div style={{ minHeight: '360px', maxHeight: '540px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#6B7280', fontSize: '0.875rem' }}>
                No messages exchanged yet with {ticket.clientCompany || 'the client'}.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isClient = msg.senderType === 'CLIENT' || msg.senderRole === 'USER' || msg.sender_role === 'USER' || msg.isClient;
                return (
                  <div
                    key={msg.id || msg._id || idx}
                    style={{
                      alignSelf: isClient ? 'flex-start' : 'flex-end',
                      maxWidth: '75%',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: isClient ? '#F3F4F6' : '#7C3AED',
                        color: isClient ? '#111827' : '#FFFFFF',
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
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
                      {msg.senderName || (isClient ? ticket.clientName : (user?.name || 'Boost Specialist'))} • {formatBoostDateTime(msg.createdAt || msg.created_at)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#FAFAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Send message or progress update to client..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
            <button
              type="submit"
              disabled={isSendingMessage || !newMessageText.trim()}
              style={{
                padding: '10px 18px',
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
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Deliverable upload modal */}
      {isSubmissionModalOpen && (
        <DeliverableUploadModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          ticket={ticket}
          onSuccess={loadTicketData}
        />
      )}
    </div>
  );
}
