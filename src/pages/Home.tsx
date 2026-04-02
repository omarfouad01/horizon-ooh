import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  SERVICES,
  LOCATIONS,
  PROCESS,
  RESULTS,
  TRUST_STATS,
  CLIENT_BRANDS,
} from "@/data";

// ─── Shared animation helpers ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition as object, delay } } }}
    >
      {children}
    </motion.div>
  );
}

function RevealGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}>
      {children}
    </motion.div>
  );
}

function RevealItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────
function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-6`}>
      <span className="block w-6 h-[2px] bg-[#D90429]" />
      <span className={`text-[11px] font-semibold tracking-[0.25em] uppercase ${light ? "text-white/40" : "text-[#0B0F1A]/40"}`}>
        {text}
      </span>
    </div>
  );
}

// ─── 1. HERO ─────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="min-h-screen bg-white flex items-center pt-[72px]">
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-2 min-h-[calc(100vh-72px)]">
        {/* Left */}
        <div className="flex flex-col justify-center px-[120px] py-[96px]">
          <Reveal>
            <SectionLabel text="Outdoor Advertising" />
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-[64px] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#0B0F1A] mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              Outdoor<br />
              Advertising<br />
              <span className="text-[#0B0F1A]">Agency</span><br />
              <span className="text-[#0B0F1A]/30">in Egypt.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[18px] text-[#0B0F1A]/40 font-medium tracking-[0.05em] uppercase mb-4">
              Billboards.&nbsp; DOOH.&nbsp; Malls.&nbsp; Airports.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="text-[20px] text-[#0B0F1A] font-medium leading-relaxed mb-12 max-w-sm">
              We put your brand where it gets seen.
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => scrollTo("contact")}
                className="h-[52px] px-8 bg-[#D90429] text-white text-[13px] font-bold tracking-[0.15em] uppercase hover:bg-[#b8021f] transition-all duration-200 shadow-lg shadow-[#D90429]/20"
              >
                Get a Quote
              </button>
              <button
                onClick={() => scrollTo("locations")}
                className="h-[52px] px-8 border-2 border-[#0B0F1A] text-[#0B0F1A] text-[13px] font-bold tracking-[0.15em] uppercase hover:bg-[#0B0F1A] hover:text-white transition-all duration-200"
              >
                View Locations
              </button>
            </div>
          </Reveal>
        </div>

        {/* Right — hero image */}
        <div className="relative overflow-hidden bg-[#0B0F1A]">
          <img
            src="https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1200&q=85&fit=crop"
            alt="Premium billboard advertising in Egypt at night"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Subtle overlay for brand consistency */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0B0F1A]/10 to-[#0B0F1A]/30" />
          {/* Floating stat badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-12 left-12 bg-white p-6"
          >
            <p className="text-[#D90429] text-3xl font-black tracking-tight">9,500+</p>
            <p className="text-[#0B0F1A]/60 text-xs font-semibold tracking-[0.15em] uppercase mt-1">Premium Locations</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. TRUST STRIP ──────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <section className="bg-[#0B0F1A] py-[64px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <RevealGroup className="grid grid-cols-3 divide-x divide-white/10">
          {TRUST_STATS.map((stat) => (
            <RevealItem key={stat.label}>
              <div className="flex flex-col items-center py-8 px-12 text-center">
                <span className="text-[#D90429] text-[48px] font-black tracking-[-0.03em] leading-none">
                  {stat.value}
                </span>
                <span className="text-white/40 text-[13px] font-medium tracking-[0.2em] uppercase mt-3">
                  {stat.label}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 3. SERVICES GRID ────────────────────────────────────────────────────
function ServicesSection() {
  return (
    <section id="services" className="bg-white py-[120px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <Reveal>
          <SectionLabel text="Our Services" />
        </Reveal>
        <div className="flex items-end justify-between mb-16">
          <Reveal>
            <h2 className="text-[52px] font-extrabold tracking-[-0.03em] text-[#0B0F1A] leading-[1.1] max-w-lg">
              Every channel.<br />Every market.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-[#0B0F1A]/45 text-[17px] leading-relaxed max-w-xs text-right">
              Full-spectrum outdoor media solutions across Egypt's major urban centres.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="grid grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <RevealItem key={service.id}>
              <div className="group border border-[#0B0F1A]/10 p-8 hover:border-[#D90429]/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white">
                <div className="text-3xl mb-6">{service.icon}</div>
                <h3 className="text-[18px] font-bold text-[#0B0F1A] tracking-[-0.01em] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#0B0F1A]/50 text-[15px] leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[#D90429] text-[12px] font-bold tracking-[0.15em] uppercase">Learn more</span>
                  <span className="text-[#D90429] text-lg leading-none">→</span>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 4. FEATURE — OWN THE ROAD ────────────────────────────────────────────
function FeatureSection() {
  return (
    <section className="bg-[#0B0F1A] py-0 overflow-hidden">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 min-h-[560px]">
        {/* Text left */}
        <div className="flex flex-col justify-center px-[120px] py-[96px]">
          <Reveal>
            <SectionLabel text="Billboard Advertising" light />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-[72px] font-black tracking-[-0.04em] text-white leading-[0.95] mb-12">
              Own<br />the road.
            </h2>
          </Reveal>
          <RevealGroup className="flex flex-col gap-6">
            {[
              "Prime roadside locations across Egypt's highest-traffic corridors",
              "Maximum visibility — millions of daily impressions",
              "High-impact large-format exposure that commands attention",
            ].map((bullet) => (
              <RevealItem key={bullet}>
                <div className="flex items-start gap-4">
                  <span className="mt-1.5 block w-2 h-2 bg-[#D90429] flex-shrink-0" />
                  <p className="text-white/60 text-[16px] leading-relaxed">{bullet}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.4}>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-12 inline-flex items-center gap-3 h-[52px] px-8 bg-[#D90429] text-white text-[13px] font-bold tracking-[0.15em] uppercase hover:bg-[#b8021f] transition-colors duration-200 w-fit"
            >
              Book a Billboard
            </button>
          </Reveal>
        </div>

        {/* Image right */}
        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1629150154933-a42577786d4f?w=900&q=85&fit=crop"
            alt="Large format billboard advertising at night"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F1A]/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}

// ─── 5. LOCATIONS ─────────────────────────────────────────────────────────
function LocationsSection() {
  return (
    <section id="locations" className="bg-white py-[120px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <Reveal>
          <SectionLabel text="Coverage Map" />
        </Reveal>
        <div className="flex items-end justify-between mb-16">
          <Reveal>
            <h2 className="text-[52px] font-extrabold tracking-[-0.03em] text-[#0B0F1A] leading-[1.1]">
              From Cairo<br />to the Coast.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="h-[48px] px-8 border-2 border-[#0B0F1A] text-[#0B0F1A] text-[12px] font-bold tracking-[0.15em] uppercase hover:bg-[#0B0F1A] hover:text-white transition-all duration-200"
            >
              View All Locations
            </button>
          </Reveal>
        </div>

        <RevealGroup className="grid grid-cols-3 gap-6">
          {LOCATIONS.map((loc, i) => (
            <RevealItem key={loc.city}>
              <div className="group border border-[#0B0F1A]/10 p-8 hover:bg-[#0B0F1A] transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#D90429] text-[11px] font-bold tracking-[0.2em] uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[#0B0F1A]/20 group-hover:text-white/20 text-lg transition-colors">→</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-[#0B0F1A] group-hover:text-white tracking-[-0.01em] mb-2 transition-colors">
                  {loc.city}
                </h3>
                <p className="text-[#0B0F1A]/45 group-hover:text-white/40 text-[14px] transition-colors">
                  {loc.detail}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 6. PROCESS ──────────────────────────────────────────────────────────
function ProcessSection() {
  return (
    <section className="bg-[#0B0F1A] py-[120px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <Reveal>
          <SectionLabel text="How We Work" light />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-[52px] font-extrabold tracking-[-0.03em] text-white leading-[1.1] mb-16">
            Campaign in 4 steps.
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-4 gap-6">
          {PROCESS.map((step, i) => (
            <RevealItem key={step.step}>
              <div className="relative flex flex-col gap-6 pt-8 border-t border-white/10">
                {/* Connector line (not on last) */}
                {i < PROCESS.length - 1 && (
                  <div className="absolute top-0 right-0 w-1/2 h-[1px] bg-white/10 hidden xl:block" />
                )}
                <span className="text-[#D90429] text-[11px] font-bold tracking-[0.3em] uppercase font-mono">
                  {step.step}
                </span>
                <h3 className="text-[26px] font-extrabold text-white tracking-[-0.02em]">
                  {step.label}
                </h3>
                <p className="text-white/40 text-[15px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 7. RESULTS ──────────────────────────────────────────────────────────
function ResultsSection() {
  return (
    <section id="results" className="bg-white py-[120px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <Reveal>
          <SectionLabel text="Proven Results" />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-[52px] font-extrabold tracking-[-0.03em] text-[#0B0F1A] leading-[1.1] mb-16">
            Numbers that speak.
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-3 divide-x divide-[#0B0F1A]/10">
          {RESULTS.map((r) => (
            <RevealItem key={r.label}>
              <div className="flex flex-col items-center py-12 px-8 text-center">
                <span className="text-[#D90429] text-[72px] font-black tracking-[-0.04em] leading-none">
                  {r.value}
                </span>
                <span className="text-[#0B0F1A] text-[18px] font-bold tracking-[-0.01em] mt-4">
                  {r.label}
                </span>
                <span className="text-[#0B0F1A]/40 text-[14px] mt-2 tracking-wider uppercase">
                  {r.sublabel}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 8. CLIENTS ──────────────────────────────────────────────────────────
function ClientsSection() {
  return (
    <section id="about" className="bg-[#F7F7F8] py-[96px]">
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <Reveal>
          <p className="text-[#0B0F1A]/30 text-[13px] font-semibold tracking-[0.25em] uppercase text-center mb-12">
            Trusted by 100+ brands across Egypt
          </p>
        </Reveal>

        <RevealGroup className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6">
          {CLIENT_BRANDS.map((brand) => (
            <RevealItem key={brand}>
              <span className="text-[#0B0F1A]/25 text-[15px] font-bold tracking-[0.15em] uppercase hover:text-[#0B0F1A]/60 transition-colors duration-200 cursor-default">
                {brand}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

// ─── 9. SIGNATURE ─────────────────────────────────────────────────────────
function SignatureSection() {
  return (
    <section className="bg-[#0B0F1A] py-[160px] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-[120px] text-center">
        <Reveal>
          <h2
            className="text-[80px] md:text-[100px] font-black tracking-[-0.04em] text-white leading-[0.95] uppercase"
            style={{ letterSpacing: "-0.04em" }}
          >
            WE MAKE BRANDS
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <h2
            className="text-[80px] md:text-[100px] font-black tracking-[-0.04em] leading-[0.95] uppercase"
            style={{ letterSpacing: "-0.04em" }}
          >
            <span className="text-[#D90429]">IMPOSSIBLE</span>{" "}
            <span className="text-white">TO IGNORE.</span>
          </h2>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 10. FINAL CTA ────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section id="contact" className="bg-white py-[160px]">
      <div className="max-w-[1440px] mx-auto px-[120px] text-center">
        <Reveal>
          <SectionLabel text="Let's Work Together" />
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-[56px] font-extrabold tracking-[-0.03em] text-[#0B0F1A] leading-[1.1] mb-6 max-w-2xl mx-auto">
            Ready to launch your campaign?
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-[20px] text-[#0B0F1A]/45 mb-12 max-w-md mx-auto leading-relaxed">
            Let's put your brand where it gets seen.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex items-center justify-center gap-5">
            <a
              href="mailto:info@horizonooh.com"
              className="inline-flex items-center h-[56px] px-10 bg-[#D90429] text-white text-[14px] font-bold tracking-[0.15em] uppercase hover:bg-[#b8021f] transition-colors duration-200 shadow-xl shadow-[#D90429]/20"
            >
              Get a Quote
            </a>
            <a
              href="tel:+20212345678"
              className="inline-flex items-center h-[56px] px-10 border-2 border-[#0B0F1A] text-[#0B0F1A] text-[14px] font-bold tracking-[0.15em] uppercase hover:bg-[#0B0F1A] hover:text-white transition-all duration-200"
            >
              Call Us
            </a>
          </div>
        </Reveal>

        {/* Trust micro-copy */}
        <Reveal delay={0.4}>
          <div className="mt-16 flex items-center justify-center gap-8">
            {["No long-term contracts", "Nationwide coverage", "24-hr response"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#D90429] block" />
                <span className="text-[#0B0F1A]/35 text-[12px] font-medium tracking-[0.1em] uppercase">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ServicesSection />
      <FeatureSection />
      <LocationsSection />
      <ProcessSection />
      <ResultsSection />
      <ClientsSection />
      <SignatureSection />
      <FinalCTASection />
    </>
  );
}
