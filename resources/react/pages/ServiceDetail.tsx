import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStore } from "@/store/dataStore";
import { Reveal, RevealGroup, RevealItem, SectionHeading, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { serviceHref, langPath, RED, NAVY, ease } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { servicesApi } from "@/api";

// ── Branded service skeleton ──────────────────────────────────────────────────
function ServiceSkeleton() {
  return (
    <>
      <div style={{ background: NAVY, paddingTop: 80, minHeight: 480 }} className="overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 sm:px-8 lg:px-[120px] py-20">
          <div>
            <div className="h-4 w-24 rounded animate-pulse mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-16 w-3/4 rounded animate-pulse mb-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="h-16 w-1/2 rounded animate-pulse mb-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="space-y-2 mb-8">
              {[100, 90, 85].map((w, i) => (
                <div key={i} className="h-4 rounded animate-pulse" style={{ width: `${w}%`, background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </div>
            <div className="h-12 w-36 rounded animate-pulse" style={{ background: 'rgba(217,4,41,0.4)' }} />
          </div>
          <div className="h-80 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px] py-16">
        <div className="h-8 w-56 rounded animate-pulse mb-8" style={{ background: 'rgba(11,15,26,0.08)' }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="h-32 rounded animate-pulse" style={{ background: 'rgba(11,15,26,0.06)' }} />
          ))}
        </div>
      </div>
    </>
  );
}

export default function ServiceDetail() {
  // ── ALL hooks first — no conditional returns before hooks ──
  const { services: SERVICES } = useStore();
  const { lang, t, isAr } = useLang();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Direct per-page fetch — fires immediately on mount
  const [fetching, setFetching] = useState(true);
  const [fetchDone, setFetchDone] = useState(false);
  const [fetchedService, setFetchedService] = useState<any>(null);
  // Track whether the global store has been populated at least once
  const storeLoaded = SERVICES.length > 0;

  useEffect(() => {
    if (!slug) { setFetching(false); setFetchDone(true); return; }
    setFetching(true);
    setFetchDone(false);
    servicesApi.get(slug)
      .then((res: any) => {
        // Handle both { data: { data: ... } } and { data: ... } shapes
        const payload = res?.data ?? res;
        const data = payload?.data ?? payload;
        // Make sure we got an object with an id/slug (not an array or empty)
        if (data && typeof data === 'object' && !Array.isArray(data) && (data.id || data.slug)) {
          setFetchedService(data);
        }
      })
      .catch(() => {
        // Swallow — storeService fallback will handle it
      })
      .finally(() => { setFetching(false); setFetchDone(true); });
  }, [slug]);

  // Resolve: direct fetch is authoritative; store supplements once loaded
  const storeService = SERVICES.find((s: any) => s.slug === slug);
  const service      = fetchedService ?? storeService;
  const others       = SERVICES.filter((s: any) => s.id !== service?.id).slice(0, 3);

  // ── Conditional returns AFTER all hooks ──
  // Show skeleton while:
  //   (a) direct fetch is still in-flight, OR
  //   (b) fetch finished but found nothing AND global store hasn't loaded yet
  //       (store might still be fetching — give it time before showing "not found")
  if (fetching) return <ServiceSkeleton />;
  if (!service && (!fetchDone || !storeLoaded)) return <ServiceSkeleton />;

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-[#0B0F1A]/40 text-lg">{isAr ? 'الخدمة غير موجودة.' : 'Service not found.'}</p>
        <button onClick={() => navigate("/services")} className="text-[#D90429] font-bold underline hover:opacity-70 transition-opacity duration-150 cursor-pointer">{isAr ? 'العودة للخدمات' : 'Back to Services'}</button>
      </div>
    );
  }

  // ── Structured data ────────────────────────────────────────────────────
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${service.title} in Egypt`,
    "description": service.longDescription?.substring(0, 200) ?? "",
    "provider": {
      "@type": "Organization",
      "name": "HORIZON OOH",
      "url": "https://horizonooh.com",
      "logo": "https://horizonooh.com/favicon.ico",
    },
    "areaServed": { "@type": "Country", "name": "Egypt" },
    "url": `https://horizonooh.com/services/${service.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://horizonooh.com/" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://horizonooh.com/services" },
      { "@type": "ListItem", "position": 3, "name": service.shortTitle ?? service.title },
    ],
  };

  return (
    <>
      <SEO
        title={`${service.title} in Egypt | HORIZON OOH`}
        description={service.longDescription.substring(0, 160)}
        keywords={`${(service.title ?? '').toLowerCase()} Egypt, outdoor advertising Egypt, OOH advertising Egypt, ${(service.shortTitle ?? '').toLowerCase()} Cairo`}
        canonical={`/services/${service.slug}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Breadcrumb */}
      <div className="bg-white pt-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.shortTitle }]} />
      </div>

      {/* Hero */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 0 }} className="overflow-hidden">
        <div
          className="max-w-[1440px] mx-auto grid grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left */}
          <div className="flex flex-col justify-center py-20 pr-16">
            <Eyebrow text={service.shortTitle} light />
            <Reveal delay={0.05}>
              <h1
                className="font-black leading-[0.88] tracking-[-0.05em] text-white mb-6"
                style={{ fontSize: "clamp(52px, 6vw, 84px)" }}
              >
                {service.tagline}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-[17px] leading-[1.75] mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>
                {service.longDescription}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                to={langPath(lang, "/contact")}
                className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white w-fit flex items-center active:scale-[0.97] transition-transform"
                style={{ background: RED, textDecoration: 'none' }}
              >
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ background: "white" }} />
                <span className="relative z-10 group-hover:text-[#0B0F1A] transition-colors duration-300">Get a Quote</span>
              </Link>
            </Reveal>
          </div>

          {/* Right image */}
          <div className="relative overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              width={800} height={600}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ opacity: 0.6 }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${NAVY} 0%, rgba(11,15,26,0.2) 60%, transparent 100%)` }} />
          </div>
        </div>
      </section>

      {/* What is this service */}
      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <Eyebrow text="Overview" />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(32px, 3.5vw, 44px)", color: NAVY }}>
                  What is<br />{service.shortTitle}?
                </h2>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-8 flex items-center">
              <Reveal delay={0.1}>
                <p className="text-[17px] leading-[1.8]" style={{ color: "rgba(11,15,26,0.5)" }}>
                  {service.whatIs}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: "#F5F5F6", paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <SectionHeading eyebrow="Key Benefits" title="Why it works." />
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(service.benefits || []).map((benefit, i) => (
              <RevealItem key={i}>
                <div className="bg-white border border-[#0B0F1A]/[0.07] p-10">
                  <span className="font-black text-[11px] tracking-[0.25em] uppercase block mb-6" style={{ color: "rgba(11,15,26,0.2)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-6 h-[2px] mb-6" style={{ background: RED }} />
                  <p className="text-[16px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.65)" }}>
                    {benefit}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Where used */}
      <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <Eyebrow text="Coverage" light />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em] text-white" style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}>
                  Where we<br /><span style={{ color: "rgba(255,255,255,0.2)" }}>deploy it.</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {service.whereUsed}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <SectionHeading eyebrow="Campaign Process" title={`Our ${service.shortTitle} Campaign Process`} titleAccent="" />
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {(service.process || []).map((step, i) => (
              <RevealItem key={i}>
                <div className="bg-white p-10">
                  <span className="font-black text-[11px] tracking-[0.25em] uppercase block mb-5" style={{ color: RED }}>
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[16px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.6)" }}>
                    {step}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Why Choose HORIZON OOH — controlled from dashboard */}
      {(() => {
        const whyCols: { title?: string; text?: string }[] = (service as any).whyChoose ?? [];
        // Only render section if at least one column has text
        const hasContent = whyCols.some(c => c?.text?.trim());
        if (!hasContent) return null;
        return (
          <section style={{ background: '#fff', paddingTop: 100, paddingBottom: 100 }}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
              <Reveal>
                <h2 className="font-black text-[clamp(28px,3.5vw,44px)] tracking-[-0.03em] mb-12" style={{ color: NAVY }}>
                  Why Choose HORIZON OOH for {service.shortTitle} Advertising?
                </h2>
              </Reveal>
              <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {whyCols.map((col, i) =>
                  col?.text?.trim() ? (
                    <RevealItem key={i}>
                      {col.title && (
                        <h3 className="font-extrabold text-[16px] mb-3 tracking-[-0.01em]" style={{ color: NAVY }}>
                          {col.title}
                        </h3>
                      )}
                      <p className="text-[15px] leading-[1.8]" style={{ color: 'rgba(11,15,26,0.6)' }}>
                        {col.text}
                      </p>
                    </RevealItem>
                  ) : null
                )}
              </RevealGroup>
            </div>
          </section>
        );
      })()}

      {/* Other services */}
      <section style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
              Other Services
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {others.map((s) => (
              <RevealItem key={s.id}>
                <Link
                  to={serviceHref(lang, s.slug)}
                  className="group flex items-center justify-between p-6 bg-white border border-[#0B0F1A]/[0.08] hover:bg-[#0B0F1A] hover:border-[#D90429]/30 transition-all duration-300"
                  style={{ textDecoration: "none" }}
                >
                  <div>
                    <p className="font-bold text-[16px] tracking-[-0.01em] text-[#0B0F1A] group-hover:text-white transition-colors duration-400">
                      {s.title}
                    </p>
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase mt-1 text-[rgba(11,15,26,0.3)] group-hover:text-white/50 transition-colors duration-400">
                      {s.tagline}
                    </p>
                  </div>
                  <span className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" style={{ color: RED }}>→</span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner title={`Launch your ${service.shortTitle} campaign.`} subtitle="We'll handle everything — from site selection to campaign reporting." buttonLabel="Get a Quote" />
    </>
  );
}
