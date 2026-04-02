-- DM system: private 1:1 messages with opt-in

-- Add accept_dms field to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accept_dms BOOLEAN DEFAULT TRUE;

-- Channel members table for DM channels
CREATE TABLE IF NOT EXISTS public.channel_members (
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Members can see channels they're in
CREATE POLICY "Users can view own channel memberships"
  ON public.channel_members FOR SELECT
  USING (user_id = auth.uid());

-- Users can see other members in channels they belong to
CREATE POLICY "Users can view co-members in their channels"
  ON public.channel_members FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
    )
  );

-- Approved users can insert channel members (for creating DM channels)
CREATE POLICY "Approved users can create channel memberships"
  ON public.channel_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

-- Update channels RLS: private channels visible only to members
-- Drop existing policy first, then re-create with DM support
DROP POLICY IF EXISTS "Approved users can view channels" ON public.channels;

CREATE POLICY "Approved users can view channels"
  ON public.channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
    AND (
      is_private = FALSE
      OR id IN (
        SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow approved users to create private channels
CREATE POLICY "Approved users can create private channels"
  ON public.channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

-- Update messages RLS: for private channels, only members can see messages
DROP POLICY IF EXISTS "Approved users can view messages" ON public.messages;

CREATE POLICY "Approved users can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
    AND (
      -- Public channel: anyone approved
      EXISTS (
        SELECT 1 FROM public.channels
        WHERE id = channel_id AND is_private = FALSE
      )
      OR
      -- Private channel: must be a member
      EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = messages.channel_id AND user_id = auth.uid()
      )
    )
  );
