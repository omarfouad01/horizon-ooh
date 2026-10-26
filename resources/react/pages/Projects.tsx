import SaudiEditorial from '@/components/SaudiEditorial';
import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion, useInView } from "framer-motion";
import { useStore } from "@/store/dataStore";
import { type ProjectCategory } from "@/data";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow } from "@/components/UI";
import { projectHref, RED, NAVY, ease } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

const FILTER_KEYS: { labelKey: string; value: "All" | ProjectCategory }[] = [
  { labelKey: 'projects.filterAll',        value: "All" },
  { labelKey: 'projects.filterBillboards', value: "Billboard" },
  { labelKey: 'projects.filterDOOH',       value: "DOOH" },
  { labelKey: 'projects.filterMalls',      value: "Mall" },
  { labelKey: 'projects.filterAirports',   value: "Airport" },
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
  coverImageAlt?: string;
  logoAlt?: string;
  blurb: string;
};

function buildClientBlurb(projects: any[]) {
  const cities = Array.from(new Set(projects.map((p) => p.city).filter(Boolean)));
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  return `${projects.length} campaign${projects.length > 1 ? "s" : ""} delivered${cities.length ? ` across ${cities.join(", ")}` : ""}${categories.length ? ` · ${categories.join(" / ")}` : ""}.`;
}

