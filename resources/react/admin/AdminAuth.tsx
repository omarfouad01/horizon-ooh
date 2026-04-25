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
    // ── Try real API (/auth/login) ───────────────────────────────────────────
    try {
      const res = await authApi.login(email, password);
      const d = res.data?.data ?? res.data;
      const t = d?.token ?? d?.access_token;
      const u = d?.user  ?? d;
      if (t) {
        localStorage.setItem('horizon_token', t);
        localStorage.setItem('horizon_user',  JSON.stringify(u));
        setToken(t); setUser(u);
        return;
      }
    } catch (_e1) {
      // ── Try fallback route (/login) ────────────────────────────────────────
      try {
        const res = await authApi.loginFallback(email, password);
        const d = res.data?.data ?? res.data;
        const t = d?.token ?? d?.access_token;
        const u = d?.user  ?? d;
        if (t) {
          localStorage.setItem('horizon_token', t);
          localStorage.setItem('horizon_user',  JSON.stringify(u));
          setToken(t); setUser(u);
          return;
        }
      } catch (_e2) { /* fall through to demo */ }
    }

    // ── Demo / preview mode ──────────────────────────────────────────────────
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser = { id: 0, name: 'Admin', email: DEMO_EMAIL, role: 'admin' };
      const demoToken = 'demo-token';
      localStorage.setItem('horizon_token', demoToken);
      localStorage.setItem('horizon_user',  JSON.stringify(demoUser));
      setToken(demoToken); setUser(demoUser);
      return;
    }

    throw new Error('Invalid credentials. Check your email and password.');
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
