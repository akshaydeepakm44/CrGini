import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { WORKFLOW_STAGES, getWorkflowCurrentStep } from '../utils/designStatusUtils';

export default function DesignReviewPanel({ ticket, latestSubmission }) {
  if (!ticket) return null;

  const currentStep = getWorkflowCurrentStep(ticket.status);
  const isChangesRequested = ticket.status === 'CHANGES_REQUESTED';
  const isApproved = ticket.status === 'APPROVED' || ticket.status === 'COMPLETED';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
            Work Lifecycle & Review State
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            Active Stage: <strong style={{ color: ticket.statusConfig.color }}>{ticket.statusConfig.label}</strong>
          </p>
        </div>

        <div>
          {isApproved ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} /> Work Approved
            </span>
          ) : isChangesRequested ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <AlertCircle size={16} /> Changes Requested
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: ticket.statusConfig.bg,
                color: ticket.statusConfig.color,
                border: `1px solid ${ticket.statusConfig.border}`,
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <Clock size={16} /> {ticket.statusConfig.label}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Lifecycle Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          position: 'relative',
        }}
      >
        {[
          { step: 1, label: 'Request', desc: 'Brief Submitted' },
          { step: 2, label: 'Assigned', desc: 'Specialist Assigned' },
          { step: 3, label: 'In Progress', desc: 'Design Active' },
          { step: 4, label: isChangesRequested ? 'Changes Requested' : 'Client Review', desc: isChangesRequested ? 'Feedback Provided' : 'Review Deliverable' },
          { step: 5, label: 'Completed', desc: 'Approved & Final' }
        ].map((s) => {
          const isPassed = currentStep > s.step || (s.step === 4 && isApproved) || (s.step === 5 && isApproved);
          const isCurrent = (currentStep === s.step && !isApproved) || (s.step === 5 && isApproved);

          let stepColor = '#CBD5E1';
          let stepBg = '#F1F5F9';
          let textColor = '#64748B';

          if (isCurrent) {
            stepColor = isChangesRequested && s.step === 4 ? '#DC2626' : '#0284C7';
            stepBg = isChangesRequested && s.step === 4 ? '#FEF2F2' : '#F0F9FF';
            textColor = isChangesRequested && s.step === 4 ? '#DC2626' : '#0284C7';
          } else if (isPassed) {
            stepColor = '#059669';
            stepBg = '#ECFDF5';
            textColor = '#059669';
          }

          return (
            <div
              key={s.step}
              style={{
                padding: '12px 10px',
                borderRadius: '8px',
                backgroundColor: stepBg,
                border: `1px solid ${isCurrent ? stepColor : '#E2E8F0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: stepColor,
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                {isPassed && !isCurrent ? '✓' : s.step}
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
