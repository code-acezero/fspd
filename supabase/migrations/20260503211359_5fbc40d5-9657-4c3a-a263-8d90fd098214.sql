-- Seed a 'theme' site_settings row holding all design tokens (HSL strings) for light + dark modes.
-- When unset, the site falls back to pure monochrome defaults defined in src/index.css.
INSERT INTO public.site_settings (key, value)
VALUES (
  'theme',
  jsonb_build_object(
    'light', jsonb_build_object(
      'background', '0 0% 100%',
      'foreground', '0 0% 8%',
      'card', '0 0% 98%',
      'card_foreground', '0 0% 8%',
      'popover', '0 0% 100%',
      'popover_foreground', '0 0% 8%',
      'primary', '0 0% 12%',
      'primary_foreground', '0 0% 98%',
      'secondary', '0 0% 94%',
      'secondary_foreground', '0 0% 12%',
      'muted', '0 0% 94%',
      'muted_foreground', '0 0% 40%',
      'accent', '0 0% 90%',
      'accent_foreground', '0 0% 12%',
      'destructive', '0 0% 30%',
      'destructive_foreground', '0 0% 98%',
      'border', '0 0% 88%',
      'input', '0 0% 88%',
      'ring', '0 0% 30%',
      'gold', '0 0% 50%',
      'crimson', '0 0% 30%',
      'crimson_dark', '0 0% 20%',
      'crimson_light', '0 0% 60%'
    ),
    'dark', jsonb_build_object(
      'background', '0 0% 6%',
      'foreground', '0 0% 92%',
      'card', '0 0% 10%',
      'card_foreground', '0 0% 92%',
      'popover', '0 0% 10%',
      'popover_foreground', '0 0% 92%',
      'primary', '0 0% 88%',
      'primary_foreground', '0 0% 8%',
      'secondary', '0 0% 14%',
      'secondary_foreground', '0 0% 92%',
      'muted', '0 0% 14%',
      'muted_foreground', '0 0% 55%',
      'accent', '0 0% 18%',
      'accent_foreground', '0 0% 92%',
      'destructive', '0 0% 60%',
      'destructive_foreground', '0 0% 8%',
      'border', '0 0% 18%',
      'input', '0 0% 18%',
      'ring', '0 0% 70%',
      'gold', '0 0% 60%',
      'crimson', '0 0% 70%',
      'crimson_dark', '0 0% 50%',
      'crimson_light', '0 0% 80%'
    )
  )
)
ON CONFLICT (key) DO NOTHING;