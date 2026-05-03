-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  instructor text NOT NULL DEFAULT '',
  instructor_en text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  duration_en text NOT NULL DEFAULT '',
  modules integer NOT NULL DEFAULT 0,
  enrolled integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'coming_soon',
  description text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  highlights_en text[] NOT NULL DEFAULT '{}',
  cover_image text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active courses readable by everyone"
  ON public.courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins view all courses"
  ON public.courses FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators view all courses"
  ON public.courses FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_members_updated_at();

ALTER TABLE public.courses
  ADD CONSTRAINT courses_status_check
  CHECK (status IN ('open','ongoing','coming_soon'));
