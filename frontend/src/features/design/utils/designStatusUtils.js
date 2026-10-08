/**
 * Design Status & Workflow Utilities
 */

export const WORKFLOW_STAGES = [
  { key: 'REQUEST', label: 'Request Created', step: 1 },
  { key: 'ASSIGNED', label: 'Assigned', step: 2 },
  { key: 'IN_PROGRESS', label: 'In Progress', step: 3 },
  { key: 'CLIENT_REVIEW', label: 'Client Review', step: 4 },
  { key: 'CHANGES_REQUESTED', label: 'Changes Requested', step: 4.5 },
  { key: 'COMPLETED', label: 'Completed', step: 5 }
];

export function getWorkflowCurrentStep(status) {
  switch (status) {
    case 'REQUEST_CREATED':
    case 'PAYMENT_COMPLETED':
      return 1;
    case 'ASSIGNED':
      return 2;
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
      return 3;
    case 'CLIENT_REVIEW':
    case 'WORK_SUBMITTED':
    case 'WORK_RESUBMITTED':
      return 4;
    case 'CHANGES_REQUESTED':
      return 4; // Special state within review
    case 'APPROVED':
    case 'COMPLETED':
      return 5;
    default:
      return 1;
  }
}

export function canStartWork(ticket) {
  if (!ticket) return false;
  return ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED'].includes(ticket.status);
}

export function canSubmitDeliverables(ticket) {
  if (!ticket) return false;
  return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(ticket.status);
}

export function canMarkCompleted(ticket) {
  if (!ticket) return false;
  return ['APPROVED', 'CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(ticket.status);
}

export function isImageFile(filenameOrType = '') {
  const str = String(filenameOrType).toLowerCase();
  return (
    str.includes('image/') ||
    str.endsWith('.png') ||
    str.endsWith('.jpg') ||
    str.endsWith('.jpeg') ||
    str.endsWith('.webp') ||
    str.endsWith('.svg') ||
    str.endsWith('.gif')
  );
}

export function isPdfFile(filenameOrType = '') {
  const str = String(filenameOrType).toLowerCase();
  return str.includes('application/pdf') || str.endsWith('.pdf');
}

export function isVideoFile(filenameOrType = '') {
  const str = String(filenameOrType).toLowerCase();
  return (
    str.includes('video/') ||
    str.endsWith('.mp4') ||
    str.endsWith('.mov') ||
    str.endsWith('.webm')
  );
}
