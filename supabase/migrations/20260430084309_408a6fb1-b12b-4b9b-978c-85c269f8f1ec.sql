
-- 1) Replace seeded members with the real 2022-2024 executive committee
DELETE FROM public.members;

INSERT INTO public.members (name, name_en, title, title_en, role, is_senior, is_active, is_approved, sort_order, gradient_class) VALUES
-- Founder + senior leadership
('অধ্যাপক এম. এ. সামাদ',         'Professor M. A. Samad',           'প্রতিষ্ঠাতা সভাপতি', 'Founder President',          'founder',   true, true, true,  1, 'from-primary to-crimson'),
('প্রফেসর আলতাফ হোসেন',          'Professor Altaf Hossain',         'সভাপতি',              'President',                  'president', true, true, true,  2, 'from-primary to-crimson'),
('অধ্যাপক ম. হালিম',              'Professor M. Halim',              'সহ-সভাপতি',           'Vice President',             'vp',        true, true, true,  3, 'from-primary to-crimson'),
('প্রফেসর আবদুল হামিদ মোল্লা',    'Professor Abdul Hamid Molla',     'সহ-সভাপতি',           'Vice President',             'vp',        true, true, true,  4, 'from-primary to-crimson'),
('অধ্যক্ষ আবদুল্লাহ আল মামুন',    'Principal Abdullah Al Mamun',     'সহ-সভাপতি',           'Vice President',             'vp',        true, true, true,  5, 'from-primary to-crimson'),
('জনাব মফিজ ইমাম মিলন',           'Mr. Mafiz Imam Milan',            'সম্পাদক',             'General Secretary',          'secretary', true, true, true,  6, 'from-primary to-crimson'),
('জনাব মৃধা রেজাউল',              'Mr. Mridha Rezaul',               'যুগ্ম-সম্পাদক',        'Joint Secretary',            'joint_secretary', true, true, true, 7, 'from-primary to-crimson'),
('জনাব মাহবুব হোসেন পিয়াল',       'Mr. Mahbub Hossain Piyal',        'যুগ্ম-সম্পাদক',        'Joint Secretary',            'joint_secretary', true, true, true, 8, 'from-primary to-crimson'),
('আলিম আল-রাজী আজাদ',             'Alim Al-Razi Azad',               'সাহিত্য সম্পাদক',     'Literary Secretary',         'literary',  true, true, true,  9, 'from-primary to-crimson'),
('শরিফ মাহমুদ সোহান',             'Sharif Mahmud Sohan',             'সাংস্কৃতিক সম্পাদক',  'Cultural Secretary',         'cultural',  true, true, true, 10, 'from-primary to-crimson'),
('জনাব রাজ্জাক রাজা',             'Mr. Razzak Raja',                 'প্রচার সম্পাদক',      'Publicity Secretary',        'publicity', true, true, true, 11, 'from-primary to-crimson'),
-- Executive members
('প্রফেসর এ.বি.এম সাত্তার',        'Professor A.B.M. Sattar',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 20, 'from-primary to-crimson'),
('অধ্যাপক সিরাজুল হক',             'Professor Sirajul Haque',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 21, 'from-primary to-crimson'),
('অধ্যাপক মুনিরুল ইসলাম',         'Professor Munirul Islam',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 22, 'from-primary to-crimson'),
('অধ্যাপক গ্যালী আক্তার',         'Professor Galy Akter',            'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 23, 'from-primary to-crimson'),
('জনাব আবদুস সালাম মোল্লা',        'Mr. Abdus Salam Molla',           'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 24, 'from-primary to-crimson'),
('জনাব খলিলুল্লাহ দিলদারাজ',      'Mr. Khalilullah Dildaraj',        'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 25, 'from-primary to-crimson'),
('জনাব মোঃ আলাউদ্দিন',            'Mr. Md. Alauddin',                'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 26, 'from-primary to-crimson'),
('জনাব শামীম আরা বেগম',           'Ms. Shamim Ara Begum',            'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 27, 'from-primary to-crimson'),
('জনাব জয়েনউদ্দিন মিয়া বাবলু',    'Mr. Joynuddin Mia Bablu',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 28, 'from-primary to-crimson'),
('অধ্যাপক লিয়াকত হোসেন হিমু',     'Professor Liaqat Hossain Himu',   'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 29, 'from-primary to-crimson'),
('জনাব নিজাম মন্ডল',              'Mr. Nizam Mondal',                'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 30, 'from-primary to-crimson'),
('জনাব মনিরুল হক মিঠু',           'Mr. Monirul Haque Mithu',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 31, 'from-primary to-crimson'),
('জনাব নিলুফার ইয়াসমিন রুবি',     'Ms. Nilufar Yasmin Ruby',         'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 32, 'from-primary to-crimson'),
('জনাব মোঃ হারুনার রশীদ',         'Mr. Md. Harunor Rashid',          'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 33, 'from-primary to-crimson'),
('জনাব মহসীন মুন্সী',             'Mr. Mohsin Munshi',               'নির্বাহী সদস্য',      'Executive Member',           'member', false, true, true, 34, 'from-primary to-crimson');

-- 2) Add three real heritage history posts
INSERT INTO public.posts (title, title_en, excerpt, excerpt_en, content, category, tags, featured, published) VALUES
(
  'মহাফেজখানা থেকে: ফরিদপুর সাহিত্য পরিষদের গোড়াপত্তন (১৯৩৯–১৯৮৩)',
  'From the Archives: The Founding of Faridpur Shahitto Parishad (1939–1983)',
  'ফরিদপুর সাহিত্য পরিষদ প্রতিষ্ঠার পূর্বকথা — কবি হুমায়ুন কবির ও মন্ত্রী আবদুল জহীরউদ্দিন লাল মিয়ার ১৯৩৯ সালের আমন্ত্রণে বহুমাত্রিক সাহিত্য সভা থেকে শুরু করে ১৯৮৩ সালে অধ্যাপক এম. এ. সামাদের উদ্যোগে আনুষ্ঠানিক প্রতিষ্ঠা পর্যন্ত।',
  'The pre-history of Faridpur Shahitto Parishad — from the multifarious literary gathering of 1939 invited by poet Humayun Kabir and Minister Abdul Zahiruddin Lal Mia, through the 1945–46 ''Sahitya Chakra'' and the 1969 ''Faridpur Sahitya O Sangskriti Unnayan Sangha'', to the formal foundation in 1983 led by Professor M. A. Samad.',
  E'## পূর্বকথা\n\nফরিদপুর সাহিত্য পরিষদ প্রতিষ্ঠার পূর্বকথা বলতে গেলে প্রথম স্মরণ করতে হয় এ জেলার দুই গৌরব সন্তান — বাঙালির কবি হুমায়ুন কবির ও পাকিস্তানের কেন্দ্রীয় মন্ত্রী জহীরউদ্দিন লাল মিয়াকে। ১৯৩৯ সালে ফরিদপুর সাহিত্য পরিষদ গঠন করেছিলেন তারা, এবং সে বছরই তাঁদের আমন্ত্রণে বহুমাত্রিক কথাসাহিত্যিক ঔপন্যাসিক শরৎচন্দ্র চট্টোপাধ্যায় এসেছিলেন ফরিদপুরে এক সাহিত্যসভায়।\n\n## সাহিত্য চক্র (১৯৪৫–৪৬)\n\n১৯৪৫–৪৬ সালের দিকে ফরিদপুরে "সাহিত্য চক্র" নামে একটি সংগঠন ছিল। প্রতিমাসের প্রথম রোববার ছুটির দিনে সকাল থেকে দুপুর পর্যন্ত শহরের ঝিলটুলীর এক বাসায় সাহিত্য আড্ডা বসত। ঐ আসরের সভাপতিত্ব করতেন তৎকালীন জেলা ও দায়রা জজ হিরন্ময় ব্যানার্জী — যিনি পরবর্তী কর্মজীবনে বিশ্বভারতীর ভাইস চ্যান্সেলর হয়েছিলেন। সাংগঠনিক দুর্বলতা ও উদ্যোগী কর্মীর অভাবে এ সংগঠনটিও ফরিদপুর সাহিত্য পরিষদে অন্তর্ভুক্ত হয়ে যায়।\n\n## ফসাসউস (১৯৬৯)\n\n১৯৬৯ সালে প্রতিষ্ঠা হয় "ফরিদপুর সাহিত্য ও সংস্কৃতি উন্নয়ন সংঘ" (ফসাসউস)। শুরু হয় সাহিত্যমোদীদের কবিতাচর্চা। সাহিত্যের নানান শাখায় কাজ শুরু হয়। ১৯৭৫ সালে বীর মুক্তিযোদ্ধা কবি আতাউর খান-এর সভাপতিত্বে শামসুল হক ও মিহির চক্রবর্তীর অনুরোধে সভাপতি ইঞ্জিনিয়ার আবদুর রাজ্জাক এবং সম্পাদক নির্বাচিত করেন অধ্যাপক এম. এ. সামাদকে। সে সময়েই প্রথম শুরু হয় আলাওল সাহিত্য পুরস্কার প্রদানের অনুষ্ঠান।\n\n## ১৯৮৩ — ফরিদপুর সাহিত্য পরিষদের আনুষ্ঠানিক প্রতিষ্ঠা\n\n১৯৮৩ সালে সুফী মোতাহার হোসেনের ৮ম মৃত্যুবার্ষিকীতে তাঁর বাসভবন শহরের উপকণ্ঠ ভবানন্দপুরে আমরা একত্রিত হই। সাংস্কৃতিক জগতের অক্লান্ত কর্মী অধ্যাপক এম. এ. সামাদ-এর প্রস্তাবে ও উদ্যোগে গঠিত হয় ফরিদপুর সাহিত্য পরিষদ — মুক্তবুদ্ধির সাহিত্যচর্চার ধারাটিকে ধারণ করে।',
  'ইতিহাস',
  ARRAY['ফরিদপুর','মহাফেজখানা','ইতিহাস','১৯৮৩','প্রতিষ্ঠা'],
  true, true
),
(
  'সাহিত্য পরিষদের গৌরবময় অধ্যায় (১৯৮৫–১৯৯৪): সংবর্ধনা ও সাহিত্যসভা',
  'Glorious Chapter of the Parishad (1985–1994): Felicitations & Literary Assemblies',
  '১৯৮৫ সাল থেকে ১৯৯৪ সাল পর্যন্ত ফরিদপুর সাহিত্য পরিষদ যে সকল গুণিজনকে সংবর্ধনা জানিয়েছে — শিক্ষাবিদ অধ্যক্ষ অপূর্বকৃষ্ণ ঘোষ, কাজী আবুল কাশেম, ঔপন্যাসিক রাজিয়া মজিদ, চিত্রশিল্পী মুসলিম চুঘতাঈ, কবি আবদুল হামিদ শেখ ও আরও অনেকে — এবং দ্বিশততম সাহিত্যসভার পূর্ণাঙ্গ চিত্র।',
  'A complete record of the personalities the Parishad felicitated between 1985 and 1994 — including educator Aparba Krishna Ghosh, Kazi Abul Kashem, novelist Razia Mazid, artist Muslim Chughtai, poet Abdul Hamid Sheikh and many others — alongside the bicentennial literary assembly.',
  E'## ১৯৮৫ সাল\n- শিক্ষাবিদ অধ্যক্ষ অপূর্বকৃষ্ণ ঘোষ\n- অধ্যাপক আবুল হাশেম\n- বাবু শ্রীশচন্দ্র ঘোষ\n\n## ১৯৯০ সাল\n- শিক্ষাবিদ এস. এম. কিউ. জুলফিকার আলী\n- পথিকৃৎ মুসলিম চিত্রশিল্পী কাজী আবুল কাশেম\n- ঔপন্যাসিক রাজিয়া মজিদ\n\n## ১৯৯২ সাল\n- ক্রীড়াবিদ আলাউদ্দিন খান\n- শিল্পানুরাগী শ্রী রাধাগোবিন্দ সাহা\n- নাট্যশিল্পী মহীউদ্দিন আহমেদ\n\n## ১৯৯৩ সাল\n- জাতীয় পর্যায়ে শ্রেষ্ঠ চলচ্চিত্র কাহিনীকার চিত্রশিল্পী মুসলী মতিউদ্দিন\n\n## ১৯৯৪ সাল\n- পৌরসভার প্রাজ্ঞ চেয়ারম্যান এ. কে. এম. আবদুল হাকিম মিয়া\n- শিক্ষাহিতৈষী ও কবি আবদুল হোসেন\n- বর্ষীয়ান কবি আবদুল হামিদ শেখ\n- ভেষজ চিকিৎসক সত্যেন্দ্র কুমার সাহা\n\n## ১৯৯৫ সাল\n- কৃতী শিক্ষাবিদ অধ্যক্ষ প্রফেসর শেখ সামসের আলী\n- কাব্যে কুরআন পাক-এর কবি আবদুল বারী\n- প্রবীণ সংগীত শিল্পী প্রফুল্ল কুমার চক্রবর্তী\n\n## ১৯৮৬ সাল\n- সাংস্কৃতিক ব্যক্তিত্ব খোন্দকার নুরুল হোসেন\n- কৃতী সেবিকা সুশীলা বালা সাহা\n- স্বচ্ছ পেশাজীবী ও সমাজসেবক মোঃ ছাইদ আলী খান\n- শহীদ জননী ও শিক্ষাবিদ বেগম রাবেয়া আহমেদ\n- বীর মুক্তিযোদ্ধা প্রবোধ কুমার সরকার (পি. কে. সরকার)\n- গীতিকবি জামাল হাবিব\n\n## ১৯৮৭ সাল\n- কণ্ঠশিল্পী সেলিম মজুমদার\n- শ্বাশনবন্ধু কানু সেন\n\n## ২০২০ সাল\n- বিশিষ্ট লেখক ও গবেষক অতিরিক্ত সচিব (অব.) মোহাম্মদ আলী খান\n\n## দ্বিশততম পাক্ষিক সাহিত্যসভা — ১৯৯৪\n\nফরিদপুর সাহিত্য পরিষদের দ্বিশততম পাক্ষিক সাহিত্যসভা ১৯৯৪ সালের ২৬ ফেব্রুয়ারি জাঁকজমকভাবে পালন করা হয় আলাউদ্দিন কমিউনিটি সেন্টারে। সে অনুষ্ঠানে কবি ফজল শাহাবুদ্দিন এবং দৈনিক ইত্তেফাকের সাহিত্য সম্পাদক কবি আল মুজাহিদী এবং কানাডা প্রবাসী কবি রেনু ফারুকজ্জামান উপস্থিত হয়েছিলেন।',
  'ইতিহাস',
  ARRAY['ফরিদপুর','সংবর্ধনা','গুণীজন','সাহিত্যসভা'],
  false, true
),
(
  'জন্মশতবার্ষিকী, পল্লীমেলা ও স্মরণ অনুষ্ঠান: চিরভাস্বর ঐতিহ্য',
  'Centenaries, Folk Fairs & Memorial Programmes: An Enduring Heritage',
  'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমান, ড. কাজী মোতাহার হোসেন, বিভূতিভূষণ বন্দ্যোপাধ্যায়, কাজী আবদুল ওদুদ, কবি জসীম উদ্দীন, জাতীয় কবি কাজী নজরুল ইসলাম, রবীন্দ্রনাথ ঠাকুর — যাঁদের জন্মশতবার্ষিকী ও স্মরণ অনুষ্ঠান ফরিদপুর সাহিত্য পরিষদ আয়োজন করেছে।',
  'A chronicle of the centenary and memorial programmes organised by the Parishad — for Bangabandhu Sheikh Mujibur Rahman, Dr. Kazi Motahar Hossain, Bibhutibhushan Bandopadhyay, Kazi Abdul Wadud, Poet Jasimuddin, National Poet Kazi Nazrul Islam, Rabindranath Tagore, and many others.',
  E'## যাঁদের জন্মশতবার্ষিকী উদযাপন করা হয়েছে\n\n1. **জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমান** — ১৭ মার্চ ২০২০, জেলা প্রশাসকের কার্যালয় চত্বর, ফরিদপুর। নাসির আলী মামুনের ক্যামেরায় বঙ্গবন্ধু আলোকচিত্র প্রদর্শনী।\n2. **ড. কাজী মোতাহার হোসেন** — ৩০ জুলাই ১৯৯৭, ফরিদপুর মিউজিয়াম।\n3. **বিভূতিভূষণ বন্দ্যোপাধ্যায়** — ১২ সেপ্টেম্বর ১৯৯৪, ফরিদপুর মিউজিয়াম।\n4. **কাজী আবদুল ওদুদ** — ২৬ এপ্রিল ১৯৯৪, ফরিদপুর মিউজিয়াম।\n5. **কবি জসীম উদ্দীন** — ১ জানুয়ারি ২০০৩, সাহিত্য ভবন (পৌরসভার পূর্ব পার্শ্বে)।\n6. **জাতীয় কবি কাজী নজরুল ইসলাম** — ২৪ মে ১৯৯৯, সাহিত্য ভবন।\n7. **রবীন্দ্রনাথ সাধভর্ষ জন্মবার্ষিকী** — মে ২০২১, সাহিত্য ভবন ও কুষ্টিয়ার শিলাইদহ।\n8. **কবিয়াল বিজয় সরকার** — ২০০৩ সালের ২৪ মে, সাহিত্য ভবন।\n9. **মৃণাল সেনের জন্মশতবার্ষিকী** — ১৪–১৫ মে ২০২৩, মৃণাল সেনের পৈতৃক ভিটা নিলুটুলিতে (মেজবান পার্টি সেন্টারে)।\n\n## স্মরণীয় শোক ও স্মৃতিচারণ\n\nফরিদপুর সাহিত্য পরিষদের অনুষ্ঠান কেন্দ্র করে একটি শোকের ঘটনা ঘটে ২০১২ সালের ৯ আগস্ট। হুমায়ুন আহমেদ ও তারেক মাসুদ স্মরণ সভায় আলোচনা শেষে ভাষা সৈনিক ও চক্ষু বিশেষজ্ঞ সমাজসেবক ডাঃ নগেন গোপাল সাহা হার্ট অ্যাটাকে মৃত্যুবরণ করেন বক্তৃতা মঞ্চে বসে। তাঁর আকস্মিক মৃত্যুতে ফরিদপুরের শোকের ছায়া নেমে আসে।\n\nএ ছাড়া জাতীয় গুরুত্বপূর্ণ দিবস ও কবি, সাহিত্যিক, সাংবাদিক ও বিশিষ্ট সমাজসেবকদের জন্ম-মৃত্যু দিনে অনুষ্ঠানের আয়োজন করা হয়ে থাকে।\n\n— মফিজ ইমাম মিলন, সম্পাদক',
  'ইতিহাস',
  ARRAY['জন্মশতবার্ষিকী','বঙ্গবন্ধু','জসীম উদ্দীন','স্মরণ'],
  false, true
);

-- 3) Update site_settings general info (address + phone) from the booklet
UPDATE public.site_settings
SET value = value
  || jsonb_build_object(
       'address_bn', 'ফরিদপুর সাহিত্য পরিষদ, সাহিত্য ভবন, পৌরসভার পূর্ব পার্শ্বে, ফরিদপুর',
       'address_en', 'Faridpur Shahitto Parishad, Sahitya Bhaban, East of Municipality, Faridpur',
       'contact_phone', '01715-015621'
     ),
    updated_at = now()
WHERE key = 'general';
