import {publicMessage} from "@/i18n/publicArabic";
import SEO from '@/components/SEO';
import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { makeRoutes, langPath, RED, NAVY, ease } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import { authApi } from "@/api";
import { LogoMark } from "@/components/Layout";
import { useStore } from "@/store/dataStore";

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
        <LocalizedText>{label}</LocalizedText>
      </label>
      <LocalizedElement as="input"
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

// ─── Logo synced from dashboard settings ─────────────────────────────────
function LoginLogo() {
  const { lang } = useLang();
  const ROUTES = makeRoutes(lang);
  const store = useStore();
  const companyName: string = store.settings?.companyName ?? 'HORIZON OOH';
  const hasCustomLogo = !!store.settings?.headerLogoUrl;
  return (
    <LocalizedElement as={Link} to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
      <LocalizedText>{hasCustomLogo ? (
        <LogoMark size={40} variant="header" />
      ) : (
        <>
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ background: RED }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
              <path d="M7 8.5h4v1H7z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-[13px] tracking-[0.22em] uppercase leading-none"><LocalizedText>{companyName.split(' ')[0]}</LocalizedText></p>
            <p className="text-white/30 font-semibold text-[9px] tracking-[0.35em] uppercase mt-0.5"><LocalizedText>OUT-OF-HOME</LocalizedText></p>
          </div>
        </>
      )}</LocalizedText>
    </LocalizedElement>
  );
}

