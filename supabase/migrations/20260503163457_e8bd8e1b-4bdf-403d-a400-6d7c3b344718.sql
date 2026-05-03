
-- Seed page_blocks rows for new secondary-page CMS blocks.
-- Pattern: page = secondary route, block_key = section purpose.
-- All start visible with empty draft+published configs (components fall back to hardcoded defaults when configs are empty).

INSERT INTO public.page_blocks (page, block_key, visible, sort_order, draft_config, published_config, has_unpublished_changes)
VALUES
  -- About page deep blocks
  ('about', 'body_intro',    true, 20, '{}'::jsonb, '{}'::jsonb, false),
  ('about', 'stats',         true, 25, '{}'::jsonb, '{}'::jsonb, false),
  ('about', 'anniversaries', true, 40, '{}'::jsonb, '{}'::jsonb, false),
  ('about', 'honoured',      true, 50, '{}'::jsonb, '{}'::jsonb, false),
  ('about', 'body_outro',    true, 60, '{}'::jsonb, '{}'::jsonb, false),
  -- Listing page polish
  ('blog',    'listing', true, 20, '{}'::jsonb, '{}'::jsonb, false),
  ('events',  'listing', true, 20, '{}'::jsonb, '{}'::jsonb, false),
  ('courses', 'listing', true, 20, '{}'::jsonb, '{}'::jsonb, false)
ON CONFLICT DO NOTHING;
