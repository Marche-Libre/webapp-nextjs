-- Allow sponsor_request notification type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('chat_mention', 'forum_mention', 'forum_reply', 'sponsor_request'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
