-- Phase 3: seed global blocks (nav, footer_links) and per-page hero blocks for secondary pages.
INSERT INTO public.page_blocks (page, block_key, sort_order, visible, draft_config, published_config) VALUES
  ('global', 'nav',                10, true, '{}'::jsonb, '{}'::jsonb),
  ('global', 'footer_links',       20, true, '{}'::jsonb, '{}'::jsonb),
  ('about',         'page_hero',   10, true, '{}'::jsonb, '{}'::jsonb),
  ('members',       'page_hero',   10, true, '{}'::jsonb, '{}'::jsonb),
  ('blog',          'page_hero',   10, true, '{}'::jsonb, '{}'::jsonb),
  ('events',        'page_hero',   10, true, '{}'::jsonb, '{}'::jsonb),
  ('courses',       'page_hero',   10, true, '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (page, block_key) DO NOTHING;