-- Migration 00004: Invitations, Chat, Forum
-- Replaces referral-code sponsorship with @handle invitation system
-- Adds chat channels/messages with realtime, forum with categories/tags

-- ============================================================
-- 1. PROFILE MODIFICATIONS
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accept_sponsorship BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_code;

-- ============================================================
-- 2. INVITATIONS TABLE
-- ============================================================

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_x_handle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inviter_id, invited_x_handle)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS: SELECT if inviter or if invited_x_handle matches my x_handle
CREATE POLICY "Users can view own invitations"
  ON public.invitations FOR SELECT
  USING (
    inviter_id = auth.uid()
    OR invited_x_handle = (SELECT x_handle FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- RLS: INSERT if approved member
CREATE POLICY "Approved users can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

-- RLS: UPDATE if invited_x_handle matches my x_handle (accept/reject)
CREATE POLICY "Invited users can update invitation status"
  ON public.invitations FOR UPDATE
  USING (
    invited_x_handle = (SELECT x_handle FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- 3. CHAT TABLES
-- ============================================================

-- Channels
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view channels"
  ON public.channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage channels"
  ON public.channels FOR ALL
  USING (public.is_admin());

-- Seed channels
INSERT INTO public.channels (name, slug, description) VALUES
  ('Général', 'general', 'Discussion générale entre membres'),
  ('Business', 'business', 'Opportunités et discussions business'),
  ('Recrutement', 'recrutement', 'Offres et recherches de missions');

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel_created ON public.messages (channel_id, created_at DESC);

CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Message reactions
CREATE TABLE public.message_reactions (
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  PRIMARY KEY (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view reactions"
  ON public.message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON public.message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 4. FORUM TABLES
-- ============================================================

-- Categories
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  "order" INT DEFAULT 0
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view forum categories"
  ON public.forum_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage forum categories"
  ON public.forum_categories FOR ALL
  USING (public.is_admin());

-- Seed categories
INSERT INTO public.forum_categories (name, slug, description, color, icon, "order") VALUES
  ('Annonces', 'annonces', 'Annonces et communications importantes', '#6366f1', 'megaphone', 1),
  ('Offres d''emploi', 'offres-emploi', 'Offres de missions, CDI, CDD et freelance', '#f97316', 'briefcase', 2),
  ('Business', 'business', 'Discussions business et opportunités', '#10b981', 'trending-up', 3),
  ('Recrutement', 'recrutement', 'Recherche de profils et de talents', '#8b5cf6', 'users', 4),
  ('Rencontres', 'rencontres', 'Événements, meetups et networking', '#ec4899', 'calendar', 5),
  ('Entraide', 'entraide', 'Questions, conseils et partage d''expérience', '#06b6d4', 'heart-handshake', 6),
  ('Hors-sujet', 'hors-sujet', 'Discussions libres et détente', '#64748b', 'coffee', 7);

-- Tags
CREATE TABLE public.forum_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT
);

ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view tags"
  ON public.forum_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Admins can manage tags"
  ON public.forum_tags FOR ALL
  USING (public.is_admin());

-- Seed tags
INSERT INTO public.forum_tags (name, color) VALUES
  ('Urgent', '#ef4444'),
  ('Discussion', '#3b82f6'),
  ('Question', '#8b5cf6'),
  ('Partage', '#22c55e'),
  ('Offre', '#f97316');

-- Posts
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  reply_count INT DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Full-text search index
CREATE INDEX idx_forum_posts_search ON public.forum_posts
  USING GIN (to_tsvector('french', title || ' ' || content));

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view posts"
  ON public.forum_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can update own posts or admin"
  ON public.forum_posts FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own posts or admin"
  ON public.forum_posts FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- Post-tag junction
CREATE TABLE public.forum_post_tags (
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.forum_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view post tags"
  ON public.forum_post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can manage post tags"
  ON public.forum_post_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Post authors and admins can delete post tags"
  ON public.forum_post_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forum_posts
      WHERE id = post_id AND (author_id = auth.uid() OR public.is_admin())
    )
  );

-- Replies
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view replies"
  ON public.forum_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can update own replies or admin"
  ON public.forum_replies FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own replies or admin"
  ON public.forum_replies FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- Trigger: increment reply_count and update last_reply_at on new reply
CREATE OR REPLACE FUNCTION public.handle_new_forum_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.forum_posts
  SET reply_count = reply_count + 1,
      last_reply_at = NEW.created_at
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_forum_reply_created
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_forum_reply();

-- ============================================================
-- 5. DROP OLD TABLES
-- ============================================================

DROP TABLE IF EXISTS public.annonces CASCADE;
DROP TABLE IF EXISTS public.offres_emploi CASCADE;

-- ============================================================
-- 6. UPDATE handle_new_user() — remove sponsor_code logic
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _x_handle TEXT;
  _avatar_url TEXT;
BEGIN
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  _x_handle := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'x_handle', ''),
    NULLIF(NEW.raw_user_meta_data->>'user_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'preferred_username', ''),
    ''
  );

  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  INSERT INTO public.profiles (id, email, full_name, x_handle, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    _full_name,
    _x_handle,
    _avatar_url
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
