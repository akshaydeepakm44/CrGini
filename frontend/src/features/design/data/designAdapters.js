/**
 * Design Service Data Adapters & Normalizers
 * Authoritative mapping between backend models and UI/Design operational components.
 */

import { detectDesignService, DESIGN_SERVICES } from './designServiceData';

export const DESIGN_STATUS_CONFIG = {
  REQUEST_CREATED: { label: 'New', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', step: 1 },
  PAYMENT_COMPLETED: { label: 'New', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', step: 1 },
  ASSIGNED: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', step: 2 },
  IN_PROGRESS: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', step: 3 },
  UNDER_REVIEW: { label: 'Reviewing', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', step: 3 },
  CLIENT_REVIEW: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  WORK_SUBMITTED: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  WORK_RESUBMITTED: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', step: 4 },
  APPROVED: { label: 'Completed', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', step: 5 },
  COMPLETED: { label: 'Completed', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', step: 5 },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', step: 0 }
};

export const DESIGN_PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
  HIGH: { label: 'High', color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA' },
  MEDIUM: { label: 'Medium', color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  LOW: { label: 'Low', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' }
};

/**
 * Extracts a Figma link from text or attachments if present
 */
export function extractFigmaUrl(raw) {
  if (!raw) return null;
  const figmaRegex = /(https?:\/\/(?:www\.)?figma\.com\/(?:file|proto|design|board)\/[a-zA-Z0-9_-]+[^\s"'<>]*)/i;

  // 1. Direct figmaLink property
  if (raw.figmaLink || raw.figmaUrl || raw.figma_url) {
    return raw.figmaLink || raw.figmaUrl || raw.figma_url;
  }

  // 2. Check external_link
  if (raw.external_link && figmaRegex.test(raw.external_link)) {
    return raw.external_link;
  }

  // 3. Check notes or requirements
  let notesStr = typeof raw.notes === 'string' ? raw.notes : JSON.stringify(raw.notes || '');
  const matchNotes = notesStr.match(figmaRegex);
  if (matchNotes) return matchNotes[0];

  // 4. Check description
  if (raw.description) {
    const matchDesc = raw.description.match(figmaRegex);
    if (matchDesc) return matchDesc[0];
  }

  return null;
}

/**
 * Normalizes an API Request ticket into a structured Design Request
 */
export function adaptDesignRequest(raw) {
  if (!raw) return null;

  let requirements = {};
  let notesSubService = null;
  if (raw.notes) {
    try {
      const parsedNotes = typeof raw.notes === 'string' ? JSON.parse(raw.notes) : raw.notes;
      if (parsedNotes && typeof parsedNotes === 'object') {
        requirements = parsedNotes.requirements || parsedNotes;
        notesSubService = parsedNotes.subService || parsedNotes.sub_service;
      }
    } catch {
      requirements = { rawNotes: raw.notes };
    }
  }

  // Derive client company & contact details
  const clientCompany =
    raw.companyName ||
    raw.company_name ||
    raw.company?.name ||
    raw.companyId?.name ||
    (raw.company && typeof raw.company === 'string' ? raw.company : null) ||
    'Client Organization';

  const clientName =
    raw.clientUserName ||
    raw.userName ||
    raw.user?.name ||
    raw.userId?.name ||
    'Client Partner';

  const clientEmail =
    raw.clientUserEmail ||
    raw.userEmail ||
    raw.user?.email ||
    raw.userId?.email ||
    'client@example.com';

  let assignedSpecialist = 'Unassigned Specialist';
  if (raw.assignedSpecialistName) {
    assignedSpecialist = raw.assignedSpecialistName;
  } else if (raw.assigned_specialist_name) {
    assignedSpecialist = raw.assigned_specialist_name;
  } else if (raw.assignedToName) {
    assignedSpecialist = raw.assignedToName;
  } else if (raw.assignedTo) {
    if (typeof raw.assignedTo === 'object' && raw.assignedTo !== null) {
      assignedSpecialist = raw.assignedTo.name || raw.assignedTo.email || 'Design Specialist';
    } else {
      assignedSpecialist = String(raw.assignedTo);
    }
  } else if (raw.assigned_team) {
    assignedSpecialist = raw.assigned_team;
  }

  // Resolve design service discipline
  const detectedService = detectDesignService({
    ...raw,
    subService: raw.subService || raw.sub_service || notesSubService
  });

  // Normalize attachments
  let attachments = [];
  if (Array.isArray(raw.attachments)) {
    attachments = raw.attachments;
  } else if (raw.files && Array.isArray(raw.files)) {
    attachments = raw.files;
  } else if (requirements && Array.isArray(requirements.attachments)) {
    attachments = requirements.attachments;
  }

  // Extract safe Figma project link if present
  const figmaUrl = extractFigmaUrl(raw);

  return {
    id: raw.id || raw._id,
    _id: raw._id || raw.id,
    ticketId: raw.ticketId || raw.ticket_id || `CG-${raw.id || '1031'}`,
    title: raw.title || 'UI / Design Enhancement Sprint',
    description: raw.description || '',
    serviceType: raw.serviceType || raw.service_type || 'LANDING_PAGE',
    subService: raw.subService || raw.sub_service || detectedService.subServiceMatch[0],
    service: detectedService,
    serviceSlug: detectedService.slug,
    requestType: detectedService.slug,
    status: raw.status || 'REQUEST_CREATED',
    statusConfig: DESIGN_STATUS_CONFIG[raw.status] || DESIGN_STATUS_CONFIG.REQUEST_CREATED,
    priority: raw.priority || 'MEDIUM',
    priorityConfig: DESIGN_PRIORITY_CONFIG[raw.priority] || DESIGN_PRIORITY_CONFIG.MEDIUM,
    price: raw.price || 599,
    paymentStatus: raw.paymentStatus || raw.payment_status || 'PAID',
    assignedTo: assignedSpecialist,
    assignedToId: raw.assignedToId || raw.assigned_to || (typeof raw.assignedTo === 'object' ? raw.assignedTo?.id : null),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    deadline: raw.deadline || raw.target_date || raw.dueDate || raw.due_date || null,
    clientCompany,
    clientName,
    clientEmail,
    requirements,
    attachments,
    currentSubmissionVersion: raw.currentSubmissionVersion || raw.current_submission_version || 1,
    figmaUrl,
    messageCount: raw.messageCount || 0,
    latestMessage: raw.latestMessage || null,
    raw
  };
}

/**
 * Computes UI/Design operational metrics from requests
 */
export function computeDesignMetrics(requests = [], currentUserId = null) {
  const metrics = {
    total: requests.length,
    totalActive: 0,
    newRequests: 0,
    assigned: 0,
    assignedToMe: 0,
    inProgress: 0,
    clientReview: 0,
    changesRequested: 0,
    completed: 0,
    serviceStats: {
      'ui-ux-audit': 0,
      'figma-project': 0,
      'redesign-request': 0
    }
  };

  requests.forEach((r) => {
    // Service stats
    if (r.serviceSlug && metrics.serviceStats[r.serviceSlug] !== undefined) {
      metrics.serviceStats[r.serviceSlug]++;
    }

    // Status counts
    if (['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)) {
      metrics.newRequests++;
      metrics.totalActive++;
    } else if (r.status === 'ASSIGNED') {
      metrics.assigned++;
      metrics.totalActive++;
    } else if (['IN_PROGRESS', 'UNDER_REVIEW'].includes(r.status)) {
      metrics.inProgress++;
      metrics.totalActive++;
    } else if (['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)) {
      metrics.clientReview++;
      metrics.totalActive++;
    } else if (r.status === 'CHANGES_REQUESTED') {
      metrics.changesRequested++;
      metrics.totalActive++;
    } else if (['COMPLETED', 'APPROVED'].includes(r.status)) {
      metrics.completed++;
    }

    // Assigned to me check
    if (currentUserId && (String(r.assignedToId) === String(currentUserId) || (typeof r.assignedTo === 'string' && r.assignedTo.toLowerCase().includes('me')))) {
      metrics.assignedToMe++;
    }
  });

  return metrics;
}

export function formatDesignDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

export function formatDesignDateTime(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}
