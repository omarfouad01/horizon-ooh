import { useRef, useEffect, useState, lazy, Suspense } from "react";
const LeafletMap = lazy(() => import("@/components/BillboardMap"));
import { useStore, getState } from "@/store/dataStore";
import { useNavigate, Link } from "react-router-dom";
import MultiSelect from "@/components/MultiSelect";
import LogoMarquee from "@/components/LogoMarquee";
import { useLang } from "@/i18n/LangContext";
// data now from store
import { serviceHref, locationHref, projectHref, productHref, blogHref, langPath, makeRoutes } from "@/lib/routes";
import { ServiceIcon } from "@/components/ServiceIcon";
import { thumb } from "@/lib/img";

// Billboards helper (cities/formats are now computed inside HeroSection)
const getBillboards = () => getState().locations.flatMap((l: any) => (l.products||[]).map((p: any) => ({ ...p, citySlug: l.slug })));

// ─── Constants ───────────────────────────────────────────────────────────
const NAVY = "#0B0F1A";
const RED = "#D90429";
const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });


// ─── Easing curve ────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Reveal primitives (CSS-only, no framer-motion) ─────────────────────────
// Each element gets its own IntersectionObserver with a generous rootMargin
// so cards never get stuck at opacity:0 due to race conditions.
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Use a positive rootMargin so elements trigger slightly BEFORE they enter viewport
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: '120px' }
    );
    io.observe(el);
    // Fallback: if element is already in view when mounted, show it immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      setTimeout(() => setVisible(true), delay * 1000);
    }
    return () => io.disconnect();
  }, [delay]);
  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const { ref, visible } = useReveal(delay);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        // CLS fix: isolate animation so translateY doesn't shift surrounding layout
        willChange: visible ? 'auto' : 'transform',
        contain: 'layout style',
      }}
    >
      {children}
    </div>
  );
}

