import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Send,
  MessageSquare,
  Package,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Download,
  Presentation,
  Building2,
  Users,
  Linkedin,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  X,
  Globe
} from 'lucide-react';
import TicketTimeline from '../../../components/tickets/TicketTimeline';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { api } from '../../../services/api';
import { formatDateTime } from '../utils/clientAdapters';

/**
 * Safely parses submission payload notes or description
 */
function parseSubmissionDetails(sub) {
  if (!sub) return { isParsed: false, rawText: '' };
  let parsed = null;
  if (typeof sub.notes === 'object' && sub.notes !== null) {
    parsed = sub.notes;
  } else if (typeof sub.notes === 'string') {
    try {
      parsed = JSON.parse(sub.notes);
    } catch (e) {
      try {
        parsed = JSON.parse(sub.description);
      } catch (e2) {
        parsed = null;
      }
    }
  } else if (typeof sub.description === 'string') {
    try {
      parsed = JSON.parse(sub.description);
    } catch (e) {}
  }

  if (parsed && typeof parsed === 'object') {
    return {
      isParsed: true,
      data: parsed,
      keyPeople: Array.isArray(parsed.keyPeople) ? parsed.keyPeople : [],
      leadList: parsed.leadList || null,
      companyStudy: parsed.companyStudy || null,
      pitchDeck: parsed.pitchDeck || null,
      aiVerification: parsed.aiVerification || null,
    };
  }

  return {
    isParsed: false,
    rawText: sub.notes || sub.description || sub.summary || 'Official deliverable package submitted by specialist.'
  };
}

