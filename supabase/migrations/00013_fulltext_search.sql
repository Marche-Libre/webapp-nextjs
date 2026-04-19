-- Full-text search GIN index on messages.content (French config)
-- forum_posts already has one from 00004
CREATE INDEX IF NOT EXISTS idx_messages_search ON public.messages
  USING GIN (to_tsvector('french', content));
