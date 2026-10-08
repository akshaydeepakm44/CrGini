import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  BookOpen,
  Code2,
  Presentation,
  Table as TableIcon,
  Sparkles,
  Info,
  Check,
  FileCheck
} from 'lucide-react';
import { api } from '../../../services/api';

export function extractTicketRequirements(ticket) {
  let reqs = ticket?.requirements;
  if (!reqs || Object.keys(reqs).length === 0) {
    if (typeof ticket?.notes === 'string') {
      try {
        const parsed = JSON.parse(ticket.notes);
        reqs = parsed.requirements || parsed;
      } catch (e) {}
    } else if (typeof ticket?.notes === 'object' && ticket?.notes !== null) {
      reqs = ticket.notes.requirements || ticket.notes;
    }
  }
  return reqs || {};
}

/**
 * Intelligently analyzes ticket requirements and breaks down
 * the exact deliverables expected by the client.
 */
function parseExpectedDeliverables(ticket) {
  const reqs = extractTicketRequirements(ticket);
  const deliverables = [];
  const rawCount = reqs.deliverablesCount || reqs.deliverableScope || reqs.deliverableFormat || '';

  // 1. Explicit deliverables count from intake form (e.g. "1 Poster + 1 Showcase Video")
  if (rawCount && typeof rawCount === 'string') {
    const parts = rawCount.split(/\s*[\+&,]\s*/).map((p) => p.trim()).filter(Boolean);
    parts.forEach((part, index) => {
      const lower = part.toLowerCase();
      let type = 'document';
      let icon = 'file';
      let formats = 'PDF, PNG, MP4';

      if (lower.includes('brochure') || lower.includes('broucher') || lower.includes('collateral') || lower.includes('one-pager')) {
        type = 'brochure';
        icon = 'book-open';
        formats = 'PDF, High-Res Digital/Print PDF, Figma (up to 25MB)';
      } else if (lower.includes('poster') || lower.includes('creative') || lower.includes('graphic') || lower.includes('ad') || lower.includes('banner')) {
        type = 'poster';
        icon = 'image';
        formats = 'PNG, JPG, SVG, High-Res PDF (up to 25MB)';
      } else if (lower.includes('video') || lower.includes('showcase') || lower.includes('reel') || lower.includes('motion') || lower.includes('animation')) {
        type = 'video';
        icon = 'video';
        formats = 'MP4, MOV, WebM, or Video Link (Loom, YouTube, Drive)';
      } else if (lower.includes('strategy') || lower.includes('plan') || lower.includes('gtm') || lower.includes('dossier') || lower.includes('study')) {
        type = 'strategy';
        icon = 'book-open';
        formats = 'PDF, DOCX, Presentation Deck, or Notion Link';
      } else if (lower.includes('lead') || lower.includes('database') || lower.includes('contact') || lower.includes('list')) {
        type = 'leads';
        icon = 'table';
        formats = 'CSV, XLSX, or Google Sheets Link';
      } else if (lower.includes('deck') || lower.includes('pitch') || lower.includes('slides')) {
        type = 'deck';
        icon = 'presentation';
        formats = 'PDF, PPTX, or Figma/Canva Link';
      } else if (lower.includes('figma') || lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('audit')) {
        type = 'design';
        icon = 'layout';
        formats = 'Figma URL, UI Spec PDF, Prototype Link';
      } else if (lower.includes('devrel') || lower.includes('api') || lower.includes('sdk') || lower.includes('doc')) {
        type = 'devrel';
        icon = 'code';
        formats = 'PDF, Markdown, GitHub Repo / Docs Link';
      }

      deliverables.push({
        id: `slot_${index + 1}`,
        title: part,
        type,
        icon,
        formats,
        description: `Deliverable as specified by client (${part})`,
        required: true,
      });
    });
  }

  // 2. Fallback to contentTypes checkboxes if present and no parts parsed
  if (deliverables.length === 0 && reqs.contentTypes && typeof reqs.contentTypes === 'object') {
    if (reqs.contentTypes.poster) {
      deliverables.push({
        id: 'slot_poster',
        title: 'Campaign Poster / Creative Asset',
        type: 'poster',
        icon: 'image',
        formats: 'PNG, JPG, SVG, PDF (up to 25MB)',
        description: 'High-resolution campaign visual and creative posters',
        required: true,
      });
    }
    if (reqs.contentTypes.productVideo || reqs.contentTypes.productShowcase) {
      deliverables.push({
        id: 'slot_video',
        title: 'Product Showcase Video / Teaser',
        type: 'video',
        icon: 'video',
        formats: 'MP4, MOV, or Video Link (Loom, YouTube, Drive)',
        description: 'Engaging product walkthrough or video showcase',
        required: true,
      });
    }
    if (reqs.contentTypes.socialContent) {
      deliverables.push({
        id: 'slot_social',
        title: 'Social Media Content Suite',
        type: 'poster',
        icon: 'image',
        formats: 'PNG, PDF, Copy Document',
        description: 'Multi-platform social creatives and copy package',
        required: true,
      });
    }
  }

  // 3. Service-specific fallbacks based on serviceId / subService
  if (deliverables.length === 0) {
    const serviceId = (reqs.serviceId || ticket?.subService || ticket?.serviceType || '').toLowerCase();
    const titleLower = (ticket?.title || '').toLowerCase();
    const subUpper = (ticket?.subService || ticket?.sub_service || '').toUpperCase();

    const isGtm =
      serviceId.includes('gtm') ||
      subUpper.includes('GTM') ||
      titleLower.includes('gtm') ||
      titleLower.includes('go-to-market') ||
      titleLower.includes('launch strategy') ||
      titleLower.includes('brochure') ||
      titleLower.includes('broucher');

    if (isGtm) {
      deliverables.push(
        {
          id: 'slot_gtm_brochure',
          title: 'GTM Strategy Brochure / Product Collateral',
          type: 'brochure',
          icon: 'book-open',
          formats: 'PDF, High-Res Digital/Print PDF (up to 25MB)',
          description: 'Official Go-To-Market product brochure, sales enablement one-pager, or collateral asset',
          required: true,
        },
        {
          id: 'slot_gtm_blueprint',
          title: 'GTM Launch Playbook & Distribution Roadmap',
          type: 'strategy',
          icon: 'presentation',
          formats: 'PDF, Presentation Deck, Notion, or Drive Link',
          description: 'Comprehensive market distribution roadmap, channel launch timeline, and KPI matrix',
          required: true,
        }
      );
    } else if (serviceId.includes('devrel') || subUpper.includes('DEVREL') || titleLower.includes('devrel')) {
      deliverables.push(
        {
          id: 'slot_devrel_dossier',
          title: 'DevRel Strategy & API Documentation Package',
          type: 'devrel',
          icon: 'code',
          formats: 'PDF, Markdown, or GitHub / Docs Link',
          description: 'API/SDK onboarding specs, documentation architecture, and DevRel roadmap',
          required: true,
        },
        {
          id: 'slot_devrel_community',
          title: 'Developer Community & Adoption Playbook',
          type: 'strategy',
          icon: 'book-open',
          formats: 'PDF, Presentation Deck, or Notion Link',
          description: 'Ecosystem growth playbook and developer advocacy framework',
          required: true,
        }
      );
    } else if (serviceId.includes('strategic') || subUpper.includes('STRATEGIC') || titleLower.includes('strategic')) {
      deliverables.push(
        {
          id: 'slot_strategy_dossier',
          title: 'Strategic Growth & GTM Blueprint',
          type: 'strategy',
          icon: 'book-open',
          formats: 'PDF, Presentation Deck, or Notion Link',
          description: 'Complete market positioning, competitor analysis, and strategic roadmap',
          required: true,
        },
        {
          id: 'slot_strategy_roadmap',
          title: 'Execution Roadmap & Milestones Matrix',
          type: 'strategy',
          icon: 'table',
          formats: 'PDF, XLSX, Sheets, or Drive Link',
          description: 'Detailed sprint execution timelines and operational deliverables',
          required: true,
        }
      );
    } else if (serviceId.includes('content') || subUpper.includes('CONTENT') || titleLower.includes('copywriting') || titleLower.includes('narrative')) {
      deliverables.push(
        {
          id: 'slot_content_copy',
          title: 'Content Sprint Manuscript & Conversion Copy',
          type: 'document',
          icon: 'file',
          formats: 'PDF, DOCX, Markdown, or Google Doc Link',
          description: 'High-impact sales copy, executive narrative, or written asset package',
          required: true,
        },
        {
          id: 'slot_content_assets',
          title: 'Brand Collateral & Thought Leadership Pack',
          type: 'strategy',
          icon: 'book-open',
          formats: 'PDF, High-Res Digital/Print PDF, Figma, or Notion Link',
          description: 'Formatted collateral pack, social copy suite, or distribution assets',
          required: true,
        }
      );
    } else if (serviceId.includes('ad') || subUpper.includes('AD') || titleLower.includes('ad creative')) {
      deliverables.push(
        {
          id: 'slot_ad_visuals',
          title: 'Ad Visuals & Creative Asset Pack',
          type: 'poster',
          icon: 'image',
          formats: 'PNG, JPG, SVG, PDF (up to 25MB)',
          description: 'Multi-format high-converting ad visuals and display banners',
          required: true,
        },
        {
          id: 'slot_ad_angles',
          title: 'Ad Copy Angles & Hooks Matrix',
          type: 'strategy',
          icon: 'table',
          formats: 'PDF, XLSX, Google Sheets, or Notion Link',
          description: 'Variant hooks, primary text options, and CTA testing matrix',
          required: true,
        }
      );
    } else {
      // General service deliverable
      deliverables.push({
        id: 'slot_package',
        title: `${ticket?.title || 'Sprint Deliverable Package'}`,
        type: 'document',
        icon: 'file',
        formats: 'PDF, PNG, MP4, ZIP, or Interactive Link',
        description: 'Primary deliverables package meeting client sprint specifications',
        required: true,
      });
    }
  }

  return deliverables;
}