// ─── Tiny translated label components ────────────────────────────────────────
function LatestCampaignLabel()    { const { lang, t } = useLang(); return <><LocalizedText>{t('projects.latestCampaign')}</LocalizedText></>; }
function FeaturedCampaignLabel()  { const { t } = useLang(); return <><LocalizedText>{t('projects.featuredCampaign')}</LocalizedText></>; }
function ViewCaseStudyLabel()     { const { t } = useLang(); return <><LocalizedText>{t('projects.viewCaseStudy')}</LocalizedText></>; }
function FilterItemLabel({ labelKey }: { labelKey: string }) { const { t } = useLang(); return <><LocalizedText>{t(labelKey as any)}</LocalizedText></>; }
function ClientsLabel()           { const { t } = useLang(); return <><LocalizedText>{t('projects.clientsLabel')}</LocalizedText></>; }
function ClientCampaignsLabel({ selectedClient }: { selectedClient: any }) {
  const { t } = useLang();
  return <><LocalizedText>{selectedClient ? `${selectedClient.name} ${t('projects.clientCampaigns')}` : t('projects.clientsLabel')}</LocalizedText></>;
}
function SelectedClientLabel()    { const { t } = useLang(); return <><LocalizedText>{t('projects.selectedClient')}</LocalizedText></>; }
function CampaignCountLabel({ count }: { count: number }) {
  const { t } = useLang();
  return <><LocalizedText>{count}</LocalizedText> <LocalizedText>{t('projects.clientCampaigns')}</LocalizedText></>;
}
function NoProjectsLabel()        { const { t } = useLang(); return <><LocalizedText>{t('projects.noProjects')}</LocalizedText></>; }
function SelectClientLabel()      { const { t } = useLang(); return <><LocalizedText>{t('projects.selectClient')}</LocalizedText></>; }
function FeaturedTitle({ featured }: { featured: any }) {
  const { isAr } = useLang();
  return <><LocalizedText>{isAr && featured.titleAr ? featured.titleAr : featured.title}</LocalizedText></>;
}
function FeaturedTagline({ featured }: { featured: any }) {
  const { isAr } = useLang();
  return <><LocalizedText>{isAr && featured.taglineAr ? featured.taglineAr : featured.tagline}</LocalizedText></>;
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
        <LocalizedText>{client.coverImage
          ? <LocalizedElement as="img"
              src={client.coverImage}
              alt={client.coverImageAlt || `${client.name} client card`}
              width={600} height={260}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ opacity: 0.88 }}
              loading={index === 0 ? undefined : 'lazy'}
              {...(index === 0 ? { fetchpriority: 'high' } as any : {})}
              decoding="async"
            />
          : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-4xl font-black text-gray-300 select-none"><LocalizedText>{client.name?.charAt(0)?.toUpperCase()}</LocalizedText></span>
            </div>
        }</LocalizedText>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(11,15,26,0.78) 0%, rgba(11,15,26,0.16) 60%, transparent 100%)" }}
        />

        <div className="absolute top-5 left-5 flex flex-wrap gap-2">
          <LocalizedText>{client.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 text-white" style={{ background: CAT_COLORS[cat] }}>
              <LocalizedText>{cat}</LocalizedText>
            </span>
          ))}</LocalizedText>
        </div>

        <div className="absolute top-5 right-5">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55"><LocalizedText>{client.latestYear}</LocalizedText></span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <LocalizedText>{client.logo ? (
            <div className="mb-3">
              <LocalizedElement as="img" src={client.logo} alt={client.logoAlt || client.name} style={{ height: 28, width: 'auto', objectFit: 'contain', maxWidth: 120, filter: 'brightness(10)', opacity: 0.85 }} loading="lazy" />
            </div>
          ) : (
            <p className="text-white/45 text-[10px] font-bold tracking-[0.28em] uppercase mb-2"><ClientsLabel /></p>
          )}</LocalizedText>
          <h3 className="text-white font-black tracking-[-0.02em] leading-tight" style={{ fontSize: 24 }}><LocalizedText>{client.name}</LocalizedText></h3>
        </div>
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-black text-[11px] tracking-[0.25em] uppercase" style={{ color: RED }}>
            <LocalizedText>{String(index + 1).padStart(2, "0")}</LocalizedText>
          </span>
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
            <LocalizedText>{client.projects.length}</LocalizedText><LocalizedText> project</LocalizedText><LocalizedText>{client.projects.length > 1 ? "s" : ""}</LocalizedText>
          </span>
        </div>

        <p className="text-[14px] leading-[1.7] mb-6" style={{ color: "rgba(11,15,26,0.48)" }}>
          <LocalizedText>{client.blurb}</LocalizedText>
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-[#0B0F1A]/[0.07]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>
              <LatestCampaignLabel />
            </p>
            <p className="font-black tracking-[-0.03em]" style={{ fontSize: 18, color: NAVY }}>
              <LocalizedText>{client.projects[0]?.title}</LocalizedText>
            </p>
          </div>
          <span className="text-xl transition-all duration-300" style={{ color: active ? RED : "rgba(11,15,26,0.2)" }}><LocalizedText>
            →
          </LocalizedText></span>
        </div>
      </div>
    </motion.button>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  const { lang, isAr, t } = useLang();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
      }}
    >
      <LocalizedElement as={Link}
        to={projectHref(lang, project.slug)}
        className="group block overflow-hidden bg-white border border-[#0B0F1A]/[0.07] hover:border-[#D90429]/20 transition-all duration-500 cursor-pointer"
        style={{ textDecoration: "none" }}
      >
        <div className="relative overflow-hidden" style={{ height: 280 }}>
          <LocalizedText>{project.coverImage
            ? <LocalizedElement as="img"
                src={project.coverImage}
                alt={project.coverImageAlt || `${project.title} — outdoor advertising ${project.location}`}
                width={600} height={280}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ opacity: 0.88 }}
                loading={index === 0 ? undefined : 'lazy'}
                {...(index === 0 ? { fetchpriority: 'high' } as any : {})}
                decoding="async"
              />
            : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl font-black text-gray-300 select-none"><LocalizedText>{project.title?.charAt(0)?.toUpperCase()}</LocalizedText></span>
              </div>
          }</LocalizedText>
          <div
            className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
            style={{ background: "linear-gradient(to top, rgba(11,15,26,0.72) 0%, rgba(11,15,26,0.1) 55%, transparent 100%)" }}
          />

          <div className="absolute top-5 left-5">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 text-white" style={{ background: CAT_COLORS[project.category] }}>
              <LocalizedText>{project.category}</LocalizedText>
            </span>
          </div>

          <div className="absolute top-5 right-5">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50"><LocalizedText>{project.year}</LocalizedText></span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white font-black tracking-[-0.02em] leading-tight opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0" style={{ fontSize: 13 }}>
              <LocalizedText>{isAr && project.taglineAr ? project.taglineAr : project.tagline}</LocalizedText>
            </p>
          </div>
        </div>

        <div style={{ padding: "28px 28px 32px" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-[11px] tracking-[0.25em] uppercase" style={{ color: RED }}>
              <LocalizedText>{String(index + 1).padStart(2, "0")}</LocalizedText>
            </span>
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
              <LocalizedText>{project.location}</LocalizedText>
            </span>
          </div>

          <h3 className="font-extrabold leading-[1.15] tracking-[-0.02em] mb-3 transition-colors duration-400 group-hover:text-[#D90429]" style={{ fontSize: 20, color: NAVY }}>
            <LocalizedText>{isAr && project.titleAr ? project.titleAr : project.title}</LocalizedText>
          </h3>

          <p className="text-[13px] font-medium mb-6" style={{ color: "rgba(11,15,26,0.4)" }}>
            <LocalizedText>{project.client}</LocalizedText><LocalizedText> · </LocalizedText><LocalizedText>{project.duration}</LocalizedText>
          </p>

          <div className="flex items-center justify-between pt-5 border-t border-[#0B0F1A]/[0.07]">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>
                <LocalizedText>{project.results[0]?.metric || "Campaign"}</LocalizedText>
              </p>
              <p className="font-black tracking-[-0.03em]" style={{ fontSize: 22, color: RED }}>
                <LocalizedText>{project.results[0]?.value || project.year}</LocalizedText>
              </p>
            </div>
            <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color: RED }}><LocalizedText>
              →
            </LocalizedText></span>
          </div>
        </div>
      </LocalizedElement>
    </motion.div>
  );
}

