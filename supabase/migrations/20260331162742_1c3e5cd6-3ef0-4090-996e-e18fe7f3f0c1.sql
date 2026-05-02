
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone" ON public.site_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('general', '{"site_name_bn": "ফরিদপুর সাহিত্য পরিষদ", "site_name_en": "Faridpur Shahitto Parishad", "tagline_bn": "বাংলা সংস্কৃতির পাদপীঠ", "tagline_en": "The Cradle of Bengali Culture", "contact_email": "info@fsp.org.bd", "contact_phone": "", "address_bn": "", "address_en": ""}'::jsonb),
  ('appearance', '{"primary_color": "0 78% 45%", "accent_color": "45 90% 52%", "hero_style": "default", "show_particles": true}'::jsonb),
  ('features', '{"enable_blog": true, "enable_events": true, "enable_courses": true, "enable_members": true, "maintenance_mode": false}'::jsonb);

-- Add moderator policy for posts (moderators can also manage posts)
CREATE POLICY "Moderators can manage posts" ON public.posts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'moderator'));

-- Add moderator policy for events
CREATE POLICY "Moderators can manage events" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'moderator'));