export default function DeliverableUploadModal({
  isOpen,
  onClose,
  ticket,
  onSuccess,
}) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Required Deliverables extracted dynamically from ticket requirements
  const expectedDeliverables = useMemo(() => {
    return parseExpectedDeliverables(ticket);
  }, [ticket]);

  // State mapping each expected deliverable slot to its uploaded file, link, and notes
  const [slotData, setSlotData] = useState(() => {
    const initial = {};
    expectedDeliverables.forEach((item) => {
      initial[item.id] = {
        file: null,
        link: '',
        notes: '',
      };
    });
    return initial;
  });

  // Additional generic supporting links & files (optional)
  const [additionalLinks, setAdditionalLinks] = useState(['']);
  const [additionalFiles, setAdditionalFiles] = useState([]);

  if (!isOpen || !ticket) return null;

  const currentVersion = (ticket.currentSubmissionVersion || 1) + (ticket.status === 'CHANGES_REQUESTED' ? 1 : 0);
  const reqs = extractTicketRequirements(ticket);

  // Count how many required deliverables have either a file or a link provided
  const fulfilledCount = expectedDeliverables.filter((item) => {
    const data = slotData[item.id];
    return Boolean(data?.file || (data?.link && data.link.trim()));
  }).length;
  const totalCount = expectedDeliverables.length;
  const allFulfilled = fulfilledCount >= totalCount;

  // Handlers for specific deliverable slots
  const handleSlotFileChange = (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert(`File "${file.name}" is larger than 25MB. Please choose a file under 25MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSlotData((prev) => ({
        ...prev,
        [slotId]: {
          ...(prev[slotId] || {}),
          file: {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl: event.target.result,
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlotFile = (slotId) => {
    setSlotData((prev) => ({
      ...prev,
      [slotId]: {
        ...(prev[slotId] || {}),
        file: null,
      },
    }));
  };

  const handleSlotLinkChange = (slotId, value) => {
    setSlotData((prev) => ({
      ...prev,
      [slotId]: {
        ...(prev[slotId] || {}),
        link: value,
      },
    }));
  };

  // Handlers for additional links & files
  const handleAddLink = () => {
    setAdditionalLinks((prev) => [...prev, '']);
  };

  const handleAdditionalLinkChange = (index, value) => {
    setAdditionalLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveAdditionalLink = (index) => {
    setAdditionalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdditionalFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => {
      if (f.size > 25 * 1024 * 1024) {
        alert(`File ${f.name} is larger than 25MB.`);
        return false;
      }
      return true;
    });

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdditionalFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl: event.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAdditionalFile = (index) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if at least notes or deliverables are provided
    if (!notes.trim()) {
      setError('Please provide deliverable notes and a summary for the client.');
      return;
    }

    if (fulfilledCount === 0 && additionalFiles.length === 0) {
      setError('Please upload at least one required deliverable or provide a live link before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Collect all files from slots
      const allFiles = [];
      expectedDeliverables.forEach((item) => {
        const slot = slotData[item.id];
        if (slot?.file) {
          allFiles.push({
            name: slot.file.name,
            size: slot.file.size,
            type: slot.file.type,
            dataUrl: slot.file.dataUrl,
            category: item.title,
            deliverableRole: item.id,
          });
        }
      });

      // Add additional files
      additionalFiles.forEach((file) => {
        allFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: file.dataUrl,
          category: 'Supporting Material',
        });
      });

      // Collect all links
      const allLinks = [];
      expectedDeliverables.forEach((item) => {
        const slot = slotData[item.id];
        if (slot?.link && slot.link.trim()) {
          allLinks.push(slot.link.trim());
        }
      });
      additionalLinks.forEach((link) => {
        if (link && link.trim()) allLinks.push(link.trim());
      });

      // Build structured delivery breakdown for client review
      const fulfillmentReport = expectedDeliverables.map((item) => {
        const slot = slotData[item.id];
        const status = slot?.file ? `File: ${slot.file.name}` : slot?.link ? `Link: ${slot.link}` : 'Not provided';
        return `• ${item.title}: ${status}`;
      }).join('\n');

      const fullDescription = `${notes.trim()}\n\n--- Deliverables Checklist ---\n${fulfillmentReport}`;

      const payload = {
        title: `${ticket.title} — Deliverable Package V${currentVersion}`,
        description: fullDescription,
        notes: notes.trim(),
        version: currentVersion,
        deliverableLinks: allLinks,
        externalLink: allLinks.join(', '),
        files: allFiles,
      };

      await api.submitWork(ticket.id || ticket._id, payload);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit deliverable package:', err);
      setError(err.message || 'Submission failed. Please check network or file size.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeliverableIcon = (iconType) => {
    switch (iconType) {
      case 'brochure':
      case 'book-open':
        return <BookOpen size={18} color="#059669" />;
      case 'image':
        return <ImageIcon size={18} color="#7C3AED" />;
      case 'video':
        return <VideoIcon size={18} color="#0284C7" />;
      case 'code':
        return <Code2 size={18} color="#D97706" />;
      case 'table':
        return <TableIcon size={18} color="#2563EB" />;
      case 'presentation':
        return <Presentation size={18} color="#9333EA" />;
      default:
        return <FileText size={18} color="#7C3AED" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          width: '780px',
          maxWidth: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#EDE9FE',
                  color: '#6D28D9',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Version {currentVersion}
              </div>
              <h2
                style={{
                  fontSize: '1.1875rem',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Submit Deliverable Package
              </h2>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '3px' }}>
              Submitting for ticket <strong style={{ color: '#7C3AED' }}>{ticket.ticketId}</strong> — {ticket.title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. CLIENT SPRINT SPECIFICATIONS BANNER */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#7C3AED" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Client Sprint Specifications & Requirements
                </span>
              </div>
              {reqs.deliverablesCount && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Deliverables: {reqs.deliverablesCount}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '10px',
                backgroundColor: '#FFFFFF',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #F3E8FF',
              }}
            >
              {reqs.deliverablesCount && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Deliverables Count
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7C3AED', marginTop: '2px' }}>
                    {reqs.deliverablesCount}
                  </div>
                </div>
              )}
              {reqs.productHighlight && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Product Highlight
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqs.productHighlight}
                  </div>
                </div>
              )}
              {reqs.mainPurpose && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Main Purpose
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqs.mainPurpose}
                  </div>
                </div>
              )}
              {reqs.targetAudience && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Target Audience
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqs.targetAudience}
                  </div>
                </div>
              )}
              {reqs.preferredPlatforms && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Preferred Platforms
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                    {reqs.preferredPlatforms}
                  </div>
                </div>
              )}
              {reqs.serviceId && (
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Service ID
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginTop: '2px' }}>
                    {reqs.serviceId}
                  </div>
                </div>
              )}
            </div>

            {ticket.description && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.5 }}>
                <strong style={{ color: '#111827' }}>Client Scope Note: </strong>
                {ticket.description}
              </div>
            )}
          </div>

          {/* 2. DYNAMIC REQUIRED DELIVERABLES UPLOAD SLOTS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Required Sprint Deliverables
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                  Upload each deliverable specified by the client or provide its verified interactive link.
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: allFulfilled ? '#ECFDF5' : '#FFFBEB',
                  border: `1px solid ${allFulfilled ? '#A7F3D0' : '#FDE68A'}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: allFulfilled ? '#065F46' : '#92400E',
                }}
              >
                {allFulfilled ? <Check size={14} color="#059669" /> : <Info size={14} color="#D97706" />}
                <span>
                  {fulfilledCount} of {totalCount} Required Items Ready
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {expectedDeliverables.map((item, idx) => {
                const data = slotData[item.id] || {};
                const isReady = Boolean(data.file || (data.link && data.link.trim()));

                return (
                  <div
                    key={item.id}
                    style={{
                      border: `1px solid ${isReady ? '#A7F3D0' : '#E5E7EB'}`,
                      backgroundColor: isReady ? '#F0FDF4' : '#FFFFFF',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Deliverable Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isReady ? '#DCFCE7' : '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getDeliverableIcon(item.icon)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                              Deliverable #{idx + 1}
                            </span>
                            <span style={{ fontSize: '0.925rem', fontWeight: 800, color: '#111827' }}>
                              {item.title}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '1px' }}>
                            Formats: {item.formats}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isReady ? '#D1FAE5' : '#FEF3C7',
                          color: isReady ? '#065F46' : '#92400E',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isReady ? <Check size={12} /> : <AlertCircle size={12} />}
                        <span>{isReady ? 'Deliverable Ready' : 'Upload or Link Required'}</span>
                      </div>
                    </div>

                    {/* Dual Action Container: File Upload + Interactive Link */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* 1. File Upload Slot */}
                      <div
                        style={{
                          border: '1px dashed #D1D5DB',
                          borderRadius: '8px',
                          padding: '12px',
                          backgroundColor: '#FAFAFA',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        {data.file ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <FileCheck size={18} color="#059669" />
                              <div style={{ overflow: 'hidden' }}>
                                <div
                                  style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    color: '#111827',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={data.file.name}
                                >
                                  {data.file.name}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                                  {(data.file.size / 1024).toFixed(1)} KB • Attached
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotFile(item.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                              title="Remove attached file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: '8px',
                            }}
                          >
                            <input
                              type="file"
                              onChange={(e) => handleSlotFileChange(item.id, e)}
                              style={{ display: 'none' }}
                            />
                            <Upload size={18} color="#7C3AED" style={{ marginBottom: '4px' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED' }}>
                              Upload {item.type === 'video' ? 'Video' : item.type === 'poster' ? 'Visual' : item.type === 'brochure' ? 'Brochure' : 'Deliverable'}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '2px' }}>
                              Click or drag file (up to 25MB)
                            </span>
                          </label>
                        )}
                      </div>

                      {/* 2. Interactive Link Slot */}
                      <div
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          padding: '12px',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#4B5563',
                            marginBottom: '4px',
                          }}
                        >
                          Interactive Link (Optional / Cloud Hosted)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <LinkIcon
                            size={14}
                            style={{
                              position: 'absolute',
                              left: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#9CA3AF',
                            }}
                          />
                          <input
                            type="url"
                            value={data.link || ''}
                            onChange={(e) => handleSlotLinkChange(item.id, e.target.value)}
                            placeholder={
                              item.type === 'video'
                                ? 'https://loom.com/share/... or YouTube/Drive'
                                : 'https://figma.com/file/... or Drive/Notion'
                            }
                            style={{
                              width: '100%',
                              padding: '6px 8px 6px 28px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.75rem',
                              color: '#111827',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. DELIVERABLE SUMMARY & SPECIALIST NOTES */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Deliverable Summary & Specialist Notes *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline what has been produced, key strategic decisions made, and instructions for client review..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
                resize: 'vertical',
              }}
              required
            />
          </div>

          {/* 4. ADDITIONAL SUPPORTING ASSETS & LINKS (OPTIONAL) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                }}
              >
                Additional Supporting Materials & Reference Links (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7C3AED',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} />
                Add link
              </button>
            </div>

            {/* Additional Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {additionalLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <LinkIcon
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
                      type="url"
                      value={link}
                      onChange={(e) => handleAdditionalLinkChange(idx, e.target.value)}
                      placeholder="https://drive.google.com/... or https://github.com/..."
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.75rem',
                        color: '#111827',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>
                  {additionalLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalLink(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Files Upload */}
            <div
              style={{
                border: '1px dashed #D1D5DB',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                multiple
                onChange={handleAdditionalFilesChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <Upload size={18} color="#6B7280" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                Upload extra attachments, source files, or raw media
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: '1px' }}>
                Supports documents, images, video teasers up to 25MB each
              </div>
            </div>

            {/* Additional Files List */}
            {additionalFiles.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {additionalFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={14} color="#7C3AED" />
                      <span
                        style={{
                          fontWeight: 600,
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '380px',
                        }}
                      >
                        {file.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalFile(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              {allFulfilled ? (
                <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> All {totalCount} client-requested deliverables ready
                </span>
              ) : (
                <span style={{ color: '#D97706', fontWeight: 600 }}>
                  {fulfilledCount} of {totalCount} deliverables prepared
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'default' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
                }}
              >
                <Upload size={16} />
                <span>
                  {isSubmitting
                    ? 'Submitting Work...'
                    : `Submit Version ${currentVersion} Package`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
