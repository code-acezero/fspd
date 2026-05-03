CREATE TABLE IF NOT EXISTS public.home_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL DEFAULT '',
  tag_en text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active banners readable by everyone"
  ON public.home_banners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage banners"
  ON public.home_banners FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins view all banners"
  ON public.home_banners FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators manage banners"
  ON public.home_banners FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER update_home_banners_updated_at
  BEFORE UPDATE ON public.home_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_members_updated_at();