function FeaturedProject() {
  const { projects: PROJECTS } = useStore();
  const { lang } = useLang();
  const featured = PROJECTS.find((p) => p.featured) || PROJECTS[0];
  if (!featured) return null;

  return (
    <section className="bg-white" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <Reveal>
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
            <FeaturedCampaignLabel />
          </p>
        </Reveal>

        <LocalizedElement as={Link} to={projectHref(lang, featured.slug)} className="group relative block overflow-hidden" style={{ textDecoration: "none", height: 560 }}>
          <LocalizedText>{featured.heroImage
            ? <LocalizedElement as="img" src={featured.heroImage} alt={featured.heroImageAlt || `${featured.title} — outdoor advertising case study Saudi Arabia`} width={1440} height={500} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" style={{ opacity: 0.8 }} {...({ fetchpriority: "high" } as any)} decoding="async" />
            : <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A] to-[#1a2035]" />}</LocalizedText>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,26,0.88) 0%, rgba(11,15,26,0.5) 50%, rgba(11,15,26,0.15) 100%)" }} />

          <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: "60px 80px" }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 text-white" style={{ background: RED }}>
                <LocalizedText>{featured.category}</LocalizedText>
              </span>
              <span className="text-white/35 text-[10px] font-semibold tracking-[0.2em]">
                <LocalizedText>{featured.year}</LocalizedText><LocalizedText> · </LocalizedText><LocalizedText>{featured.duration}</LocalizedText>
              </span>
            </div>

            <h2 className="font-black text-white leading-[0.9] tracking-[-0.04em] mb-5" style={{ fontSize: "clamp(36px, 4.5vw, 64px)", maxWidth: 680 }}>
              <FeaturedTitle featured={featured} />
            </h2>

            <p className="text-white/55 text-[17px] leading-[1.65] mb-10" style={{ maxWidth: 520 }}>
              <FeaturedTagline featured={featured} />
            </p>

            <div className="flex items-center gap-12 mb-10">
              <LocalizedText>{(featured.results || []).slice(0, 3).map((r: any) => (
                <div key={r.metric}>
                  <p className="font-black text-white/90 tracking-[-0.04em]" style={{ fontSize: 28 }}><LocalizedText>{r.value}</LocalizedText></p>
                  <p className="text-white/35 text-[10px] font-semibold tracking-[0.2em] uppercase mt-1"><LocalizedText>{r.metric}</LocalizedText></p>
                </div>
              ))}</LocalizedText>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-[12px] tracking-[0.2em] uppercase"><ViewCaseStudyLabel /></span>
              <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color: RED }}><LocalizedText>
                →
              </LocalizedText></span>
            </div>
          </div>

          <div className="absolute top-10 right-10">
            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 border border-white/15">
              <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold mb-1"><LocalizedText>Client</LocalizedText></p>
              <p className="text-white font-bold text-[14px] tracking-[-0.01em]"><LocalizedText>{featured.client}</LocalizedText></p>
            </div>
          </div>
        </LocalizedElement>
      </div>
    </section>
  );
}

