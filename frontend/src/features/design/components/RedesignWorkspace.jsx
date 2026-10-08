import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Upload,
  CheckCircle2,
  FileText,
  Split,
  Eye,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import DesignAssetList from './DesignAssetList';
import { isImageFile } from '../utils/designStatusUtils';

export default function RedesignWorkspace({
  ticket,
  submissions = [],
  onOpenUploadDeliverable,
  onPreviewFile,
}) {
  if (!ticket) return null;

  const [compareMode, setCompareMode] = useState(false);

  // Check if we have comparable images:
  // e.g. client attachment image ("before") and latest deliverable image ("after")
  const clientImages = (ticket.attachments || []).filter(
    (a) => isImageFile(a.name) || isImageFile(a.type)
  );

  const deliverableImages = [];
  submissions.forEach((sub) => {
    (sub.files || []).forEach((f) => {
      if (isImageFile(f.name) || isImageFile(f.type)) {
        deliverableImages.push(f);
      }
    });
  });

  const hasComparableAssets = clientImages.length > 0 && deliverableImages.length > 0;
  const beforeAsset = clientImages[0];
  const afterAsset = deliverableImages[0];

  const redesignChecklist = [
    `Audit existing interface layout and friction points based on client brief for "${ticket.title}".`,
    `Modernize visual hierarchy, typographic scale, and CTA prominence to maximize conversion velocity.`,
    `Design high-fidelity responsive hero, feature showcases, and interactive elements.`,
    `Validate all client needfuls and brief criteria through specialist quality verification before blueprint handoff.`,
    `Prepare side-by-side design documentation and prepare production deployment build.`
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Guidance */}
      <div
        style={{
          backgroundColor: '#FDF2F8',
          border: '1px solid #FBCFE8',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#EC4899',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Interface Redesign Studio
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#BE185D', margin: 0 }}>
              Full page transformations, conversion-centered hero redesigns, and modern visual architecture.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {hasComparableAssets && (
            <button
              type="button"
              onClick={() => setCompareMode(!compareMode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: compareMode ? '#EC4899' : '#FFFFFF',
                color: compareMode ? '#FFFFFF' : '#BE185D',
                border: '1px solid #FBCFE8',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Split size={15} />
              <span>{compareMode ? 'Exit Comparison' : 'Before / After View'}</span>
            </button>
          )}

          {onOpenUploadDeliverable && (
            <button
              type="button"
              onClick={onOpenUploadDeliverable}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#EC4899',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(236, 72, 153, 0.25)',
              }}
            >
              <Upload size={16} />
              <span>Upload Redesign Deliverables</span>
            </button>
          )}
        </div>
      </div>

      {/* Before / After View (Strictly if comparable images exist) */}
      {hasComparableAssets && compareMode && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Split size={18} style={{ color: '#EC4899' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Visual Comparison: Original Asset vs Delivered Redesign
              </h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Click either asset to open full preview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Before (Original) */}
            <div
              style={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#F1F5F9',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>BEFORE (Client Original)</span>
                <span style={{ fontWeight: 500, color: '#64748B' }}>{beforeAsset.name}</span>
              </div>
              <div
                onClick={() => onPreviewFile && onPreviewFile(beforeAsset)}
                style={{
                  height: '320px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#0F172A',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={beforeAsset.url || beforeAsset.dataUrl}
                  alt="Before"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* After (Delivered) */}
            <div
              style={{
                borderRadius: '10px',
                border: '1px solid #FBCFE8',
                overflow: 'hidden',
                backgroundColor: '#FDF2F8',
              }}
            >
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FCE7F3',
                  borderBottom: '1px solid #FBCFE8',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#BE185D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>AFTER (Redesigned Concept)</span>
                <span style={{ fontWeight: 500, color: '#9D174D' }}>{afterAsset.name}</span>
              </div>
              <div
                onClick={() => onPreviewFile && onPreviewFile(afterAsset)}
                style={{
                  height: '320px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#0F172A',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={afterAsset.url || afterAsset.dataUrl}
                  alt="After"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Client Requirement & Current Assets */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Client Redesign Requirement
            </h4>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.875rem',
                color: '#334155',
                lineHeight: '1.6',
              }}
            >
              {ticket.description || 'Redesign requirements outlined in ticket brief.'}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Current Assets & References ({ticket.attachments?.length || 0})
            </h4>
            <DesignAssetList
              assets={ticket.attachments || []}
              onPreviewFile={onPreviewFile}
              emptyMessage="No existing website assets attached"
            />
          </div>
        </div>

        {/* Right: Redesign Execution Checklist */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
          }}
        >
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
            Redesign Execution Milestones
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {redesignChecklist.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  color: '#334155',
                }}
              >
                <CheckCircle2 size={16} style={{ color: '#EC4899', flexShrink: 0, marginTop: '2px' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
