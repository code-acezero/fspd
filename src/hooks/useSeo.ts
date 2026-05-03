import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface SeoOverrides {
  title?: string;
  description?: string;
  image?: string;
  path?: string; // override path lookup (defaults to current pathname)
}

/**
 * useSeo — looks up a `page_seo` row for the current path, falls back to
 * provided overrides, and writes meta tags into <head>. Bilingual: chooses
 * `*_en` vs base based on current language. Safe to call on every page.
 */
export function useSeo(overrides: SeoOverrides = {}) {
  const location = useLocation();
  const { lang } = useLanguage();
  const { settings } = useSiteSettings();
  const path = overrides.path ?? location.pathname;

  const { data: seo } = useQuery({
    queryKey: ["page-seo", path],
    queryFn: async () => {
      const { data } = await supabase.from("page_seo").select("*").eq("path", path).maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const siteName = lang === "en" ? settings.general.site_name_en : settings.general.site_name_bn;
    const dbTitle = seo ? (lang === "en" ? seo.title_en || seo.title : seo.title || seo.title_en) : "";
    const dbDesc = seo ? (lang === "en" ? seo.description_en || seo.description : seo.description || seo.description_en) : "";
    const dbKeywords = seo ? (lang === "en" ? seo.keywords_en || seo.keywords : seo.keywords || seo.keywords_en) : "";

    const finalTitle = dbTitle || overrides.title || siteName;
    const finalDesc = dbDesc || overrides.description || (lang === "en" ? settings.general.tagline_en : settings.general.tagline_bn);
    const finalImage = (seo?.og_image) || overrides.image || "";
    const canonical = seo?.canonical || `${window.location.origin}${path}`;
    const noIndex = !!seo?.no_index;

    document.title = finalTitle ? `${finalTitle} | ${siteName}` : siteName;
    setMeta("description", finalDesc);
    setMeta("keywords", dbKeywords);
    setMetaProp("og:title", finalTitle || siteName);
    setMetaProp("og:description", finalDesc);
    setMetaProp("og:type", "website");
    setMetaProp("og:url", canonical);
    if (finalImage) setMetaProp("og:image", finalImage);
    setMeta("twitter:card", finalImage ? "summary_large_image" : "summary");
    setMeta("twitter:title", finalTitle || siteName);
    setMeta("twitter:description", finalDesc);
    if (finalImage) setMeta("twitter:image", finalImage);
    setLink("canonical", canonical);
    setMeta("robots", noIndex ? "noindex,nofollow" : "index,follow");
  }, [seo, lang, path, overrides.title, overrides.description, overrides.image, settings.general]);
}

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setMetaProp(prop: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
