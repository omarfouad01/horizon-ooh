import React, { createContext, useContext, useState } from 'react';
import { authApi } from '@/api';

const DEMO_EMAIL    = 'admin@horizonooh.com';
const DEMO_PASSWORD = 'admin123';

interface AuthCtx {
  user:            any;
  token:           string | null;
  login:           (email: string, pass: string) => Promise<void>;
  logout:          () => void;
  isAuthenticated: boolean;
  isAuth:          boolean;
}
const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAdminAuth = () => useContext(Ctx);
export const useAdmin     = useAdminAuth; // alias used by AdminLayout

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user,  setUser]  = useState<any>(()=>{ try { return JSON.parse(localStorage.getItem('horizon_user')||'null'); } catch { return null; } });
  const [token, setToken] = useState<string|null>(()=>localStorage.getItem('horizon_token'));

const login = async (email: string, password: string) => {
    // ── Try real API first (with fallback for different route patterns) ────────
    try {
      let data: any;
      try {
        // Primary: /auth/login
        const res = await authApi.login(email, password);
        data = res.data;
      } catch (firstErr: any) {
        const status = firstErr?.response?.status;
        if (status === 404 || status === 405) {
          // Fallback: /login (Laravel Sanctum / Fortify)
          const res = await authApi.loginFallback(email, password);
          data = res.data;
        } else {
          throw firstErr;
        }
      }
      const t = data.token || data.access_token;
      const u = data.user;
      if (!t || !u) throw new Error('Invalid API response — no token or user');
      localStorage.setItem('horizon_token', t);
      localStorage.setItem('horizon_user',  JSON.stringify(u));
      setToken(t); setUser(u);
      return;
    } catch (apiErr: any) {
      // API unreachable or returned error — check demo credentials
      const isNetworkErr = !apiErr?.response;
      if (!isNetworkErr) {
        // API replied but with an error (wrong credentials, etc.) — surface the message
        const body = apiErr?.response?.data ?? {};
        const msg  = body.message || `Login failed (${apiErr?.response?.status})`;
        throw new Error(msg);
      }
      // Network error: fall through to demo mode
    }

    // ── Demo / preview mode (only when API is unreachable) ───────────────────
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser = { id: 0, name: 'Admin', email: DEMO_EMAIL, role: 'admin' };
      const demoToken = 'demo-token';
      localStorage.setItem('horizon_token', demoToken);
      localStorage.setItem('horizon_user',  JSON.stringify(demoUser));
      setToken(demoToken); setUser(demoUser);
      return;
    }

    throw new Error('Invalid credentials');
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('horizon_token');
    localStorage.removeItem('horizon_user');
    setToken(null); setUser(null);
  };

  const auth = !!token && !!user;
  return (
    <Ctx.Provider value={{ user, token, login, logout, isAuthenticated: auth, isAuth: auth }}>
      {children}
    </Ctx.Provider>
  );
}
