/**
 * API service for AutoRental frontend.
 * Communicates with the Django REST Framework backend.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // If body is FormData, do not set Content-Type header manually
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include session cookies
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 204) {
      return { ok: true, data: null };
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.detail || data.error || (typeof data === 'string' ? data : JSON.stringify(data));
      throw new Error(errorMsg || `Request failed with status ${response.status}`);
    }
    return { ok: true, data };
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request('/auth/logout/', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me/'),

  createManager: (managerData) =>
    request('/auth/create-manager/', {
      method: 'POST',
      body: JSON.stringify(managerData),
    }),

  getUsers: () => request('/users/'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/'),

  // Units & Properties
  getProperties: () => request('/properties/'),
  createProperty: (data) =>
    request('/properties/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUnits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/units/${query ? `?${query}` : ''}`);
  },

  createUnit: (data) =>
    request('/units/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUnit: (id, data) =>
    request(`/units/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUnit: (id) =>
    request(`/units/${id}/`, {
      method: 'DELETE',
    }),

  deleteProperty: (id) =>
    request(`/properties/${id}/`, {
      method: 'DELETE',
    }),

  toggleUnitStatus: (id, isActive) =>
    request(`/units/${id}/toggle_status/`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive }),
    }),

  getRentSheet: (year, propertyId) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (propertyId) params.append('property_id', propertyId);
    return request(`/units/rent-sheet/?${params.toString()}`);
  },

  // Payments
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments/${query ? `?${query}` : ''}`);
  },

  parsePayments: (payload) => {
    if (payload instanceof FormData) {
      return request('/payments/parse/', {
        method: 'POST',
        body: payload,
      });
    }
    return request('/payments/parse/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  importPayments: (transactions) =>
    request('/payments/import/', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),

  // Confirmations
  getPendingConfirmations: () => request('/confirmations/pending/'),

  createConfirmation: (data) =>
    request('/confirmations/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPendingVerifications: () => request('/confirmations/verifications/'),

  verifyConfirmation: (id) =>
    request(`/confirmations/${id}/verify/`, {
      method: 'POST',
    }),

  rejectConfirmation: (id, rejectionComment) =>
    request(`/confirmations/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ rejection_comment: rejectionComment }),
    }),

  // Master Log
  getMasterLog: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/masterlog/${query ? `?${query}` : ''}`);
  },
};
