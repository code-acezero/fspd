import { useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, Youtube, Mail, Phone, MapPin, Heart, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import LogoTile from "@/components/branding/LogoTile";
import { useSectionBlock } from "@/hooks/useSectionBlock";
import { usePageBlocks } from "@/contexts/PageBlocksContext";
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_SOCIALS, type SocialLink } from "@/lib/pageBlocks";

const SOCIAL_ICONS: Record<SocialLink["platform"], any> = {
  facebook: Facebook, youtube: Youtube, instagram: Instagram, twitter: Twitter, mail: Mail,
};

const Footer = () => {
  const { lang, setLang, t } = useLanguage();
  const { settings } = useSiteSettings();
  const { theme } = useTheme();
  const { getFooterLinks } = usePageBlocks();
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ["start end", "end start"] });
  const lensX = useTransform(scrollYProgress, [0, 1], ["-10%", "110%"]);

  const block = useSectionBlock("footer", {
    subtitle: t("orgDesc"),
  });

  // CMS-driven columns + socials, fall back to defaults.
  const linksCfg = getFooterLinks();
  const columns = (linksCfg.columns ?? DEFAULT_FOOTER_COLUMNS).filter((c) => c.visible !== false);
  const socials = (linksCfg.socials ?? DEFAULT_SOCIALS).filter((s) => s.visible !== false);

  const contactEmail = settings.general.contact_email || "info@fsp.org.bd";
  const contactPhone = settings.general.contact_phone || "+880 1XXX-XXXXXX";
  const address = lang === "en"
    ? (settings.general.address_en || "Faridpur Sadar, Faridpur, Bangladesh")
    : (settings.general.address_bn || "ফরিদপুর সদর, ফরিদপুর, বাংলাদেশ");

  const toggleLang = () => setLang(lang === "bn" ? "en" : "bn");

  if (block.hideForVisitors) return null;
  const aboutText = block.texts.subtitle || t("orgDesc");

  return (
    <footer id="contact" style={block.styles.section} className="bg-card border-t border-border relative overflow-hidden" ref={footerRef}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent relative overflow-visible">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-16 h-8 pointer-events-none"
          style={{
            x: lensX,
            background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.7) 0%, hsl(var(--gold) / 0.3) 30%, transparent 70%)",
            filter: "blur(3px)",
          }}
        />
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-6 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2.5 mb-2">
              <LogoTile size="md" glow="off" />
              <div>
                <h3 className="font-bengali text-xs font-bold text-foreground">{lang === "bn" ? settings.general.site_name_bn : settings.general.site_name_en}</h3>
                <p className="text-[8px] text-muted-foreground tracking-widest uppercase">{lang === "bn" ? settings.general.site_name_en : settings.general.site_name_bn}</p>
              </div>
            </div>
            <p className="font-bengali text-[11px] text-muted-foreground leading-relaxed mb-2">{aboutText}</p>
            <div className="flex gap-1.5">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform] || Mail;
                return (
                  <a key={s.id} href={s.href} target="_blank" rel="noreferrer" className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground text-muted-foreground hover:scale-110 transition-all">
                    <Icon className="w-3 h-3" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Link columns (CMS-driven) */}
          {columns.map((col, ci) => (
            <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 + ci * 0.05 }}>
              <h4 className="font-bengali text-[10px] font-bold mb-2 text-accent uppercase tracking-wider">
                {lang === "en" ? (col.title_en || col.title_bn) : (col.title_bn || col.title_en)}
              </h4>
              <ul className="space-y-1">
                {col.links.filter((l) => l.visible !== false).map((l) => (
                  <li key={l.id}>
                    <Link to={l.to} className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-bengali hover:translate-x-1 inline-block">
                      {lang === "en" ? (l.label_en || l.label_bn) : (l.label_bn || l.label_en)}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h4 className="font-bengali text-[10px] font-bold mb-2 text-accent uppercase tracking-wider">{t("contactInfo")}</h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3 mt-0.5 text-accent shrink-0" />
                <span className="font-bengali">{address}</span>
              </li>
              <li className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Phone className="w-3 h-3 text-accent shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Mail className="w-3 h-3 text-accent shrink-0" />
                <span>{contactEmail}</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h4 className="font-bengali text-[10px] font-bold mb-2 text-accent uppercase tracking-wider">{t("emailSubscribe")}</h4>
            <p className="text-[11px] text-muted-foreground mb-2 font-bengali">{t("subscribeDesc")}</p>
            <form className="flex gap-1.5" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t("yourEmail")} className="flex-1 px-3 py-1 rounded-full bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-[11px] focus:outline-none focus:border-primary transition-colors" />
              <button className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-crimson-dark transition-colors shadow-md shadow-primary/20">→</button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar with liquid language toggle */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground font-bengali">{t("copyright")}</p>
          
          {/* Liquid language toggle */}
          <button
            onClick={toggleLang}
            className="relative w-[88px] h-[26px] rounded-full bg-secondary border border-border/60 overflow-hidden cursor-pointer group"
            aria-label={t("toggleLanguage")}
          >
            <motion.div
              className="absolute top-[2px] bottom-[2px] w-[40px] rounded-full bg-primary"
              animate={{ left: lang === "bn" ? "2px" : "calc(100% - 42px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
              style={{ filter: "url(#liquid-filter)" }}
            />
            <svg className="absolute w-0 h-0">
              <defs>
                <filter id="liquid-filter">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="liquid" />
                  <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
                </filter>
              </defs>
            </svg>
            <div className="relative z-10 flex items-center justify-between h-full px-2.5">
              <span className={`text-[10px] font-bengali font-medium transition-colors duration-300 ${lang === "bn" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                বাং
              </span>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${lang === "en" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                EN
              </span>
            </div>
          </button>

          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            {t("madeInBangladesh")} <Heart className="w-2.5 h-2.5 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
