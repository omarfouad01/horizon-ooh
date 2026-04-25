import axios from 'axios';

// ─── Resolve the API base URL at runtime ─────────────────────────────────────
function resolveBaseURL(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  // Use explicit env var if it's a real URL
  if (env && env.trim() && env !== '/api') return env.replace(/\/+$/, '');
  // On a real server (not localhost), derive from current origin
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    if (!isLocal) {
      const portPart = port && port !== '80' && port !== '443' ? `:${port}` : '';
      return `${protocol}//${hostname}${portPart}/api`;
    }
  }
  return (env ?? '').replace(/\/+$/, '') || 'http://localhost:8000/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 15000,
});

// ─── In-memory GET cache (60-second TTL) ─────────────────────────────────────
const _cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000;
const _inflight = new Map<string, Promise<any>>();

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

/** Cached GET — deduplicates parallel requests, returns stale data instantly */
export function cachedGet(url: string): Promise<{ data: any }> {
  const key = `${resolveBaseURL()}${url}`;
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached && now - cached.ts < CACHE_TTL) return Promise.resolve({ data: cached.data });
  if (_inflight.has(key)) return _inflight.get(key)!;
  const req = api.get(url).then((res) => {
    _cache.set(key, { data: res.data, ts: Date.now() });
    return res;
  }).finally(() => _inflight.delete(key));
  _inflight.set(key, req);
  return req;
}

/** Clear the cache after admin writes */
export function clearApiCache() {
  _cache.clear();
  _inflight.clear();
}

export default api;
