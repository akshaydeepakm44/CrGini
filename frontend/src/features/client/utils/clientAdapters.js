/**
 * CreativeGini Client Data Adapters
 * Safely maps backend database records (requests, submissions, company) into client-facing view models.
 * Enforces client-friendly terminology without altering backend contracts.
 */

// Mapping of internal backend service codes to client-facing service names & channels
const SERVICE_TYPE_MAP = {
  COMPANY_LEAD: {
    defaultName: 'Lead Research',
    channel: 'Digitalising',
    channelSlug: 'digitalising',
    subServices: {
      LEAD_RESEARCH: 'Lead Research',
      COMPANY_STUDY: 'Company Study',
      KEY_PEOPLE: 'Key People Research',
      PITCH_SUPPORT: 'Pitch Support',
    }
  },
  COMPANY_BOOST: {
    defaultName: 'Strategic Planner',
    channel: 'Boosting',
    channelSlug: 'boosting',
    subServices: {
      STRATEGIC_PLAN: 'Strategic Planner',
      CONTENT: 'Content Creator',
      DEVREL: 'DevRel',
      DEVREL_PLAN: 'DevRel',
      GTM: 'GTM Strategy',
      GTM_STRATEGY: 'GTM Strategy',
      AD_CREATIVES: 'Ad Creatives',
      ADS: 'Ad Creatives',
      CUSTOM: 'Custom Growth Sprint',
    }
  },
  LANDING_PAGE: {
    defaultName: 'UI / Design Sprint',
    channel: 'UI / Design',
    channelSlug: 'design',
    subServices: {
      UI_UX_AUDIT: 'UI/UX Audit',
      FIGMA_PROJECT: 'Figma Project',
      REDESIGN_REQUEST: 'Redesign Request',
      REDESIGN: 'Redesign Request',
      LANDING_PAGE: 'Redesign Request',
      WEB_APP: 'Web Application MVP',
      MOBILE_APP: 'Mobile App Development',
      API_BACKEND: 'API & Backend Systems',
    }
  },
  COMPANY_UI: {
    defaultName: 'UI / Design Sprint',
    channel: 'UI / Design',
    channelSlug: 'design',
    subServices: {
      UI_UX_AUDIT: 'UI/UX Audit',
      FIGMA_PROJECT: 'Figma Project',
      REDESIGN_REQUEST: 'Redesign Request',
      REDESIGN: 'Redesign Request',
      LANDING_PAGE: 'Redesign Request',
    }
  },
  COMPANY_DEV: {
    defaultName: 'App Development Sprint',
    channel: 'App Development',
    channelSlug: 'development',
    subServices: {
      WEB_APP: 'Web Application MVP',
      MOBILE_APP: 'Mobile App Development',
      API_BACKEND: 'API & Backend Systems',
    }
  }
};

/**
 * Format raw date strings into readable client dates (e.g. "Oct 02, 2026")
 */
export const formatDate = (rawDate) => {
  if (!rawDate) return 'Recent';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recent';
  }
};

export const formatDateTime = (rawDate) => {
  if (!rawDate) return 'Recent';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Recent';
  }
};


/**
 * Adapt a single raw ticket/request object from the backend
 */
export const adaptRequest = (raw) => {
  if (!raw) return null;

  const ticketId = raw.ticketId || raw.ticket_id || `CG-${raw.id || '1000'}`;
  const rawServiceType = raw.serviceType || raw.service_type || 'COMPANY_BOOST';
  let rawSubService = raw.subService || raw.sub_service || '';
  if (!rawSubService && raw.notes) {
    try {
      const parsed = typeof raw.notes === 'string' ? JSON.parse(raw.notes) : raw.notes;
      if (parsed?.subService) rawSubService = parsed.subService;
    } catch {}
  }
  
  const mapping = SERVICE_TYPE_MAP[rawServiceType] || {
    defaultName: raw.service || 'Specialist Sprint',
    channel: 'Boosting',
    channelSlug: 'boosting',
    subServices: {}
  };

  const serviceName = (rawSubService && mapping.subServices?.[rawSubService]) || raw.service || mapping.defaultName;
  let channel = mapping.channel;
  let channelSlug = mapping.channelSlug;
  const upperSub = String(rawSubService || '').toUpperCase();
  if (['WEB_APP', 'MOBILE_APP', 'API_BACKEND'].includes(upperSub)) {
    channel = 'App Development';
    channelSlug = 'development';
  }

  // Normalize status into client-friendly status strings
  const statusRaw = String(raw.status || 'IN_PROGRESS').toUpperCase();
  let normalizedStatus = statusRaw;
  if (statusRaw === 'REQUEST_CREATED' || statusRaw === 'NEW') normalizedStatus = 'SUBMITTED';
  if (statusRaw === 'WORK_SUBMITTED') normalizedStatus = 'CLIENT_REVIEW';
  if (statusRaw === 'WORK_RESUBMITTED') normalizedStatus = 'CLIENT_REVIEW';

  const assignedSpecialist = raw.assignedSpecialist || raw.assigned_to_name || (raw.assignedTo ? 'Assigned Specialist' : 'Specialist Queue');

  const price = raw.price || raw.total_amount || (channel === 'Boosting' ? 799 : 499);
  const paymentStatus = (raw.paymentStatus || raw.payment_status || (price ? 'PAID' : 'PENDING')).toUpperCase();

  return {
    id: raw.id || ticketId,
    ticketId,
    title: raw.title || `${serviceName} Sprint`,
    service: serviceName,
    serviceType: rawServiceType,
    subService: rawSubService,
    channel,
    channelSlug,
    status: normalizedStatus,
    createdDate: formatDate(raw.createdAt || raw.created_at),
    updatedDate: formatDate(raw.updatedAt || raw.updated_at),
    assignedSpecialist,
    price,
    paymentStatus,
    description: raw.description || raw.notes || 'Specialist service delivery request.',
    requirements: raw.requirements || {},
    submissions: raw.submissions || [],
    messageCount: raw.messageCount || 0,
    latestMessage: raw.latestMessage || null,
    raw
  };
};

