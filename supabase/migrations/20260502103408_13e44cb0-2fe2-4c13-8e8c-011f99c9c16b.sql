
-- 1. PROFILES: revoke phone column from anon (public role inherits to anon).
-- Public SELECT policy stays, but anon cannot read phone column.
REVOKE SELECT (phone) ON public.profiles FROM anon;
-- Authenticated users still get phone (used in own profile + admin views).
GRANT SELECT (phone) ON public.profiles TO authenticated;

-- 2. USER_ROLES: replace permissive authenticated SELECT with own-row only.
DROP POLICY IF EXISTS "Roles viewable by authenticated users" ON public.user_roles;
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
-- Admin "manage" policy already grants admins ALL incl. SELECT on every row.

-- 3. STORAGE content-images: restrict UPDATE/DELETE to owner folder + admin/mod.
-- Drop any prior overly-permissive policies that allowed any auth user to mutate.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN (
        'content-images authenticated update',
        'content-images authenticated delete',
        'Authenticated can update content-images',
        'Authenticated can delete content-images',
        'content_images_update_any',
        'content_images_delete_any'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "content-images owner update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (
      (storage.foldername(name))[1] = 'posts'
        AND (storage.foldername(name))[2] = auth.uid()::text
      OR has_role(auth.uid(),'admin'::app_role)
      OR has_role(auth.uid(),'moderator'::app_role)
    )
  )
  WITH CHECK (
    bucket_id = 'content-images'
    AND (
      (storage.foldername(name))[1] = 'posts'
        AND (storage.foldername(name))[2] = auth.uid()::text
      OR has_role(auth.uid(),'admin'::app_role)
      OR has_role(auth.uid(),'moderator'::app_role)
    )
  );

CREATE POLICY "content-images owner delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (
      (storage.foldername(name))[1] = 'posts'
        AND (storage.foldername(name))[2] = auth.uid()::text
      OR has_role(auth.uid(),'admin'::app_role)
      OR has_role(auth.uid(),'moderator'::app_role)
    )
  );

-- 4. Restrict public listing of content-images bucket — clients keep direct URL access
-- (objects are still served publicly because the bucket is public), but cannot enumerate.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN (
        'content-images public read',
        'Public read content-images',
        'content-images select all',
        'Anyone can read content-images'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Note: Public bucket means CDN URL access still works without an objects SELECT policy.
-- We intentionally do NOT add a broad anon SELECT policy here so listing via the API is blocked.

-- 5. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated.
-- These are called by triggers / RLS only; clients should not invoke them directly.
REVOKE EXECUTE ON FUNCTION public.snapshot_site_settings() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.posts_auto_approval() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.posts_self_update_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.members_self_update_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_first_admin() FROM anon, authenticated, public;
-- has_role MUST stay executable so RLS policies referencing it still resolve.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
