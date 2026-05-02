-- Add user_id + is_approved to members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- Replace public read policy: only approved + active visible to anonymous
DROP POLICY IF EXISTS "Members are viewable by everyone" ON public.members;
CREATE POLICY "Approved active members are viewable by everyone"
  ON public.members FOR SELECT
  USING (is_active = true AND is_approved = true);

-- A member can view their own row (even unapproved)
CREATE POLICY "Members can view their own row"
  ON public.members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- A member can update their own row (cannot toggle approval)
CREATE POLICY "Members can update their own row"
  ON public.members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger: prevent self-approval / role escalation
CREATE OR REPLACE FUNCTION public.members_self_update_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) THEN
    RETURN NEW;
  END IF;
  IF OLD.user_id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;
  -- Self-edit: lock down sensitive fields
  NEW.is_approved := OLD.is_approved;
  NEW.is_active := OLD.is_active;
  NEW.is_senior := OLD.is_senior;
  NEW.role := OLD.role;
  NEW.sort_order := OLD.sort_order;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_self_update_guard ON public.members;
CREATE TRIGGER members_self_update_guard
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.members_self_update_guard();

-- ============= Site Assets =============
CREATE TABLE IF NOT EXISTS public.site_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL DEFAULT 'gallery',
  name TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active site assets viewable by everyone"
  ON public.site_assets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage site assets"
  ON public.site_assets FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators manage site assets"
  ON public.site_assets FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER site_assets_updated_at
  BEFORE UPDATE ON public.site_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_members_updated_at();

CREATE INDEX idx_site_assets_slot ON public.site_assets(slot, sort_order);