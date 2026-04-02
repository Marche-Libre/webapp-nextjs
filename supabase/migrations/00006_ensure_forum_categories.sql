-- Ensure forum categories exist (idempotent)
INSERT INTO public.forum_categories (name, slug, description, color, icon, "order") VALUES
  ('Annonces', 'annonces', 'Annonces et communications importantes', '#6366f1', 'megaphone', 1),
  ('Offres d''emploi', 'offres-emploi', 'Offres de missions, CDI, CDD et freelance', '#f97316', 'briefcase', 2),
  ('Business', 'business', 'Discussions business et opportunités', '#10b981', 'trending-up', 3),
  ('Recrutement', 'recrutement', 'Recherche de profils et de talents', '#8b5cf6', 'users', 4),
  ('Rencontres', 'rencontres', 'Événements, meetups et networking', '#ec4899', 'calendar', 5),
  ('Entraide', 'entraide', 'Questions, conseils et partage d''expérience', '#06b6d4', 'heart-handshake', 6),
  ('Hors-sujet', 'hors-sujet', 'Discussions libres et détente', '#64748b', 'coffee', 7)
ON CONFLICT (slug) DO NOTHING;

-- Also seed default chat channels
INSERT INTO public.channels (name, slug, description) VALUES
  ('Général', 'general', 'Discussions générales'),
  ('Aide', 'aide', 'Questions et support'),
  ('Random', 'random', 'Discussions libres')
ON CONFLICT (slug) DO NOTHING;
