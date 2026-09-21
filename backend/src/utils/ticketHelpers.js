import {
  findRequestById,
  findRequestByTicketId,
} from '../repositories/requestRepository.js';

/**
 * Check whether a user can access a particular service.
 *
 * ADMIN has access to everything.
 * Internal users are controlled by dashboardAccess.
 */
export const hasServiceTypeAccess = (user, serviceType) => {
  if (!user) return false;

  if (user.role === 'ADMIN') {
    return true;
  }

  const access = user.dashboardAccess || {};

  switch (serviceType) {
    case 'COMPANY_LEAD':
      return Boolean(access.companyLead);

    case 'COMPANY_BOOST':
      return Boolean(access.companyBoost);

    case 'COMPANY_UI':
    case 'LANDING_PAGE':
    case 'LANDING_PAGE_ENHANCEMENT':
      return Boolean(access.companyUI);

    default:
      return false;
  }
};

/**
 * Resolve a request by either:
 * - PostgreSQL UUID
 * - ticket code such as CG-1001
 */
export const resolveRequest = async (idOrTicketId) => {
  if (!idOrTicketId) {
    return null;
  }

  const value = String(idOrTicketId).trim();

  // PostgreSQL UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(value)) {
    const request = await findRequestById(value);

    if (request) {
      return request;
    }
  }

  return await findRequestByTicketId(value);
};

/**
 * Verify whether a user can access a ticket (Admin, Owner, or Permitted Internal Role).
 */
export const canAccessTicket = (user, request) => {
  if (!user || !request) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  const userId = user._id || user.id;
  const requestUserId = request.userId || request.user_id;

  if (user.role === 'USER') {
    return String(requestUserId) === String(userId);
  }

  return hasServiceTypeAccess(user, request.serviceType || request.service_type);
};
