import { PaletteId } from "./palettes";

export interface SpecialDay {
  id: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  greetingBn: string;
  greetingEn: string;
  paletteId: PaletteId;
  icon: string; // Emoji or visual symbol
  startMonth: number; // 1-12
  startDay: number;   // 1-31
  endMonth: number;   // 1-12
  endDay: number;     // 1-31
  category: "national" | "literary" | "seasonal" | "religious";
  badgeColor: string;
  banglaDateLabel: string;
  calendarTypeBn?: string;
  calendarTypeEn?: string;
  /** Estimated years for movable/lunar festivals if applicable */
  movableDates?: {
    [year: number]: { startMonth: number; startDay: number; endMonth: number; endDay: number };
  };
}

/**
 * Bangla Digits Helper: Converts English numerals to Bengali digits
 */
export const toBanglaDigits = (num: number | string): string => {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => digits[parseInt(d, 10)]);
};

export interface BanglaDateInfo {
  day: number;
  dayBn: string;
  monthNameBn: string;
  monthNameEn: string;
  year: number;
  yearBn: string;
  formattedBn: string;
  formattedEn: string;
}

/**
 * Official Bangla Academy Gregorian to Bangla Date Converter (Bangladesh Standard)
 * Revised Bangladesh Standard:
 * - 1st Boishakh = April 14 (Year starts)
 * - Boishakh to Ashwin (first 6 months) = 31 days each
 * - Kartik to Magh (next 4 months) = 30 days each
 * - Falgun = 29 days (30 days in Gregorian leap year)
 * - Chaitra = 30 days
 */
