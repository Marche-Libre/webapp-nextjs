-- Fix overly permissive INSERT policy on notifications.
-- Previously any authenticated user could insert notifications for ANY user_id.
-- Now restricted so that actor_id must match the authenticated user.

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

CREATE POLICY "Authenticated users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());
