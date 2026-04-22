import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useStore } from "@/store/dataStore";
import { type ProjectCategory } from "@/data";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow } from "@/components/UI";
import { projectHref, RED, NAVY, ease } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

const FILTERS: { label: string; value: "All" | ProjectCategory }[] = [
  { label: "All Projects", value: "All" },
  { label: "Billboards", value: "Billboard" },
  { label: "DOOH", value: "DOOH" },
  { label: "Malls", value: "Mall" },
  { label: "Airports", value: "Airport" },
];

const CAT_COLORS: Record<ProjectCategory, string> = {
  Billboard: "#D90429",
  DOOH: "#0B0F1A",
  Mall: "#4A4E69",
  Airport: "#22577A",
};

type ClientGroup = {
  name: string;
  logo: string;
  projects: any[];
  categories: ProjectCategory[];
  latestYear: string;
  coverImage: string;
  blurb: string;
};

function buildClientBlurb(projects: any[]) {
  const cities = Array.from(new Set(projects.map((p) => p.city).filter(Boolean)));
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  return `${projects.length} campaign${projects.length > 1 ? "s" : ""} delivered${cities.length ? ` across ${cities.join(", ")}` : ""}${categories.length ? ` · ${categories.join(" / ")}` : ""}.`;
}

function ClientCard({ client, index, active, onClick }: { client: ClientGroup; index: number; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
      }}
      className="group block overflow-hidden bg-white border text-left transition-all duration-500 cursor-pointer"
      style={{
        borderColor: active ? `${RED}55` : "rgba(11,15,26,0.07)",
        boxShadow: active ? "0 20px 50px rgba(217,4,41,0.08)" : "none",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <img
          src={client.coverImage}
          alt={`${client.name} client card`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ opacity: 0.88 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(11,15,26,0.78) 0%, rgba(11,15,26,0.16) 60%, transparent 100%)" }}
        />

        <div className="absolute top-5 left-5 flex flex-wrap gap-2">
          {client.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 text-white" style={{ background: CAT_COLORS[cat] }}>
              {cat}
            </span>
          ))}
        </div>

        <div className="absolute top-5 right-5">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">{client.latestYear}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          {client.logo ? (
            <div className="mb-3">
              <img src={client.logo} alt={client.name} style={{ height: 28, width: 'auto', objectFit: 'contain', maxWidth: 120, filter: 'brightness(10)', opacity: 0.85 }}/>
            </div>
          ) : (
            <p className="text-white/45 text-[10px] font-bold tracking-[0.28em] uppercase mb-2">Client</p>
          )}
          <h3 className="text-white font-black tracking-[-0.02em] leading-tight" style={{ fontSize: 24 }}>{client.name}</h3>
        </div>
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-black text-[11px] tracking-[0.25em] uppercase" style={{ color: RED }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
            {client.projects.length} project{client.projects.length > 1 ? "s" : ""}
          </span>
        </div>

        <p className="text-[14px] leading-[1.7] mb-6" style={{ color: "rgba(11,15,26,0.48)" }}>
          {client.blurb}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-[#0B0F1A]/[0.07]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>
              Latest campaign
            </p>
            <p className="font-black tracking-[-0.03em]" style={{ fontSize: 18, color: NAVY }}>
              {client.projects[0]?.title}
            </p>
          </div>
          <span className="text-xl transition-all duration-300" style={{ color: active ? RED : "rgba(11,15,26,0.2)" }}>
            →
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  const { isAr, t } = useLang();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
      }}
    >
      <Link
        to={projectHref(project.slug)}
        className="group block overflow-hidden bg-white border border-[#0B0F1A]/[0.07] hover:border-[#D90429]/20 transition-all duration-500 cursor-pointer"
        style={{ textDecoration: "none" }}
      >
        <div className="relative overflow-hidden" style={{ height: 280 }}>
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

          <div className="absolute top-5 left-5">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 text-white" style={{ background: CAT_COLORS[project.category] }}>
              {project.category}
            </span>
          </div>

          <div className="absolute top-5 right-5">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50">{project.year}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white font-black tracking-[-0.02em] leading-tight opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0" style={{ fontSize: 13 }}>
              {project.tagline}
            </p>
          </div>
        </div>

        <div style={{ padding: "28px 28px 32px" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-[11px] tracking-[0.25em] uppercase" style={{ color: RED }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
              {project.location}
            </span>
          </div>

          <h3 className="font-extrabold leading-[1.15] tracking-[-0.02em] mb-3 transition-colors duration-400 group-hover:text-[#D90429]" style={{ fontSize: 20, color: NAVY }}>
            {isAr && project.titleAr ? project.titleAr : project.title}
          </h3>

          <p className="text-[13px] font-medium mb-6" style={{ color: "rgba(11,15,26,0.4)" }}>
            {project.client} · {project.duration}
          </p>

          <div className="flex items-center justify-between pt-5 border-t border-[#0B0F1A]/[0.07]">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>
                {project.results[0]?.metric || "Campaign"}
              </p>
              <p className="font-black tracking-[-0.03em]" style={{ fontSize: 22, color: RED }}>
                {project.results[0]?.value || project.year}
              </p>
            </div>
            <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color: RED }}>
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedProject() {
  const { projects: PROJECTS } = useStore();
  const featured = PROJECTS.find((p) => p.featured) || PROJECTS[0];
  if (!featured) return null;

  return (
    <section className="bg-white" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
            Featured Campaign
          </p>
        </Reveal>

        <Link to={projectHref(featured.slug)} className="group relative block overflow-hidden" style={{ textDecoration: "none", height: 560 }}>
          <img src={featured.heroImage} alt={`${featured.title} — outdoor advertising case study Egypt`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" style={{ opacity: 0.8 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,26,0.88) 0%, rgba(11,15,26,0.5) 50%, rgba(11,15,26,0.15) 100%)" }} />

          <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "60px 80px" }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 text-white" style={{ background: RED }}>
                {featured.category}
              </span>
              <span className="text-white/35 text-[10px] font-semibold tracking-[0.2em]">
                {featured.year} · {featured.duration}
              </span>
            </div>

            <h2 className="font-black text-white leading-[0.9] tracking-[-0.04em] mb-5" style={{ fontSize: "clamp(36px, 4.5vw, 64px)", maxWidth: 680 }}>
              {featured.title}
            </h2>

            <p className="text-white/55 text-[17px] leading-[1.65] mb-10" style={{ maxWidth: 520 }}>
              {featured.tagline}
            </p>

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
              <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color: RED }}>
                →
              </span>
            </div>
          </div>

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

