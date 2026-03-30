export type Profile = {
  id: string;
  email: string;
  full_name: string;
  specialty: string | null;
  location: string | null;
  bio: string | null;
  x_handle: string;
  avatar_url: string | null;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Annonce = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: "service" | "recherche" | "collaboration" | "autre" | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type OffreEmploi = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  company_name: string | null;
  contract_type: "freelance" | "cdi" | "cdd" | "mission" | "stage" | null;
  location: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
};
