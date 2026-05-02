// Mock data for the entire site
export interface BlogPost {
  id: string; title: string; titleEn: string; excerpt: string; excerptEn: string; content: string;
  author: string; authorImage?: string; date: string; category: string; image?: string;
  tags: string[]; youtubeUrl?: string; rating: number; ratingCount: number; commentCount: number; featured?: boolean;
}

export interface Event {
  id: string; title: string; titleEn: string; date: string; time: string;
  location: string; description: string; tag: string; tagColor: string; image?: string;
}

export interface Notice { id: string; title: string; date: string; priority: "high" | "medium" | "low"; }

export interface Course {
  id: string; title: string; titleEn: string; instructor: string; instructorEn: string; duration: string; durationEn: string;
  modules: number; enrolled: number; status: "open" | "ongoing" | "coming_soon";
  description: string; descriptionEn: string; highlights: string[]; highlightsEn: string[];
}

export const blogPosts: BlogPost[] = [
  { id: "1", title: "বাংলা সাহিত্যে রবীন্দ্রনাথের অবদান", titleEn: "Rabindranath's Contribution to Bengali Literature", excerpt: "রবীন্দ্রনাথ ঠাকুর বাংলা সাহিত্যের সবচেয়ে প্রভাবশালী লেখকদের একজন। তাঁর সাহিত্যকর্ম আজও আমাদের অনুপ্রাণিত করে।", excerptEn: "Rabindranath Tagore is one of the most influential writers in Bengali literature. His literary works continue to inspire us today.", content: `রবীন্দ্রনাথ ঠাকুর (৭ মে ১৮৬১ - ৭ আগস্ট ১৯৪১) ছিলেন অগ্রণী বাঙালি কবি, ঔপন্যাসিক, সংগীতস্রষ্টা, নাট্যকার, চিত্রকর, ছোটগল্পকার, প্রাবন্ধিক, অভিনেতা, কণ্ঠশিল্পী ও দার্শনিক।\n\nতিনি ছিলেন এমন একজন সৃজনশীল প্রতিভা যিনি বাংলা ভাষা ও সাহিত্যকে বিশ্বের দরবারে পরিচিত করেছিলেন। ১৯১৩ সালে গীতাঞ্জলি কাব্যগ্রন্থের ইংরেজি অনুবাদের জন্য তিনি সাহিত্যে নোবেল পুরস্কার লাভ করেন।\n\n## সাহিত্যকর্ম\n\nরবীন্দ্রনাথের সাহিত্যকর্ম অত্যন্ত বিস্তৃত। তিনি প্রায় দুই হাজারের বেশি গান রচনা করেছেন, যা রবীন্দ্রসংগীত নামে পরিচিত। বাংলাদেশ ও ভারতের জাতীয় সংগীত তাঁরই রচনা।\n\n## প্রভাব\n\nবাংলা সাহিত্যে তাঁর প্রভাব এতটাই গভীর যে তাঁকে 'বিশ্বকবি' উপাধিতে ভূষিত করা হয়েছে। তাঁর সাহিত্যকর্ম আজও নতুন প্রজন্মকে অনুপ্রাণিত করে চলেছে।`, author: "ড. আবদুল করিম", date: "২০ মার্চ, ২০২৬", category: "সাহিত্য", tags: ["রবীন্দ্রনাথ", "বাংলা সাহিত্য", "কবিতা"], youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", rating: 4.8, ratingCount: 124, commentCount: 32, featured: true },
  { id: "2", title: "ফরিদপুরের লোকসংস্কৃতি ও ঐতিহ্য", titleEn: "Folk Culture and Heritage of Faridpur", excerpt: "ফরিদপুর জেলার সমৃদ্ধ লোকসংস্কৃতি ও ঐতিহ্যের একটি সংক্ষিপ্ত পরিচিতি।", excerptEn: "A brief introduction to the rich folk culture and heritage of Faridpur district.", content: "ফরিদপুর জেলার সমৃদ্ধ লোকসংস্কৃতি বাংলাদেশের সাংস্কৃতিক ঐতিহ্যের একটি গুরুত্বপূর্ণ অংশ...", author: "অধ্যাপক ফাতেমা বেগম", date: "১৫ মার্চ, ২০২৬", category: "সংস্কৃতি", tags: ["ফরিদপুর", "লোকসংস্কৃতি", "ঐতিহ্য"], rating: 4.5, ratingCount: 89, commentCount: 18, featured: true },
  { id: "3", title: "আধুনিক বাংলা কবিতার ধারা", titleEn: "Trends in Modern Bengali Poetry", excerpt: "আধুনিক বাংলা কবিতার বিবর্তন ও সাম্প্রতিক ধারাসমূহের বিশ্লেষণ।", excerptEn: "An analysis of the evolution and recent trends in modern Bengali poetry.", content: "আধুনিক বাংলা কবিতা ত্রিশের দশক থেকে শুরু হয়ে আজ পর্যন্ত বিভিন্ন পরিবর্তনের মধ্য দিয়ে এসেছে...", author: "মোঃ রফিকুল ইসলাম", date: "১০ মার্চ, ২০২৬", category: "সাহিত্য", tags: ["কবিতা", "আধুনিক সাহিত্য"], rating: 4.3, ratingCount: 56, commentCount: 12 },
  { id: "4", title: "বাংলা নাটকের ইতিহাস ও বিকাশ", titleEn: "History and Evolution of Bengali Drama", excerpt: "বাংলা নাটকের উৎপত্তি থেকে আধুনিক যুগ পর্যন্ত এর বিকাশের ধারা।", excerptEn: "The development of Bengali drama from its origins to the modern era.", content: "বাংলা নাটকের ইতিহাস অত্যন্ত সমৃদ্ধ ও বৈচিত্র্যময়...", author: "সুফিয়া খানম", date: "৫ মার্চ, ২০২৬", category: "নাটক", tags: ["নাটক", "থিয়েটার", "সংস্কৃতি"], rating: 4.6, ratingCount: 72, commentCount: 21 },
  { id: "5", title: "বৈশাখী উৎসব ও বাঙালি সংস্কৃতি", titleEn: "Boishakhi Festival and Bengali Culture", excerpt: "পহেলা বৈশাখ ও বাঙালি জীবনে এর সাংস্কৃতিক গুরুত্ব নিয়ে আলোচনা।", excerptEn: "A discussion on Pohela Boishakh and its cultural significance in Bengali life.", content: "পহেলা বৈশাখ বাংলা নববর্ষের প্রথম দিন...", author: "জাহিদ হাসান", date: "১ মার্চ, ২০২৬", category: "উৎসব", tags: ["বৈশাখ", "উৎসব", "সংস্কৃতি"], youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", rating: 4.9, ratingCount: 203, commentCount: 45 },
];

export const events: Event[] = [
  { id: "1", title: "বসন্ত কবিতা উৎসব ২০২৬", titleEn: "Spring Poetry Festival 2026", date: "১৫ এপ্রিল, ২০২৬", time: "বিকাল ৪:০০ - রাত ৯:০০", location: "ফরিদপুর শিল্পকলা একাডেমি", description: "বিশিষ্ট কবিদের কবিতা পাঠ ও তরুণ কবিদের কবিতা প্রতিযোগিতা।", tag: "আসন্ন", tagColor: "bg-forest text-primary-foreground" },
  { id: "2", title: "বাংলা সাহিত্য সেমিনার", titleEn: "Bengali Literature Seminar", date: "২৫ এপ্রিল, ২০২৬", time: "সকাল ১০:০০ - বিকাল ৩:০০", location: "জেলা পাবলিক লাইব্রেরি", description: "আধুনিক বাংলা সাহিত্যের বিভিন্ন দিক নিয়ে আলোচনা ও প্রশ্নোত্তর পর্ব।", tag: "নিবন্ধন চলছে", tagColor: "bg-accent text-accent-foreground" },
  { id: "3", title: "লোকসংগীত সন্ধ্যা", titleEn: "Folk Music Evening", date: "৫ মে, ২০২৬", time: "সন্ধ্যা ৬:০০ - রাত ১০:০০", location: "মুক্তিযোদ্ধা মিলনায়তন", description: "বাউল, ভাটিয়ালি ও অন্যান্য লোকসংগীতের পরিবেশনা।", tag: "শীঘ্রই", tagColor: "bg-primary text-primary-foreground" },
  { id: "4", title: "চিত্রকলা প্রদর্শনী", titleEn: "Art Exhibition", date: "১৫ মে, ২০২৬", time: "সকাল ১১:০০ - সন্ধ্যা ৭:০০", location: "ফরিদপুর জেলা শিল্পকলা একাডেমি", description: "স্থানীয় শিল্পীদের চিত্রকলা ও ভাস্কর্য প্রদর্শনী।", tag: "আসন্ন", tagColor: "bg-terracotta text-primary-foreground" },
];

export const notices: Notice[] = [
  { id: "1", title: "বার্ষিক সাধারণ সভার তারিখ ঘোষণা - ১৫ এপ্রিল ২০২৬", date: "২৮ মার্চ", priority: "high" },
  { id: "2", title: "নতুন সদস্য নিবন্ধন শুরু হয়েছে", date: "২৫ মার্চ", priority: "medium" },
  { id: "3", title: "কবিতা প্রতিযোগিতার ফলাফল প্রকাশ", date: "২০ মার্চ", priority: "low" },
  { id: "4", title: "মাসিক পত্রিকা 'সাহিত্য সুধা' প্রকাশিত", date: "১৮ মার্চ", priority: "medium" },
  { id: "5", title: "অফিস সময়সূচি পরিবর্তন বিজ্ঞপ্তি", date: "১৫ মার্চ", priority: "low" },
];

export const courses: Course[] = [
  { id: "1", title: "বাংলা সাহিত্যের ইতিহাস", titleEn: "History of Bengali Literature", instructor: "ড. আবদুল করিম", instructorEn: "Dr. Abdul Karim", duration: "৩ মাস", durationEn: "3 Months", modules: 12, enrolled: 45, status: "open", description: "প্রাচীন যুগ থেকে আধুনিক যুগ পর্যন্ত বাংলা সাহিত্যের বিবর্তন।", descriptionEn: "Evolution of Bengali literature from ancient to modern era.", highlights: ["১২টি মডিউল", "সাপ্তাহিক অ্যাসাইনমেন্ট", "সার্টিফিকেট প্রদান", "অভিজ্ঞ শিক্ষক"], highlightsEn: ["12 Modules", "Weekly Assignments", "Certificate Provided", "Experienced Instructors"] },
  { id: "2", title: "ইংরেজি ভাষা কোর্স", titleEn: "English Language Course", instructor: "অধ্যাপক ফাতেমা বেগম", instructorEn: "Prof. Fatema Begum", duration: "৬ মাস", durationEn: "6 Months", modules: 24, enrolled: 78, status: "ongoing", description: "মৌলিক ইংরেজি থেকে উন্নত স্তর পর্যন্ত ভাষা শিক্ষা।", descriptionEn: "Language learning from basic to advanced English.", highlights: ["২৪টি মডিউল", "কথোপকথন অনুশীলন", "অনলাইন ক্লাস", "ব্যক্তিগত মূল্যায়ন"], highlightsEn: ["24 Modules", "Conversation Practice", "Online Classes", "Personal Assessment"] },
  { id: "3", title: "সৃজনশীল লেখালেখি সেমিনার", titleEn: "Creative Writing Seminar", instructor: "মোঃ রফিকুল ইসলাম", instructorEn: "Md. Rafiqul Islam", duration: "২ মাস", durationEn: "2 Months", modules: 8, enrolled: 32, status: "coming_soon", description: "কবিতা, গল্প ও প্রবন্ধ লেখার কলাকৌশল শিক্ষা।", descriptionEn: "Learning the art of writing poetry, stories and essays.", highlights: ["৮টি সেশন", "ব্যক্তিগত ফিডব্যাক", "প্রকাশনার সুযোগ", "পরামর্শদাতা সেশন"], highlightsEn: ["8 Sessions", "Personal Feedback", "Publication Opportunities", "Mentorship Sessions"] },
];

export const bannerSlides = [
  { id: 1, title: "বসন্ত কবিতা উৎসব ২০২৬", subtitle: "আসুন কবিতার সুরে মেতে উঠি", tag: "আসন্ন ইভেন্ট" },
  { id: 2, title: "নতুন সদস্য নিবন্ধন শুরু", subtitle: "আজই যোগ দিন আমাদের সাহিত্য পরিবারে", tag: "ঘোষণা" },
  { id: 3, title: "মাসিক পত্রিকা 'সাহিত্য সুধা'", subtitle: "এপ্রিল সংখ্যা প্রকাশিত হয়েছে", tag: "প্রকাশনা" },
];