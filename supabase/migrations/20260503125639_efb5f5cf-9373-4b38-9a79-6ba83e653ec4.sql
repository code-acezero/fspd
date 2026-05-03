
INSERT INTO public.page_blocks (page, block_key, sort_order, visible, draft_config, published_config)
VALUES
  ('landing', 'about',          20, true, '{}'::jsonb, '{}'::jsonb),
  ('landing', 'services',       30, true, '{}'::jsonb, '{}'::jsonb),
  ('landing', 'events_preview', 40, true, '{}'::jsonb, '{}'::jsonb),
  ('landing', 'members',        50, true, '{}'::jsonb, '{}'::jsonb),
  ('landing', 'footer',         60, true, '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (page, block_key) DO NOTHING;
