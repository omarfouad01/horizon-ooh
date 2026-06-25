import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { authApi } from '@/api';
import { markTokenStored } from '@/api/client';
import { HAS_API, useApiStore, resolveTokenValidity } from '@/store/apiStore';

interface AuthCtx {
  user:            any;
  token:           string | null;
  login:           (email: string, pass: string) => Promise<void>;
  logout:          () => void;
  isAuthenticated: boolean;
  isAuth:          boolean;
  // true while we are validating an existing token on first load
  authChecking:    boolean;
}
const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAdminAuth = () => useContext(Ctx);
export const useAdmin     = useAdminAuth; // alias used by AdminLayout

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user,  setUser]  = useState<any>(()=>{ try { return JSON.parse(localStorage.getItem('horizon_user')||'null'); } catch { return null; } });
  const [token, setToken] = useState<string|null>(()=>localStorage.getItem('horizon_token'));
  // Track whether we're still validating the initial token.
  // Start as true only if there IS a token to validate.
  const hasInitialToken = !!localStorage.getItem('horizon_token');
  const [authChecking, setAuthChecking] = useState(hasInitialToken);

  const login = async (email: string, password: string) => {
    // ── Try real API ────────────────────────────────────────────────────────────
    let lastError: any = null;
    for (const attempt of [
      () => authApi.login(email, password),
      () => authApi.loginFallback(email, password),
    ]) {
      try {
        const res = await attempt();
        const { token: t, user: u } = res.data;
        localStorage.setItem('horizon_token', t);
        localStorage.setItem('horizon_user',  JSON.stringify(u));
        // Mark token as fresh so the response interceptor won't try to refresh it
        // on the first 401 (prevents fresh-token → refresh → logout cascade).
        markTokenStored();
        setToken(t); setUser(u);
        // Delay forceReload() so that:
        //  1. Any in-flight startup reload() finishes first (forceReload waitForIdle)
        //  2. The blacklist_grace_period on server has time to clear
        //  3. React state is committed before admin APIs fire
        // 500ms delay is imperceptible but eliminates the timing race.
        setTimeout(() => { useApiStore.getState().forceReload(); }, 500);
        return;
      } catch (err: any) {
        // Server explicitly rejected — stop immediately
        if (err?.response?.status === 401 || err?.response?.status === 422) {
          lastError = err;
          break;
        }
        // 405/404 means wrong route — try next attempt
        lastError = err;
      }
    }

    // ── Preview-only fallback — disabled on real server (HAS_API = true) ────────
    // On the real server HAS_API is always true so this block never runs.
    if (!HAS_API && lastError && email.endsWith('@horizonooh.com') && password.length >= 5) {
      const demoUser  = { id: 0, name: 'Admin', email, role: 'admin' };
      const demoToken = 'preview-token';
      localStorage.setItem('horizon_token', demoToken);
      localStorage.setItem('horizon_user',  JSON.stringify(demoUser));
      setToken(demoToken); setUser(demoUser);
      return;
    }

    // Surface the actual error message
    const apiMsg = lastError?.response?.data?.message;
    const apiErr = lastError?.response?.data?.errors;
    if (apiErr && typeof apiErr === 'object') {
      throw new Error(Object.values(apiErr).flat().join(' '));
    }
    if (apiMsg) throw new Error(apiMsg);
    throw new Error('Login failed. Please check your credentials and try again.');
  };

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('horizon_token');
    localStorage.removeItem('horizon_user');
    setToken(null); setUser(null);
    // Clear admin-only data from the global store so it doesn't linger
    // after logout (suppliers, customers, contacts, design uploads)
    useApiStore.setState({
      suppliers:     [],
      customers:     [],
      contacts:      [],
      designUploads: [],
    });
  }, []);

  // Auto-logout when token expires (fired by api/client.ts interceptor
  // OR by apiStore.reload() when it detects a stale token on an admin page)
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('horizon:auth:expired', handler);
    return () => window.removeEventListener('horizon:auth:expired', handler);
  }, [logout]);

  // Keep React state in sync with localStorage.
  // apiStore.reload() can remove the token directly from localStorage (raw axios
  // bypasses React state). This listener catches that and clears React state too,
  // so AdminLayout sees isAuth=false and shows the login form instead of a blank page.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'horizon_token' && !e.newValue) {
        // Token was removed externally — clear React state
        setToken(null);
        setUser(null);
        useApiStore.setState({ suppliers: [], customers: [], contacts: [], designUploads: [] });
      }
      if (e.key === 'horizon_token' && e.newValue) {
        // Token was set externally — sync React state
        setToken(e.newValue);
        try { setUser(JSON.parse(localStorage.getItem('horizon_user') || 'null')); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // On first load with an existing token, validate it once via /auth/me.
  // We also resolve the token-validity gate in apiStore so reload() knows
  // whether to call admin-only APIs (suppliers, customers, contacts, uploads).
  useEffect(() => {
    if (!hasInitialToken) {
      // No token — tell apiStore to skip admin APIs immediately
      resolveTokenValidity(false);
      setAuthChecking(false);
      return;
    }
    const storedToken = localStorage.getItem('horizon_token');
    if (!storedToken || storedToken === 'demo-token' || storedToken === 'preview-token') {
      resolveTokenValidity(false);
      setAuthChecking(false);
      return;
    }
    const baseURL = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api`
      : '/api';
    axios.get(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}`, Accept: 'application/json' },
      timeout: 8000,
    }).then(() => {
      resolveTokenValidity(true);  // valid — let apiStore call admin APIs
      setAuthChecking(false);
    }).catch((err: any) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('horizon_token');
        localStorage.removeItem('horizon_user');
        setToken(null); setUser(null);
        useApiStore.setState({ suppliers: [], customers: [], contacts: [], designUploads: [] });
      }
      resolveTokenValidity(false); // invalid/unreachable — skip admin APIs
      setAuthChecking(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const auth = !!token && !!user;
  return (
    <Ctx.Provider value={{ user, token, login, logout, isAuthenticated: auth, isAuth: auth, authChecking }}>
      {children}
    </Ctx.Provider>
  );
}