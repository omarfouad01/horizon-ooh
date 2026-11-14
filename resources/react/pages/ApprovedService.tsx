import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Breadcrumb, RedBtn, safeJsonLd } from "@/components/UI";
import { useLang } from "@/i18n/LangContext";
import { langPath, serviceHref } from "@/lib/routes";
import approved from "@/lib/approvedServices.json";
import { editorialHeading, ServiceCard, servicesContainer as container, servicesFocus } from "./ServiceCard";

type Entry = (typeof approved.services)[keyof typeof approved.services];
type CTA = Entry["en"]["cta"];
const services: Record<string, Entry> = approved.services;

export function approvedService(slug: string, saved?: Partial<Entry>): Entry | undefined {
  const base = services[slug];
  return base && {
    en: saved?.en ?? base.en,
    ar: saved?.ar ?? base.ar,
    related: saved?.related ?? base.related,
  };
}

export function ApprovedCTA({ copy, href, visualHeading }: { copy: CTA; href: string; visualHeading?: string }) {
  return <section className="border-b border-white/10 bg-[#0B0F1A] py-20 text-white lg:py-24">
    <div className={`${container} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
      <div className="min-w-0">
        <h2 className={visualHeading ? "sr-only" : "break-words text-3xl font-black sm:text-5xl"}>{copy.heading}</h2>
        {visualHeading && <p className="break-words text-3xl font-black sm:text-5xl">{visualHeading}</p>}
        <p className="mt-4 max-w-3xl leading-relaxed text-white/75">{copy.description}</p>
      </div>
      <div className="shrink-0"><RedBtn exactLabel label={copy.button} href={href} /></div>
    </div>
  </section>;
}

export function ApprovedService({ slug, entry, image, imageAlt }: {
  slug: string; entry: Entry; image?: string; imageAlt?: string;
}) {
  const { lang, isAr, t } = useLang();
  const copy = isAr ? entry.ar : entry.en;
  const basePath = `/services/${slug}`;
  const url = `https://horizonooh.com${langPath(lang, basePath)}`;
  const quote = langPath(lang, "/contact") + "?" + new URLSearchParams({ source: "service", service: slug });
  const locations = slug === "billboard-advertising-in-egypt" || slug === "outdoor-media-planning-buying";
  return <>
    <SEO exact title={entry.en.title} titleAr={entry.ar.title} description={entry.en.description} descriptionAr={entry.ar.description} canonical={basePath} ogImage={image} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": "https://horizonooh.com/#organization", name: "Horizon OOH", url: "https://horizonooh.com" },
        { "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: isAr ? "ar" : "en", mainEntity: { "@id": url + "#service" } },
        { "@type": "Service", "@id": url + "#service", name: copy.heading, description: copy.description, url,
          provider: { "@id": "https://horizonooh.com/#organization" }, areaServed: { "@type": "Country", name: "Egypt" } },
      ],
    }) }} />
    <div data-approved-service={slug} dir={isAr ? "rtl" : "ltr"} lang={isAr ? "ar" : "en"}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: copy.heading }]} />
      <section className="bg-[#0B0F1A] py-16 text-white lg:py-24">
        <div className={`${container} grid items-center gap-10 ${image ? "lg:grid-cols-2" : ""}`}>
          <div className="min-w-0">
            <h1 className={editorialHeading}>{copy.heading}</h1>
            <p className="mb-8 mt-6 max-w-3xl text-lg leading-relaxed text-white/80">{copy.intro}</p>
            <RedBtn exactLabel label={copy.cta.button} href={quote} />
          </div>
          {image && <img src={image} alt={imageAlt ?? ""} width={800} height={600} fetchPriority="high" decoding="async" className="aspect-[4/3] h-auto min-w-0 w-full object-cover" />}
        </div>
      </section>
      {copy.sections.map((section, index) => <section key={index} className={`py-16 ${index % 2 ? "bg-[#F5F5F6]" : "bg-white"}`}>
        <div className={`${container} grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16`}>
          <h2 className="break-words text-3xl font-black leading-tight sm:text-4xl ltr:tracking-[-0.04em]">{section.heading}</h2>
          <div className="min-w-0 max-w-3xl">
            {index === 3 ? <ol className="list-decimal divide-y divide-[#0B0F1A]/10 ps-6 marker:font-black marker:text-[#D90429]">{section.items.map((item, i) =>
              <li key={i} className="py-4 ps-2 first:pt-0"><strong>{"label" in item && item.label}</strong>{" "}{item.text}</li>)}</ol>
              : <div className="divide-y divide-[#0B0F1A]/10">{section.items.map((item, i) => <div key={i} className="break-words py-5 leading-relaxed first:pt-0 last:pb-0">
                {"label" in item && <h3 className="mb-2 text-lg font-bold">{item.label}</h3>}
                <p className="text-[#0B0F1A]/75">{item.text}</p>
              </div>)}</div>}
            {locations && index === 0 && <Link to={langPath(lang, "/locations")} className={`mt-5 inline-block font-bold underline ${servicesFocus}`}>{isAr ? "المواقع" : "Locations"}</Link>}
          </div>
        </div>
      </section>)}
      <section className="bg-[#F5F5F6] py-16">
        <div className={container}>
          <h2 className="mb-6 text-3xl font-black">{isAr ? "خدمات ذات صلة" : "Related Services"}</h2>
          <ul className={`grid gap-px border border-[#0B0F1A]/10 bg-[#E5E5E7] md:grid-cols-2 ${entry.related.length === 3 ? "lg:grid-cols-3" : ""}`}>
            {entry.related.map(target => <li key={target}>
              <ServiceCard href={serviceHref(lang, target)} title={(isAr ? services[target].ar : services[target].en).heading}
                action={t("services.exploreService")} rtl={isAr} />
            </li>)}
          </ul>
        </div>
      </section>
      <ApprovedCTA copy={copy.cta} href={quote} />
    </div>
  </>;
}
