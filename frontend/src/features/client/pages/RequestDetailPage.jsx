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
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Globe,
  Search,
  Upload,
  Target,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import TicketTimeline from '../../../components/tickets/TicketTimeline';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { api } from '../../../services/api';
import { formatDateTime } from '../utils/clientAdapters';
import {
  resolveSubmissionLeads,
  parseLeadsFile,
  exportLeadsToCsv,
  enrichLeadRow,
  synthesizeFallbackLeads
} from '../utils/leadDataEnricher';

/**
 * Safely parses submission payload notes or description
 */
function parseSubmissionDetails(sub) {
  if (!sub) return { isParsed: false, rawText: '', leads: [] };
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
    const rawLeads = Array.isArray(parsed.leadList?.leads)
      ? parsed.leadList.leads
      : Array.isArray(parsed.leads)
      ? parsed.leads
      : Array.isArray(parsed.keyPeople)
      ? parsed.keyPeople
      : [];

    return {
      isParsed: true,
      data: parsed,
      keyPeople: Array.isArray(parsed.keyPeople) ? parsed.keyPeople : [],
      leadList: parsed.leadList || null,
      companyStudy: parsed.companyStudy || null,
      pitchDeck: parsed.pitchDeck || null,
      aiVerification: parsed.aiVerification || null,
      leads: rawLeads,
    };
  }

  return {
    isParsed: false,
    rawText: sub.notes || sub.description || sub.summary || 'Official deliverable package submitted by specialist.',
    leads: [],
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

  // Interactive lead list showcase states
  const [expandedSubs, setExpandedSubs] = useState(() => new Set(['all', 0, 1]));
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [localUploadedLeads, setLocalUploadedLeads] = useState({});
  const [isUploadingSpreadsheet, setIsUploadingSpreadsheet] = useState(false);

  const toggleSubExpanded = (key) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleClientSpreadsheetUpload = async (subKey, file) => {
    if (!file) return;
    setIsUploadingSpreadsheet(true);
    try {
      const parsed = await parseLeadsFile(file, { companyName: ticket?.clientCompany });
      if (parsed && parsed.length > 0) {
        setLocalUploadedLeads((prev) => ({ ...prev, [subKey]: parsed }));
        setExpandedSubs((prev) => new Set([...prev, subKey, 'all']));
      } else {
        alert('No lead rows could be extracted from the uploaded spreadsheet.');
      }
    } catch (err) {
      alert('Failed to parse spreadsheet file: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingSpreadsheet(false);
    }
  };

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

      {/* Main Grid: Deliverables & Specialist Conversation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Deliverables & Submissions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '600px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F3F4F6',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #EDE9FE',
                  flexShrink: 0,
                }}
              >
                <Package size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Deliverables & Submissions
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78125rem', color: '#6B7280' }}>
                  Review delivered sprint packages, inspect generated prospect rows, and access individual lead studies.
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #DDD4FA',
                whiteSpace: 'nowrap',
              }}
            >
              {submissions.length} submission{submissions.length === 1 ? '' : 's'}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                borderRadius: '12px',
                backgroundColor: '#FAFAFC',
                border: '1px dashed #D1D5DB',
                textAlign: 'center',
                margin: 'auto 0',
              }}
            >
              <Package size={32} color="#9CA3AF" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#374151' }}>
                Specialist work is currently in progress
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '6px 0 0', maxWidth: '380px' }}>
                Once the specialist uploads deliverables, dossiers, or assets, they will appear here for your review and approval.
              </p>
            </div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {submissions.map((sub, idx) => {
                  const detail = parseSubmissionDetails(sub);
                  const subKey = sub.id || idx;
                  const isSubExpanded = expandedSubs.has(subKey) || expandedSubs.has('all');

                  const resolvedLeads = (localUploadedLeads[subKey] && localUploadedLeads[subKey].length > 0)
                    ? localUploadedLeads[subKey]
                    : resolveSubmissionLeads(sub, ticket, companyLeads);

                  const filteredLeads = leadSearchQuery.trim()
                    ? resolvedLeads.filter(l =>
                        (l.name && l.name.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                        (l.title && l.title.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                        (l.company && l.company.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                        (l.email && l.email.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                        (l.whySuitsBest && l.whySuitsBest.toLowerCase().includes(leadSearchQuery.toLowerCase()))
                      )
                    : resolvedLeads;

                  return (
                    <div
                      key={subKey}
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
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleSubExpanded(subKey)}
                        title="Click to toggle submission view"
                      >
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubExpanded(subKey);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: isSubExpanded ? '#EDE9FE' : '#FFFFFF',
                              border: '1px solid #DDD4FA',
                              color: '#6D28D9',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title="Click to toggle row-wise leads view"
                          >
                            <Users size={12} />
                            <span>{isSubExpanded ? 'Hide Leads Table' : 'Inspect Leads'}</span>
                            {isSubExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          <StatusBadge status={sub.status || 'CLIENT_REVIEW'} size="sm" />
                        </div>
                      </div>

                      {/* Deliverable Fulfillment Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <span
                          onClick={() => toggleSubExpanded(subKey)}
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
                            cursor: 'pointer',
                          }}
                          title="Click to view leads table"
                        >
                          <Users size={12} />
                          <span>{resolvedLeads.length || detail.leadList?.count || '50'} Verified Leads Database</span>
                          {isSubExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </span>

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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                          {sub.files.map((f, fIdx) => {
                            const token = localStorage.getItem('cg_auth_token') || '';
                            const fileId = f.id || f._id;

                            // Determine reliable download URL
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
                                title={`Download ${f.name}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #C4B5FD',
                                  color: '#374151',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#7C3AED';
                                  e.currentTarget.style.backgroundColor = '#F5F3FF';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#C4B5FD';
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                }}
                              >
                                <FileText size={15} color="#7C3AED" />
                                <span>{f.name}</span>
                                <Download size={14} color="#6B7280" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* PROSPECT SHOWCASE ROW-WISE LEADS TABLE (MATCHING SCREENSHOT 2) */}
                      {isSubExpanded && resolvedLeads.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Leads Showcase Header, Toolbar & Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={16} color="#7C3AED" />
                                <span>Researched Leads & Key Contacts ({resolvedLeads.length})</span>
                                {leadSearchQuery.trim() && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                                    • {filteredLeads.length} matching search
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                Click any row or "Inspect Card ↗" to view the complete intelligence dossier, company study, and tailored pitch deck.
                              </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Search Input */}
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px' }} />
                                <input
                                  type="text"
                                  value={leadSearchQuery}
                                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                                  placeholder="Search leads, role, company..."
                                  style={{
                                    padding: '6px 10px 6px 30px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.78rem',
                                    outline: 'none',
                                    backgroundColor: '#FFFFFF',
                                    width: '180px',
                                  }}
                                />
                                {leadSearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => setLeadSearchQuery('')}
                                    style={{ position: 'absolute', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>

                              {/* Export CSV Button */}
                              <button
                                type="button"
                                onClick={() => exportLeadsToCsv(resolvedLeads, `${ticket?.ticketId || 'CG-1010'}_Verified_Leads.csv`)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #CBD5E1',
                                  color: '#334155',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Export all verified leads to CSV"
                              >
                                <Download size={13} color="#2563EB" />
                                <span>Export CSV</span>
                              </button>

                              {/* Upload / Replace Spreadsheet Button */}
                              <label
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FAF5FF',
                                  border: '1px solid #DDD4FA',
                                  color: '#6D28D9',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                                title="Upload or replace with your own CSV / Excel leads file"
                              >
                                <Upload size={13} color="#7C3AED" />
                                <span>{isUploadingSpreadsheet ? 'Parsing...' : 'Upload CSV/Excel'}</span>
                                <input
                                  type="file"
                                  accept=".xlsx,.csv,.xls,.tsv"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleClientSpreadsheetUpload(subKey, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Leads Table Container Matching Screenshot 2 */}
                          <div
                            style={{
                              border: '1px solid #E2E8F0',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              backgroundColor: '#FFFFFF',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            {/* Table Header matching Screenshot 2 */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(240px, 1.3fr) minmax(180px, 1fr) minmax(280px, 1.8fr) 140px',
                                alignItems: 'center',
                                padding: '12px 24px',
                                backgroundColor: '#F8FAFC',
                                borderBottom: '1px solid #E2E8F0',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: '#64748B',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              <div>EXECUTIVE LEAD</div>
                              <div>COMPANY HE BELONGS TO</div>
                              <div>WHY THIS LEAD SUITS BEST</div>
                              <div style={{ textAlign: 'right' }}>DOSSIER</div>
                            </div>

                            {/* Table Rows matching Screenshot 2 */}
                            {filteredLeads.length === 0 ? (
                              <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                                No leads matching "{leadSearchQuery}". Clear search to view all {resolvedLeads.length} leads.
                              </div>
                            ) : (
                              filteredLeads.map((lead, lIdx) => (
                                <div
                                  key={lead.id || lIdx}
                                  onClick={() => setInspectingLead(lead)}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(240px, 1.3fr) minmax(180px, 1fr) minmax(280px, 1.8fr) 140px',
                                    alignItems: 'center',
                                    padding: '18px 24px',
                                    borderBottom: lIdx === filteredLeads.length - 1 ? 'none' : '1px solid #F1F5F9',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s ease',
                                    backgroundColor: '#FFFFFF',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                >
                                  {/* Column 1: Lead Avatar, Name & Title */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    {lead.logo ? (
                                      <img
                                        src={lead.logo}
                                        alt={lead.company}
                                        style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '2px' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div
                                        style={{
                                          width: '42px',
                                          height: '42px',
                                          borderRadius: '10px',
                                          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                          color: '#2563EB',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: 800,
                                          fontSize: '1rem',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {lead.name?.charAt(0) || 'L'}
                                      </div>
                                    )}

                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {lead.name}
                                        </span>
                                        <ShieldCheck size={14} color="#10B981" title="Verified Decision Maker" />
                                        {(lead.pitchDeck || lead.pitchDeckPdf) && (
                                          <span style={{ fontSize: '0.7rem', color: '#7C3AED', background: '#F3E8FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                            <Presentation size={10} /> Pitch Deck
                                          </span>
                                        )}
                                        {(lead.leadStudyPdf || lead.leadStudyPdfUrl) && (
                                          <span style={{ fontSize: '0.7rem', color: '#2563EB', background: '#DBEAFE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                            <FileText size={10} /> Study PDF
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {lead.title}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 2: Company he belongs to */}
                                  <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Building2 size={14} color="#64748B" />
                                      <span>{lead.company}</span>
                                    </div>
                                    {lead.companyLink ? (
                                      <a
                                        href={lead.companyLink.startsWith('http') ? lead.companyLink : `https://${lead.companyLink}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 500 }}
                                      >
                                        <Globe size={11} />
                                        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {lead.companyLink.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')}
                                        </span>
                                        <ExternalLink size={10} />
                                      </a>
                                    ) : (
                                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                        {lead.location || lead.industry || 'B2B Enterprise'}
                                      </div>
                                    )}
                                  </div>

                                  {/* Column 3: Why Suits Best (Snippet) */}
                                  <div style={{ paddingRight: '16px' }}>
                                    <div
                                      style={{
                                        fontSize: '0.8125rem',
                                        color: '#475569',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      🎯 <strong style={{ color: '#1E293B' }}>Fit Rationale:</strong> {lead.whySuitsBest || lead.shortSummary}
                                    </div>
                                  </div>

                                  {/* Column 4: Action */}
                                  <div style={{ textAlign: 'right' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#EFF6FF',
                                        color: '#2563EB',
                                        border: '1px solid #BFDBFE',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      Inspect Card ↗
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
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
            height: '600px',
            position: 'sticky',
            top: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F3F4F6',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #EDE9FE',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Specialist Conversation
                </h3>
                <div style={{ fontSize: '0.78125rem', color: '#6B7280', marginTop: '2px' }}>
                  Direct communication with your assigned specialist pod
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6B7280',
                  backgroundColor: '#F9FAFB',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  whiteSpace: 'nowrap',
                }}
              >
                {messages.length} message{messages.length === 1 ? '' : 's'}
              </span>
            )}
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
            {/* Modal Header matching PublicSampleDashboard */}
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
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    {inspectingLead.name ? inspectingLead.name.split(' ').map((n) => n[0]).join('') : 'L'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                      {inspectingLead.name}
                    </h2>
                    <ShieldCheck size={18} color="#10B981" title="Verified Decision Maker" />
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
                  <div style={{ fontSize: '0.875rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    {inspectingLead.title || inspectingLead.designation}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.8125rem', color: '#64748B' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>🏢 {inspectingLead.company}</span>
                    {inspectingLead.location && <span>📍 {inspectingLead.location}</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingLead(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '26px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. LinkedIn & Direct Channels Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                {/* LinkedIn Profile */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    LinkedIn Profile
                  </div>
                  {inspectingLead.linkedin ? (
                    <a
                      href={inspectingLead.linkedin.startsWith('http') ? inspectingLead.linkedin : `https://${inspectingLead.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0A66C2',
                        textDecoration: 'none',
                      }}
                    >
                      <Linkedin size={15} />
                      <span>Verified Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>Profile on file</span>
                  )}
                </div>

                {/* Direct Corporate Email */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Direct Work Email
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.84rem', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                      {inspectingLead.email || '—'}
                    </span>
                    {inspectingLead.email && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inspectingLead.email);
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: copiedEmail ? '#059669' : '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Copy direct work email"
                      >
                        {copiedEmail ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Company Link / Website */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Company Link / Website
                  </div>
                  {inspectingLead.companyLink ? (
                    <a
                      href={inspectingLead.companyLink.startsWith('http') ? inspectingLead.companyLink : `https://${inspectingLead.companyLink}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#2563EB',
                        textDecoration: 'none',
                      }}
                    >
                      <Globe size={14} />
                      <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inspectingLead.companyLink.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>{inspectingLead.company || 'Website on file'}</span>
                  )}
                </div>
              </div>

              {/* 2. Lead Study PDF Attachment */}
              {(inspectingLead.leadStudyPdf || inspectingLead.leadStudyPdfUrl) && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E40AF' }}>
                        Lead Study Research PDF
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#3B82F6' }}>
                        {inspectingLead.leadStudyPdfName || inspectingLead.leadStudyPdf || `${inspectingLead.name} - Deep-Dive Research.pdf`}
                      </div>
                    </div>
                  </div>

                  <a
                    href={inspectingLead.leadStudyPdfUrl && inspectingLead.leadStudyPdfUrl !== '#' ? inspectingLead.leadStudyPdfUrl : '#'}
                    onClick={(e) => {
                      if (!inspectingLead.leadStudyPdfUrl || inspectingLead.leadStudyPdfUrl === '#') {
                        e.preventDefault();
                        alert(`Downloading complete Lead Study PDF for ${inspectingLead.name}...`);
                      }
                    }}
                    target="_blank"
                    rel="noreferrer"
                    download={inspectingLead.leadStudyPdfName || inspectingLead.leadStudyPdf || `${inspectingLead.name}_Lead_Study.pdf`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <Download size={14} />
                    <span>Download / View PDF</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* 3. About the Lead Company */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="#2563EB" />
                  About The Lead's Company ({inspectingLead.company})
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', margin: 0, background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {inspectingLead.aboutCompany || `Leading enterprise operating within the ${inspectingLead.industry || 'technology'} vertical.`}
                </p>
              </div>

              {/* 4. Why This Lead Suits Best For You */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)',
                  border: '1px solid #DDD4FA',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} color="#7C3AED" />
                  Why This Lead Suits Best For You
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4C1D95', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
                  {inspectingLead.whySuitsBest || inspectingLead.shortSummary || 'High-probability prospect with immediate authority and strategic alignment with your growth objectives.'}
                </p>
              </div>

              {/* 5. Lead Study Deep-Dive */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#D97706" />
                  Lead Study: What You Should Know About This Prospect
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      🎯 Why Relevant
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                      {inspectingLead.leadStudy?.whyRelevant || 'Direct budget decision maker aligned with key pain points.'}
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      🔍 Observed Context
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                      {inspectingLead.leadStudy?.observedContext || 'Observed operational growth and procurement signals.'}
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                      🧭 Suggested Approach Angle
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                      {inspectingLead.leadStudy?.suggestedApproach || 'Lead with rapid technical deliverables and measurable SLA proof.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Pitch Deck Proposal For This Lead */}
              {(inspectingLead.pitchDeck || inspectingLead.pitchDeckPdf) && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ maxWidth: '420px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Proposal Pitch Deck For This Lead
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                      {inspectingLead.pitchDeck?.title || `Tailored Pitch Proposal for ${inspectingLead.name}`}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#C7D2FE', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      {inspectingLead.pitchDeck?.summary || 'Turnkey presentation proposal crafted specifically to engage and convert this stakeholder.'}
                    </p>
                  </div>

                  <a
                    href={inspectingLead.pitchDeckPdfUrl && inspectingLead.pitchDeckPdfUrl !== '#' ? inspectingLead.pitchDeckPdfUrl : '#'}
                    onClick={(e) => {
                      if (!inspectingLead.pitchDeckPdfUrl || inspectingLead.pitchDeckPdfUrl === '#') {
                        e.preventDefault();
                        alert(`Viewing tailored pitch deck proposal for ${inspectingLead.name}...`);
                      }
                    }}
                    target="_blank"
                    rel="noreferrer"
                    download={inspectingLead.pitchDeckPdfName || inspectingLead.pitchDeckPdf || `${inspectingLead.name}_Pitch_Deck.pdf`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#FFFFFF',
                      color: '#1E1B4B',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Presentation size={15} />
                    <span>View Lead Pitch Deck PDF</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
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
