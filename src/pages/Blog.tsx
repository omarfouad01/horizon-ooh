import { Link } from "react-router-dom";
import { BLOG_POSTS } from "@/data";
import { Reveal, RevealGroup, RevealItem, PageHero, CTABanner } from "@/components/UI";
import { blogHref, RED, NAVY } from "@/lib/routes";

export default function Blog() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <>
      <PageHero
        eyebrow="Insights & Strategy"
        title="Outdoor Advertising"
        titleAccent="Insights & Articles."
        subtitle="Expert guides, industry analysis, and creative strategy for OOH advertising in Egypt."
      />

      {/* Featured post */}
      <section className="bg-white" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-6" style={{ color: "rgba(11,15,26,0.3)" }}>
              Featured Article
            </p>
          </Reveal>
          <Link
            to={blogHref(featured.slug)}
            className="group grid grid-cols-2 gap-0 overflow-hidden border border-[#0B0F1A]/[0.08] hover:border-[#D90429]/30 transition-colors duration-400"
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
                {featured.title}
              </h2>
              <p className="text-[15px] leading-[1.7] mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>Read Article</span>
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg" style={{ color: RED }}>→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* All posts grid */}
      <section className="bg-white" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 120px" }}>
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-10" style={{ color: "rgba(11,15,26,0.3)" }}>
              All Articles
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-3 gap-[1px]" style={{ background: "rgba(11,15,26,0.07)" }}>
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
                      <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "rgba(11,15,26,0.3)" }}>{post.date}</span>
                      <span style={{ color: "rgba(11,15,26,0.2)", fontSize: 10 }}>·</span>
                      <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "rgba(11,15,26,0.3)" }}>{post.readTime}</span>
                    </div>
                    <h3
                      className="font-bold leading-[1.2] tracking-[-0.02em] mb-4 flex-1 transition-colors duration-500 group-hover:text-white"
                      style={{ fontSize: 18, color: NAVY }}
                    >
                      {post.title}
                    </h3>
                    <p
                      className="text-[13px] leading-[1.65] mb-6 transition-colors duration-500 group-hover:text-white/35"
                      style={{ color: "rgba(11,15,26,0.45)" }}
                    >
                      {post.excerpt.length > 100 ? post.excerpt.slice(0, 100) + "…" : post.excerpt}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>Read More</span>
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
        title="Ready to apply these insights?"
        subtitle="Talk to our strategists and turn OOH knowledge into campaign results."
        buttonLabel="Get a Quote"
        dark={false}
      />
    </>
  );
}
