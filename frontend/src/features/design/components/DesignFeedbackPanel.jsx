import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Upload,
  User,
  Calendar
} from 'lucide-react';
import { formatDesignDateTime } from '../data/designAdapters';

export default function DesignFeedbackPanel({
  ticket,
  submissions = [],
  onOpenUploadRevision,
  onNavigateToMessages
}) {
  if (!ticket) return null;

  // Find latest submission and any feedback attached
  const latestSub = submissions && submissions.length > 0 ? submissions[0] : null;
  const isChangesRequested =
    ticket.status === 'CHANGES_REQUESTED' ||
    (latestSub && (latestSub.status === 'CHANGES_REQUESTED' || latestSub.review_status === 'CHANGES_REQUESTED'));

  const feedbackText =
    latestSub?.review_feedback ||
    latestSub?.reviewFeedback ||
    (ticket.notes && typeof ticket.notes === 'string' && ticket.notes.includes('feedback') ? ticket.notes : null);

  const reviewerName = latestSub?.reviewer_name || latestSub?.reviewerName || ticket.clientName || 'Client Partner';
  const reviewedAt = latestSub?.reviewed_at || latestSub?.reviewedAt;

  if (!isChangesRequested && !feedbackText) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
          color: '#64748B',
        }}
      >
        <CheckCircle2 size={28} style={{ color: '#059669', margin: '0 auto 8px' }} />
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>
          No Pending Change Requests
        </h4>
        <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
          {ticket.status === 'COMPLETED' || ticket.status === 'APPROVED'
            ? 'Client has approved the final deliverables for this ticket.'
            : 'No revision requests currently filed by the client partner.'}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #FECACA',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
      }}
    >
      {/* Banner */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: '#FEF2F2',
          borderBottom: '1px solid #FECACA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} style={{ color: '#DC2626' }} />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: '#DC2626',
              letterSpacing: '0.02em',
            }}
          >
            CHANGE REQUESTED
          </span>
          {latestSub && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              On Deliverables V{latestSub.version || 1}
            </span>
          )}
        </div>

        {reviewedAt && (
          <span style={{ fontSize: '0.75rem', color: '#991B1B' }}>
            {formatDesignDateTime(reviewedAt)}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            color: '#64748B',
            marginBottom: '10px',
          }}
        >
          <User size={14} style={{ color: '#94A3B8' }} />
          <span>Client Reviewer: <strong style={{ color: '#1E293B' }}>{reviewerName}</strong></span>
        </div>

        <div
          style={{
            backgroundColor: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: '#1F2937',
            marginBottom: '18px',
          }}
        >
          {feedbackText || 'Client requested modifications on the latest deliverable iteration.'}
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {onOpenUploadRevision && (
            <button
              type="button"
              onClick={onOpenUploadRevision}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              }}
            >
              <Upload size={14} />
              <span>Submit Revision V{(latestSub?.version || 1) + 1}</span>
            </button>
          )}

          {onNavigateToMessages && (
            <button
              type="button"
              onClick={onNavigateToMessages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#4B5563',
                border: '1px solid #CBD5E1',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={14} />
              <span>Discuss in Messages</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