function WhyItMatters({ pc }: { pc?: any }) {
  const stats = [
    { value: pc?.stat1Value || '+178%', label: pc?.stat1Label || 'Avg. brand recall lift',  sub: pc?.stat1Sub || 'Across all 2025 campaigns' },
    { value: pc?.stat2Value || '4.1×',  label: pc?.stat2Label || 'Average campaign ROI',    sub: pc?.stat2Sub || 'vs. media investment' },
    { value: pc?.stat3Value || '100+',  label: pc?.stat3Label || 'Campaigns delivered',     sub: pc?.stat3Sub || 'In 2024–2025' },
  ];
  return (
    <section style={{ background: "#F5F5F6", paddingTop: 100, paddingBottom: 100 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-4">
            <Eyebrow text={pc?.whyEyebrow || 'Why It Works'} />
            <Reveal delay={0.04}>
              <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}>
                {pc?.whyTitle || 'Why outdoor advertising works'}<br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}>{pc?.whyTitleAccent || 'in Egypt.'}</span>
              </h2>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.85] mb-6" style={{ color: "rgba(11,15,26,0.5)" }}>
                {pc?.whyParagraph1 || "Egypt's outdoor advertising market is among the fastest-growing in the MENA region — driven by rapid urbanisation, a young and mobile population, and a commuter culture that places millions of consumers in front of billboards, DOOH screens, and mall formats every single day. Unlike digital advertising, outdoor advertising in Egypt cannot be skipped, blocked, or scrolled past."}
              </p>
            </Reveal>

            <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {stats.map((stat) => (
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

export default function Projects() {
  const { projects: PROJECTS, clientBrands, projectsContent: pc } = useStore();
  const { isAr, t } = useLang();
  const [filter, setFilter] = useState<"All" | ProjectCategory>("All");
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(gridRef, { once: true, margin: "-10% 0px" });

  // Brand logo lookup keyed by brand name
  const brandLogoMap = useMemo(() => {
    const m: Record<string, string> = {};
    clientBrands.forEach(b => { m[b.name] = b.logoUrl || (b as any).logo || ''; });
    return m;
  }, [clientBrands]);

  const filteredProjects = useMemo(
    () => PROJECTS.filter((p) => (filter === "All" ? true : p.category === filter)),
    [PROJECTS, filter]
  );

  const clientGroups = useMemo<ClientGroup[]>(() => {
    const map = new Map<string, any[]>();
    filteredProjects.forEach((project) => {
      const key = project.client || "Unknown Client";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(project);
    });

    return Array.from(map.entries())
      .map(([name, projects]) => {
        const ordered = [...projects].sort((a, b) => Number(b.year) - Number(a.year));
        return {
          name,
          logo: brandLogoMap[name] || ordered[0]?.clientLogo || '',
          projects: ordered,
          categories: Array.from(new Set(ordered.map((p) => p.category))),
          latestYear: ordered[0]?.year || "",
          coverImage: ordered[0]?.coverImage,
          blurb: buildClientBlurb(ordered),
        };
      })
      .sort((a, b) => b.projects.length - a.projects.length || a.name.localeCompare(b.name));
  }, [filteredProjects, brandLogoMap]);

  const selectedClient = activeClient && clientGroups.some((c) => c.name === activeClient)
    ? clientGroups.find((c) => c.name === activeClient) || null
    : clientGroups[0] || null;

  return (
    <>
      <section className="bg-white" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <Eyebrow text={isAr && (pc as any)?.heroEyebrowAr ? (pc as any).heroEyebrowAr : (pc?.heroEyebrow || t('projects.eyebrow'))} />
          </Reveal>
          <Reveal delay={0.04}>
            <h1 className="font-black leading-[0.88] tracking-[-0.05em]" style={{ fontSize: "clamp(42px, 6vw, 86px)", color: NAVY, maxWidth: 980 }}>
              {isAr && (pc as any)?.heroTitleAr ? (pc as any).heroTitleAr : (pc?.heroTitle || t('projects.title'))}<br />
              <span style={{ color: "rgba(11,15,26,0.2)" }}>{isAr && (pc as any)?.heroTitleAccentAr ? (pc as any).heroTitleAccentAr : (pc?.heroTitleAccent || t('projects.titleAccent'))}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[17px] leading-[1.85] mt-8" style={{ color: "rgba(11,15,26,0.5)", maxWidth: 760 }}>
              {isAr && (pc as any)?.heroParagraphAr ? (pc as any).heroParagraphAr : (pc?.heroParagraph || t('projects.subtitle'))}
            </p>
          </Reveal>
        </div>
      </section>

      <FeaturedProject />

      <section className="bg-white" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setFilter(item.value);
                    setActiveClient(null);
                  }}
                  className="h-11 px-5 text-[11px] font-bold tracking-[0.22em] uppercase transition-all duration-200"
                  style={{
                    border: `1px solid ${active ? RED : "rgba(11,15,26,0.08)"}`,
                    background: active ? RED : "white",
                    color: active ? "white" : NAVY,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div ref={gridRef} className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
            <div>
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                  Clients
                </p>
              </Reveal>
              {clientGroups.length === 0 ? (
                <div className="border border-[#0B0F1A]/[0.08] bg-[#F5F5F6] p-8">
                  <p style={{ color: "rgba(11,15,26,0.45)" }}>No projects found for this category.</p>
                </div>
              ) : (
                <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clientGroups.map((client, index) => (
                    <ClientCard
                      key={client.name}
                      client={client}
                      index={index}
                      active={selectedClient?.name === client.name}
                      onClick={() => setActiveClient(client.name)}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            <div className="xl:sticky xl:top-28">
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                  {selectedClient ? `${selectedClient.name} campaigns` : "Client campaigns"}
                </p>
              </Reveal>

              {selectedClient ? (
                <div className="border border-[#0B0F1A]/[0.07] bg-[#F5F5F6] p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: RED }}>Selected client</p>
                      <h2 className="font-black tracking-[-0.03em] leading-[0.95]" style={{ fontSize: "clamp(28px, 3vw, 40px)", color: NAVY }}>
                        {selectedClient.name}
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
                      {selectedClient.projects.length} campaign{selectedClient.projects.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="text-[15px] leading-[1.8] mb-8" style={{ color: "rgba(11,15,26,0.5)" }}>
                    {selectedClient.blurb}
                  </p>

                  <RevealGroup className="flex flex-col gap-5">
                    {selectedClient.projects.map((project, index) => (
                      <RevealItem key={project.id}>
                        <ProjectCard project={project} index={index} />
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </div>
              ) : (
                <div className="border border-[#0B0F1A]/[0.08] bg-[#F5F5F6] p-8">
                  <p style={{ color: "rgba(11,15,26,0.45)" }}>Select a client to see all projects and campaigns executed for them.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <WhyItMatters pc={pc} />

      <CTABanner
        title={pc?.ctaTitle || 'Ready to be our next success story?'}
        subtitle={pc?.ctaSubtitle || "Let's plan a campaign tailored to your audience, locations, and business goals."}
        buttonLabel={pc?.ctaButton || 'Start Your Campaign'}
      />
    </>
  );
}