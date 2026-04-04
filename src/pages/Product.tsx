import { useParams, Link, useNavigate } from "react-router-dom";
import { LOCATIONS } from "@/data";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { RED, NAVY } from "@/lib/routes";

export default function Product() {
  const { city: citySlug, slug } = useParams<{ city: string; slug: string }>();
  const navigate = useNavigate();

  const location = LOCATIONS.find((l) => l.slug === citySlug);
  const product = location?.products.find((p) => p.slug === slug);

  if (!location || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-[#0B0F1A]/40 text-lg">Billboard not found.</p>
        <button onClick={() => navigate("/locations")} className="text-[#D90429] font-bold underline">Back to Locations</button>
      </div>
    );
  }

  const related = location.products.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <div className="bg-white pt-4">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/locations" },
          { label: location.city, href: `/locations/${location.slug}` },
          { label: product.name },
        ]} />
      </div>

      {/* Hero — full-bleed image */}
      <section className="relative overflow-hidden" style={{ height: "70vh", minHeight: 520, background: NAVY }}>
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.9) 0%, rgba(11,15,26,0.3) 60%, transparent 100%)" }} />

        {/* Badge */}
        <div className="absolute top-8 right-8 text-right">
          <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold">Daily Traffic</p>
          <p className="font-black text-white/35 tracking-[-0.04em]" style={{ fontSize: 36 }}>{product.traffic.split(" ")[0]}</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 max-w-[1440px] mx-auto pb-14" style={{ padding: "0 120px 56px" }}>
          <Eyebrow text={`${product.type} · ${location.city}`} light />
          <Reveal delay={0.05}>
            <h1 className="font-black leading-[0.88] tracking-[-0.05em] text-white" style={{ fontSize: "clamp(44px, 5.5vw, 76px)" }}>
              {product.name}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[16px] mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>{product.location}</p>
          </Reveal>
        </div>
      </section>

      {/* Specs + Description */}
      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <div className="grid grid-cols-12 gap-12">
            {/* Specs sidebar */}
            <div className="col-span-4">
              <Eyebrow text="Specifications" />
              <div className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
                {product.specs.map((spec) => (
                  <Reveal key={spec.label}>
                    <div className="flex items-center justify-between py-5 border-b border-[#0B0F1A]/[0.07]">
                      <span className="text-[12px] font-semibold tracking-[0.15em] uppercase" style={{ color: "rgba(11,15,26,0.35)" }}>
                        {spec.label}
                      </span>
                      <span className="text-[14px] font-bold" style={{ color: NAVY }}>
                        {spec.value}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Book CTA */}
              <div className="mt-10">
                <button
                  onClick={() => navigate("/contact")}
                  className="group relative w-full h-[56px] overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center"
                  style={{ background: RED }}
                >
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: NAVY }} />
                  <span className="relative z-10">Book this Location</span>
                </button>
              </div>
            </div>

            {/* Description + Benefits */}
            <div className="col-span-8">
              <Eyebrow text="Overview" />
              <Reveal delay={0.06}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em] mb-8" style={{ fontSize: "clamp(32px, 3vw, 44px)", color: NAVY }}>
                  Billboard Advertising<br />
                  <span style={{ color: "rgba(11,15,26,0.2)" }}>in {location.city}.</span>
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="text-[17px] leading-[1.8] mb-12" style={{ color: "rgba(11,15,26,0.5)" }}>
                  The {product.name} is one of the most strategically positioned billboard sites in {location.city} — delivering {product.traffic} at a visible distance of {product.visibility}. This {product.type.toLowerCase()} provides unmatched exposure for brands targeting {location.city}'s premium audience.
                </p>
              </Reveal>

              {/* Benefits */}
              <div>
                <Eyebrow text="Key Benefits" />
                <RevealGroup className="flex flex-col gap-5">
                  {product.benefits.map((benefit, i) => (
                    <RevealItem key={i}>
                      <div className="flex items-start gap-5">
                        <span className="mt-2 flex-shrink-0 w-[5px] h-[5px]" style={{ background: RED }} />
                        <p className="text-[16px] leading-[1.7]" style={{ color: "rgba(11,15,26,0.55)" }}>{benefit}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ background: "#F5F5F6", paddingTop: 80, paddingBottom: 80 }}>
          <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
            <Reveal>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8" style={{ color: "rgba(11,15,26,0.3)" }}>
                Related Locations
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-6">
              {related.map((rel) => (
                <RevealItem key={rel.id}>
                  <Link
                    to={`/locations/${citySlug}/billboards/${rel.slug}`}
                    className="group flex items-center gap-6 p-6 bg-white border border-[#0B0F1A]/[0.08] hover:bg-[#0B0F1A] transition-colors duration-400"
                    style={{ textDecoration: "none" }}
                  >
                    <img src={rel.image} alt={rel.name} className="w-20 h-16 object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-[15px] tracking-[-0.01em] mb-1 transition-colors duration-400 group-hover:text-white" style={{ color: NAVY }}>{rel.name}</p>
                      <p className="text-[12px] transition-colors duration-400 group-hover:text-white/30" style={{ color: "rgba(11,15,26,0.4)" }}>{rel.type} · {rel.size}</p>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg" style={{ color: RED }}>→</span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <CTABanner title={`Book ${product.name} today.`} subtitle="Contact our team for availability, pricing, and campaign packages." buttonLabel="Book this Location" />
    </>
  );
}
