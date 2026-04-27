import { Link } from "react-router-dom";
import { useStore } from "@/store/dataStore";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner } from "@/components/UI";
import { blogHref, RED, NAVY } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";

export default function Blog() {
  const { blogPosts: BLOG_POSTS } = useStore()
  const { isAr, t } = useLang()
  const featured = BLOG_POSTS[0] ?? null;
  const rest = BLOG_POSTS.slice(1);

  return (
    <>
      <PageHero
        eyebrow={t('blog.insights')}
        title={t('blog.title')}
        titleAccent={t('blog.titleAccent')}
        subtitle={t('blog.subtitle')}
      />

      {/* Featured post */}
      {featured && (
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
              {t('blog.featuredArticle')}
            </p>
          </Reveal>
          <Link
            to={blogHref(featured.slug)}
            className="group grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/30 transition-colors duration-400 cursor-pointer"
            style={{ textDecoration: "none" }}
          >
            <div className="relative overflow-hidden" style={{ height: 420 }}>
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ opacity: 0.85 }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(11,15,26,0.1))" }} />
            </div>
            <div className="flex flex-col justify-center p-16" style={{ background: NAVY }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: RED }}>{featured.category}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
                <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>{featured.readTime}</span>
              </div>
              <h2
                className="font-black leading-[1.1] tracking-[-0.03em] text-white mb-6 group-hover:text-white transition-colors"
                style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
              >
                {isAr && (featured as any).titleAr ? (featured as any).titleAr : featured.title}
              </h2>
              <p className="text-[15px] leading-[1.7] mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
                {isAr && (featured as any).excerptAr ? (featured as any).excerptAr : featured.excerpt}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>{t('blog.readArticle')}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg" style={{ color: RED }}>→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
      )}

      {/* All posts grid */}
      <section className="bg-white" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-10" style={{ color: "rgba(11,15,26,0.3)" }}>
            {t('blog.allArticles')}
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {rest.map((post) => (
              <RevealItem key={post.id}>
                <Link
                  to={blogHref(post.slug)}
                  className="group bg-white flex flex-col hover:bg-[#0B0F1A] transition-colors duration-500 h-full"
                  style={{ textDecoration: "none" }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 220 }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ opacity: 0.85 }}
                    />
                    <div
                      className="absolute top-4 left-4 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5"
                      style={{ background: RED, color: "white" }}
                    >
                      {post.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500">{post.date}</span>
                      <span className="text-[rgba(11,15,26,0.2)] group-hover:text-white/20 transition-colors duration-500" style={{ fontSize: 10 }}>·</span>
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500">{post.readTime}</span>
                    </div>
                    <h3
                      className="font-bold leading-[1.2] tracking-[-0.02em] mb-4 flex-1 transition-colors duration-500 text-[#0B0F1A] group-hover:text-white"
                      style={{ fontSize: 18 }}
                    >
                      {isAr && (post as any).titleAr ? (post as any).titleAr : post.title}
                    </h3>
                    <p
                      className="text-[13px] leading-[1.65] mb-6 transition-colors duration-500 text-[rgba(11,15,26,0.45)] group-hover:text-white/35"
                    >
                      {(() => { const ex = isAr && (post as any).excerptAr ? (post as any).excerptAr : post.excerpt; return ex.length > 100 ? ex.slice(0, 100) + "…" : ex; })()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>{t('blog.readMore')}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-base" style={{ color: RED }}>→</span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTABanner
        title={t('blog.ctaTitle')}
        subtitle={t('blog.ctaSubtitle')}
        buttonLabel={t('blog.ctaButton')}
        dark={false}
      />
    </>
  );
}