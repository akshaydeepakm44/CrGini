import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  PenTool,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Sparkles,
  Globe,
  Layers
} from 'lucide-react';

export default function DesignDeliverableUpload({
  isOpen,
  ticket,
  nextVersion = 1,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  if (!isOpen || !ticket) return null;

  const fileInputRef = useRef(null);
  const isRevision = nextVersion > 1;

  // Deliverable Phase: 'blueprint' (Step 2 confirmation & Figma) vs 'live_website' (Final live built site)
  const [deliverablePhase, setDeliverablePhase] = useState('blueprint');

  const [title, setTitle] = useState(
    `${ticket.title} — Requirement Confirmation & Blueprint V${nextVersion}`
  );
  const [description, setDescription] = useState(
    isRevision
      ? `Revised design deliverables addressing client feedback (V${nextVersion}).`
      : `Comprehensive audit documentation confirming client requirements are met, accompanied by Figma blueprint specifications.`
  );
  const [externalLink, setExternalLink] = useState(ticket.figmaUrl || '');
  const [liveWebsiteUrl, setLiveWebsiteUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isQualityVerified, setIsQualityVerified] = useState(true);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handlePhaseChange = (phase) => {
    setDeliverablePhase(phase);
    if (phase === 'blueprint') {
      setTitle(`${ticket.title} — Requirement Confirmation & Blueprint V${nextVersion}`);
      setDescription(`Comprehensive audit documentation confirming client requirements are met, accompanied by Figma blueprint specifications.`);
    } else {
      setTitle(`${ticket.title} — Live Built Website Delivery V${nextVersion}`);
      setDescription(`Production website built and deployed according to approved design blueprint. Fully interactive on live HTTPS server.`);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    uploadedFiles.forEach((file) => {
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url: event.target.result,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this deliverable version.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the completed work.');
      return;
    }

    if (deliverablePhase === 'live_website') {
      if (!liveWebsiteUrl.trim()) {
        setError('Please provide the live HTTPS website URL for client inspection.');
        return;
      }
      if (!liveWebsiteUrl.trim().startsWith('http')) {
        setError('Website URL must start with https:// or http://');
        return;
      }
    } else {
      if (files.length === 0 && !externalLink.trim()) {
        setError('Please upload at least one confirmation document / asset or provide a Figma project URL.');
        return;
      }
    }

    setError('');
    const externalPayload = liveWebsiteUrl.trim()
      ? JSON.stringify({ websiteUrl: liveWebsiteUrl.trim(), figmaUrl: externalLink.trim(), phase: deliverablePhase })
      : (externalLink.trim() || null);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      externalLink: externalPayload,
      liveWebsiteUrl: liveWebsiteUrl.trim() || undefined,
      deliverablePhase,
      notes: notes.trim() || (isQualityVerified ? 'Verified by Specialist: All client brief requirements confirmed satisfied.' : ''),
      files,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                V{nextVersion}
              </span>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isRevision ? 'Submit Revised Deliverables' : 'Upload Design Deliverables'}
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Ticket: <strong style={{ color: '#334155' }}>{ticket.ticketId}</strong> • Client: {ticket.clientCompany}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748B',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '0.8125rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Client Sprint Specifications Banner */}
          {ticket.requirements && Object.keys(ticket.requirements).length > 0 && (
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#0284C7" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Client Sprint Specifications & Design Requirements
                  </span>
                </div>
                {ticket.requirements.targetUrl && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Globe size={12} /> {ticket.requirements.targetUrl}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                {ticket.requirements.designScope && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Design Scope</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.designScope}</div>
                  </div>
                )}
                {ticket.requirements.redesignObjective && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Redesign Objective</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.redesignObjective}</div>
                  </div>
                )}
                {ticket.requirements.primaryUserFlow && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Primary User Flow</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.primaryUserFlow}</div>
                  </div>
                )}
                {ticket.requirements.knownFriction && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Known Friction Areas</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.knownFriction}</div>
                  </div>
                )}
                {ticket.requirements.targetAudience && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Target Audience</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.targetAudience}</div>
                  </div>
                )}
                {ticket.requirements.brandGuidelines && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Brand Guidelines</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{ticket.requirements.brandGuidelines}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase Switcher Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Select Deliverable Phase
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handlePhaseChange('blueprint')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: deliverablePhase === 'blueprint' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                  backgroundColor: deliverablePhase === 'blueprint' ? '#FAF5FF' : '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <PenTool size={16} color={deliverablePhase === 'blueprint' ? '#7C3AED' : '#64748B'} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: deliverablePhase === 'blueprint' ? '#581C87' : '#1E293B' }}>
                    Step 2: Blueprint & Docs
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Confirmation doc + Figma blueprint for client review
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePhaseChange('live_website')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: deliverablePhase === 'live_website' ? '2px solid #059669' : '1px solid #E2E8F0',
                  backgroundColor: deliverablePhase === 'live_website' ? '#ECFDF5' : '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ExternalLink size={16} color={deliverablePhase === 'live_website' ? '#059669' : '#64748B'} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: deliverablePhase === 'live_website' ? '#065F46' : '#1E293B' }}>
                    Final Build: Live Website
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Live HTTPS deployed website for client inspection
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Deliverable Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Page Redesign & Component Specs"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Live Website HTTPS URL (Required if Live Website Phase, optional otherwise) */}
          <div style={{ marginBottom: '16px', backgroundColor: deliverablePhase === 'live_website' ? '#F0FDF4' : '#FAFAFA', padding: '14px', borderRadius: '10px', border: deliverablePhase === 'live_website' ? '1px solid #A7F3D0' : '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: deliverablePhase === 'live_website' ? '#065F46' : '#334155', margin: 0 }}>
                <ExternalLink size={14} style={{ color: deliverablePhase === 'live_website' ? '#059669' : '#0284C7' }} />
                <span>Live Website HTTPS Address {deliverablePhase === 'live_website' ? '*' : '(Optional)'}</span>
              </label>
              {liveWebsiteUrl && liveWebsiteUrl.startsWith('http') && (
                <a
                  href={liveWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textDecoration: 'none' }}
                >
                  Test Link ↗
                </a>
              )}
            </div>
            <input
              type="url"
              value={liveWebsiteUrl}
              onChange={(e) => setLiveWebsiteUrl(e.target.value)}
              placeholder="https://yourbrand-production.com or https://staging.domain.com"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: deliverablePhase === 'live_website' ? '1px solid #6EE7B7' : '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: deliverablePhase === 'live_website' ? '#047857' : '#64748B', display: 'block', marginTop: '4px' }}>
              The client partner can open and view this live website address directly from their dashboard.
            </span>
          </div>

          {/* External Figma Link */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <PenTool size={14} style={{ color: '#8B5CF6' }} />
              <span>Figma Blueprint & Project URL (Optional)</span>
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://www.figma.com/design/..."
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
              Clients can open and inspect the design system, blueprint, and component specs on Figma.
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Scope & Changes Summary *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the design work completed or revisions addressed in this version..."
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Files Upload Area */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Deliverable Files (PNG, SVG, PDF, ZIP)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf,.zip,.svg"
              style={{ display: 'none' }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284C7';
                e.currentTarget.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
            >
              <Upload size={24} style={{ color: '#0284C7', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                Click to browse files
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                Supports exported PNGs, SVGs, high-res audit PDFs, and archive bundles
              </div>
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={16} style={{ color: '#0284C7', flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1E293B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '380px',
                        }}
                      >
                        {f.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>({f.size})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Specialist Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Specialist Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional delivery instructions or remarks..."
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
              }}
            />
          </div>

          {/* Specialist Quality Verification Checkbox */}
          <div
            onClick={() => setIsQualityVerified(!isQualityVerified)}
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              backgroundColor: isQualityVerified ? '#F0FDF4' : '#F8FAFC',
              border: isQualityVerified ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isQualityVerified}
              onChange={(e) => setIsQualityVerified(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#16A34A', width: '16px', height: '16px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isQualityVerified ? '#166534' : '#334155' }}>
                Specialist Verification: Confirm client brief requirements are met
              </div>
              <div style={{ fontSize: '0.72rem', color: isQualityVerified ? '#15803D' : '#64748B' }}>
                Validates deliverable satisfies all client requirements, specifications, and viewport criteria.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Upload size={16} />
              <span>{isSubmitting ? 'Submitting Deliverable...' : `Submit V${nextVersion} Deliverables`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
