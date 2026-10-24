import {LocalizedText, LocalizedElement} from "@/components/Localized";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useStore } from "@/store/dataStore";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner } from "@/components/UI";
import { blogHref, langPath, RED, NAVY } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function Blog() {
  const { blogPosts: BLOG_POSTS } = useStore()
  const { lang, isAr, t } = useLang()
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(BLOG_POSTS.map((post: any) => post.category).filter(Boolean)))], [BLOG_POSTS]);
  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(lang);
    return BLOG_POSTS.filter((post: any) => {
      if (category !== 'All' && post.category !== category) return false;
      if (!needle) return true;
      const text = [post.title, post.titleAr, post.excerpt, post.excerptAr, ...(post.tags || [])]
        .filter(Boolean).join(' ').toLocaleLowerCase(lang);
      return text.includes(needle);
    });
  }, [BLOG_POSTS, category, lang, query]);
  const featured = filteredPosts[0] ?? null;
  const rest = filteredPosts.slice(1);

  return (
    <>
      <SEO
        title={isAr ? 'مدونة الإعلانات الخارجية | هورايزون' : 'Outdoor Advertising Blog | HORIZON OOH'}
        description={isAr ? 'رؤى ونصائح وأفكار لحملات الإعلانات الخارجية في السعودية.' : "Industry insights, OOH advertising tips and campaign inspiration from Saudi Arabia’s leading billboard agency."}
        canonical={langPath(lang, "/blog")}
      />
      <PageHero
        eyebrow={t('blog.insights')}
        title={t('blog.title')}
        titleAccent={t('blog.titleAccent')}
        subtitle={t('blog.subtitle')}
      />

      <section className="bg-white border-b border-[#0B0F1A]/[0.07]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px] py-6 flex flex-col md:flex-row gap-4">
          <label className="flex-1">
            <span className="sr-only"><LocalizedText>{isAr ? 'البحث في المقالات' : 'Search articles'}</LocalizedText></span>
            <LocalizedElement as="input"
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); trackEvent('blog_search', { has_query: Boolean(event.target.value) }); }}
              placeholder={isAr ? 'ابحث في المقالات...' : 'Search articles...'}
              className="w-full h-12 px-4 border border-[#0B0F1A]/15 bg-[#F8F8F9] outline-none focus:border-[#D90429]"
            />
          </label>
          <LocalizedElement as="div" className="flex gap-2 overflow-x-auto" aria-label={isAr ? 'فئات المقالات' : 'Article categories'}>
            <LocalizedText>{categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setCategory(item); trackEvent('blog_category_filter', { category: item }); }}
                className="h-12 px-4 whitespace-nowrap text-xs font-bold uppercase tracking-wider border"
                style={{ background: category === item ? RED : 'white', color: category === item ? 'white' : NAVY, borderColor: category === item ? RED : 'rgba(11,15,26,.15)' }}
              >
                <LocalizedText>{item === 'All' && isAr ? 'الكل' : item}</LocalizedText>
              </button>
            ))}</LocalizedText>
          </LocalizedElement>
        </div>
      </section>

      {/* Featured post */}
      <LocalizedText>{featured && (
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
              <LocalizedText>{t('blog.featuredArticle')}</LocalizedText>
            </p>
          </Reveal>
          <LocalizedElement as={Link}
            to={blogHref(lang, featured.slug)}
            className="group grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/30 transition-colors duration-400 cursor-pointer"
            style={{ textDecoration: "none" }}
          >
            <div className="relative overflow-hidden" style={{ height: 420 }}>
              <LocalizedElement as="img"
                src={featured.image}
                alt={featured.title}
                width={900} height={420}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ opacity: 0.85 }}
                {...({ fetchpriority: "high" } as any)}
                decoding="async"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(11,15,26,0.1))" }} />
            </div>
            <div className="flex flex-col justify-center p-16" style={{ background: NAVY }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: RED }}><LocalizedText>{featured.category}</LocalizedText></span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}><LocalizedText>·</LocalizedText></span>
                <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}><LocalizedText>{featured.readTime}</LocalizedText></span>
              </div>
              <h2
                className="font-black leading-[1.1] tracking-[-0.03em] text-white mb-6 group-hover:text-white transition-colors"
                style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
              >
                <LocalizedText>{isAr && (featured as any).titleAr ? (featured as any).titleAr : featured.title}</LocalizedText>
              </h2>
              <p className="text-[15px] leading-[1.7] mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
                <LocalizedText>{isAr && (featured as any).excerptAr ? (featured as any).excerptAr : featured.excerpt}</LocalizedText>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}><LocalizedText>{t('blog.readArticle')}</LocalizedText></span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg" style={{ color: RED }}><LocalizedText>→</LocalizedText></span>
              </div>
            </div>
          </LocalizedElement>
        </div>
      </section>
      )}</LocalizedText>

      <LocalizedText>{!featured && (
        <section className="bg-white py-24 text-center">
          <h2 className="font-black text-2xl mb-3" style={{ color: NAVY }}><LocalizedText>{isAr ? 'لا توجد مقالات مطابقة.' : 'No matching articles.'}</LocalizedText></h2>
          <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="font-bold text-sm" style={{ color: RED }}>
            <LocalizedText>{isAr ? 'مسح البحث' : 'Clear search'}</LocalizedText>
          </button>
        </section>
      )}</LocalizedText>

      {/* All posts grid */}
      <section className="bg-white" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-10" style={{ color: "rgba(11,15,26,0.3)" }}>
            <LocalizedText>{t('blog.allArticles')}</LocalizedText>
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
            {rest.map((post) => (
              <RevealItem key={post.id}>
                <LocalizedElement as={Link}
                  to={blogHref(lang, post.slug)}
                  className="group bg-white flex flex-col hover:bg-[#0B0F1A] transition-colors duration-500 h-full"
                  style={{ textDecoration: "none" }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 220 }}>
                    <LocalizedElement as="img"
                      src={post.image}
                      alt={(post as any).imageAlt || post.title}
                      width={600} height={220}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ opacity: 0.85 }}
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className="absolute top-4 left-4 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5"
                      style={{ background: RED, color: "white" }}
                    >
                      <LocalizedText>{post.category}</LocalizedText>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500"><LocalizedText>{post.date}</LocalizedText></span>
                      <span className="text-[rgba(11,15,26,0.2)] group-hover:text-white/20 transition-colors duration-500" style={{ fontSize: 10 }}><LocalizedText>·</LocalizedText></span>
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[rgba(11,15,26,0.3)] group-hover:text-white/30 transition-colors duration-500"><LocalizedText>{post.readTime}</LocalizedText></span>
                    </div>
                    <h3
                      className="font-bold leading-[1.2] tracking-[-0.02em] mb-4 flex-1 transition-colors duration-500 text-[#0B0F1A] group-hover:text-white"
                      style={{ fontSize: 18 }}
                    >
                      <LocalizedText>{isAr && (post as any).titleAr ? (post as any).titleAr : post.title}</LocalizedText>
                    </h3>
                    <p
                      className="text-[13px] leading-[1.65] mb-6 transition-colors duration-500 text-[rgba(11,15,26,0.45)] group-hover:text-white/35"
                    >
                      <LocalizedText>{(() => { const ex = isAr && (post as any).excerptAr ? (post as any).excerptAr : post.excerpt; return ex.length > 100 ? ex.slice(0, 100) + "…" : ex; })()}</LocalizedText>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}><LocalizedText>{t('blog.readMore')}</LocalizedText></span>
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-base" style={{ color: RED }}><LocalizedText>→</LocalizedText></span>
                    </div>
                  </div>
                </LocalizedElement>
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
