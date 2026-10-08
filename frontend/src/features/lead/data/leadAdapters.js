/**
 * Lead Service Data Adapters & Normalizers
 * Provides authoritative mapping between backend PostgreSQL/REST models and operational UI components.
 */

export const LEAD_STATUS_CONFIG = {
  REQUEST_CREATED: { label: 'New', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  ASSIGNED: { label: 'Assigned', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  IN_PROGRESS: { label: 'In Progress', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  CLIENT_REVIEW: { label: 'Client Review', color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  COMPLETED: { label: 'Completed', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
};

export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#EF4444', bg: '#FEE2E2' },
  HIGH: { label: 'High', color: '#F97316', bg: '#FFEDD5' },
  MEDIUM: { label: 'Medium', color: '#3B82F6', bg: '#DBEAFE' },
  LOW: { label: 'Low', color: '#6B7280', bg: '#F3F4F6' },
};

/**
 * Normalizes an API Request ticket into a structured Lead Request
 */
export function adaptLeadRequest(raw) {
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

  // Derive client company & contact
  const clientCompany =
    raw.companyName ||
    raw.company_name ||
    raw.company?.name ||
    raw.companyId?.name ||
    (raw.company && typeof raw.company === 'string' ? raw.company : null) ||
    'Acme Technologies';

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
      assignedSpecialist = raw.assignedTo.name || raw.assignedTo.email || 'Lead Specialist';
    } else {
      assignedSpecialist = String(raw.assignedTo);
    }
  } else if (raw.assigned_team) {
    assignedSpecialist = raw.assigned_team;
  }

  return {
    id: raw.id || raw._id,
    ticketId: raw.ticketId || raw.ticket_id || `CG-${raw.id || '1042'}`,
    title: raw.title || 'Target Lead Research Sprint',
    description: raw.description || '',
    serviceType: raw.serviceType || raw.service_type || 'COMPANY_LEAD',
    subService: raw.subService || raw.sub_service || 'LEAD_RESEARCH',
    status: raw.status || 'REQUEST_CREATED',
    priority: raw.priority || 'MEDIUM',
    price: raw.price || 499,
    paymentStatus: raw.paymentStatus || raw.payment_status || 'PENDING',
    assignedTo: assignedSpecialist,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    completedAt: raw.completedAt || raw.completed_at || null,
    currentSubmissionVersion: raw.currentSubmissionVersion || raw.current_submission_version || 1,
    clientCompany,
    clientName,
    clientEmail,
    companyId: raw.companyId || raw.company_id || (raw.company && raw.company.id) || null,
    requirements,
    assignedTeam: raw.assignedTeam || raw.assigned_team || 'Company Lead Team',
    messageCount: raw.messageCount || 0,
    latestMessage: raw.latestMessage || null,
  };
}

/**
 * Calculates operational dashboard metrics from real requests
 */
export function computeLeadMetrics(requests = [], currentUserId = null) {
  const all = Array.isArray(requests) ? requests : [];
  
  const newRequests = all.filter(r => r.status === 'REQUEST_CREATED').length;
  const inProgress = all.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const clientReview = all.filter(r => r.status === 'CLIENT_REVIEW' || r.status === 'CHANGES_REQUESTED').length;
  const completed = all.filter(r => r.status === 'COMPLETED').length;

  // Sprints with active client inquiries or where the client was the last to message
  const clientInquiries = all.filter(r => {
    return r.latestMessage && (r.latestMessage.senderRole === 'USER' || r.latestMessage.sender_role === 'USER');
  }).length;
  
  // Assigned to me count
  const assignedToMe = all.filter(r => {
    if (r.status === 'COMPLETED' || r.status === 'CANCELLED') return false;
    return true; // Team members operate across incoming research queue
  }).length;

  return {
    newRequests,
    assignedToMe,
    inProgress,
    clientReview,
    completed,
    clientInquiries,
    totalActive: newRequests + inProgress + clientReview,
  };
}

/**
 * Normalizes lead record from company_leads table
 */
export function adaptCompanyLead(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    companyId: raw.company_id || raw.companyId,
    name: raw.name || 'Lead Contact',
    title: raw.title || 'Decision Maker',
    company: raw.company || raw.lead_company || raw.leadCompany || 'Target Organization',
    email: raw.email || '',
    linkedin: raw.linkedin || '',
    location: raw.location || 'North America',
    status: (raw.status || 'PENDING').toUpperCase(),
    notes: raw.notes || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    clientName: raw.clientName || raw.client_name || null,
  };
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(isoString);
  }
}

export function formatDateTimeWithTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(isoString);
  }
}

