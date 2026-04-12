import { Link } from "react-router-dom";
import { LOCATIONS } from "@/data";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner, Eyebrow } from "@/components/UI";
import { locationHref, RED, NAVY } from "@/lib/routes";

export default function Locations() {
  return (
    <>
      <PageHero
        eyebrow="Our Network"
        title="Advertising Locations"
        titleAccent="Across Egypt."
        subtitle="9,500+ premium outdoor advertising locations across Egypt's most valuable markets — from Cairo's Ring Road to Alexandria's Corniche."
      />

      {/* Locations grid */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {LOCATIONS.map((loc, i) => (
              <RevealItem key={loc.id}>
                <Link
                  to={locationHref(loc.slug)}
                  className="group bg-white hover:bg-[#0B0F1A] transition-colors duration-500 block relative overflow-hidden"
                  style={{ textDecoration: "none" }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 260 }}>
                    <img
                      src={loc.image}
                      alt={`Outdoor advertising in ${loc.city}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ opacity: 0.85 }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.7) 0%, transparent 60%)" }} />
                    <span
                      className="absolute bottom-5 left-6 font-black text-white tracking-[-0.03em]"
                      style={{ fontSize: 28 }}
                    >
                      {loc.city}
                    </span>
                    <span
                      className="absolute top-5 left-6 font-black text-[11px] tracking-[0.2em] uppercase"
                      style={{ color: RED }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "28px 28px 32px" }}>
                    <p
                      className="text-[13px] leading-[1.65] mb-5 transition-colors duration-500 group-hover:text-white/40"
                      style={{ color: "rgba(11,15,26,0.45)" }}
                    >
                      {loc.detail}
                    </p>

                    {/* Formats pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {loc.availableFormats.slice(0, 3).map((fmt) => (
                        <span
                          key={fmt}
                          className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 border transition-colors duration-500 group-hover:border-white/20 group-hover:text-white/30"
                          style={{ borderColor: "rgba(11,15,26,0.12)", color: "rgba(11,15,26,0.4)" }}
                        >
                          {fmt}
                        </span>
                      ))}
                      {loc.availableFormats.length > 3 && (
                        <span
                          className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 transition-colors duration-500 group-hover:text-white/20"
                          style={{ color: "rgba(11,15,26,0.25)" }}
                        >
                          +{loc.availableFormats.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-bold tracking-[0.2em] uppercase"
                        style={{ color: RED }}
                      >
                        Explore Locations
                      </span>
                      <span
                        className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                        style={{ color: RED }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "5", label: "Major Cities" },
              { value: "9,500+", label: "Locations" },
              { value: "6", label: "Ad Formats" },
              { value: "22M+", label: "Daily Audience" },
            ].map((stat, i) => (
              <RevealItem key={stat.label}>
                <div className="flex flex-col" style={{ paddingTop: 8 }}>
                  <div className="w-5 h-[1.5px] mb-5" style={{ background: RED }} />
                  <span className="font-black leading-none tracking-[-0.05em] mb-3" style={{ fontSize: 48, color: RED }}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {stat.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner
        title="Can't find your target market?"
        subtitle="We'll identify the perfect locations for your campaign objectives."
        buttonLabel="Talk to a Strategist"
        dark={false}
      />
    </>
  );
}
