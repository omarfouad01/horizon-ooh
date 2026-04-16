import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/store/dataStore";
import { type ProjectCategory } from "@/data";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { projectHref, RED, NAVY, ease } from "@/lib/routes";

const CAT_COLORS: Record<ProjectCategory, string> = {
  Billboard: "#D90429",
  DOOH: "#0B0F1A",
  Mall: "#4A4E69",
  Airport: "#22577A",
};

function buildClientBrief(project: any, clientProjects: any[]) {
  const categories = Array.from(new Set(clientProjects.map((p) => p.category))).join(" / ");
  const markets = Array.from(new Set(clientProjects.map((p) => p.city))).join(", ");
  return `${project.client} is featured across ${clientProjects.length} campaign${clientProjects.length > 1 ? "s" : ""} in our portfolio${categories ? `, spanning ${categories}` : ""}${markets ? ` across ${markets}` : ""}. This case study highlights one part of our ongoing execution for the brand.`;
}

export default function ProjectDetail() {
  const { projects: PROJECTS } = useStore();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.slug === slug);

  const clientProjects = useMemo(
    () => PROJECTS.filter((p) => p.client === project?.client),
    [PROJECTS, project?.client]
  );

  const related = PROJECTS.filter((p) => p.slug !== slug && p.client === project?.client).slice(0, 3);
  const fallbackRelated = PROJECTS.filter((p) => p.slug !== slug && p.client !== project?.client).slice(0, Math.max(0, 3 - related.length));
  const relatedAll = [...related, ...fallbackRelated].slice(0, 3);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p style={{ color: "rgba(11,15,26,0.4)", fontSize: 17 }}>Case study not found.</p>
        <button onClick={() => navigate("/projects")} style={{ color: RED, fontWeight: 700 }}>
          ← Back to Projects
        </button>
      </div>
    );
  }

  const gallery = project.galleryImages?.length ? project.galleryImages : [project.coverImage].filter(Boolean);
  const clientBrief = buildClientBrief(project, clientProjects);

  return (
    <>
      <div className="bg-white pt-4">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]} />
      </div>

      <section className="relative overflow-hidden" style={{ background: NAVY, minHeight: 620 }}>
        <img src={project.heroImage} alt={`${project.title} — outdoor advertising case study ${project.location}`} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.45 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,26,0.92) 0%, rgba(11,15,26,0.5) 55%, rgba(11,15,26,0.2) 100%)" }} />

        <div className="relative max-w-[1440px] mx-auto flex flex-col justify-end px-4 sm:px-8 lg:px-[120px]" style={{ paddingTop: 120, paddingBottom: 72, minHeight: 620 }}>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 text-white" style={{ background: CAT_COLORS[project.category] }}>
              {project.category}
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>·</span>
            <span className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {project.location}
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>·</span>
            <span className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {project.year} · {project.duration}
            </span>
          </div>

          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease, delay: 0.1 }} className="font-black text-white leading-[0.88] tracking-[-0.05em]" style={{ fontSize: "clamp(40px, 5.5vw, 80px)", maxWidth: 880 }}>
              {project.title}
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.p initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease, delay: 0.2 }} className="font-semibold" style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", maxWidth: 660 }}>
              {project.tagline}
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.35 }} className="flex items-center gap-12 pt-8 border-t border-white/[0.08] flex-wrap">
            {project.results.map((r) => (
              <div key={r.metric}>
                <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 30 }}>{r.value}</p>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{r.metric}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute top-32 right-[120px]">
          <Reveal delay={0.5}>
            <div className="border border-white/10 px-6 py-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mb-1.5">Client</p>
              <p className="text-white font-bold tracking-[-0.01em]" style={{ fontSize: 15 }}>{project.client}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <Eyebrow text="Overview" />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(28px, 3vw, 42px)", color: NAVY }}>
                  The brief.
                </h2>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <Reveal delay={0.1}>
                <p className="text-[17px] leading-[1.85]" style={{ color: "rgba(11,15,26,0.55)" }}>
                  {project.overview}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <Eyebrow text="Client" />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(28px, 3vw, 42px)", color: NAVY }}>
                  About the client.
                </h2>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <Reveal delay={0.08}>
                <div className="bg-white border border-[#0B0F1A]/[0.07] p-8 sm:p-10">
                  <p className="text-[16px] leading-[1.9] mb-6" style={{ color: "rgba(11,15,26,0.58)" }}>
                    {clientBrief}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.08)" }}>
                    {[
                      { label: "Client", value: project.client },
                      { label: "Campaigns", value: String(clientProjects.length) },
                      { label: "Markets", value: String(new Set(clientProjects.map((p) => p.city)).size || 1) },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#F5F5F6] p-5">
                        <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "rgba(11,15,26,0.3)" }}>{item.label}</p>
                        <p className="font-black tracking-[-0.03em]" style={{ color: NAVY, fontSize: 22 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#F5F5F6", paddingTop: 0, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            <div className="bg-white" style={{ padding: "52px 56px" }}>
              <div className="w-5 h-[1.5px] mb-8" style={{ background: RED }} />
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "rgba(11,15,26,0.3)" }}>Objective</p>
              <Reveal delay={0.04}>
                <p className="text-[16px] leading-[1.85]" style={{ color: "rgba(11,15,26,0.6)" }}>{project.objective}</p>
              </Reveal>
            </div>

            <div className="bg-white" style={{ padding: "52px 56px" }}>
              <div className="w-5 h-[1.5px] mb-8" style={{ background: NAVY }} />
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "rgba(11,15,26,0.3)" }}>Execution</p>
              <Reveal delay={0.08}>
                <p className="text-[16px] leading-[1.85]" style={{ color: "rgba(11,15,26,0.6)" }}>{project.execution}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
            <div className="mb-10">
              <Reveal>
                <Eyebrow text="Campaign Photos" />
              </Reveal>
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(28px, 3vw, 42px)", color: NAVY }}>
                  Photos side by side.
                </h2>
              </Reveal>
            </div>
            <RevealGroup className={`grid gap-4 ${gallery.length >= 3 ? "grid-cols-1 md:grid-cols-3" : gallery.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {gallery.map((img, i) => (
                <RevealItem key={i}>
                  <div className="overflow-hidden bg-[#F5F5F6] border border-[#0B0F1A]/[0.07]" style={{ height: 340 }}>
                    <img src={img} alt={`${project.title} campaign photography ${i + 1}`} className="w-full h-full object-cover" style={{ opacity: 0.92 }} />
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Eyebrow text="Campaign Results" light />
          <Reveal delay={0.04}>
            <h2 className="font-black leading-[0.9] tracking-[-0.04em] text-white mb-16" style={{ fontSize: "clamp(36px, 4vw, 56px)" }}>
              The numbers<br />
              <span style={{ color: "rgba(255,255,255,0.2)" }}>don't lie.</span>
            </h2>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-[1px]" style={{ background: "rgba(255,255,255,0.05)" }}>
            {project.results.map((r, i) => (
              <RevealItem key={r.metric}>
                <div className="flex flex-col" style={{ padding: "48px 56px", background: NAVY, borderBottom: i < project.results.length - 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span className="font-black leading-none tracking-[-0.05em] mb-4" style={{ fontSize: "clamp(48px, 5vw, 72px)", color: RED }}>{r.value}</span>
                  <span className="font-bold text-white mb-2" style={{ fontSize: 18 }}>{r.metric}</span>
                  <span className="text-[13px] leading-[1.65]" style={{ color: "rgba(255,255,255,0.35)" }}>{r.description}</span>
                  <div className="mt-8 w-8 h-[1px]" style={{ background: RED }} />
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {relatedAll.length > 0 && (
        <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
            <Reveal>
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-10" style={{ color: "rgba(11,15,26,0.3)" }}>
                More from this portfolio
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAll.map((p) => (
                <RevealItem key={p.id}>
                  <Link to={projectHref(p.slug)} className="group block overflow-hidden border border-[#0B0F1A]/[0.07] hover:border-[#D90429]/20 transition-all duration-400" style={{ textDecoration: "none" }}>
                    <div className="relative overflow-hidden" style={{ height: 200 }}>
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.05]" style={{ opacity: 0.85 }} />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.6) 0%, transparent 60%)" }} />
                      <span className="absolute bottom-4 left-5 text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1 text-white" style={{ background: CAT_COLORS[p.category] }}>
                        {p.category}
                      </span>
                    </div>
                    <div style={{ padding: "20px 20px 24px" }}>
                      <p className="font-bold text-[15px] tracking-[-0.01em] mb-1 transition-colors duration-300 group-hover:text-[#D90429]" style={{ color: NAVY }}>
                        {p.title}
                      </p>
                      <p className="text-[12px]" style={{ color: "rgba(11,15,26,0.35)" }}>{p.client} · {p.year}</p>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <CTABanner title="Inspired by these results?" subtitle="Let's build a campaign with measurable outcomes for your brand." buttonLabel="Get a Quote" />
    </>
  );
}
