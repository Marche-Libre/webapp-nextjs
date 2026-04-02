-- User reports
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_report CHECK (reporter_id != reported_id)
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.user_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view own reports"
  ON public.user_reports FOR SELECT
  USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage reports"
  ON public.user_reports FOR ALL
  USING (public.is_admin());

-- User blocks
CREATE TABLE public.user_blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blocks"
  ON public.user_blocks FOR ALL
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can insert blocks"
  ON public.user_blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());