// ─── Mobile logo (light, used in right panel header on small screens) ────────
function MobileAuthLogo() {
  const { lang } = useLang();
  const ROUTES = makeRoutes(lang);
  const store = useStore();
  const companyName: string = store.settings?.companyName ?? 'HORIZON OOH';
  const hasCustomLogo = !!store.settings?.headerLogoUrl;
  return (
    <LocalizedElement as={Link} to={ROUTES.HOME} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
      <LocalizedText>{hasCustomLogo ? (
        <LogoMark size={32} variant="header" />
      ) : (
        <>
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: RED }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" />
            </svg>
          </div>
          <span className="font-black text-[13px] tracking-[0.22em] uppercase" style={{ color: NAVY }}><LocalizedText>{companyName}</LocalizedText></span>
        </>
      )}</LocalizedText>
    </LocalizedElement>
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
        <LocalizedText>{[...Array(5)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-l border-white/[0.03]"
            style={{ left: `${(i + 1) * 16.66}%` }} />
        ))}</LocalizedText>
      </div>
      {/* Background billboard image */}
      <LocalizedElement as="img" src="https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=900&q=80&fit=crop"
        alt="" aria-hidden width={900} height={1200} loading="lazy" decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12, mixBlendMode: "luminosity" }} />

      {/* Logo — synced from dashboard settings */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }} className="relative z-10">
        <LoginLogo />
      </motion.div>

      {/* Main headline */}
      <div className="relative z-10">
        <LocalizedText>{["Access your", "campaigns.", "Control your", "visibility."].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.p initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.1 }}
              className="font-black leading-[0.9] tracking-[-0.04em]"
              style={{
                fontSize: "clamp(36px, 4vw, 58px)",
                color: i === 1 || i === 3 ? "rgba(255,255,255,0.2)" : "white",
              }}>
              <LocalizedText>{line}</LocalizedText>
            </motion.p>
          </div>
        ))}</LocalizedText>
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.8 }}
          className="mt-10 flex items-center gap-4" style={{ transformOrigin: "left" }}>
          <span className="block w-8 h-[1.5px]" style={{ background: RED }} />
          <span className="text-white/25 text-[11px] font-bold tracking-[0.3em] uppercase"><LocalizedText>
            Egypt's #1 OOH Network
          </LocalizedText></span>
        </motion.div>
      </div>

      {/* Bottom stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 1.0 }}
        className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.07]">
        <LocalizedText>{[{ v: "9,500+", l: "Locations" }, { v: "100+", l: "Brands" }, { v: "5", l: "Cities" }].map((s) => (
          <div key={s.l}>
            <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 24, color: RED }}><LocalizedText>{s.v}</LocalizedText></p>
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-bold mt-1"><LocalizedText>{s.l}</LocalizedText></p>
          </div>
        ))}</LocalizedText>
      </motion.div>
    </div>
  );
}

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────
export default function Login() {
  const { lang } = useLang();
  const ROUTES = makeRoutes(lang);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError(publicMessage("Please fill in all fields.")); return; }
    setLoading(true);
    try {
      let res: any;
      try {
        res = await authApi.login(email, password);
      } catch (e1: any) {
        if (e1?.response?.status === 405 || e1?.response?.status === 404) {
          res = await authApi.loginFallback(email, password);
        } else throw e1;
      }
      const { token: t, user: u } = res.data;
      localStorage.setItem('horizon_token', t);
      localStorage.setItem('horizon_site_token', t);
      localStorage.setItem('horizon_user', JSON.stringify(u));
      // Save site user for navbar / profile page (include phone + company from server response)
      localStorage.setItem('horizon_site_user', JSON.stringify({ name: u?.name ?? '', email: u?.email ?? email, phone: u?.phone ?? '', company: u?.company ?? '' }));
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setLoading(false);
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        setError(publicMessage(Object.values(apiErrors).flat().join(' ')));
      } else {
        setError(publicMessage(err?.response?.data?.message ?? err?.message ?? 'Login failed. Please check your credentials.'));
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[100svh]" style={{ fontFamily: "Inter, sans-serif" }}>
<SEO title="Login | HORIZON OOH" description="Your HORIZON OOH account." titleAr="تسجيل الدخول | هورايزون" descriptionAr="سجل الدخول إلى حسابك لإدارة حملاتك الإعلانية." canonical="/login" robots="noindex, follow" />

      <BrandPanel />

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-white" style={{ minHeight: "100svh" }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-8 pt-8 pb-6 border-b border-[#0B0F1A]/[0.07]">
          <MobileAuthLogo />
          <LocalizedElement as={Link} to={ROUTES.HOME} className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "rgba(11,15,26,0.4)", textDecoration: "none" }}><LocalizedText>← Back</LocalizedText></LocalizedElement>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }} className="w-full" style={{ maxWidth: 440 }}>

            {/* Back to site — desktop */}
            <div className="hidden lg:flex items-center justify-between mb-12">
              <LocalizedElement as={Link} to={ROUTES.HOME}
                className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#D90429]"
                style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                <span style={{ fontSize: 14 }}><LocalizedText>←</LocalizedText></span><LocalizedText> Back to site
              </LocalizedText></LocalizedElement>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.2)" }}><LocalizedText>Client Portal</LocalizedText></span>
            </div>

            {/* Heading */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(11,15,26,0.35)" }}><LocalizedText>Sign In</LocalizedText></span>
              </div>
              <h1 className="font-black tracking-[-0.04em] leading-[0.92]"
                style={{ fontSize: "clamp(36px, 4vw, 52px)", color: NAVY }}><LocalizedText>
                Welcome</LocalizedText><br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}><LocalizedText>back.</LocalizedText></span>
              </h1>
              <p className="mt-4 text-[15px] leading-[1.65]"
                style={{ color: "rgba(11,15,26,0.45)" }}><LocalizedText>
                Sign in to manage your campaigns and inventory.
              </LocalizedText></p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <AuthInput label="Email Address" id="email" type="email"
                placeholder="you@brand.com" value={email} onChange={setEmail} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-[11px] font-bold tracking-[0.25em] uppercase"
                    style={{ color: "rgba(11,15,26,0.45)" }}><LocalizedText>Password</LocalizedText></label>
                  <LocalizedElement as={Link} to={langPath(lang, "/forgot-password")}
                    className="text-[11px] font-semibold transition-colors hover:text-[#D90429]"
                    style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}><LocalizedText>
                    Forgot password?
                  </LocalizedText></LocalizedElement>
                </div>
                <div className="relative">
                  <LocalizedElement as="input" id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
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
                    <LocalizedText>{showPw ? "HIDE" : "SHOW"}</LocalizedText>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0 w-5 h-5 border border-[#0B0F1A]/20 rounded-[4px] flex items-center justify-center"
                  style={{ background: remember ? NAVY : "white" }}
                  onClick={() => setRemember(!remember)}>
                  <LocalizedText>{remember && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}</LocalizedText>
                </div>
                <span className="text-[13px] font-medium" style={{ color: "rgba(11,15,26,0.5)" }}><LocalizedText>
                  Remember me for 30 days
                </LocalizedText></span>
              </label>

              {/* Error */}
              <LocalizedText>{error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4" style={{ background: "rgba(217,4,41,0.05)", border: "1px solid rgba(217,4,41,0.2)", borderRadius: 6 }}>
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full" style={{ background: RED }} />
                  <p className="text-[13px] font-medium" style={{ color: RED }}><LocalizedText>{error}</LocalizedText></p>
                </motion.div>
              )}</LocalizedText>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="group relative w-full overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase text-white flex items-center justify-center gap-3 transition-opacity"
                style={{ height: 54, background: RED, borderRadius: 6, border: "none", cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.75 : 1 }}>
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                  style={{ background: NAVY }} />
                <span className="relative z-10 flex items-center gap-3">
                  <LocalizedText>{loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}</LocalizedText>
                  <LocalizedText>{loading ? "Signing in…" : "Sign In"}</LocalizedText>
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                style={{ color: "rgba(11,15,26,0.25)" }}><LocalizedText>or</LocalizedText></span>
              <span className="flex-1 h-px" style={{ background: "rgba(11,15,26,0.08)" }} />
            </div>

            {/* Sign up link */}
            <p className="text-center text-[14px]" style={{ color: "rgba(11,15,26,0.45)" }}><LocalizedText>
              Don't have an account?</LocalizedText><LocalizedText>{" "}</LocalizedText>
              <LocalizedElement as={Link} to={ROUTES.SIGNUP}
                className="font-bold transition-colors hover:text-[#D90429]"
                style={{ color: NAVY, textDecoration: "none" }}><LocalizedText>
                Create account →
              </LocalizedText></LocalizedElement>
            </p>
          </motion.div>
        </div>

        {/* Footer strip */}
        <div className="px-8 py-5 border-t border-[#0B0F1A]/[0.06] flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em]" style={{ color: "rgba(11,15,26,0.2)" }}><LocalizedText>
            © 2026 HORIZON OOH
          </LocalizedText></p>
          <div className="flex gap-5">
            <LocalizedText>{["Privacy", "Terms", "Help"].map((l) => (
              <span key={l} className="text-[11px] tracking-[0.12em] cursor-pointer hover:text-[#D90429] transition-colors"
                style={{ color: "rgba(11,15,26,0.25)" }}><LocalizedText>{l}</LocalizedText></span>
            ))}</LocalizedText>
          </div>
        </div>
      </div>
    </div>
  );
}
