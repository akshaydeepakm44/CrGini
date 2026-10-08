import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Download,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  Send,
  User,
  Building,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatBoostDate, formatBoostDateTime } from '../data/boostAdapters';
import { canStartWork, canSubmitDeliverables } from '../utils/boostStatusUtils';
import DeliverableUploadModal from './DeliverableUploadModal';
import DeliverableList from './DeliverableList';
import ReviewStatus from './ReviewStatus';

export default function ServiceWorkspace({
  serviceConfig,
  requests = [],
  onSelectTicket,
  onRefreshData,
  user
}) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('brief'); // 'brief' | 'work' | 'deliverables' | 'messages'
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketSubmissions, setTicketSubmissions] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isStartingWork, setIsStartingWork] = useState(false);
  const [checklistState, setChecklistState] = useState({});
  const [specialistNotes, setSpecialistNotes] = useState('');

  // Filter requests belonging to this service
  const serviceRequests = requests.filter(
    (r) => r.serviceSlug === serviceConfig.slug || r.service?.slug === serviceConfig.slug
  );

  // Auto-select first request if none selected
  useEffect(() => {
    if (!selectedTicket && serviceRequests.length > 0) {
      setSelectedTicket(serviceRequests[0]);
    } else if (selectedTicket) {
      // Keep selected ticket up to date
      const updated = serviceRequests.find((r) => r.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [serviceRequests.length]);

  // Load ticket details when selectedTicket changes
  useEffect(() => {
    if (selectedTicket) {
      const ticketId = selectedTicket.id || selectedTicket._id;
      Promise.allSettled([
        api.getMessages(ticketId),
        api.getSubmissions(ticketId)
      ]).then(([msgRes, subRes]) => {
        if (msgRes.status === 'fulfilled') {
          setTicketMessages(Array.isArray(msgRes.value) ? msgRes.value : []);
        }
        if (subRes.status === 'fulfilled') {
          setTicketSubmissions(Array.isArray(subRes.value) ? subRes.value : []);
        }
      });

      // Load persistent specialist notes from local storage
      const savedNotesKey = `cg_boost_notes_${ticketId}`;
      const savedNotes = localStorage.getItem(savedNotesKey) || '';
      setSpecialistNotes(savedNotes);

      // Load persistent checklist state
      const savedCheckKey = `cg_boost_check_${ticketId}`;
      try {
        const savedCheck = JSON.parse(localStorage.getItem(savedCheckKey) || '{}');
        setChecklistState(savedCheck);
      } catch {
        setChecklistState({});
      }
    }
  }, [selectedTicket?.id]);

  const handleToggleChecklist = (index) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.id || selectedTicket._id;
    const updated = { ...checklistState, [index]: !checklistState[index] };
    setChecklistState(updated);
    localStorage.setItem(`cg_boost_check_${ticketId}`, JSON.stringify(updated));
  };

  const handleNotesChange = (val) => {
    if (!selectedTicket) return;
    setSpecialistNotes(val);
    const ticketId = selectedTicket.id || selectedTicket._id;
    localStorage.setItem(`cg_boost_notes_${ticketId}`, val);
  };

  const handleStartWork = async () => {
    if (!selectedTicket) return;
    try {
      setIsStartingWork(true);
      await api.startWork(selectedTicket.id || selectedTicket._id);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Failed to start work: ' + err.message);
    } finally {
      setIsStartingWork(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket) return;
    try {
      setIsSendingMessage(true);
      const newMsg = await api.sendMessage(
        selectedTicket.id || selectedTicket._id,
        newMessageText.trim(),
        false
      );
      setTicketMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const ServiceIcon = serviceConfig.icon || Inbox;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Service Discipline Header */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: serviceConfig.bgColor || '#F5F3FF',
              border: `1px solid ${serviceConfig.borderColor || '#DDD6FE'}`,
              color: serviceConfig.color || '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <ServiceIcon size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {serviceConfig.name}
              </h1>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: serviceConfig.bgColor,
                  color: serviceConfig.color,
                  border: `1px solid ${serviceConfig.borderColor}`,
                  textTransform: 'uppercase',
                }}
              >
                {serviceConfig.categoryLabel}
              </span>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: '4px 0 0',
                maxWidth: '680px',
              }}
            >
              {serviceConfig.headline}
            </p>
          </div>
        </div>

        {/* Operational counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>
              {serviceRequests.length}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>
              Total Requests
            </div>
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#059669' }}>
              {serviceRequests.filter((r) => r.status === 'COMPLETED').length}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#047857', fontWeight: 600 }}>
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* 2. Workspace Body: Left Request Selector + Right Work Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Queue: Service Requests */}
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
              padding: '14px 18px',
              backgroundColor: '#F9FAFB',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
              Service Queue ({serviceRequests.length})
            </span>
          </div>

          <div style={{ maxHeight: '680px', overflowY: 'auto' }}>
            {serviceRequests.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280', fontSize: '0.8125rem' }}>
                No active requests for {serviceConfig.name}
              </div>
            ) : (
              serviceRequests.map((req) => {
                const isSelected = selectedTicket?.id === req.id;
                return (
                  <div
                    key={req.id || req.ticketId}
                    onClick={() => setSelectedTicket(req)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                      borderLeft: isSelected ? '4px solid #7C3AED' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                        {req.ticketId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          backgroundColor: req.statusConfig?.bg,
                          color: req.statusConfig?.color,
                        }}
                      >
                        {req.statusConfig?.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.3,
                        marginBottom: '4px',
                      }}
                    >
                      {req.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
                      <span>{req.clientCompany}</span>
                      <span>{formatBoostDate(req.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Ticket Workbench */}
        {selectedTicket ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Active Ticket Header & Action Strip */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                      {selectedTicket.ticketId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: selectedTicket.statusConfig?.bg,
                        color: selectedTicket.statusConfig?.color,
                        border: `1px solid ${selectedTicket.statusConfig?.border}`,
                      }}
                    >
                      {selectedTicket.statusConfig?.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: selectedTicket.priorityConfig?.bg,
                        color: selectedTicket.priorityConfig?.color,
                      }}
                    >
                      {selectedTicket.priorityConfig?.label} Priority
                    </span>
                  </div>
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#111827',
                      margin: '0 0 6px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {selectedTicket.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: '#6B7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={14} />
                      <strong style={{ color: '#374151' }}>{selectedTicket.clientCompany}</strong> ({selectedTicket.clientName})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      Created {formatBoostDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSubmissionModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Deliverables</span>
                  </button>
                </div>
              </div>

              {/* Review status notice if changes requested or client review */}
              <div style={{ marginTop: '16px' }}>
                <ReviewStatus
                  status={selectedTicket.status}
                  latestFeedback={selectedTicket.raw?.feedback || ''}
                  onOpenResubmit={() => setIsSubmissionModalOpen(true)}
                />
              </div>

              {/* Workspace Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid #F3F4F6',
                  marginTop: '16px',
                  paddingTop: '12px',
                }}
              >
                {[
                  { key: 'brief', label: '1. Client Requirement & Brief' },
                  { key: 'work', label: '2. Production Workspace' },
                  { key: 'deliverables', label: `3. Deliverables (${ticketSubmissions.length})` },
                  { key: 'messages', label: `4. Conversation (${ticketMessages.length})` },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#7C3AED' : '#4B5563',
                        backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                        border: isActive ? '1px solid #DDD6FE' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 1: Client Brief & Requirement */}
            {activeTab === 'brief' && (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Submitted Requirement Description */}
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Client Objective & Scope
                  </h3>
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.9375rem',
                      color: '#1F2937',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedTicket.description || 'No detailed scope description provided by client.'}
                  </div>
                </div>

                {/* Structured Requirements from Notes */}
                {selectedTicket.requirements && Object.keys(selectedTicket.requirements).length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Sprint Specifications
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                      {Object.entries(selectedTicket.requirements).map(([k, v]) => {
                        if (typeof v === 'object' || k === 'rawNotes') return null;
                        return (
                          <div
                            key={k}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF',
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

                {/* Client Uploaded Attachments */}
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Client Attachments & Reference Materials ({selectedTicket.attachments?.length || 0})
                  </h3>
                  {(!selectedTicket.attachments || selectedTicket.attachments.length === 0) ? (
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '#F9FAFB',
                        border: '1px dashed #E5E7EB',
                        textAlign: 'center',
                        color: '#6B7280',
                        fontSize: '0.8125rem',
                      }}
                    >
                      No client files attached to this ticket
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                      {selectedTicket.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <FileText size={16} color="#7C3AED" />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                              {att.name || `Attachment-${idx + 1}`}
                            </span>
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#7C3AED', padding: '4px' }}
                              title="Download attachment"
                            >
                              <Download size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Production Workspace */}
            {activeTab === 'work' && (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Service Checklist */}
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {serviceConfig.name} Specialist Production Checklist
                  </h3>
                  <div
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {serviceConfig.checklist.map((item, idx) => {
                      const isChecked = Boolean(checklistState[idx]);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleChecklist(idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          {isChecked ? (
                            <CheckSquare size={18} color="#059669" />
                          ) : (
                            <Square size={18} color="#9CA3AF" />
                          )}
                          <span
                            style={{
                              fontSize: '0.875rem',
                              color: isChecked ? '#6B7280' : '#1F2937',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              fontWeight: isChecked ? 500 : 600,
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specialist Working Notes */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', margin: 0 }}>
                      Internal Working Notes & Research
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                      Saved automatically
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={specialistNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Draft working copy, outline strategic points, paste reference links, or log internal notes for this ticket..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.875rem',
                      color: '#111827',
                      lineHeight: 1.6,
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Expected Deliverables Guide */}
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Deliverable Specifications
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {serviceConfig.deliverableTypes.map((type, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        <Layers size={14} color="#7C3AED" />
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Deliverables & Versions */}
            {activeTab === 'deliverables' && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                      Deliverables & Version History
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
                      All submissions, revisions, and approval statuses for this ticket
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
                    <span>Upload New Version</span>
                  </button>
                </div>

                <DeliverableList submissions={ticketSubmissions} currentStatus={selectedTicket.status} />
              </div>
            )}

            {/* Tab 4: Messages Conversation */}
            {activeTab === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '560px' }}>
                {/* Message stream */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ticketMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280', fontSize: '0.875rem' }}>
                      No messages on this ticket yet. Start the conversation with the client.
                    </div>
                  ) : (
                    ticketMessages.map((msg, idx) => {
                      const isClient = msg.senderType === 'CLIENT' || msg.sender_role === 'USER' || msg.isClient;
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
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
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
                            {msg.senderName || (isClient ? selectedTicket.clientName : (user?.name || 'Boost Specialist'))} • {formatBoostDateTime(msg.createdAt || msg.created_at)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message input */}
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
                    placeholder="Type a message or progress update to the client..."
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
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E5E7EB',
              padding: '60px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <ServiceIcon size={36} color="#9CA3AF" />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
              Select a ticket to open the {serviceConfig.name} workspace
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Pick any ticket from the queue on the left to start production or submit deliverables.
            </div>
          </div>
        )}
      </div>

      {/* Deliverable submission modal */}
      {isSubmissionModalOpen && selectedTicket && (
        <DeliverableUploadModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          ticket={selectedTicket}
          onSuccess={() => {
            if (onRefreshData) onRefreshData();
            // Re-fetch submissions
            api.getSubmissions(selectedTicket.id || selectedTicket._id).then((subs) => {
              setTicketSubmissions(Array.isArray(subs) ? subs : []);
            });
          }}
        />
      )}
    </div>
  );
}
