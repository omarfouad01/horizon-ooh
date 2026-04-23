import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/data";
import { ROUTES, RED, NAVY } from "@/lib/routes";
import { useStore } from "@/store/dataStore";
import { useLang } from "@/i18n/LangContext";

// ─── Logo component (shared between Navbar & Footer) ──────────────────────────
function LogoMark({ size = 54, variant = 'header' }: { size?: number; variant?: 'header' | 'footer' }) {
  const store = useStore();
  // Pick the right logo URL — footer falls back to header if not set
  const url = variant === 'footer'
    ? (store.settings.footerLogoUrl || store.settings.headerLogoUrl)
    : store.settings.headerLogoUrl;
  if (url) {
    return (
      <img
        src={url}
        alt={store.settings.companyName}
        style={{ height: size, width: "auto", objectFit: "contain", display: "block" }}
      />
    );
  }
  // Default SVG mark
  return (
    <div style={{ width: size, height: size, background: RED, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 18 18" fill="none">
        <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" opacity="0.9" />
        <path d="M7 8.5h4v1H7z" fill="white" />
      </svg>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const store = useStore();
  const companyName: string = store.settings?.companyName ?? 'HORIZON OOH';
  const { lang, setLang, t, isAr } = useLang();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled || !isHome ? "bg-white/95 backdrop-blur-sm border-b border-[#0B0F1A]/[0.07]" : "bg-transparent";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-[1440px] mx-auto h-[76px] flex items-center justify-between px-4 sm:px-8 lg:px-[120px]">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-4 group flex-shrink-0">
            <LogoMark size={54} variant="header" />
            {!store.settings.headerLogoUrl && (
              <div className="flex flex-col gap-[1px]">
                <span className="text-[13px] font-black tracking-[0.22em] uppercase leading-none text-[#0B0F1A]">
                  {(companyName ?? 'HORIZON OOH').split(' ')[0] || 'HORIZON'}
                </span>
                <span className="text-[9px] font-semibold tracking-[0.35em] uppercase leading-none text-[#0B0F1A]/35">
                  OUT-OF-HOME
                </span>
              </div>
            )}
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 ml-12">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `relative text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 group ${
                    isActive ? "text-[#0B0F1A]" : "text-[#0B0F1A]/40 hover:text-[#0B0F1A]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(`nav.${link.href.replace('/','') || 'home'}`) !== `nav.${link.href.replace('/','') || 'home'}` ? t(`nav.${link.href.replace('/','') || 'home'}`) : link.label}
                    <span
                      className="absolute -bottom-0.5 left-0 h-[1px] transition-all duration-300"
                      style={{ width: isActive ? "100%" : "0%", background: RED }}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* Simulator link */}
            <NavLink
              to="/design-simulator"
              className={({ isActive }) =>
                `relative text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 group ${
                  isActive ? 'text-[#D90429]' : 'text-[#0B0F1A]/40 hover:text-[#0B0F1A]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  SIMULATOR
                  <span
                    className="absolute -bottom-0.5 left-0 h-[1px] transition-all duration-300"
                    style={{ width: isActive ? '100%' : '0%', background: RED }}
                  />
                </>
              )}
            </NavLink>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="h-[34px] px-3 text-[11px] font-bold tracking-[0.12em] uppercase flex items-center gap-1.5 border transition-colors duration-200 hover:border-[#0B0F1A] hover:text-[#0B0F1A] rounded-sm"
              style={{ borderColor: "rgba(11,15,26,0.15)", color: "rgba(11,15,26,0.45)" }}
              aria-label="Toggle language"
            >
              <span className="text-base leading-none">{isAr ? '🇬🇧' : '🇪🇬'}</span>
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            <Link
              to="/login"
              className="h-[40px] px-5 text-[11px] font-bold tracking-[0.18em] uppercase flex items-center gap-2 border transition-colors duration-200 hover:border-[#0B0F1A] hover:text-[#0B0F1A]"
              style={{ borderColor: "rgba(11,15,26,0.2)", color: "rgba(11,15,26,0.55)" }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {t('nav.login')}
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="h-[40px] px-7 text-[11px] font-bold tracking-[0.2em] uppercase text-white flex items-center relative overflow-hidden group active:scale-[0.97] transition-transform"
              style={{ background: RED }}
            >
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: NAVY }} />
              <span className="relative z-10">{t('nav.getQuote')}</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block h-[1.5px] bg-[#0B0F1A] transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-4"}`} />
            <span className={`block w-6 h-[1.5px] bg-[#0B0F1A] transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>

        {/* Scroll progress */}
        <div
          className="absolute bottom-0 left-0 h-[1.5px] transition-all duration-100 ease-linear"
          style={{ width: `${scrollPct}%`, background: RED }}
        />
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed top-[76px] left-0 right-0 z-40 bg-white border-b border-[#0B0F1A]/10 px-8 py-8 flex flex-col gap-5"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-left text-[13px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                    isActive ? "text-[#D90429]" : "text-[#0B0F1A]/50 hover:text-[#D90429]"
                  }`
                }
              >
                {t(`nav.${link.href.replace('/','') || 'home'}`) !== `nav.${link.href.replace('/','') || 'home'}` ? t(`nav.${link.href.replace('/','') || 'home'}`) : link.label}
              </NavLink>
            ))}
            {/* Simulator — mobile */}
            <NavLink
              to="/design-simulator"
              className={({ isActive }) =>
                `text-left text-[13px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                  isActive ? 'text-[#D90429]' : 'text-[#0B0F1A]/50 hover:text-[#D90429]'
                }`
              }
            >
              SIMULATOR
            </NavLink>
            {/* Mobile language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.2em] uppercase text-[#0B0F1A]/50 hover:text-[#D90429] transition-colors"
            >
              <span className="text-base">{isAr ? '🇬🇧' : '🇪🇬'}</span>
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
            <Link to="/login" className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.2em] uppercase text-[#0B0F1A]/50 hover:text-[#D90429] transition-colors">{t('nav.login')}</Link>
            <Link
              to={ROUTES.CONTACT}
              className="mt-2 h-[44px] px-8 text-white text-[11px] font-bold tracking-[0.2em] uppercase w-fit flex items-center active:scale-[0.97] transition-transform"
              style={{ background: RED }}
            >
              {t('nav.getQuote')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
export function Footer() {
  const store = useStore();
  const s = store.settings;
  const { t, isAr } = useLang();

  return (
    <footer style={{ background: NAVY }} className="relative overflow-hidden">
      {/* Decorative watermark */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none h-[180px]">
        <p
          className="text-white/[0.025] font-black uppercase whitespace-nowrap leading-none"
          style={{ fontSize: "clamp(80px, 12vw, 180px)", letterSpacing: "-0.04em", transform: "translateY(30%)" }}
        >
          {s.companyName}
        </p>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px] pt-16 pb-12 lg:pt-20">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-16 border-b border-white/[0.07]">
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div className="flex items-center gap-3 mb-6">
              {(s.footerLogoUrl || s.headerLogoUrl) ? (
                <img src={s.footerLogoUrl || s.headerLogoUrl} alt={s.companyName} style={{ height: 48, width: "auto", objectFit: "contain" }} />
              ) : (
                <>
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: RED }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 2h5v14H2zM11 2h5v14h-5z" fill="white" />
                      <path d="M7 8.5h4v1H7z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-black text-[13px] tracking-[0.22em] uppercase leading-none">{(s.companyName ?? 'HORIZON OOH').split(' ')[0] || 'HORIZON'}</p>
                    <p className="text-white/30 font-semibold text-[9px] tracking-[0.35em] uppercase mt-0.5">OUT-OF-HOME</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-white/30 text-[14px] leading-[1.75]">{isAr && (s as any).taglineAr ? (s as any).taglineAr : s.tagline}</p>
            <div className="mt-8 flex items-center gap-1">
              <span className="w-6 h-[1px]" style={{ background: RED }} />
              <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase ml-2">{t('footer.estd')}</span>
            </div>
            {/* Social links */}
            {s.socialLinks && (
              <div className="mt-6 flex items-center gap-3">
                {s.socialLinks.facebook  && <a href={s.socialLinks.facebook}  target="_blank" rel="noopener noreferrer" aria-label="Facebook"  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>}
                {s.socialLinks.instagram && <a href={s.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="14" height="14" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
                {s.socialLinks.linkedin  && <a href={s.socialLinks.linkedin}  target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>}
                {s.socialLinks.twitter   && <a href={s.socialLinks.twitter}   target="_blank" rel="noopener noreferrer" aria-label="X/Twitter" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25H8.08l4.254 5.625L18.244 2.25zM17.5 19.77h1.834L6.604 4.126H4.64L17.5 19.77z"/></svg></a>}
                {s.socialLinks.tiktok    && <a href={s.socialLinks.tiktok}    target="_blank" rel="noopener noreferrer" aria-label="TikTok"    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.18a8.27 8.27 0 0 0 4.84 1.55V7.26a4.85 4.85 0 0 1-1.07-.57z"/></svg></a>}
                {s.socialLinks.youtube   && <a href={s.socialLinks.youtube}   target="_blank" rel="noopener noreferrer" aria-label="YouTube"   className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{background:'rgba(255,255,255,0.07)'}} onMouseOver={e=>(e.currentTarget.style.background='rgba(255,255,255,0.15)')} onMouseOut={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}><svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#0B0F1A" points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/></svg></a>}
              </div>
            )}
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              {
                heading: t('footer.services'),
                links: [
                  { label: t('footer.billboard'),       href: "/services/billboard-advertising" },
                  { label: t('footer.dooh'),             href: "/services/digital-out-of-home" },
                  { label: t('footer.mall'),             href: "/services/mall-advertising" },
                  { label: t('footer.airport'),          href: "/services/airport-advertising" },
                  { label: t('footer.streetFurniture'),  href: "/services/street-furniture" },
                ],
              },
              {
                heading: t('footer.locations'),
                links: [
                  { label: t('footer.cairo'),       href: "/locations/cairo" },
                  { label: t('footer.giza'),        href: "/locations/giza" },
                  { label: t('footer.alexandria'),  href: "/locations/alexandria" },
                  { label: t('footer.northCoast'),  href: "/locations/matrouh" },
                  { label: t('footer.allLocations'),href: "/locations" },
                ],
              },
              {
                heading: t('footer.company'),
                links: [
                  { label: t('footer.about'),   href: "/about" },
                  { label: t('footer.blog'),    href: "/blog" },
                  { label: t('footer.contact'), href: "/contact" },
                ],
              },
              {
                heading: t('footer.contact'),
                links: [
                  { label: s.email,        href: `mailto:${s.email}` },
                  { label: s.phone ?? '',  href: `tel:${(s.phone ?? '').replace(/\s/g,'')}` },
                  { label: s.address,      href: "/contact" },
                ],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-5" dir={isAr ? 'rtl' : undefined}>{heading}</p>
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <Link
                      key={l.label}
                      to={l.href}
                      className="text-white/40 text-[13px] hover:text-white transition-colors duration-200 leading-none"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/20 text-[11px] tracking-[0.2em]">© 2026 {s.companyName} · {t('footer.rights')}</p>
          <div className="flex items-center gap-5">
            {[t('footer.privacy'), t('footer.terms'), t('footer.sitemap')].map((item) => (
              <span key={item} className="text-white/20 text-[11px] tracking-[0.15em] hover:text-white/50 cursor-pointer transition-colors">{item}</span>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 block animate-pulse" style={{ background: RED }} />
              <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase">{t('footer.madeIn')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating Action Buttons ────────────────────────────────────────────────
function FloatingCTAs() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const store = useStore();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAuthPage) return null;

  // Build WhatsApp number — strip non-digits, ensure it starts with country code
  const waNumber = (store.settings?.whatsapp ?? '').replace(/\D/g, '') || '201234567890';
  const waHref = `https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(store.settings?.companyName ?? 'HORIZON OOH')}%2C%20I%27d%20like%20a%20quote.`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
        >
          {/* WhatsApp FAB */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contact ${store.settings.companyName} on WhatsApp`}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            style={{ background: "#25D366" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          {/* Sticky Get a Quote bar */}
          <div className="flex flex-col items-end gap-2 rounded-sm shadow-xl overflow-hidden" style={{ background: NAVY }}>
            <div className="px-4 pt-3 pb-1">
              <p className="text-white/40 text-[9px] tracking-[0.25em] uppercase leading-none">Launch your campaign</p>
            </div>
            <Link
              to={ROUTES.CONTACT}
              className="mx-3 mb-3 px-5 py-2.5 text-white text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 relative overflow-hidden group"
              style={{ background: RED }}
            >
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: "#ff1a3a" }} />
              <span className="relative z-10">Get a Quote</span>
              <svg className="relative z-10" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 9L9 1M9 1H3M9 1V7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Dynamic Favicon ──────────────────────────────────────────────────────────
function DynamicFavicon() {
  const store = useStore();
  useEffect(() => {
    if (!store.settings.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = store.settings.faviconUrl;
  }, [store.settings.faviconUrl]);
  return null;
}

// ─── Dynamic Page Title ───────────────────────────────────────────────────────
function DynamicTitle() {
  const store = useStore();
  useEffect(() => {
    if (store.settings.companyName) {
      document.title = store.settings.companyName + " — " + store.settings.tagline;
    }
  }, [store.settings.companyName, store.settings.tagline]);
  return null;
}

// ─── Layout ────────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <DynamicFavicon />
      <DynamicTitle />
      <Navbar />
      <main className="pt-[76px]">{children}</main>
      <Footer />
      <FloatingCTAs />
    </div>
  );
}
