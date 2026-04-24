import { useParams, Link, useNavigate } from "react-router-dom";
import { useStore } from "@/store/dataStore";
import { Reveal, RevealGroup, RevealItem, CTABanner, Eyebrow, Breadcrumb } from "@/components/UI";
import { blogHref, RED, NAVY } from "@/lib/routes";
import { useLang } from "@/i18n/LangContext";
import SEO from "@/components/SEO";

export default function BlogArticle() {
  const { blogPosts: BLOG_POSTS } = useStore()
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAr, t } = useLang();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <p className="text-[#0B0F1A]/40 text-lg">{isAr ? 'المقال غير موجود.' : 'Article not found.'}</p>
        <button onClick={() => navigate("/blog")} className="text-[#D90429] font-bold underline hover:opacity-70 transition-opacity duration-150 cursor-pointer">{t('blog.backToBlog')}</button>
      </div>
    );
  }

  const metaTitle = (post as any).metaTitle || `${isAr && (post as any).titleAr ? (post as any).titleAr : post.title} | HORIZON OOH`;
  const metaDesc  = (post as any).metaDesc  || (isAr && (post as any).excerptAr ? (post as any).excerptAr : post.excerpt) || '';

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDesc}
        ogImage={post.image}
      />
      <div className="bg-white pt-4">
        <Breadcrumb items={[{ label: t('common.home'), href: "/" }, { label: t('blog.title'), href: "/blog" }, { label: post.category }]} />
      </div>

      {/* Article Hero */}
      <section style={{ background: NAVY, paddingTop: 80, paddingBottom: 0 }} className="overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="max-w-[800px] pt-16 pb-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5" style={{ background: RED, color: "white" }}>
                {post.category}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {post.date}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {post.readTime}
              </span>
            </div>
            <Reveal delay={0.05}>
              <h1 className="font-black leading-[1.0] tracking-[-0.04em] text-white" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
                {isAr && (post as any).titleAr ? (post as any).titleAr : post.title}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-[18px] leading-[1.75] mt-6" style={{ color: "rgba(255,255,255,0.45)" }}>
                {isAr && (post as any).excerptAr ? (post as any).excerptAr : post.excerpt}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Hero image */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="relative overflow-hidden" style={{ height: 480 }}>
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" style={{ opacity: 0.75 }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,26,0.5) 0%, transparent 50%)" }} />
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-white" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main content */}
            <article className="col-span-12 lg:col-span-8">
              {((isAr && (post as any).bodyAr?.length ? (post as any).bodyAr : null) ?? post.body ?? []).map((block: any, i: number) => {
                if (block.type === "h2") {
                  return (
                    <Reveal key={i} delay={0.04}>
                      <h2
                        className="font-black leading-[1.05] tracking-[-0.03em] mt-14 mb-6"
                        style={{ fontSize: "clamp(24px, 2.5vw, 34px)", color: NAVY }}
                      >
                        {block.content}
                      </h2>
                    </Reveal>
                  );
                }
                if (block.type === "p") {
                  return (
                    <Reveal key={i} delay={0.04}>
                      <p className="text-[17px] leading-[1.85] mb-6" style={{ color: "rgba(11,15,26,0.55)" }}>
                        {block.content}
                      </p>
                    </Reveal>
                  );
                }
                if (block.type === "ul") {
                  return (
                    <Reveal key={i} delay={0.04}>
                      <ul className="my-6 flex flex-col gap-3">
                        {block.items?.map((item, j) => (
                          <li key={j} className="flex items-start gap-4">
                            <span className="mt-2.5 flex-shrink-0 w-[5px] h-[5px]" style={{ background: RED }} />
                            <span className="text-[16px] leading-[1.75]" style={{ color: "rgba(11,15,26,0.55)" }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  );
                }
                if (block.type === "cta") {
                  return (
                    <Reveal key={i} delay={0.04}>
                      <div
                        className="my-12 p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                        style={{ background: NAVY }}
                      >
                        <div>
                          <p className="font-bold text-white" style={{ fontSize: 18 }}>{block.content}</p>
                          <p className="text-[14px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>{isAr ? 'تحدث مع فريقنا — لا يلزم أي التزام.' : 'Talk to our team — no commitment required.'}</p>
                        </div>
                        <button
                          onClick={() => navigate("/contact")}
                          className="group relative h-[48px] px-8 overflow-hidden text-[11px] font-bold tracking-[0.2em] uppercase text-white flex items-center flex-shrink-0 active:scale-[0.97] transition-transform cursor-pointer"
                          style={{ background: RED }}
                        >
                          <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: "white" }} />
                          <span className="relative z-10 group-hover:text-[#0B0F1A] transition-colors duration-300">{t('product.getQuote')}</span>
                        </button>
                      </div>
                    </Reveal>
                  );
                }
                return null;
              })}
            </article>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="sticky" style={{ top: 100 }}>
                {/* CTA card */}
                <Reveal>
                  <div className="p-8 mb-8" style={{ background: "#F5F5F6" }}>
                    <div className="w-5 h-[1.5px] mb-6" style={{ background: RED }} />
                    <p className="font-bold text-[18px] tracking-[-0.01em] mb-3" style={{ color: NAVY }}>
                      {isAr ? 'هل أنت مستعد للإعلان؟' : 'Ready to advertise?'}
                    </p>
                    <p className="text-[14px] leading-[1.7] mb-6" style={{ color: "rgba(11,15,26,0.45)" }}>
                      {isAr ? 'سيبني خبراؤنا الإعلاميون الحملة الخارجية المثالية لعلامتك التجارية.' : 'Our media strategists will build the perfect OOH campaign for your brand.'}
                    </p>
                    <button
                      onClick={() => navigate("/contact")}
                      className="group relative w-full h-[48px] overflow-hidden text-[11px] font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center active:scale-[0.97] transition-transform cursor-pointer"
                      style={{ background: RED }}
                    >
                      <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: NAVY }} />
                      <span className="relative z-10">{t('product.getQuote')}</span>
                    </button>
                  </div>
                </Reveal>

                {/* Related links */}
                <Reveal delay={0.1}>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: "rgba(11,15,26,0.3)" }}>
                    {isAr ? 'مقالات ذات صلة' : 'Related Articles'}
                  </p>
                  <div className="flex flex-col gap-0 border-t border-[#0B0F1A]/[0.07]">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        to={blogHref(rel.slug)}
                        className="group flex items-start gap-4 py-5 border-b border-[#0B0F1A]/[0.07] hover:text-[#D90429] transition-colors"
                        style={{ textDecoration: "none" }}
                      >
                        <img src={rel.image} alt={rel.title} className="w-14 h-12 object-cover flex-shrink-0" />
                        <div>
                          <p className="text-[13px] font-semibold leading-[1.4] transition-colors group-hover:text-[#D90429]" style={{ color: NAVY }}>
                          {(() => { const t = isAr && (rel as any).titleAr ? (rel as any).titleAr : rel.title; return t.length > 60 ? t.slice(0,60)+'…' : t; })()}
                          </p>
                          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-1" style={{ color: "rgba(11,15,26,0.3)" }}>
                            {rel.readTime}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Reveal>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CTABanner
        title={isAr ? 'طبّق هذه الرؤى في عملك.' : 'Put these insights to work.'}
        subtitle={isAr ? 'دعنا نبني استراتيجية حملتك الخارجية معاً.' : "Let's build your OOH campaign strategy together."}
        buttonLabel={isAr ? t('projects.startCampaign') : 'Start a Campaign'}
      />
    </>
  );
}
