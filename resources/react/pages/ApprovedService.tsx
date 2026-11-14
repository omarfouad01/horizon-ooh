import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Breadcrumb, safeJsonLd } from "@/components/UI";
import { useLang } from "@/i18n/LangContext";
import { langPath, serviceHref } from "@/lib/routes";
import approved from "@/lib/approvedServices.json";

type Entry = (typeof approved.services)[keyof typeof approved.services];
type CTA = Entry["en"]["cta"];
const services: Record<string, Entry> = approved.services;
const container = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-[120px]";
const button = "inline-block max-w-full break-words bg-[#D90429] px-6 py-4 font-bold text-white";

export function approvedService(slug: string, saved?: Partial<Entry>): Entry | undefined {
  const base = services[slug];
  return base && {
    en: saved?.en ?? base.en,
    ar: saved?.ar ?? base.ar,
    related: saved?.related ?? base.related,
  };
}

export function ApprovedCTA({ copy, href }: { copy: CTA; href: string }) {
  return <section className="bg-[#0B0F1A] py-20 text-white">
    <div className={container}>
      <h2 className="break-words text-3xl font-black sm:text-5xl">{copy.heading}</h2>
      <p className="mb-6 mt-4 max-w-3xl text-lg">{copy.description}</p>
      <Link to={href} className={button}>{copy.button}</Link>
    </div>
  </section>;
}

export function ApprovedService({ slug, entry, image, imageAlt }: {
  slug: string; entry: Entry; image?: string; imageAlt?: string;
}) {
  const { lang, isAr } = useLang();
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
            <h1 className="break-words text-4xl font-black leading-tight lg:text-6xl">{copy.heading}</h1>
            <p className="mb-7 mt-6 max-w-3xl text-lg leading-relaxed">{copy.intro}</p>
            <Link to={quote} className={button}>{copy.cta.button}</Link>
          </div>
          {image && <img src={image} alt={imageAlt ?? ""} width={800} height={600} fetchPriority="high" decoding="async" className="aspect-[4/3] w-full object-cover" />}
        </div>
      </section>
      {copy.sections.map((section, index) => <section key={index} className={`py-16 ${index % 2 ? "bg-[#F5F5F6]" : "bg-white"}`}>
        <div className={container}>
          <h2 className="mb-6 break-words text-3xl font-black sm:text-4xl">{section.heading}</h2>
          {index === 3 ? <ol className="list-decimal space-y-4 ps-6">{section.items.map((item, i) =>
            <li key={i}><strong>{"label" in item && item.label}</strong>{" "}{item.text}</li>)}</ol>
            : section.items.map((item, i) => <div key={i} className="mb-5 max-w-4xl leading-relaxed">
              {"label" in item && <h3 className="font-bold">{item.label}</h3>}
              <p>{item.text}</p>
            </div>)}
          {locations && index === 0 && <Link to={langPath(lang, "/locations")} className="font-bold underline">{isAr ? "المواقع" : "Locations"}</Link>}
        </div>
      </section>)}
      <section className="bg-[#F5F5F6] py-16">
        <div className={container}>
          <h2 className="mb-6 text-3xl font-black">{isAr ? "خدمات ذات صلة" : "Related Services"}</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {entry.related.map(target => <li key={target}>
              <Link className="block h-full break-words border border-black/10 bg-white p-5 font-bold hover:text-[#D90429]" to={serviceHref(lang, target)}>
                {(isAr ? services[target].ar : services[target].en).heading}
              </Link>
            </li>)}
          </ul>
        </div>
      </section>
      <ApprovedCTA copy={copy.cta} href={quote} />
    </div>
  </>;
}
