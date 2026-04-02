-- Specialty categories and sub-specialties

CREATE TABLE specialty_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order int DEFAULT 0
);

CREATE TABLE specialties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES specialty_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  UNIQUE(category_id, name)
);

-- Link profile to specialty
ALTER TABLE profiles
  ADD COLUMN specialty_id uuid REFERENCES specialties(id),
  ADD COLUMN specialty_category_id uuid REFERENCES specialty_categories(id);

-- RLS
ALTER TABLE specialty_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON specialty_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON specialties FOR SELECT USING (true);

-- Seed data
DO $$
DECLARE
  cat_id uuid;
BEGIN
  -- Avocat
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Avocat', 1) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Droit des affaires'), (cat_id, 'Droit fiscal'), (cat_id, 'Droit pénal'),
    (cat_id, 'Droit du travail'), (cat_id, 'Droit immobilier'), (cat_id, 'Droit de la famille'),
    (cat_id, 'Propriété intellectuelle');

  -- Médecin
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Médecin', 2) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Généraliste'), (cat_id, 'Cardiologue'), (cat_id, 'Dermatologue'),
    (cat_id, 'Psychiatre'), (cat_id, 'Chirurgien'), (cat_id, 'Pédiatre'), (cat_id, 'Ophtalmologue');

  -- Kinésithérapeute
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Kinésithérapeute', 3) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Sport'), (cat_id, 'Respiratoire'), (cat_id, 'Neurologie'),
    (cat_id, 'Pédiatrique'), (cat_id, 'Rééducation post-opératoire');

  -- Ostéopathe
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Ostéopathe', 4) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Structurel'), (cat_id, 'Crânien'), (cat_id, 'Viscéral'),
    (cat_id, 'Pédiatrique'), (cat_id, 'Sport');

  -- Architecte
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Architecte', 5) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Résidentiel'), (cat_id, 'Commercial'), (cat_id, 'Urbanisme'),
    (cat_id, 'Intérieur'), (cat_id, 'Paysagiste');

  -- Expert-comptable
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Expert-comptable', 6) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Comptabilité générale'), (cat_id, 'Audit'), (cat_id, 'Fiscalité'),
    (cat_id, 'Conseil en gestion'), (cat_id, 'Social/Paie');

  -- Consultant
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Consultant', 7) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Stratégie'), (cat_id, 'IT/Digital'), (cat_id, 'RH'),
    (cat_id, 'Marketing'), (cat_id, 'Finance'), (cat_id, 'RSE');

  -- Designer
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Designer', 8) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'UX/UI'), (cat_id, 'Graphique'), (cat_id, 'Produit'),
    (cat_id, 'Motion'), (cat_id, 'Intérieur');

  -- Développeur
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Développeur', 9) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Frontend'), (cat_id, 'Backend'), (cat_id, 'Fullstack'),
    (cat_id, 'Mobile'), (cat_id, 'Data/IA'), (cat_id, 'DevOps');

  -- Photographe
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Photographe', 10) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Portrait'), (cat_id, 'Événementiel'), (cat_id, 'Corporate'),
    (cat_id, 'Produit'), (cat_id, 'Immobilier');

  -- Coach
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Coach', 11) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Business'), (cat_id, 'Sport'), (cat_id, 'Vie/Bien-être'),
    (cat_id, 'Leadership'), (cat_id, 'Nutrition');

  -- Formateur
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Formateur', 12) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Management'), (cat_id, 'Langues'), (cat_id, 'Digital'),
    (cat_id, 'Soft skills'), (cat_id, 'Technique');

  -- Artisan
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Artisan', 13) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Menuisier'), (cat_id, 'Plombier'), (cat_id, 'Électricien'),
    (cat_id, 'Maçon'), (cat_id, 'Peintre'), (cat_id, 'Couvreur');

  -- Agent immobilier
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Agent immobilier', 14) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Résidentiel'), (cat_id, 'Commercial'), (cat_id, 'Luxe'),
    (cat_id, 'Location'), (cat_id, 'Gestion locative');

  -- Notaire
  INSERT INTO specialty_categories (name, sort_order) VALUES ('Notaire', 15) RETURNING id INTO cat_id;
  INSERT INTO specialties (category_id, name) VALUES
    (cat_id, 'Immobilier'), (cat_id, 'Succession'), (cat_id, 'Famille'), (cat_id, 'Entreprise');
END $$;
