import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Facebook, Youtube, Mail, Phone, MapPin, Heart, Send } from "lucide-react";
import { Link } from "react-router-dom";
import LogoTile from "@/components/branding/LogoTile";
import EditableText from "@/components/editor/EditableText";

const Footer = () => {
  const { lang, setLang, t } = useLanguage();
  const { settings } = useSiteSettings();

  const quickLinks = [
    { label: t("footerHomePage") || "হোম পেজ", to: "/home" },
    { label: t("footerBlog") || "ব্লগ ও পোস্ট", to: "/blog" },
    { label: t("footerEvents") || "ইভেন্ট সমূহ", to: "/events" },
    { label: t("footerCourses") || "কোর্স সমূহ", to: "/courses" },
    { label: t("footerMembers") || "সদস্যবৃন্দ", to: "/members" },
  ];

  const contactEmail = settings.general.contact_email || "info@fsp.org.bd";
  const contactPhone = settings.general.contact_phone || "01715-015621";
  const address =
    lang === "en"
      ? settings.general.address_en || "Faridpur Shahitto Parishad, Sahitya Bhaban, Faridpur"
      : settings.general.address_bn || "ফরিদপুর সাহিত্য পরিষদ, সাহিত্য ভবন, ফরিদপুর";

  const toggleLang = (target: "bn" | "en") => {
    if (lang !== target) setLang(target);
  };

  return (
    <footer
      id="contact"
      className="relative bg-card/60 dark:bg-[#070b14] border-t border-border/40 text-foreground"
    >
      {/* ══════════════════════════════════════════════════════════════
          1. DESKTOP & TABLET FOOTER (md and up)
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Organization Branding (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <LogoTile size="md" glow="off" dilateRadius={3} />
                <div>
                  <EditableText
                    pageKey="global"
                    sectionKey="footer"
                    elementKey="brand_title"
                    defaultBn={settings.general.site_name_bn || "ফরিদপুর সাহিত্য পরিষদ"}
                    defaultEn={settings.general.site_name_en || "Faridpur Shahitto Parishad"}
                    as="h3"
                    className="font-bengali text-sm md:text-base font-bold text-foreground leading-tight"
                  />
                  <EditableText
                    pageKey="global"
                    sectionKey="footer"
                    elementKey="brand_sub"
                    defaultBn={settings.general.site_name_en || "FARIDPUR SHAHITTO PARISHAD"}
                    defaultEn={settings.general.site_name_bn || "ফরিদপুর সাহিত্য পরিষদ"}
                    as="p"
                    className="text-[9px] text-muted-foreground/80 tracking-widest uppercase mt-0.5"
                  />
                </div>
              </div>

              <EditableText
                pageKey="global"
                sectionKey="footer"
                elementKey="org_desc"
                defaultBn={
                  t("orgDesc") ||
                  "সাহিত্য, সংস্কৃতি ও মুক্তবুদ্ধির চর্চায় ঐতিহ্যবাহী সংগঠন। বাংলার ঐতিহ্য সংরক্ষণ ও বিকাশে নিবেদিত।"
                }
                defaultEn="Dedicated to literature, culture, and rational thought. Preserving the heritage of Bengal."
                multiline
                as="p"
                className="font-bengali text-xs text-muted-foreground leading-relaxed max-w-sm"
              />

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-1">
                {[
                  { Icon: Facebook, href: "#", label: "Facebook" },
                  { Icon: Youtube, href: "#", label: "YouTube" },
                  { Icon: Mail, href: `mailto:${contactEmail}`, label: "Email" },
                ].map(({ Icon, href, label }, idx) => (
                  <a
                    key={idx}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-secondary/80 dark:bg-white/[0.04] border border-border/40 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-muted-foreground flex items-center justify-center transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bengali text-xs font-semibold text-foreground tracking-wider uppercase">
                {t("quickLinks") || "দ্রুত লিংক"}
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-bengali inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Details (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bengali text-xs font-semibold text-foreground tracking-wider uppercase">
                {t("contactInfo") || "যোগাযোগ"}
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/70 shrink-0" />
                  <span className="font-bengali leading-relaxed">{address}</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bengali text-xs font-semibold text-foreground tracking-wider uppercase">
                {t("emailSubscribe") || "নিউজলেটার"}
              </h4>
              <p className="text-xs text-muted-foreground font-bengali leading-relaxed">
                {t("subscribeDesc") || "আমাদের সর্বশেষ খবর ও ইভেন্টের আপডেট পেতে সাবস্ক্রাইব করুন।"}
              </p>
              <form
                className="flex items-center gap-2 pt-1"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder={t("yourEmail") || "আপনার ইমেইল"}
                  className="w-full px-3.5 py-2 rounded-full bg-secondary/80 dark:bg-white/[0.04] border border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/70 text-xs focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Bottom Sub-Footer Bar */}
        <div className="border-t border-border/40 py-4 bg-background/50">
          <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-xs text-muted-foreground">
            {/* Left Column: Copyright */}
            <div className="text-center sm:text-left">
              <EditableText
                pageKey="global"
                sectionKey="footer"
                elementKey="copyright"
                defaultBn={t("copyright") || "© ২০২৬ ফরিদপুর সাহিত্য পরিষদ। সর্বস্বত্ব সংরক্ষিত।"}
                defaultEn="© 2026 Faridpur Shahitto Parishad. All rights reserved."
                as="p"
                className="font-bengali text-xs"
              />
            </div>

            {/* Center Column: Language Switcher */}
            <div className="flex justify-center">
              <div className="relative inline-flex items-center w-[112px] h-[30px] p-[2px] rounded-full bg-secondary/80 dark:bg-white/[0.06] border border-border/50 select-none">
                <div
                  className={`absolute top-[2px] bottom-[2px] w-[53px] rounded-full bg-primary shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
                    lang === "bn" ? "translate-x-0" : "translate-x-[53px]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleLang("bn")}
                  className={`relative z-10 w-[53px] h-full flex items-center justify-center rounded-full text-[11px] font-bengali font-semibold transition-colors duration-200 cursor-pointer ${
                    lang === "bn"
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="বাংলা"
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => toggleLang("en")}
                  className={`relative z-10 w-[53px] h-full flex items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 cursor-pointer ${
                    lang === "en"
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Right Column: Attribution */}
            <div className="text-center sm:text-right flex items-center justify-center sm:justify-end gap-1 text-xs text-muted-foreground">
              <span>{t("madeInBangladesh") || "বাংলাদেশে নির্মিত"}</span>
              <Heart className="w-3 h-3 text-primary inline" />
              <span className="font-mono font-semibold text-[11px] text-foreground/80 ml-0.5">code:4ce0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. MINIMAL MOBILE FOOTER (< md)
          Ultra-clean, compact, iOS-optimized with pb-24 for Tab Bar
         ══════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden px-5 pt-8 pb-24 space-y-6">
        {/* Brand & Subtitle */}
        <div className="flex flex-col items-center text-center space-y-2">
          <LogoTile size="sm" glow="off" dilateRadius={2} />
          <div>
            <h3 className="font-bengali font-bold text-sm text-foreground leading-tight">
              {settings.general.site_name_bn || "ফরিদপুর সাহিত্য পরিষদ"}
            </h3>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">
              {settings.general.site_name_en || "FARIDPUR SHAHITTO PARISHAD"}
            </p>
          </div>
          <p className="font-bengali text-xs text-muted-foreground/80 max-w-xs leading-relaxed">
            {t("orgDesc") || "সাহিত্য, সংস্কৃতি ও মুক্তবুদ্ধির চর্চায় নিবেদিত ঐতিহ্যবাহী সংগঠন।"}
          </p>
        </div>

        {/* Minimal Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-1 rounded-full bg-secondary/50 dark:bg-white/[0.04] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground font-bengali transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Social Icons & Contact Chip */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {[
            { Icon: Facebook, href: "#", label: "Facebook" },
            { Icon: Youtube, href: "#", label: "YouTube" },
            { Icon: Mail, href: `mailto:${contactEmail}`, label: "Email" },
            { Icon: Phone, href: `tel:${contactPhone}`, label: "Phone" },
          ].map(({ Icon, href, label }, idx) => (
            <a
              key={idx}
              href={href}
              aria-label={label}
              className="w-8 h-8 rounded-full bg-secondary/80 dark:bg-white/[0.04] border border-border/40 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>

        {/* Language Switcher & Copyright */}
        <div className="pt-4 border-t border-border/40 flex flex-col items-center gap-3 text-center">
          {/* Centered Language Toggle */}
          <div className="relative inline-flex items-center w-[112px] h-[30px] p-[2px] rounded-full bg-secondary/80 dark:bg-white/[0.06] border border-border/50 select-none">
            <div
              className={`absolute top-[2px] bottom-[2px] w-[53px] rounded-full bg-primary shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
                lang === "bn" ? "translate-x-0" : "translate-x-[53px]"
              }`}
            />
            <button
              type="button"
              onClick={() => toggleLang("bn")}
              className={`relative z-10 w-[53px] h-full flex items-center justify-center rounded-full text-[11px] font-bengali font-semibold transition-colors duration-200 ${
                lang === "bn" ? "text-primary-foreground" : "text-muted-foreground"
              }`}
              aria-label="বাংলা"
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => toggleLang("en")}
              className={`relative z-10 w-[53px] h-full flex items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                lang === "en" ? "text-primary-foreground" : "text-muted-foreground"
              }`}
              aria-label="English"
            >
              EN
            </button>
          </div>

          <p className="font-bengali text-[11px] text-muted-foreground">
            {t("copyright") || "© ২০২৬ ফরিদপুর সাহিত্য পরিষদ। সর্বস্বত্ব সংরক্ষিত।"}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
            <span>{t("madeInBangladesh") || "বাংলাদেশে নির্মিত"}</span>
            <Heart className="w-3 h-3 text-primary inline" />
            <span className="font-mono font-semibold text-[10px] text-foreground/80 ml-0.5">code:4ce0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
