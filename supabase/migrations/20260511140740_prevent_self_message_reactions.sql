-- Prevent members from reacting to their own chat messages.
-- Existing self-reaction rows are left untouched; this migration only blocks new inserts.
DROP POLICY IF EXISTS "Users can add reactions" ON public.message_reactions;

CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.status = 'approved'
    )
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE m.id = message_reactions.message_id
        AND m.author_id <> (SELECT auth.uid())
    )
  );
