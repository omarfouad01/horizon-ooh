import axios from 'axios';

// ─── Resolve the API base URL ─────────────────────────────────────────────────
// Priority:
//   1. VITE_API_URL env var set at build time (e.g. https://horizonooh.com/api)
//   2. Inferred from runtime window.location (real server deployment without env var)
//   3. Localhost fallback for local dev
function resolveBaseURL(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;

  // Use env var if it's a real URL (not the default /api placeholder)
  if (env && env.trim() && env !== '/api') {
    return env.replace(/\/+$/, '');
  }

  // At runtime on a real server: derive from current origin
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === 'localhost' ||
                    hostname === '127.0.0.1' ||
                    hostname.startsWith('192.168.');
    if (!isLocal) {
      const portPart = port && port !== '80' && port !== '443' ? `:${port}` : '';
      return `${protocol}//${hostname}${portPart}/api`;
    }
  }

  // Local dev fallback
  return (env ?? '').replace(/\/+$/, '') || 'http://localhost:8000/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('horizon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('horizon_token');
      localStorage.removeItem('horizon_user');
    }
    return Promise.reject(err);
  }
);

export default api;
