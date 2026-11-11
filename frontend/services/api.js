// Smart normalization of the backend API URL
const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // Trim trailing whitespace and slashes
  url = url.trim().replace(/\/+$/, '');
  // Automatically ensure '/api' suffix is present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = getApiBaseUrl();

// Ensure endpoint begins with '/'
const formatEndpoint = (endpoint) => {
  if (!endpoint) return '';
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

// Builds request headers, properly omitting Content-Type for FormData
const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pt_token');
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Safe response handler with 401 token expiration detection
const handleResponse = async (res) => {
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = { message: 'Invalid JSON response from server' };
    }
  } else {
    const text = await res.text();
    data = { message: text || `HTTP ${res.status}: ${res.statusText}` };
  }

  if (!res.ok) {
    // If 401 Unauthorized, purge invalid/expired token and broadcast event
    if (res.status === 401 && typeof window !== 'undefined') {
      const hadToken = !!localStorage.getItem('pt_token');
      if (hadToken) {
        localStorage.removeItem('pt_token');
        localStorage.removeItem('pt_user');
        window.dispatchEvent(new Event('pt_auth_expired'));
      }
    }
    throw new Error(data.message || `API error (${res.status})`);
  }
  return data;
};

export const api = {
  getBaseUrl() {
    return API_URL;
  },

  async get(endpoint) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'GET',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },

  async post(endpoint, body = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(endpoint, body = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async patch(endpoint, body = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(endpoint) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },
};
