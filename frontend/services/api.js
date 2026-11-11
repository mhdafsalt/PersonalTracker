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

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  async get(endpoint) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async put(endpoint, body) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async delete(endpoint) {
    const res = await fetch(`${API_URL}${formatEndpoint(endpoint)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },
};
