-- 1) Patch the saved theme: add new *_foreground tokens (white) and force
--    every themed-bg foreground to white in both light + dark modes.
UPDATE public.site_settings
SET value = jsonb_set(
  jsonb_set(
    value,
    '{light}',
    (value->'light')
      || jsonb_build_object(
        'primary_foreground',    '0 0% 100%',
        'destructive_foreground','0 0% 100%',
        'success_foreground',    '0 0% 100%',
        'warning_foreground',    '0 0% 100%',
        'gold_foreground',       '0 0% 100%',
        'crimson_foreground',    '0 0% 100%',
        'forest_foreground',     '0 0% 100%'
      ),
    true
  ),
  '{dark}',
  (value->'dark')
    || jsonb_build_object(
      'primary_foreground',    '0 0% 100%',
      'destructive_foreground','0 0% 100%',
      'success_foreground',    '0 0% 100%',
      'warning_foreground',    '0 0% 100%',
      'gold_foreground',       '0 0% 100%',
      'crimson_foreground',    '0 0% 100%',
      'forest_foreground',     '0 0% 100%'
    ),
  true
)
WHERE key = 'theme';

-- 2) Seed a default home banner so the hero slider has content.
INSERT INTO public.home_banners (title, title_en, subtitle, subtitle_en, tag, tag_en, image_url, link_url, is_active, sort_order)
VALUES
  (
    'ফরিদপুর সাহিত্য পরিষদ',
    'Faridpur Literary Council',
    'বাংলা সাহিত্য ও সংস্কৃতির ধারক ও বাহক',
    'Custodian of Bangla literature and culture',
    'স্বাগতম',
    'Welcome',
    '',
    '/about',
    true,
    0
  );
