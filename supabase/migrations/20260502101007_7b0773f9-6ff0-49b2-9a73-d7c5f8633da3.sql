
-- Add phone to members for committee directory (admin/moderator visible only)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';

-- A view that public can read but with phone redacted unless caller is admin/moderator.
-- We restrict the column at the view level by selecting phone only for privileged callers.
CREATE OR REPLACE VIEW public.members_public AS
SELECT
  id, name, name_en, title, title_en, bio, bio_en, role, avatar_url,
  gradient_class, sort_order, is_active, is_senior, is_approved,
  created_at, updated_at,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
    THEN phone
    ELSE ''
  END AS phone
FROM public.members
WHERE is_active = true AND is_approved = true;

GRANT SELECT ON public.members_public TO anon, authenticated;

-- ----- Harden content-images storage RLS -----
-- Replace the open update/delete policies with folder-ownership checks.
DROP POLICY IF EXISTS "Authenticated users can upload content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete content images" ON storage.objects;

-- Uploads must land under posts/<auth.uid()>/...  OR be performed by an admin/moderator.
CREATE POLICY "Users upload own content images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'content-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
    OR (storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users update own content images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'content-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
    OR ((storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

CREATE POLICY "Users delete own content images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'content-images' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
    OR ((storage.foldername(name))[1] = 'posts' AND (storage.foldername(name))[2] = auth.uid()::text)
  )
);

-- Constrain content-images to safe MIME types and a 5MB cap per object.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
WHERE id = 'content-images';
