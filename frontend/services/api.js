const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async put(endpoint, body) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  async delete(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  },
};

