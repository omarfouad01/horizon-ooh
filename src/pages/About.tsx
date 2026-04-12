import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TRUST_STATS, RESULTS, CLIENT_BRANDS } from "@/data";
import { Reveal, RevealGroup, RevealItem, PageHero, SectionHeading, CTABanner, Eyebrow } from "@/components/UI";
import { ROUTES, RED, NAVY, ease } from "@/lib/routes";
import SEO from "@/components/SEO";

const WHY_CHOOSE = [
  {
    num: "01",
    title: "Largest Network in Egypt",
    desc: "9,500+ premium locations nationwide — more inventory, more reach, more impact.",
  },
  {
    num: "02",
    title: "Data-Driven Site Selection",
    desc: "Every location selected using traffic count data, audience mapping, and visibility analysis.",
  },
  {
    num: "03",
    title: "Full-Service Execution",
    desc: "From creative brief to installation and monitoring — one partner for your entire campaign.",
  },
  {
    num: "04",
    title: "Proven Performance",
    desc: "Average 2.7× conversion lift and +180% brand recall across campaigns tracked in 2025.",
  },
  {
    num: "05",
    title: "Exclusive Premium Inventory",
    desc: "First-access rights to Egypt's most sought-after outdoor advertising positions.",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="About HORIZON OOH | Outdoor Advertising Agency Egypt"
        description="HORIZON OOH is Egypt's premier outdoor advertising company — 9,500+ locations, billboard, DOOH, mall and airport advertising across Cairo, Alexandria and nationwide."
        keywords="outdoor advertising Egypt, billboard advertising Egypt, DOOH Egypt, advertising agency Egypt, OOH advertising Egypt, HORIZON OOH"
      />
      {/* Hero */}
      <PageHero
        eyebrow="Our Story"
        title="About Horizon OOH."
        titleAccent="We control visibility."
        dark={false}
      />

      {/* Short intro */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-2 gap-20 items-start">
            <Reveal>
              <p
                className="font-black leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}
              >
                Egypt's leading outdoor advertising partner — since 2008.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.5)" }}>
                Horizon OOH was founded with one conviction: that the most powerful advertising in the world happens in the physical world — where brands and people share real space.
              </p>
              <p className="text-[17px] leading-[1.75] mt-5" style={{ color: "rgba(11,15,26,0.5)" }}>
                We built Egypt's largest premium outdoor network from the ground up, and today we manage 9,500+ locations across Cairo, Alexandria, the North Coast, and every major urban centre in the country.
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
              Egypt's Leading Outdoor Advertising Agency
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <RevealGroup className="flex flex-col gap-8">
              {[
                { h: "Billboard Advertising Egypt", p: "9,500+ premium roadside billboard locations across Cairo, Alexandria and major Egyptian cities" },
                { h: "DOOH Advertising Cairo", p: "Dynamic digital screens in Egypt's premium urban, retail and transport environments" },
                { h: "Mall & Airport Advertising", p: "Premium formats in Egypt's top shopping centres and Cairo International Airport" },
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
                Since 2008, HORIZON OOH has been the outdoor advertising agency of choice for Egypt's most iconic brands. Our billboard advertising network spans Cairo's Ring Road, Sheikh Zayed, New Cairo, and Alexandria's Corniche — delivering unparalleled outdoor advertising reach across Egypt's 100 million+ population. As a full-service OOH advertising agency in Egypt, we combine strategic site selection, creative excellence, and real-time campaign monitoring to maximise your outdoor advertising investment. Whether you need digital out-of-home (DOOH) in Cairo's premium retail districts, mall advertising in Egypt's top shopping centres, or airport advertising at Cairo International Airport, HORIZON OOH delivers outdoor campaigns that make brands impossible to ignore.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Full about — navy section */}
      <section style={{ background: NAVY, paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <Eyebrow text="Who We Are" light />
              <Reveal delay={0.05}>
                <h2
                  className="font-black leading-[0.9] tracking-[-0.04em] text-white"
                  style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
                >
                  More than media.
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>A visibility partner.</span>
                </h2>
              </Reveal>
            </div>
            <div className="col-span-7 flex flex-col gap-6">
              {[
                "Horizon OOH is Egypt's most trusted outdoor advertising company. We don't just sell space — we engineer visibility. Our proprietary network spans highways, malls, airports, city streets, and digital screens, giving brands the infrastructure to be seen everywhere that matters.",
                "Our team of 200+ professionals combines media strategy, data science, creative production, and operational excellence to deliver campaigns that move the needle. We work with Egypt's leading FMCG brands, financial institutions, automotive companies, real estate developers, and international brands entering the Egyptian market.",
                "In 2025 alone, we delivered 1,200+ campaigns, generating over 12 billion OOH impressions across Egypt. Our proprietary traffic and audience data platform lets us predict campaign performance before a single panel goes up.",
              ].map((para, i) => (
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
            eyebrow="Why Horizon OOH"
            title="Five reasons brands"
            titleAccent="choose us."
          />

          <RevealGroup className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
            {WHY_CHOOSE.map((item) => (
              <RevealItem key={item.num}>
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
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.45)" }}>
                    {item.desc}
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
          <SectionHeading eyebrow="By the Numbers" title="The scale behind" titleAccent="every campaign." />
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#0B0F1A]/[0.08]">
            {[
              { value: "9,500+", label: "Premium Locations", sub: "Nationwide" },
              { value: "18", label: "Years in Business", sub: "Since 2008" },
              { value: "100+", label: "Brand Partners", sub: "Active clients" },
            ].map((stat, i) => (
              <RevealItem key={stat.label}>
                <div
                  className="flex flex-col py-14 px-10"
                  style={{ borderRight: i < 2 ? "1px solid rgba(11,15,26,0.08)" : "none" }}
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
                Trusted by 100+ brands across Egypt
              </p>
              <span className="block w-8 h-[1px]" style={{ background: "rgba(11,15,26,0.15)" }} />
            </div>
          </Reveal>
          <RevealGroup className="flex flex-wrap justify-center items-center gap-x-12 gap-y-5">
            {CLIENT_BRANDS.map((brand) => (
              <RevealItem key={brand}>
                <span
                  className="font-bold tracking-[0.12em] uppercase cursor-default transition-colors duration-200 hover:text-[#0B0F1A]/70"
                  style={{ fontSize: 14, color: "rgba(11,15,26,0.2)" }}
                >
                  {brand}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to make your brand impossible to ignore?"
        subtitle="Talk to our team and we'll build a campaign around your objectives."
        buttonLabel="Start a Campaign"
      />
    </>
  );
}
