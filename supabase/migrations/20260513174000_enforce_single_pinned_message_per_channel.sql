-- Keep only one pinned message per channel before enforcing uniqueness.
WITH ranked_pins AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY channel_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, id DESC
    ) AS pin_rank
  FROM public.messages
  WHERE is_pinned = TRUE
)
UPDATE public.messages m
SET is_pinned = FALSE
FROM ranked_pins p
WHERE m.id = p.id
  AND p.pin_rank > 1;

-- Enforce one pinned message per channel at database level.
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_one_pinned_per_channel
  ON public.messages (channel_id)
  WHERE is_pinned = TRUE;
