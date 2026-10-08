import { api } from '../../../services/api';

const getToken = () => {
  return (
    localStorage.getItem('cg_auth_token') ||
    sessionStorage.getItem('cg_auth_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    ''
  );
};

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return '/api';
};

const API_BASE = getApiBase();

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return { success: false, message: 'Invalid JSON response from server' };
  }
};

export const adminApi = {
  // 1. Overview Telemetry
  async getOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch overview');
    return data.data;
  },

  // 2. Central Operations Request Queue
  async getOperations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.service && filters.service !== 'ALL') params.append('service', filters.service);
    if (filters.specialistId && filters.specialistId !== 'ALL') params.append('specialistId', filters.specialistId);
    if (filters.search) params.append('search', filters.search);
    if (filters.filter) params.append('filter', filters.filter);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/operations${queryString}`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch operations');
    return data;
  },

  // 3. Clients Overview
  async getClientsOverview() {
    const res = await fetch(`${API_BASE}/admin/clients-overview`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch clients');
    return data;
  },

  // 4. Team Overview
  async getTeamOverview() {
    const res = await fetch(`${API_BASE}/admin/team-overview`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch team');
    return data.teamMembers || [];
  },

  // 5. Deliverables Overview
  async getDeliverablesOverview() {
    const res = await fetch(`${API_BASE}/admin/deliverables-overview`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch deliverables');
    return data.deliverables || [];
  },

  // 6. Billing Overview
  async getBillingOverview() {
    const res = await fetch(`${API_BASE}/admin/billing-overview`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch billing');
    return data;
  },

  // 7. Reports
  async getReportsOverview(range = '30d') {
    const res = await fetch(`${API_BASE}/admin/reports-overview?range=${range}`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch reports');
    return data.data;
  },

  // 8. Permissions Matrix
  // 8. User Portal Permissions & Roles
  async getAllUsers() {
    return api.adminGetUsers();
  },

  async updateUserPermissions(userId, dashboardAccess, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ dashboardAccess, ...(role ? { role } : {}) })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update user permissions');
    return data;
  },

  async getPermissionsMatrix() {
    const res = await fetch(`${API_BASE}/admin/permissions-matrix`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch permissions');
    return data;
  },

  async updatePermissionsMatrix(role, permissions) {
    const res = await fetch(`${API_BASE}/admin/permissions-matrix`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role, permissions })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update permissions');
    return data;
  },

  // 9. Assign / Reassign Request
  async reassignRequest(requestId, payload) {
    const res = await fetch(`${API_BASE}/admin/requests/${requestId}/reassign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reassign request');
    return data;
  },

  // 10. Change User Role
  async changeUserRole(userId, newRole) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ newRole })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to change user role');
    return data;
  },

  // 11. Activity & Audit Logs
  async getActivityLogs() {
    const res = await fetch(`${API_BASE}/admin/activity-logs`, { headers: getHeaders() });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch activity logs');
    return data.logs || [];
  },

  // Delegate standard existing actions
  async updateUserStatus(id, status) {
    return api.adminUpdateUserStatus(id, status);
  },

  async resetPassword(id) {
    return api.adminResetPassword(id);
  },

  async adminOverride(requestId, reason) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/admin-override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await safeJson(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to execute admin override');
    return data;
  },

  async getRequestById(requestId) {
    return api.getRequestById(requestId);
  },

  async getMessages(requestId) {
    return api.getMessages(requestId);
  },

  async sendMessage(requestId, text) {
    return api.sendMessage(requestId, { text });
  }
};
