import { useEffect } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { BookOpen, Users, Calendar, Award, MapPin, Phone, Mail } from "lucide-react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/landing/Footer";
import PageHeader from "@/components/landing/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { usePageBlocks } from "@/contexts/PageBlocksContext";

/**
 * About / History page populated from the printed booklet
 * "ফরিদপুর সাহিত্য পরিষদ — মহাফেজখানা থেকে" (editor: মফিজ ইমাম মিলন).
 *
 * Booklet prose stays hardcoded (memory: backlog). Stats, anniversaries,
 * honoured personalities, and intro/outro bodies are CMS-managed via
 * page_blocks rows under page="about".
 */

const FALLBACK_STATS = [
  { icon: Calendar, value: "১৯৮৩", labelBn: "প্রতিষ্ঠা", labelEn: "Founded" },
  { icon: Users, value: "৪০+", labelBn: "নির্বাহী সদস্য", labelEn: "Executive Members" },
  { icon: Award, value: "৩০+", labelBn: "সংবর্ধিত গুণীজন", labelEn: "Honoured Personalities" },
  { icon: BookOpen, value: "৪০+", labelBn: "বছরের ঐতিহ্য", labelEn: "Years of Legacy" },
];

const FALLBACK_HONOURED = [
  { year: "১৯৮৮", names: ["শিক্ষাবিদ অধ্যক্ষ অপূর্বকৃষ্ণ ঘোষ", "অধ্যাপক আবুল হাশেম", "বাবু শ্রীশচন্দ্র ঘোষ"] },
  { year: "১৯৯০", names: ["শিক্ষাবিদ এস এন কিউ জুলফিকার আলী", "পথিকৃৎ মুসলিম চিত্রশিল্পী কাজী আবুল কাশেম", "ঔপন্যাসিক রাজিয়া মজিদ"] },
  { year: "১৯৯২", names: ["ক্রীড়াবিদ আলাউদ্দিন খান", "শিল্পানুরাগী শ্রী রাধাগোবিন্দ সাহা", "নাট্যশিল্পী মহীউদ্দিন আহমেদ"] },
  { year: "১৯৯৩", names: ["চিত্রশিল্পী মুন্সী মহিউদ্দিন (জাতীয় পর্যায়ে শ্রেষ্ঠ চলচ্চিত্র কাহিনীকার)"] },
  { year: "১৯৯৪", names: ["এ কে এম আবদুল হাকিম মিয়া (পৌরসভার প্রাক্তন চেয়ারম্যান)", "শিশুসাহিত্যিক ও কবি আবুল হোসেন", "বর্ষীয়ান কবি আবদুল হামিদ শেখ", "ভেষজ চিকিৎসক সন্তোষ কুমার সাহা"] },
  { year: "১৯৯৫", names: ["প্রফেসর শেখ সামসের আলী", "কবি আবদুল বারি (কাব্যে কুরআন পাক)", "প্রবীণ সংগীত শিল্পী প্রফুল্ল কুমার চক্রবর্তী"] },
  { year: "১৯৯৬", names: ["সাংস্কৃতিক ব্যক্তিত্ব খোন্দকার নুরুল হোসেন", "কৃতী সেবিকা সুশীলা বালা সাহা", "মোঃ ছাইদ আলী খান", "শহীদ জননী বেগম রাবেয়া আহমেদ", "বীর মুক্তিযোদ্ধা প্রবোধ কুমার সরকার (পি কে সরকার)", "গীতিকবি জামাল হাবিব"] },
  { year: "১৯৯৭", names: ["কণ্ঠশিল্পী সেলিম মজুমদার", "শ্মশানবন্ধু কানু সেন"] },
  { year: "২০২০", names: ["বিশিষ্ট লেখক ও গবেষক অতিরিক্ত সচিব (অব.) মোহাম্মদ আলী খান"] },
];