export function getBanglaDate(date: Date = new Date()): BanglaDateInfo {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-11
  const gDay = date.getDate();

  // Bangla Year: if April 14 or later, gYear - 593; if before April 14, gYear - 594
  const banglaYear = (gMonth > 3 || (gMonth === 3 && gDay >= 14)) ? gYear - 593 : gYear - 594;

  let monthNameBn = "";
  let monthNameEn = "";
  let bDay = 1;

  if (gMonth === 3 && gDay >= 14) {
    // Apr 14 - Apr 30 (Boishakh)
    monthNameBn = "বৈশাখ";
    monthNameEn = "Boishakh";
    bDay = gDay - 14 + 1;
  } else if (gMonth === 4 && gDay < 15) {
    // May 1 - May 14 (Boishakh)
    monthNameBn = "বৈশাখ";
    monthNameEn = "Boishakh";
    bDay = 17 + gDay; // 17 days in Apr (14..30) + May day
  } else if (gMonth === 4 && gDay >= 15) {
    // May 15 - May 31 (Jaistha)
    monthNameBn = "জ্যৈষ্ঠ";
    monthNameEn = "Jaistha";
    bDay = gDay - 15 + 1;
  } else if (gMonth === 5 && gDay < 15) {
    // Jun 1 - Jun 14 (Jaistha)
    monthNameBn = "জ্যৈষ্ঠ";
    monthNameEn = "Jaistha";
    bDay = 17 + gDay; // 17 days in May (15..31) + Jun day
  } else if (gMonth === 5 && gDay >= 15) {
    // Jun 15 - Jun 30 (Ashar)
    monthNameBn = "আষাঢ়";
    monthNameEn = "Ashar";
    bDay = gDay - 15 + 1;
  } else if (gMonth === 6 && gDay < 16) {
    // Jul 1 - Jul 15 (Ashar)
    monthNameBn = "আষাঢ়";
    monthNameEn = "Ashar";
    bDay = 16 + gDay; // 16 days in Jun (15..30) + Jul day
  } else if (gMonth === 6 && gDay >= 16) {
    // Jul 16 - Jul 31 (Sraban)
    monthNameBn = "শ্রাবণ";
    monthNameEn = "Sraban";
    bDay = gDay - 16 + 1;
  } else if (gMonth === 7 && gDay < 16) {
    // Aug 1 - Aug 15 (Sraban)
    monthNameBn = "শ্রাবণ";
    monthNameEn = "Sraban";
    bDay = 16 + gDay; // 16 days in Jul (16..31) + Aug day
  } else if (gMonth === 7 && gDay >= 16) {
    // Aug 16 - Aug 31 (Bhadro)
    monthNameBn = "ভাদ্র";
    monthNameEn = "Bhadro";
    bDay = gDay - 16 + 1;
  } else if (gMonth === 8 && gDay < 16) {
    // Sep 1 - Sep 15 (Bhadro)
    monthNameBn = "ভাদ্র";
    monthNameEn = "Bhadro";
    bDay = 16 + gDay; // 16 days in Aug (16..31) + Sep day
  } else if (gMonth === 8 && gDay >= 16) {
    // Sep 16 - Sep 30 (Ashwin)
    monthNameBn = "আশ্বিন";
    monthNameEn = "Ashwin";
    bDay = gDay - 16 + 1;
  } else if (gMonth === 9 && gDay < 17) {
    // Oct 1 - Oct 16 (Ashwin)
    monthNameBn = "আশ্বিন";
    monthNameEn = "Ashwin";
    bDay = 15 + gDay; // 15 days in Sep (16..30) + Oct day
  } else if (gMonth === 9 && gDay >= 17) {
    // Oct 17 - Oct 31 (Kartik)
    monthNameBn = "কার্তিক";
    monthNameEn = "Kartik";
    bDay = gDay - 17 + 1;
  } else if (gMonth === 10 && gDay < 16) {
    // Nov 1 - Nov 15 (Kartik)
    monthNameBn = "কার্তিক";
    monthNameEn = "Kartik";
    bDay = 15 + gDay; // 15 days in Oct (17..31) + Nov day
  } else if (gMonth === 10 && gDay >= 16) {
    // Nov 16 - Nov 30 (Agrahayan)
    monthNameBn = "অগ্রহায়ণ";
    monthNameEn = "Agrahayan";
    bDay = gDay - 16 + 1;
  } else if (gMonth === 11 && gDay < 16) {
    // Dec 1 - Dec 15 (Agrahayan)
    monthNameBn = "অগ্রহায়ণ";
    monthNameEn = "Agrahayan";
    bDay = 15 + gDay; // 15 days in Nov (16..30) + Dec day
  } else if (gMonth === 11 && gDay >= 16) {
    // Dec 16 - Dec 31 (Poush)
    monthNameBn = "পৌষ";
    monthNameEn = "Poush";
    bDay = gDay - 16 + 1;
  } else if (gMonth === 0 && gDay < 15) {
    // Jan 1 - Jan 14 (Poush)
    monthNameBn = "পৌষ";
    monthNameEn = "Poush";
    bDay = 16 + gDay; // 16 days in Dec (16..31) + Jan day
  } else if (gMonth === 0 && gDay >= 15) {
    // Jan 15 - Jan 31 (Magh)
    monthNameBn = "মাঘ";
    monthNameEn = "Magh";
    bDay = gDay - 15 + 1;
  } else if (gMonth === 1 && gDay < 14) {
    // Feb 1 - Feb 13 (Magh)
    monthNameBn = "মাঘ";
    monthNameEn = "Magh";
    bDay = 17 + gDay; // 17 days in Jan (15..31) + Feb day
  } else if (gMonth === 1 && gDay >= 14) {
    // Feb 14 - Feb 28/29 (Falgun)
    monthNameBn = "ফাল্গুন";
    monthNameEn = "Falgun";
    bDay = gDay - 14 + 1;
  } else if (gMonth === 2 && gDay < 15) {
    // Mar 1 - Mar 14 (Falgun)
    monthNameBn = "ফাল্গুন";
    monthNameEn = "Falgun";
    const isLeap = (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);
    const febDaysFrom14 = isLeap ? 16 : 15; // Feb 14..29 or Feb 14..28
    bDay = febDaysFrom14 + gDay;
  } else if (gMonth === 2 && gDay >= 15) {
    // Mar 15 - Mar 31 (Chaitra)
    monthNameBn = "চৈত্র";
    monthNameEn = "Chaitra";
    bDay = gDay - 15 + 1;
  } else {
    // Apr 1 - Apr 13 (Chaitra)
    monthNameBn = "চৈত্র";
    monthNameEn = "Chaitra";
    bDay = 17 + gDay; // 17 days in Mar (15..31) + Apr day
  }

  const dayBn = toBanglaDigits(bDay);
  const yearBn = toBanglaDigits(banglaYear);

  return {
    day: bDay,
    dayBn,
    monthNameBn,
    monthNameEn,
    year: banglaYear,
    yearBn,
    formattedBn: `${dayBn} ${monthNameBn} ${yearBn} বঙ্গাব্দ`,
    formattedEn: `${bDay} ${monthNameEn} ${banglaYear} BS`,
  };
}

