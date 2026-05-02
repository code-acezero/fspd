CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT NOT NULL DEFAULT '',
  gradient_class TEXT NOT NULL DEFAULT 'from-primary to-crimson',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_senior BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by everyone"
  ON public.members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage members"
  ON public.members FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can manage members"
  ON public.members FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role));

CREATE OR REPLACE FUNCTION public.update_members_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_members_updated_at();

CREATE INDEX idx_members_sort ON public.members(sort_order, is_senior);