const FALLBACK_ANNIVERSARIES = [
  { person: "জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমান", date: "১৭ই মার্চ ২০২০", venue: "জেলা প্রশাসকের কার্যালয় চত্বর — নাসির আলী মামুনের ক্যামেরায় বঙ্গবন্ধু আলোকচিত্র প্রদর্শনী" },
  { person: "ড. কাজী মোতাহার হোসেন", date: "৩০ জুলাই ১৯৯৭", venue: "ফরিদপুর মিউজিয়াম" },
  { person: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", date: "১২ সেপ্টেম্বর ১৯৯৪", venue: "ফরিদপুর মিউজিয়াম" },
  { person: "কাজী আবদুল ওদুদ", date: "২৬ এপ্রিল ১৯৯৪", venue: "ফরিদপুর মিউজিয়াম" },
  { person: "কবি জসীম উদদীন", date: "১ জানুয়ারি ২০০৩", venue: "সাহিত্য ভবন (পৌরসভার পূর্ব পার্শ্বে)" },
  { person: "জাতীয় কবি কাজী নজরুল ইসলাম", date: "২৪ মে ১৯৯৯", venue: "সাহিত্য ভবন (পৌরসভার পূর্ব পার্শ্বে)" },
  { person: "রবীন্দ্রনাথ সার্ধশত জন্মবার্ষিকী", date: "মে ২০২১", venue: "সাহিত্য ভবন এবং কুষ্টিয়ার শিলাইদহ" },
  { person: "কবিয়াল বিজয় সরকার (জন্মশতবর্ষ)", date: "২৪ মে ২০০৩", venue: "সাহিত্য ভবন" },
  { person: "মৃণাল সেন (জন্মশতবার্ষিকী)", date: "১৪–১৫ মে ২০২৩", venue: "মৃণাল সেনের পৈতৃক ভিটা, নিলটুলি (মেজবান পার্টি সেন্টার)" },
];

function getIcon(name: string) {
  const I = (LucideIcons as any)[name];
  return I || BookOpen;
}

const AboutPage = () => {
  const { t, lang } = useLanguage();
  const { settings } = useSiteSettings();
  const { getRawPublished, getBody, getAnniversaries, getHonoured, isVisible } = usePageBlocks();

  useEffect(() => {
    document.title = lang === "bn"
      ? "আমাদের সম্পর্কে — ফরিদপুর সাহিত্য পরিষদ"
      : "About Us — Faridpur Shahitto Parishad";
  }, [lang]);

  // CMS overrides
  const statsRaw = getRawPublished("stats", "about") as { stats?: Array<{ icon: string; value: string; label_bn: string; label_en: string; visible: boolean }> };
  const cmsStats = Array.isArray(statsRaw?.stats) ? statsRaw.stats.filter((s) => s.visible !== false) : null;
  const stats = cmsStats && cmsStats.length > 0
    ? cmsStats.map((s) => ({ icon: getIcon(s.icon), value: s.value, labelBn: s.label_bn, labelEn: s.label_en }))
    : FALLBACK_STATS;

  const intro = getBody("body_intro", "about");
  const outro = getBody("body_outro", "about");
  const introVisible = isVisible("body_intro", "about");
  const outroVisible = isVisible("body_outro", "about");
  const statsVisible = isVisible("stats", "about");

  const anniv = getAnniversaries("about");
  const annivVisible = isVisible("anniversaries", "about");
  const annivItems = (anniv.items && anniv.items.length > 0)
    ? anniv.items.filter((i) => i.visible !== false).map((i) => ({
        person: lang === "bn" ? i.person_bn : (i.person_en || i.person_bn),
        date:   lang === "bn" ? i.date_bn   : (i.date_en   || i.date_bn),
        venue:  lang === "bn" ? i.venue_bn  : (i.venue_en  || i.venue_bn),
      }))
    : FALLBACK_ANNIVERSARIES;
  const annivHeading = (lang === "bn" ? anniv.heading_bn : anniv.heading_en) || (lang === "bn" ? "যাঁদের জন্মশতবার্ষিকী উদযাপন করা হয়েছে" : "Centenary Celebrations Hosted");
  const annivSubtitle = (lang === "bn" ? anniv.subtitle_bn : anniv.subtitle_en) || (lang === "bn" ? "জাতির মণিষীদের স্মরণে পরিষদের আয়োজিত অনুষ্ঠানগুলি" : "Anniversary observances organised by the Parishad.");

  const hon = getHonoured("about");
  const honVisible = isVisible("honoured", "about");
  const honGroups = (hon.groups && hon.groups.length > 0)
    ? hon.groups.filter((g) => g.visible !== false).map((g) => ({
        year: lang === "bn" ? g.year_bn : (g.year_en || g.year_bn),
        names: (lang === "bn" ? g.names_bn : (g.names_en?.length ? g.names_en : g.names_bn)) || [],
      }))
    : FALLBACK_HONOURED;
  const honHeading = (lang === "bn" ? hon.heading_bn : hon.heading_en) || (lang === "bn" ? "যাঁদের সংবর্ধনা জানানো হয়েছে" : "Honoured Personalities");
  const honSubtitle = (lang === "bn" ? hon.subtitle_bn : hon.subtitle_en) || (lang === "bn" ? "ফরিদপুর সাহিত্য পরিষদ যে সকল গুণীজনকে সংবর্ধনা জানিয়েছে" : "Personalities honoured by Faridpur Shahitto Parishad over the years.");

  const introHeading = lang === "bn" ? intro.heading_bn : intro.heading_en;
  const introText = lang === "bn" ? intro.text_bn : intro.text_en;
  const outroHeading = lang === "bn" ? outro.heading_bn : outro.heading_en;
  const outroText = lang === "bn" ? outro.text_bn : outro.text_en;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero */}
      <PageHeader
        page="about"
        fallbackEyebrow={lang === "bn" ? "মহাফেজখানা থেকে" : "From the Archives"}
        fallbackTitle={lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
        fallbackSubtitle={lang === "bn"
          ? "১৯৮৩ সালে প্রতিষ্ঠিত ফরিদপুরের অগ্রগণ্য সাহিত্য সংগঠনের ইতিহাস ও কর্মযজ্ঞ"
          : "The history and work of Faridpur's foremost literary society, founded in 1983."}
      />

      {/* Body intro (optional CMS prose above stats) */}
      {introVisible && (introHeading || introText) && (
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {introHeading && (
              <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-4">{introHeading}</h2>
            )}
            {introText && (
              <div className="font-bengali text-foreground/90 leading-relaxed whitespace-pre-line">{introText}</div>
            )}
          </div>
        </section>
      )}

      {/* Stats */}
      {statsVisible && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-2xl border border-border p-6 text-center depth-card"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-bengali text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="font-bengali text-xs text-muted-foreground mt-1">
                    {lang === "bn" ? s.labelBn : s.labelEn}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* History (booklet prose, hardcoded per memory) */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-6">
            {lang === "bn" ? "প্রতিষ্ঠার পূর্বকথা" : "The Story Behind the Founding"}
          </h2>
          <div className="prose prose-lg max-w-none font-bengali text-foreground/90 space-y-5 leading-relaxed">
            <p>
              ফরিদপুর সাহিত্য পরিষদ প্রতিষ্ঠার পূর্বকথা বলতে গেলে প্রথম স্মরণ করতে হয় এ জেলার দুই গৌরব সন্তান —
              বাগ্মী কবি হুমায়ুন কবির ও পাকিস্তানের কেন্দ্রীয় মন্ত্রী আব্দুল্লাহ জহীরউদ্দিন লাল মিয়াকে।
              <strong> ১৯৩৯ সালে</strong> ফরিদপুর সাহিত্য পরিষদ গঠন করেছিলেন এবং সে বছরেই তাঁদের আমন্ত্রণে
              বহুমাত্রিক কথাসাহিত্যিক ঔপন্যাসিক <em>শরৎচন্দ্র চট্টোপাধ্যায়</em> এসেছিলেন ফরিদপুর এক সাহিত্যসভায়।
            </p>
            <p>
              ১৯৪৫–৪৬ সালের দিকে ফরিদপুরে ‘সাহিত্য চক্র’ নামে একটি সংগঠন ছিল। প্রতি মাসের প্রথম রোববার
              ছুটির দিনে সকাল থেকে দুপুর পর্যন্ত শহরের ঝিলটুলীর এক বাসায় সাহিত্য আড্ডা বসত। এ আসরে
              সভাপতিত্ব করতেন তৎকালীন জেলা ও দায়রা জজ <em>হিরন্ময় ব্যানার্জী</em>, যিনি পরবর্তী
              কর্মজীবনে বিশ্বভারতীর ভাইস চ্যান্সেলর হয়েছিলেন।
            </p>
            <p>
              ১৯৬৯ সালে প্রতিষ্ঠা হয় ফরিদপুর সাহিত্য ও সংস্কৃতি উন্নয়ন সংস্থা (ফসাসউস)। ১৯৭৫ সালে বীর মুক্তিযোদ্ধা
              কবি আতাহার খান, কবি শেখ শামসুল হক ও কবি মিহির চক্রবর্তীর আগ্রহে সভাপতি ইঞ্জিনিয়ার আবদুর রাজ্জাক
              এবং সম্পাদক নির্বাচিত করেন <strong>অধ্যাপক এম এ সামাদকে</strong>। সে সময়েই প্রথম শুরু হয়
              আলাওল সাহিত্য পুরস্কার প্রদানের অনুষ্ঠান।
            </p>
            <p>
              <strong>১৯৮৩ সালে</strong> সুফী মোতাহার হোসেনের ৮ম মৃত্যুবার্ষিকীতে তাঁর বাসভবন শহরের উপকণ্ঠ
              ভবানন্দপুরে আমরা একত্রিত হই। সাংস্কৃতিক জগতের অক্লান্ত কর্মী অধ্যাপক এম এ সামাদ-এর প্রস্তাবে ও
              উদ্যোগে গঠিত হয় <strong>ফরিদপুর সাহিত্য পরিষদ</strong>। মুক্তবুদ্ধির চর্চায় বিশ্বাসী নবীন ও প্রবীণ
              কবি-সাহিত্যিকগণ পনেরোদিন অন্তর মিলিত হতে শুরু করেন ফরিদপুর মিউজিয়ামে পাক্ষিক সাহিত্যসভায়।
            </p>
            <p>
              ১৯৮৮ সালে আয়োজন করা হয় দুদিন ব্যাপী নজরুল সম্মেলনের। জাতীয় অধ্যাপক রফিকুল ইসলাম, নজরুল গবেষক
              শাহাবুদ্দীন আহমেদ, শেখ দরবার আলম-সহ উপস্থিত হলেন কিংবদন্তিতুল্য চলচ্চিত্র পরিচালক ও সুরকার
              খান আতাউর রহমান ও তাঁর স্ত্রী সুকণ্ঠী নীলুফার ইয়াসমীন।
            </p>
            <p>
              ১৯৯১ সালে ফরিদপুর সাহিত্য পরিষদের উদ্যোগে প্রথম পল্লীকবি জসীমউদদীনের স্মরণে
              <strong> জসীম পল্লীমেলার</strong> আয়োজন করা হয়। অম্বিকাপুরে কবির বাড়ি সংলগ্ন এলাকায় এ মেলায়
              স্বতঃস্ফূর্ত মানুষের আগমনে পরবর্তী বছর তিনদিন, ’৯২-তে সাতদিন এবং এরপর থেকে পক্ষকালব্যাপী
              পল্লীমেলা হয়ে আসছে। একথা সর্বজনস্বীকৃত যে জসীমপল্লী মেলার উদ্যোক্তা ফরিদপুর সাহিত্য পরিষদ।
            </p>
            <p>
              ২০০৩ সালে কবি জসীমউদদীনের জন্মশতবার্ষিকীতে জসীম পল্লীমেলার মাঠে সবচেয়ে বড় প্যাভিলিয়নটি নিয়েছিল
              ফরিদপুর সাহিত্য পরিষদ। গ্রাম-বাংলার লোকঐতিহ্যের সামগ্রী দিয়ে সাজানো হয়েছিল এটি। পল্লীকবির ওপর
              ১৮ ফর্মার একটি স্মারকগ্রন্থ প্রকাশ করা হয় যার প্রচ্ছদ করেছিলেন শিল্পী কাইয়ুম চৌধুরী এবং সম্পাদনা
              করেছিলেন আলোকচিত্রী নাসির আলী মামুন।
            </p>
            <p className="text-muted-foreground italic text-sm">
              — মফিজ ইমাম মিলন, সম্পাদক
            </p>
          </div>
        </div>
      </section>

      {/* Birth anniversaries */}
      {annivVisible && annivItems.length > 0 && (
        <section className="py-12 bg-warm-gradient">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-2">
              {annivHeading}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground mb-8">
              {annivSubtitle}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {annivItems.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-5 depth-card"
                >
                  <p className="font-bengali font-semibold text-foreground mb-1">{a.person}</p>
                  <p className="text-xs text-accent font-bengali mb-2">{a.date}</p>
                  <p className="font-bengali text-xs text-muted-foreground">{a.venue}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Honoured personalities */}
      {honVisible && honGroups.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-2">
              {honHeading}
            </h2>
            <p className="font-bengali text-sm text-muted-foreground mb-8">
              {honSubtitle}
            </p>
            <div className="space-y-6">
              {honGroups.map((g, gi) => (
                <div key={gi} className="grid md:grid-cols-[120px_1fr] gap-4 items-start">
                  <div className="font-bengali text-lg font-bold text-primary">{g.year}</div>
                  <ul className="space-y-1.5">
                    {g.names.map((n, i) => (
                      <li key={i} className="font-bengali text-sm text-foreground/90 flex gap-2">
                        <span className="text-accent">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Body outro (optional CMS prose below honoured) */}
      {outroVisible && (outroHeading || outroText) && (
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {outroHeading && (
              <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-4">{outroHeading}</h2>
            )}
            {outroText && (
              <div className="font-bengali text-foreground/90 leading-relaxed whitespace-pre-line">{outroText}</div>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-bengali text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            {lang === "bn" ? "যোগাযোগ" : "Contact"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5 text-center">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-bengali text-xs text-muted-foreground whitespace-pre-line">
                {lang === "bn" ? settings.general.address_bn : settings.general.address_en}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 text-center">
              <Phone className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-bengali text-xs text-muted-foreground whitespace-pre-line">
                {settings.general.contact_phone}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 text-center">
              <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground break-all">{settings.general.contact_email}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
