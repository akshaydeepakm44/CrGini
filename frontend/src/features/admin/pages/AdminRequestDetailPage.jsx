import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  ExternalLink,
  MessageSquare,
  Send,
  Calendar,
  DollarSign,
  User,
  Building2,
  Paperclip,
  Check
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { api } from '../../../services/api';
import ReassignModal from '../components/ReassignModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message compose
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqData, subData, msgData, actData, teamData] = await Promise.all([
        adminApi.getRequestById(id).catch((err) => {
          throw new Error(err.message || 'Failed to fetch ticket data');
        }),
        api.getSubmissions(id).catch(() => ({ submissions: [] })),
        adminApi.getMessages(id).catch(() => ({ messages: [] })),
        api.getTicketActivity(id).catch(() => ({ logs: [] })),
        adminApi.getTeamOverview().catch(() => [])
      ]);

      if (reqData && reqData.request) {
        setTicket(reqData.request);
      } else if (reqData) {
        setTicket(reqData);
      } else {
        setTicket(null);
        setError('Ticket not found or inaccessible.');
      }

      setSubmissions(subData.submissions || []);
      setMessages(Array.isArray(msgData) ? msgData : (msgData?.messages || []));
      setActivity(actData.logs || []);
      setSpecialists(teamData || []);
    } catch (err) {
      console.error('Error loading request detail:', err);
      setError(err.message || 'Failed to load request detail from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketDetails();
  }, [id]);

  const handleReassign = async (payload) => {
    try {
      setIsSubmitting(true);
      await adminApi.reassignRequest(ticket.id, payload);
      setIsReassignOpen(false);
      await loadTicketDetails();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminOverride = async (reason) => {
    try {
      setIsSubmitting(true);
      await adminApi.adminOverride(ticket.id, reason);
      setIsOverrideOpen(false);
      await loadTicketDetails();
    } catch (err) {
      alert(`Admin override failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    try {
      setIsSendingMessage(true);
      await adminApi.sendMessage(ticket.id, newMessageText.trim());
      setNewMessageText('');
      const updatedMsgs = await adminApi.getMessages(ticket.id);
      setMessages(Array.isArray(updatedMsgs) ? updatedMsgs : (updatedMsgs?.messages || []));
    } catch (err) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="cg-admin-loading">
        <div className="cg-admin-spinner" />
        <span>Loading 360-degree request detail...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="cg-admin-page">
        <div className="cg-page-header">
          <button className="cg-btn-secondary" onClick={() => navigate('/admin/requests')}>
            <ArrowLeft size={14} />
            <span>Back to Operations Queue</span>
          </button>
        </div>
        <div className="cg-panel-box" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginTop: '1.5rem' }}>
          <ShieldAlert size={36} className="text-danger" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Unable to Access Request Record</h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8125rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            {error || 'This request ticket does not exist or you do not have permission to inspect it.'}
          </p>
          <button className="cg-btn-primary" onClick={loadTicketDetails} style={{ margin: '0 auto' }}>
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-admin-page">
      {/* HEADER */}
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <button className="cg-btn-link" onClick={() => navigate('/admin/requests')}>
            <ArrowLeft size={14} />
            <span>Operations Queue</span>
          </button>
          <div className="cg-detail-title-row">
            <h1 className="cg-page-title">{ticket.ticketId}: {ticket.title}</h1>
            <span className={`cg-status-chip ${ticket.status?.toLowerCase()}`}>
              {ticket.status}
            </span>
          </div>
        </div>

        {/* ADMIN ACTIONS BAR */}
        <div className="cg-page-header-actions">
          <button
            className="cg-btn-secondary"
            onClick={() => setIsReassignOpen(true)}
            title="Reassign specialist or change team"
          >
            <UserCheck size={14} />
            <span>Reassign Specialist</span>
          </button>

          {ticket.status !== 'COMPLETED' && (
            <button
              className="cg-btn-danger"
              onClick={() => setIsOverrideOpen(true)}
              title="Force mark completed with audit reason"
            >
              <ShieldAlert size={14} />
              <span>Admin Override Complete</span>
            </button>
          )}
        </div>
      </div>

      <div className="cg-detail-grid">
        {/* LEFT COLUMN: OVERVIEW, DELIVERABLES, MESSAGES */}
        <div className="cg-detail-main">
          {/* CLIENT REQUIREMENTS CARD */}
          <div className="cg-card">
            <h3 className="cg-card-title">Client Requirements & Scope</h3>
            <p className="cg-card-description">
              {ticket.description || 'No detailed specification provided.'}
            </p>

            <div className="cg-meta-grid">
              <div className="cg-meta-item">
                <span className="cg-meta-label">Service Type</span>
                <span className="cg-meta-val">{ticket.serviceType}</span>
              </div>
              <div className="cg-meta-item">
                <span className="cg-meta-label">Priority</span>
                <span className={`cg-priority-badge ${ticket.priority?.toLowerCase()}`}>
                  {ticket.priority || 'MEDIUM'}
                </span>
              </div>
              <div className="cg-meta-item">
                <span className="cg-meta-label">Total Fee</span>
                <span className="cg-meta-val">${parseFloat(ticket.price || 0).toFixed(2)}</span>
              </div>
              <div className="cg-meta-item">
                <span className="cg-meta-label">Payment Status</span>
                <span className={`cg-payment-pill ${ticket.paymentStatus?.toLowerCase()}`}>
                  {ticket.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* DELIVERABLES & VERSIONS HISTORY */}
          <div className="cg-card">
            <div className="cg-card-header-flex">
              <h3 className="cg-card-title">Deliverables & Version History</h3>
              <span className="cg-badge-counter">{submissions.length} Version{submissions.length === 1 ? '' : 's'}</span>
            </div>

            {submissions.length === 0 ? (
              <div className="cg-empty-table">No work deliverables submitted yet.</div>
            ) : (
              <div className="cg-submissions-list">
                {submissions.map((s) => (
                  <div key={s.id} className="cg-submission-box">
                    <div className="cg-sub-header">
                      <div className="cg-sub-badge">V{s.version}</div>
                      <div className="cg-sub-meta">
                        <h4 className="cg-sub-title">{s.title}</h4>
                        <span className="cg-sub-author">
                          Submitted by {s.submittedByName || 'Specialist'} on {new Date(s.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`cg-status-chip ${s.status?.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </div>

                    {s.description && (
                      <p className="cg-sub-notes">{s.description}</p>
                    )}

                    {s.externalLink && (
                      <div className="cg-sub-link">
                        <ExternalLink size={14} />
                        <a href={s.externalLink} target="_blank" rel="noopener noreferrer">
                          {s.externalLink}
                        </a>
                      </div>
                    )}

                    {s.reviewFeedback && (
                      <div className="cg-review-feedback-box">
                        <strong>Client Feedback:</strong> {s.reviewFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TICKET CONVERSATIONS */}
          <div className="cg-card">
            <div className="cg-card-header-flex">
              <h3 className="cg-card-title">Ticket Communications</h3>
              <span className="cg-badge-counter">{messages.length}</span>
            </div>

            <div className="cg-messages-thread">
              {messages.length === 0 ? (
                <div className="cg-empty-table">No messages on this ticket yet.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="cg-message-item">
                    <div className="cg-msg-header">
                      <span className="cg-msg-sender">{m.senderName} ({m.senderRole})</span>
                      <span className="cg-msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="cg-msg-text">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* SEND MESSAGE */}
            <form onSubmit={handleSendMessage} className="cg-msg-compose-bar">
              <input
                type="text"
                placeholder="Post an administrative message to this ticket..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                disabled={isSendingMessage}
              />
              <button type="submit" disabled={isSendingMessage || !newMessageText.trim()}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: CLIENT, SPECIALIST, AUDIT TIMELINE */}
        <div className="cg-detail-sidebar">
          {/* CLIENT & COMPANY */}
          <div className="cg-side-card">
            <h4 className="cg-side-card-title">Client Information</h4>
            <div className="cg-side-entity">
              <User size={16} className="text-primary" />
              <div>
                <div className="cg-entity-primary">{ticket.userId?.name || 'Direct Client'}</div>
                <div className="cg-entity-secondary">{ticket.userId?.email}</div>
              </div>
            </div>

            <div className="cg-side-entity mt-2">
              <Building2 size={16} className="text-info" />
              <div>
                <div className="cg-entity-primary">{ticket.companyId?.name || 'Company Profile'}</div>
                <div className="cg-entity-secondary">{ticket.companyId?.industry || 'Client Organization'}</div>
              </div>
            </div>
          </div>

          {/* ASSIGNMENT */}
          <div className="cg-side-card">
            <h4 className="cg-side-card-title">Specialist Responsibility</h4>
            <div className="cg-side-entity">
              <UserCheck size={16} className="text-success" />
              <div>
                <div className="cg-entity-primary">
                  {ticket.assignedTo?.name || 'Unassigned'}
                </div>
                <div className="cg-entity-secondary">
                  {ticket.assignedTeam || 'Unassigned Team Pool'}
                </div>
              </div>
            </div>

            {ticket.dueDate && (
              <div className="cg-side-entity mt-2">
                <Calendar size={16} className="text-warning" />
                <div>
                  <div className="cg-entity-primary">Target Due Date</div>
                  <div className="cg-entity-secondary">
                    {new Date(ticket.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="cg-side-card">
            <h4 className="cg-side-card-title">Activity Audit Trail</h4>
            <div className="cg-activity-timeline-side">
              {activity.length === 0 ? (
                <div className="cg-empty-table">No activity records recorded.</div>
              ) : (
                activity.map((log) => (
                  <div key={log.id} className="cg-timeline-entry">
                    <span className="cg-timeline-dot" />
                    <div className="cg-timeline-body">
                      <span className="cg-timeline-action">{log.action}</span>
                      <p className="cg-timeline-desc">{log.details}</p>
                      <span className="cg-timeline-stamp">
                        {new Date(log.created_at || log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(log.created_at || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REASSIGN MODAL */}
      <ReassignModal
        isOpen={isReassignOpen}
        ticket={ticket}
        specialists={specialists}
        onClose={() => setIsReassignOpen(false)}
        onReassign={handleReassign}
        isSubmitting={isSubmitting}
      />

      {/* OVERRIDE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        onConfirm={handleAdminOverride}
        title="Execute Administrative Completion Override"
        message={`You are about to force complete ticket ${ticket.ticketId}. This will bypass standard client review and mark work closed. Please provide an administrative reason.`}
        confirmText="Confirm Override Complete"
        requireReason={true}
        reasonPlaceholder="e.g. Client signed off via direct executive communication or mutual contract completion..."
        isDestructive={false}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
