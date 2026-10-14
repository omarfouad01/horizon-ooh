import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  type?: "website" | "article";
}

const SITE_URL = "https://horizonooh.com";
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-1600.webp`;

function absoluteUrl(value?: unknown): string {
  if (!value) return DEFAULT_IMAGE;
  if (typeof value === "object" && value && "url" in value) {
    return absoluteUrl((value as { url?: string }).url);
  }
  if (typeof value !== "string") return DEFAULT_IMAGE;
  if (value.startsWith("data:") || value.startsWith("blob:")) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  robots = "index, follow",
  type = "website",
}: SEOProps) {
  const { pathname } = useLocation();
  const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");
  const englishPath = (canonical || pathname).replace(/^https:\/\/horizonooh\.com/, "").replace(/^\/ar(?=\/|$)/, "") || "/";
  const routePath = isArabic ? (englishPath === "/" ? "/ar" : `/ar${englishPath}`) : englishPath;
  const canonicalUrl = `${SITE_URL}${routePath === "/" ? "" : routePath}`;
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        Object.entries(attrs).forEach(([name, value]) => el!.setAttribute(name, value));
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([name, value]) => el!.setAttribute(name, value));
    };


    const imageUrl = absoluteUrl(ogImage);

    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: robots });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    const setLink = (rel: string, href: string, language?: string) => {
      const selector = language ? `link[rel="${rel}"][hreflang="${language}"]` : `link[rel="${rel}"]`;
      let link = document.head.querySelector(selector) as HTMLLinkElement | null;
      if (!link) { link = document.createElement("link"); document.head.appendChild(link); }
      link.rel = rel; link.href = href;
      if (language) link.hreflang = language;
    };
    const enUrl = `${SITE_URL}${englishPath === "/" ? "" : englishPath}`;
    setLink("canonical", canonicalUrl);
    setLink("alternate", enUrl, "en");
    setLink("alternate", `${SITE_URL}${englishPath === "/" ? "/ar" : `/ar${englishPath}`}`, "ar");
    setLink("alternate", enUrl, "x-default");
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: isArabic ? "ar_EG" : "en_US" });
    if (!keywords) document.querySelector('meta[name="keywords"]')?.remove();
    if (keywords) setMeta('meta[name="keywords"]', { name: "keywords", content: keywords });

    return () => {
      document.title = "HORIZON OOH | Outdoor Advertising Agency in Egypt";
    };
  }, [title, description, keywords, ogImage, canonicalUrl, englishPath, isArabic, robots, type]);

  // Server-readable marker. The SSG generator promotes these route values to
  // the document head, then removes the marker from generated page markup.
  return (
    <script
      type="application/json"
      data-horizon-seo=""
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          title,
          description,
          keywords,
          image: absoluteUrl(ogImage),
          canonical: canonical || "/",
          robots,
          type,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
