import React from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Eye
} from 'lucide-react';
import { formatBoostDateTime } from '../data/boostAdapters';

export default function DeliverableList({ submissions = [], currentStatus = '' }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div
        style={{
          padding: '32px 20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px',
          border: '1px dashed #E5E7EB',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '0.875rem',
        }}
      >
        <Layers size={24} style={{ color: '#9CA3AF', margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 600, color: '#374151' }}>No deliverables submitted yet</div>
        <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
          When the specialist uploads deliverables, versions and review states will appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {submissions.map((sub, idx) => {
        const versionNum = sub.version || (submissions.length - idx);
        const isApproved = sub.status === 'APPROVED' || sub.approved === true;
        const isChangesRequested = sub.status === 'CHANGES_REQUESTED' || Boolean(sub.changesRequested);
        const isPending = !isApproved && !isChangesRequested;

        // Parse files if present
        let files = [];
        if (Array.isArray(sub.files)) files = sub.files;
        else if (sub.file_attachments && Array.isArray(sub.file_attachments)) files = sub.file_attachments;

        // Parse links
        let links = [];
        if (Array.isArray(sub.deliverableLinks)) links = sub.deliverableLinks;
        else if (sub.links && Array.isArray(sub.links)) links = sub.links;
        else if (typeof sub.deliverableLinks === 'string') links = [sub.deliverableLinks];

        return (
          <div
            key={sub.id || sub._id || idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Version Header */}
            <div
              style={{
                padding: '12px 18px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  VERSION {versionNum}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Submitted {formatBoostDateTime(sub.createdAt || sub.created_at)}
                </span>
              </div>

              {/* Review Status Badge */}
              <div>
                {isApproved && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    Approved by Client
                  </span>
                )}
                {isChangesRequested && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid #FECACA',
                    }}
                  >
                    <AlertCircle size={12} />
                    Changes Requested
                  </span>
                )}
                {isPending && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#FDF2F8',
                      color: '#DB2777',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid #FBCFE8',
                    }}
                  >
                    <Clock size={12} />
                    Awaiting Client Review
                  </span>
                )}
              </div>
            </div>

            {/* Submission Body */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Notes */}
              {sub.notes && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Deliverable Summary
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#1F2937',
                      backgroundColor: '#F9FAFB',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #F3F4F6',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {sub.notes}
                  </div>
                </div>
              )}

              {/* External Deliverable Links */}
              {links.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Interactive Deliverables
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {links.map((link, lIdx) => (
                      <a
                        key={lIdx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          color: '#7C3AED',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} />
                        <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Attached Files ({files.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                    {files.map((file, fIdx) => (
                      <div
                        key={fIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FAFAFC',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <FileText size={16} color="#7C3AED" />
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#111827',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '160px',
                            }}
                          >
                            {file.name || `File-${fIdx + 1}`}
                          </span>
                        </div>
                        {file.dataUrl && (
                          <a
                            href={file.dataUrl}
                            download={file.name || 'deliverable'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              color: '#7C3AED',
                              padding: '4px',
                            }}
                            title="Download file"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback if Changes Requested */}
              {sub.feedback && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isChangesRequested ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${isChangesRequested ? '#FECACA' : '#BBF7D0'}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isChangesRequested ? '#DC2626' : '#15803D',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isChangesRequested ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                    Client Feedback
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#1F2937', lineHeight: 1.4 }}>
                    {sub.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
