import { Link } from "react-router-dom";
import { SERVICES } from "@/data";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner, Eyebrow } from "@/components/UI";
import { serviceHref, RED, NAVY } from "@/lib/routes";

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Our Services."
        titleAccent="Full-spectrum OOH."
        subtitle="From roadside billboards to airport video walls — we own every outdoor touchpoint that matters in Egypt."
        dark={false}
      />

      {/* Services grid */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <RevealGroup className="grid grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {SERVICES.map((service, i) => (
              <RevealItem key={service.id}>
                <Link
                  to={serviceHref(service.slug)}
                  className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 flex flex-col h-full"
                  style={{ padding: "48px 40px 44px", textDecoration: "none" }}
                >
                  {/* Number */}
                  <span
                    className="font-black text-[11px] tracking-[0.25em] uppercase mb-10 transition-colors duration-500 group-hover:text-white/15"
                    style={{ color: "rgba(11,15,26,0.15)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <h2
                    className="font-bold tracking-[-0.02em] mb-4 transition-colors duration-500 group-hover:text-white"
                    style={{ fontSize: 22, color: NAVY, lineHeight: 1.2 }}
                  >
                    {service.title}
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
                    className="text-[15px] leading-[1.7] flex-1 transition-colors duration-500 group-hover:text-white/40"
                    style={{ color: "rgba(11,15,26,0.45)" }}
                  >
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 mt-8">
                    <span
                      className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300"
                      style={{ color: RED }}
                    >
                      Explore Service
                    </span>
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0"
                      style={{ color: RED, fontSize: 18, lineHeight: 1 }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <RevealGroup className="grid grid-cols-3">
            {[
              { value: "9,500+", label: "Locations Nationwide" },
              { value: "6", label: "Media Formats" },
              { value: "100+", label: "Brand Partners" },
            ].map((stat, i) => (
              <RevealItem key={stat.label}>
                <div
                  className="flex flex-col items-center py-10 text-center"
                  style={{ borderRight: i < 2 ? "1px solid rgba(11,15,26,0.08)" : "none" }}
                >
                  <span
                    className="font-black leading-none tracking-[-0.05em] mb-3"
                    style={{ fontSize: "clamp(40px, 4.5vw, 60px)", color: RED }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-[11px] font-semibold tracking-[0.22em] uppercase"
                    style={{ color: "rgba(11,15,26,0.35)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner
        title="Need help choosing the right format?"
        subtitle="Our media strategists will match the right outdoor mix to your campaign objectives."
        buttonLabel="Talk to Us"
      />
    </>
  );
}
