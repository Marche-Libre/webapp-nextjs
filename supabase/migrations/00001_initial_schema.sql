-- MarchéLibre Database Schema

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  location TEXT,
  bio TEXT,
  x_handle TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Annonces (Ads/Announcements)
CREATE TABLE public.annonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('service', 'recherche', 'collaboration', 'autre')),
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offres d'emploi (Job Offers)
CREATE TABLE public.offres_emploi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT,
  contract_type TEXT CHECK (contract_type IN ('freelance', 'cdi', 'cdd', 'mission', 'stage')),
  location TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_annonces_updated_at
  BEFORE UPDATE ON public.annonces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_offres_emploi_updated_at
  BEFORE UPDATE ON public.offres_emploi
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, x_handle)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'x_handle', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offres_emploi ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view approved profiles"
  ON public.profiles FOR SELECT
  USING (status = 'approved' OR id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Annonces policies
CREATE POLICY "Anyone can view active annonces"
  ON public.annonces FOR SELECT
  USING (is_active = TRUE OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Approved users can create annonces"
  ON public.annonces FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can update own annonces"
  ON public.annonces FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete own annonces"
  ON public.annonces FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

-- Offres policies
CREATE POLICY "Anyone can view active offres"
  ON public.offres_emploi FOR SELECT
  USING (is_active = TRUE OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Approved users can create offres"
  ON public.offres_emploi FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can update own offres"
  ON public.offres_emploi FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete own offres"
  ON public.offres_emploi FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());
