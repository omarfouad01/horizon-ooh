import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Eyebrow } from "@/components/UI";
import { ApprovedCTA, approvedService } from "./ApprovedService";
import { editorialHeading, ServiceCard, servicesContainer, servicesFocus } from "./ServiceCard";
import approved from "@/lib/approvedServices.json";
import { useStore } from "@/store/dataStore";
import { serviceHref, langPath } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

const categories = [
  { id: "advertising-media", nav: "Advertising & Media", slugs: [
    "billboard-advertising-in-egypt", "dooh-advertising-in-egypt", "airport-advertising-in-egypt",
    "mall-advertising", "in-flight-advertising", "on-screen-cinema-advertising",
    "outdoor-media-planning-buying", "ad-airing-media-distribution",
  ] },
  { id: "production-events", nav: "Production & Events", slugs: [
    "commercial-video-production", "booth-activation-production", "event-management-brand-activations", "pr-communication-services",
  ] },
  { id: "technology-solutions", nav: "Technology Solutions", slugs: [
    "erp-solutions", "website-development", "mobile-applications",
  ] },
] as const;

export default function Services() {
  const { services } = useStore();
  const { lang, isAr, t } = useLang();
  const copy = isAr ? approved.directory.ar : approved.directory.en;
  const [active, setActive] = useState("");
  useEffect(() => {
    const update = () => {
      const current = [...categories].reverse().find(({ id }) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= 124;
      });
      setActive(current?.id ?? "");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <>
    <SEO exact title={approved.directory.en.title} titleAr={approved.directory.ar.title}
      description={approved.directory.en.description} descriptionAr={approved.directory.ar.description} canonical="/services" />
    <div lang={isAr ? "ar" : "en"} dir={isAr ? "rtl" : "ltr"} data-approved-directory>
      <header className="bg-[#F5F5F6] pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className={servicesContainer}>
          <Eyebrow text={t("services.whatWeDo")} />
          <h1 className="sr-only">{copy.heading}</h1>
          <p className={`max-w-[900px] ${editorialHeading}`}>{isAr ? "خبراتنا. خطوتك القادمة." : "Our Expertise. Your Next Move."}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#0B0F1A]/70">{copy.intro}</p>
        </div>
      </header>
      <nav aria-label={isAr ? "أقسام الخدمات" : "Service categories"} className="border-y border-[#0B0F1A]/10 bg-white">
        <ul className={`${servicesContainer} flex flex-wrap gap-x-6 gap-y-1 py-2 lg:gap-x-10`}>
          {categories.map(({id, nav}, index) => <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "location" : undefined}
              onClick={() => setActive(id)} className={`inline-flex min-h-11 items-center border-b-2 border-transparent py-2 text-sm font-bold text-[#0B0F1A] hover:border-[#D90429] hover:text-[#D90429] aria-[current=location]:border-[#D90429] aria-[current=location]:text-[#D90429] ${servicesFocus}`}>
              {isAr ? copy.categories[index].heading : nav}
            </a>
          </li>)}
        </ul>
      </nav>
      {categories.map(({id, slugs}, index) => {
        const section = copy.categories[index];
        const start = categories.slice(0, index).reduce((sum, category) => sum + category.slugs.length, 0);
        return <section key={id} id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className={`scroll-mt-28 py-16 lg:py-24 ${index % 2 === 1 ? "bg-[#F5F5F6]" : "bg-white"}`}>
          <div className={servicesContainer}>
            <Eyebrow text={`0${index + 1} / ${t("services.whatWeDo")}`} />
            <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[#0B0F1A]/10 pb-6">
              <div className="min-w-0">
                <h2 id={`${id}-title`} className="break-words text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight ltr:tracking-[-0.04em]">{section.heading}</h2>
                <p className="mt-4 max-w-3xl leading-relaxed text-[#0B0F1A]/70">{section.text}</p>
              </div>
              <p className="text-xs font-bold uppercase text-[#0B0F1A]/65 ltr:tracking-[0.2em]">{isAr ? `${slugs.length} خدمات` : `${String(slugs.length).padStart(2, "0")} Services`}</p>
            </div>
            <ul className="grid grid-cols-1 gap-px border border-[#0B0F1A]/10 bg-[#E5E5E7] md:grid-cols-2 lg:grid-cols-3">
              {slugs.map((slug, i) => {
                const service = services.find(item => item.slug === slug);
                const entry = approvedService(slug, service?.editorial?.approved)!;
                const card = isAr ? entry.ar : entry.en;
                return <li key={slug} className="min-w-0">
                  <ServiceCard href={serviceHref(lang, slug)} title={card.heading} description={card.card} icon={service?.icon}
                    action={t("services.exploreService")} number={start + i + 1} rtl={isAr} />
                </li>;
              })}
            </ul>
          </div>
        </section>;
      })}
      <ApprovedCTA copy={copy.cta} href={langPath(lang, "/contact")}
        visualHeading={isAr ? "خلّينا نحوّل مشروعك الجاي إلى واقع." : "Let's Bring Your Next Project to Life."} />
    </div>
  </>;
}
