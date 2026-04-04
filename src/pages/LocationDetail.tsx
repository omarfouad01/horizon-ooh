import { useParams, Link, useNavigate } from "react-router-dom";
import { LOCATIONS } from "@/data";
import { Reveal, RevealGroup, RevealItem, SectionHeading, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { productHref, RED, NAVY } from "@/lib/routes";

export default function LocationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = LOCATIONS.find((l) => l.slug === slug);

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-[#0B0F1A]/40 text-lg">Location not found.</p>
        <button onClick={() => navigate("/locations")} className="text-[#D90429] font-bold underline">Back to Locations</button>
      </div>
    );
  }

  const others = LOCATIONS.filter((l) => l.id !== location.id).slice(0, 3);

  return (
    <>
      <div className="bg-white pt-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: location.city }]} />
      </div>

      {/* Hero */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 0 }} className="overflow-hidden">
        <div
          className="max-w-[1440px] mx-auto grid"
          style={{ gridTemplateColumns: "1fr 1fr", padding: "0 120px", minHeight: 520 }}
        >
          <div className="flex flex-col justify-center py-20 pr-16">
            <Eyebrow text="Advertising Location" light />
            <Reveal delay={0.05}>
              <h1
                className="font-black leading-[0.88] tracking-[-0.05em] text-white mb-6"
                style={{ fontSize: "clamp(52px, 6vw, 80px)" }}
              >
                {location.headline}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-[17px] leading-[1.75] mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>
                {location.description}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <button
                onClick={() => navigate("/contact")}
                className="group relative h-[52px] px-9 overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white w-fit flex items-center"
                style={{ background: RED }}
              >
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: "white" }} />
                <span className="relative z-10 group-hover:text-[#0B0F1A] transition-colors duration-300">Get a Quote</span>
              </button>
            </Reveal>
          </div>
          <div className="relative overflow-hidden">
            <img src={location.image} alt={location.city} className="w-full h-full object-cover" style={{ opacity: 0.6 }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${NAVY} 0%, rgba(11,15,26,0.15) 65%, transparent 100%)` }} />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <div className="grid grid-cols-2 gap-20">
            <div>
              <Eyebrow text={`Advertising in ${location.city}`} />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: NAVY }}>
                  Why advertise<br /><span style={{ color: "rgba(11,15,26,0.2)" }}>in {location.city}?</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <p className="text-[17px] leading-[1.8]" style={{ color: "rgba(11,15,26,0.5)" }}>
                {location.longDescription}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Available formats */}
      <section style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <SectionHeading eyebrow="Available Formats" title={`What's available`} titleAccent={`in ${location.city}.`} />
          <RevealGroup className="grid grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {location.availableFormats.map((fmt, i) => (
              <RevealItem key={fmt}>
                <div className="bg-white p-8 flex items-start gap-5">
                  <span className="font-black text-[11px] tracking-[0.25em] uppercase mt-0.5 flex-shrink-0" style={{ color: RED }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-[16px] tracking-[-0.01em]" style={{ color: NAVY }}>
                    {fmt}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Featured Locations / Products */}
      {location.products.length > 0 && (
        <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
          <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
            <SectionHeading eyebrow="Featured Inventory" title="Prime locations" titleAccent={`in ${location.city}.`} />
            <RevealGroup className="grid grid-cols-2 gap-6">
              {location.products.map((product) => (
                <RevealItem key={product.id}>
                  <Link
                    to={productHref(location.slug, product.slug)}
                    className="group block overflow-hidden border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/30 transition-colors duration-400"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="relative overflow-hidden" style={{ height: 240 }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ opacity: 0.85 }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.65) 0%, transparent 60%)" }} />
                      <span className="absolute bottom-5 left-6 font-bold text-white tracking-[-0.01em]" style={{ fontSize: 18 }}>{product.name}</span>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          { label: "Type", value: product.type },
                          { label: "Size", value: product.size },
                          { label: "Traffic", value: product.traffic },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>{label}</p>
                            <p className="text-[13px] font-semibold" style={{ color: NAVY }}>{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>View Billboard</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: RED, fontSize: 16 }}>→</span>
                      </div>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* Other cities */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: "rgba(255,255,255,0.25)" }}>Other Markets</p>
          </Reveal>
          <RevealGroup className="grid grid-cols-3 gap-4">
            {others.map((l) => (
              <RevealItem key={l.id}>
                <Link
                  to={`/locations/${l.slug}`}
                  className="group flex items-center justify-between p-6 border border-white/[0.08] hover:border-[#D90429]/40 transition-colors duration-400"
                  style={{ textDecoration: "none" }}
                >
                  <div>
                    <p className="font-bold text-[17px] tracking-[-0.01em] text-white">{l.city}</p>
                    <p className="text-[12px] font-semibold tracking-[0.1em] uppercase mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{l.detail}</p>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 text-xl" style={{ color: RED }}>→</span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner title={`Ready to advertise in ${location.city}?`} subtitle="Get access to our full inventory — site plans, traffic data, and pricing." buttonLabel="Get a Quote" />
    </>
  );
}