/**
 * Compute dashboard summary metrics from live requests
 */
export const computeDashboardMetrics = (requests = [], deliverables = []) => {
  if (!requests || requests.length === 0) {
    return {
      activeRequests: 0,
      completed: 0,
      verifiedDeliverables: deliverables?.length || 0,
      pendingPayments: 0,
    };
  }

  let activeRequests = 0;
  let completed = 0;
  let pendingPayments = 0;

  requests.forEach((req) => {
    const status = String(req.status).toUpperCase();
    if (status === 'COMPLETED' || status === 'APPROVED') {
      completed++;
    } else if (status !== 'CANCELLED') {
      activeRequests++;
    }

    if (String(req.paymentStatus).toUpperCase() === 'PENDING') {
      pendingPayments++;
    }
  });

  let verifiedDeliverables = 0;
  if (deliverables && deliverables.length > 0) {
    verifiedDeliverables = deliverables.length;
  } else {
    requests.forEach((req) => {
      if (req.submissions && Array.isArray(req.submissions) && req.submissions.length > 0) {
        verifiedDeliverables += req.submissions.length;
      } else if (['CLIENT_REVIEW', 'COMPLETED', 'APPROVED'].includes(String(req.status).toUpperCase())) {
        verifiedDeliverables++;
      }
    });
  }

  return {
    activeRequests,
    completed,
    verifiedDeliverables,
    pendingPayments,
  };
};

/**
 * Adapt submissions across tickets into a flat array of deliverable items
 */
export const adaptDeliverables = (requests = [], directSubmissions = []) => {
  const deliverables = [];

  // 1. If direct submissions array provided from backend
  if (directSubmissions && directSubmissions.length > 0) {
    directSubmissions.forEach((sub, idx) => {
      deliverables.push({
        id: sub.id || `sub-${idx}`,
        ticketId: sub.ticketId || sub.ticket_id || 'CG-1021',
        title: sub.title || sub.name || `Deliverable V${sub.version || 1}`,
        service: sub.service || 'Research Deliverable',
        version: sub.version || 1,
        status: (sub.status || 'CLIENT_REVIEW').toUpperCase(),
        date: formatDate(sub.createdAt || sub.created_at),
        fileType: sub.fileType || sub.file_type || 'pdf',
        fileUrl: sub.fileUrl || sub.file_url || sub.downloadUrl || '#',
        summary: sub.notes || sub.summary || sub.description || 'Specialist deliverable submission.',
        raw: sub
      });
    });
  }

  // 2. Extract from requests with embedded submissions
  if (requests && requests.length > 0) {
    requests.forEach((req) => {
      if (req.submissions && Array.isArray(req.submissions) && req.submissions.length > 0) {
        req.submissions.forEach((sub, subIdx) => {
          deliverables.push({
            id: sub.id || `${req.ticketId}-sub-${subIdx}`,
            ticketId: req.ticketId,
            title: sub.title || `${req.service} Deliverable`,
            service: req.service,
            version: sub.version || subIdx + 1,
            status: (sub.status || req.status || 'CLIENT_REVIEW').toUpperCase(),
            date: formatDate(sub.createdAt || sub.created_at || req.updatedDate),
            fileType: sub.fileType || 'pdf',
            fileUrl: sub.fileUrl || sub.file_url || '#',
            summary: sub.notes || 'Deliverable package ready for client review.',
            raw: sub
          });
        });
      } else if (req.status === 'CLIENT_REVIEW' || req.status === 'COMPLETED') {
        // Synthesize deliverable card if ticket is in review / completed
        deliverables.push({
          id: `del-${req.ticketId}`,
          ticketId: req.ticketId,
          title: `${req.service} Package`,
          service: req.service,
          version: 1,
          status: req.status,
          date: req.updatedDate || req.createdDate,
          fileType: 'pdf',
          fileUrl: '#',
          summary: `Official deliverables package for ${req.title}.`,
          raw: req
        });
      }
    });
  }

  return deliverables;
};
