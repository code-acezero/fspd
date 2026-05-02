
-- Set sitewide logo to the bundled public asset
INSERT INTO public.site_settings (key, value)
VALUES (
  'general',
  jsonb_build_object(
    'site_name_bn', 'ফরিদপুর সাহিত্য পরিষদ',
    'site_name_en', 'Faridpur Shahitto Parishad',
    'tagline_bn', 'বাংলা সংস্কৃতির পাদপীঠ',
    'tagline_en', 'The Cradle of Bengali Culture',
    'contact_email', 'info@fsp.org.bd',
    'contact_phone', '',
    'address_bn', '',
    'address_en', '',
    'logo_url', '/site-logo.png'
  )
)
ON CONFLICT (key) DO UPDATE
SET value = COALESCE(public.site_settings.value, '{}'::jsonb) || jsonb_build_object('logo_url', '/site-logo.png'),
    updated_at = now();
