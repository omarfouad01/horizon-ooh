import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useStore } from "@/store/dataStore";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { RED, NAVY, ease } from "@/lib/routes";
import ProductMap from "@/components/ProductMap";

// ─── Gallery images per billboard type ───────────────────────────────────
const GALLERY_POOLS = {
  night: [
    "https://images.unsplash.com/photo-1702231942007-b255a41475c9?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1636983526696-66425c4ef618?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1632228342988-ad2761509b51?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1749994981004-e8041f867e50?w=1200&q=90&fit=crop",
  ],
  day: [
    "https://images.unsplash.com/photo-1586189393824-dfaafc3691dc?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1658753104951-cda0229679e1?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1622058030255-6f54f94cfb3b?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1714475400244-40ac47a97ef5?w=1200&q=90&fit=crop",
  ],
  context: [
    "https://images.unsplash.com/photo-1624526794347-c2a966b81604?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1559533189-9bd27271f4c4?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1638659782541-15c52f28dadb?w=1200&q=90&fit=crop",
    "https://images.unsplash.com/photo-1687803551027-be2d8bf58ccc?w=1200&q=90&fit=crop",
  ],
};

interface GalleryImage {
  src: string;
  label: string;
  description: string;
}

function getGallery(productId: string): GalleryImage[] {
  const idx = Math.abs(productId.charCodeAt(0) + productId.charCodeAt(1)) % 4;
  return [
    { src: GALLERY_POOLS.night[idx],   label: "Night View",    description: "24/7 LED-backlit — maximum night-time visibility" },
    { src: GALLERY_POOLS.day[idx],     label: "Day View",      description: "Clear daylight exposure — high-contrast creative" },
    { src: GALLERY_POOLS.context[idx], label: "Traffic Context", description: "Road-level view — audience approach angle" },
    { src: GALLERY_POOLS.night[(idx + 1) % 4], label: "Wide Angle", description: "Full approach corridor — visibility distance" },
  ];
}

