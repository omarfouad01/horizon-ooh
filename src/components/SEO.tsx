import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export default function SEO({ title, description, keywords, ogImage }: SEOProps): null {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = selector.replace(/\[|\]/g, " ").trim().split(/\s+/);
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    if (keywords) setMeta('meta[name="keywords"]', "content", keywords);
    if (ogImage) setMeta('meta[property="og:image"]', "content", ogImage);

    return () => {
      document.title = "HORIZON OOH | Outdoor Advertising Agency in Egypt";
    };
  }, [title, description, keywords, ogImage]);

  return null;
}