/**
 * Bangladesh National, Literary, Seasonal and Religious Festivals Registry
 */
export const BANGLADESH_SPECIAL_DAYS: SpecialDay[] = [
  // 1. অমর একুশে ফেব্রুয়ারি — শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস
  {
    id: "ekushey",
    nameBn: "অমর একুশে ফেব্রুয়ারি (শহীদ দিবস ও মাতৃভাষা দিবস)",
    nameEn: "Ekushey February (Language Martyrs' & Mother Language Day)",
    taglineBn: "আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারি, আমি কি ভুলিতে পারি",
    taglineEn: "Honoring the supreme sacrifice of the 1952 Language Movement martyrs",
    greetingBn: "রক্তে রাঙানো অমর একুশে — সকল ভাষাশহীদের প্রতি বিনম্র শ্রদ্ধা",
    greetingEn: "Solemn homage to all language martyrs of Ekushey February",
    paletteId: "ekushey",
    icon: "🌺",
    startMonth: 2,
    startDay: 20,
    endMonth: 2,
    endDay: 22,
    category: "national",
    badgeColor: "bg-neutral-900 text-rose-400 border-rose-500/30",
    banglaDateLabel: "৮ই ফাল্গুন (২১শে ফেব্রুয়ারি)",
    calendarTypeBn: "জাতীয় ঐতিহাসিক দিবস",
    calendarTypeEn: "National Historic Day",
  },

  // 2. মহান স্বাধীনতা ও জাতীয় দিবস (২৬শে মার্চ)
  {
    id: "shadhinota",
    nameBn: "মহান স্বাধীনতা ও জাতীয় দিবস (২৬শে মার্চ)",
    nameEn: "Independence & National Day of Bangladesh",
    taglineBn: "একটি লাল-সবুজ পতাকার জন্মকথা — ২৬শে মার্চ স্বাধীনতা দিবস",
    taglineEn: "Commemorating the historic declaration of Bangladesh Independence in 1971",
    greetingBn: "শুভ মহান স্বাধীনতা দিবস — বীর মুক্তিযোদ্ধাদের প্রতি সশ্রদ্ধ সালাম",
    greetingEn: "Happy Independence Day — Saluting the heroic Freedom Fighters",
    paletteId: "shadhinota",
    icon: "🇧🇩",
    startMonth: 3,
    startDay: 25,
    endMonth: 3,
    endDay: 27,
    category: "national",
    badgeColor: "bg-emerald-950 text-emerald-300 border-red-500/40",
    banglaDateLabel: "১২ই চৈত্র (২৬শে মার্চ)",
    calendarTypeBn: "জাতীয় দিবস",
    calendarTypeEn: "National Independence Day",
  },

  // 3. পহেলা বৈশাখ — বাংলা নববর্ষ (১৪ই এপ্রিল)
  {
    id: "boishakh",
    nameBn: "পহেলা বৈশাখ (বাংলা নববর্ষ)",
    nameEn: "Pohela Boishakh (Bengali New Year)",
    taglineBn: "এসো হে বৈশাখ, এসো এসো — শুভ নববর্ষ",
    taglineEn: "Welcoming the Bengali New Year with vibrant alpona and festivities",
    greetingBn: "শুভ নববর্ষ! নতুন বছরের অনাবিল আনন্দ ও শুভেচ্ছা",
    greetingEn: "Shubho Nabobarsho! Warm greetings on Bengali New Year",
    paletteId: "boishakhi",
    icon: "🌾",
    startMonth: 4,
    startDay: 13,
    endMonth: 4,
    endDay: 16,
    category: "seasonal",
    badgeColor: "bg-amber-950 text-amber-300 border-red-500/30",
    banglaDateLabel: "১লা বৈশাখ (১৪ই এপ্রিল)",
    calendarTypeBn: "বঙ্গাব্দ সৌর নববর্ষ",
    calendarTypeEn: "Bangla Solar New Year",
  },

  // 4. মহান বিজয় দিবস (১৬ই ডিসেম্বর)
  {
    id: "bijoy",
    nameBn: "মহান বিজয় দিবস (১৬ই ডিসেম্বর)",
    nameEn: "Victory Day of Bangladesh",
    taglineBn: "রক্তস্নাত বিজয়ের মহাকাব্য — ১৬ই ডিসেম্বর মহান বিজয় দিবস",
    taglineEn: "Celebrating the glorious victory of Bangladesh in the 1971 Liberation War",
    greetingBn: "শুভ মহান বিজয় দিবস — ৩০ লক্ষ শহীদ ও বীর মুক্তিযোদ্ধাদের বিনম্র শ্রদ্ধা",
    greetingEn: "Happy Victory Day — Eternal respect to the martyrs and veterans",
    paletteId: "bijoy",
    icon: "🇧🇩",
    startMonth: 12,
    startDay: 15,
    endMonth: 12,
    endDay: 18,
    category: "national",
    badgeColor: "bg-emerald-950 text-amber-300 border-emerald-500/40",
    banglaDateLabel: "১লা পৌষ (১৬ই ডিসেম্বর)",
    calendarTypeBn: "জাতীয় ঐতিহাসিক দিবস",
    calendarTypeEn: "National Victory Day",
  },

  // 5. পহেলা ফাল্গুন ও বসন্ত বরণ (১৪ই ফেব্রুয়ারি)
  {
    id: "basanto",
    nameBn: "পহেলা ফাল্গুন (বসন্ত বরণ ও বসন্ত উৎসব)",
    nameEn: "Pohela Falgun (Spring Festival)",
    taglineBn: "আজি বসন্ত জাগ্রত দ্বারে — বাসন্তী রঙে রাঙুক মন",
    taglineEn: "Celebrating the colorful advent of Spring (Ritu Raj Basanta)",
    greetingBn: "শুভ বসন্তোৎসব ও ফাল্গুনের স্নিগ্ধ শুভেচ্ছা",
    greetingEn: "Spring Festival greetings — Happy Pohela Falgun",
    paletteId: "basanto",
    icon: "🌼",
    startMonth: 2,
    startDay: 13,
    endMonth: 2,
    endDay: 15,
    category: "seasonal",
    badgeColor: "bg-amber-900 text-yellow-300 border-amber-400/40",
    banglaDateLabel: "১লা ফাল্গুন (১৪ই ফেব্রুয়ারি)",
    calendarTypeBn: "বঙ্গাব্দ সৌর ঋতু উৎসব",
    calendarTypeEn: "Bangla Spring Season",
  },

  // 6. পল্লীকবি জসীম উদ্‌দীন জন্মজয়ন্তী (১লা জানুয়ারি) — ফরিদপুরের অহংকার
  {
    id: "jasimuddin",
    nameBn: "পল্লীকবি জসীম উদ্‌দীন জন্মোৎসব (ফরিদপুরের গৌরব)",
    nameEn: "Polli Kobi Jasimuddin Jayanti (Faridpur Pride)",
    taglineBn: "নকশী কাঁথার মাঠ ও সোজন বাদিয়ার ঘাট — পল্লীবাংলার রূপকার",
    taglineEn: "Celebrating the birth anniversary of rural bard Polli Kobi Jasimuddin born in Tambulkhana, Faridpur",
    greetingBn: "পল্লীকবি জসীম উদ্‌দীনের জন্মবার্ষিকীতে ফরিদপুর সাহিত্য পরিষদের বিনম্র স্মরণ",
    greetingEn: "Faridpur Shahitto Parishad honors our proud poet Jasimuddin",
    paletteId: "jasimuddin",
    icon: "📜",
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 3,
    category: "literary",
    badgeColor: "bg-amber-950 text-amber-200 border-amber-600/40",
    banglaDateLabel: "১৭ই পৌষ (১লা জানুয়ারি)",
    calendarTypeBn: "সাহিত্যিক ও লোকসংস্কৃতি",
    calendarTypeEn: "Literary & Folk Heritage",
  },

  // 7. বিশ্বকবি রবীন্দ্রনাথ ঠাকুর জন্মজয়ন্তী (২৫শে বৈশাখ / ৮ই মে)
  {
    id: "rabindra",
    nameBn: "রবীন্দ্র জয়ন্তী (২৫শে বৈশাখ / ৮ই মে)",
    nameEn: "Rabindra Jayanti (Birth Anniversary of Tagore)",
    taglineBn: "হে নূতন, দেখা দিক আর-বার জন্মের প্রথম শুভক্ষণ",
    taglineEn: "Honoring Nobel laureate Rabindranath Tagore's immense literary contribution",
    greetingBn: "শুভ রবীন্দ্র জয়ন্তী — বিশ্বকবির অমর সৃষ্টিকে শ্রদ্ধাঞ্জলি",
    greetingEn: "Happy Rabindra Jayanti — Remembering the Nobel laureate bard",
    paletteId: "rabindra",
    icon: "✍️",
    startMonth: 5,
    startDay: 7,
    endMonth: 5,
    endDay: 9,
    category: "literary",
    badgeColor: "bg-indigo-950 text-indigo-200 border-indigo-400/40",
    banglaDateLabel: "২৫শে বৈশাখ (৮ই মে)",
    calendarTypeBn: "সাহিত্যিক ও সাংস্কৃতিক",
    calendarTypeEn: "Literary Heritage",
  },

  // 8. জাতীয় কবি কাজী নজরুল ইসলাম জন্মজয়ন্তী (১১ই জ্যৈষ্ঠ / ২৫শে মে)
  {
    id: "nazrul",
    nameBn: "নজরুল জয়ন্তী (জাতীয় কবি কাজী নজরুল ইসলাম জন্মোৎসব)",
    nameEn: "Nazrul Jayanti (National Poet Kazi Nazrul Islam)",
    taglineBn: "বল বীর— বল উন্নত মম শির! বিদ্রোহী ও সাম্যের কবি",
    taglineEn: "Celebrating the revolutionary rebel poet and National Poet of Bangladesh",
    greetingBn: "শুভ নজরুল জয়ন্তী — সাম্য ও দ্রোহের কবি কাজী নজরুল ইসলামকে সশ্রদ্ধ প্রণতি",
    greetingEn: "Happy Nazrul Jayanti — Honoring National Poet Kazi Nazrul Islam",
    paletteId: "nazrul",
    icon: "⚡",
    startMonth: 5,
    startDay: 24,
    endMonth: 5,
    endDay: 26,
    category: "literary",
    badgeColor: "bg-red-950 text-amber-300 border-orange-500/40",
    banglaDateLabel: "১১ই জ্যৈষ্ঠ (২৫শে মে)",
    calendarTypeBn: "সাহিত্যিক ও জাতীয় কবি স্মারক",
    calendarTypeEn: "National Poet Memorial",
  },

  // 9. পবিত্র ঈদুল ফিতর (Eid-ul-Fitr)
  {
    id: "eid_fitr",
    nameBn: "পবিত্র ঈদুল ফিতর (Eid-ul-Fitr)",
    nameEn: "Holy Eid-ul-Fitr Celebration",
    taglineBn: "রমজানের ঐ রোজার শেষে এলো খুশির ঈদ",
    taglineEn: "Joyous celebration of Eid-ul-Fitr with peace, harmony and blessings",
    greetingBn: "ঈদ মোবারক! আনন্দ, শান্তি ও সৌহার্দ্যে ভরে উঠুক আপনার জীবন",
    greetingEn: "Eid Mubarak! Wishing joy, peace, and prosperity to all",
    paletteId: "eid",
    icon: "🌙",
    startMonth: 3,
    startDay: 30,
    endMonth: 4,
    endDay: 2,
    category: "religious",
    badgeColor: "bg-emerald-950 text-emerald-200 border-emerald-400/40",
    banglaDateLabel: "১লা শাওয়াল (হিজরি)",
    calendarTypeBn: "হিজরি চান্দ্র ধর্মীয় উৎসব",
    calendarTypeEn: "Islamic Hijri Lunar",
    movableDates: {
      2025: { startMonth: 3, startDay: 30, endMonth: 4, endDay: 2 },
      2026: { startMonth: 3, startDay: 20, endMonth: 3, endDay: 23 },
      2027: { startMonth: 3, startDay: 9, endMonth: 3, endDay: 12 },
      2028: { startMonth: 2, startDay: 26, endMonth: 2, endDay: 29 },
      2029: { startMonth: 2, startDay: 14, endMonth: 2, endDay: 17 },
    },
  },

  // 10. পবিত্র ঈদুল আজহা (Eid-ul-Adha)
  {
    id: "eid_adha",
    nameBn: "পবিত্র ঈদুল আজহা (Eid-ul-Adha)",
    nameEn: "Holy Eid-ul-Adha Celebration",
    taglineBn: "ত্যাগের মহিমায় উদ্ভাসিত পবিত্র ঈদুল আজহা",
    taglineEn: "The festival of sacrifice, brotherhood, and devotion",
    greetingBn: "পবিত্র ঈদুল আজহা মোবারক — ত্যাগের আনন্দে শুভকামনা",
    greetingEn: "Eid-ul-Adha Mubarak — Warm wishes of peace and devotion",
    paletteId: "eid",
    icon: "🌙",
    startMonth: 5,
    startDay: 27,
    endMonth: 5,
    endDay: 30,
    category: "religious",
    badgeColor: "bg-emerald-950 text-amber-200 border-emerald-400/40",
    banglaDateLabel: "১০ই জিলহজ্জ (হিজরি)",
    calendarTypeBn: "হিজরি চান্দ্র ধর্মীয় উৎসব",
    calendarTypeEn: "Islamic Hijri Lunar",
    movableDates: {
      2025: { startMonth: 6, startDay: 6, endMonth: 6, endDay: 9 },
      2026: { startMonth: 5, startDay: 26, endMonth: 5, endDay: 29 },
      2027: { startMonth: 5, startDay: 16, endMonth: 5, endDay: 19 },
      2028: { startMonth: 5, startDay: 4, endMonth: 5, endDay: 7 },
      2029: { startMonth: 4, startDay: 23, endMonth: 4, endDay: 26 },
    },
  },

  // 11. শারদীয় দুর্গোৎসব (Durga Puja)
  {
    id: "puja",
    nameBn: "শারদীয় দুর্গোৎসব (Durga Puja)",
    nameEn: "Sharadiya Durga Puja Festival",
    taglineBn: "শরতের কাশফুল আর ঢাকের বোলে শারদীয় দুর্গোৎসবের শুভ আগমন",
    taglineEn: "Autumn festivities of harmony, heritage, and joy across Bangladesh",
    greetingBn: "শারদীয় দুর্গোৎসবের আন্তরিক শুভেচ্ছা ও অভিনন্দন",
    greetingEn: "Warmest greetings and best wishes on Sharadiya Durga Puja",
    paletteId: "puja",
    icon: "🪔",
    startMonth: 10,
    startDay: 18,
    endMonth: 10,
    endDay: 22,
    category: "religious",
    badgeColor: "bg-rose-950 text-amber-200 border-amber-400/40",
    banglaDateLabel: "আশ্বিন শুক্লপক্ষ (শারদীয়)",
    calendarTypeBn: "সনাতন শারদীয় পঞ্জিকা",
    calendarTypeEn: "Sharadiya Hindu Calendar",
    movableDates: {
      2025: { startMonth: 9, startDay: 29, endMonth: 10, endDay: 3 },
      2026: { startMonth: 10, startDay: 18, endMonth: 10, endDay: 22 },
      2027: { startMonth: 10, startDay: 8, endMonth: 10, endDay: 12 },
      2028: { startMonth: 9, startDay: 26, endMonth: 9, endDay: 30 },
      2029: { startMonth: 10, startDay: 15, endMonth: 10, endDay: 19 },
    },
  },

  // 12. অমর একুশে বইমেলা মাস (ফেব্রুয়ারি মাসব্যাপী সাহিত্যিক আবহ)
  {
    id: "boimela",
    nameBn: "অমর একুশে বইমেলা ও সাহিত্য মাস",
    nameEn: "Amar Ekushey Boi Mela Literature Month",
    taglineBn: "বই পড়ি, স্বদেশ গড়ি — ফেব্রুয়ারি মাসজুড়ে সাহিত্যের মহোৎসব",
    taglineEn: "Celebrating the nation's month-long sacred book fair and literary heritage",
    greetingBn: "অমর একুশে বইমেলা ও সাহিত্য মাসের শুভেচ্ছা — বই হোক নিত্যসঙ্গী",
    greetingEn: "Celebrating the National Book Month — Happy Reading!",
    paletteId: "boimela",
    icon: "📚",
    startMonth: 2,
    startDay: 1,
    endMonth: 2,
    endDay: 28,
    category: "literary",
    badgeColor: "bg-slate-900 text-amber-300 border-amber-500/30",
    banglaDateLabel: "১৮ই মাঘ - ১৬ই ফাল্গুন (ফেব্রুয়ারি মাস)",
    calendarTypeBn: "জাতীয় সাহিত্য মাস",
    calendarTypeEn: "National Book Month",
  },
];

