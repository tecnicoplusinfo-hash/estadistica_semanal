const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Cliente HTTP para comunicarse con la API
 */
class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(url, options = {}) {
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(`${API_URL}${url}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error del servidor' }));
      throw new Error(error.error || error.message || 'Error del servidor');
    }

    return response.json();
  }

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

const api = new ApiClient();

// Auth
export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (email, password, name, role) => api.post('/api/auth/register', { email, password, name, role }),
  getProfile: () => api.get('/api/auth/profile'),

  setToken: (token) => api.setToken(token),
  clearToken: () => api.setToken(null)
};

// Users
export const usersApi = {
  list: () => api.get('/api/users'),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  changePassword: (id, password) => api.put(`/api/users/${id}/password`, { password }),
  deactivate: (id) => api.patch(`/api/users/${id}/deactivate`),
  activate: (id) => api.patch(`/api/users/${id}/activate`),
  getStatistics: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/users/${id}/statistics${queryString ? `?${queryString}` : ''}`);
  }
};

// Locals
export const localsApi = {
  list: () => api.get('/api/locals'),
  listAll: () => api.get('/api/locals/all'),
  create: (name) => api.post('/api/locals', { name }),
  update: (id, data) => api.put(`/api/locals/${id}`, data),
  delete: (id) => api.delete(`/api/locals/${id}`)
};

// Statistics
export const statisticsApi = {
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/statistics${queryString ? `?${queryString}` : ''}`);
  },
  create: (data) => api.post('/api/statistics', data),
  update: (id, data) => api.put(`/api/statistics/${id}`, data),
  delete: (id) => api.delete(`/api/statistics/${id}`),
  getSummary: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/statistics/summary${queryString ? `?${queryString}` : ''}`);
  },
  getWeeks: () => api.get('/api/statistics/weeks')
};

export default api;
