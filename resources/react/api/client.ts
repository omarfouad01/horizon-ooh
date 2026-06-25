/**
 * api/client.ts — Axios instance with runtime-aware baseURL and GET caching.
 *
 * Runtime base URL resolution (in priority order):
 *  1. VITE_API_URL env var if set and non-empty
 *  2. Same-origin /api prefix when running on a real server
 *  3. /api as final fallback (Laravel SPA routing)
 */
import axios from 'axios';

function resolveBaseURL(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env && env.trim() && env.trim() !== '/api') return env.trim();

  // In browser, use same origin + /api
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    if (!isLocal) {
      // Real server — use same-origin /api
      const base = `${protocol}//${hostname}${port ? ':' + port : ''}`;
      return `${base}/api`;
    }
  }
  return '/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('horizon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track if a token refresh is in progress (avoid parallel refresh storms)
let _refreshPromise: Promise<string | null> | null = null;
// Prevent firing the auth:expired event more than once per session
let _expiredDispatched = false;
// Timestamp of the last token store from login — used to skip refresh on brand-new tokens
let _tokenStoredAt = 0;
/** Call immediately after storing a fresh token from login/register.
 *  Prevents the interceptor from trying to refresh a brand-new valid token. */
export function markTokenStored(): void { _tokenStoredAt = Date.now(); }

async function tryRefreshToken(): Promise<string | null> {
  const token = localStorage.getItem('horizon_token');
  if (!token || token === 'demo-token') return null;
  try {
    const res = await axios.post(
      resolveBaseURL().replace(/\/api$/, '') + '/api/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );
    const newToken: string = res.data?.token ?? res.data?.access_token;
    if (newToken) {
      localStorage.setItem('horizon_token', newToken);
      return newToken;
    }
  } catch { /* refresh failed — fall through to logout */ }
  return null;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const url: string = err.config?.url ?? '';
    const status: number = err.response?.status;

    // On 401 from a protected (non-auth) route — try refreshing the token once
    // BUT only if we actually have a token. Without a token there's nothing to
    // refresh and attempting it just fires an extra 401 that stalls page load.
    const token = localStorage.getItem('horizon_token');
    const hasToken = !!token && token !== 'demo-token';
    const isAuthRoute = /\/(auth\/login|login|auth\/logout|logout|auth\/refresh)($|\?)/i.test(url);

    // Brand-new token (<10s old) from a fresh login — skip refresh to protect it.
    const tokenIsFresh = _tokenStoredAt > 0 && (Date.now() - _tokenStoredAt) < 10_000;

    if (status === 401 && hasToken && !isAuthRoute && !err.config?._retried && !tokenIsFresh) {
      // Attempt a silent token refresh first (shared promise — no parallel storms)
      if (!_refreshPromise) {
        _refreshPromise = tryRefreshToken().finally(() => { _refreshPromise = null; });
      }
      const newToken = await _refreshPromise;
      if (newToken) {
        // Retry the original request with the fresh token
        err.config._retried = true;
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return api(err.config);
      }

      // Refresh failed.
      // For write operations (POST / PUT / PATCH / DELETE) we do NOT force a
      // logout+redirect — that would lose unsaved form data and is very jarring.
      // Instead, just reject the promise so the calling code can show a toast.
      const method = (err.config?.method ?? 'get').toLowerCase();
      const isWrite = method === 'post' || method === 'put' || method === 'patch' || method === 'delete';
      if (isWrite) {
        // Let the error propagate so the form can catch and show a friendly message
        return Promise.reject(err);
      }

      // For read (GET) failures: clear the stale token and trigger a logout
      // so the user is redirected to login cleanly.
      localStorage.removeItem('horizon_token');
      localStorage.removeItem('horizon_user');
      // Notify AdminAuthProvider to clear React state and redirect to login.
      // Use a flag so this fires exactly once even if multiple parallel requests
      // all fail at the same time (e.g. suppliers + customers + contacts).
      if (typeof window !== 'undefined' && !_expiredDispatched) {
        _expiredDispatched = true;
        // Reset flag after a short delay so future sessions work correctly
        setTimeout(() => { _expiredDispatched = false; }, 5000);
        window.dispatchEvent(new CustomEvent('horizon:auth:expired'));
      }
    }

    return Promise.reject(err);
  },
);

// ─── In-memory GET cache (60 s TTL, request deduplication) ───────────────────
interface CacheEntry { data: any; ts: number; }
const _cache: Map<string, CacheEntry> = new Map();
const _pending: Map<string, Promise<any>> = new Map();
const CACHE_TTL = 60_000;

export async function cachedGet<T = any>(url: string, config?: object): Promise<T> {
  const cached = _cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data as T;

  if (_pending.has(url)) return _pending.get(url) as Promise<T>;

  const req = api.get<T>(url, config).then((res) => {
    const data = (res as any).data !== undefined ? (res as any).data : res;
    _cache.set(url, { data, ts: Date.now() });
    _pending.delete(url);
    return data as T;
  }).catch((err) => {
    _pending.delete(url);
    throw err;
  });

  _pending.set(url, req);
  return req;
}

/** Call after admin writes to bust the GET cache */
export function clearApiCache(url?: string) {
  if (url) { _cache.delete(url); } else { _cache.clear(); }
}

export default api;
