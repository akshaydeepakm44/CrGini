/**
 * Boost Service Data Adapters & Normalizers
 * Authoritative mapping between backend PostgreSQL models and Boost operational UI components.
 */

import { detectBoostService, BOOST_SERVICES } from './boostServiceData';

export const BOOST_STATUS_CONFIG = {
  REQUEST_CREATED: { label: 'New', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', step: 1 },
  PAYMENT_COMPLETED: { label: 'New', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', step: 1 },
  ASSIGNED: { label: 'Assigned', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', step: 2 },
  IN_PROGRESS: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', step: 3 },
  UNDER_REVIEW: { label: 'Reviewing', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', step: 3 },
  CLIENT_REVIEW: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  WORK_SUBMITTED: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  WORK_RESUBMITTED: { label: 'Client Review', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', step: 4 },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', step: 4 },
  APPROVED: { label: 'Approved', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', step: 5 },
  COMPLETED: { label: 'Completed', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', step: 5 },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', step: 0 }
};

export const BOOST_PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
  HIGH: { label: 'High', color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA' },
  MEDIUM: { label: 'Medium', color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  LOW: { label: 'Low', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' }
};

/**
 * Normalizes an API Request ticket into a structured Boost Request
 */
export function adaptBoostRequest(raw) {
  if (!raw) return null;

  let requirements = {};
  if (raw.notes) {
    try {
      const parsedNotes = typeof raw.notes === 'string' ? JSON.parse(raw.notes) : raw.notes;
      if (parsedNotes && typeof parsedNotes === 'object') {
        requirements = parsedNotes.requirements || parsedNotes;
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
    'Client Account';

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
      assignedSpecialist = raw.assignedTo.name || raw.assignedTo.email || 'Boost Specialist';
    } else {
      assignedSpecialist = String(raw.assignedTo);
    }
  } else if (raw.assigned_team) {
    assignedSpecialist = raw.assigned_team;
  }

  let subService = raw.subService || raw.sub_service || null;
  if (!subService && raw.notes) {
    try {
      const parsedNotes = typeof raw.notes === 'string' ? JSON.parse(raw.notes) : raw.notes;
      if (parsedNotes?.subService) {
        subService = parsedNotes.subService;
      }
    } catch {}
  }

  // Resolve service discipline
  const detectedService = detectBoostService({ ...raw, subService });

  // Normalize attachments
  let attachments = [];
  if (Array.isArray(raw.attachments)) {
    attachments = raw.attachments;
  } else if (raw.files && Array.isArray(raw.files)) {
    attachments = raw.files;
  } else if (requirements && Array.isArray(requirements.attachments)) {
    attachments = requirements.attachments;
  }

  return {
    id: raw.id || raw._id,
    ticketId: raw.ticketId || raw.ticket_id || `CG-${raw.id || '1018'}`,
    title: raw.title || 'Growth & Creative Sprint',
    description: raw.description || '',
    serviceType: raw.serviceType || raw.service_type || 'COMPANY_BOOST',
    subService: subService || raw.subService || raw.sub_service || detectedService.subServiceMatch[0],
    service: detectedService,
    serviceSlug: detectedService.slug,
    status: raw.status || 'REQUEST_CREATED',
    statusConfig: BOOST_STATUS_CONFIG[raw.status] || BOOST_STATUS_CONFIG.REQUEST_CREATED,
    priority: raw.priority || 'MEDIUM',
    priorityConfig: BOOST_PRIORITY_CONFIG[raw.priority] || BOOST_PRIORITY_CONFIG.MEDIUM,
    price: raw.price || 799,
    paymentStatus: raw.paymentStatus || raw.payment_status || 'PAID',
    assignedTo: assignedSpecialist,
    assignedToId: raw.assignedToId || raw.assigned_to || null,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    deadline: raw.deadline || raw.target_date || raw.dueDate || null,
    completedAt: raw.completedAt || raw.completed_at || null,
    approvedAt: raw.approvedAt || raw.approved_at || null,
    currentSubmissionVersion: raw.currentSubmissionVersion || raw.current_submission_version || 1,
    clientCompany,
    clientName,
    clientEmail,
    companyId: raw.companyId || raw.company_id || (raw.company && raw.company.id) || null,
    userId: raw.userId || raw.user_id || (raw.user && raw.user.id) || null,
    requirements,
    attachments,
    submissions: Array.isArray(raw.submissions) ? raw.submissions : [],
    messages: Array.isArray(raw.messages) ? raw.messages : [],
    messageCount: raw.messageCount || (Array.isArray(raw.messages) ? raw.messages.length : 0),
    latestMessage: raw.latestMessage || null,
    raw
  };
}

/**
 * Computes high-value operational metrics for the Boost Workspace
 */
export function computeBoostMetrics(requests = [], currentUserId = null) {
  const boostReqs = requests.filter(Boolean);

  let newRequests = 0;
  let assignedToMe = 0;
  let inProgress = 0;
  let clientReview = 0;
  let changesRequested = 0;
  let completed = 0;

  // Breakdown by the seven services
  const serviceStats = {};
  for (const s of BOOST_SERVICES) {
    serviceStats[s.slug] = {
      total: 0,
      active: 0,
      review: 0,
      completed: 0
    };
  }

  for (const r of boostReqs) {
    const s = r.status;
    const isNew = ['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(s);
    const isAssigned = s === 'ASSIGNED';
    const isInProg = s === 'IN_PROGRESS' || s === 'UNDER_REVIEW';
    const isReview = ['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(s);
    const isChanges = s === 'CHANGES_REQUESTED';
    const isDone = s === 'COMPLETED' || s === 'APPROVED';

    if (isNew) newRequests++;
    if (isInProg || isAssigned) inProgress++;
    if (isReview) clientReview++;
    if (isChanges) changesRequested++;
    if (isDone) completed++;

    // Assigned to me check
    if (
      currentUserId &&
      (String(r.assignedToId) === String(currentUserId) ||
       String(r.assignedTo).toLowerCase().includes('me') ||
       String(r.assignedTo).toLowerCase().includes('growth'))
    ) {
      assignedToMe++;
    }

    // Service breakdown
    const slug = r.serviceSlug || 'strategic-plans';
    if (serviceStats[slug]) {
      serviceStats[slug].total++;
      if (isDone) {
        serviceStats[slug].completed++;
      } else if (isReview || isChanges) {
        serviceStats[slug].review++;
      } else {
        serviceStats[slug].active++;
      }
    }
  }

  return {
    total: boostReqs.length,
    totalActive: newRequests + inProgress + clientReview + changesRequested,
    newRequests,
    assignedToMe,
    inProgress,
    clientReview,
    changesRequested,
    completed,
    serviceStats
  };
}

export function formatBoostDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

export function formatBoostDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
}
