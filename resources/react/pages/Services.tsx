import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { editorialServices } from "@/lib/serviceMetadata";
import { useStore } from "@/store/dataStore";
import { RevealGroup, RevealItem, PageHero, CTABanner } from "@/components/UI";
import { serviceHref, RED } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import { ServiceIcon } from "@/components/ServiceIcon";

export default function Services() {
  const { services: SERVICES } = useStore()
  const { lang, isAr, t } = useLang()
  return (
    <>
      <SEO title="Advertising, Media & Digital Services in Egypt | HORIZON OOH"
        titleAr="خدمات الإعلانات والإنتاج والحلول الرقمية في مصر | هورايزون"
        description="Explore outdoor advertising, media planning, video production, events and digital development services across Egypt, from billboard bookings to ERP and apps."
        descriptionAr="استكشف خدمات الإعلانات الخارجية وتخطيط الحملات والإنتاج والفعاليات والحلول الرقمية في مصر، من حجز اليافطات إلى تطوير المواقع والتطبيقات وأنظمة ERP."
        canonical="/services" />
      <PageHero
        eyebrow={t('services.whatWeDo')}
        title={isAr ? 'خدمات الإعلانات والإنتاج والحلول الرقمية في مصر' : 'Advertising, Media Production & Digital Services in Egypt'}
        subtitle={isAr ? 'خطط لحملتك الإعلانية أو طوّر مشروعك الرقمي مع هورايزون. استكشف خدماتنا واختر ما يناسب أهدافك.' : 'Plan an advertising campaign, produce brand experiences or build a digital product with Horizon OOH.'}
        dark={false}
      />

      {/* Services grid */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {SERVICES.map((service, i) => (
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
                  <h2
                    className="font-bold tracking-[-0.02em] mb-4 text-[#0B0F1A] group-hover:text-white transition-colors duration-500"
                    style={{ fontSize: 22, lineHeight: 1.2 }}
                  >
                    <LocalizedText>{isAr && (service as any).titleAr ? (service as any).titleAr : service.title}</LocalizedText>
                  </h2>

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
                    <LocalizedText>{(isAr ? editorialServices[service.slug]?.descriptionAr || (service as any).descriptionAr : editorialServices[service.slug]?.description) || service.description}</LocalizedText>
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
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner
        title={isAr ? 'ناقش مشروعك مع هورايزون' : 'Discuss Your Project with Horizon OOH'}
        subtitle={isAr ? 'شاركنا أهدافك الإعلانية أو متطلبات مشروعك الرقمي.' : 'Tell us about your campaign or digital project.'}
        buttonLabel={t('services.ctaButton')}
      />
    </>
  );
}