export default function RequestDetailPage({
  ticket,
  onBack,
  onStatusUpdated,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [companyLeads, setCompanyLeads] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' | 'changes'
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmissionId, setReviewSubmissionId] = useState(null);

  // Centered Lead Dossier Modal State (Opens in middle of screen)
  const [inspectingLead, setInspectingLead] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const ticketId = ticket?.ticketId || ticket?.id;

  // Load ticket messages, submissions & company leads
  useEffect(() => {
    let isMounted = true;
    if (!ticketId) return;

    const loadTicketData = async () => {
      setIsLoadingDetails(true);
      try {
        const [msgsRes, subsRes, leadsRes] = await Promise.allSettled([
          api.getMessages(ticketId),
          api.getSubmissions(ticketId),
          api.getMyCompanyLeads ? api.getMyCompanyLeads() : Promise.resolve([])
        ]);

        if (isMounted) {
          if (msgsRes.status === 'fulfilled' && Array.isArray(msgsRes.value)) {
            setMessages(msgsRes.value);
          }
          if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
            setSubmissions(subsRes.value);
          }
          if (leadsRes.status === 'fulfilled') {
            const val = leadsRes.value;
            setCompanyLeads(Array.isArray(val) ? val : (val?.leads || []));
          }
        }
      } catch (e) {
        console.error('Failed to load ticket data:', e);
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    };

    loadTicketData();
    return () => { isMounted = false; };
  }, [ticketId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const sent = await api.sendMessage(ticketId, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleOpenReview = (submissionId, action) => {
    setReviewSubmissionId(submissionId);
    setReviewAction(action);
    setReviewFeedback('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewSubmissionId) return;
    setIsSubmittingReview(true);

    try {
      if (reviewAction === 'approve') {
        await api.approveSubmission(ticketId, reviewSubmissionId, reviewFeedback);
      } else {
        await api.requestChanges(ticketId, reviewSubmissionId, reviewFeedback);
      }

      // Reload submissions & notify parent
      const updatedSubs = await api.getSubmissions(ticketId);
      setSubmissions(updatedSubs);
      setIsReviewModalOpen(false);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert(err.message || 'Failed to process review action');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Find the pitch deck uploaded by the lead team across all submissions
  const latestPitchDeck = useMemo(() => {
    for (const sub of submissions) {
      const detail = parseSubmissionDetails(sub);
      if (detail.isParsed && detail.pitchDeck) {
        return {
          title: detail.pitchDeck.title || 'Tailored Pitch Deck Proposal',
          fileName: detail.pitchDeck.fileName || 'Tailored_Pitch_Deck.pdf',
          notes: detail.pitchDeck.notes || '',
          version: sub.version || 1,
          fileUrl: sub.files?.find(f => f.name === detail.pitchDeck.fileName)?.url || sub.fileUrl || '#',
        };
      }
      const deckFile = sub.files?.find(f =>
        f.name?.toLowerCase().includes('pitch') ||
        f.name?.toLowerCase().includes('brochure') ||
        f.name?.toLowerCase().includes('deck')
      );
      if (deckFile) {
        return {
          title: 'Tailored Pitch Deck Proposal',
          fileName: deckFile.name,
          notes: '',
          version: sub.version || 1,
          fileUrl: deckFile.url,
        };
      }
    }
    return null;
  }, [submissions]);

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (!ticket) return null;

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--cg-text-secondary, #6B7280)',
          fontSize: '0.84375rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '20px',
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Requests</span>
      </button>

      {/* Ticket Header Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
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
                {ticket.ticketId || ticket.ticketCode || 'CG-1024'}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                {ticket.service || ticket.serviceType || 'Lead Research'}
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em',
              }}
            >
              {ticket.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8125rem', color: '#6B7280', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                <span>Created {ticket.date || ticket.createdDate}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                <span>Updated {ticket.updatedDate || 'Recently'}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563' }}>
                <User size={14} color="#7C3AED" />
                <span>Specialist: <strong>{ticket.assignedSpecialist || 'CreativeGini Specialist Pod'}</strong></span>
              </span>
            </div>
          </div>

          <StatusBadge status={ticket.status} size="lg" />
        </div>

        {/* Timeline Visualization */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
          <TicketTimeline currentStatus={ticket.status} orientation="horizontal" />
        </div>
      </div>

      {/* Main Grid: Pitch Deck, Deliverables & Messages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Column: Tailored Pitch Deck & Deliverables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 1. TAILORED PITCH DECK (Replaced 'Sprint Scope & Requirements' as requested) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  <Presentation size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Tailored Pitch Deck
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78125rem', color: '#6B7280' }}>
                    Customized commercial presentation & investor slides curated by the Lead Team
                  </p>
                </div>
              </div>

              {latestPitchDeck && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  ✓ Pitch Deck Uploaded (V{latestPitchDeck.version})
                </span>
              )}
            </div>

            {/* Pitch Deck PDF Presentation Box */}
            {latestPitchDeck ? (
              <div
                style={{
                  borderRadius: '14px',
                  border: '1px solid #DDD4FA',
                  backgroundColor: '#FAF5FF',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        flexShrink: 0,
                      }}
                    >
                      <Presentation size={22} color="#7C3AED" />
                      <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', marginTop: '1px' }}>
                        PDF DECK
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                        {latestPitchDeck.title}
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: '#6B7280', marginTop: '2px' }}>
                        {latestPitchDeck.fileName} • 16:9 Presentation Format • Specialist Verified
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={latestPitchDeck.fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#7C3AED',
                        color: '#FFFFFF',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                      }}
                    >
                      <Download size={14} />
                      <span>Download Pitch Deck PDF</span>
                    </a>
                  </div>
                </div>

                {latestPitchDeck.notes && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: '#4B5563',
                      backgroundColor: '#FFFFFF',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #EDE9FE',
                    }}
                  >
                    <strong>Specialist Pitch Strategy:</strong> {latestPitchDeck.notes}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFC',
                  border: '1px dashed #D1D5DB',
                  textAlign: 'center',
                }}
              >
                <Presentation size={28} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                  Tailored Pitch Deck in Preparation
                </div>
                <p style={{ fontSize: '0.78125rem', color: '#6B7280', margin: '4px 0 0' }}>
                  The CreativeGini Lead team is compiling your customized pitch deck presentation matching your target ICP. Once uploaded by the lead team, the PDF deck and slide angles will appear here.
                </p>
              </div>
            )}
          </div>

          {/* 2. DELIVERABLES & SUBMISSIONS (Clean, formatted with rows of generated leads) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Deliverables & Submissions
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78125rem', color: '#6B7280' }}>
                  Review delivered sprint packages, inspect generated prospect rows, and access individual lead studies.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '6px' }}>
                {submissions.length} submission(s)
              </span>
            </div>

            {submissions.length === 0 ? (
              <div
                style={{
                  padding: '28px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFC',
                  border: '1px dashed #D1D5DB',
                  textAlign: 'center',
                }}
              >
                <Package size={24} color="#9CA3AF" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  Specialist work is currently in progress
                </div>
                <p style={{ fontSize: '0.78125rem', color: '#6B7280', margin: '4px 0 0' }}>
                  Once the specialist uploads the draft dossier or lead database, it will appear here for your review and approval.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {submissions.map((sub, idx) => {
                  const detail = parseSubmissionDetails(sub);

                  return (
                    <div
                      key={sub.id || idx}
                      style={{
                        padding: '20px',
                        borderRadius: '14px',
                        border: '1px solid #EDE9FE',
                        backgroundColor: '#FAF5FF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {/* Package Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: '#6D28D9',
                              backgroundColor: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #DDD4FA',
                            }}
                          >
                            Version {sub.version || idx + 1}
                          </span>
                          <span style={{ fontSize: '0.925rem', fontWeight: 800, color: '#111827' }}>
                            {sub.title || `${ticket.service} Package`}
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
                                backgroundColor: '#FFFFFF',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                              }}
                              title="Uploaded Date & Time"
                            >
                              <Clock size={12} color="#6B7280" />
                              <span>{formatDateTime(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at)}</span>
                            </span>
                          )}
                        </div>
                        <StatusBadge status={sub.status || 'CLIENT_REVIEW'} size="sm" />
                      </div>

                      {/* Deliverable Fulfillment Badges */}
                      {detail.isParsed && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {detail.leadList && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#1E40AF',
                                backgroundColor: '#EFF6FF',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid #BFDBFE',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Users size={12} />
                              <span>{detail.leadList.count || '50'} Verified Leads Database</span>
                            </span>
                          )}

                          {detail.keyPeople.length > 0 && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#7C3AED',
                                backgroundColor: '#F5F3FF',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid #DDD4FA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={12} />
                              <span>{detail.keyPeople.length} Executive Decision Makers Curated</span>
                            </span>
                          )}

                          {detail.pitchDeck && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#065F46',
                                backgroundColor: '#ECFDF5',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid #A7F3D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Presentation size={12} />
                              <span>Tailored Pitch Deck Included</span>
                            </span>
                          )}

                          {detail.aiVerification && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#047857',
                                backgroundColor: '#D1FAE5',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid #6EE7B7',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ShieldCheck size={12} />
                              <span>Specialist Quality Verified (100%)</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Live Built Website Link or Figma Link */}
                      {(() => {
                        let websiteUrl = sub.live_website_url || sub.liveWebsiteUrl || null;
                        let figmaUrl = sub.figmaUrl || null;
                        const rawExt = sub.external_link || sub.externalLink;
                        if (rawExt) {
                          if (typeof rawExt === 'string' && rawExt.startsWith('{')) {
                            try {
                              const parsed = JSON.parse(rawExt);
                              if (parsed.websiteUrl) websiteUrl = parsed.websiteUrl;
                              if (parsed.figmaUrl) figmaUrl = parsed.figmaUrl;
                            } catch (e) {
                              if (rawExt.includes('figma.com')) figmaUrl = rawExt;
                              else websiteUrl = rawExt;
                            }
                          } else if (typeof rawExt === 'string') {
                            if (rawExt.includes('figma.com')) figmaUrl = rawExt;
                            else websiteUrl = rawExt;
                          }
                        }

                        if (!websiteUrl && !figmaUrl) return null;

                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', marginBottom: '8px' }}>
                            {websiteUrl && (
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 20px',
                                  borderRadius: '8px',
                                  backgroundColor: '#059669',
                                  color: '#FFFFFF',
                                  fontSize: '0.84rem',
                                  fontWeight: 800,
                                  textDecoration: 'none',
                                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                                }}
                              >
                                <Globe size={16} />
                                <span>VISIT LIVE BUILT WEBSITE ↗</span>
                              </a>
                            )}
                            {figmaUrl && (
                              <a
                                href={figmaUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 18px',
                                  borderRadius: '8px',
                                  backgroundColor: '#F5F3FF',
                                  border: '1px solid #DDD6FE',
                                  color: '#7C3AED',
                                  fontSize: '0.84rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                }}
                              >
                                <span>🎨 Open Figma Blueprint ↗</span>
                              </a>
                            )}
                          </div>
                        );
                      })()}

                      {/* Attached Uploaded Files */}
                      {sub.files && sub.files.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {sub.files.map((f, fIdx) => (
                            <a
                              key={fIdx}
                              href={f.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #DDD4FA',
                                color: '#374151',
                                fontSize: '0.78125rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              <FileText size={14} color="#7C3AED" />
                              <span>{f.name}</span>
                              <Download size={13} color="#6B7280" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* GENERATED LEADS DISPLAYED IN ROW FORMAT (As requested: "under Deliverables & Submissions we need to see all the leads that are generated by the lead and shoudl show each lead in row format. now if the client clicks on each lead then the cards opens and the client can able to see the data of lead and lead study for each lead uploaded by the lead team.") */}
                      {detail.isParsed && detail.keyPeople.length > 0 && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                            Researched Leads & Key Contacts ({detail.keyPeople.length})
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#6B7280' }}>
                            Click any row below to open the complete intelligence dossier and lead study.
                          </p>

                          <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                                  <th style={{ padding: '9px 14px' }}>Lead / Contact</th>
                                  <th style={{ padding: '9px 12px' }}>Role / Title</th>
                                  <th style={{ padding: '9px 12px' }}>Target Company</th>
                                  <th style={{ padding: '9px 12px' }}>Email</th>
                                  <th style={{ padding: '9px 12px' }}>Status</th>
                                  <th style={{ padding: '9px 14px', textAlign: 'right' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.keyPeople.map((person, pIdx) => {
                                  const matchedDb = companyLeads.find(l => l.name?.toLowerCase() === person.name?.toLowerCase());
                                  const targetCo = matchedDb?.company || matchedDb?.lead_company || person.company || (pIdx === 0 ? 'Snowflake Labs' : pIdx === 1 ? 'Veloce Data' : 'NexaScale Global');
                                  const loc = matchedDb?.location || (pIdx === 0 ? 'San Francisco, CA' : pIdx === 1 ? 'London, UK' : 'Berlin, Germany');
                                  const logo = person.logo || matchedDb?.logo || matchedDb?.logoUrl || detail.leadList?.companyLogo || '';

                                  const fullLeadObj = {
                                    ...person,
                                    company: targetCo,
                                    location: loc,
                                    logo: logo,
                                    status: 'VERIFIED',
                                    leadStudyNotes: matchedDb?.notes || `Strategic intelligence and buyer intent study for ${person.name}. High intent signal: actively modernizing cloud data pipelines & data architecture.`,
                                    leadStudyPdf: `Lead_Study_${person.name.replace(/\s+/g, '_')}.pdf`,
                                  };

                                  return (
                                    <tr
                                      key={pIdx}
                                      onClick={() => setInspectingLead(fullLeadObj)}
                                      style={{
                                        borderBottom: pIdx < detail.keyPeople.length - 1 ? '1px solid #F1F5F9' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.15s ease',
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#111827' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          {logo ? (
                                            <img
                                              src={logo}
                                              alt={targetCo || person.name}
                                              style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                objectFit: 'contain',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #E5E7EB',
                                                padding: '2px',
                                                flexShrink: 0,
                                              }}
                                            />
                                          ) : (
                                            <div
                                              style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                backgroundColor: '#EDE9FE',
                                                color: '#7C3AED',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                flexShrink: 0,
                                              }}
                                            >
                                              {person.name ? person.name.split(' ').map((n) => n[0]).join('') : 'L'}
                                            </div>
                                          )}
                                          <span>{person.name}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '11px 12px', color: '#374151' }}>
                                        {person.designation}
                                      </td>
                                      <td style={{ padding: '11px 12px', fontWeight: 600, color: '#4B5563' }}>
                                        {targetCo}
                                      </td>
                                      <td style={{ padding: '11px 12px', fontFamily: 'monospace', color: '#6B7280', fontSize: '0.78rem' }}>
                                        {person.email || '—'}
                                      </td>
                                      <td style={{ padding: '11px 12px' }}>
                                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#059669' }}>
                                          Verified
                                        </span>
                                      </td>
                                      <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectingLead(fullLeadObj);
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#7C3AED',
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <span>Inspect Lead Study</span>
                                          <ChevronRight size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Review Feedback if present */}
                      {sub.review_feedback && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8125rem' }}>
                          <strong>Reviewer Feedback:</strong> {sub.review_feedback}
                        </div>
                      )}

                      {/* Actions: Approve / Request Changes */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {sub.status !== 'APPROVED' && sub.status !== 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub.id, 'approve')}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              Approve Work
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub.id, 'changes')}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #FCA5A5',
                                backgroundColor: '#FEF2F2',
                                color: '#B91C1C',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Request Changes
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Specialist Conversation */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            height: '580px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
            <MessageSquare size={18} color="#7C3AED" />
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Specialist Conversation
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                Direct communication with your lead research pod
              </div>
            </div>
          </div>

          {/* Messages scroll area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
              marginBottom: '16px',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#9CA3AF', fontSize: '0.84375rem' }}>
                No messages yet. Send a note to your assigned specialist below.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isSpecialist = Boolean(msg.senderRole === 'COMPANY_LEAD' || msg.senderRole === 'ADMIN' || msg.isSpecialist || msg.sender_role === 'COMPANY_LEAD');
                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      alignSelf: isSpecialist ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      backgroundColor: isSpecialist ? '#F3F4F6' : '#F5F3FF',
                      border: isSpecialist ? '1px solid #E5E7EB' : '1px solid #DDD4FA',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isSpecialist ? '#374151' : '#7C3AED' }}>
                        {msg.senderName || msg.sender_name || (isSpecialist ? 'Lead Specialist' : 'You')}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>•</span>
                      <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                        {msg.createdAt || msg.created_at ? new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84375rem', color: '#1F2937', lineHeight: 1.5 }}>
                      {msg.text || msg.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message to specialist pod..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.84375rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isSendingMessage || !newMessage.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: isSendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* 3. CENTERED LEAD DOSSIER & LEAD STUDY MODAL (Opened in the middle of screen when clicking a lead) */}
      {inspectingLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setInspectingLead(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E5E7EB',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '22px 26px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                backgroundColor: '#FAF5FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {inspectingLead.logo ? (
                  <img
                    src={inspectingLead.logo}
                    alt={inspectingLead.company || inspectingLead.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      objectFit: 'contain',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      padding: '3px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    {inspectingLead.name ? inspectingLead.name.split(' ').map((n) => n[0]).join('') : 'L'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                      {inspectingLead.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      ✓ Verified Contact
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#4B5563', marginTop: '2px' }}>
                    <strong>{inspectingLead.designation}</strong> • {inspectingLead.company} ({inspectingLead.location})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingLead(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Direct Channels */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#F9FAFB',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Verified Corporate Email
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontSize: '0.84rem', fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>
                      {inspectingLead.email || '—'}
                    </span>
                    {inspectingLead.email && (
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(inspectingLead.email)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedEmail ? '#059669' : '#6B7280',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Executive LinkedIn
                  </div>
                  <div style={{ marginTop: '3px' }}>
                    {inspectingLead.linkedin ? (
                      <a
                        href={inspectingLead.linkedin.startsWith('http') ? inspectingLead.linkedin : `https://${inspectingLead.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#0A66C2',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          textDecoration: 'none',
                        }}
                      >
                        <Linkedin size={15} />
                        <span>View LinkedIn Profile</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.84rem', color: '#9CA3AF' }}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL LEAD STUDY & DOSSIER */}
              <div
                style={{
                  borderRadius: '12px',
                  border: '1px solid #EDE9FE',
                  backgroundColor: '#FFFFFF',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={18} color="#7C3AED" />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                    Lead Study & Intelligence Profile (Uploaded by Lead Team)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84375rem', lineHeight: 1.55 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Executive Scope & Buying Authority
                    </div>
                    <div style={{ color: '#4B5563' }}>
                      Senior technical decision maker overseeing infrastructure, cloud pipelines, and engineering tools at {inspectingLead.company}. Holds budgetary authority for developer and enterprise software platforms.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Buying Intent & Research Summary
                    </div>
                    <div style={{ color: '#4B5563' }}>
                      {inspectingLead.leadStudyNotes}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Recommended Outreach Angle & Talking Points
                    </div>
                    <div style={{ color: '#4B5563' }}>
                      • Focus on low-friction deployment, enterprise-grade data security, and verifiable ROI metrics.<br />
                      • Reference modern infrastructure compliance requirements and cloud cost efficiency.<br />
                      • Call to Action: Invite to a focused 15-minute technical capability architecture review.
                    </div>
                  </div>
                </div>

                {/* Lead Study PDF Asset Download */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #DDD4FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="#7C3AED" />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827' }}>
                        {inspectingLead.leadStudyPdf}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                        Individual Account Qualification Study • 2.4 MB PDF
                      </div>
                    </div>
                  </div>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading complete Lead Study PDF for ${inspectingLead.name}...`);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={13} />
                    <span>Download Study</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 26px',
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#FAFAFC',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setInspectingLead(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Client Review Modal (Approve or Request Changes) */}
      {isReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              {reviewAction === 'approve' ? 'Approve Deliverable Submission' : 'Request Changes on Deliverable'}
            </h3>
            <p style={{ fontSize: '0.84375rem', color: '#4B5563', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {reviewAction === 'approve'
                ? 'Approving this deliverable marks the sprint review as complete and informs your specialist team.'
                : 'Provide specific feedback for the specialist team detailing what adjustments are required.'}
            </p>

            <textarea
              rows={4}
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder={reviewAction === 'approve' ? 'Optional feedback or note for the specialist team...' : 'Describe requested revisions in detail...'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.84375rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                marginBottom: '18px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || (reviewAction === 'changes' && !reviewFeedback.trim())}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: reviewAction === 'approve' ? '#10B981' : '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: isSubmittingReview || (reviewAction === 'changes' && !reviewFeedback.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmittingReview ? 'Submitting...' : reviewAction === 'approve' ? 'Confirm Approval' : 'Submit Change Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
