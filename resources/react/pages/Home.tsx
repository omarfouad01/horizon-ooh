import { useRef, useEffect, useState } from "react";
import LeafletMap from "@/components/BillboardMap";
import { useStore, getState } from "@/store/dataStore";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import MultiSelect from "@/components/MultiSelect";
import LogoMarquee from "@/components/LogoMarquee";
// data now from store
import { serviceHref, locationHref, projectHref, productHref, blogHref } from "@/lib/routes";

// Cities, districts and formats are driven by the store (admin-managed)
const getCities  = () => getState().locations.map((l: any) => l.city).sort();
const getFormats = () => getState().adFormats.map((f: any) => f.label).filter(Boolean).sort();
const getBillboards = () => getState().locations.flatMap((l: any) => (l.products||[]).map((p: any) => ({ ...p, citySlug: l.slug })));

// ─── Constants ───────────────────────────────────────────────────────────
const NAVY = "#0B0F1A";
const RED = "#D90429";
const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });


// ─── Easing curve ────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Reveal primitives ───────────────────────────────────────────────────
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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.85, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function RevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } } }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

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
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white active:scale-[0.97] transition-transform cursor-pointer"
      style={{ background: RED }}
    >
      <span
        className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
        style={{ background: NAVY }}
      />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function OutlineButton({
  label,
  onClick,
  light = false,
}: {
  label: string;
  onClick?: () => void;
  light?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.97] cursor-pointer"
      style={{
        border: `1.5px solid ${light ? "rgba(255,255,255,0.25)" : NAVY}`,
        color: light ? "rgba(255,255,255,0.7)" : NAVY,
      }}
    >
      <span
        className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
        style={{ background: light ? "rgba(255,255,255,0.1)" : NAVY }}
      />
      <span className="relative z-10 group-hover:text-white transition-colors duration-400">{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO + MAP + SEARCH — unified first section
// ═══════════════════════════════════════════════════════════════════════════

// ── Filter-select helper ────────────────────────────────────────────────
const ALL_CITIES    = getCities();
const ALL_FORMATS   = getFormats();

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  // ── Search state — navigates to /locations on submit ─────────────
  const navigate   = useNavigate();
  const [cities,    setCities]    = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [formats,   setFormats]   = useState<string[]>([]);

// Cities, districts, and formats from store
  const { locations: _storeLocs, districts: _storeDists, adFormats: _adFormats, homeContent: hc } = useStore()
  const ALL_CITIES  = _storeLocs.map((l: any) => l.city).sort()
  const ALL_FORMATS = _adFormats.map((f: any) => f.label).filter(Boolean).sort()

  const districtOptions = (() => {
    if (cities.length === 0) return _storeDists.map((d: any) => d.name).sort()
    const locIds = _storeLocs
      .filter((l: any) => cities.includes(l.city))
      .map((l: any) => l.id)
    return _storeDists
      .filter((d: any) => locIds.includes(d.locationId))
      .map((d: any) => d.name)
      .sort()
  })()

  const hasFilters = cities.length > 0 || districts.length > 0 || formats.length > 0;
  const reset = () => { setCities([]); setDistricts([]); setFormats([]); };

  // ── Map pin selection (independent of search) ─────────────────────
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
      className="relative overflow-hidden bg-white"
      style={{ minHeight: "100svh" }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="max-w-[1440px] mx-auto h-full relative px-4 sm:px-8 lg:px-[120px]">
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
            <div key={i} className="absolute top-0 bottom-0 border-l border-[#0B0F1A]/[0.02]"
              style={{ left: `calc(${(i/12)*100}% + ${(120/1440)*100}%)` }} />
          ))}
        </div>
      </div>

      <div
        className="relative z-10 w-full flex flex-col lg:flex-row"
        style={{ minHeight: "100svh" }}
      >
        {/* ── LEFT PANEL — brand content + search ──────────────────── */}
        <div
          className="flex flex-col justify-between px-4 sm:px-8 lg:pl-[120px] lg:pr-12
            pt-[100px] pb-10 lg:pt-[140px] lg:pb-12
            w-full lg:w-[44%] xl:w-[42%] flex-shrink-0 bg-white"
          style={{ borderRight: "1px solid rgba(11,15,26,0.06)" }}
        >
          <motion.div style={{ y: textY }} className="flex flex-col gap-0">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.15 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase"
                style={{ color: "rgba(11,15,26,0.3)" }}>
                {hc.heroEyebrow}
              </span>
            </motion.div>

            {/* H1 */}
            <div className="overflow-hidden mb-5">
              {(hc.heroTitleLines || ['Outdoor','Advertising','Agency.']).map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.1 }}
                >
                  <h1
                    className="font-black leading-[0.92] tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(44px, 4.5vw, 72px)",
                      color: i === 2 ? "rgba(11,15,26,0.16)" : NAVY,
                    }}
                  >
                    {word}
                  </h1>
                </motion.div>
              ))}
            </div>

            {/* Sub-channels */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="text-[12px] font-semibold tracking-[0.22em] uppercase mb-4"
              style={{ color: "rgba(11,15,26,0.28)" }}
            >
              {hc.heroChannels}
            </motion.p>

            {/* Statement */}
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.8 }}
              className="text-[18px] font-medium leading-[1.55] mb-8"
              style={{ color: NAVY, maxWidth: 340 }}
            >
              {hc.heroStatement}
            </motion.p>

            {/* CTA row — untouched */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.95 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-10"
            >
              <RedButton  label="Get a Quote"    onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }} />
              <OutlineButton label="View Locations" onClick={() => { window.location.hash = '/locations'; window.scrollTo(0,0); }} />
            </motion.div>

            {/* ── Divider ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-4 h-[1.5px]" style={{ background: RED }} />
                <p className="text-[9px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: "rgba(11,15,26,0.28)" }}>
                  {hc.searchTitle}
                </p>
              </div>

              {/* ── Search form — 3 filters + Search button ─────── */}
              <form onSubmit={handleSearch} className="flex flex-col gap-[1px]"
                style={{ background: "rgba(11,15,26,0.07)" }}>

                {/* City */}
                <MultiSelect
                  label="City" options={ALL_CITIES} selected={cities}
                  onChange={v => { setCities(v); setDistricts([]); }}
                  icon={
                    <svg width="11" height="13" viewBox="0 0 13 15" fill="none">
                      <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                        fill="rgba(11,15,26,0.28)"/>
                    </svg>
                  }
                />

                {/* District */}
                <MultiSelect
                  label="District" options={districtOptions} selected={districts}
                  onChange={setDistricts}
                  icon={
                    <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                      <rect x="0.5" y="5.5" width="6" height="7" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4"/>
                      <rect x="8.5" y="2.5" width="6" height="10" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4"/>
                      <path d="M0 5.5L7.5 0 15 5.5" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  }
                />

                {/* Format */}
                <MultiSelect
                  label="Format" options={ALL_FORMATS} selected={formats}
                  onChange={setFormats}
                  icon={
                    <svg width="13" height="11" viewBox="0 0 15 13" fill="none">
                      <rect x="0.5" y="0.5" width="14" height="12" stroke="rgba(11,15,26,0.28)" strokeWidth="1.4"/>
                      <path d="M3 4h9M3 6.5h6M3 9h4" stroke="rgba(11,15,26,0.28)" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  }
                />

                {/* Search button */}
                <button
                  type="submit"
                  className="w-full h-12 flex items-center justify-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase text-white group relative overflow-hidden"
                  style={{ background: RED, border: "none", cursor: "pointer" }}
                >
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ background: NAVY }} />
                  <svg className="relative z-10" width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M9.5 9.5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="relative z-10">Search Billboards</span>
                </button>
              </form>

              {/* Reset link */}
              {hasFilters && (
                <button onClick={reset}
                  className="mt-2 text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(11,15,26,0.28)", textAlign: "left" }}>
                  ← Clear filters
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL — full-height Leaflet map (all pins, static) ─ */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: "clamp(420px, 55vh, 100svh)" }}>
          {/* Map always shows ALL billboard locations */}
          <LeafletMap
            filtered={getBillboards()}
            allCount={getBillboards().length}
            selected={selectedPin}
            onSelect={setSelectedPin}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          />

          {/* Quick-preview card when pin is clicked */}
          <AnimatePresence>
            {selectedPin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-4 right-4 z-[1000]"
                style={{ width: 268 }}
              >
                <div className="bg-white overflow-hidden"
                  style={{ boxShadow: "0 8px 40px rgba(11,15,26,0.18)" }}>
                  <div className="relative overflow-hidden" style={{ height: 120 }}>
                    <img src={selectedPin.image} alt={selectedPin.name}
                      className="w-full h-full object-cover" style={{ opacity: 0.88 }}/>
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top,rgba(11,15,26,.7) 0%,transparent 55%)" }}/>
                    <span className="absolute bottom-2.5 left-3 text-[9px] font-bold tracking-[0.18em] uppercase text-white/50">
                      {selectedPin.district} · {selectedPin.city}
                    </span>
                    <button onClick={() => setSelectedPin(null)}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center"
                      style={{ background: "rgba(11,15,26,.55)", border: "none", cursor: "pointer" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: "12px 16px 16px" }}>
                    <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: RED }}>
                      {selectedPin.type}
                    </p>
                    <p className="font-extrabold text-[14px] leading-tight mb-1.5" style={{ color: NAVY }}>
                      {selectedPin.name}
                    </p>
                    <p className="text-[11px] mb-3" style={{ color: "rgba(11,15,26,0.4)" }}>
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
              </motion.div>
            )}
          </AnimatePresence>
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.96, 1, 1, 0.96]);
  const { homeContent: hc } = useStore();

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

      <motion.div
        style={{ opacity, scale }}
        className="text-center px-8 relative z-10"
      >
        <div className="overflow-hidden mb-6">
          <motion.p
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease }}
            className="text-white/20 text-[12px] font-bold tracking-[0.4em] uppercase"
          >
            {hc.statementEyebrow}
          </motion.p>
        </div>

        {(hc.statementLines || []).map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease, delay: 0.1 + i * 0.08 }}
              className="font-black leading-[0.88] tracking-[-0.04em] uppercase"
              style={{
                fontSize: "clamp(48px, 7.5vw, 108px)",
                color: i === 1 ? RED : 'white',
              }}
            >
              {line}
            </motion.h2>
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
          className="mt-12 flex justify-center"
          style={{ transformOrigin: "center" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <span className="block w-10 h-[1px] bg-white/15" />
            <span className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-bold">{hc.statementBrand}</span>
            <span className="block w-10 h-[1px] bg-white/15" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TRUST / AUTHORITY STRIP
// ═══════════════════════════════════════════════════════════════════════════
function TrustStrip() {
  const { trustStats: TRUST_STATS } = useStore()
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
                  {stat.label}
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
  return (
    <section id="services" className="bg-white" style={{ paddingTop: 120, paddingBottom: 140 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        {/* Header row */}
        <div className="flex items-end justify-between mb-20 gap-8">
          <div>
            <Eyebrow text="Our Services" />
            <Reveal delay={0.05}>
              <h2
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)", color: NAVY }}
              >
                Every channel.
                <br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>Every market.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="max-w-[260px] text-right">
            <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.4)" }}>
              Full-spectrum outdoor media solutions across Egypt's major urban centres.
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#0B0F1A]/[0.07]">
          {SERVICES.map((service, i) => (
            <RevealItem key={service.id}>
              <div
                className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 cursor-pointer relative overflow-hidden"
                style={{ padding: "40px 36px 40px" }}
                onClick={() => { window.location.hash = serviceHref(service.slug); window.scrollTo(0,0); }}
              >
                {/* Number */}
                <p
                  className="font-black tracking-[-0.04em] leading-none mb-10 text-[rgba(11,15,26,0.12)] group-hover:text-white/10 transition-colors duration-500"
                  style={{ fontSize: 11, letterSpacing: "0.1em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>

                {/* Title */}
                <h3
                  className="font-bold leading-[1.2] tracking-[-0.01em] mb-3 text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                  style={{ fontSize: 20 }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] leading-[1.65] mb-5 text-[rgba(11,15,26,0.45)] group-hover:text-white/75 transition-colors duration-500"
                >
                  {service.description}
                </p>

                {/* Divider line */}
                <div
                  className="w-8 h-[1px] mb-4 transition-all duration-500 group-hover:w-12 group-hover:bg-[#D90429]"
                  style={{ background: "rgba(11,15,26,0.15)" }}
                />

                {/* Hover-reveal arrow */}
                <div className="flex items-center justify-between mt-auto">
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    style={{ color: RED }}
                  >
                    Explore
                  </span>
                  <span
                    className="text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                    style={{ color: RED, lineHeight: 1 }}
                  >
                    →
                  </span>
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
// 5. FEATURE — OWN THE ROAD
// ═══════════════════════════════════════════════════════════════════════════
function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.0]);
  const { homeContent: hc } = useStore();

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
              {hc.featureTitleLine1}<br />{hc.featureTitleLine2}
            </h2>
          </Reveal>

          <RevealGroup className="flex flex-col gap-7 mb-14">
            {(hc.featureBullets || []).map((bullet) => (
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
            <RedButton label={hc.featureButtonText} onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }} />
          </Reveal>
        </div>

        {/* Right — image with parallax */}
        <div className="relative overflow-hidden">
          <motion.div className="absolute inset-[-8%]" style={{ scale: imgScale }}>
            <img
              src={hc.featureImage || 'https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1000&q=90&fit=crop'}
              alt="Large format billboard advertising"
              className="w-full h-full object-cover"
              style={{ opacity: 0.65 }}
            />
          </motion.div>
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
            <Eyebrow text="Coverage" />
            <Reveal delay={0.05}>
              <h2
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)", color: NAVY }}
              >
                From Cairo<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>to the Coast.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <OutlineButton label="View All Locations" onClick={() => { window.location.hash = '/locations'; window.scrollTo(0,0); }} />
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
                  {loc.city}
                </h3>
                <p
                  className="text-[13px] leading-[1.6] text-[rgba(11,15,26,0.45)] group-hover:text-white/70 transition-colors duration-500"
                >
                  {loc.detail}
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
  return (
    <section style={{ background: NAVY, padding: "120px 0 140px" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <div className="flex items-end justify-between mb-20">
          <div>
            <Eyebrow text="How We Work" light />
            <Reveal delay={0.05}>
              <h2
                className="font-black text-white leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(44px, 4.5vw, 64px)" }}
              >
                Campaign in<br />
                <span style={{ color: "rgba(255,255,255,0.2)" }}>4 steps.</span>
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
                  {step.label}
                </h3>

                {/* Rule */}
                <div className="w-8 h-[1px]" style={{ background: RED }} />

                {/* Description */}
                <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {step.description}
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

        {/* Stats */}
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-3">
          {RESULTS.map((r, i) => (
            <RevealItem key={r.label}>
              <div
                className="flex flex-col py-16 px-10"
                style={{
                  borderRight: i < 2 ? "1px solid rgba(11,15,26,0.07)" : "none",
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
                  {r.sublabel}
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
// 9. CLIENTS / TRUST
// ═══════════════════════════════════════════════════════════════════════════
function ClientsSection() {
  const { clientBrands } = useStore()
  return (
    <section id="about" style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-center" style={{ color: "rgba(11,15,26,0.3)" }}>
              Trusted by 100+ brands across Egypt
            </p>
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const { homeContent: hc } = useStore();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: NAVY, paddingTop: 160, paddingBottom: 160 }}
    >
      <motion.div style={{ x }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
        <p className="text-white/[0.03] font-black uppercase whitespace-nowrap"
          style={{ fontSize: "clamp(120px, 18vw, 260px)", letterSpacing: "-0.05em" }}>
          HORIZON
        </p>
      </motion.div>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(217,4,41,0.05) 0%, transparent 70%)` }}/>
      <div className="relative z-10 text-center px-8">
        <Reveal>
          <div className="flex items-center justify-center gap-5 mb-12">
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
              {hc.signatureEyebrow}
            </span>
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </Reveal>
        {(hc.signatureLines || []).map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease, delay: i * 0.12 }}
              className="font-black leading-[0.88] tracking-[-0.05em] uppercase"
              style={{ fontSize: "clamp(48px, 7.5vw, 110px)", color: i === 1 ? RED : "white" }}
            >
              {line}
            </motion.h2>
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
            {hc.finalCtaTitleLine1}<br />
            <span style={{ color: "rgba(11,15,26,0.2)" }}>{hc.finalCtaTitleLine2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="text-[18px] leading-[1.65] mx-auto mb-14"
            style={{ color: "rgba(11,15,26,0.4)", maxWidth: 380 }}>
            {hc.finalCtaSubtext}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="flex items-center justify-center gap-5 mb-16">
            <a onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }}
              className="inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white relative group cursor-pointer border-0"
              style={{ background: RED }}>
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out" style={{ background: NAVY }}/>
              <span className="relative z-10">{hc.finalCtaPrimaryText}</span>
            </a>
            <a onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }}
              className="group relative inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer border-0 bg-transparent"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}>
              <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out" style={{ background: NAVY }}/>
              <span className="relative z-10 group-hover:text-white transition-colors duration-400">{hc.finalCtaSecondaryText}</span>
            </a>
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
  const featured = PROJECTS.find((p) => p.featured)!;
  const others   = PROJECTS.filter((p) => !p.featured).slice(0, 2);

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
              to="/projects"
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
              to={projectHref(featured.slug)}
              className="group relative block overflow-hidden"
              style={{ textDecoration: "none", height: 500 }}
            >
              <img
                src={featured.coverImage}
                alt={`${featured.title} — outdoor advertising case study`}
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
                  to={projectHref(p.slug)}
                  className="group relative block overflow-hidden"
                  style={{ textDecoration: "none", height: "100%", minHeight: 230 }}
                >
                  <img
                    src={p.coverImage}
                    alt={`${p.title} — outdoor advertising`}
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
              to="/blog"
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
                to={blogHref(post.slug)}
                className="group bg-white flex flex-col hover:bg-[#0B0F1A] transition-colors duration-500 h-full"
                style={{ textDecoration: "none" }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 220 }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ opacity: 0.85 }}
                    loading="lazy"
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
function WhyOOHSection() {
  return (
    <section style={{ background: NAVY, paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase mb-4">Market Insights</p>
          <h2 className="text-white font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em] mb-16" style={{ maxWidth: 560 }}>
            Why Outdoor Advertising Works in Egypt
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
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
          ].map((col) => (
            <RevealItem key={col.title}>
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
function BillboardBenefitsSection() {
  const benefits = [
    { num: "01", title: "24/7 Visibility", body: "Your brand never goes offline. Billboard advertising in Cairo operates around the clock, delivering continuous impressions to commuters, shoppers, and travellers." },
    { num: "02", title: "Mass Reach", body: "A single Ring Road unipole delivers 420,000+ vehicle exposures daily. No other medium offers this scale of guaranteed reach across Egypt's most high-traffic corridors." },
    { num: "03", title: "Premium Brand Association", body: "Outdoor advertising in Egypt positions your brand alongside major national and international advertisers, building the kind of prestige that digital platforms cannot replicate." },
    { num: "04", title: "Proven ROI", body: "Our billboard advertising campaigns deliver an average 4.1× return on media investment, validated across 500+ campaigns for Egypt's leading brands." },
  ];
  return (
    <section style={{ background: "#fff", paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-[#0B0F1A]/30 text-[10px] tracking-[0.35em] uppercase mb-4">Why Billboard</p>
          <h2 className="text-[#0B0F1A] font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em] mb-16" style={{ maxWidth: 560 }}>
            Benefits of Billboard Advertising in Egypt
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {benefits.map((b, i) => (
            <RevealItem key={b.num}>
              <div className={`pt-8 pb-8 ${i < benefits.length - 1 ? "border-r border-[#0B0F1A]/[0.06]" : ""} pr-8 ${i > 0 ? "pl-8" : ""}`}>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: RED }}>{b.num}</p>
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
  const ALL_BILLBOARD_PRODUCTS = LOCATIONS.flatMap((loc) =>
    loc.products.map((p) => ({ ...p, citySlug: loc.slug, cityName: loc.city }))
  );
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
                Recently Added
              </p>
              <h2
                id="recent-billboards-heading"
                className="text-[#0B0F1A] font-black text-[clamp(28px,3.5vw,48px)] tracking-[-0.02em]"
                style={{ maxWidth: 640 }}
              >
                Recently Added Billboards in Egypt
              </h2>
              <p className="text-[#0B0F1A]/50 text-[15px] mt-4 max-w-[480px] leading-relaxed">
                New outdoor advertising locations across Cairo, Alexandria &amp; nationwide.
              </p>
            </div>
            <Link
              to="/locations"
              className="shrink-0 self-center border border-[#0B0F1A]/20 text-[#0B0F1A] text-[13px] font-semibold tracking-[0.08em] uppercase px-6 py-3 hover:border-[#D90429] hover:text-[#D90429] transition-colors duration-300"
            >
              View All Locations
            </Link>
          </div>
        </Reveal>

        {/* Billboard cards grid */}
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECENT_SIX.map((product) => (
            <RevealItem key={product.id}>
              <Link
                to={productHref(product.citySlug, product.slug)}
                className="group block border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/25 transition-colors duration-300 overflow-hidden relative"
                aria-label={`View billboard: ${product.name} in ${product.cityName}`}
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden" style={{ height: 220 }}>
                  <motion.img
                    src={product.image}
                    alt={`billboard advertising ${product.cityName} — ${product.name}`}
                    className="w-full h-full object-cover"
                    style={{ transformOrigin: "center" }}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.6, ease }}
                    loading="lazy"
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
                  {/* NEW badge — top right */}
                  <span className="absolute top-3 right-3 text-[#0B0F1A] bg-white text-[10px] font-bold tracking-[0.25em] uppercase px-2 py-1">
                    NEW
                  </span>
                </div>

                {/* Card body */}
                <div className="p-6 bg-white relative">
                  {/* Name + arrow row */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-[#0B0F1A] font-bold text-[16px] tracking-[-0.01em] leading-snug flex-1 min-w-0">
                      {(product as any).nameEn || product.name}
                    </h3>
                    {/* Arrow — visible on hover */}
                    <motion.div
                      className="shrink-0 w-8 h-8 flex items-center justify-center mt-0.5"
                      style={{ color: RED }}
                      initial={{ x: -4, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Full address */}
                  <div className="flex items-start gap-1.5 mb-4">
                    <svg className="shrink-0 mt-[1px]" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: '#D90429' }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
                    </svg>
                    <p className="text-[#0B0F1A]/50 text-[12px] leading-snug">
                      {product.location}
                    </p>
                  </div>
                  {/* Code / Size / Format */}
                  <div className="grid grid-cols-3 gap-0 border border-[#0B0F1A]/[0.07]">
                    {[
                      { label: "Code",   value: (product as any).code || "—" },
                      { label: "Size",   value: product.size },
                      { label: "Format", value: product.type },
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
  const { locations: LOCATIONS, services: SERVICES, projects: PROJECTS, trustStats: TRUST_STATS, clientBrands: CLIENT_BRANDS, process: PROCESS, results: RESULTS, loaded } = useStore()

  // Wait for store to be ready before rendering data-dependent sections
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #D90429', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#888', fontSize: 14, fontFamily: 'sans-serif' }}>Loading…</p>
        </div>
      </div>
    );
  }

  const allBillboards = LOCATIONS.flatMap((l: any) => (l.products||[]).map((p: any) => ({ ...p, citySlug: l.slug })))
  return (
    <>
      <HeroSection />
      <StatementSection />
      <TrustStrip />
      <RecentBillboardsSection />
      <ClientsSection />
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
