import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { PROJECTS, type ProjectCategory } from "@/data";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow } from "@/components/UI";
import { projectHref, RED, NAVY, ease } from "@/lib/routes";

// ─── Filter categories ─────────────────────────────────────────────────────
const FILTERS: { label: string; value: "All" | ProjectCategory }[] = [
  { label: "All Projects", value: "All" },
  { label: "Billboards",   value: "Billboard" },
  { label: "DOOH",         value: "DOOH" },
  { label: "Malls",        value: "Mall" },
  { label: "Airports",     value: "Airport" },
];

// ─── Category chip colours ──────────────────────────────────────────────
const CAT_COLORS: Record<ProjectCategory, string> = {
  Billboard: "#D90429",
  DOOH:      "#0B0F1A",
  Mall:      "#4A4E69",
  Airport:   "#22577A",
};

// ─── Project card ──────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
      }}
    >
      <Link
        to={projectHref(project.slug)}
        className="group block overflow-hidden bg-white border border-[#0B0F1A]/[0.07] hover:border-[#D90429]/20 transition-all duration-500"
        style={{ textDecoration: "none" }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 300 }}>
          <img
            src={project.coverImage}
            alt={`${project.title} — outdoor advertising ${project.location}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ opacity: 0.88 }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
            style={{ background: "linear-gradient(to top, rgba(11,15,26,0.72) 0%, rgba(11,15,26,0.1) 55%, transparent 100%)" }}
          />

          {/* Category badge */}
          <div className="absolute top-5 left-5">
            <span
              className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 text-white"
              style={{ background: CAT_COLORS[project.category] }}
            >
              {project.category}
            </span>
          </div>

          {/* Year */}
          <div className="absolute top-5 right-5">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50">{project.year}</span>
          </div>

          {/* Bottom image overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white font-black tracking-[-0.02em] leading-tight opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0" style={{ fontSize: 13 }}>
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "28px 28px 32px" }}>
          {/* Index + location row */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-[11px] tracking-[0.25em] uppercase" style={{ color: RED }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
              {project.location}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-extrabold leading-[1.15] tracking-[-0.02em] mb-3 transition-colors duration-400 group-hover:text-[#D90429]"
            style={{ fontSize: 20, color: NAVY }}
          >
            {project.title}
          </h3>

          {/* Client */}
          <p className="text-[13px] font-medium mb-6" style={{ color: "rgba(11,15,26,0.4)" }}>
            {project.client} · {project.duration}
          </p>

          {/* Key result preview */}
          <div className="flex items-center justify-between pt-5 border-t border-[#0B0F1A]/[0.07]">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>
                {project.results[0].metric}
              </p>
              <p className="font-black tracking-[-0.03em]" style={{ fontSize: 22, color: RED }}>
                {project.results[0].value}
              </p>
            </div>
            <span
              className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
              style={{ color: RED }}
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Featured project (full-width) ────────────────────────────────────────
function FeaturedProject() {
  const featured = PROJECTS.find((p) => p.featured)!;
  return (
    <section className="bg-white" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
            Featured Campaign
          </p>
        </Reveal>

        <Link
          to={projectHref(featured.slug)}
          className="group relative block overflow-hidden"
          style={{ textDecoration: "none", height: 560 }}
        >
          {/* Full-bleed image */}
          <img
            src={featured.heroImage}
            alt={`${featured.title} — outdoor advertising case study Egypt`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            style={{ opacity: 0.8 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(11,15,26,0.88) 0%, rgba(11,15,26,0.5) 50%, rgba(11,15,26,0.15) 100%)" }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "60px 80px" }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 text-white" style={{ background: RED }}>
                {featured.category}
              </span>
              <span className="text-white/35 text-[10px] font-semibold tracking-[0.2em]">
                {featured.year} · {featured.duration}
              </span>
            </div>

            <h2
              className="font-black text-white leading-[0.9] tracking-[-0.04em] mb-5"
              style={{ fontSize: "clamp(36px, 4.5vw, 64px)", maxWidth: 680 }}
            >
              {featured.title}
            </h2>

            <p className="text-white/55 text-[17px] leading-[1.65] mb-10" style={{ maxWidth: 520 }}>
              {featured.tagline}
            </p>

            {/* Results preview row */}
            <div className="flex items-center gap-12 mb-10">
              {featured.results.slice(0, 3).map((r) => (
                <div key={r.metric}>
                  <p className="font-black text-white/90 tracking-[-0.04em]" style={{ fontSize: 28 }}>{r.value}</p>
                  <p className="text-white/35 text-[10px] font-semibold tracking-[0.2em] uppercase mt-1">{r.metric}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-[12px] tracking-[0.2em] uppercase">View Case Study</span>
              <span
                className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                style={{ color: RED }}
              >
                →
              </span>
            </div>
          </div>

          {/* Client badge */}
          <div className="absolute top-10 right-10">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 border border-white/15">
              <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold mb-1">Client</p>
              <p className="text-white font-bold text-[14px] tracking-[-0.01em]">{featured.client}</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

// ─── Why it matters (SEO) ─────────────────────────────────────────────────
function WhyItMatters() {
  return (
    <section style={{ background: "#F5F5F6", paddingTop: 100, paddingBottom: 100 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-4">
            <Eyebrow text="Why It Works" />
            <Reveal delay={0.04}>
              <h2
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}
              >
                Why outdoor advertising works<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>in Egypt.</span>
              </h2>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.85] mb-6" style={{ color: "rgba(11,15,26,0.5)" }}>
                Egypt's outdoor advertising market is among the fastest-growing in the MENA region — driven by rapid urbanisation, a young and mobile population, and a commuter culture that places millions of consumers in front of billboards, DOOH screens, and mall formats every single day. Unlike digital advertising, outdoor advertising in Egypt cannot be skipped, blocked, or scrolled past.
              </p>
              <p className="text-[17px] leading-[1.85] mb-6" style={{ color: "rgba(11,15,26,0.5)" }}>
                Our billboard campaigns in Cairo, DOOH campaigns across New Cairo and Sheikh Zayed, and airport advertising at Cairo International consistently outperform digital channel benchmarks on brand recall, purchase intent, and consumer trust. Across 100+ campaigns delivered in 2024–2025, the average brand recall lift was <strong style={{ color: NAVY }}>+178%</strong> — and the average campaign ROI was <strong style={{ color: NAVY }}>4.1×</strong>.
              </p>
            </Reveal>

            <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {[
                { value: "+178%", label: "Avg. brand recall lift", sub: "Across all 2025 campaigns" },
                { value: "4.1×",  label: "Average campaign ROI",   sub: "vs. media investment" },
                { value: "100+",  label: "Campaigns delivered",    sub: "In 2024–2025" },
              ].map((stat, i) => (
                <RevealItem key={stat.label}>
                  <div className="bg-white p-8 border border-[#0B0F1A]/[0.07]">
                    <p className="font-black leading-none tracking-[-0.04em] mb-3" style={{ fontSize: 40, color: RED }}>{stat.value}</p>
                    <p className="font-bold text-[14px] mb-1" style={{ color: NAVY }}>{stat.label}</p>
                    <p className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>{stat.sub}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Projects listing page ────────────────────────────────────────────────
export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<"All" | ProjectCategory>("All");

  const filtered = activeFilter === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeFilter);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: false, margin: "-40px" });

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ background: NAVY, paddingTop: 120, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Eyebrow text="Case Studies" light />

          {/* H1 — SEO-optimised */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, ease, delay: 0.1 }}
              className="font-black text-white leading-[0.88] tracking-[-0.05em]"
              style={{ fontSize: "clamp(52px, 7vw, 96px)" }}
            >
              Outdoor Advertising
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.95, ease, delay: 0.18 }}
              className="font-black leading-[0.88] tracking-[-0.05em]"
              style={{ fontSize: "clamp(52px, 7vw, 96px)", color: "rgba(255,255,255,0.18)" }}
            >
              Projects in Egypt.
            </motion.h1>
          </div>

          <Reveal delay={0.35}>
            <p className="mt-8 text-[18px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 580 }}>
              Billboard, DOOH, Mall &amp; Airport campaigns — delivered across Egypt's most valuable media markets. Real results, proven strategies.
            </p>
          </Reveal>

          {/* Stats strip */}
          <Reveal delay={0.45}>
            <div className="flex items-center gap-10 mt-14 pt-10 border-t border-white/[0.07]">
              {[
                { value: "100+", label: "Campaigns" },
                { value: "50+",  label: "Brand Partners" },
                { value: "5",    label: "Cities" },
                { value: "4",    label: "Media Formats" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-4">
                  {i > 0 && <span className="w-px h-8 bg-white/10 block" />}
                  <div>
                    <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 28 }}>{s.value}</p>
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured project ──────────────────────────────────────────── */}
      <div style={{ background: "white", paddingTop: 80 }}>
        <FeaturedProject />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <section className="bg-white" style={{ paddingBottom: 16 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <div className="flex items-center gap-0 border-b border-[#0B0F1A]/[0.07] overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className="relative pb-4 pr-8 text-[12px] font-bold tracking-[0.18em] uppercase transition-colors duration-200"
                  style={{
                    color: activeFilter === f.value ? NAVY : "rgba(11,15,26,0.35)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                  {/* active underline */}
                  <span
                    className="absolute bottom-0 left-0 h-[2px] transition-all duration-300"
                    style={{
                      width: activeFilter === f.value ? "calc(100% - 32px)" : "0%",
                      background: RED,
                    }}
                  />
                </button>
              ))}
              <div className="ml-auto pb-4">
                <span className="text-[11px] font-semibold tracking-[0.15em]" style={{ color: "rgba(11,15,26,0.25)" }}>
                  {filtered.length} project{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Project grid ──────────────────────────────────────────────── */}
      <section className="bg-white" style={{ paddingTop: 48, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <motion.div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
            key={activeFilter} // re-animate on filter change
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <Reveal>
              <div className="text-center py-24">
                <p className="text-[17px]" style={{ color: "rgba(11,15,26,0.3)" }}>
                  No projects in this category yet.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Why outdoor advertising works ────────────────────────────── */}
      <WhyItMatters />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <CTABanner
        title="Ready to launch your campaign?"
        subtitle="Talk to our team and we'll build a data-driven outdoor advertising strategy around your brand."
        buttonLabel="Get a Quote"
      />
    </>
  );
}