/**
 * Check if a date falls within a given day range
 */
function isDateInRange(
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();      // 1-31

  if (startMonth === endMonth) {
    return m === startMonth && d >= startDay && d <= endDay;
  }

  // Cross-month range
  if (m === startMonth && d >= startDay) return true;
  if (m === endMonth && d <= endDay) return true;
  if (startMonth < endMonth && m > startMonth && m < endMonth) return true;
  return false;
}

/**
 * Returns the active special day for today, or for a specific simulated date.
 * Specific single-day festivals take precedence over month-long events like Boimela.
 */
export function getActiveSpecialDay(targetDate: Date = new Date()): SpecialDay | null {
  const currentYear = targetDate.getFullYear();

  // Sort: shorter duration (more specific) festivals first
  const sorted = [...BANGLADESH_SPECIAL_DAYS].sort((a, b) => {
    if (a.id === "boimela") return 1;
    if (b.id === "boimela") return -1;
    return 0;
  });

  for (const day of sorted) {
    let { startMonth, startDay, endMonth, endDay } = day;

    // Check movable lunar dates if applicable
    if (day.movableDates && day.movableDates[currentYear]) {
      const moved = day.movableDates[currentYear];
      startMonth = moved.startMonth;
      startDay = moved.startDay;
      endMonth = moved.endMonth;
      endDay = moved.endDay;
    }

    if (isDateInRange(targetDate, startMonth, startDay, endMonth, endDay)) {
      return day;
    }
  }

  return null;
}

