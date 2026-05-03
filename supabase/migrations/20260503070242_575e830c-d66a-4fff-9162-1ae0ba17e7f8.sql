-- Seed Bangladesh national days + cultural/heritage days into events
-- Idempotent: skip rows whose title already exists.
INSERT INTO public.events (title, title_en, date, time, description, location, tag, tag_color, cover_image)
SELECT * FROM (VALUES
  ('আন্তর্জাতিক মাতৃভাষা দিবস ও শহীদ দিবস', 'International Mother Language Day & Martyrs'' Day',
   '২১ ফেব্রুয়ারি', 'সারাদিন',
   'মাতৃভাষার জন্য আত্মত্যাগকারী ভাষা শহীদদের স্মরণে জাতীয় শোক ও শ্রদ্ধাঞ্জলি দিবস।',
   'কেন্দ্রীয় শহীদ মিনার', 'জাতীয় দিবস', 'bg-primary text-primary-foreground', ''),
  ('স্বাধীনতা দিবস', 'Independence Day',
   '২৬ মার্চ', 'সারাদিন',
   'বাংলাদেশের স্বাধীনতা ঘোষণার দিন — মুক্তিযুদ্ধের সূচনা স্মরণে জাতীয় দিবস।',
   'জাতীয় স্মৃতিসৌধ, সাভার', 'জাতীয় দিবস', 'bg-primary text-primary-foreground', ''),
  ('পহেলা বৈশাখ — বাংলা নববর্ষ', 'Pohela Boishakh — Bengali New Year',
   '১৪ এপ্রিল', 'সকাল থেকে',
   'বাঙালির প্রাণের উৎসব — মঙ্গল শোভাযাত্রা, বৈশাখী মেলা ও সাংস্কৃতিক আয়োজন।',
   'রমনা বটমূল ও দেশব্যাপী', 'সাংস্কৃতিক', 'bg-accent text-accent-foreground', ''),
  ('রবীন্দ্র জয়ন্তী', 'Rabindra Jayanti',
   '২৫ বৈশাখ (৮ মে)', 'সন্ধ্যা',
   'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের জন্মবার্ষিকী উপলক্ষে সঙ্গীত, কবিতা ও আলোচনা।',
   'সাংস্কৃতিক কেন্দ্র', 'সাংস্কৃতিক', 'bg-accent text-accent-foreground', ''),
  ('নজরুল জয়ন্তী', 'Nazrul Jayanti',
   '১১ জ্যৈষ্ঠ (২৫ মে)', 'সন্ধ্যা',
   'জাতীয় কবি কাজী নজরুল ইসলামের জন্মবার্ষিকী — বিদ্রোহী কবিতা ও নজরুল সঙ্গীতের আসর।',
   'সাংস্কৃতিক কেন্দ্র', 'সাংস্কৃতিক', 'bg-accent text-accent-foreground', ''),
  ('জাতীয় শোক দিবস', 'National Mourning Day',
   '১৫ আগস্ট', 'সারাদিন',
   'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের শাহাদাতবার্ষিকী স্মরণে জাতীয় শোক দিবস।',
   'ধানমন্ডি ৩২ ও দেশব্যাপী', 'জাতীয় দিবস', 'bg-primary text-primary-foreground', ''),
  ('শারদীয় দুর্গাপূজা', 'Sharadiya Durga Puja',
   'আশ্বিন (অক্টোবর)', 'পাঁচ দিনব্যাপী',
   'বাঙালি হিন্দু সম্প্রদায়ের সর্ববৃহৎ ধর্মীয় ও সাংস্কৃতিক উৎসব।',
   'মন্ডপসমূহ', 'সাংস্কৃতিক', 'bg-accent text-accent-foreground', ''),
  ('বিজয় দিবস', 'Victory Day',
   '১৬ ডিসেম্বর', 'সারাদিন',
   '১৯৭১ সালের মুক্তিযুদ্ধে বিজয়ের দিন — স্বাধীন বাংলাদেশের অভ্যুদয়ের স্মরণে জাতীয় দিবস।',
   'জাতীয় স্মৃতিসৌধ, সাভার', 'জাতীয় দিবস', 'bg-primary text-primary-foreground', ''),
  ('পৌষ সংক্রান্তি / পিঠা উৎসব', 'Poush Sangkranti / Pitha Festival',
   '১৪ জানুয়ারি', 'দিনব্যাপী',
   'বাংলার ঐতিহ্যবাহী পিঠা-পুলি ও লোক সাংস্কৃতিক আয়োজন।',
   'সাংস্কৃতিক প্রাঙ্গণ', 'ঐতিহ্য', 'bg-secondary text-secondary-foreground', '')
) AS v(title, title_en, date, time, description, location, tag, tag_color, cover_image)
WHERE NOT EXISTS (
  SELECT 1 FROM public.events e WHERE e.title = v.title
);