// RevealGroup is now just a plain wrapper div — no IntersectionObserver needed
// since RevealItem handles its own visibility
function RevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// RevealItem now has its own IntersectionObserver — no parent coupling
function RevealItem({
  children,
  className = "",
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const delay = index * 90;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          io.disconnect();
        }
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    // Fallback: if already in viewport when mounted, show it
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      setTimeout(() => setVisible(true), delay);
    }
    return () => io.disconnect();
  }, [index]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)`,
        // CLS fix: isolate animation so translateY doesn't shift surrounding layout
        willChange: visible ? 'auto' : 'transform',
        contain: 'layout style',
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '-40px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();
    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Section eyebrow ─────────────────────────────────────────────────────
function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
        <span
          className="text-[10px] font-bold tracking-[0.35em] uppercase"
          style={{ color: light ? "rgba(255,255,255,0.3)" : "rgba(11,15,26,0.35)" }}
        >
          {text}
        </span>
      </div>
    </Reveal>
  );
}

// ─── CTA Button ──────────────────────────────────────────────────────────
function RedButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span
        className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
        style={{ background: NAVY }}
      />
      <span className="relative z-10">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link
        to={href}
        className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white active:scale-[0.97] transition-transform inline-flex items-center"
        style={{ background: RED, textDecoration: 'none' }}
      >{inner}</Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white active:scale-[0.97] transition-transform cursor-pointer"
      style={{ background: RED }}
    >{inner}</button>
  );
}

function OutlineButton({
  label,
  href,
  onClick,
  light = false,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  light?: boolean;
}) {
  const styles = {
    border: `1.5px solid ${light ? "rgba(255,255,255,0.25)" : NAVY}`,
    color: light ? "rgba(255,255,255,0.7)" : NAVY,
  };
  const inner = (
    <>
      <span
        className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
        style={{ background: light ? "rgba(255,255,255,0.1)" : NAVY }}
      />
      <span className="relative z-10 group-hover:text-white transition-colors duration-400">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link
        to={href}
        className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.97] inline-flex items-center"
        style={{ ...styles, textDecoration: 'none' }}
      >{inner}</Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.97] cursor-pointer"
      style={styles}
    >{inner}</button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO — dark navy premium redesign
// ═══════════════════════════════════════════════════════════════════════════

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  const navigate = useNavigate();
  const [cities,    setCities]    = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [formats,   setFormats]   = useState<string[]>([]);

  const { locations: _storeLocs, districts: _storeDists, adFormats: _adFormats, billboardFormats: _bbFormats, homeContent: hc } = useStore();
  const { lang, isAr, t } = useLang();
  const ROUTES = makeRoutes(lang);
  // Arabic helpers for hero section only
  const heroEyebrow    = (isAr && hc.heroEyebrowAr)  ? hc.heroEyebrowAr  : hc.heroEyebrow;
  const heroTitleLines = (isAr && hc.heroTitleLinesAr && hc.heroTitleLinesAr.length) ? hc.heroTitleLinesAr : (hc.heroTitleLines || ['Outdoor','Advertising','Agency.']);
  const heroStatement  = (isAr && hc.heroStatementAr) ? hc.heroStatementAr : hc.heroStatement;
  const heroChannels   = (isAr && hc.heroChannelsAr)  ? hc.heroChannelsAr  : hc.heroChannels;
  const heroCta1       = (isAr && hc.heroCta1Ar)      ? hc.heroCta1Ar      : (hc.hero_cta_primary || t('home.exploreLocations'));
  const heroCta2       = (isAr && hc.heroCta2Ar)      ? hc.heroCta2Ar      : (hc.hero_cta_secondary || t('home.viewCaseStudies'));
  // ── Only show cities/districts that have at least 1 billboard ──────────
  // Collect all billboard city names and district names that are actually assigned
  const _allBillboards   = _storeLocs.flatMap((l: any) => l.products || []);
  const _assignedCities  = new Set(_allBillboards.map((b: any) => b.city).filter(Boolean));
  const _assignedDistricts = new Set(_allBillboards.map((b: any) => b.district).filter(Boolean));

  const ALL_CITIES  = _storeLocs
    .filter((l: any) => (l.products || []).length > 0 || _assignedCities.has(l.city))
    .map((l: any) => l.city); // preserve dashboard order — no .sort()
  // Format dropdown = billboard_formats table (Billboard, Digital, Mall…)
  const _bbFmtsList = (_bbFormats && _bbFormats.length > 0) ? _bbFormats : _adFormats;
  const ALL_FORMATS = _bbFmtsList.map((f: any) => f.label ?? f.name).filter(Boolean).sort();

  const districtOptions = (() => {
    if (cities.length === 0) {
      // Show only districts that have at least 1 billboard
      return _storeDists
        .filter((d: any) => _assignedDistricts.has(d.name))
        .map((d: any) => d.name)
        .sort();
    }
    // Selected cities: further narrow to districts with billboards in those cities
    const selectedLocs = _storeLocs.filter((l: any) => cities.includes(l.city));
    const locBillboards = selectedLocs.flatMap((l: any) => l.products || []);
    const locAssignedDistricts = new Set(locBillboards.map((b: any) => b.district).filter(Boolean));
    const locIds = selectedLocs.map((l: any) => l.id);
    return _storeDists
      .filter((d: any) => locIds.includes(d.locationId) && locAssignedDistricts.has(d.name))
      .map((d: any) => d.name)
      .sort();
  })();

  // Arabic label maps for dropdowns
  const cityLabelsAr: Record<string, string> = isAr
    ? Object.fromEntries(_storeLocs.filter((l: any) => l.cityAr).map((l: any) => [l.city, l.cityAr]))
    : {};
  const districtLabelsAr: Record<string, string> = isAr
    ? Object.fromEntries(_storeDists.filter((d: any) => d.nameAr).map((d: any) => [d.name, d.nameAr]))
    : {};

  const hasFilters = cities.length > 0 || districts.length > 0 || formats.length > 0;
  const reset = () => { setCities([]); setDistricts([]); setFormats([]); };

  // ── Map pin selection ─────────────────────────────────────────────
  const [selectedPin, setSelectedPin] = useState<(ReturnType<typeof getBillboards>)[0] | null>(null);

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    cities.forEach(c    => params.append("city",     c));
    districts.forEach(d => params.append("district", d));
    formats.forEach(f   => params.append("format",   f));
    navigate(`/locations${params.toString() ? "?" + params.toString() : ""}`);
  }

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", background: NAVY }}
    >
      {/* ── BACKGROUND parallax image ──────────────────────── */}
      {/* Plain <img> so browser preload scanner can discover it. Parallax via rAF-based scroll listener below. */}
      <div
        ref={(el) => {
          // Scroll-parallax via rAF — never blocks initial paint of the LCP element.
          // framer-motion wrappers were removed from this element because their JS
          // overhead (useScroll + useTransform MotionValue chain) inflates
          // Element Render Delay before the image can visually commit.
          if (!el) return;
          let raf = 0;
          const hero = heroRef.current;
          const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
              if (!hero || !el) return;
              const { top, height } = hero.getBoundingClientRect();
              const progress = Math.max(0, Math.min(1, -top / height));
              const scale   = 1 + progress * 0.08;      // 1.00 → 1.08 on scroll
              const opacity = 0.22 - progress * 0.08;   // 0.22 → 0.14 on scroll
              el.style.transform = `scale(${scale})`;
              el.style.opacity   = String(opacity);
            });
          };
          window.addEventListener('scroll', onScroll, { passive: true });
        }}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.22, willChange: 'transform, opacity', transformOrigin: 'center center' }}
      >
        {/* LCP element — self-hosted WebP + JPEG fallback, fetchPriority="high" */}
        <picture>
          <source
            type="image/webp"
            srcSet="/images/hero-400.webp 400w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w, /images/hero-1600.webp 1600w"
            sizes="100vw"
          />
          <img
            src="/images/hero-1600.jpg"
            srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w, /images/hero-1200.jpg 1200w, /images/hero-1600.jpg 1600w"
            sizes="100vw"
            alt="" aria-hidden
            width={1600} height={900}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* ── GRADIENTS & EFFECTS ────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #060912 100%)`
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)"
      }} />
      <div className="absolute pointer-events-none" style={{
        left: "-8%", top: "15%", width: "45%", height: "60%",
        background: "radial-gradient(ellipse at center, rgba(217,4,41,0.10) 0%, transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "100% 80px"
      }} />
      <div className="absolute top-0 bottom-0 pointer-events-none hidden lg:block" style={{
        left: "44%", width: "1px",
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)"
      }} />

      <div className="relative z-10 w-full flex flex-col lg:flex-row" style={{ minHeight: "100svh" }}>
        {/* ═══ LEFT PANEL ══════════════════════════════════════ */}
        <div className="flex flex-col justify-between px-6 sm:px-10 lg:pl-[120px] lg:pr-14
          pt-[104px] pb-10 lg:pt-[148px] lg:pb-14
          w-full lg:w-[44%] xl:w-[42%] flex-shrink-0">
          <div className="flex flex-col gap-0">
            {/* Eyebrow */}
            <div
              className="flex items-center gap-3 mb-9"
              style={{ animation: 'heroFadeIn 0.7s ease 0.1s both' }}
            >
              <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                {heroEyebrow}
              </span>
            </div>

            {/* H1 */}
            <div className="overflow-visible mb-5">
              {heroTitleLines.map((word: string, i: number) => (
                <div key={word} className="overflow-hidden">
                  <h1
                    className="font-black leading-[0.9] tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(48px, 5vw, 80px)",
                      color: i === 2 ? "rgba(255,255,255,0.18)" : "white",
                      animation: `heroSlideUp 1.0s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.11}s both`,
                    }}
                  >
                    {word}
                  </h1>
                </div>
              ))}
            </div>

            {/* Channels */}
            <p
              className="text-[11px] font-bold tracking-[0.24em] uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.25)", animation: 'heroFadeIn 0.7s ease 0.6s both' }}
            >
              {heroChannels}
            </p>

            {/* Statement */}
            <p
              className="text-[17px] font-medium leading-[1.6] mb-9"
              style={{ color: "rgba(255,255,255,0.6)", maxWidth: 360, animation: 'heroFadeIn 0.75s ease 0.75s both' }}
            >
              {heroStatement}
            </p>

            {/* CTA row — 2 buttons only, contained within left panel */}
            <div
              className="flex flex-row items-start gap-3 mb-12 flex-wrap"
              style={{ animation: 'heroFadeIn 0.75s ease 0.9s both' }}
            >
              <Link
                to={ROUTES.CONTACT}
                className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase text-white cursor-pointer flex-shrink-0 inline-flex items-center"
                style={{ background: RED, textDecoration: 'none' }}
              >
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={{ background: "#f0042e" }} />
                <span className="relative z-10">{t('nav.getQuote')}</span>
              </Link>
              <Link
                to={ROUTES.DESIGN_SIMULATOR}
                className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase cursor-pointer flex-shrink-0 inline-flex items-center"
                style={{ border: "1.5px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.65)", background: "transparent", textDecoration: 'none' }}
              >
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {isAr ? 'جرّب المحاكي' : 'Try Simulator'}
                </span>
              </Link>
            </div>

            {/* ── Divider ───────────────────────────────────────────── */}
            <div style={{ animation: 'heroFadeIn 0.5s ease 1.1s both' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-4 h-[1px]" style={{ background: RED }} />
                <p className="text-[9px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(255,255,255,0.22)" }}>
                  {hc.searchTitle}
                </p>
              </div>

              {/* Search form */}
              <form onSubmit={handleSearch} className="flex flex-col gap-[1px]"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <MultiSelect
                  label={isAr ? 'المحافظة' : 'City'} options={ALL_CITIES} selected={cities}
                  onChange={v => { setCities(v); setDistricts([]); }}
                  optionLabels={cityLabelsAr}
                  dark
                  icon={
                    <svg width="11" height="13" viewBox="0 0 13 15" fill="none">
                      <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                        fill="rgba(255,255,255,0.3)"/>
                    </svg>
                  }
                />
                <MultiSelect
                  label={isAr ? 'المنطقة' : 'District'} options={districtOptions} selected={districts}
                  onChange={setDistricts}
                  optionLabels={districtLabelsAr}
                  dark
                  icon={
                    <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                      <rect x="0.5" y="5.5" width="6" height="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4"/>
                      <rect x="8.5" y="2.5" width="6" height="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4"/>
                      <path d="M0 5.5L7.5 0 15 5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  }
                />
                <MultiSelect
                  label={isAr ? 'النوع' : 'Format'} options={ALL_FORMATS} selected={formats}
                  onChange={setFormats}
                  dark
                  icon={
                    <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                      <rect x="0.5" y="0.5" width="14" height="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4"/>
                      <path d="M3 4h9M3 6.5h6M3 9h4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  }
                />
                <button
                  type="submit"
                  className="w-full h-12 flex items-center justify-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase text-white group relative overflow-hidden"
                  style={{ background: RED, border: "none", cursor: "pointer" }}
                >
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ background: "#f0042e" }} />
                  <svg className="relative z-10" width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M9.5 9.5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="relative z-10">{isAr ? 'بحث عن اللوحات' : 'Search Billboards'}</span>
                </button>
              </form>

              {hasFilters && (
                <button onClick={reset}
                  className="mt-2 text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.22)", textAlign: "left" }}>
                  ← Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL — map ════════════════════════════════════ */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: "clamp(420px, 55vh, 100svh)" }}>
          {/* Left edge fade */}
          <div className="absolute inset-0 pointer-events-none z-[2]" style={{
            background: "linear-gradient(to right, rgba(11,15,26,0.4) 0%, transparent 25%)"
          }} />

          <Suspense fallback={<div className="absolute inset-0 bg-[#0b0f1a]" />}>
            <LeafletMap
              filtered={getBillboards().slice(0, 20)}
              allCount={getBillboards().length}
              selected={selectedPin}
              onSelect={setSelectedPin}
              className="absolute inset-0 w-full h-full"
              style={{ zIndex: 1 }}
            />
          </Suspense>

          {selectedPin && (
              <div
                className="absolute bottom-4 right-4 z-[1000]"
                style={{ width: 268, animation: 'fadeSlideLeft 0.28s ease both' }}
              >
                <div className="overflow-hidden"
                  style={{ background: NAVY, boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)" }}>
                  <div className="relative overflow-hidden" style={{ height: 120 }}>
                    <img src={selectedPin.image} alt={selectedPin.name}
                      width={400} height={120}
                      loading="lazy" decoding="async"
                      className="w-full h-full object-cover" style={{ opacity: 0.7 }}/>
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top,rgba(11,15,26,.85) 0%,transparent 55%)" }}/>
                    <span className="absolute bottom-2.5 left-3 text-[9px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      {selectedPin.district} · {selectedPin.city}
                    </span>
                    <button onClick={() => setSelectedPin(null)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: "12px 16px 16px" }}>
                    <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: RED }}>
                      {selectedPin.type}
                    </p>
                    <p className="font-extrabold text-[14px] leading-tight mb-1.5 text-white">
                      {selectedPin.name}
                    </p>
                    <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {selectedPin.traffic} · {selectedPin.size}
                    </p>
                    <button
                      onClick={() => navigate(`/locations/${selectedPin.citySlug}/billboards/${selectedPin.slug}`)}
                      className="w-full h-9 text-[10px] font-bold tracking-[0.18em] uppercase text-white"
                      style={{ background: RED, border: "none", cursor: "pointer" }}>
                      View Full Details →
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. STATEMENT — NEW
// ═══════════════════════════════════════════════════════════════════════════
function StatementSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { homeContent: hc } = useStore();
  const { isAr } = useLang();
  const statementEyebrow = (isAr && hc.statementEyebrowAr) ? hc.statementEyebrowAr : hc.statementEyebrow;
  const statementLines   = (isAr && hc.statementLinesAr && hc.statementLinesAr.length) ? hc.statementLinesAr : (hc.statementLines || []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: '-80px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ background: NAVY, minHeight: "100svh" }}
    >
      {/* Ambient texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(217,4,41,0.06) 0%, transparent 70%)`,
        }}
      />

      <div
        className="text-center px-8 relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        <div className="overflow-hidden mb-6">
          <p
            className="text-white/20 text-[12px] font-bold tracking-[0.4em] uppercase"
            style={{
              transform: visible ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {statementEyebrow}
          </p>
        </div>

        {statementLines.map((line: string, i: number) => (
          <div key={i} className="overflow-hidden">
            <h2
              className="font-black leading-[0.88] tracking-[-0.04em] uppercase"
              style={{
                fontSize: "clamp(48px, 7.5vw, 108px)",
                color: i === 1 ? RED : 'white',
                transform: visible ? 'translateY(0)' : 'translateY(100%)',
                transition: `transform 1.1s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
              }}
            >
              {line}
            </h2>
          </div>
        ))}

        <div
          className="mt-12 flex justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: "center",
            transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <span className="block w-10 h-[1px] bg-white/15" />
            <span className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-bold">{hc.statementBrand}</span>
            <span className="block w-10 h-[1px] bg-white/15" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TRUST / AUTHORITY STRIP
// ═══════════════════════════════════════════════════════════════════════════
function TrustStrip() {
  const { trustStats: TRUST_STATS } = useStore()
  const { isAr, t } = useLang()
  // Map common stat labels to translation keys
  const statLabel = (label: string) => {
    const lower = label.toLowerCase()
    if (lower.includes('location')) return t('home.statsLocations') || label
    if (lower.includes('brand'))    return t('home.statsBrands')    || label
    if (lower.includes('city') || lower.includes('cities')) return t('home.statsCities') || label
    return label
  }
  return (
    <section className="bg-white py-[80px] border-y border-[#0B0F1A]/[0.06]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-3">
          {TRUST_STATS.map((stat, i) => (
            <RevealItem key={stat.label}>
              <div
                className="flex flex-col items-center text-center py-10"
                style={{
                  borderRight: i < 2 ? "1px solid rgba(11,15,26,0.07)" : "none",
                }}
              >
                <div
                  className="font-black leading-none tracking-[-0.05em] mb-4"
                  style={{ fontSize: "clamp(48px, 5vw, 72px)", color: RED }}
                >
                  <span>{stat.value}</span>
                </div>
                <div
                  className="font-semibold tracking-[0.22em] uppercase"
                  style={{ fontSize: 11, color: "rgba(11,15,26,0.3)" }}
                >
                  {isAr ? statLabel(stat.label) : stat.label}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. SERVICES GRID
// ═══════════════════════════════════════════════════════════════════════════
function ServicesSection() {
  const { services: SERVICES } = useStore()
  const { lang, isAr, t } = useLang()
  const ROUTES = makeRoutes(lang)
  // Limit to first 6 services
  const visible = SERVICES.slice(0, 6)
  return (
    <section id="services" className="bg-white" style={{ paddingTop: 120, paddingBottom: 140 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header row */}
        <div className="flex items-end justify-between mb-16 gap-8">
          <div>
            <Eyebrow text={t('home.ourServices') || 'Our Services'} />
            <Reveal delay={0.05}>
              <h2
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)", color: NAVY }}
              >
                {t('home.servicesTitle') || 'Full-spectrum'}
                <br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>{t('home.servicesAccent') || 'OOH.'}</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15} className={`flex flex-col items-end gap-5 max-w-[260px] ${isAr ? 'items-start text-left' : 'items-end text-right'}`}>
            <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.4)" }}>
              {t('home.servicesSubtitle') || "Full-spectrum outdoor media solutions across Egypt's major urban centres."}
            </p>
            <Link
              to={ROUTES.SERVICES}
              className="group inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors"
              style={{ color: NAVY }}
            >
              <span className="group-hover:underline transition-all">
                {isAr ? 'عرض كل الخدمات' : 'Show All Services'}
              </span>
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full transition-all group-hover:translate-x-1"
                style={{ background: RED }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>

        {/* Grid — white background, thin border separators, no gap fill */}
        <div style={{ border: '1px solid rgba(11,15,26,0.08)' }}>
        <RevealGroup
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
        >
          {visible.map((service, i) => (
            <RevealItem key={service.id} className="h-full">
              <Link
                to={serviceHref(lang, service.slug)}
                className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 flex flex-col h-full"
                style={{
                  padding: '48px 40px 44px',
                  textDecoration: 'none',
                  borderRight: (i % 3 !== 2) ? '1px solid rgba(11,15,26,0.08)' : 'none',
                  borderBottom: (i < visible.length - (visible.length % 3 || 3)) ? '1px solid rgba(11,15,26,0.08)' : 'none',
                }}
              >
                {/* Icon + Number row */}
                <div className="flex items-center justify-between mb-10">
                  {(service as any).icon ? (
                    <span
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[rgba(11,15,26,0.07)] group-hover:border-white/10 transition-all duration-500"
                      style={{ background: 'rgba(11,15,26,0.04)' }}
                    >
                      <ServiceIcon
                        icon={(service as any).icon}
                        size={24}
                        className="text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                      />
                    </span>
                  ) : null}
                  <span
                    className="font-black text-[11px] tracking-[0.25em] uppercase text-[rgba(11,15,26,0.15)] group-hover:text-white/15 transition-colors duration-500 ml-auto"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold tracking-[-0.02em] mb-4 text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                  style={{ fontSize: 22, lineHeight: 1.2 }}
                >
                  {isAr && (service as any).titleAr ? (service as any).titleAr : service.title}
                </h3>

                {/* Dual divider — gray default, red on hover */}
                <div className="relative mb-5">
                  <div
                    className="w-8 h-[1px] transition-all duration-500 group-hover:w-12"
                    style={{ background: 'rgba(11,15,26,0.15)' }}
                  />
                  <div
                    className="w-8 h-[1px] -mt-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12"
                    style={{ background: RED }}
                  />
                </div>

                {/* Short description */}
                <p
                  className="text-[15px] leading-[1.7] flex-1 text-[rgba(11,15,26,0.45)] group-hover:text-white/70 transition-colors duration-500"
                >
                  {isAr && (service as any).descriptionAr ? (service as any).descriptionAr : service.description}
                </p>

                {/* CTA — always visible */}
                <div className="flex items-center gap-2 mt-8">
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
                    style={{ color: RED }}
                  >
                    {t('services.exploreService') || 'Explore Service'}
                  </span>
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0"
                    style={{ color: RED, fontSize: 18, lineHeight: 1 }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. FEATURE — OWN THE ROAD
// ═══════════════════════════════════════════════════════════════════════════
function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { homeContent: hc } = useStore();
  const { isAr } = useLang();
  const featureLine1   = (isAr && hc.featureTitleLine1Ar) ? hc.featureTitleLine1Ar : hc.featureTitleLine1;
  const featureLine2   = (isAr && hc.featureTitleLine2Ar) ? hc.featureTitleLine2Ar : hc.featureTitleLine2;
  const featureBullets = (isAr && hc.featureBulletsAr && hc.featureBulletsAr.length) ? hc.featureBulletsAr : (hc.featureBullets || []);

  return (
    <section ref={sectionRef} className="overflow-hidden" style={{ background: NAVY }}>
      <div
        className="max-w-[1440px] mx-auto grid"
        style={{ gridTemplateColumns: "1fr 1fr", minHeight: 640 }}
      >
        {/* Left — text */}
        <div
          className="flex flex-col justify-center"
          style={{ padding: "100px 80px 100px 120px" }}
        >
          <Eyebrow text={hc.featureEyebrow} light />

          <Reveal delay={0.1} y={20}>
            <h2
              className="font-black leading-[0.88] tracking-[-0.05em] text-white mb-14"
              style={{ fontSize: "clamp(60px, 6vw, 88px)" }}
            >
              {featureLine1}<br />{featureLine2}
            </h2>
          </Reveal>

          <RevealGroup className="flex flex-col gap-7 mb-14">
            {featureBullets.map((bullet: string) => (
              <RevealItem key={bullet}>
                <div className="flex items-start gap-5">
                  <span className="mt-2 flex-shrink-0 w-[5px] h-[5px]" style={{ background: RED }} />
                  <p className="text-[16px] leading-[1.65]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {bullet}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.45}>
            <RedButton label={hc.featureButtonText} href="/contact" />
          </Reveal>
        </div>

        {/* Right — image with parallax */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-[-8%]">
            <img
              src={hc.featureImage ? thumb(hc.featureImage, 1000, 700) : 'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=700&q=80&fit=crop'}
              alt="Large format billboard advertising"
              width={1000} height={700}
              loading="lazy" decoding="async"
              className="w-full h-full object-cover"
              style={{ opacity: 0.65 }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, ${NAVY} 0%, rgba(11,15,26,0.3) 60%, transparent 100%)` }}
          />
          {/* Stats overlay */}
          <div className="absolute bottom-10 right-10 text-right">
            <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">{hc.featureStatsLabel}</p>
            <p className="font-black text-white/40 tracking-[-0.04em]" style={{ fontSize: 36 }}>{hc.featureStatsValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. LOCATIONS
// ═══════════════════════════════════════════════════════════════════════════
function LocationsSection() {
  const { locations: LOCATIONS, settings } = useStore()
  const { isAr, t } = useLang()
  // Featured cities always shown first; limit from settings applies to remaining slots
  const FEATURED_SLUGS = ['cairo', 'giza', 'alexandria', 'matrouh', 'luxor', 'aswan']
  const featuredFirst = [
    ...FEATURED_SLUGS.map(slug => LOCATIONS.find((l: any) => l.slug === slug)).filter(Boolean),
    ...LOCATIONS.filter((l: any) => !FEATURED_SLUGS.includes(l.slug)),
  ] as typeof LOCATIONS
  const limit = (settings as any).homeCoverageLimit ?? 6
  const visibleLocations = featuredFirst.slice(0, limit > 0 ? limit : featuredFirst.length)
  return (
    <section id="locations" className="bg-white" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <Eyebrow text={t('home.coverageEyebrow') || 'Our Coverage'} />
            <Reveal delay={0.05}>
              <h2
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)", color: NAVY }}
              >
                {t('home.coverageTitle') || 'We cover'}<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>{t('home.coverageAccent') || 'every corner.'}</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <OutlineButton label={t('home.viewAllLocations') || 'View All Locations'} href="/locations" />
          </Reveal>
        </div>

        {/* City grid */}
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#0B0F1A]/[0.06]">
          {visibleLocations.map((loc, i) => (
            <RevealItem key={loc.city}>
              <div
                className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 cursor-pointer"
                style={{ padding: "40px 36px" }}
              >
                <div className="flex items-start justify-between mb-8">
                  <span
                    className="font-black text-[11px] tracking-[0.25em] uppercase text-[#D90429] group-hover:text-white/20 transition-colors duration-500"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[20px] leading-none opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-2 group-hover:translate-x-0 text-[#D90429]"
                  >
                    →
                  </span>
                </div>
                <h3
                  className="font-extrabold tracking-[-0.02em] mb-3 text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                  style={{ fontSize: 26, lineHeight: 1.1 }}
                >
                  {isAr && (loc as any).cityAr ? (loc as any).cityAr : loc.city}
                </h3>
                <p
                  className="text-[13px] leading-[1.6] text-[rgba(11,15,26,0.45)] group-hover:text-white/70 transition-colors duration-500"
                >
                  {isAr && (loc as any).detailAr ? (loc as any).detailAr : loc.detail}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. PROCESS
// ═══════════════════════════════════════════════════════════════════════════
function ProcessSection() {
  const { process: PROCESS } = useStore()
  const { isAr, t } = useLang()
  return (
    <section style={{ background: NAVY, padding: "120px 0 140px" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <div className="flex items-end justify-between mb-20">
          <div>
            <Eyebrow text={t('home.howWeWork') || 'How We Work'} light />
            <Reveal delay={0.05}>
              <h2
                className="font-black text-white leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)" }}
              >
                {t('home.campaignIn') || 'Campaign in'}<br />
                <span style={{ color: "rgba(255,255,255,0.2)" }}>{t('home.fourSteps') || '4 steps.'}</span>
              </h2>
            </Reveal>
          </div>
        </div>

        {/* Steps — with horizontal connector */}
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div
            className="absolute top-[22px] left-8 right-8 h-[1px] bg-white/[0.06] hidden xl:block"
            style={{ zIndex: 0 }}
          />
          {PROCESS.map((step) => (
            <RevealItem key={step.step}>
              <div className="relative z-10 flex flex-col gap-5">
                {/* Dot + number */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-[10px] h-[10px] border-2 flex-shrink-0"
                    style={{ borderColor: RED, background: NAVY }}
                  />
                  <span
                    className="font-black text-[11px] tracking-[0.3em] uppercase"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    {step.step}
                  </span>
                </div>

                {/* Label */}
                <h3
                  className="font-extrabold text-white tracking-[-0.03em]"
                  style={{ fontSize: 28 }}
                >
                  {isAr && (step as any).labelAr ? (step as any).labelAr : step.label}
                </h3>

                {/* Rule */}
                <div className="w-8 h-[1px]" style={{ background: RED }} />

                {/* Description */}
                <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {isAr && (step as any).descriptionAr ? (step as any).descriptionAr : step.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. RESULTS
// ═══════════════════════════════════════════════════════════════════════════
function ResultsSection() {
  const { results: RESULTS } = useStore()
  const resultNums: Record<string, number> = { "2.7×": 27, "+180%": 180, "100+": 100 };

  return (
    <section id="results" className="bg-white" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header */}
        <div className="mb-20">
          <Eyebrow text="Proven Results" />
          <Reveal delay={0.05}>
            <h2
              className="font-black leading-[0.9] tracking-[-0.04em] max-w-xl"
              style={{ fontSize: "clamp(44px, 4.5vw, 64px)", color: NAVY }}
            >
              Numbers
              <br />
              <span style={{ color: "rgba(11,15,26,0.18)" }}>that speak.</span>
            </h2>
          </Reveal>
        </div>

        {/* Stats — dynamic columns, border between each card */}
        <RevealGroup className={`grid grid-cols-1 sm:grid-cols-${Math.min(RESULTS.length, 3) || 3}`}>
          {RESULTS.map((r, i) => (
            <RevealItem key={r.id ?? r.label ?? i}>
              <div
                className="flex flex-col py-16 px-10"
                style={{
                  borderRight: (i + 1) % Math.min(RESULTS.length, 3) !== 0 ? "1px solid rgba(11,15,26,0.07)" : "none",
                }}
              >
                {/* Big number */}
                <div
                  className="font-black leading-none tracking-[-0.05em] mb-6"
                  style={{ fontSize: "clamp(64px, 6vw, 88px)", color: RED }}
                >
                  {r.value}
                </div>

                {/* Label */}
                <p
                  className="font-bold tracking-[-0.01em] mb-2"
                  style={{ fontSize: 20, color: NAVY }}
                >
                  {r.label}
                </p>

                {/* Sublabel */}
                <p
                  className="text-[12px] tracking-[0.2em] uppercase font-semibold"
                  style={{ color: "rgba(11,15,26,0.3)" }}
                >
                  {(r as any).sublabel ?? (r as any).description ?? ''}
                </p>

                {/* Red underline */}
                <div className="mt-8 w-8 h-[2px]" style={{ background: RED }} />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. CLIENTS / TRUST — sits directly beneath the hero
// ═══════════════════════════════════════════════════════════════════════════
function ClientsSection() {
  const { clientBrands } = useStore();
  const { t } = useLang();
  return (
    <section id="about" style={{ background: "#ffffff", paddingTop: 52, paddingBottom: 52, borderTop: "1px solid rgba(11,15,26,0.06)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.12)" }} />
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-center" style={{ color: "rgba(11,15,26,0.35)" }}>{t('home.trustedBy')}
            </p>
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.12)" }} />
          </div>
        </Reveal>
        <LogoMarquee brands={clientBrands} speed={45} light={true} />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. SIGNATURE SECTION
// ═══════════════════════════════════════════════════════════════════════════
function SignatureSection() {
  const ref = useRef<HTMLElement>(null);
  const { homeContent: hc } = useStore();
  const { isAr } = useLang();
  const signatureEyebrow = (isAr && hc.signatureEyebrowAr) ? hc.signatureEyebrowAr : hc.signatureEyebrow;
  const signatureLines   = (isAr && hc.signatureLinesAr && hc.signatureLinesAr.length) ? hc.signatureLinesAr : (hc.signatureLines || []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: NAVY, paddingTop: 160, paddingBottom: 160 }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
        <p className="text-white/[0.03] font-black uppercase whitespace-nowrap"
          style={{ fontSize: "clamp(120px, 18vw, 260px)", letterSpacing: "-0.05em" }}>
          HORIZON
        </p>
      </div>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(217,4,41,0.05) 0%, transparent 70%)` }}/>
      <div className="relative z-10 text-center px-8">
        <Reveal>
          <div className="flex items-center justify-center gap-5 mb-12">
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
              {signatureEyebrow}
            </span>
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </Reveal>
        {signatureLines.map((line: string, i: number) => (
          <div key={i} className="overflow-hidden">
            <h2
              className="font-black leading-[0.88] tracking-[-0.05em] uppercase"
              style={{ fontSize: "clamp(48px, 7.5vw, 110px)", color: i === 1 ? RED : "white" }}
            >
              {line}
            </h2>
          </div>
        ))}
        <Reveal delay={0.5}>
          <div className="flex items-center justify-center gap-5 mt-12">
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="block w-2 h-2" style={{ background: RED }} />
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. FINAL CTA
// ═══════════════════════════════════════════════════════════════════════════
function FinalCTASection() {
  const { homeContent: hc } = useStore();
  const { lang, isAr } = useLang();
  const ROUTES = makeRoutes(lang);
  const finalLine1     = (isAr && hc.finalCtaTitleLine1Ar) ? hc.finalCtaTitleLine1Ar : hc.finalCtaTitleLine1;
  const finalLine2     = (isAr && hc.finalCtaTitleLine2Ar) ? hc.finalCtaTitleLine2Ar : hc.finalCtaTitleLine2;
  const finalSubtext   = (isAr && hc.finalCtaSubtextAr)    ? hc.finalCtaSubtextAr    : hc.finalCtaSubtext;
  const finalPrimary   = (isAr && hc.finalCtaPrimaryTextAr)   ? hc.finalCtaPrimaryTextAr   : hc.finalCtaPrimaryText;
  const finalSecondary = (isAr && hc.finalCtaSecondaryTextAr) ? hc.finalCtaSecondaryTextAr : hc.finalCtaSecondaryText;
  return (
    <section id="contact" className="bg-white" style={{ paddingTop: 160, paddingBottom: 160 }}>
      <div className="max-w-[1440px] mx-auto text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
            <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
              {hc.finalCtaEyebrow}
            </span>
            <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-black leading-[0.9] tracking-[-0.04em] mx-auto mb-8"
            style={{ fontSize: "clamp(44px, 5vw, 72px)", color: NAVY, maxWidth: 720 }}>
            {finalLine1}<br />
            <span style={{ color: "rgba(11,15,26,0.2)" }}>{finalLine2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="text-[18px] leading-[1.65] mx-auto mb-14"
            style={{ color: "rgba(11,15,26,0.4)", maxWidth: 380 }}>
            {finalSubtext}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="flex items-center justify-center gap-5 mb-16">
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white relative group"
              style={{ background: RED, textDecoration: 'none' }}>
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out" style={{ background: NAVY }}/>
              <span className="relative z-10">{finalPrimary}</span>
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="group relative inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY, textDecoration: 'none' }}>
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out" style={{ background: NAVY }}/>
              <span className="relative z-10 group-hover:text-white transition-colors duration-400">{finalSecondary}</span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="flex items-center justify-center gap-10 pt-10 border-t border-[#0B0F1A]/[0.06]">
            {(hc.finalCtaBadges || []).map((label) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="block w-1 h-1" style={{ background: RED }} />
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS TEASER SECTION (HOME)
// ═══════════════════════════════════════════════════════════════════════════
function ProjectsSection() {
  const { projects: PROJECTS } = useStore()
  const { lang, isAr, t } = useLang()
  const ROUTES = makeRoutes(lang)
  const featured = PROJECTS.find((p) => p.featured) ?? PROJECTS[0] ?? null;
  const others   = PROJECTS.filter((p) => p !== featured).slice(0, 2);

  if (!featured) return null;

  return (
    <section className="bg-white" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "rgba(11,15,26,0.35)" }}>
                  Case Studies
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(40px, 4.5vw, 60px)", color: NAVY }}>
                Campaigns that moved<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>the needle.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Link
              to={ROUTES.PROJECTS}
              className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase flex items-center"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY, textDecoration: "none" }}
            >
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: NAVY }} />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">View All Projects</span>
            </Link>
          </Reveal>
        </div>

        {/* Featured + two smaller cards */}
        <RevealGroup className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured — spans 7 columns */}
          <RevealItem className="col-span-7">
            <Link
              to={projectHref(lang, featured.slug)}
              className="group relative block overflow-hidden"
              style={{ textDecoration: "none", height: 500 }}
            >
              <img
                src={thumb(featured.coverImage, 1200, 500)}
                alt={`${featured.title} — outdoor advertising case study`}
                width={1200} height={500}
                loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ opacity: 0.82 }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.88) 0%, rgba(11,15,26,0.15) 65%, transparent 100%)" }} />

              <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "40px" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 text-white" style={{ background: RED }}>{featured.category}</span>
                  <span className="text-white/35 text-[10px] font-semibold tracking-[0.15em]">{featured.location}</span>
                </div>
                <h3 className="font-black text-white leading-[1.05] tracking-[-0.03em] mb-3" style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}>{featured.title}</h3>
                <p className="text-white/45 text-[13px] mb-6 leading-[1.6]">{featured.tagline}</p>
                <div className="flex items-center gap-8">
                  {featured.results.slice(0, 2).map((r) => (
                    <div key={r.metric}>
                      <p className="font-black text-white tracking-[-0.03em]" style={{ fontSize: 22, color: RED }}>{r.value}</p>
                      <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-bold">{r.metric}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <span style={{ color: RED, fontSize: 22 }}>→</span>
              </div>
            </Link>
          </RevealItem>

          {/* Two smaller cards — 5 columns */}
          <div className="col-span-5 flex flex-col gap-6">
            {others.map((p) => (
              <RevealItem key={p.id} className="flex-1">
                <Link
                  to={projectHref(lang, p.slug)}
                  className="group relative block overflow-hidden"
                  style={{ textDecoration: "none", height: "100%", minHeight: 230 }}
                >
                  <img
                    src={thumb(p.coverImage, 600, 230)}
                    alt={`${p.title} — outdoor advertising`}
                    width={600} height={230}
                    loading="lazy" decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{ opacity: 0.82 }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.85) 0%, rgba(11,15,26,0.1) 70%, transparent 100%)" }} />
                  <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "24px 28px" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-1 text-white" style={{ background: RED }}>{p.category}</span>
                      <span className="text-white/35 text-[9px] font-semibold tracking-[0.15em]">{p.city}</span>
                    </div>
                    <h3 className="font-extrabold text-white leading-[1.1] tracking-[-0.02em]" style={{ fontSize: 17 }}>{p.title}</h3>
                    <p className="text-white/30 text-[11px] mt-1">{p.client} · {p.year}</p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span style={{ color: RED, fontSize: 18 }}>→</span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}


// ─── LatestBlogsSection ──────────────────────────────────────────────────────
function LatestBlogsSection() {
  const { blogPosts } = useStore();
  const { lang, isAr, t } = useLang();
  const ROUTES = makeRoutes(lang);
  const latest = blogPosts.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section id="latest-blogs" style={{ background: "#F5F5F6", paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header */}
        <Reveal>
          <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "rgba(11,15,26,0.3)" }}>
                Insights & Strategy
              </p>
              <h2 className="text-[#0B0F1A] font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em]" style={{ maxWidth: 560 }}>
                Latest from the Blog
              </h2>
            </div>
            <Link
              to={ROUTES.BLOG}
              className="shrink-0 border border-[#0B0F1A]/20 text-[#0B0F1A] text-[13px] font-semibold tracking-[0.08em] uppercase px-6 py-3 hover:border-[#D90429] hover:text-[#D90429] transition-colors duration-300"
            >
              View All Articles
            </Link>
          </div>
        </Reveal>

        {/* Cards */}
        <div style={{ background: "rgba(11,15,26,0.07)" }}>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]">
          {latest.map((post) => (
            <RevealItem key={post.id}>
              <Link
                to={blogHref(lang, post.slug)}
                className="group bg-white flex flex-col hover:bg-[#0B0F1A] transition-colors duration-500 h-full"
                style={{ textDecoration: "none" }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 220 }}>
                  <img
                    src={thumb(post.image, 600, 220)}
                    alt={post.title}
                    width={600} height={220}
                    loading="lazy" decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ opacity: 0.85 }}
                  />
                  <div
                    className="absolute top-4 left-4 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5"
                    style={{ background: RED, color: "white" }}
                  >
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500">{post.date}</span>
                    <span className="text-[rgba(11,15,26,0.2)] group-hover:text-white/20 transition-colors duration-500" style={{ fontSize: 10 }}>·</span>
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500">{post.readTime}</span>
                  </div>
                  <h3
                    className="font-bold leading-[1.2] tracking-[-0.02em] mb-4 flex-1 transition-colors duration-500 text-[#0B0F1A] group-hover:text-white"
                    style={{ fontSize: 18 }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-[13px] leading-[1.65] mb-6 transition-colors duration-500 text-[rgba(11,15,26,0.45)] group-hover:text-white/35">
                    {post.excerpt.length > 100 ? post.excerpt.slice(0, 100) + "…" : post.excerpt}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>Read More</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-base" style={{ color: RED }}>→</span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}


// ─── WhyOOHSection ───────────────────────────────────────────────────────
const DEFAULT_MARKET_INSIGHTS = [
  {
    title: "Egypt's Fastest-Growing OOH Market",
    body: "With a metropolitan Cairo population exceeding 22 million and rapid urbanisation driving infrastructure expansion, Egypt's out-of-home advertising market is growing at double-digit rates year-on-year. New highways, urban corridors, and mixed-use developments create premium new inventory that puts brands at the heart of Egypt's economic momentum.",
  },
  {
    title: "Unmatched Reach Across Cairo & Alexandria",
    body: "From the Cairo Ring Road and Corniche el-Nil to Alexandria's Mediterranean Corniche and New Cairo's premium retail districts, HORIZON OOH's 9,500+ outdoor advertising locations deliver unparalleled daily reach. A single Ring Road unipole generates over 420,000 vehicle exposures per day — coverage that no digital channel can match.",
  },
  {
    title: "Higher Recall Than Digital Advertising",
    body: "Independent research confirms that outdoor advertising in Egypt drives 78% unaided brand recall at Cairo International Airport and delivers +180% brand recall uplift over digital-only campaigns. Unlike online ads, billboard advertising cannot be skipped, blocked, or scrolled past — it commands attention 24 hours a day, 365 days a year.",
  },
];

function WhyOOHSection() {
  const { homeContent: hc } = useStore();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const eyebrow = isAr ? (hc.marketInsightEyebrowAr || hc.marketInsightEyebrow || 'رؤى السوق') : (hc.marketInsightEyebrow || 'Market Insights');
  const title   = isAr ? (hc.marketInsightTitleAr   || hc.marketInsightTitle   || 'لماذا ينجح الإعلان الخارجي في مصر؟') : (hc.marketInsightTitle   || 'Why Outdoor Advertising Works in Egypt');
  const cols: Array<{title:string;body:string}> = (() => {
    if (isAr && Array.isArray(hc.marketInsightColsAr) && hc.marketInsightColsAr.length > 0) return hc.marketInsightColsAr;
    if (Array.isArray(hc.marketInsightCols) && hc.marketInsightCols.length > 0) return hc.marketInsightCols;
    return DEFAULT_MARKET_INSIGHTS;
  })();

  return (
    <section style={{ background: NAVY, paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase mb-4">{eyebrow}</p>
          <h2 className="text-white font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em] mb-16" style={{ maxWidth: 560 }}>
            {title}
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cols.map((col, idx) => (
            <RevealItem key={idx}>
              <div className="h-[3px] w-10 mb-8" style={{ background: RED }} />
              <h3 className="text-white font-bold text-[18px] leading-[1.4] mb-4">{col.title}</h3>
              <p className="text-white/45 text-[14px] leading-[1.85]">{col.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── BillboardBenefitsSection ─────────────────────────────────────────────
const DEFAULT_BENEFITS = [
  { num: "01", title: "24/7 Visibility", body: "Your brand never goes offline. Billboard advertising in Cairo operates around the clock, delivering continuous impressions to commuters, shoppers, and travellers." },
  { num: "02", title: "Mass Reach", body: "A single Ring Road unipole delivers 420,000+ vehicle exposures daily. No other medium offers this scale of guaranteed reach across Egypt's most high-traffic corridors." },
  { num: "03", title: "Premium Brand Association", body: "Outdoor advertising in Egypt positions your brand alongside major national and international advertisers, building the kind of prestige that digital platforms cannot replicate." },
  { num: "04", title: "Proven ROI", body: "Our billboard advertising campaigns deliver an average 4.1× return on media investment, validated across 500+ campaigns for Egypt's leading brands." },
];

function BillboardBenefitsSection() {
  const { homeContent: hc } = useStore();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const eyebrow  = isAr ? (hc.whyBillboardEyebrowAr || hc.whyBillboardEyebrow || 'لماذا اللوحات الإعلانية') : (hc.whyBillboardEyebrow || 'Why Billboard');
  const title    = isAr ? (hc.whyBillboardTitleAr   || hc.whyBillboardTitle   || 'فوائد الإعلانات الخارجية في مصر') : (hc.whyBillboardTitle   || 'Benefits of Billboard Advertising in Egypt');
  const benefits: Array<{num?:string;title:string;body:string}> = (() => {
    if (isAr && Array.isArray(hc.whyBillboardItemsAr) && hc.whyBillboardItemsAr.length > 0) return hc.whyBillboardItemsAr;
    if (Array.isArray(hc.whyBillboardItems) && hc.whyBillboardItems.length > 0) return hc.whyBillboardItems;
    return DEFAULT_BENEFITS;
  })();

  return (
    <section style={{ background: "#fff", paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-[#0B0F1A]/30 text-[10px] tracking-[0.35em] uppercase mb-4">{eyebrow}</p>
          <h2 className="text-[#0B0F1A] font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em] mb-16" style={{ maxWidth: 560 }}>
            {title}
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {benefits.map((b, i) => (
            <RevealItem key={i}>
              <div className={`pt-8 pb-8 ${i < benefits.length - 1 ? "border-r border-[#0B0F1A]/[0.06]" : ""} pr-8 ${i > 0 ? "pl-8" : ""}`}>
                {b.num && <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: RED }}>{b.num}</p>}
                <div className="h-[1px] w-full bg-[#0B0F1A]/[0.07] mb-6" />
                <h3 className="text-[#0B0F1A] font-bold text-[16px] leading-[1.4] mb-3">{b.title}</h3>
                <p className="text-[#0B0F1A]/50 text-[13px] leading-[1.8]">{b.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── Recently Added Billboards Section ──────────────────────────────────────
function RecentBillboardsSection() {
  const { locations: LOCATIONS } = useStore()
  const { lang, isAr, t } = useLang()
  const ROUTES = makeRoutes(lang)
  const ALL_BILLBOARD_PRODUCTS = LOCATIONS
    .flatMap((loc) => (loc.products || []).map((p: any) => ({ ...p, citySlug: loc.slug ?? '', cityName: loc.city ?? '' })))
    .sort((a: any, b: any) => {
      // Newest first (descending by created_at)
      const da = new Date(a.createdAt || a.created_at || 0).getTime();
      const db = new Date(b.createdAt || b.created_at || 0).getTime();
      return db - da;
    });
  const RECENT_SIX = ALL_BILLBOARD_PRODUCTS.slice(0, 6);

  return (
    <section
      aria-labelledby="recent-billboards-heading"
      style={{ background: "#fff", paddingTop: 120, paddingBottom: 120 }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Section header */}
        <Reveal>
          <div className="flex items-start justify-between mb-16 gap-8 flex-wrap">
            <div>
              <p className="text-[#0B0F1A]/30 text-[10px] tracking-[0.35em] uppercase mb-4">
                {t('home.recentAdded') || 'Recently Added'}
              </p>
              <h2
                id="recent-billboards-heading"
                className="text-[#0B0F1A] font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em]"
                style={{ maxWidth: 640 }}
              >
                {t('home.recentTitleAccent') || 'Recently Added Billboards in Egypt'}
              </h2>
              <p className="text-[#0B0F1A]/50 text-[15px] mt-4 max-w-[480px] leading-relaxed">
                {t('home.recentSubtitle') || 'New outdoor advertising locations across Cairo, Alexandria & nationwide.'}
              </p>
            </div>
            <Link
              to={ROUTES.LOCATIONS}
              className="shrink-0 self-center border border-[#0B0F1A]/20 text-[#0B0F1A] text-[13px] font-semibold tracking-[0.08em] uppercase px-6 py-3 hover:border-[#D90429] hover:text-[#D90429] transition-colors duration-300"
            >
              {t('home.viewAllLocations') || 'View All Locations'}
            </Link>
          </div>
        </Reveal>

        {/* Billboard cards grid */}
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECENT_SIX.map((product) => (
            <RevealItem key={product.id}>
              <Link
                to={productHref(lang, product.citySlug, product.slug)}
                className="group block border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/25 transition-colors duration-300 overflow-hidden relative"
                aria-label={`View billboard: ${product.name} in ${product.cityName}`}
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden" style={{ height: 220, contain: 'layout' }}>
                  <img
                    src={thumb(product.image, 600, 220)}
                    alt={`billboard advertising ${product.cityName} — ${product.name}`}
                    width={600} height={220}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    style={{ height: 220, width: '100%' }}
                  />
                  {/* Bottom-to-top navy gradient overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(11,15,26,0.70) 0%, transparent 60%)",
                    }}
                  />
                  {/* City chip — top left */}
                  <span
                    className="absolute top-3 left-3 text-white text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1"
                    style={{ background: RED }}
                  >
                    {product.cityName}
                  </span>
                  {/* NEW badge removed */}
                </div>

                {/* Card body */}
                <div className="p-6 bg-white relative">
                  {/* Name + arrow row */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-[#0B0F1A] font-bold text-[16px] tracking-[-0.01em] leading-snug flex-1 min-w-0">
                      {isAr && (product as any).nameAr ? (product as any).nameAr : ((product as any).nameEn || product.name)}
                    </h3>
                    {/* Arrow — visible on hover */}
                    <div
                      className="shrink-0 w-8 h-8 flex items-center justify-center mt-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                      style={{ color: RED }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {/* Full address */}
                  <div className="flex items-center gap-1.5 mb-4 min-w-0">
                    <svg className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: '#D90429' }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                    </svg>
                    <p className="text-[#0B0F1A]/50 text-[12px] truncate">
                      {product.location}
                    </p>
                  </div>
                  {/* Code / Size / Format */}
                  <div className="grid grid-cols-3 gap-0 border border-[#0B0F1A]/[0.07]">
                    {[
                      { label: t('spec.code')      || 'Code',   value: (product as any).code || '—' },
                      { label: t('spec.size')      || 'Size',   value: product.size },
                      { label: t('spec.adFormat')  || 'Format', value: (product as any).adFormat || product.type },
                    ].map((stat, i) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center justify-center py-3 px-2"
                        style={{ borderLeft: i > 0 ? '2px solid #D90429' : 'none' }}
                      >
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#0B0F1A]/30 mb-1">{stat.label}</span>
                        <span className="text-[12px] font-bold text-[#0B0F1A] text-center leading-tight">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default function Home() {
  // Render immediately with whatever data is available (demo or live).
  // The store initialises asynchronously; sections re-render once data arrives.
  const { locations: LOCATIONS, services: SERVICES, projects: PROJECTS, trustStats: TRUST_STATS, clientBrands: CLIENT_BRANDS, process: PROCESS, results: RESULTS } = useStore()

  const allBillboards = LOCATIONS.flatMap((l: any) => (l.products||[]).map((p: any) => ({ ...p, citySlug: l.slug })))
  return (
    <>
      <HeroSection />
      <ClientsSection />
      <StatementSection />
      <TrustStrip />
      <RecentBillboardsSection />
      <WhyOOHSection />
      <ServicesSection />
      <FeatureSection />
      <LocationsSection />
      <BillboardBenefitsSection />
      <ProcessSection />
      <ResultsSection />
      <ProjectsSection />
      <LatestBlogsSection />
      <SignatureSection />
      <FinalCTASection />
    </>
  );
}