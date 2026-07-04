// ─── HORIZON OOH — Shared UI Primitives ──────────────────────────────────
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRoutes, langPath, RED, NAVY } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

// ─── Reveal / animation primitives ───────────────────────────────────────
// Each element gets its own IntersectionObserver with a generous rootMargin
// (positive = triggers BEFORE element enters viewport) to prevent the race
// condition where cards stay at opacity:0 because the observer fires too late.
function useRevealState(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: '120px' }
    );
    io.observe(el);
    // Fallback: if already in viewport when mounted, trigger immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      setTimeout(() => setVisible(true), delay * 1000);
    }
    return () => io.disconnect();
  }, [delay]);
  return { ref, visible };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const { ref, visible } = useRevealState(delay);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// RevealGroup is now a plain wrapper — no observer needed since
// RevealItem handles its own visibility independently
export function RevealGroup({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// RevealItem has its own IntersectionObserver — independent of parent
export function RevealItem({
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
    const delayMs = index * 90;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), delayMs);
          io.disconnect();
        }
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    // Fallback: if already visible when mounted
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 120) {
      setTimeout(() => setVisible(true), delayMs);
    }
    return () => io.disconnect();
  }, [index]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
        height: '100%',
      }}
    >
      <div ref={ref} style={{ height: '100%' }}>{children}</div>
    </div>
  );
}

// ─── Eyebrow label ────────────────────────────────────────────────────────
export function Eyebrow({ text, light = false, center = false }: { text: string; light?: boolean; center?: boolean }) {
  return (
    <Reveal>
      <div className={`flex items-center gap-3 mb-8 ${center ? "justify-center" : ""}`}>
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

// ─── Page Hero (inner pages) ──────────────────────────────────────────────
export function PageHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  dark?: boolean;
}) {
  const bg = dark ? NAVY : "#F5F5F6";
  const textColor = dark ? "white" : NAVY;
  const mutedColor = dark ? "rgba(255,255,255,0.35)" : "rgba(11,15,26,0.38)";

  return (
    <section
      style={{
        background: bg,
        paddingTop: 160,
        paddingBottom: 100,
      }}
    >
<div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Eyebrow text={eyebrow} light={dark} />
        <Reveal delay={0.05}>
          <h1
            className="font-black leading-[0.9] tracking-[-0.04em]"
            style={{
              fontSize: "clamp(48px, 6vw, 88px)",
              color: textColor,
              maxWidth: 900,
            }}
          >
            {title}
            {titleAccent && (
              <>
                <br />
                <span style={{ color: dark ? "rgba(255,255,255,0.2)" : "rgba(11,15,26,0.2)" }}>{titleAccent}</span>
              </>
            )}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.12}>
            <p
              className="text-[18px] leading-[1.65] mt-6"
              style={{ color: mutedColor, maxWidth: 560 }}
            >
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────
export function SectionHeading({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  light = false,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      {eyebrow && <Eyebrow text={eyebrow} light={light} center={center} />}
      <Reveal delay={0.04}>
        <h2
          className="font-black leading-[0.9] tracking-[-0.04em]"
          style={{
            fontSize: "clamp(36px, 4vw, 56px)",
            color: light ? "white" : NAVY,
          }}
        >
          {title}
          {titleAccent && (
            <>
              <br />
              <span style={{ color: light ? "rgba(255,255,255,0.2)" : "rgba(11,15,26,0.2)" }}>
                {titleAccent}
              </span>
            </>
          )}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className="mt-5 text-[16px] leading-[1.7]"
            style={{
              color: light ? "rgba(255,255,255,0.4)" : "rgba(11,15,26,0.4)",
              maxWidth: center ? 520 : 480,
              margin: center ? "20px auto 0" : "20px 0 0",
            }}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

// ─── Red primary button ───────────────────────────────────────────────────
export function RedBtn({
  label,
  onClick,
  href,
  size = "md",
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const heights: Record<string, string> = { sm: "40px", md: "52px", lg: "56px" };
  const pads: Record<string, string> = { sm: "24px", md: "36px", lg: "44px" };
  const styles = {
    height: heights[size],
    padding: `0 ${pads[size]}`,
    background: RED,
    color: "white",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.2em",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    textTransform: "uppercase" as const,
    position: "relative" as const,
    overflow: "hidden",
    cursor: "pointer",
    border: "none",
  };
  if (href) {
    return (
      <Link to={href} style={styles} className="group active:scale-[0.97] transition-transform">
        <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: NAVY }} />
        <span className="relative z-10">{label}</span>
      </Link>
    );
  }
  return (
    <button onClick={onClick} style={styles} className="group active:scale-[0.97] transition-transform">
      <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: NAVY }} />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

// ─── Outline button ───────────────────────────────────────────────────────
export function OutlineBtn({
  label,
  onClick,
  href,
  light = false,
  size = "md",
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  light?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const heights: Record<string, string> = { sm: "40px", md: "52px", lg: "56px" };
  const pads: Record<string, string> = { sm: "24px", md: "36px", lg: "44px" };
  const styles = {
    height: heights[size],
    padding: `0 ${pads[size]}`,
    border: `1.5px solid ${light ? "rgba(255,255,255,0.25)" : NAVY}`,
    color: light ? "rgba(255,255,255,0.7)" : NAVY,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.2em",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    textTransform: "uppercase" as const,
    position: "relative" as const,
    overflow: "hidden",
    cursor: "pointer",
    background: "transparent",
  };
  if (href) {
    return (
      <Link to={href} style={styles} className="group active:scale-[0.97] transition-transform">
        <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: light ? "rgba(255,255,255,0.12)" : NAVY }} />
        <span className="relative z-10 group-hover:text-white transition-colors duration-300">{label}</span>
      </Link>
    );
  }
  return (
    <button onClick={onClick} style={styles} className="group active:scale-[0.97] transition-transform">
      <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: light ? "rgba(255,255,255,0.12)" : NAVY }} />
      <span className="relative z-10 group-hover:text-white transition-colors duration-300">{label}</span>
    </button>
  );
}

// ─── Page CTA Banner ─────────────────────────────────────────────────────
export function CTABanner({
  title = "Ready to launch your campaign?",
  subtitle = "Let's put your brand where it gets seen.",
  buttonLabel = "Get a Quote",
  dark = true,
}: {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  dark?: boolean;
}) {
  const { lang } = useLang();
  return (
    <section
      style={{
        background: dark ? NAVY : "#F5F5F6",
        paddingTop: 100,
        paddingBottom: 100,
      }}
    >
      <div
        className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-10 px-4 sm:px-8 lg:px-[120px]"
      >
        <div>
          <Reveal>
            <h2
              className="font-black leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: dark ? "white" : NAVY }}
            >
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p
              className="mt-4 text-[16px] leading-relaxed"
              style={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(11,15,26,0.4)" }}
            >
              {subtitle}
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="flex gap-4">
            <RedBtn label={buttonLabel} href={langPath(lang, '/contact')} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  // BreadcrumbList JSON-LD for rich search results
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.label,
      ...(item.href ? { "item": `https://horizonooh.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]" style={{ paddingTop: 16 }}>
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <span key={item.label} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: "rgba(11,15,26,0.25)", fontSize: 12 }}>›</span>}
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors duration-150 hover:text-[#D90429] cursor-pointer"
                  style={{ color: "rgba(11,15,26,0.35)" }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: "rgba(11,15,26,0.6)" }}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
