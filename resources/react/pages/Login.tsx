import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES, RED, NAVY, ease } from "@/lib/routes";
import { siteUserStore } from "@/store/dataStore";
import { authApi } from "@/api";

// ─── Shared input component ───────────────────────────────────────────────
function AuthInput({
  label, id, type = "text", placeholder, value, onChange, required = true,
}: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold tracking-[0.25em] uppercase mb-2"
        style={{ color: "rgba(11,15,26,0.45)" }}>
        {label}
      </label>
      <input
        id={id} type={type} placeholder={placeholder} required={required}
        value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full bg-white text-[15px] font-medium outline-none transition-all duration-200"
        style={{
          height: 52, padding: "0 18px",
          border: `1.5px solid ${focused ? NAVY : "rgba(11,15,26,0.14)"}`,
          borderRadius: 6, color: NAVY,
          boxShadow: focused ? `0 0 0 3px rgba(11,15,26,0.06)` : "none",
        }}
      />
    </div>
  );
}

// ─── Left brand panel ─────────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="relative overflow-hidden hidden lg:flex flex-col justify-between"
      style={{ background: NAVY, width: "48%", flexShrink: 0, minHeight: "100svh", padding: "52px 64px" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 30% 60%, rgba(217,4,41,0.07) 0%, transparent 70%)" }} />
      {/* Grid overlay lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-l border-white/[0.03]"
            style={{ left: `${(i + 1) * 16.66}%` }} />
        ))}
      </div>
      {/* Background billboard image */}
      <img src="https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=900&q=80&fit=crop"
        alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12, mixBlendMode: "luminosity" }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }} className="relative z-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: "none" }}>
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ background: RED }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
              <path d="M7 8.5h4v1H7z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-[13px] tracking-[0.22em] uppercase leading-none">HORIZON</p>
            <p className="text-white/30 font-semibold text-[9px] tracking-[0.35em] uppercase mt-0.5">OUT-OF-HOME</p>
          </div>
        </Link>
      </motion.div>

      {/* Main headline */}
      <div className="relative z-10">
        {["Access your", "campaigns.", "Control your", "visibility."].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.p initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.1 }}
              className="font-black leading-[0.9] tracking-[-0.04em]"
              style={{
                fontSize: "clamp(36px, 4vw, 58px)",
                color: i === 1 || i === 3 ? "rgba(255,255,255,0.2)" : "white",
              }}>
              {line}
            </motion.p>
          </div>
        ))}
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.8 }}
          className="mt-10 flex items-center gap-4" style={{ transformOrigin: "left" }}>
          <span className="block w-8 h-[1.5px]" style={{ background: RED }} />
          <span className="text-white/25 text-[11px] font-bold tracking-[0.3em] uppercase">
            Egypt's #1 OOH Network
          </span>
        </motion.div>
      </div>

      {/* Bottom stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 1.0 }}
        className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.07]">
        {[{ v: "9,500+", l: "Locations" }, { v: "100+", l: "Brands" }, { v: "5", l: "Cities" }].map((s) => (
          <div key={s.l}>
            <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 24, color: RED }}>{s.v}</p>
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-bold mt-1">{s.l}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

// ─── Parse Laravel error response ────────────────────────────────────────────
  function parseApiError(err: any): string {
    const resp = err?.response;
    if (!resp) return 'Network error — please check your connection and try again.';
    const body = resp.data ?? {};
    if (body.errors) {
      return Object.values(body.errors as Record<string, string[]>).flat().join(' ');
    }
    return body.message || `Login failed (${resp.status})`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      // Try /auth/login first, fall back to /login (Sanctum web route)
      let data: any;
      try {
        const res = await authApi.login(email, password);
        data = res.data;
      } catch (firstErr: any) {
        const status = firstErr?.response?.status;
        if (status === 404 || status === 405) {
          const res = await authApi.loginFallback(email, password);
          data = res.data;
        } else {
          throw firstErr;
        }
      }
      // Success — store session info
      const token = data.token || data.access_token || '';
      const user  = data.user || {};
      localStorage.setItem('horizon_token',       token);
      localStorage.setItem('horizon_user_email', user.email || email);
      localStorage.setItem('horizon_user_name',  user.name  || '');
      localStorage.setItem('horizon_user_phone', user.phone || '');
      siteUserStore.upsert(email, { name: user.name, phone: user.phone, source: 'login' });
      navigate('/');
    } catch (err: any) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh]" style={{ fontFamily: "Inter, sans-serif" }}>
      <BrandPanel />

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-white" style={{ minHeight: "100svh" }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-8 pt-8 pb-6 border-b border-[#0B0F1A]/[0.07]">
          <Link to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: RED }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" />
              </svg>
            </div>
            <span className="font-black text-[13px] tracking-[0.22em] uppercase" style={{ color: NAVY }}>HORIZON OOH</span>
          </Link>
          <Link to={ROUTES.HOME} className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "rgba(11,15,26,0.4)", textDecoration: "none" }}>← Back</Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }} className="w-full" style={{ maxWidth: 440 }}>

            {/* Back to site — desktop */}
            <div className="hidden lg:flex items-center justify-between mb-12">
              <Link to={ROUTES.HOME}
                className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#D90429]"
                style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                <span style={{ fontSize: 14 }}>←</span> Back to site
              </Link>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.2)" }}>Client Portal</span>
            </div>

            {/* Heading */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(11,15,26,0.35)" }}>Sign In</span>
              </div>
              <h1 className="font-black tracking-[-0.04em] leading-[0.92]"
                style={{ fontSize: "clamp(36px, 4vw, 52px)", color: NAVY }}>
                Welcome<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>back.</span>
              </h1>
              <p className="mt-4 text-[15px] leading-[1.65]"
                style={{ color: "rgba(11,15,26,0.45)" }}>
                Sign in to manage your campaigns and inventory.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <AuthInput label="Email Address" id="email" type="email"
                placeholder="you@brand.com" value={email} onChange={setEmail} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-[11px] font-bold tracking-[0.25em] uppercase"
                    style={{ color: "rgba(11,15,26,0.45)" }}>Password</label>
                  <Link to="/forgot-password"
                    className="text-[11px] font-semibold transition-colors hover:text-[#D90429]"
                    style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                    required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-[15px] font-medium outline-none transition-all duration-200"
                    style={{
                      height: 52, padding: "0 52px 0 18px", borderRadius: 6, color: NAVY,
                      border: `1.5px solid rgba(11,15,26,0.14)`,
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = `1.5px solid ${NAVY}`)}
                    onBlur={(e) => (e.currentTarget.style.border = "1.5px solid rgba(11,15,26,0.14)")} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(11,15,26,0.35)", fontSize: 12, fontWeight: 600,
                      letterSpacing: "0.05em", background: "none", border: "none", cursor: "pointer" }}>
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0 w-5 h-5 border border-[#0B0F1A]/20 rounded-[4px] flex items-center justify-center"
                  style={{ background: remember ? NAVY : "white" }}
                  onClick={() => setRemember(!remember)}>
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium" style={{ color: "rgba(11,15,26,0.5)" }}>
                  Remember me for 30 days
                </span>
              </label>

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4" style={{ background: "rgba(217,4,41,0.05)", border: "1px solid rgba(217,4,41,0.2)", borderRadius: 6 }}>
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full" style={{ background: RED }} />
                  <p className="text-[13px] font-medium" style={{ color: RED }}>{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="group relative w-full overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase text-white flex items-center justify-center gap-3 transition-opacity"
                style={{ height: 54, background: RED, borderRadius: 6, border: "none", cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.75 : 1 }}>
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                  style={{ background: NAVY }} />
                <span className="relative z-10 flex items-center gap-3">
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.25)" }}>or</span>
              <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
            </div>

            {/* Sign up link */}
            <p className="text-center text-[14px]" style={{ color: "rgba(11,15,26,0.45)" }}>
              Don't have an account?{" "}
              <Link to={ROUTES.SIGNUP}
                className="font-bold transition-colors hover:text-[#D90429]"
                style={{ color: NAVY, textDecoration: "none" }}>
                Create account →
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer strip */}
        <div className="px-8 py-5 border-t border-[#0B0F1A]/[0.06] flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em]" style={{ color: "rgba(11,15,26,0.2)" }}>
            © 2026 HORIZON OOH
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Help"].map((l) => (
              <span key={l} className="text-[11px] tracking-[0.12em] cursor-pointer hover:text-[#D90429] transition-colors"
                style={{ color: "rgba(11,15,26,0.25)" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
