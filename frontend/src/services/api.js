// CreativeGini API Client Service

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return '/api';
};

const API_BASE = getApiBase();

/**
 * Safely parse JSON from response without throwing SyntaxError on HTML or non-JSON payloads
 */
const safeJson = async (res) => {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const parsed = await res.json();
      return parsed !== null && parsed !== undefined ? parsed : {};
    }
  } catch (e) {
    // ignore parse error on HTML or non-JSON error pages
  }
  return {};
};

/**
 * Safely parse API response without throwing JSON syntax errors on HTML error pages
 */
const parseApiResponse = async (res, defaultErrorMessage = 'Request failed') => {
  const data = await safeJson(res);
  if (!res.ok) {
    if (res.status === 413) {
      const message = data?.message || 'Upload payload is too large. Please reduce the combined upload size and try again.';
      throw new Error(message);
    }
    const message = data?.message || `${defaultErrorMessage} (Server returned HTTP ${res.status})`;
    throw new Error(message);
  }
  if (!data || data.success === false) {
    throw new Error(data?.message || defaultErrorMessage);
  }
  return data;
};

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  };
  if (includeAuth) {
    const token = localStorage.getItem('cg_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check credentials.');
    }
    localStorage.setItem('cg_auth_token', data.token);
    return data;
  },

  async register({ name, email, password, companyName, phone }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password, companyName, phone })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }
    if (data.token) {
      localStorage.setItem('cg_auth_token', data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Session expired');
    }
    return data;
  },

  logout() {
    localStorage.removeItem('cg_auth_token');
    localStorage.removeItem('token');
    sessionStorage.clear();
  },

  // Passwordless Magic Link Flow
  async requestMagicLink(email, userId = null) {
    const res = await fetch(`${API_BASE}/auth/magic-link`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email: email?.trim(), userId })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate magic access link.');
    }
    return data;
  },

  async verifyMagicLink(token) {
    const res = await fetch(`${API_BASE}/auth/verify-magic-link`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ token: token?.trim() })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid or expired magic access link.');
    }
    return data;
  },

  // Password Recovery Flow
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email: email?.trim() })
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.message || 'Unable to request password reset. Please try again.');
    }
    return data;
  },

  async verifyResetToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token || '')}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.valid) {
      throw new Error(data.message || 'This password reset link is invalid or has expired.');
    }
    return data;
  },

  async resetPassword(token, password) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ token: token?.trim(), password })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to reset password. Please check requirements and try again.');
    }
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to change password. Please check your current password and try again.');
    }
    return data;
  },

  // Company Information (Pre-researched leads and company profile)
  async getMyCompany() {
    const res = await fetch(`${API_BASE}/company/my-company`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company details');
    }
    return data.company;
  },

  async getMyCompanyLeads() {
    const res = await fetch(`${API_BASE}/company/my-company/leads`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company leads');
    }
    return data;
  },

  async getMyCompanyLeadDetail(leadId) {
    const res = await fetch(`${API_BASE}/company/my-company/leads/${leadId}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch lead details');
    }
    return data;
  },

  // Requests / Tickets
  async getRequests() {
    const res = await fetch(`${API_BASE}/requests`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch requests');
    }
    return data.requests || [];
  },

  async getRequestById(id) {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Ticket not found');
    }
    return data.request;
  },

  async calculatePrice(payload) {
    const res = await fetch(`${API_BASE}/requests/calculate-price`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to calculate request price');
    }
    return data;
  },

  async createRequest(payload) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create ticket request');
    }
    return data.request;
  },

  async payRequest(id, paymentMethod = 'Corporate Card (Stripe)') {
    const res = await fetch(`${API_BASE}/requests/${id}/pay`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ paymentMethod })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Payment processing failed');
    }
    return data;
  },

  async getMessages(requestId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/messages`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load conversation');
    }
    return data.messages || [];
  },

  async getTicketMessages(requestId) {
    return this.getMessages(requestId);
  },

  async getUnreadMessagesCount() {
    try {
      const res = await fetch(`${API_BASE}/requests/messages/unread-count`, {
        headers: getHeaders(true)
      });
      const data = await safeJson(res);
      return data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async sendMessage(requestId, textOrPayload, isProgressUpdate = false) {
    const body = typeof textOrPayload === 'object' && textOrPayload !== null
      ? { text: textOrPayload.text || textOrPayload.message, isProgressUpdate: textOrPayload.isProgressUpdate ?? isProgressUpdate }
      : { text: textOrPayload, isProgressUpdate };

    const res = await fetch(`${API_BASE}/requests/${requestId}/messages`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send message');
    }
    return data.message;
  },

  async updateRequestStatus(id, status, note = '') {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status, note })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update ticket status');
    }
    return data.request;
  },

  // Work Submissions & Client Review
  async getSubmissions(ticketId) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/submissions`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch deliverables');
    }
    return data.submissions || [];
  },

  async submitWork(ticketId, payload) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/submissions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit deliverables');
    }
    return data;
  },

  async approveSubmission(ticketId, submissionId, feedback = '') {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/submissions/${submissionId}/approve`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ feedback })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to approve work');
    }
    return data;
  },

  async requestChanges(ticketId, submissionId, feedback) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/submissions/${submissionId}/request-changes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ feedback })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to request changes');
    }
    return data;
  },

  async getSubmissionByVersion(ticketId, version) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/submissions/version/${version}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch submission version');
    }
    return data.submission;
  },

  async assignTicket(ticketId, payload) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/assign`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to assign ticket');
    }
    return data;
  },

  async startWork(ticketId) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/start-work`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to start work');
    }
    return data;
  },

  async adminOverride(ticketId, reason) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/admin-override`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ reason })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to execute administrative override');
    }
    return data;
  },

  async getTicketActivity(ticketId) {
    const res = await fetch(`${API_BASE}/requests/${ticketId}/activity`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load activity logs');
    }
    return data.logs || [];
  },

  // In-App Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load notifications');
    }
    return data;
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to mark notification read');
    }
    return data;
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to mark all notifications read');
    }
    return data;
  },

  // Admin APIs
  async adminCreateClient(clientPayload) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(clientPayload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create client');
    }
    return data;
  },

  async adminGetBulkOnboardingTemplate() {
    const res = await fetch(`${API_BASE}/admin/users/bulk-template`, {
      headers: getHeaders(true)
    });
    if (!res.ok) {
      throw new Error('Failed to download bulk onboarding template');
    }
    return await res.text();
  },

  async adminValidateBulkOnboarding(csvText) {
    const res = await fetch(`${API_BASE}/admin/users/bulk-validate`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ csvText })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to validate bulk CSV');
    }
    return data;
  },

  async adminCreateBulkOnboarding({ batchId, csvText }) {
    const res = await fetch(`${API_BASE}/admin/users/bulk-create`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ batchId, csvText })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to execute bulk onboarding');
    }
    return data;
  },

  async adminGetUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load users');
    }
    return data.users || [];
  },

  async adminGetUserById(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load user details');
    }
    return data;
  },

  async adminUpdateUser(id, payload) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user');
    }
    return data;
  },

  async adminResetPassword(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },

  async adminUpdateUserStatus(id, status) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user status');
    }
    return data;
  },

  async adminDeleteUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete client user');
    }
    return data;
  },

  async adminGetTeamMembers() {
    const res = await fetch(`${API_BASE}/admin/team-members`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch team members');
    }
    return data.teamMembers || [];
  },

  async adminCreateTeamUser(payload) {
    const res = await fetch(`${API_BASE}/admin/team-members`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create team user');
    }
    return data;
  },

  async adminUpdateUserPermissions(id, dashboardAccess) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ dashboardAccess })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update dashboard permissions');
    }
    return data;
  },

  async adminDeleteTeamMember(id) {
    const res = await fetch(`${API_BASE}/admin/team-members/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete team member');
    }
    return data;
  },

  async adminPreviewWelcomeEmail(userId, payload) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/preview-welcome-email`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to generate email preview');
    }
    return data;
  },

  async adminSendWelcomeEmail(userId, payload) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/send-welcome-email`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send welcome email');
    }
    return data;
  },

  // User Assets / Media Library
  async getAssets(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.requestId) query.append('requestId', params.requestId);
    if (params.companyId) query.append('companyId', params.companyId);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/assets${queryString}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch media assets');
    }
    return data;
  },

  async getAsset(assetId) {
    const res = await fetch(`${API_BASE}/assets/${assetId}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch asset metadata');
    }
    return data.asset;
  },

  getAssetStreamUrl(assetId) {
    const token = localStorage.getItem('cg_auth_token') || '';
    return `${API_BASE}/assets/${assetId}/stream?token=${encodeURIComponent(token)}`;
  },

  getAssetDownloadUrl(assetId) {
    const token = localStorage.getItem('cg_auth_token') || '';
    return `${API_BASE}/assets/${assetId}/download?token=${encodeURIComponent(token)}`;
  },

  // Company Boost Onboarding Samples
  async getMyOnboardingAssets() {
    const res = await fetch(`${API_BASE}/company/my-company/onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch onboarding assets');
    }
    return data;
  },

  async getCompanyOnboardingAssets(companyId) {
    const res = await fetch(`${API_BASE}/company/${companyId}/onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company onboarding assets');
    }
    return data;
  },

  async saveCompanyOnboardingAssets(companyId, payload) {
    const res = await fetch(`${API_BASE}/company/${companyId}/onboarding-assets`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return await parseApiResponse(res, 'Failed to save onboarding assets');
  },

  async getOnboardingClients() {
    const res = await fetch(`${API_BASE}/company/onboarding/clients`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch onboarding clients');
    }
    return data.clients || [];
  },

  // Company UI Onboarding Samples
  async getMyUiOnboardingAssets() {
    const res = await fetch(`${API_BASE}/company/my-company/ui-onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch UI onboarding assets');
    }
    return data;
  },

  async getCompanyUiOnboardingAssets(companyId) {
    const res = await fetch(`${API_BASE}/company/${companyId}/ui-onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company UI onboarding assets');
    }
    return data;
  },

  async saveCompanyUiOnboardingAssets(companyId, payload) {
    const res = await fetch(`${API_BASE}/company/${companyId}/ui-onboarding-assets`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return await parseApiResponse(res, 'Failed to save UI onboarding assets');
  },

  // Company Lead Onboarding Samples (First 5 Sample Leads & PDFs)
  async getMyLeadOnboardingAssets() {
    const res = await fetch(`${API_BASE}/company/my-company/lead-onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch lead onboarding assets');
    }
    return data;
  },

  async getCompanyLeadOnboardingAssets(companyId) {
    const res = await fetch(`${API_BASE}/company/${companyId}/lead-onboarding-assets`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company lead onboarding assets');
    }
    return data;
  },

  async saveCompanyLeadOnboardingAssets(companyId, payload) {
    const res = await fetch(`${API_BASE}/company/${companyId}/lead-onboarding-assets`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return await parseApiResponse(res, 'Failed to save lead onboarding work');
  },

  async unlockKeyPeople(companyId = 'my-company') {
    const res = await fetch(`${API_BASE}/company/${companyId}/unlock-key-people`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    return await parseApiResponse(res, 'Failed to unlock Key People');
  },

  // Company Lead Specialist & Management APIs
  async getCompanyById(companyId) {
    const res = await fetch(`${API_BASE}/company/${companyId}`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company profile');
    }
    return data.company;
  },

  async getCompanyLeads(companyId) {
    const res = await fetch(`${API_BASE}/company/${companyId}/leads`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch company leads');
    }
    return data;
  },

  async updateCompanyResearch(companyId, researchSummary) {
    const res = await fetch(`${API_BASE}/company/${companyId}/research`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ researchSummary })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update company research study');
    }
    return data;
  },

  async addCompanyLead(companyId, payload) {
    const res = await fetch(`${API_BASE}/company/${companyId}/leads`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to add lead');
    }
    return data;
  },

  async updateCompanyLead(leadId, payload) {
    const res = await fetch(`${API_BASE}/company/leads/${leadId}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update lead');
    }
    return data;
  },

  async deleteCompanyLead(leadId) {
    const res = await fetch(`${API_BASE}/company/leads/${leadId}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete lead');
    }
    return data;
  },

  async addKeyPerson(companyId, payload) {
    const res = await fetch(`${API_BASE}/company/${companyId}/key-people`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to add stakeholder');
    }
    return data;
  },

  async deleteKeyPerson(personId) {
    const res = await fetch(`${API_BASE}/company/key-people/${personId}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete stakeholder');
    }
    return data;
  },

  async getAssetContent(assetId) {
    const res = await fetch(`${API_BASE}/assets/${assetId}/content`, {
      headers: getHeaders(true)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load document content');
    }
    return data;
  },

  getAssetDownloadUrl(assetId) {
    if (!assetId) return '#';
    const token = localStorage.getItem('cg_auth_token');
    const base = `${API_BASE}/assets/${encodeURIComponent(assetId)}/download`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },

  getAssetStreamUrl(assetId) {
    if (!assetId) return '#';
    const token = localStorage.getItem('cg_auth_token');
    const base = `${API_BASE}/assets/${encodeURIComponent(assetId)}/stream`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },

  async downloadAssetBlob(assetId, defaultFilename = 'download') {
    const token = localStorage.getItem('cg_auth_token');
    const url = `${API_BASE}/assets/${encodeURIComponent(assetId)}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) {
      throw new Error(`Failed to download file (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    let filename = defaultFilename;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  },

  // Public Sample Showcase
  async getPublicSample(slug) {
    const res = await fetch(`${API_BASE}/samples/${encodeURIComponent(slug)}`, {
      headers: getHeaders(false)
    });
    return parseApiResponse(res, 'Failed to load public sample showcase');
  },

  // Prospect Sample Showcase Management (Lead Specialists & Admin)
  async getAdminSamples() {
    const res = await fetch(`${API_BASE}/samples/manage`, {
      headers: getHeaders(true)
    });
    return parseApiResponse(res, 'Failed to load sample showcases');
  },

  async getAdminSampleById(id) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}`, {
      headers: getHeaders(true)
    });
    return parseApiResponse(res, 'Failed to load sample showcase');
  },

  async createAdminSample(sampleData) {
    const res = await fetch(`${API_BASE}/samples/manage`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(sampleData)
    });
    return parseApiResponse(res, 'Failed to create sample showcase');
  },

  async updateAdminSample(id, sampleData) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(sampleData)
    });
    return parseApiResponse(res, 'Failed to update sample showcase');
  },

  async deleteAdminSample(id) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return parseApiResponse(res, 'Failed to delete sample showcase');
  },

  async uploadCompanyStudyPdf(id, payload) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}/upload-company-study-pdf`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return parseApiResponse(res, 'Failed to upload company study PDF');
  },

  async uploadAdminPitchDeck(id, payload) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}/upload-pitch-deck`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return parseApiResponse(res, 'Failed to upload sample pitch deck');
  },

  async uploadLeadPitchDeck(id, leadId, payload) {
    const res = await fetch(`${API_BASE}/samples/manage/${id}/leads/${leadId}/pitch-deck`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    });
    return parseApiResponse(res, 'Failed to upload lead pitch deck');
  },
};

export default api;


