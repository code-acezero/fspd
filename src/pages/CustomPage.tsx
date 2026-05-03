import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import SeoHead from "@/components/SeoHead";
import { useLanguage } from "@/contexts/LanguageContext";

type Block =
  | { type: "heading"; text: string; text_en?: string; level?: 1 | 2 | 3 }
  | { type: "paragraph"; text: string; text_en?: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "html"; html: string };

interface CustomPageRow {
  id: string;
  slug: string;
  title: string;
  title_en: string;
  blocks: Block[];
  is_published: boolean;
}

const CustomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [page, setPage] = useState<CustomPageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("custom_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setPage(data as any);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-bengali text-2xl font-bold text-foreground mb-2">404</h1>
          <p className="font-bengali text-muted-foreground">{lang === "en" ? "Page not found" : "পেজ খুঁজে পাওয়া যায়নি"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const title = lang === "en" && page.title_en ? page.title_en : page.title;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={title} path={`/p/${page.slug}`} />
      <MainNav />
      <article className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
        <h1 className="font-bengali text-3xl md:text-4xl font-bold text-foreground mb-6">{title}</h1>
        <div className="space-y-6">
          {(page.blocks || []).map((b, i) => <BlockView key={i} block={b} lang={lang} />)}
        </div>
      </article>
      <Footer />
    </div>
  );
};

const BlockView = ({ block, lang }: { block: Block; lang: "bn" | "en" }) => {
  const txt = (en?: string, bn?: string) => (lang === "en" && en ? en : bn || en || "");
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level || 2}` as any;
      return <Tag className="font-bengali font-bold text-foreground text-2xl">{txt(block.text_en, block.text)}</Tag>;
    }
    case "paragraph":
      return <p className="font-bengali text-foreground/90 leading-relaxed whitespace-pre-wrap">{txt(block.text_en, block.text)}</p>;
    case "image":
      return (
        <figure>
          <img src={block.url} alt={block.alt || ""} className="w-full rounded-2xl border border-border" loading="lazy" />
          {block.caption && <figcaption className="text-center text-sm text-muted-foreground mt-2 font-bengali">{block.caption}</figcaption>}
        </figure>
      );
    case "html":
      return <div className="prose prose-invert max-w-none font-bengali" dangerouslySetInnerHTML={{ __html: block.html }} />;
    default:
      return null;
  }
};

export default CustomPage;
