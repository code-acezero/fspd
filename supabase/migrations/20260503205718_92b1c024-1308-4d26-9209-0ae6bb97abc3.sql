-- 1) Welcome speeches popup
CREATE TABLE public.welcome_speeches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_label text NOT NULL DEFAULT '',
  role_label_en text NOT NULL DEFAULT '',
  speaker_name text NOT NULL DEFAULT '',
  speaker_name_en text NOT NULL DEFAULT '',
  speech text NOT NULL DEFAULT '',
  speech_en text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.welcome_speeches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active speeches readable by everyone" ON public.welcome_speeches
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage speeches" ON public.welcome_speeches
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Moderators manage speeches" ON public.welcome_speeches
  FOR ALL TO authenticated USING (has_role(auth.uid(),'moderator'::app_role)) WITH CHECK (has_role(auth.uid(),'moderator'::app_role));
CREATE POLICY "Admins view all speeches" ON public.welcome_speeches
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_welcome_speeches_updated
  BEFORE UPDATE ON public.welcome_speeches
  FOR EACH ROW EXECUTE FUNCTION public.update_members_updated_at();

-- Seed popup-config row in site_settings
INSERT INTO public.site_settings (key, value)
VALUES ('welcome_popup', '{"enabled": true, "cooldown_minutes": 15}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2) Custom CMS pages (lightweight builder)
CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  show_in_nav boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages readable by everyone" ON public.custom_pages
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage custom pages" ON public.custom_pages
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Moderators manage custom pages" ON public.custom_pages
  FOR ALL TO authenticated USING (has_role(auth.uid(),'moderator'::app_role)) WITH CHECK (has_role(auth.uid(),'moderator'::app_role));
CREATE POLICY "Admins view all custom pages" ON public.custom_pages
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_custom_pages_updated
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_members_updated_at();

-- 3) Per-page SEO settings (path-based, works for static + custom routes)
CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  keywords text NOT NULL DEFAULT '',
  keywords_en text NOT NULL DEFAULT '',
  og_image text NOT NULL DEFAULT '',
  canonical text NOT NULL DEFAULT '',
  no_index boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page SEO readable by everyone" ON public.page_seo
  FOR SELECT USING (true);
CREATE POLICY "Admins manage page SEO" ON public.page_seo
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Moderators manage page SEO" ON public.page_seo
  FOR ALL TO authenticated USING (has_role(auth.uid(),'moderator'::app_role)) WITH CHECK (has_role(auth.uid(),'moderator'::app_role));

CREATE TRIGGER trg_page_seo_updated
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_members_updated_at();