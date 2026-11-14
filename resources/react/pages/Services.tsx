import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import approved from "@/lib/approvedServices.json";
import { ApprovedCTA, approvedService } from "./ApprovedService";
import { useStore } from "@/store/dataStore";
import { RevealGroup, RevealItem } from "@/components/UI";
import { serviceHref, langPath, RED } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import { ServiceIcon } from "@/components/ServiceIcon";

export default function Services() {
  const { services: SERVICES } = useStore()
  const { lang, isAr, t } = useLang()
  const copy = isAr ? approved.directory.ar : approved.directory.en;
  const slugs = Object.keys(approved.services);
  const groups = [slugs.filter((_, i) => [0,1,2,5,7,8,9,10].includes(i)), slugs.filter((_, i) => [3,4,6,11].includes(i)), slugs.slice(12)];
  return (
    <>
      <SEO exact title={approved.directory.en.title} titleAr={approved.directory.ar.title}
        description={approved.directory.en.description} descriptionAr={approved.directory.ar.description} canonical="/services" />
      <header data-approved-directory className="bg-[#F5F5F6] px-4 pb-20 pt-32 sm:px-8 lg:px-[120px]">
        <h1 className="mx-auto max-w-[1200px] break-words text-4xl font-black lg:text-6xl">{copy.heading}</h1>
        <p className="mx-auto mt-6 max-w-[1200px] text-lg">{copy.intro}</p>
      </header>

      {/* Services grid */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          {copy.categories.map((section, index) => <section key={section.heading} className="mb-12">
          <h2 className="mb-4 break-words text-3xl font-black">{section.heading}</h2>
          <p className="mb-6 max-w-3xl">{section.text}</p>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {groups[index].map((slug, i) => {
              const service = SERVICES.find(item => item.slug === slug) ?? {slug, id: slug};
              const entry = approvedService(slug, service.editorial?.approved)!;
              const card = isAr ? entry.ar : entry.en;
              return (
              <RevealItem key={service.id} className="h-full">
                <LocalizedElement as={Link}
                  to={serviceHref(lang, service.slug)}
                  className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 flex flex-col h-full"
                  style={{ padding: "48px 40px 44px", textDecoration: "none" }}
                >
                  {/* Icon or Number */}
                  <div className="flex items-center justify-between mb-10">
                    <LocalizedText>{(service as any).icon ? (
                      <span className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[rgba(11,15,26,0.07)] group-hover:border-white/10 transition-all duration-500"
                            style={{ background: 'rgba(11,15,26,0.04)' }}>
                        <ServiceIcon
                          icon={(service as any).icon}
                          size={24}
                          className="text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                        />
                      </span>
                    ) : null}</LocalizedText>
                    <span className="font-black text-[11px] tracking-[0.25em] uppercase text-[rgba(11,15,26,0.15)] group-hover:text-white/15 transition-colors duration-500 ml-auto">
                      <LocalizedText>{String(i + 1).padStart(2, "0")}</LocalizedText>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold tracking-[-0.02em] mb-4 text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                    style={{ fontSize: 22, lineHeight: 1.2 }}
                  >
                    {card.heading}
                  </h3>

                  {/* Divider */}
                  <div
                    className="w-8 h-[1px] mb-5 transition-all duration-500 group-hover:w-12"
                    style={{ background: "rgba(11,15,26,0.15)", boxSizing: "border-box" }}
                  />
                  <div
                    className="w-8 h-[1px] -mt-5 mb-5 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12"
                    style={{ background: RED }}
                  />

                  {/* Short desc */}
                  <p
                    className="text-[15px] leading-[1.7] flex-1 text-[rgba(11,15,26,0.45)] group-hover:text-white/70 transition-colors duration-500"
                  >
                    {card.card}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 mt-8">
                    <span
                      className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ color: RED }}
                    >
                      <LocalizedText>{t('services.exploreService')}</LocalizedText>
                    </span>
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0"
                      style={{ color: RED, fontSize: 18, lineHeight: 1 }}
                    ><LocalizedText>
                      →
                    </LocalizedText></span>
                  </div>
                </LocalizedElement>
              </RevealItem>
              );
            })}
          </RevealGroup>
          </section>)}
        </div>
      </section>

      <ApprovedCTA copy={copy.cta} href={langPath(lang, "/contact")} />
    </>
  );
}
