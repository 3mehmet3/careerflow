const API_BASE = '/api';
let token = localStorage.getItem('cf_token') || null;

async function apiRequest(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw { status: res.status, errors: data.errors || [data.error] };
  return data;
}

const api = {
  auth: {
    register: (body) => apiRequest('POST', '/auth/register', body),
    login: (body) => apiRequest('POST', '/auth/login', body),
  },
  skills: {
    getAll: (q = '') => apiRequest('GET', `/skills${q}`),
    create: (body) => apiRequest('POST', '/skills', body),
    update: (id, body) => apiRequest('PUT', `/skills/${id}`, body),
    delete: (id) => apiRequest('DELETE', `/skills/${id}`),
  },
  goals: {
    getAll: (q = '') => apiRequest('GET', `/goals${q}`),
    create: (body) => apiRequest('POST', '/goals', body),
    update: (id, body) => apiRequest('PUT', `/goals/${id}`, body),
    delete: (id) => apiRequest('DELETE', `/goals/${id}`),
  },
  projects: {
    getAll: (q = '') => apiRequest('GET', `/projects${q}`),
    create: (body) => apiRequest('POST', '/projects', body),
    update: (id, body) => apiRequest('PUT', `/projects/${id}`, body),
    delete: (id) => apiRequest('DELETE', `/projects/${id}`),
    skillFit: (id) => apiRequest('GET', `/projects/${id}/skill-fit`),
  },
};
