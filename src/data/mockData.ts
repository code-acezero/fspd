// Demo courses kept intentionally until real courses are wired up.
// All other mock data (blog posts, events, notices, banner slides) has been removed.

export interface Course {
  id: string; title: string; titleEn: string; instructor: string; instructorEn: string; duration: string; durationEn: string;
  modules: number; enrolled: number; status: "open" | "ongoing" | "coming_soon";
  description: string; descriptionEn: string; highlights: string[]; highlightsEn: string[];
}

export const courses: Course[] = [
  { id: "1", title: "বাংলা সাহিত্যের ইতিহাস", titleEn: "History of Bengali Literature", instructor: "ড. আবদুল করিম", instructorEn: "Dr. Abdul Karim", duration: "৩ মাস", durationEn: "3 Months", modules: 12, enrolled: 45, status: "open", description: "প্রাচীন যুগ থেকে আধুনিক যুগ পর্যন্ত বাংলা সাহিত্যের বিবর্তন।", descriptionEn: "Evolution of Bengali literature from ancient to modern era.", highlights: ["১২টি মডিউল", "সাপ্তাহিক অ্যাসাইনমেন্ট", "সার্টিফিকেট প্রদান", "অভিজ্ঞ শিক্ষক"], highlightsEn: ["12 Modules", "Weekly Assignments", "Certificate Provided", "Experienced Instructors"] },
  { id: "2", title: "ইংরেজি ভাষা কোর্স", titleEn: "English Language Course", instructor: "অধ্যাপক ফাতেমা বেগম", instructorEn: "Prof. Fatema Begum", duration: "৬ মাস", durationEn: "6 Months", modules: 24, enrolled: 78, status: "ongoing", description: "মৌলিক ইংরেজি থেকে উন্নত স্তর পর্যন্ত ভাষা শিক্ষা।", descriptionEn: "Language learning from basic to advanced English.", highlights: ["২৪টি মডিউল", "কথোপকথন অনুশীলন", "অনলাইন ক্লাস", "ব্যক্তিগত মূল্যায়ন"], highlightsEn: ["24 Modules", "Conversation Practice", "Online Classes", "Personal Assessment"] },
  { id: "3", title: "সৃজনশীল লেখালেখি সেমিনার", titleEn: "Creative Writing Seminar", instructor: "মোঃ রফিকুল ইসলাম", instructorEn: "Md. Rafiqul Islam", duration: "২ মাস", durationEn: "2 Months", modules: 8, enrolled: 32, status: "coming_soon", description: "কবিতা, গল্প ও প্রবন্ধ লেখার কলাকৌশল শিক্ষা।", descriptionEn: "Learning the art of writing poetry, stories and essays.", highlights: ["৮টি সেশন", "ব্যক্তিগত ফিডব্যাক", "প্রকাশনার সুযোগ", "পরামর্শদাতা সেশন"], highlightsEn: ["8 Sessions", "Personal Feedback", "Publication Opportunities", "Mentorship Sessions"] },
];
