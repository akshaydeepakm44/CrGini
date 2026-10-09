import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  User,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  Download,
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../../../services/api';
import { LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatDateTime, formatDateTimeWithTime, adaptLeadRequest } from '../data/leadAdapters';
import DeliverableUploadModal from '../components/DeliverableUploadModal';

export default function LeadRequestDetailPage({ onNavigate, user }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rawReq, subs, msgs, logs] = await Promise.all([
        api.getRequestById(ticketId),
        api.getSubmissions(ticketId).catch(() => []),
        api.getMessages(ticketId).catch(() => []),
        api.getTicketActivity(ticketId).catch(() => []),
      ]);

      const adapted = adaptLeadRequest(rawReq);
      setRequest(adapted);
      setSubmissions(subs || []);
      setMessages(msgs || []);
      setActivityLogs(logs || []);
    } catch (err) {
      console.error('Failed to load request detail:', err);
      setError(err.message || 'Ticket not found.');
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
    if (!request) return;
    setIsActionLoading(true);
    try {
      await api.startWork(request.ticketId);
      await loadTicketData();
    } catch (err) {
      alert(err.message || 'Failed to start work');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await api.sendMessage(request.ticketId, newMessage.trim(), false);
      setNewMessage('');
      const updatedMsgs = await api.getMessages(request.ticketId);
      setMessages(updatedMsgs || []);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Loading internal ticket detail...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div style={{ padding: '36px', maxWidth: '800px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => onNavigate('/lead/requests')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            fontSize: '0.84375rem',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Requests</span>
        </button>
        <div style={{ padding: '24px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#EF4444' }}>
          {error || 'Ticket not found.'}
        </div>
      </div>
    );
  }

  const statusCfg = LEAD_STATUS_CONFIG[request.status] || LEAD_STATUS_CONFIG.REQUEST_CREATED;
  const prioCfg = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.MEDIUM;
  const reqDetails = request.requirements || {};

  return (
    <div style={{ padding: '28px 36px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Back link & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => onNavigate('/lead/requests')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            fontSize: '0.84375rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Request Queue</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onNavigate(`/lead/research/${request.ticketId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Briefcase size={15} />
            <span>Open Research Studio & Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #DDD4FA',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Upload size={15} />
            <span>{request.status === 'CHANGES_REQUESTED' ? 'Upload Revision Package' : 'Quick Upload Files'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Ticket Meta Header Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#7C3AED',
                  backgroundColor: '#F5F3FF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #DDD4FA',
                }}
              >
                {request.ticketId}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                {request.clientCompany}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                {request.serviceType ? request.serviceType.replace('_', ' ') : 'Lead Research'}
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 6px 0',
              }}
            >
              {request.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: '#6B7280' }}>
              <span>Client: <strong>{request.clientName}</strong> ({request.clientEmail})</span>
              <span>Assigned: <strong>{typeof request.assignedTo === 'object' ? (request.assignedTo?.name || 'Specialist Queue') : (request.assignedTo || 'Specialist Queue')}</strong></span>
              <span>Created: {formatDateTime(request.createdAt)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: statusCfg.color,
                backgroundColor: statusCfg.bg,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Requirements, Target, Attachments, Deliverables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* A. CLIENT REQUIREMENT */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Client Requirement
            </h3>
            <p style={{ margin: 0, fontSize: '0.90625rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {request.description || 'No general description provided.'}
            </p>
          </div>

          {/* B. TARGET SPECIFICATIONS (Only fields that actually exist) */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.875rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {reqDetails.leadsCount && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Target Leads Count</div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#7C3AED', marginTop: '2px' }}>
                    {reqDetails.leadsCount} Verified Contacts
                  </div>
                </div>
              )}

              {reqDetails.targetMarket && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Industry & Market</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqDetails.targetMarket}
                  </div>
                </div>
              )}

              {reqDetails.targetPersonas && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Target Personas / Titles</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqDetails.targetPersonas}
                  </div>
                </div>
              )}

              {reqDetails.companySize && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Company Size</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqDetails.companySize}
                  </div>
                </div>
              )}

              {reqDetails.qualificationCriteria && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Qualification Criteria</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqDetails.qualificationCriteria}
                  </div>
                </div>
              )}

              {reqDetails.referenceLinks && (
                <div style={{ padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Reference Links</div>
                  <a
                    href={reqDetails.referenceLinks.startsWith('http') ? reqDetails.referenceLinks : `https://${reqDetails.referenceLinks}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: '#7C3AED', marginTop: '2px', display: 'inline-block' }}
                  >
                    {reqDetails.referenceLinks}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* C. DELIVERABLES (V1, V2, etc.) */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Deliverables & Submissions ({submissions.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7C3AED',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + New Version
              </button>
            </div>

            {submissions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.84375rem', backgroundColor: '#FAFAFC', borderRadius: '10px' }}>
                No deliverables submitted yet. Click <strong>Submit Deliverable</strong> to upload V1.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: '6px' }}>
                          V{sub.version}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                          {sub.title}
                        </span>
                        {(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at) && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              color: '#4B5563',
                              fontWeight: 500,
                              backgroundColor: '#F3F4F6',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                            }}
                            title="Uploaded Date & Time"
                          >
                            <Clock size={12} color="#6B7280" />
                            <span>{formatDateTimeWithTime(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at)}</span>
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: sub.status === 'APPROVED' ? '#ECFDF5' : '#FFFBEB',
                          color: sub.status === 'APPROVED' ? '#059669' : '#D97706',
                          border: sub.status === 'APPROVED' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        }}
                      >
                        {sub.status || 'PENDING_REVIEW'}
                      </span>
                    </div>

                    {(() => {
                      let parsed = null;
                      try {
                        parsed = typeof sub.notes === 'string' ? JSON.parse(sub.notes) : sub.notes;
                      } catch (e) {
                        try {
                          parsed = typeof sub.description === 'string' ? JSON.parse(sub.description) : null;
                        } catch (e2) {}
                      }

                      if (parsed && typeof parsed === 'object') {
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
                            {parsed.leadList && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                                Leads: {parsed.leadList.count || '50'} ({parsed.leadList.fileName})
                              </span>
                            )}
                            {parsed.keyPeople?.length > 0 && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '2px 6px', borderRadius: '4px', border: '1px solid #DDD4FA' }}>
                                Key People: {parsed.keyPeople.length} contacts
                              </span>
                            )}
                            {parsed.pitchDeck && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                                Pitch Deck: {parsed.pitchDeck.fileName}
                              </span>
                            )}
                          </div>
                        );
                      }

                      return sub.description ? (
                        <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.4 }}>
                          {sub.description}
                        </p>
                      ) : null;
                    })()}

                    {/* Files attached */}
                    {sub.files && sub.files.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {sub.files.map((f, fIdx) => {
                          const token = localStorage.getItem('cg_auth_token') || '';
                          const fileId = f.id || f._id;
                          let downloadHref = '#';
                          if (fileId) {
                            downloadHref = api.getAssetDownloadUrl(fileId);
                          } else if (f.downloadUrl) {
                            downloadHref = token 
                              ? `${f.downloadUrl}${f.downloadUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
                              : f.downloadUrl;
                          } else if (f.url) {
                            if (f.url.startsWith('http://') || f.url.startsWith('https://')) {
                              downloadHref = f.url;
                            } else {
                              downloadHref = `/api/assets/${encodeURIComponent(f.url)}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                            }
                          }

                          return (
                            <a
                              key={fIdx}
                              href={downloadHref}
                              target="_blank"
                              rel="noreferrer"
                              download={f.name || 'download'}
                              onClick={async (e) => {
                                if (fileId) {
                                  e.preventDefault();
                                  try {
                                    await api.downloadAssetBlob(fileId, f.name);
                                  } catch (err) {
                                    window.open(downloadHref, '_blank');
                                  }
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#F3F4F6',
                                color: '#374151',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <FileText size={13} color="#7C3AED" />
                              <span>{f.name}</span>
                              <Download size={12} color="#6B7280" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation / Client Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Conversation Panel */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              height: '540px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>
                  Chat with Client: {request.clientCompany || 'Data I2I'}
                </h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '2px 7px', borderRadius: '4px' }}>
                  {request.ticketId}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                Direct communication channel with {request.clientName || 'Client'} ({request.clientEmail || 'client'})
              </div>
            </div>

            {/* Message Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  No messages yet. Send an update or question to the client.
                </div>
              ) : (
                messages.map((m) => {
                  const isSpecialist = m.senderRole !== 'USER' && m.sender_role !== 'USER';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isSpecialist ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: isSpecialist ? '#F5F3FF' : '#F3F4F6',
                        border: isSpecialist ? '1px solid #DDD4FA' : '1px solid #E5E7EB',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isSpecialist ? '#7C3AED' : '#4B5563', marginBottom: '2px' }}>
                        {m.senderName || m.sender_name || (isSpecialist ? 'You (Lead Specialist)' : (request.clientCompany || 'Client'))}
                      </div>
                      <div style={{ fontSize: '0.84375rem', color: '#111827', lineHeight: 1.4 }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px', textAlign: 'right' }}>
                        {formatDateTimeWithTime(m.createdAt || m.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Reply to client..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.84375rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSendingMessage || !newMessage.trim()}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  cursor: isSendingMessage || !newMessage.trim() ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Deliverable Upload Modal */}
      <DeliverableUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        ticket={request}
        ticketId={request.ticketId}
        ticketTitle={request.title}
        clientCompany={request.clientCompany}
        versionNumber={(submissions.length || 0) + 1}
        onSuccess={loadTicketData}
      />
    </div>
  );
}
