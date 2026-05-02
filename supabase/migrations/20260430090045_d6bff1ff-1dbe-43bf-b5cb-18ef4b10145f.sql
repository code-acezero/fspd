-- Settings version history (90-day rolling)
CREATE TABLE IF NOT EXISTS public.site_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  value jsonb NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage settings history"
  ON public.site_settings_history FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins read settings history"
  ON public.site_settings_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_settings_history_key_time
  ON public.site_settings_history(setting_key, changed_at DESC);

-- Trigger: snapshot site_settings on update + auto-prune entries older than 90 days
CREATE OR REPLACE FUNCTION public.snapshot_site_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO public.site_settings_history(setting_key, value, changed_by)
    VALUES (OLD.key, OLD.value, NEW.updated_by);
    DELETE FROM public.site_settings_history
    WHERE changed_at < now() - INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_site_settings ON public.site_settings;
CREATE TRIGGER trg_snapshot_site_settings
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_site_settings();

-- Member self-posts moderation
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

-- Validate values via trigger (no CHECK so we keep flexibility)
CREATE OR REPLACE FUNCTION public.validate_post_approval()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.approval_status NOT IN ('approved','pending','rejected') THEN
    RAISE EXCEPTION 'invalid approval_status: %', NEW.approval_status;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_post_approval ON public.posts;
CREATE TRIGGER trg_validate_post_approval
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_post_approval();

-- Update SELECT policy for public to require approval=approved
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
CREATE POLICY "Published approved posts are viewable by everyone"
  ON public.posts FOR SELECT TO public
  USING (published = true AND approval_status = 'approved');

-- Allow approved members (any authenticated user) to insert their own posts
CREATE POLICY "Members can insert own posts"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow members to view their own posts (incl. pending/rejected)
CREATE POLICY "Members can view own posts"
  ON public.posts FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

-- Allow members to update their own posts but lock approval_status & published unless admin/mod
CREATE OR REPLACE FUNCTION public.posts_self_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'moderator'::app_role) THEN
    RETURN NEW;
  END IF;
  IF OLD.author_id = auth.uid() THEN
    NEW.approval_status := OLD.approval_status;
    NEW.published := OLD.published;
    NEW.featured := OLD.featured;
    NEW.author_id := OLD.author_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_posts_self_guard ON public.posts;
CREATE TRIGGER trg_posts_self_guard
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.posts_self_update_guard();

CREATE POLICY "Members can update own posts"
  ON public.posts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Auto-set approval status based on senior status when member self-posts
CREATE OR REPLACE FUNCTION public.posts_auto_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_senior_member boolean;
  is_priv boolean;
BEGIN
  IF NEW.author_id IS NULL THEN RETURN NEW; END IF;
  is_priv := has_role(NEW.author_id,'admin'::app_role) OR has_role(NEW.author_id,'moderator'::app_role);
  IF is_priv THEN
    -- admins/mods: leave whatever they set
    RETURN NEW;
  END IF;
  SELECT COALESCE(p.is_senior, false) INTO is_senior_member FROM public.profiles p WHERE p.id = NEW.author_id;
  IF is_senior_member THEN
    NEW.approval_status := 'approved';
    NEW.published := true;
  ELSE
    NEW.approval_status := 'pending';
    NEW.published := false;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_posts_auto_approval ON public.posts;
CREATE TRIGGER trg_posts_auto_approval
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.posts_auto_approval();

-- Course registrations
CREATE TABLE IF NOT EXISTS public.course_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  user_id uuid NOT NULL,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own registration"
  ON public.course_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own registration"
  ON public.course_registrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage registrations"
  ON public.course_registrations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));