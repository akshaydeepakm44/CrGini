import React from 'react';
import {
  Package,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  PenTool,
  RotateCcw,
  Globe
} from 'lucide-react';
import { formatDesignDateTime } from '../data/designAdapters';
import DesignAssetList from './DesignAssetList';

export default function DesignDeliverableList({
  submissions = [],
  onPreviewFile,
  ticket
}) {
  if (!submissions || submissions.length === 0) {
    return (
      <div
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px dashed #CBD5E1',
          color: '#64748B',
        }}
      >
        <Package size={32} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>
          No deliverables submitted yet
        </h4>
        <p style={{ fontSize: '0.8125rem', margin: 0, color: '#64748B' }}>
          When the design specialist submits completed work or revisions, version history will be documented here.
        </p>
      </div>
    );
  }

  // Sort descending by version (latest on top)
  const sorted = [...submissions].sort((a, b) => (b.version || 0) - (a.version || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {sorted.map((sub, idx) => {
        const isLatest = idx === 0;
        const versionNum = sub.version || (submissions.length - idx);
        const isApproved = sub.status === 'APPROVED' || sub.review_status === 'APPROVED';
        const isChangesRequested =
          sub.status === 'CHANGES_REQUESTED' || sub.review_status === 'CHANGES_REQUESTED';
        const isPendingReview = !isApproved && !isChangesRequested;

        const files = Array.isArray(sub.files) ? sub.files : [];

        return (
          <div
            key={sub.id || sub._id || idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: isLatest ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: isLatest ? '0 4px 12px rgba(2, 132, 199, 0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Version Card Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isLatest ? '#F0F9FF' : '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    backgroundColor: isApproved ? '#059669' : isChangesRequested ? '#DC2626' : '#0284C7',
                    color: '#FFFFFF',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  DESIGN V{versionNum}
                </span>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {sub.title || `Deliverables Version ${versionNum}`}
                </h4>

                {isLatest && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: '#E0F2FE',
                      color: '#0284C7',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    Current Active Version
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div>
                {isApproved ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '4px 12px',
                      borderRadius: '999px',
                    }}
                  >
                    <CheckCircle2 size={13} /> Approved by Client
                  </span>
                ) : isChangesRequested ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#DC2626',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      padding: '4px 12px',
                      borderRadius: '999px',
                    }}
                  >
                    <AlertCircle size={13} /> Changes Requested
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#DB2777',
                      backgroundColor: '#FDF2F8',
                      border: '1px solid #FBCFE8',
                      padding: '4px 12px',
                      borderRadius: '999px',
                    }}
                  >
                    <Clock size={13} /> Awaiting Client Review
                  </span>
                )}
              </div>
            </div>

            {/* Version Card Body */}
            <div style={{ padding: '20px' }}>
              {/* Submission metadata: Specialist & Date */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  marginBottom: '12px',
                }}
              >
                <span>Submitted by: <strong>{sub.submitted_by_name || sub.submittedByName || 'Design Specialist'}</strong></span>
                <span>•</span>
                <span>{formatDesignDateTime(sub.submitted_at || sub.submittedAt || sub.createdAt)}</span>
              </div>

              {/* Description */}
              {sub.description && (
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {sub.description}
                </p>
              )}

              {/* Action Links: Live Built Website & Figma Project */}
              {(() => {
                let websiteUrl = sub.live_website_url || sub.liveWebsiteUrl || null;
                let figmaUrl = null;
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

                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
                        }}
                      >
                        <Globe size={16} />
                        <span>VISIT LIVE BUILT WEBSITE (HTTPS)</span>
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {figmaUrl && (
                      <a
                        href={figmaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          color: '#7C3AED',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <PenTool size={15} />
                        <span>OPEN FIGMA BLUEPRINT</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* Files */}
              {files.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    Deliverable Files ({files.length})
                  </div>
                  <DesignAssetList assets={files} onPreviewFile={onPreviewFile} />
                </div>
              )}

              {/* Review Feedback Section if Changes Requested or Approved with feedback */}
              {(sub.review_feedback || sub.reviewFeedback) && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: isChangesRequested ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${isChangesRequested ? '#FECACA' : '#BBF7D0'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isChangesRequested ? '#DC2626' : '#15803D',
                      marginBottom: '4px',
                    }}
                  >
                    {isChangesRequested ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                    <span>Client Feedback:</span>
                    <span style={{ fontWeight: 500, color: '#64748B', marginLeft: 'auto', fontSize: '0.75rem' }}>
                      Reviewed by {sub.reviewer_name || sub.reviewerName || 'Client Partner'}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: isChangesRequested ? '#991B1B' : '#166534',
                      margin: 0,
                      lineHeight: '1.5',
                    }}
                  >
                    {sub.review_feedback || sub.reviewFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
