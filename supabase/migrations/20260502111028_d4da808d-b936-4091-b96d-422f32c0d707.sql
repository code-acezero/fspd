-- Drop the overly permissive public SELECT policy on members
DROP POLICY IF EXISTS "Approved active members are viewable by everyone" ON public.members;

-- Create a public view that excludes the sensitive phone column
CREATE OR REPLACE VIEW public.public_members
WITH (security_invoker = true)
AS
SELECT
  id, name, name_en, title, title_en, bio, bio_en, role,
  avatar_url, gradient_class, sort_order, is_active, is_senior,
  is_approved, created_at, updated_at
FROM public.members
WHERE is_active = true AND is_approved = true;

GRANT SELECT ON public.public_members TO anon, authenticated;

-- Re-add a SELECT policy on members that authenticated users can use to see approved active members WITHOUT phone via the view, but for table-level access they only see their own row (already covered) or admin/mod (already covered).
-- We add a policy so the view (security_invoker) works for anon/auth on underlying rows, but exclude phone is enforced by the view's column list — however security_invoker requires base table SELECT permission. Use a permissive SELECT policy on the members table for approved active rows, and revoke column-level SELECT on phone for anon.

CREATE POLICY "Approved active members readable (non-phone)"
ON public.members
FOR SELECT
TO anon, authenticated
USING (is_active = true AND is_approved = true);

-- Revoke column-level SELECT on phone for anon and authenticated; only admins/moderators (via has_role) and the row owner can read it through their dedicated policies which are evaluated against the table — but column privileges apply regardless. Grant phone access only to the postgres/service_role.
REVOKE SELECT (phone) ON public.members FROM anon, authenticated;

-- Ensure non-phone columns remain selectable
GRANT SELECT (id, name, name_en, title, title_en, bio, bio_en, role, avatar_url, gradient_class, sort_order, is_active, is_senior, is_approved, phone, created_at, updated_at, user_id, created_by) ON public.members TO authenticated;
GRANT SELECT (id, name, name_en, title, title_en, bio, bio_en, role, avatar_url, gradient_class, sort_order, is_active, is_senior, is_approved, created_at, updated_at) ON public.members TO anon;

-- Re-revoke phone from anon and authenticated to enforce admin/mod-only via service role context (admins use has_role policy + service role access through Supabase admin endpoints when needed).
REVOKE SELECT (phone) ON public.members FROM anon;
REVOKE SELECT (phone) ON public.members FROM authenticated;
