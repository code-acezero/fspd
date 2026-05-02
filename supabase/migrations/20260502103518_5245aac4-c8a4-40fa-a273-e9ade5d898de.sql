
-- Drop broad public SELECT policies that enable listing.
-- Public buckets continue to serve files via the CDN regardless of objects RLS.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view content images" ON storage.objects;

-- Revoke EXECUTE from remaining SECURITY DEFINER functions not previously locked.
REVOKE EXECUTE ON FUNCTION public.update_members_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_post_approval() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
