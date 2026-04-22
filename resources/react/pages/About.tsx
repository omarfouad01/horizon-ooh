import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/dataStore";
import LogoMarquee from "@/components/LogoMarquee";
import { Reveal, RevealGroup, RevealItem, PageHero, SectionHeading, CTABanner, Eyebrow } from "@/components/UI";
import { ROUTES, RED, NAVY } from "@/lib/routes";
import SEO from "@/components/SEO";
import { useLang } from "@/i18n/LangContext";

export default function About() {
  const store   = useStore();
  const about   = store.about;
  const navigate = useNavigate();
  const { isAr, t } = useLang();

  return (
    <>
      <SEO
        title="About HORIZON OOH | Outdoor Advertising Agency Egypt"
        description="HORIZON OOH is Egypt's premier outdoor advertising company — 9,500+ locations, billboard, DOOH, mall and airport advertising across Cairo, Alexandria and nationwide."
        keywords="outdoor advertising Egypt, billboard advertising Egypt, DOOH Egypt, advertising agency Egypt, OOH advertising Egypt, HORIZON OOH"
      />

      {/* Hero */}
      <PageHero
        eyebrow={isAr && (about as any).heroEyebrowAr ? (about as any).heroEyebrowAr : about.heroEyebrow}
        title={isAr && (about as any).heroTitleAr ? (about as any).heroTitleAr : about.heroTitle}
        titleAccent={isAr && (about as any).heroAccentAr ? (about as any).heroAccentAr : about.heroAccent}
        dark={false}
      />

      {/* Short intro */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <Reveal>
              <p
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}
              >
                {isAr && (about as any).introHeadlineAr ? (about as any).introHeadlineAr : about.introHeadline}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.5)" }}>
                {isAr && (about as any).introParagraph1Ar ? (about as any).introParagraph1Ar : about.introParagraph1}
              </p>
              <p className="text-[17px] leading-[1.75] mt-5" style={{ color: "rgba(11,15,26,0.5)" }}>
                {isAr && (about as any).introParagraph2Ar ? (about as any).introParagraph2Ar : about.introParagraph2}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEO Expertise Section */}
      <section style={{ background: "#fff", paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <h2 className="font-black text-[clamp(28px,3.5vw,44px)] tracking-[-0.03em] mb-16" style={{ color: NAVY }}>
              {isAr && (about as any).seoHeadingAr ? (about as any).seoHeadingAr : about.seoHeading}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <RevealGroup className="flex flex-col gap-8">
              {[
                { h: isAr ? 'الإعلان على اللوحات في مصر' : "Billboard Advertising Egypt", p: isAr ? 'أكثر من 9,500 موقع إعلاني متميز على الطرق في القاهرة والإسكندرية والمدن المصرية الكبرى' : "9,500+ premium roadside billboard locations across Cairo, Alexandria and major Egyptian cities" },
                { h: isAr ? 'الإعلان الرقمي الخارجي في القاهرة' : "DOOH Advertising Cairo", p: isAr ? 'شاشات رقمية ديناميكية في البيئات الحضرية والتجزئة والنقل المتميزة في مصر' : "Dynamic digital screens in Egypt's premium urban, retail and transport environments" },
                { h: isAr ? 'إعلانات المولات والمطارات' : "Mall & Airport Advertising", p: isAr ? 'تنسيقات متميزة في أفضل مراكز التسوق في مصر ومطار القاهرة الدولي' : "Premium formats in Egypt's top shopping centres and Cairo International Airport" },
              ].map((item) => (
                <RevealItem key={item.h}>
                  <div className="border-l-2 pl-6" style={{ borderColor: RED }}>
                    <h3 className="font-bold text-[16px] mb-2" style={{ color: NAVY }}>{item.h}</h3>
                    <p className="text-[14px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.5)" }}>{item.p}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal delay={0.1}>
              <p className="text-[16px] leading-[1.85]" style={{ color: "rgba(11,15,26,0.55)" }}>
                {isAr && (about as any).seoParagraphAr ? (about as any).seoParagraphAr : about.seoParagraph}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Full about — navy section */}
      <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <Eyebrow text={t('about.whoWeAre')} light />
              <Reveal delay={0.05}>
                <h2
                  className="font-black leading-[0.9] tracking-[-0.04em] text-white"
                  style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
                >
                  {isAr && (about as any).darkTitleAr ? (about as any).darkTitleAr : about.darkTitle}
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>{isAr && (about as any).darkAccentAr ? (about as any).darkAccentAr : about.darkAccent}</span>
                </h2>
              </Reveal>
            </div>
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              {(isAr && (about as any).darkParagraphsAr?.length ? (about as any).darkParagraphsAr : about.darkParagraphs).map((para: string, i: number) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p className="text-[16px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {para}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <SectionHeading
            eyebrow={t('about.whyHorizon')}
            title={isAr && (about as any).whyTitleAr ? (about as any).whyTitleAr : about.whyTitle}
            titleAccent={isAr && (about as any).whyAccentAr ? (about as any).whyAccentAr : about.whyAccent}
          />

          <RevealGroup className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
            {about.whyItems.map((item) => (
              <RevealItem key={item.id}>
                <div
                  className="group flex items-start gap-10 py-8 border-b border-[#0B0F1A]/[0.07] hover:bg-[#F5F5F6] transition-colors duration-300 px-4 -mx-4 cursor-default"
                >
                  <span
                    className="font-black text-[11px] tracking-[0.25em] uppercase flex-shrink-0 mt-1"
                    style={{ color: RED, minWidth: 32 }}
                  >
                    {item.num}
                  </span>
                  <h3
                    className="font-bold tracking-[-0.02em] flex-shrink-0"
                    style={{ fontSize: 20, color: NAVY, minWidth: 280 }}
                  >
                    {isAr && (item as any).titleAr ? (item as any).titleAr : item.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.45)" }}>
                    {isAr && (item as any).descAr ? (item as any).descAr : item.desc}
                  </p>
                  <span
                    className="text-xl ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                    style={{ color: RED, lineHeight: 1, marginTop: 2 }}
                  >
                    →
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Key Numbers */}
      <section style={{ background: "#F5F5F6", paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <SectionHeading eyebrow={t('about.byTheNumbers')} title={t('about.scaleTitle')} titleAccent={t('about.scaleAccent')} />
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#0B0F1A]/[0.08]">
            {about.keyStats.map((stat, i) => (
              <RevealItem key={stat.id}>
                <div
                  className="flex flex-col py-14 px-10"
                  style={{ borderRight: i < about.keyStats.length - 1 ? "1px solid rgba(11,15,26,0.08)" : "none" }}
                >
                  <span
                    className="font-black leading-none tracking-[-0.05em] mb-4"
                    style={{ fontSize: "clamp(52px, 5vw, 72px)", color: RED }}
                  >
                    {stat.value}
                  </span>
                  <span className="font-bold text-[18px] tracking-[-0.01em]" style={{ color: NAVY }}>
                    {stat.label}
                  </span>
                  <span className="text-[12px] tracking-[0.2em] uppercase font-semibold mt-2" style={{ color: "rgba(11,15,26,0.3)" }}>
                    {stat.sub}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Clients */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <div className="flex items-center justify-center gap-4 mb-14">
              <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-center" style={{ color: "rgba(11,15,26,0.3)" }}>
                {t('about.trustedBy')}
              </p>
              <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
            </div>
          </Reveal>
          <LogoMarquee brands={store.clientBrands} speed={40} light={true} />
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title={t('about.ctaTitle')}
        subtitle={t('about.ctaSubtitle')}
        buttonLabel={t('about.ctaButton')}
      />
    </>
  );
}