/**
 * Returns the next upcoming special day from today and the number of days left.
 */
export function getNextUpcomingSpecialDay(targetDate: Date = new Date()): {
  specialDay: SpecialDay;
  daysRemaining: number;
  startDateFormatted: string;
} | null {
  const today = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const currentYear = targetDate.getFullYear();

  let closest: { specialDay: SpecialDay; diffDays: number; startFormatted: string } | null = null;

  for (const day of BANGLADESH_SPECIAL_DAYS) {
    if (day.id === "boimela") continue; // Skip generic month span for countdown

    let startMonth = day.startMonth;
    let startDay = day.startDay;

    if (day.movableDates && day.movableDates[currentYear]) {
      startMonth = day.movableDates[currentYear].startMonth;
      startDay = day.movableDates[currentYear].startDay;
    }

    // Target start date in current year
    let target = new Date(currentYear, startMonth - 1, startDay);

    // If already passed this year, check next year
    if (target.getTime() < today.getTime()) {
      target = new Date(currentYear + 1, startMonth - 1, startDay);
    }

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (!closest || diffDays < closest.diffDays) {
      const monthNamesBn = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
      ];
      closest = {
        specialDay: day,
        diffDays,
        startFormatted: `${startDay} ${monthNamesBn[startMonth - 1]}`,
      };
    }
  }

  if (!closest) return null;

  return {
    specialDay: closest.specialDay,
    daysRemaining: closest.diffDays,
    startDateFormatted: closest.startFormatted,
  };
}