function WhyItMatters({ pc }: { pc?: any }) {
  const { isAr, t } = useLang();
  const stats = [
  {
    "value": "01",
    "label": "Site selection",
    "sub": "Review the actual locations"
  },
  {
    "value": "02",
    "label": "Creative preparation",
    "sub": "Confirm the specifications"
  },
  {
    "value": "03",
    "label": "Delivery review",
    "sub": "Agree the documentation"
  }
];
  return (
    <section style={{ background: "#F5F5F6", paddingTop: 100, paddingBottom: 100 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-4">
            <Eyebrow text={isAr && (pc as any)?.whyEyebrowAr ? (pc as any).whyEyebrowAr : (pc?.whyEyebrow || t('projects.whyEyebrow'))} />
            <Reveal delay={0.04}>
              <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}>
                <LocalizedText>{isAr && (pc as any)?.whyTitleAr ? (pc as any).whyTitleAr : (pc?.whyTitle || t('projects.whyTitle'))}</LocalizedText><br />
                <span style={{ color: "rgba(11,15,26,0.2)" }}><LocalizedText>{isAr && (pc as any)?.whyTitleAccentAr ? (pc as any).whyTitleAccentAr : (pc?.whyTitleAccent || t('projects.whyTitleAccent'))}</LocalizedText></span>
              </h2>
            </Reveal>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.85] mb-6" style={{ color: "rgba(11,15,26,0.5)" }}>
                <LocalizedText>{isAr && (pc as any)?.whyParagraph1Ar ? (pc as any).whyParagraph1Ar : (pc?.whyParagraph1 || "A useful campaign connects the target audience, selected locations and creative message. Compare real site photographs and specifications, confirm availability for your dates, and agree production responsibilities and delivery documentation before booking. Project images are creative references, not evidence of a guaranteed return or measured audience uplift.")}</LocalizedText>
              </p>
            </Reveal>

            <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {stats.map((stat) => (
                <RevealItem key={stat.label}>
                  <div className="bg-white p-8 border border-[#0B0F1A]/[0.07]">
                    <p className="font-black leading-none tracking-[-0.04em] mb-3" style={{ fontSize: 40, color: RED }}><LocalizedText>{stat.value}</LocalizedText></p>
                    <p className="font-bold text-[14px] mb-1" style={{ color: NAVY }}><LocalizedText>{stat.label}</LocalizedText></p>
                    <p className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}><LocalizedText>{stat.sub}</LocalizedText></p>
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
          coverImageAlt: ordered[0]?.coverImageAlt,
          logoAlt: ordered[0]?.clientLogoAlt,
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
      <SEO
        title={isAr ? 'دراسات الحالة والمشروعات | هورايزون' : 'Case Studies & Projects | HORIZON OOH'}
        description={isAr ? 'استكشف دراسات الحالة ومشروعات الحملات الإعلانية الخارجية لهورايزون في السعودية.' : "Browse HORIZON OOH's billboard advertising case studies and campaign projects across Saudi Arabia. Real results for real brands."}
        canonical={isAr ? '/ar/projects' : '/projects'}
      />
      <section className="bg-white" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <Eyebrow text={isAr && (pc as any)?.heroEyebrowAr ? (pc as any).heroEyebrowAr : (pc?.heroEyebrow || t('projects.eyebrow'))} />
          </Reveal>
          <Reveal delay={0.04}>
            <h1 className="font-black leading-[0.88] tracking-[-0.05em]" style={{ fontSize: "clamp(42px, 6vw, 86px)", color: NAVY, maxWidth: 980 }}>
              <LocalizedText>{isAr && (pc as any)?.heroTitleAr ? (pc as any).heroTitleAr : (pc?.heroTitle || t('projects.title'))}</LocalizedText><br />
              <span style={{ color: "rgba(11,15,26,0.2)" }}><LocalizedText>{isAr && (pc as any)?.heroTitleAccentAr ? (pc as any).heroTitleAccentAr : (pc?.heroTitleAccent || t('projects.titleAccent'))}</LocalizedText></span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[17px] leading-[1.85] mt-8" style={{ color: "rgba(11,15,26,0.5)", maxWidth: 760 }}>
              <LocalizedText>{isAr && (pc as any)?.heroParagraphAr ? (pc as any).heroParagraphAr : (pc?.heroParagraph || t('projects.subtitle'))}</LocalizedText>
            </p>
          </Reveal>
        </div>
      </section>

      <FeaturedProject />

      <section className="bg-white" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <LocalizedText>{FILTER_KEYS.map((item) => {
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
                    borderRadius: 8, cursor: "pointer",
                       border: `1px solid ${active ? RED : "rgba(11,15,26,0.08)"}`,
                    background: active ? RED : "white",
                    color: active ? "white" : NAVY,
                  }}
                >
                  <FilterItemLabel labelKey={item.labelKey} />
                </button>
              );
            })}</LocalizedText>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
            <div>
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                  <ClientsLabel />
                </p>
              </Reveal>
              <LocalizedText>{clientGroups.length === 0 ? (
                <div className="border border-[#0B0F1A]/[0.08] bg-[#F5F5F6] p-8">
                  <p style={{ color: "rgba(11,15,26,0.45)" }}><NoProjectsLabel /></p>
                </div>
              ) : (
                <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LocalizedText>{clientGroups.map((client, index) => (
                    <ClientCard
                      key={client.name}
                      client={client}
                      index={index}
                      active={selectedClient?.name === client.name}
                      onClick={() => setActiveClient(client.name)}
                    />
                  ))}</LocalizedText>
                </motion.div>
              )}</LocalizedText>
            </div>

            <div className="xl:sticky xl:top-28">
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                  <ClientCampaignsLabel selectedClient={selectedClient} />
                </p>
              </Reveal>

              <LocalizedText>{selectedClient ? (
                <div className="border border-[#0B0F1A]/[0.07] bg-[#F5F5F6] p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: RED }}><SelectedClientLabel /></p>
                      <h2 className="font-black tracking-[-0.03em] leading-[0.95]" style={{ fontSize: "clamp(28px, 3vw, 40px)", color: NAVY }}>
                        <LocalizedText>{selectedClient.name}</LocalizedText>
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>
                      <CampaignCountLabel count={selectedClient.projects.length} />
                    </span>
                  </div>

                  <p className="text-[15px] leading-[1.8] mb-8" style={{ color: "rgba(11,15,26,0.5)" }}>
                    <LocalizedText>{selectedClient.blurb}</LocalizedText>
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
                  <p style={{ color: "rgba(11,15,26,0.45)" }}><SelectClientLabel /></p>
                </div>
              )}</LocalizedText>
            </div>
          </div>
        </div>
      </section>

      <WhyItMatters pc={pc} />

      <SaudiEditorial page="projects"/>
      <CTABanner
        title={isAr && (pc as any)?.ctaTitleAr ? (pc as any).ctaTitleAr : (pc?.ctaTitle || t('projects.ctaTitle'))}
        subtitle={isAr && (pc as any)?.ctaSubtitleAr ? (pc as any).ctaSubtitleAr : (pc?.ctaSubtitle || t('projects.ctaSubtitle'))}
        buttonLabel={isAr && (pc as any)?.ctaButtonAr ? (pc as any).ctaButtonAr : (pc?.ctaButton || t('projects.ctaButton'))}
      />
    </>
  );
}
