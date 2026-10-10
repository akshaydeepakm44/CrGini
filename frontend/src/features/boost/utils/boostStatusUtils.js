/**
 * Boost Status Utilities & Workflow Transition Rules
 */

export const WORKFLOW_STAGES = [
  { key: 'REQUEST_CREATED', label: 'Request Created', step: 1 },
  { key: 'ASSIGNED', label: 'Sprint Queued', step: 2 },
  { key: 'IN_PROGRESS', label: 'In Progress / Work', step: 3 },
  { key: 'CLIENT_REVIEW', label: 'Client Review', step: 4 },
  { key: 'COMPLETED', label: 'Approved & Completed', step: 5 }
];

export function getWorkflowCurrentStep(status) {
  if (['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(status)) return 1;
  if (status === 'ASSIGNED') return 2;
  if (['IN_PROGRESS', 'UNDER_REVIEW'].includes(status)) return 3;
  if (['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED', 'CHANGES_REQUESTED'].includes(status)) return 4;
  if (['COMPLETED', 'APPROVED'].includes(status)) return 5;
  return 1;
}

export function canStartWork(status) {
  return ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(status);
}

export function canSubmitDeliverables(status) {
  return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);
}

export function canReassign(status) {
  return !['COMPLETED', 'CANCELLED'].includes(status);
}

export function canMarkCompleted(status) {
  return ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED', 'APPROVED'].includes(status);
}