// ─── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ images, active, onClose, onNav }: {
  images: GalleryImage[]; active: number; onClose: () => void; onNav: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose, onNav]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "rgba(11,15,26,0.96)" }}
        onClick={onClose}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/50 cursor-pointer hover:bg-white/10 active:bg-white/20 transition-all duration-150"
          style={{ color: "white", fontSize: 20, background: "none" }}>
          ×
        </button>

        {/* Counter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <p className="text-white/40 text-[11px] font-bold tracking-[0.3em] uppercase">
            {active + 1} / {images.length}
          </p>
        </div>

        {/* Image */}
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease }}
          className="relative" style={{ maxWidth: "90vw", maxHeight: "80vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={images[active].src} alt={images[active].label}
            style={{ maxWidth: "90vw", maxHeight: "78vh", objectFit: "contain", display: "block" }} />
          <div className="absolute bottom-0 left-0 right-0 p-4"
            style={{ background: "linear-gradient(to top, rgba(11,15,26,0.9) 0%, transparent 100%)" }}>
            <p className="text-white font-bold text-[14px]">{images[active].label}</p>
            <p className="text-white/45 text-[12px] mt-1">{images[active].description}</p>
          </div>
        </motion.div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); onNav(-1); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-white/15 hover:border-white/40 cursor-pointer hover:bg-white/10 active:bg-white/20 transition-all duration-150"
              style={{ color: "white", fontSize: 20, background: "none" }}>‹</button>
            <button onClick={(e) => { e.stopPropagation(); onNav(1); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-white/15 hover:border-white/40 cursor-pointer hover:bg-white/10 active:bg-white/20 transition-all duration-150"
              style={{ color: "white", fontSize: 20, background: "none" }}>›</button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main product page ────────────────────────────────────────────────────
export default function Product() {
  const { locations: LOCATIONS, settings } = useStore()
  const { city: citySlug, slug } = useParams<{ city: string; slug: string }>();
  const navigate = useNavigate();
  const heroRef  = useRef<HTMLElement>(null);

  const location = LOCATIONS.find((l) => l.slug === citySlug);
  const product  = location?.products.find((p) => p.slug === slug);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  if (!location || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p style={{ color: "rgba(11,15,26,0.4)", fontSize: 17 }}>Billboard not found.</p>
        <button
          onClick={() => navigate("/locations")}
          style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
          className="hover:opacity-70 transition-opacity duration-150">
          Back to Locations
        </button>
      </div>
    );
  }

  const related = location.products.filter((p) => p.slug !== slug).slice(0, 2);
  const fallbackImage = product.image || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1586189393824-dfaafc3691dc?w=1400&q=90&fit=crop';
  const productImages = (product.images && product.images.length ? product.images : [{ id: 'fallback', url: fallbackImage, alt: product.name }])
    .filter(Boolean)
    .map((img: any, i: number) => ({
      id: img.id || `img-${i}`,
      url: img.url || fallbackImage,
      alt: img.alt || `${product.name} image ${i + 1}`,
      title: img.title || `Photo ${i + 1}`,
    }));

  const [heroIdx, setHeroIdx] = useState(0);
  const [detailIdx, setDetailIdx] = useState(0);

  useEffect(() => {
    setHeroIdx(0);
    setDetailIdx(0);
  }, [product.id]);

  useEffect(() => {
    if (productImages.length < 2) return;
    const t = setTimeout(() => setHeroIdx((p) => (p + 1) % productImages.length), 5000);
    return () => clearTimeout(t);
  }, [heroIdx, productImages.length]);

  const nextHero = useCallback(() => setHeroIdx((p) => (p + 1) % productImages.length), [productImages.length]);
  const prevHero = useCallback(() => setHeroIdx((p) => (p - 1 + productImages.length) % productImages.length), [productImages.length]);
  const nextDetail = useCallback(() => setDetailIdx((p) => (p + 1) % productImages.length), [productImages.length]);
  const prevDetail = useCallback(() => setDetailIdx((p) => (p - 1 + productImages.length) % productImages.length), [productImages.length]);

  const specRows = [
    { label: 'English Name', value: product.nameEn || product.name || '[Not set]' },
    { label: 'Code', value: product.code || '[Not set]' },
    { label: 'Type', value: product.type || '[Not set]' },
    { label: 'Sides', value: product.sides ? String(product.sides) : '[Not set]' },
    { label: 'Size', value: product.size || '[Not set]' },
    { label: 'Quantity', value: product.quantity ? String(product.quantity) : '[Not set]' },
    { label: 'Governorate', value: product.city || location.city || '[Not set]' },
    { label: 'District', value: product.district || '[Not set]' },
    { label: 'Lightning', value: product.brightness || '[Not set]' },
    { label: 'Square meter', value: product.sqm ? `${product.sqm} sqm` : '[Not set]' },
    { label: 'Ad Format', value: product.adFormat || '[Not set]' },
  ];
  const whatsappNumber = settings.whatsapp.replace(/\D/g, '') || '201234567890';

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="bg-white pt-4">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/locations" },
          { label: location.city, href: `/locations/${location.slug}` },
          { label: product.name },
        ]} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — DASHBOARD IMAGE SLIDER
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "88vh", minHeight: 600, background: NAVY }}>
        <motion.div className="absolute inset-[-10%]" style={{ y: heroImgY }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIdx}
              src={productImages[heroIdx].url}
              alt={productImages[heroIdx].alt}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 0.68, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.7, ease }}
            />
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.95) 0%, rgba(11,15,26,0.4) 50%, rgba(11,15,26,0.15) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,26,0.5) 0%, transparent 60%)" }} />

        {productImages.length > 1 && (
          <>
            <button onClick={prevHero} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all duration-150"
              style={{ background: "rgba(11,15,26,0.5)", color: "white", fontSize: 22, cursor: "pointer" }}>‹</button>
            <button onClick={nextHero} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all duration-150"
              style={{ background: "rgba(11,15,26,0.5)", color: "white", fontSize: 22, cursor: "pointer" }}>›</button>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {productImages.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} className="transition-all duration-300"
                  style={{ width: i === heroIdx ? 20 : 6, height: 6, background: i === heroIdx ? RED : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', borderRadius: 3 }} />
              ))}
            </div>
          </>
        )}

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
          className="absolute top-10 right-[120px] flex-col gap-4 hidden lg:flex">
          <div className="border border-white/10 text-right" style={{ padding: "16px 24px", background: "rgba(11,15,26,0.5)", backdropFilter: "blur(8px)" }}>
            <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mb-1.5">Code</p>
            <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 28 }}>{product.code || '—'}</p>
            <p className="text-white/30 text-[10px] tracking-[0.15em]">billboard code</p>
          </div>
          <div className="border border-white/10 text-right" style={{ padding: "16px 24px", background: "rgba(11,15,26,0.5)", backdropFilter: "blur(8px)" }}>
            <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mb-1.5">Ad Format</p>
            <p className="font-black text-white tracking-[-0.04em]" style={{ fontSize: 22 }}>{product.adFormat || '—'}</p>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]" style={{ paddingBottom: 64 }}>
          <div className="flex items-end justify-between gap-12">
            <div style={{ maxWidth: 720 }}>
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease, delay: 0.2 }} className="flex items-center gap-3 mb-5">
                <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {product.type || 'Billboard'} · {location.city}
                </span>
              </motion.div>
              <div className="overflow-hidden mb-3">
                <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease, delay: 0.3 }} className="font-black text-white leading-[0.88] tracking-[-0.05em]" style={{ fontSize: "clamp(40px, 5.5vw, 80px)" }}>
                  {product.nameEn || product.name}
                </motion.h1>
              </div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.5 }} className="text-[16px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {product.location}
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.7 }} className="flex-shrink-0 hidden md:block">
              <button onClick={() => navigate("/contact")} className="group relative overflow-hidden text-[12px] font-bold tracking-[0.2em] uppercase text-white flex items-center active:scale-[0.97] transition-transform"
                style={{ height: 52, padding: "0 36px", background: RED, border: "none", cursor: "pointer" }}>
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: "white" }} />
                <span className="relative z-10 group-hover:text-[#0B0F1A] transition-colors duration-300">Book this Location</span>
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.8 }} className="flex flex-wrap items-center gap-6 lg:gap-10 mt-8 pt-6 border-t border-white/[0.08]">
            {specRows.slice(0, 4).map((s) => (
              <div key={s.label}>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
                <p className="font-bold text-white text-[14px] tracking-[-0.01em] mt-0.5">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. SPLIT — DASHBOARD PHOTO + FULL SPECS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          <div className="bg-[#F5F5F6] flex items-center justify-center" style={{ padding: '48px 40px' }}>
            <div style={{ width: '100%', maxWidth: 640 }}>
              <div className="relative overflow-hidden border border-[#0B0F1A]/[0.08] bg-white" style={{ width: '100%', height: 441 }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={detailIdx}
                    src={productImages[detailIdx].url}
                    alt={productImages[detailIdx].alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.5, ease }}
                  />
                </AnimatePresence>
                {productImages.length > 1 && (
                  <>
                    <button onClick={prevDetail} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/25 hover:border-white/50 hover:bg-white/10 transition-all duration-150"
                      style={{ background: 'rgba(11,15,26,0.45)', color: 'white', fontSize: 22, cursor: 'pointer' }}>‹</button>
                    <button onClick={nextDetail} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/25 hover:border-white/50 hover:bg-white/10 transition-all duration-150"
                      style={{ background: 'rgba(11,15,26,0.45)', color: 'white', fontSize: 22, cursor: 'pointer' }}>›</button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                      {productImages.map((_, i) => (
                        <button key={i} onClick={() => setDetailIdx(i)} style={{ width: i === detailIdx ? 18 : 6, height: 6, borderRadius: 3, border: 'none', background: i === detailIdx ? RED : 'rgba(255,255,255,0.45)', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {productImages.slice(0, 4).map((img: any, i: number) => (
                    <button key={img.id} onClick={() => setDetailIdx(i)} className="relative overflow-hidden border transition-all duration-200"
                      style={{ height: 82, borderColor: i === detailIdx ? RED : 'rgba(11,15,26,0.08)' }}>
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between" style={{ padding: '64px 72px 64px 64px', background: 'white' }}>
            <div>
              <Eyebrow text="Specifications" />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em] mb-10" style={{ fontSize: 'clamp(28px, 3vw, 40px)', color: NAVY }}>
                  Billboard details<br />
                  <span style={{ color: 'rgba(11,15,26,0.2)' }}>from the dashboard.</span>
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-[#0B0F1A]/[0.07] mb-8">
                {specRows.map((spec, i) => (
                  <Reveal key={spec.label} delay={0.02 * i}>
                    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#0B0F1A]/[0.07]">
                      <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(11,15,26,0.35)' }}>{spec.label}</span>
                      <span className="text-[14px] font-bold text-right" style={{ color: NAVY }}>{spec.value}</span>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(11,15,26,0.3)' }}>Description</p>
                  <p className="text-[15px] leading-[1.8]" style={{ color: 'rgba(11,15,26,0.55)' }}>
                    {product.descriptionEn || 'No English description has been added for this billboard yet.'}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <div className="flex flex-col gap-3 mt-10">
                <button onClick={() => navigate('/contact')} className="group relative w-full h-[54px] overflow-hidden text-[12px] font-bold tracking-[0.22em] uppercase text-white flex items-center justify-center active:scale-[0.97] transition-transform"
                  style={{ background: RED, border: 'none', cursor: 'pointer' }}>
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: NAVY }} />
                  <span className="relative z-10">Get a Quote</span>
                </button>
                <a href={`https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(settings.companyName)}%2C%20I%27m%20interested%20in%20booking%20${encodeURIComponent(product.nameEn || product.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full h-[48px] flex items-center justify-center gap-2.5 border transition-colors duration-200 hover:border-[#25D366] group"
                  style={{ border: '1.5px solid rgba(11,15,26,0.12)', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366" />
                  </svg>
                  <span className="text-[12px] font-semibold tracking-[0.15em] uppercase group-hover:text-[#25D366] transition-colors" style={{ color: 'rgba(11,15,26,0.5)' }}>WhatsApp Enquiry</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. BILLBOARD LOCATION MAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-5 h-[1.5px]" style={{ background: RED }} />
                  <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "rgba(11,15,26,0.35)" }}>Billboard Location</span>
                </div>
              </Reveal>
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(28px, 3vw, 40px)", color: NAVY }}>
                  Find it on<br />
                  <span style={{ color: "rgba(11,15,26,0.2)" }}>the map.</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <a href={`https://www.google.com/maps?q=${product.lat},${product.lng}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#D90429] group"
                style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                <svg width="12" height="14" viewBox="0 0 13 15" fill="none" className="transition-colors group-hover:fill-[#D90429]">
                  <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/>
                </svg>
                Open in Google Maps →
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.06}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
              <div className="relative overflow-hidden" style={{ height: 480 }}>
                <ProductMap lat={product.lat} lng={product.lng} name={product.name} type={product.type} district={product.district} city={location.city} traffic={product.traffic} size={product.size} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
                <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
                  <div className="flex items-center gap-2" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", padding: "6px 12px", boxShadow: "0 2px 12px rgba(11,15,26,0.1)" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="rgba(11,15,26,0.3)" strokeWidth="1.2"/>
                      <path d="M5 2v3l2 1" stroke="rgba(11,15,26,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(11,15,26,0.35)" }}>Scroll inside map to zoom</span>
                  </div>
                </div>
              </div>

              <div className="bg-white flex flex-col justify-between" style={{ padding: "40px 36px" }}>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: RED }}>{product.type}</p>
                  <h3 className="font-black leading-[1.0] tracking-[-0.03em] mb-4" style={{ fontSize: 22, color: NAVY }}>{product.nameEn || product.name}</h3>
                  <p className="text-[13px] leading-[1.6] mb-6" style={{ color: "rgba(11,15,26,0.45)" }}>{product.location}</p>

                  <div className="flex items-center gap-2 mb-8 py-3 border-y border-[#0B0F1A]/[0.07]">
                    <svg width="11" height="13" viewBox="0 0 13 15" fill="none" className="flex-shrink-0">
                      <path d="M6.5 0C3.462 0 1 2.462 1 5.5c0 3.85 5.5 9.5 5.5 9.5S12 9.35 12 5.5C12 2.462 9.538 0 6.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="rgba(11,15,26,0.25)"/>
                    </svg>
                    <span className="font-mono text-[11px]" style={{ color: "rgba(11,15,26,0.35)" }}>{product.lat.toFixed(4)}°N, {product.lng.toFixed(4)}°E</span>
                  </div>

                  <div className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
                    {[
                      { label: 'Market', value: location.city },
                      { label: 'Zone', value: product.district },
                      { label: 'Ad Format', value: product.adFormat || '—' },
                      { label: 'Code', value: product.code || '—' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#0B0F1A]/[0.07]">
                        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>{item.label}</span>
                        <span className="text-[13px] font-bold text-right" style={{ color: NAVY }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a href={`https://www.google.com/maps?q=${product.lat},${product.lng}`} target="_blank" rel="noopener noreferrer"
                  className="mt-8 w-full h-[46px] flex items-center justify-center gap-2.5 text-[11px] font-bold tracking-[0.2em] uppercase group transition-colors"
                  style={{ border: "1.5px solid rgba(11,15,26,0.12)", textDecoration: "none", color: "rgba(11,15,26,0.5)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Get Directions
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. KEY BENEFITS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="col-span-4">
              <Eyebrow text="Key Benefits" />
              <Reveal delay={0.04}>
                <h2 className="font-black leading-[0.9] tracking-[-0.04em]" style={{ fontSize: "clamp(28px, 3vw, 40px)", color: NAVY }}>
                  Why this<br />
                  <span style={{ color: "rgba(11,15,26,0.2)" }}>location works.</span>
                </h2>
              </Reveal>
            </div>
            <div className="col-span-8">
              <RevealGroup className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
                {product.benefits.map((benefit, i) => (
                  <RevealItem key={i}>
                    <div className="flex items-start gap-6 py-6 border-b border-[#0B0F1A]/[0.07]">
                      <span className="font-black text-[11px] tracking-[0.25em] uppercase mt-0.5 flex-shrink-0" style={{ color: RED, minWidth: 28 }}>{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-[16px] leading-[1.7]" style={{ color: 'rgba(11,15,26,0.6)' }}>{benefit}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. LOCATION CONTEXT STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F5F5F6", paddingTop: 64, paddingBottom: 64 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {[
              { icon: "◉", label: "Market", value: location.city, sub: "Primary urban market" },
              { icon: "◎", label: "Zone", value: product.location.split(",")[0], sub: product.location.split(",").slice(1).join(",").trim() || "Premium corridor" },
              { icon: "◈", label: "Format", value: product.adFormat || product.type, sub: `${product.size || '—'} · ${product.brightness || 'Illuminated'}` },
            ].map((item) => (
              <div key={item.label} className="bg-white flex items-start gap-5" style={{ padding: "32px 36px" }}>
                <span style={{ color: RED, fontSize: 20, lineHeight: 1, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(11,15,26,0.3)" }}>{item.label}</p>
                  <p className="font-extrabold text-[17px] tracking-[-0.01em]" style={{ color: NAVY }}>{item.value}</p>
                  <p className="text-[12px] mt-1" style={{ color: "rgba(11,15,26,0.35)" }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. RELATED LOCATIONS
      ═══════════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
            <div className="flex items-center justify-between mb-10">
              <Reveal>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "rgba(11,15,26,0.3)" }}>Related Billboard Locations</p>
              </Reveal>
              <Reveal delay={0.08}>
                <Link to={`/locations/${location.slug}`} className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hover:text-[#D90429]" style={{ color: "rgba(11,15,26,0.35)", textDecoration: "none" }}>
                  View all in {location.city} →
                </Link>
              </Reveal>
            </div>
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((rel) => (
                <RevealItem key={rel.id}>
                  <Link to={`/locations/${citySlug}/billboards/${rel.slug}`} className="group block overflow-hidden border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/25 transition-all duration-400" style={{ textDecoration: "none" }}>
                    <div className="relative overflow-hidden" style={{ height: 200 }}>
                      <img src={rel.image} alt={`${rel.name} — billboard advertising ${location.city}`} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.05]" style={{ opacity: 0.85 }} />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.7) 0%, transparent 60%)" }} />
                      <span className="absolute bottom-4 left-5 font-bold text-white text-[15px]">{rel.name}</span>
                    </div>
                    <div className="flex items-center justify-between" style={{ padding: "20px 24px" }}>
                      <div>
                        <p className="font-semibold text-[13px] transition-colors group-hover:text-[#D90429]" style={{ color: NAVY }}>{rel.type} · {rel.size}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(11,15,26,0.35)" }}>{rel.traffic}</p>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg" style={{ color: RED }}>→</span>
                    </div>
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
