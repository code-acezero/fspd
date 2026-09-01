-- Migration: 20260901000000_upgrade_visual_editor_and_storage.sql
-- Description: Upgrade database for Live In-Page Visual Editor, Dynamic Courses, and Storage Bucket Fixes

-- ============================================================================
-- 1. PAGE CONTENT TABLE (LIVE IN-PAGE VISUAL EDITOR PERSISTENCE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  element_key TEXT NOT NULL,
  content_bn TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  media_url TEXT NOT NULL DEFAULT '',
  styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT page_content_unique_key UNIQUE (page_key, section_key, element_key)
);

CREATE INDEX IF NOT EXISTS idx_page_content_lookup ON public.page_content (page_key, section_key);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view page content" ON public.page_content;
CREATE POLICY "Public can view page content"
  ON public.page_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins and moderators can manage page content" ON public.page_content;
CREATE POLICY "Admins and moderators can manage page content"
  ON public.page_content
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  );

-- Trigger to auto update updated_at timestamp on page_content
CREATE OR REPLACE FUNCTION public.update_page_content_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_page_content_updated_at ON public.page_content;
CREATE TRIGGER tr_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_page_content_updated_at();

-- ============================================================================
-- 2. DYNAMIC COURSES TABLE & SEEDING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  instructor TEXT NOT NULL DEFAULT '',
  instructor_en TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  duration_en TEXT NOT NULL DEFAULT '',
  modules INTEGER NOT NULL DEFAULT 0,
  enrolled INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'ongoing' | 'coming_soon'
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  highlights_en TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  cover_image TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_courses_sort ON public.courses (sort_order, is_active);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins and moderators can manage courses" ON public.courses;
CREATE POLICY "Admins and moderators can manage courses"
  ON public.courses
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  );

DROP TRIGGER IF EXISTS tr_courses_updated_at ON public.courses;
CREATE TRIGGER tr_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_page_content_updated_at();

-- Seed initial courses if not present
INSERT INTO public.courses (title, title_en, instructor, instructor_en, duration, duration_en, modules, enrolled, status, description, description_en, highlights, highlights_en, sort_order, is_active)
SELECT
  'বাংলা সাহিত্যের ইতিহাস', 'History of Bengali Literature',
  'ড. আবদুল করিম', 'Dr. Abdul Karim',
  '৩ মাস', '3 Months',
  12, 45, 'open',
  'প্রাচীন যুগ থেকে আধুনিক যুগ পর্যন্ত বাংলা সাহিত্যের বিবর্তন ও রূপরেখা।',
  'Evolution of Bengali literature from ancient to modern era.',
  ARRAY['১২টি মডিউল', 'সাপ্তাহিক অ্যাসাইনমেন্ট', 'সার্টিফিকেট প্রদান', 'অভিজ্ঞ শিক্ষক'],
  ARRAY['12 Modules', 'Weekly Assignments', 'Certificate Provided', 'Experienced Instructors'],
  1, true
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title_en = 'History of Bengali Literature');

INSERT INTO public.courses (title, title_en, instructor, instructor_en, duration, duration_en, modules, enrolled, status, description, description_en, highlights, highlights_en, sort_order, is_active)
SELECT
  'ইংরেজি ভাষা কোর্স', 'English Language Course',
  'অধ্যাপক ফাতেমা বেগম', 'Prof. Fatema Begum',
  '৬ মাস', '6 Months',
  24, 78, 'ongoing',
  'মৌলিক ইংরেজি থেকে উন্নত স্তর পর্যন্ত ভাষা শিক্ষা ও কথোপকথন চর্চা।',
  'Language learning from basic to advanced English.',
  ARRAY['২৪টি মডিউল', 'কথোপকথন অনুশীলন', 'অনলাইন ক্লাস', 'ব্যক্তিগত মূল্যায়ন'],
  ARRAY['24 Modules', 'Conversation Practice', 'Online Classes', 'Personal Assessment'],
  2, true
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title_en = 'English Language Course');

INSERT INTO public.courses (title, title_en, instructor, instructor_en, duration, duration_en, modules, enrolled, status, description, description_en, highlights, highlights_en, sort_order, is_active)
SELECT
  'সৃজনশীল লেখালেখি সেমিনার', 'Creative Writing Seminar',
  'জনাব মফিজ ইমাম মিলন', 'Mr. Mafiz Imam Milan',
  '২ মাস', '2 Months',
  8, 32, 'coming_soon',
  'কবিতা, গল্প ও প্রবন্ধ লেখার কলাকৌশল এবং সম্পাদনা শিক্ষা।',
  'Learning the art of writing poetry, stories and essays.',
  ARRAY['৮টি সেশন', 'ব্যক্তিগত ফিডব্যাক', 'প্রকাশনার সুযোগ', 'পরামর্শদাতা সেশন'],
  ARRAY['8 Sessions', 'Personal Feedback', 'Publication Opportunities', 'Mentorship Sessions'],
  3, true
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title_en = 'Creative Writing Seminar');

-- ============================================================================
-- 3. STORAGE BUCKETS CONFIGURATION & POLICY FIXES
-- ============================================================================

-- Ensure storage schema buckets are properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 20971520, NULL),
  ('content-images', 'content-images', true, 20971520, NULL)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 20971520,
    allowed_mime_types = NULL;

-- Clean up any conflicting or overly restrictive policies on storage.objects
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN (
        'Public can view content images',
        'Anyone can view avatars',
        'Users upload own content images',
        'Users update own content images',
        'Users delete own content images',
        'content-images owner update',
        'content-images owner delete',
        'Authenticated users can upload avatars',
        'Users can update own avatars',
        'Users can delete own avatars',
        'Public Access',
        'Allow public read',
        'Public read avatars',
        'Public read content-images',
        'Anyone can view content images',
        'Public objects are viewable by everyone',
        'Public can view storage objects',
        'Authenticated users can upload storage objects',
        'Owners and admins can update storage objects',
        'Owners and admins can delete storage objects'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 1. SELECT: Public read access on public buckets (avatars & content-images)
CREATE POLICY "Public can view storage objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('avatars', 'content-images'));

-- 2. INSERT: Authenticated upload policy
CREATE POLICY "Authenticated users can upload storage objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (bucket_id = 'avatars' AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR (storage.foldername(name))[1] = auth.uid()::text
    ))
    OR
    (bucket_id = 'content-images' AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR (storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
    ))
  );

-- 3. UPDATE: Owners & Admin/Moderators can update
CREATE POLICY "Owners and admins can update storage objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'content-images') AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
      OR (bucket_id = 'content-images' AND (
        ((storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
        OR (storage.foldername(name))[1] = auth.uid()::text
      ))
    )
  )
  WITH CHECK (
    bucket_id IN ('avatars', 'content-images') AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
      OR (bucket_id = 'content-images' AND (
        ((storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
        OR (storage.foldername(name))[1] = auth.uid()::text
      ))
    )
  );

-- 4. DELETE: Owners & Admin/Moderators can delete
CREATE POLICY "Owners and admins can delete storage objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'content-images') AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
      OR (bucket_id = 'content-images' AND (
        ((storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
        OR (storage.foldername(name))[1] = auth.uid()::text
      ))
    )
  );
