import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  SERVICES,
  LOCATIONS,
  PROCESS,
  RESULTS,
  TRUST_STATS,
  CLIENT_BRANDS,
  PROJECTS,
} from "@/data";
import { serviceHref, locationHref, projectHref, productHref } from "@/lib/routes";

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
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white"
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
      className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
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
// 1. HERO
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden bg-white"
      style={{ minHeight: "100svh" }}
    >
      {/* Grid overlay lines — editorial touch */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="max-w-[1440px] mx-auto h-full relative px-4 sm:px-8 lg:px-[120px]">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-[#0B0F1A]/[0.025]"
              style={{ left: `calc(${(i / 12) * 100}% + ${(120 / 1440) * 100}%)` }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row" style={{ minHeight: "100svh" }}>
        {/* LEFT — text */}
        <div
          className="flex flex-col justify-end px-4 sm:px-8 lg:pl-[120px] lg:pr-0 pt-[120px] pb-16 lg:pt-[180px] lg:pb-[80px] w-full lg:w-[52%]"
        >
          <motion.div style={{ y: textY }}>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              className="flex items-center gap-3 mb-10"
            >
              <span className="block w-5 h-[1.5px] bg-[#D90429]" />
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#0B0F1A]/35">
                Egypt's Premier OOH Network
              </span>
            </motion.div>

            {/* H1 */}
            <div className="overflow-hidden mb-6">
              {["Outdoor", "Advertising", "Agency."].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease, delay: 0.3 + i * 0.1 }}
                >
                  <h1
                    className="font-black leading-[0.92] tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(52px, 5.5vw, 80px)",
                      color: i === 2 ? "rgba(11,15,26,0.18)" : NAVY,
                    }}
                  >
                    {word}
                  </h1>
                </motion.div>
              ))}
            </div>

            {/* Sub-channels */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="text-[13px] font-semibold tracking-[0.22em] uppercase mb-5"
              style={{ color: "rgba(11,15,26,0.3)" }}
            >
              Billboards&nbsp;·&nbsp;DOOH&nbsp;·&nbsp;Malls&nbsp;·&nbsp;Airports
            </motion.p>

            {/* Statement */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.9 }}
              className="text-[20px] font-medium leading-[1.55] mb-14"
              style={{ color: NAVY, maxWidth: 360 }}
            >
              We make brands impossible to ignore.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 1.05 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
            >
              <RedButton label="Get a Quote" onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }} />
              <OutlineButton label="View Locations" onClick={() => { window.location.hash = '/locations'; window.scrollTo(0,0); }} />
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="mt-20 flex items-center gap-3 hidden lg:flex"
            >
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="block w-[1px] h-8 bg-[#0B0F1A]/15"
                />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: "rgba(11,15,26,0.2)" }}>
                Scroll
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — image (hidden on mobile, visible lg+) */}
        <div className="relative overflow-hidden flex-1 bg-[#0B0F1A] hidden lg:block">
          <motion.div className="absolute inset-0" style={{ y: imgY }}>
            <img
              src="https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1400&q=90&fit=crop"
              alt="Premium outdoor billboard advertising in Egypt"
              className="w-full h-full object-cover"
              style={{ opacity: 0.75, scale: 1.08 }}
            />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(11,15,26,0.5) 0%, rgba(11,15,26,0.1) 50%, transparent 100%)" }}
          />

          {/* Year marker — editorial detail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute top-10 right-10 text-right"
          >
            <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold">Since</p>
            <p className="text-white/25 font-black text-[32px] tracking-[-0.04em] leading-none">2008</p>
          </motion.div>

          {/* Floating KPI card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8, ease }}
            className="absolute bottom-12 left-10 bg-white"
            style={{ padding: "24px 32px" }}
          >
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(11,15,26,0.3)" }}>
              Locations Nationwide
            </p>
            <p className="font-black leading-none tracking-[-0.04em]" style={{ fontSize: 42, color: RED }}>
              9,500<span style={{ fontSize: 28, color: RED }}>+</span>
            </p>
          </motion.div>

          {/* Vertical label */}
          <div
            className="absolute right-8 bottom-16 flex flex-col items-center gap-2"
            style={{ writingMode: "vertical-rl" }}
          >
            <span className="text-white/15 text-[9px] tracking-[0.4em] uppercase font-bold">Premium Inventory</span>
            <span className="block w-12 h-[1px] bg-white/10 mt-1" style={{ writingMode: "horizontal-tb" }} />
          </div>
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
            A thought
          </motion.p>
        </div>

        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease, delay: 0.1 }}
            className="font-black text-white leading-[0.88] tracking-[-0.04em] uppercase"
            style={{ fontSize: "clamp(48px, 7.5vw, 108px)" }}
          >
            "If your brand
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease, delay: 0.18 }}
            className="font-black leading-[0.88] tracking-[-0.04em] uppercase"
            style={{ fontSize: "clamp(48px, 7.5vw, 108px)", color: RED }}
          >
            isn't seen,
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease, delay: 0.26 }}
            className="font-black text-white leading-[0.88] tracking-[-0.04em] uppercase"
            style={{ fontSize: "clamp(48px, 7.5vw, 108px)" }}
          >
            it doesn't exist."
          </motion.h2>
        </div>

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
            <span className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-bold">HORIZON OOH</span>
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
                  {stat.value === "Nationwide" ? (
                    <span>{stat.value}</span>
                  ) : stat.value === "Premium" ? (
                    <span>{stat.value}</span>
                  ) : (
                    <Counter value={9500} suffix="+" />
                  )}
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
                  className="font-black tracking-[-0.04em] leading-none mb-10 transition-colors duration-500 group-hover:text-white/10"
                  style={{ fontSize: 11, color: "rgba(11,15,26,0.12)", letterSpacing: "0.1em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>

                {/* Title */}
                <h3
                  className="font-bold leading-[1.2] tracking-[-0.01em] mb-3 transition-colors duration-500 group-hover:text-white"
                  style={{ fontSize: 20, color: NAVY }}
                >
                  {service.title}
                </h3>

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
          <Eyebrow text="Billboard Advertising" light />

          <Reveal delay={0.1} y={20}>
            <h2
              className="font-black leading-[0.88] tracking-[-0.05em] text-white mb-14"
              style={{ fontSize: "clamp(60px, 6vw, 88px)" }}
            >
              Own<br />the road.
            </h2>
          </Reveal>

          <RevealGroup className="flex flex-col gap-7 mb-14">
            {[
              "Prime roadside locations across Egypt's highest-traffic corridors",
              "Millions of daily impressions — maximum brand visibility",
              "High-impact large-format that stops people in their tracks",
            ].map((bullet) => (
              <RevealItem key={bullet}>
                <div className="flex items-start gap-5">
                  <span
                    className="mt-2 flex-shrink-0 w-[5px] h-[5px]"
                    style={{ background: RED }}
                  />
                  <p className="text-[16px] leading-[1.65]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {bullet}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.45}>
            <RedButton label="Book a Billboard" onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }} />
          </Reveal>
        </div>

        {/* Right — image with parallax */}
        <div className="relative overflow-hidden">
          <motion.div
            className="absolute inset-[-8%]"
            style={{ scale: imgScale }}
          >
            <img
              src="https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=1000&q=90&fit=crop"
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
            <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">Daily Impressions</p>
            <p className="font-black text-white/40 tracking-[-0.04em]" style={{ fontSize: 36 }}>4.2M+</p>
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
          {LOCATIONS.map((loc, i) => (
            <RevealItem key={loc.city}>
              <div
                className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 cursor-pointer"
                style={{ padding: "40px 36px" }}
              >
                <div className="flex items-start justify-between mb-8">
                  <span
                    className="font-black text-[11px] tracking-[0.25em] uppercase transition-colors duration-500 group-hover:text-white/20"
                    style={{ color: RED }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[20px] leading-none opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-2 group-hover:translate-x-0"
                    style={{ color: RED }}
                  >
                    →
                  </span>
                </div>
                <h3
                  className="font-extrabold tracking-[-0.02em] mb-3 transition-colors duration-500 group-hover:text-white"
                  style={{ fontSize: 26, color: NAVY, lineHeight: 1.1 }}
                >
                  {loc.city}
                </h3>
                <p
                  className="text-[13px] leading-[1.6] transition-colors duration-500 group-hover:text-white/35"
                  style={{ color: "rgba(11,15,26,0.35)" }}
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
  return (
    <section
      id="about"
      style={{ background: "#F5F5F6", paddingTop: 96, paddingBottom: 96 }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-14">
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
            <p
              className="text-[11px] font-bold tracking-[0.3em] uppercase text-center"
              style={{ color: "rgba(11,15,26,0.3)" }}
            >
              Trusted by 100+ brands across Egypt
            </p>
            <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
          </div>
        </Reveal>

        <RevealGroup className="flex flex-wrap justify-center items-center gap-x-12 gap-y-5">
          {CLIENT_BRANDS.map((brand) => (
            <RevealItem key={brand}>
              <span
                className="font-bold tracking-[0.15em] uppercase cursor-default transition-colors duration-200 hover:text-[#0B0F1A]/70"
                style={{ fontSize: 14, color: "rgba(11,15,26,0.2)", letterSpacing: "0.12em" }}
              >
                {brand}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
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

  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: NAVY, paddingTop: 160, paddingBottom: 160 }}
    >
      {/* Moving background text — depth effect */}
      <motion.div
        style={{ x }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <p
          className="text-white/[0.03] font-black uppercase whitespace-nowrap"
          style={{ fontSize: "clamp(120px, 18vw, 260px)", letterSpacing: "-0.05em" }}
        >
          HORIZON
        </p>
      </motion.div>

      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(217,4,41,0.05) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 text-center px-8">
        {/* Top rule */}
        <Reveal>
          <div className="flex items-center justify-center gap-5 mb-12">
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span
              className="text-[10px] font-bold tracking-[0.4em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Brand Philosophy
            </span>
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </Reveal>

        {/* Main text */}
        {["WE MAKE BRANDS", "IMPOSSIBLE", "TO IGNORE."].map((line, i) => (
          <div key={line} className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease, delay: i * 0.12 }}
              className="font-black leading-[0.88] tracking-[-0.05em] uppercase"
              style={{
                fontSize: "clamp(48px, 7.5vw, 110px)",
                color: line === "IMPOSSIBLE" ? RED : "white",
              }}
            >
              {line}
            </motion.h2>
          </div>
        ))}

        {/* Bottom rule */}
        <Reveal delay={0.5}>
          <div className="flex items-center justify-center gap-5 mt-12">
            <span className="block w-12 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span
              className="block w-2 h-2"
              style={{ background: RED }}
            />
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
  return (
    <section
      id="contact"
      className="bg-white"
      style={{ paddingTop: 160, paddingBottom: 160 }}
    >
      <div
        className="max-w-[1440px] mx-auto text-center"
      >
        {/* Top eyebrow */}
        <Reveal>
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
            <span
              className="text-[10px] font-bold tracking-[0.35em] uppercase"
              style={{ color: "rgba(11,15,26,0.3)" }}
            >
              Let's Work Together
            </span>
            <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.08}>
          <h2
            className="font-black leading-[0.9] tracking-[-0.04em] mx-auto mb-8"
            style={{
              fontSize: "clamp(44px, 5vw, 72px)",
              color: NAVY,
              maxWidth: 720,
            }}
          >
            Ready to launch<br />
            <span style={{ color: "rgba(11,15,26,0.2)" }}>your campaign?</span>
          </h2>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.16}>
          <p
            className="text-[18px] leading-[1.65] mx-auto mb-14"
            style={{ color: "rgba(11,15,26,0.4)", maxWidth: 380 }}
          >
            Let's put your brand where it gets seen.
          </p>
        </Reveal>

        {/* CTA buttons */}
        <Reveal delay={0.24}>
          <div className="flex items-center justify-center gap-5 mb-16">
            <a
              onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }}
              className="inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white relative group cursor-pointer border-0"
              style={{ background: RED }}
            >
              <span
                className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
                style={{ background: NAVY }}
              />
              <span className="relative z-10">Get a Quote</span>
            </a>
            <a
              onClick={() => { window.location.hash = '/contact'; window.scrollTo(0,0); }}
              className="group relative inline-flex items-center h-[56px] px-11 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer border-0 bg-transparent"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
            >
              <span
                className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out"
                style={{ background: NAVY }}
              />
              <span className="relative z-10 group-hover:text-white transition-colors duration-400">Call Us</span>
            </a>
          </div>
        </Reveal>

        {/* Trust micro-badges */}
        <Reveal delay={0.32}>
          <div className="flex items-center justify-center gap-10 pt-10 border-t border-[#0B0F1A]/[0.06]">
            {[
              { label: "No long-term contracts" },
              { label: "Nationwide coverage" },
              { label: "24-hr response" },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="block w-1 h-1" style={{ background: RED }} />
                <span
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: "rgba(11,15,26,0.3)" }}
                >
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#0B0F1A] font-bold text-[16px] tracking-[-0.01em] mb-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[#0B0F1A]/50 text-[13px] leading-snug mb-4 truncate">
                        {product.location}
                      </p>
                      <div className="flex items-center gap-3 text-[12px] text-[#0B0F1A]/40 mb-3">
                        <span>{product.type}</span>
                        <span className="w-1 h-1 rounded-full bg-[#0B0F1A]/20" />
                        <span>{product.size}</span>
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: RED }}>
                        {product.traffic}
                      </p>
                    </div>
                    {/* Arrow — visible on hover */}
                    <motion.div
                      className="shrink-0 w-8 h-8 flex items-center justify-center"
                      style={{ color: RED }}
                      initial={{ x: -4, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 9h12M9 3l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
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
  return (
    <>
      <HeroSection />
      <StatementSection />
      <TrustStrip />
      <WhyOOHSection />
      <ServicesSection />
      <FeatureSection />
      <LocationsSection />
      <BillboardBenefitsSection />
      <ProcessSection />
      <ResultsSection />
      <RecentBillboardsSection />
      <ClientsSection />
      <ProjectsSection />
      <SignatureSection />
      <FinalCTASection />
    </>
  );
}
