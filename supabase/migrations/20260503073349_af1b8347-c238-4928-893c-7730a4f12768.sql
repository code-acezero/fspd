-- Phase 1 of CMS Builder: page_blocks
-- Stores per-block configuration for any page section, with draft + published JSON.
-- We seed a single 'landing.hero' block; future phases add more.

CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,                 -- e.g. 'landing', 'about', 'global'
  block_key TEXT NOT NULL,            -- e.g. 'hero', 'about', 'footer', 'nav'
  sort_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  draft_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID,
  UNIQUE (page, block_key)
);

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- Anyone can read published config (visitors see only published).
CREATE POLICY "Page blocks readable by everyone"
ON public.page_blocks FOR SELECT
USING (true);

-- Only admins/moderators can change.
CREATE POLICY "Admins manage page blocks"
ON public.page_blocks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators manage page blocks"
ON public.page_blocks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_page_blocks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.draft_config IS DISTINCT FROM OLD.draft_config THEN
    NEW.has_unpublished_changes = (NEW.draft_config IS DISTINCT FROM NEW.published_config);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_page_blocks ON public.page_blocks;
CREATE TRIGGER trg_touch_page_blocks
BEFORE UPDATE ON public.page_blocks
FOR EACH ROW EXECUTE FUNCTION public.touch_page_blocks_updated_at();

-- Versioning: keep history of published configs (90-day prune like site_settings)
CREATE TABLE IF NOT EXISTS public.page_blocks_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  block_key TEXT NOT NULL,
  config JSONB NOT NULL,
  published_by UUID,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_blocks_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read page blocks history"
ON public.page_blocks_history FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage page blocks history"
ON public.page_blocks_history FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.snapshot_page_blocks_publish()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.published_config IS DISTINCT FROM NEW.published_config THEN
    INSERT INTO public.page_blocks_history(page, block_key, config, published_by)
    VALUES (NEW.page, NEW.block_key, NEW.published_config, NEW.published_by);
    DELETE FROM public.page_blocks_history WHERE published_at < now() - INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_page_blocks_publish ON public.page_blocks;
CREATE TRIGGER trg_snapshot_page_blocks_publish
AFTER UPDATE ON public.page_blocks
FOR EACH ROW EXECUTE FUNCTION public.snapshot_page_blocks_publish();

-- Seed Hero block with default config matching current Hero
INSERT INTO public.page_blocks (page, block_key, sort_order, visible, draft_config, published_config)
VALUES (
  'landing', 'hero', 0, true,
  '{
    "show": {"eyebrow": true, "title": true, "establishedBadge": true, "subtitle": true, "visitorBadge": true, "ctas": true, "scrollHint": true, "topBar": true, "motifs": true, "orbs": true},
    "text": {
      "eyebrow_bn": "", "eyebrow_en": "",
      "title_bn": "", "title_en": "",
      "established_bn": "প্রতিষ্ঠিত ১৯৭৫", "established_en": "Established 1975",
      "subtitle_bn": "", "subtitle_en": "",
      "visitorCount": "১২,৪৫৬",
      "ctaPrimary_bn": "", "ctaPrimary_en": "", "ctaPrimaryHref": "/home",
      "ctaSecondary_bn": "", "ctaSecondary_en": "", "ctaSecondaryHref": "#about",
      "ctaTertiary_bn": "", "ctaTertiary_en": "", "ctaTertiaryHref": "/members"
    },
    "style": {
      "preset": "classic",
      "align": "center",
      "titleSize": "xl",
      "spacing": "comfortable",
      "animation": "elegant",
      "background": "image",
      "advanced": {
        "titleFontPx": null, "subtitleFontPx": null, "eyebrowLetterSpacingEm": null,
        "paddingTopPx": null, "paddingBottomPx": null,
        "titleColor": null, "accentColor": null, "overlayOpacity": null
      }
    }
  }'::jsonb,
  '{
    "show": {"eyebrow": true, "title": true, "establishedBadge": true, "subtitle": true, "visitorBadge": true, "ctas": true, "scrollHint": true, "topBar": true, "motifs": true, "orbs": true},
    "text": {
      "eyebrow_bn": "", "eyebrow_en": "",
      "title_bn": "", "title_en": "",
      "established_bn": "প্রতিষ্ঠিত ১৯৭৫", "established_en": "Established 1975",
      "subtitle_bn": "", "subtitle_en": "",
      "visitorCount": "১২,৪৫৬",
      "ctaPrimary_bn": "", "ctaPrimary_en": "", "ctaPrimaryHref": "/home",
      "ctaSecondary_bn": "", "ctaSecondary_en": "", "ctaSecondaryHref": "#about",
      "ctaTertiary_bn": "", "ctaTertiary_en": "", "ctaTertiaryHref": "/members"
    },
    "style": {
      "preset": "classic",
      "align": "center",
      "titleSize": "xl",
      "spacing": "comfortable",
      "animation": "elegant",
      "background": "image",
      "advanced": {
        "titleFontPx": null, "subtitleFontPx": null, "eyebrowLetterSpacingEm": null,
        "paddingTopPx": null, "paddingBottomPx": null,
        "titleColor": null, "accentColor": null, "overlayOpacity": null
      }
    }
  }'::jsonb
)
ON CONFLICT (page, block_key) DO NOTHING;