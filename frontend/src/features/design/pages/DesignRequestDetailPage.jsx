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
  PenTool,
  Search,
  MessageSquare,
  History
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptDesignRequest, formatDesignDate, formatDesignDateTime } from '../data/designAdapters';
import { canStartWork, canSubmitDeliverables, canMarkCompleted } from '../utils/designStatusUtils';
import DesignReviewPanel from '../components/DesignReviewPanel';
import DesignFeedbackPanel from '../components/DesignFeedbackPanel';
import DesignWorkspace from '../components/DesignWorkspace';
import DesignDeliverableList from '../components/DesignDeliverableList';
import DesignDeliverableUpload from '../components/DesignDeliverableUpload';
import DesignAssetList from '../components/DesignAssetList';
import DesignFilePreview from '../components/DesignFilePreview';

export default function DesignRequestDetailPage({ user, onNavigate }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'requirements' | 'deliverables' | 'feedback' | 'messages' | 'activity'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Chat message input state
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch request ticket
      const rawTicket = await api.getRequestById(ticketId);
      if (!rawTicket) {
        setError('Ticket not found.');
        return;
      }

      const adapted = adaptDesignRequest(rawTicket);
      setTicket(adapted);

      // Fetch submissions, messages, and activity logs
      const reqId = rawTicket.id || rawTicket._id;
      const [subsRes, msgsRes, actRes] = await Promise.allSettled([
        api.getSubmissions(reqId),
        api.getMessages(reqId),
        api.getTicketActivity ? api.getTicketActivity(reqId) : Promise.resolve([]),
      ]);

      if (subsRes.status === 'fulfilled') {
        setSubmissions(Array.isArray(subsRes.value) ? subsRes.value : []);
      }
      if (msgsRes.status === 'fulfilled') {
        setMessages(Array.isArray(msgsRes.value) ? msgsRes.value : []);
      }
      if (actRes.status === 'fulfilled') {
        setActivityLogs(Array.isArray(actRes.value) ? actRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load design ticket details:', err);
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicketData();
    }
  }, [ticketId]);

  // Lifecycle Action Handlers
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
      await api.updateRequestStatus(
        ticket.id || ticket._id,
        'COMPLETED',
        'Marked completed by UI/Design service specialist'
      );
      await loadTicketData();
    } catch (err) {
      alert('Failed to complete ticket: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitWork = async (payload) => {
    if (!ticket) return;
    try {
      setIsSubmittingWork(true);
      await api.submitWork(ticket.ticketId || ticket.id || ticket._id, payload);
      setIsUploadModalOpen(false);
      await loadTicketData();
      setActiveTab('deliverables');
    } catch (err) {
      alert('Failed to submit deliverables: ' + err.message);
    } finally {
      setIsSubmittingWork(false);
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
      <div style={{ padding: '80px 32px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading design ticket details...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center', color: '#EF4444' }}>
        <AlertCircle size={40} style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{error || 'Ticket Not Found'}</h2>
        <button
          type="button"
          onClick={() => navigate('/design/requests')}
          style={{
            marginTop: '16px',
            padding: '8px 18px',
            borderRadius: '8px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Return to Requests Queue
        </button>
      </div>
    );
  }

  const ServiceIcon = ticket.service?.icon || PenTool;
  const nextVersionNum = (submissions.length || 0) + 1;
  const latestSubmission = submissions && submissions.length > 0 ? submissions[0] : null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Back link */}
      <button
        type="button"
        onClick={() => navigate('/design/requests')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#64748B',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: '16px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0284C7')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
      >
        <ArrowLeft size={16} />
        <span>Back to Design Requests Queue</span>
      </button>

      {/* 2. Central Header (Ticket ID, Title, Client, Status, Specialist, Actions) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  backgroundColor: '#F1F5F9',
                  color: '#0F172A',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                {ticket.ticketId}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: ticket.service?.color,
                  backgroundColor: ticket.service?.bgColor,
                  border: `1px solid ${ticket.service?.borderColor}`,
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                <ServiceIcon size={12} />
                {ticket.service?.name}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: ticket.statusConfig.color,
                  backgroundColor: ticket.statusConfig.bg,
                  border: `1px solid ${ticket.statusConfig.border}`,
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                {ticket.statusConfig.label}
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {ticket.title}
            </h1>
          </div>

          {/* Action Buttons Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Open Figma Link (Safe external link) */}
            {ticket.figmaUrl && (
              <a
                href={ticket.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#7C3AED',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <PenTool size={14} />
                <span>OPEN FIGMA PROJECT</span>
                <ExternalLink size={13} />
              </a>
            )}

            {/* Submit Deliverables Action */}
            {canSubmitDeliverables(ticket) && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Upload size={14} />
                <span>Submit Deliverable V{nextVersionNum}</span>
              </button>
            )}

            {/* Mark Completed Action */}
            {canMarkCompleted(ticket) && ticket.status !== 'COMPLETED' && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isActionLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: isActionLoading ? 'wait' : 'pointer',
                }}
              >
                <CheckCircle2 size={14} />
                <span>Mark Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Client & Specialist Meta Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.8125rem',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={15} style={{ color: '#94A3B8' }} />
            <span>Client: <strong style={{ color: '#1E293B' }}>{ticket.clientCompany}</strong> ({ticket.clientName})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={15} style={{ color: '#94A3B8' }} />
            <span>Assigned: <strong style={{ color: '#1E293B' }}>{ticket.assignedTo}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} style={{ color: '#94A3B8' }} />
            <span>Submitted: {formatDesignDate(ticket.createdAt)}</span>
          </div>

          {ticket.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontWeight: 600 }}>
              <Clock size={15} />
              <span>Target Delivery: {formatDesignDate(ticket.deadline)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Work Status Lifecycle Banner (Review State) */}
      <div style={{ marginBottom: '24px' }}>
        <DesignReviewPanel ticket={ticket} latestSubmission={latestSubmission} />
      </div>

      {/* 4. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '24px',
        }}
      >
        {[
          { key: 'workspace', label: 'Design Workspace' },
          { key: 'requirements', label: 'Client Requirements & Files' },
          { key: 'deliverables', label: `Deliverables (${submissions.length})` },
          { key: 'feedback', label: 'Client Feedback' },
          { key: 'messages', label: `Messages (${messages.length})` },
          { key: 'activity', label: 'Activity Logs' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#0284C7' : '#64748B',
                borderBottom: isSelected ? '2px solid #0284C7' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. Tab Panels */}
      {activeTab === 'workspace' && (
        <DesignWorkspace
          ticket={ticket}
          submissions={submissions}
          onOpenUploadDeliverable={() => setIsUploadModalOpen(true)}
          onPreviewFile={(f) => setPreviewFile(f)}
        />
      )}

      {activeTab === 'requirements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Client Brief */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
              Original Client Requirement
            </h3>
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.9375rem',
                lineHeight: '1.7',
                color: '#334155',
                whiteSpace: 'pre-wrap',
              }}
            >
              {ticket.description || 'No detailed brief description provided.'}
            </div>

            {ticket.requirements && Object.keys(ticket.requirements).length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  Additional Structured Brief Notes
                </h4>
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    color: '#475569',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(ticket.requirements, null, 2)}
                </div>
              </div>
            )}
          </div>

          {/* Reference Material & Attachments */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
              Client Reference Material & Uploads ({ticket.attachments?.length || 0})
            </h3>
            <DesignAssetList
              assets={ticket.attachments || []}
              onPreviewFile={(f) => setPreviewFile(f)}
              emptyMessage="No reference files or documents uploaded by client partner."
            />
          </div>
        </div>
      )}

      {activeTab === 'deliverables' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Deliverables & Version History
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Track submitted design assets, Figma links, and client review decisions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              <span>Submit Deliverable V{nextVersionNum}</span>
            </button>
          </div>

          <DesignDeliverableList
            submissions={submissions}
            ticket={ticket}
            onPreviewFile={(f) => setPreviewFile(f)}
          />
        </div>
      )}

      {activeTab === 'feedback' && (
        <DesignFeedbackPanel
          ticket={ticket}
          submissions={submissions}
          onOpenUploadRevision={() => setIsUploadModalOpen(true)}
          onNavigateToMessages={() => setActiveTab('messages')}
        />
      )}

      {activeTab === 'messages' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Chat with Client: {ticket.clientCompany || ticket.clientName} • {ticket.ticketId}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Direct UI/Design Channel • Ticket: {ticket.ticketId} • Requirement: {ticket.title}
            </p>
          </div>

          {/* Messages list */}
          <div
            style={{
              maxHeight: '440px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '16px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: '0.875rem' }}>
                No messages yet. Send an update or question to {ticket.clientCompany || 'the client'}.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isSpecialist =
                  msg.senderRole !== 'USER' &&
                  msg.sender_role !== 'USER' &&
                  msg.senderType !== 'CLIENT';

                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      alignSelf: isSpecialist ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
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
                        {msg.senderName || (isSpecialist ? 'UI Specialist' : ticket.clientName)}
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
          </div>

          {/* Send Box */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type message to client partner..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isSendingMessage || !newMessageText.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isSendingMessage ? 'wait' : 'pointer',
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
      )}

      {activeTab === 'activity' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
            Ticket Audit History & Activity Logs
          </h3>

          {activityLogs.length === 0 ? (
            <div style={{ color: '#94A3B8', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
              No recorded activity events for this ticket yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activityLogs.map((log, i) => (
                <div
                  key={log.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <History size={16} style={{ color: '#0284C7', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                      {log.action?.replace('_', ' ') || 'TICKET_EVENT'}
                    </div>
                    {log.details && (
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        {log.details}
                      </div>
                    )}
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '4px' }}>
                      By {log.userName || log.user_name || 'System'} • {formatDesignDateTime(log.createdAt || log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deliverable Upload Modal */}
      {isUploadModalOpen && (
        <DesignDeliverableUpload
          isOpen={isUploadModalOpen}
          ticket={ticket}
          nextVersion={nextVersionNum}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleSubmitWork}
          isSubmitting={isSubmittingWork}
        />
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <DesignFilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
