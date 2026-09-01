export interface PageSectionElementMeta {
  elementKey: string;
  labelBn: string;
  labelEn: string;
  type: "text" | "heading" | "image" | "badge";
  defaultBn: string;
  defaultEn: string;
}

export interface SectionMeta {
  sectionKey: string;
  sectionTitleBn: string;
  sectionTitleEn: string;
  elements: PageSectionElementMeta[];
}

export interface PageMeta {
  pageKey: string;
  pageTitleBn: string;
  pageTitleEn: string;
  route: string;
  sections: SectionMeta[];
}

export const SITE_PAGES_REGISTRY: PageMeta[] = [
  {
    pageKey: "landing",
    pageTitleBn: "ল্যান্ডিং পেজ (Landing Page)",
    pageTitleEn: "Landing Page",
    route: "/",
    sections: [
      {
        sectionKey: "hero",
        sectionTitleBn: "হিরো ব্যানার (Hero Section)",
        sectionTitleEn: "Hero Banner",
        elements: [
          { elementKey: "tagline", labelBn: "উপরের ট্যাগলাইন", labelEn: "Tagline", type: "badge", defaultBn: "বাং লা  সং স্কৃ তি র  পা দ পী ঠ", defaultEn: "Seat of Bengali Culture" },
          { elementKey: "title_full", labelBn: "প্রধান শিরোনাম", labelEn: "Main Title", type: "heading", defaultBn: "ফরিদপুর সাহিত্য পরিষদ", defaultEn: "Faridpur Shahitto Parishad" },
          { elementKey: "subtitle", labelBn: "উপ-শিরোনাম ও বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "সাহিত্য, সংস্কৃতি ও জ্ঞানচর্চার মাধ্যমে বাংলার ঐতিহ্য সংরক্ষণ ও বিকাশে নিবেদিত", defaultEn: "Dedicated to preserving and developing the heritage of Bengal through literature, culture and pursuit of knowledge" },
          { elementKey: "visitors_badge", labelBn: "পরিদর্শক কাউন্টার লেবেল", labelEn: "Visitors Label", type: "text", defaultBn: "জন পরিদর্শক", defaultEn: "Visitors" },
          { elementKey: "cta_about", labelBn: "আমাদের সম্পর্কে বাটন", labelEn: "About CTA", type: "text", defaultBn: "আমাদের সম্পর্কে জানুন", defaultEn: "Learn About Us" },
          { elementKey: "cta_home", labelBn: "হোম পেজ বাটন", labelEn: "Home CTA", type: "text", defaultBn: "হোম পেজ দেখুন", defaultEn: "Explore Home" },
          { elementKey: "cta_members", labelBn: "সদস্যবৃন্দ বাটন", labelEn: "Members CTA", type: "text", defaultBn: "সদস্যবৃন্দ দেখুন", defaultEn: "View Members" },
        ],
      },
      {
        sectionKey: "about",
        sectionTitleBn: "আমাদের পরিচিতি (About Preview)",
        sectionTitleEn: "About Preview",
        elements: [
          { elementKey: "badge", labelBn: "ট্যাগ", labelEn: "Badge", type: "badge", defaultBn: "আমাদের পরিচিতি", defaultEn: "Our Identity" },
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "ফরিদপুর সাহিত্য পরিষদ", defaultEn: "Faridpur Shahitto Parishad" },
          { elementKey: "description", labelBn: "মূল বিবরণ", labelEn: "Description", type: "text", defaultBn: "বাংলা সাহিত্যের ঐতিহ্য সংরক্ষণ, নতুন প্রতিভার বিকাশ এবং সাংস্কৃতিক মেলবন্ধন তৈরির লক্ষ্যে আমরা নিরলসভাবে কাজ করে যাচ্ছি।", defaultEn: "Working tirelessly to preserve Bengali literary heritage, nurture new talents and foster cultural harmony." },
          { elementKey: "stat_founded_val", labelBn: "প্রতিষ্ঠা বছর মান", labelEn: "Founded Year Val", type: "text", defaultBn: "১৯৮৩", defaultEn: "1983" },
          { elementKey: "stat_founded_label", labelBn: "প্রতিষ্ঠা লেবেল", labelEn: "Founded Label", type: "text", defaultBn: "প্রতিষ্ঠা সাল", defaultEn: "Year Founded" },
          { elementKey: "stat_members_val", labelBn: "সদস্য সংখ্যা মান", labelEn: "Members Count Val", type: "text", defaultBn: "৫০+", defaultEn: "50+" },
          { elementKey: "stat_members_label", labelBn: "সদস্য লেবেল", labelEn: "Members Label", type: "text", defaultBn: "সক্রিয় সদস্য", defaultEn: "Active Members" },
          { elementKey: "stat_events_val", labelBn: "অনুষ্ঠান সংখ্যা মান", labelEn: "Events Val", type: "text", defaultBn: "১০০+", defaultEn: "100+" },
          { elementKey: "stat_events_label", labelBn: "অনুষ্ঠান লেবেল", labelEn: "Events Label", type: "text", defaultBn: "আয়োজিত অনুষ্ঠান", defaultEn: "Events Hosted" },
          { elementKey: "stat_awards_val", labelBn: "পুরস্কার সংখ্যা মান", labelEn: "Awards Val", type: "text", defaultBn: "৩০+", defaultEn: "30+" },
          { elementKey: "stat_awards_label", labelBn: "পুরস্কার লেবেল", labelEn: "Awards Label", type: "text", defaultBn: "সংবর্ধিত গুণীজন", defaultEn: "Honoured Persons" },
        ],
      },
      {
        sectionKey: "services",
        sectionTitleBn: "আমাদের কার্যক্রম (Services / Activities)",
        sectionTitleEn: "Activities",
        elements: [
          { elementKey: "badge", labelBn: "ট্যাগ", labelEn: "Badge", type: "badge", defaultBn: "আমাদের কার্যক্রম", defaultEn: "Our Activities" },
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "সাহিত্য ও সংস্কৃতির অনন্য ক্ষেত্র", defaultEn: "A Unique Sphere of Literature & Culture" },
          { elementKey: "svc_meet_title", labelBn: "সাহিত্যসভা শিরোনাম", labelEn: "Literary Meet Title", type: "heading", defaultBn: "নিয়মিত সাহিত্যসভা", defaultEn: "Regular Literary Meets" },
          { elementKey: "svc_meet_desc", labelBn: "সাহিত্যসভা বিবরণ", labelEn: "Literary Meet Desc", type: "text", defaultBn: "মাসিক ও পাক্ষিক সাহিত্য আড্ডা, কবিতা পাঠের আসর ও আলোচনা সভা।", defaultEn: "Monthly and bi-weekly literary gatherings and poetry readings." },
          { elementKey: "svc_pub_title", labelBn: "প্রকাশনা শিরোনাম", labelEn: "Publication Title", type: "heading", defaultBn: "সাহিত্য প্রকাশনা", defaultEn: "Publications" },
          { elementKey: "svc_pub_desc", labelBn: "প্রকাশনা বিবরণ", labelEn: "Publication Desc", type: "text", defaultBn: "নিয়মিত সাহিত্য পত্রিকা, বিশেষ স্মরণিকা ও স্থানীয় লেখকদের গ্রন্থ প্রকাশনা।", defaultEn: "Regular literary journals, special souvenirs, and books." },
          { elementKey: "svc_awards_title", labelBn: "গুণীজন সংবর্ধনা শিরোনাম", labelEn: "Awards Title", type: "heading", defaultBn: "গুণীজন সংবর্ধনা", defaultEn: "Honouring Legends" },
          { elementKey: "svc_awards_desc", labelBn: "গুণীজন সংবর্ধনা বিবরণ", labelEn: "Awards Desc", type: "text", defaultBn: "সাহিত্য ও সংস্কৃতিতে বিশেষ অবদানের জন্য গুণীজনদের সংবর্ধনা প্রদান।", defaultEn: "Honouring personalities for outstanding literary contributions." },
        ],
      },
      {
        sectionKey: "members",
        sectionTitleBn: "সদস্যবৃন্দ প্রিভিউ (Members Section)",
        sectionTitleEn: "Members Preview",
        elements: [
          { elementKey: "badge", labelBn: "ট্যাগ", labelEn: "Badge", type: "badge", defaultBn: "আমাদের পরিবার", defaultEn: "Our Family" },
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "পরিষদের সম্মানিত সদস্যবৃন্দ", defaultEn: "Honoured Members of the Parishad" },
          { elementKey: "view_all", labelBn: "সকল সদস্য বাটন", labelEn: "View All Button", type: "text", defaultBn: "সকল সদস্য দেখুন", defaultEn: "View All Members" },
        ],
      },
      {
        sectionKey: "events_preview",
        sectionTitleBn: "আসন্ন আয়োজন প্রিভিউ (Events Preview)",
        sectionTitleEn: "Events Preview",
        elements: [
          { elementKey: "badge", labelBn: "ট্যাগ", labelEn: "Badge", type: "badge", defaultBn: "আয়োজন", defaultEn: "Events" },
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "আসন্ন সাহিত্য ও সাংস্কৃতিক উৎসব", defaultEn: "Upcoming Literary & Cultural Events" },
          { elementKey: "view_all", labelBn: "সকল আয়োজন বাটন", labelEn: "View All Button", type: "text", defaultBn: "সকল অনুষ্ঠান দেখুন", defaultEn: "View All Events" },
        ],
      },
    ],
  },
  {
    pageKey: "home",
    pageTitleBn: "হোম পেজ (Community Hub)",
    pageTitleEn: "Home Hub",
    route: "/home",
    sections: [
      {
        sectionKey: "banner",
        sectionTitleBn: "স্লাইডার ব্যানার (Banner Slider)",
        sectionTitleEn: "Banner Slider",
        elements: [
          { elementKey: "slide_1_tag", labelBn: "স্লাইড ১ ট্যাগ", labelEn: "Slide 1 Tag", type: "badge", defaultBn: "ঐতিহ্য ও ইতিহাস", defaultEn: "Heritage & History" },
          { elementKey: "slide_1_title", labelBn: "স্লাইড ১ শিরোনাম", labelEn: "Slide 1 Title", type: "heading", defaultBn: "ফরিদপুরের অমর সাহিত্য ঐতিহ্য", defaultEn: "Faridpur's Immortal Literary Heritage" },
          { elementKey: "slide_1_sub", labelBn: "স্লাইড ১ উপ-শিরোনাম", labelEn: "Slide 1 Subtitle", type: "text", defaultBn: "শতবর্ষের সাহিত্য ও সাংস্কৃতিক মেলবন্ধন", defaultEn: "A century of literary and cultural union" },
          { elementKey: "slide_2_tag", labelBn: "স্লাইড ২ ট্যাগ", labelEn: "Slide 2 Tag", type: "badge", defaultBn: "সাহিত্য উৎসব", defaultEn: "Literary Festival" },
          { elementKey: "slide_2_title", labelBn: "স্লাইড ২ শিরোনাম", labelEn: "Slide 2 Title", type: "heading", defaultBn: "বার্ষিক সাহিত্য সম্মেলন ২০২৬", defaultEn: "Annual Literary Conference 2026" },
          { elementKey: "slide_2_sub", labelBn: "স্লাইড ২ উপ-শিরোনাম", labelEn: "Slide 2 Subtitle", type: "text", defaultBn: "গুণীজন সংবর্ধনা ও কবিতা পাঠের আসর", defaultEn: "Felicitation and poetry recital" },
        ],
      },
      {
        sectionKey: "notices",
        sectionTitleBn: "জরুরি নোটিশ বোর্ড (Notices)",
        sectionTitleEn: "Notices",
        elements: [
          { elementKey: "title", labelBn: "বিজ্ঞপ্তি শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "জরুরি বিজ্ঞপ্তি", defaultEn: "Announcements & Notices" },
        ],
      },
      {
        sectionKey: "latest_posts",
        sectionTitleBn: "সাম্প্রতিক সাহিত্যকর্ম ও প্রবন্ধ (Latest Posts)",
        sectionTitleEn: "Latest Posts",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "সাম্প্রতিক সাহিত্যকর্ম ও প্রবন্ধ", defaultEn: "Latest Articles & Publications" },
        ],
      },
      {
        sectionKey: "upcoming_events",
        sectionTitleBn: "আসন্ন আয়োজন (Upcoming Events)",
        sectionTitleEn: "Upcoming Events",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "আসন্ন ইভেন্ট ও অনুষ্ঠান", defaultEn: "Upcoming Events & Programs" },
        ],
      },
    ],
  },
  {
    pageKey: "about",
    pageTitleBn: "আমাদের সম্পর্কে পেজ (About Page)",
    pageTitleEn: "About Page",
    route: "/about",
    sections: [
      {
        sectionKey: "hero",
        sectionTitleBn: "হেডার ব্যানার (About Hero)",
        sectionTitleEn: "Hero Banner",
        elements: [
          { elementKey: "badge", labelBn: "ট্যাগ", labelEn: "Badge", type: "badge", defaultBn: "মহাফেজখানা থেকে", defaultEn: "From the Archives" },
          { elementKey: "title", labelBn: "প্রধান শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "আমাদের সম্পর্কে", defaultEn: "About Us" },
          { elementKey: "subtitle", labelBn: "উপ-শিরোনাম", labelEn: "Subtitle", type: "text", defaultBn: "১৯৮৩ সালে প্রতিষ্ঠিত ফরিদপুরের অগ্রগণ্য সাহিত্য সংগঠনের ইতিহাস ও কর্মযজ্ঞ", defaultEn: "History & activities of Faridpur’s foremost literary society, founded in 1983." },
        ],
      },
      {
        sectionKey: "stats",
        sectionTitleBn: "পরিসংখ্যান ফলক (Statistics)",
        sectionTitleEn: "Statistics",
        elements: [
          { elementKey: "stat_1_val", labelBn: "প্রতিষ্ঠা বছর মান", labelEn: "Founded Val", type: "text", defaultBn: "১৯৮৩", defaultEn: "1983" },
          { elementKey: "stat_1_label", labelBn: "প্রতিষ্ঠা লেবেল", labelEn: "Founded Label", type: "text", defaultBn: "প্রতিষ্ঠা", defaultEn: "Founded" },
          { elementKey: "stat_2_val", labelBn: "নির্বাহী সদস্য মান", labelEn: "Members Val", type: "text", defaultBn: "৪০+", defaultEn: "40+" },
          { elementKey: "stat_2_label", labelBn: "নির্বাহী সদস্য লেবেল", labelEn: "Members Label", type: "text", defaultBn: "নির্বাহী সদস্য", defaultEn: "Executive Members" },
          { elementKey: "stat_3_val", labelBn: "গুণীজন সংখ্যা মান", labelEn: "Honoured Val", type: "text", defaultBn: "৩০+", defaultEn: "30+" },
          { elementKey: "stat_3_label", labelBn: "গুণীজন লেবেল", labelEn: "Honoured Label", type: "text", defaultBn: "সংবর্ধিত গুণীজন", defaultEn: "Honoured Personalities" },
          { elementKey: "stat_4_val", labelBn: "ঐতিহ্য বছর মান", labelEn: "Legacy Val", type: "text", defaultBn: "৪০+", defaultEn: "40+" },
          { elementKey: "stat_4_label", labelBn: "ঐতিহ্য লেবেল", labelEn: "Legacy Label", type: "text", defaultBn: "বছরের ঐতিহ্য", defaultEn: "Years of Legacy" },
        ],
      },
      {
        sectionKey: "history",
        sectionTitleBn: "প্রতিষ্ঠার পূর্বকথা ও ইতিহাস (History)",
        sectionTitleEn: "History Section",
        elements: [
          { elementKey: "heading", labelBn: "ইতিহাস শিরোনাম", labelEn: "Heading", type: "heading", defaultBn: "প্রতিষ্ঠার পূর্বকথা", defaultEn: "The Story Behind the Founding" },
        ],
      },
      {
        sectionKey: "anniversaries",
        sectionTitleBn: "জন্মশতবার্ষিকী উদযাপন (Centenaries)",
        sectionTitleEn: "Centenaries Section",
        elements: [
          { elementKey: "heading", labelBn: "শিরোনাম", labelEn: "Heading", type: "heading", defaultBn: "যাঁদের জন্মশতবার্ষিকী উদযাপন করা হয়েছে", defaultEn: "Centenary Celebrations Hosted" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "জাতির মণিষীদের স্মরণে পরিষদের আয়োজিত অনুষ্ঠানগুলি", defaultEn: "Anniversary observances organised by the Parishad." },
        ],
      },
      {
        sectionKey: "honoured",
        sectionTitleBn: "সংবর্ধিত গুণীজন (Honoured Personalities)",
        sectionTitleEn: "Honoured Section",
        elements: [
          { elementKey: "heading", labelBn: "শিরোনাম", labelEn: "Heading", type: "heading", defaultBn: "যাঁদের সংবর্ধনা জানানো হয়েছে", defaultEn: "Honoured Personalities" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "ফরিদপুর সাহিত্য পরিষদ যে সকল গুণীজনকে সংবর্ধনা জানিয়েছে", defaultEn: "Personalities honoured by Faridpur Shahitto Parishad over the years." },
        ],
      },
      {
        sectionKey: "contact",
        sectionTitleBn: "যোগাযোগ তথ্য (Contact)",
        sectionTitleEn: "Contact Section",
        elements: [
          { elementKey: "heading", labelBn: "যোগাযোগ শিরোনাম", labelEn: "Heading", type: "heading", defaultBn: "যোগাযোগ", defaultEn: "Contact" },
        ],
      },
    ],
  },
  {
    pageKey: "events",
    pageTitleBn: "ইভেন্ট সমূহ (Events Page)",
    pageTitleEn: "Events Page",
    route: "/events",
    sections: [
      {
        sectionKey: "header",
        sectionTitleBn: "ইভেন্ট পেজ হেডার (Events Hero)",
        sectionTitleEn: "Hero Header",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "সকল আয়োজন ও অনুষ্ঠান", defaultEn: "All Events & Gatherings" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "ফরিদপুর সাহিত্য পরিষদের সাম্প্রতিক ও আসন্ন সকল অনুষ্ঠানের সময়সূচি", defaultEn: "Schedule of recent and upcoming events by Faridpur Shahitto Parishad" },
        ],
      },
    ],
  },
  {
    pageKey: "courses",
    pageTitleBn: "কোর্স ও কর্মশালা (Courses Page)",
    pageTitleEn: "Courses Page",
    route: "/courses",
    sections: [
      {
        sectionKey: "header",
        sectionTitleBn: "কোর্স পেজ হেডার (Courses Hero)",
        sectionTitleEn: "Hero Header",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "সকল কোর্স ও কর্মশালা", defaultEn: "All Courses & Workshops" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "সাহিত্য, ভাষা ও সংস্কৃতির উপর বিশেষায়িত পাঠ্যক্রম", defaultEn: "Specialized courses on Bengali literature, language, and arts" },
        ],
      },
    ],
  },
  {
    pageKey: "members",
    pageTitleBn: "সদস্যবৃন্দ (Members Page)",
    pageTitleEn: "Members Page",
    route: "/members",
    sections: [
      {
        sectionKey: "header",
        sectionTitleBn: "সদস্য পেজ হেডার (Members Hero)",
        sectionTitleEn: "Hero Header",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "আমাদের সম্মানিত সদস্যবৃন্দ", defaultEn: "Our Honoured Members" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "সাহিত্য ও সংস্কৃতি বিকাশে নিবেদিত প্রাণ লেখক, কবি ও সংগঠকবৃন্দ", defaultEn: "Writers, poets, and organizers dedicated to literature and culture" },
        ],
      },
      {
        sectionKey: "advisors",
        sectionTitleBn: "উপদেষ্টা ও প্রতিষ্ঠাতা পরিষদ (Senior Advisors)",
        sectionTitleEn: "Senior Advisors",
        elements: [
          { elementKey: "title", labelBn: "উপদেষ্টা শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "উপদেষ্টা ও প্রতিষ্ঠাতা পরিষদ", defaultEn: "Advisory & Founding Council" },
        ],
      },
      {
        sectionKey: "general",
        sectionTitleBn: "কার্যনির্বাহী ও সাধারণ পরিষদ (General Council)",
        sectionTitleEn: "General Council",
        elements: [
          { elementKey: "title", labelBn: "সাধারণ পরিষদ শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "কার্যনির্বাহী ও সাধারণ সদস্যবৃন্দ", defaultEn: "Executive & General Members" },
        ],
      },
    ],
  },
  {
    pageKey: "blog",
    pageTitleBn: "সাহিত্য সাময়িকী ও ব্লগ (Blog Page)",
    pageTitleEn: "Blog Page",
    route: "/blog",
    sections: [
      {
        sectionKey: "header",
        sectionTitleBn: "ব্লগ পেজ হেডার (Blog Hero)",
        sectionTitleEn: "Hero Header",
        elements: [
          { elementKey: "title", labelBn: "শিরোনাম", labelEn: "Title", type: "heading", defaultBn: "সাহিত্য ও সংস্কৃতি ব্লগ", defaultEn: "Literature & Culture Blog" },
          { elementKey: "subtitle", labelBn: "বিবরণ", labelEn: "Subtitle", type: "text", defaultBn: "কাব্য, গল্প, প্রবন্ধ, সমালোচনা ও গবেষণামূলক লেখার সংকলন", defaultEn: "Collection of poems, stories, essays, critiques, and research articles" },
        ],
      },
    ],
  },
  {
    pageKey: "global",
    pageTitleBn: "গ্লোবাল হেডার ও ফুটার (Global Header & Footer)",
    pageTitleEn: "Global Header & Footer",
    route: "/",
    sections: [
      {
        sectionKey: "footer",
        sectionTitleBn: "ওয়েবসাইট ফুটার (Site Footer)",
        sectionTitleEn: "Site Footer",
        elements: [
          { elementKey: "brand_title", labelBn: "সংগঠনের নাম (বাংলা)", labelEn: "Organization Name (BN)", type: "heading", defaultBn: "ফরিদপুর সাহিত্য পরিষদ", defaultEn: "Faridpur Shahitto Parishad" },
          { elementKey: "brand_sub", labelBn: "সংগঠনের নাম (ইংরেজি)", labelEn: "Organization Name (EN)", type: "text", defaultBn: "FARIDPUR SHAHITTO PARISHAD", defaultEn: "Faridpur Shahitto Parishad" },
          { elementKey: "org_desc", labelBn: "সংগঠনের পরিচিতি", labelEn: "Organization Desc", type: "text", defaultBn: "সাহিত্য, সংস্কৃতি ও জ্ঞানচর্চার মাধ্যমে বাংলার ঐতিহ্য সংরক্ষণ ও বিকাশে নিবেদিত একটি সাংস্কৃতিক সংগঠন।", defaultEn: "A cultural organization dedicated to preserving and developing the heritage of Bengal through literature, culture, and knowledge." },
          { elementKey: "copyright", labelBn: "কপিরাইট নোটিশ", labelEn: "Copyright Notice", type: "text", defaultBn: "© ২০২৬ ফরিদপুর সাহিত্য পরিষদ। সর্বস্বত্ব সংরক্ষিত।", defaultEn: "© 2026 Faridpur Shahitto Parishad. All rights reserved." },
        ],
      },
    ],
  },
];
