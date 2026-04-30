import React, { createContext, useContext, useState } from 'react';
import { authApi } from '@/api';
import { HAS_API } from '@/store/apiStore';

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
        setToken(t); setUser(u);
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
