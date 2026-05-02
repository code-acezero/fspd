-- Tighten EXECUTE on internal SECURITY DEFINER trigger functions.
-- These are only called by triggers (which run with their own elevated context),
-- so PUBLIC/anon/authenticated never need direct EXECUTE.
REVOKE EXECUTE ON FUNCTION public.update_members_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.members_self_update_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.posts_self_update_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.snapshot_site_settings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.posts_auto_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_post_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_first_admin() FROM PUBLIC, anon, authenticated;

-- has_role() IS called from RLS policies & client RLS evaluation, so keep it
-- callable by authenticated. Revoke from anon (anonymous shouldn't probe roles).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;