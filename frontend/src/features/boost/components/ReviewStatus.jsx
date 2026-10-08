import React from 'react';
import { Clock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReviewStatus({ status, latestFeedback = '', onOpenResubmit }) {
  if (status === 'CHANGES_REQUESTED') {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#991B1B' }}>
              Client Requested Changes
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#B91C1C', marginTop: '2px' }}>
              The client has reviewed the submission and provided revision feedback. Please address the comments and submit a revised version.
            </div>
            {latestFeedback && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #FCA5A5',
                  fontSize: '0.8125rem',
                  color: '#1F2937',
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                "{latestFeedback}"
              </div>
            )}
          </div>
        </div>

        {onOpenResubmit && (
          <button
            type="button"
            onClick={onOpenResubmit}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
            }}
          >
            <RotateCcw size={14} />
            <span>Submit Revision</span>
          </button>
        )}
      </div>
    );
  }

  if (['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(status)) {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#FDF2F8',
          border: '1px solid #FBCFE8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#FCE7F3',
            color: '#DB2777',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Clock size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#831843' }}>
            Awaiting Client Review
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#9D174D', marginTop: '2px' }}>
            Deliverables have been submitted to the client. The client will review and approve or request revisions.
          </div>
        </div>
      </div>
    );
  }

  if (status === 'COMPLETED' || status === 'APPROVED') {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#D1FAE5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#065F46' }}>
            Deliverable Approved & Completed
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '2px' }}>
            The client has signed off on the deliverables. This sprint is complete.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