export interface YearlyFestivalItem {
  id: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  greetingBn: string;
  greetingEn: string;
  paletteId: PaletteId;
  icon: string;
  category: "national" | "literary" | "seasonal" | "religious";
  badgeColor: string;
  calendarTypeBn: string;
  calendarTypeEn: string;
  banglaDateLabel: string;
  calculatedBanglaDate: string;
  gregorianRangeBn: string;
  gregorianRangeEn: string;
  startDate: Date;
  endDate: Date;
  isMovable: boolean;
  specialDay: SpecialDay;
}

/**
 * Computes all 12 festivals for a given Gregorian year with accurate Gregorian start/end dates,
 * authentic Bangla Academy Bongabdo conversion, lunar shifts, and returns the sorted chronological list.
 */
export function getYearlyFestivalCalendar(year: number): YearlyFestivalItem[] {
  const monthNamesBn = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  const monthNamesEn = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const items: YearlyFestivalItem[] = BANGLADESH_SPECIAL_DAYS.map((day) => {
    let startMonth = day.startMonth;
    let startDay = day.startDay;
    let endMonth = day.endMonth;
    let endDay = day.endDay;
    const isMovable = Boolean(day.movableDates);

    if (day.movableDates && day.movableDates[year]) {
      const moved = day.movableDates[year];
      startMonth = moved.startMonth;
      startDay = moved.startDay;
      endMonth = moved.endMonth;
      endDay = moved.endDay;
    }

    const startDate = new Date(year, startMonth - 1, startDay);
    const endDate = new Date(year, endMonth - 1, endDay);

    const banglaStart = getBanglaDate(startDate);
    const banglaEnd = getBanglaDate(endDate);

    let calculatedBanglaDate: string;
    if (day.id === "boimela") {
      calculatedBanglaDate = `${banglaStart.dayBn} ${banglaStart.monthNameBn} – ${banglaEnd.dayBn} ${banglaEnd.monthNameBn} ${banglaEnd.yearBn} বঙ্গাব্দ`;
    } else if (day.id === "boishakh") {
      calculatedBanglaDate = `১লা বৈশাখ ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "ekushey") {
      calculatedBanglaDate = `৮ই ফাল্গুন ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "shadhinota") {
      calculatedBanglaDate = `১২ই চৈত্র ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "bijoy") {
      calculatedBanglaDate = `১লা পৌষ ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "basanto") {
      calculatedBanglaDate = `১লা ফাল্গুন ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "jasimuddin") {
      calculatedBanglaDate = `১৭ই পৌষ ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "rabindra") {
      calculatedBanglaDate = `২৫শে বৈশাখ ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else if (day.id === "nazrul") {
      calculatedBanglaDate = `১১ই জ্যৈষ্ঠ ${toBanglaDigits(banglaStart.year)} বঙ্গাব্দ`;
    } else {
      // For movable festivals
      if (startMonth === endMonth && startDay === endDay) {
        calculatedBanglaDate = `${banglaStart.dayBn} ${banglaStart.monthNameBn} ${banglaStart.yearBn} বঙ্গাব্দ`;
      } else {
        calculatedBanglaDate = `${banglaStart.dayBn} ${banglaStart.monthNameBn} – ${banglaEnd.dayBn} ${banglaEnd.monthNameBn} ${banglaEnd.yearBn} বঙ্গাব্দ`;
      }
    }

    let gregorianRangeBn: string;
    let gregorianRangeEn: string;

    if (startMonth === endMonth && startDay === endDay) {
      gregorianRangeBn = `${toBanglaDigits(startDay)} ${monthNamesBn[startMonth - 1]} ${toBanglaDigits(year)}`;
      gregorianRangeEn = `${startDay} ${monthNamesEn[startMonth - 1]} ${year}`;
    } else if (startMonth === endMonth) {
      gregorianRangeBn = `${toBanglaDigits(startDay)}–${toBanglaDigits(endDay)} ${monthNamesBn[startMonth - 1]} ${toBanglaDigits(year)}`;
      gregorianRangeEn = `${startDay}–${endDay} ${monthNamesEn[startMonth - 1]} ${year}`;
    } else {
      gregorianRangeBn = `${toBanglaDigits(startDay)} ${monthNamesBn[startMonth - 1]} – ${toBanglaDigits(endDay)} ${monthNamesBn[endMonth - 1]} ${toBanglaDigits(year)}`;
      gregorianRangeEn = `${startDay} ${monthNamesEn[startMonth - 1]} – ${endDay} ${monthNamesEn[endMonth - 1]} ${year}`;
    }

    return {
      id: day.id,
      nameBn: day.nameBn,
      nameEn: day.nameEn,
      taglineBn: day.taglineBn,
      taglineEn: day.taglineEn,
      greetingBn: day.greetingBn,
      greetingEn: day.greetingEn,
      paletteId: day.paletteId,
      icon: day.icon,
      category: day.category,
      badgeColor: day.badgeColor,
      calendarTypeBn: day.calendarTypeBn || (day.category === "national" ? "জাতীয় দিবস" : "উৎসব"),
      calendarTypeEn: day.calendarTypeEn || (day.category === "national" ? "National Day" : "Festival"),
      banglaDateLabel: day.banglaDateLabel,
      calculatedBanglaDate,
      gregorianRangeBn,
      gregorianRangeEn,
      startDate,
      endDate,
      isMovable,
      specialDay: day,
    };
  });

  return items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

