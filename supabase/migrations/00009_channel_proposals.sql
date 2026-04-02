-- Channel proposals with voting + hidden channels

-- ============================================================
-- 1. CHANNEL PROPOSALS
-- ============================================================

CREATE TABLE public.channel_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.channel_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view proposals"
  ON public.channel_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can create proposals"
  ON public.channel_proposals FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage proposals"
  ON public.channel_proposals FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 2. CHANNEL VOTES
-- ============================================================

CREATE TABLE public.channel_votes (
  proposal_id UUID NOT NULL REFERENCES public.channel_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (proposal_id, user_id)
);

ALTER TABLE public.channel_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view votes"
  ON public.channel_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can vote"
  ON public.channel_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can remove own votes"
  ON public.channel_votes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 3. HIDDEN CHANNELS (per-user archive)
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hidden_channel_ids TEXT[] DEFAULT '{}';
