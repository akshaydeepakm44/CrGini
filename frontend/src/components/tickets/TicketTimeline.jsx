import React from 'react';
import { Check, Clock, AlertCircle, Eye, PlayCircle, ShieldCheck } from 'lucide-react';

/**
 * Reusable TicketTimeline Component
 * Visualizes the ticket lifecycle progression including revision branches (V1 -> Changes -> V2)
 */
export default function TicketTimeline({
  currentStatus = 'IN_PROGRESS',
  version = 1,
  hasRevisions = false,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
  style = {},
}) {
  const normalized = String(currentStatus).toUpperCase();

  // Define linear lifecycle progression
  const baseSteps = [
    { key: 'SUBMITTED', label: 'Request Submitted', icon: Clock },
    { key: 'ASSIGNED', label: 'Sprint Queued', icon: PlayCircle },
    { key: 'IN_PROGRESS', label: 'Work In Progress', icon: PlayCircle },
    { key: 'CLIENT_REVIEW', label: `Client Review (V${version})`, icon: Eye },
    { key: 'COMPLETED', label: 'Approved & Completed', icon: ShieldCheck },
  ];

  // If revisions requested, insert revision step
  const steps = hasRevisions || normalized === 'CHANGES_REQUESTED' || normalized === 'WORK_RESUBMITTED'
    ? [
        { key: 'SUBMITTED', label: 'Request Submitted', icon: Clock },
        { key: 'ASSIGNED', label: 'Sprint Queued', icon: PlayCircle },
        { key: 'IN_PROGRESS', label: 'Work In Progress', icon: PlayCircle },
        { key: 'CLIENT_REVIEW', label: 'V1 Review', icon: Eye },
        { key: 'CHANGES_REQUESTED', label: 'Changes Requested', icon: AlertCircle, isRevision: true },
        { key: 'WORK_RESUBMITTED', label: 'V2 Review', icon: Eye },
        { key: 'COMPLETED', label: 'Approved & Completed', icon: ShieldCheck },
      ]
    : baseSteps;

  const getStepState = (stepKey, index) => {
    const statusOrder = {
      REQUEST_CREATED: 0,
      SUBMITTED: 0,
      ASSIGNED: 1,
      IN_PROGRESS: 2,
      CLIENT_REVIEW: 3,
      WORK_SUBMITTED: 3,
      CHANGES_REQUESTED: 4,
      WORK_RESUBMITTED: 5,
      APPROVED: 6,
      COMPLETED: 6,
    };

    const currentOrder = statusOrder[normalized] ?? 2;

    if (stepKey === normalized) {
      return 'current';
    }
    if (index < currentOrder) {
      return 'completed';
    }
    return 'upcoming';
  };

  if (orientation === 'vertical') {
    return (
      <div className={`cg-ticket-timeline-vertical ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0', ...style }}>
        {steps.map((step, index) => {
          const state = getStepState(step.key, index);
          const isLast = index === steps.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.key} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    backgroundColor:
                      state === 'completed'
                        ? 'var(--cg-mint-500)'
                        : state === 'current'
                        ? step.isRevision ? 'var(--cg-coral-500)' : 'var(--cg-purple-600)'
                        : 'var(--cg-neutral-100)',
                    color: state === 'upcoming' ? 'var(--cg-neutral-400)' : '#FFFFFF',
                    border: state === 'current' ? '3px solid var(--cg-purple-100)' : 'none',
                    boxShadow: state === 'current' ? '0 0 0 4px rgba(124, 58, 237, 0.15)' : 'none',
                  }}
                >
                  {state === 'completed' ? <Check size={16} /> : <StepIcon size={14} />}
                </div>

                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '28px',
                      backgroundColor: state === 'completed' ? 'var(--cg-mint-500)' : 'var(--cg-border)',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              <div style={{ paddingBottom: isLast ? 0 : '24px', paddingTop: '4px' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: state === 'current' ? 700 : 500,
                    color: state === 'upcoming' ? 'var(--cg-text-muted)' : 'var(--cg-text-primary)',
                  }}
                >
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div
      className={`cg-ticket-timeline-horizontal ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        overflowX: 'auto',
        padding: '16px 0',
        ...style,
      }}
    >
      {steps.map((step, index) => {
        const state = getStepState(step.key, index);
        const isLast = index === steps.length - 1;
        const StepIcon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minWidth: '110px',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    state === 'completed'
                      ? 'var(--cg-mint-500)'
                      : state === 'current'
                      ? step.isRevision ? 'var(--cg-coral-500)' : 'var(--cg-purple-600)'
                      : 'var(--cg-neutral-100)',
                  color: state === 'upcoming' ? 'var(--cg-neutral-400)' : '#FFFFFF',
                  boxShadow: state === 'current' ? '0 0 0 4px rgba(124, 58, 237, 0.15)' : 'none',
                  marginBottom: '8px',
                }}
              >
                {state === 'completed' ? <Check size={18} /> : <StepIcon size={16} />}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: state === 'current' ? 700 : 500,
                  color: state === 'upcoming' ? 'var(--cg-text-muted)' : 'var(--cg-text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {step.label}
              </div>
            </div>

            {!isLast && (
              <div
                style={{
                  height: '2px',
                  flex: 1,
                  backgroundColor: state === 'completed' ? 'var(--cg-mint-500)' : 'var(--cg-border)',
                  marginBottom: '24px',
                  minWidth: '30px',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
