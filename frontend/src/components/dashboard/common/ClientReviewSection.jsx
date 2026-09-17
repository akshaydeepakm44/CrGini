import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  RotateCcw,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function ClientReviewSection({
  ticket,
  submissions = [],
  userRole = 'USER',
  onApprove,
  onRequestChanges,
  isProcessing = false
}) {
  const [activeVersionIndex, setActiveVersionIndex] = useState(
    submissions.length > 0 ? submissions.length - 1 : 0
  );
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRequestChangesForm, setShowRequestChangesForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  if (!submissions || submissions.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(4, 12, 18, 0.7)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '24px',
          textAlign: 'center',
          color: '#8fa0b5'
        }}
      >
        <Clock size={32} color="#8fa0b5" style={{ opacity: 0.4, margin: '0 auto 10px' }} />
        <div style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '0.92rem' }}>
          Work in Progress
        </div>
        <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
          The assigned specialist team is working on your sprint. When deliverables are ready, they will appear here for your review and approval.
        </div>
      </div>
    );
  }

  const currentSubmission = submissions[activeVersionIndex] || submissions[submissions.length - 1];
  const isLatestVersion = activeVersionIndex === submissions.length - 1;
  const isPendingReview =
    currentSubmission.status === 'PENDING_REVIEW' &&
    (ticket.status === 'WORK_SUBMITTED' || ticket.status === 'WORK_RESUBMITTED' || ticket.status === 'CLIENT_REVIEW');

  const handleConfirmApprove = () => {
    onApprove(currentSubmission._id, 'Work inspected and approved.');
    setShowApproveConfirm(false);
  };

  const handleSubmitChangeRequest = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Please specify what needs modification or inclusion.');
      return;
    }
    setFeedbackError('');
    onRequestChanges(currentSubmission._id, feedbackText.trim());
    setShowRequestChangesForm(false);
    setFeedbackText('');
  };

  return (
    <div
      style={{
        background: 'rgba(4, 12, 18, 0.95)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Version Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} color="#00D9FF" />
          <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>
            Work Deliverables & Review
          </span>
        </div>

        {/* Multi-version tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {submissions.map((sub, idx) => {
            const isActive = idx === activeVersionIndex;
            return (
              <button
                key={sub._id || idx}
                type="button"
                onClick={() => {
                  setActiveVersionIndex(idx);
                  setShowApproveConfirm(false);
                  setShowRequestChangesForm(false);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: isActive ? '1px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#00D9FF' : '#8fa0b5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                v{sub.version}
                {sub.status === 'APPROVED' && <Check size={12} color="#34d399" />}
                {sub.status === 'CHANGES_REQUESTED' && <RotateCcw size={12} color="#FFB000" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Details Card */}
      <div
        style={{
          background: 'rgba(6, 17, 26, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '14px'
        }}
      >
        {/* Title & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(0, 217, 255, 0.12)',
                  color: '#00D9FF',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: '700'
                }}
              >
                Submission v{currentSubmission.version}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#8fa0b5' }}>
                Submitted by{' '}
                <strong style={{ color: '#cbd5e1' }}>
                  {currentSubmission.submittedByName || 'CreativeGini Team'}
                </strong>
              </span>
            </div>
            <h4 style={{ margin: '6px 0 0 0', fontSize: '1rem', color: '#F5F5F5', fontWeight: '700' }}>
              {currentSubmission.title}
            </h4>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', color: '#8fa0b5' }}>
              {new Date(currentSubmission.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <div style={{ marginTop: '4px' }}>
              {currentSubmission.status === 'APPROVED' && (
                <span className="status-pill COMPLETED" style={{ fontSize: '0.72rem' }}>
                  Approved
                </span>
              )}
              {currentSubmission.status === 'CHANGES_REQUESTED' && (
                <span className="status-pill CHANGES_REQUESTED" style={{ fontSize: '0.72rem' }}>
                  Changes Requested
                </span>
              )}
              {currentSubmission.status === 'PENDING_REVIEW' && (
                <span className="status-pill CLIENT_REVIEW" style={{ fontSize: '0.72rem' }}>
                  Awaiting Review
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description / Summary */}
        <p
          style={{
            color: '#cbd5e1',
            fontSize: '0.85rem',
            lineHeight: '1.55',
            margin: '10px 0 14px 0',
            background: 'rgba(4, 12, 18, 0.8)',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}
        >
          {currentSubmission.description}
        </p>

        {/* Deliverable Files */}
        {currentSubmission.files && currentSubmission.files.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#8fa0b5', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Deliverable Files ({currentSubmission.files.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentSubmission.files.map((file, fIdx) => (
                <div
                  key={fIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(4, 12, 18, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="#00D9FF" />
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '500' }}>
                        {file.name}
                      </span>
                      {file.size && (
                        <span style={{ fontSize: '0.72rem', color: '#8fa0b5', marginLeft: '8px' }}>
                          ({file.size})
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.76rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={13} /> Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Collaboration Link */}
        {currentSubmission.externalLink && (
          <div style={{ marginTop: '8px' }}>
            <a
              href={currentSubmission.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00D9FF',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              <ExternalLink size={14} /> Open Live Deliverables / Collaboration Link
            </a>
          </div>
        )}

        {/* Additional notes */}
        {currentSubmission.notes && (
          <div style={{ fontSize: '0.78rem', color: '#8fa0b5', marginTop: '10px', fontStyle: 'italic' }}>
            Note: {currentSubmission.notes}
          </div>
        )}
      </div>

      {/* Review Feedback Banner (If changes requested or approved) */}
      {currentSubmission.review && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background:
              currentSubmission.review.status === 'APPROVED'
                ? 'rgba(52, 211, 153, 0.08)'
                : 'rgba(255, 176, 0, 0.08)',
            border:
              currentSubmission.review.status === 'APPROVED'
                ? '1px solid rgba(52, 211, 153, 0.25)'
                : '1px solid rgba(255, 176, 0, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {currentSubmission.review.status === 'APPROVED' ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : (
                <RotateCcw size={16} color="#FFB000" />
              )}
              <span
                style={{
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  color: currentSubmission.review.status === 'APPROVED' ? '#34d399' : '#FFB000'
                }}
              >
                {currentSubmission.review.status === 'APPROVED'
                  ? 'Client Approved'
                  : 'Client Requested Changes'}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#8fa0b5' }}>
              {new Date(currentSubmission.review.reviewedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.45', marginTop: '6px' }}>
            "{currentSubmission.review.feedback}"
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8fa0b5', marginTop: '4px' }}>
            Reviewed by: {currentSubmission.review.reviewerName || 'Client'}
          </div>
        </div>
      )}

      {/* CLIENT REVIEW ACTIONS (Visible to USER and Admin when awaiting review on latest version) */}
      {isPendingReview && isLatestVersion && (userRole === 'USER' || userRole === 'ADMIN') && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(3, 7, 12, 0.95) 100%)',
            border: '1px solid rgba(0, 217, 255, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <UserCheck size={18} color="#00D9FF" />
            <h5 style={{ margin: 0, fontSize: '0.92rem', color: '#FFFFFF', fontWeight: '700' }}>
              Client Review Required
            </h5>
          </div>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#8fa0b5', lineHeight: '1.45' }}>
            Inspect the deliverables above. Once satisfied, click <strong>Approve Work</strong> to finalize and complete the sprint, or request specific revisions below.
          </p>

          {!showApproveConfirm && !showRequestChangesForm && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="portal-btn-primary"
                onClick={() => setShowApproveConfirm(true)}
                disabled={isProcessing}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  borderColor: 'rgba(52, 211, 153, 0.5)',
                  flex: 1
                }}
              >
                <CheckCircle2 size={16} /> Approve Work
              </button>
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={() => setShowRequestChangesForm(true)}
                disabled={isProcessing}
                style={{
                  borderColor: 'rgba(255, 176, 0, 0.4)',
                  color: '#FFB000',
                  flex: 1
                }}
              >
                <RotateCcw size={16} /> Request Changes
              </button>
            </div>
          )}

          {/* Approve Confirmation Dialog */}
          {showApproveConfirm && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.4)'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#34d399', marginBottom: '6px' }}>
                Approve this submission?
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px' }}>
                This confirms that you have inspected submission v{currentSubmission.version} and accept all deliverables. The ticket will be marked <strong>COMPLETED</strong>.
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="portal-btn-secondary"
                  onClick={() => setShowApproveConfirm(false)}
                  disabled={isProcessing}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="portal-btn-primary"
                  onClick={handleConfirmApprove}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  }}
                >
                  {isProcessing ? 'Finalizing Approval...' : 'Confirm & Complete Ticket'}
                </button>
              </div>
            </div>
          )}

          {/* Request Changes Form */}
          {showRequestChangesForm && (
            <form onSubmit={handleSubmitChangeRequest}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 176, 0, 0.06)',
                  border: '1px solid rgba(255, 176, 0, 0.3)'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFB000', marginBottom: '4px' }}>
                  What needs to be changed? *
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8fa0b5', marginBottom: '10px' }}>
                  Please detail the adjustments or additions required. The specialist team will review and resubmit.
                </div>
                {feedbackError && (
                  <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '8px' }}>
                    {feedbackError}
                  </div>
                )}
                <textarea
                  className="portal-form-textarea"
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Please include CTOs for each company, and format the European phone numbers..."
                  required
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="portal-btn-secondary"
                    onClick={() => setShowRequestChangesForm(false)}
                    disabled={isProcessing}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="portal-btn-primary"
                    disabled={isProcessing || !feedbackText.trim()}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                      color: '#FFF'
                    }}
                  >
                    {isProcessing ? 'Sending Feedback...' : 'Send Revision Request to Team'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
