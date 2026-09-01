-- Create change_requests table for universal correction and change governance
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL, -- 'member' | 'post' | 'event' | 'course' | 'profile'
  target_id UUID NOT NULL,
  target_title TEXT NOT NULL DEFAULT '',
  proposed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  admin_notes TEXT NOT NULL DEFAULT '',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own change requests" ON public.change_requests;
CREATE POLICY "Users can insert own change requests"
  ON public.change_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own change requests" ON public.change_requests;
CREATE POLICY "Users can view own change requests"
  ON public.change_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and Moderators can view all change requests" ON public.change_requests;
CREATE POLICY "Admins and Moderators can view all change requests"
  ON public.change_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admins and Moderators can update change requests" ON public.change_requests;
CREATE POLICY "Admins and Moderators can update change requests"
  ON public.change_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX IF NOT EXISTS idx_change_requests_status ON public.change_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_requests_target ON public.change_requests(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_user ON public.change_requests(user_id);
