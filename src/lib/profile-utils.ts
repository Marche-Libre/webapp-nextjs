import type { Profile, ProfileVisibility, SpecialtyCategory, Specialty } from "@/lib/types/database";

// ─── Visibility ───

const DEFAULT_VISIBILITY: ProfileVisibility = {
  first_name: true,
  last_name: true,
  phone: false,
  email: false,
  location: true,
  specialty: true,
  bio: true,
  years_experience: true,
  links: true,
  daily_rate: false,
  website: true,
  skills: true,
};

export function getVisibility(profile: Profile): ProfileVisibility {
  return { ...DEFAULT_VISIBILITY, ...(profile.visibility as Partial<ProfileVisibility> | null) };
}

export function applyVisibility(profile: Profile, isOwnProfile: boolean): Profile {
  if (isOwnProfile) return profile;
  const v = getVisibility(profile);
  const p = { ...profile };

  if (!v.first_name) p.first_name = null;
  if (!v.last_name) p.last_name = null;
  if (!v.phone) p.phone = null;
  if (!v.email) p.email = "";
  if (!v.location) p.location = null;
  if (!v.specialty) { p.specialty_ids = []; p.specialty_category_id = null; }
  if (!v.bio) p.bio = null;
  if (!v.years_experience) p.years_experience = null;
  if (!v.links) p.links = null;
  if (!v.daily_rate) p.daily_rate = null;
  if (!v.website) p.website = null;
  if (!v.skills) p.skills = [];

  // Recalculate full_name from visible parts
  p.full_name = [p.first_name, p.last_name].filter(Boolean).join(" ");

  return p;
}

// ─── Country flag ───

export function countryFlag(code: string): string {
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}

export const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "CA", name: "Canada" },
  { code: "MA", name: "Maroc" },
  { code: "TN", name: "Tunisie" },
  { code: "SN", name: "Sénégal" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "US", name: "États-Unis" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "DE", name: "Allemagne" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "PT", name: "Portugal" },
  { code: "LU", name: "Luxembourg" },
  { code: "MC", name: "Monaco" },
  { code: "NL", name: "Pays-Bas" },
  { code: "DZ", name: "Algérie" },
  { code: "CM", name: "Cameroun" },
  { code: "GA", name: "Gabon" },
  { code: "MU", name: "Maurice" },
  { code: "MG", name: "Madagascar" },
  { code: "RE", name: "La Réunion" },
  { code: "GP", name: "Guadeloupe" },
  { code: "MQ", name: "Martinique" },
].map((c) => ({ ...c, flag: countryFlag(c.code) }));

// ─── Availability ───

export const AVAILABILITY_OPTIONS = [
  { value: "available" as const, label: "Disponible pour une mission", shortLabel: "Disponible", color: "text-green-500", dot: "bg-green-500", badge: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "busy" as const, label: "Actuellement en mission", shortLabel: "En mission", color: "text-amber-500", dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "unavailable" as const, label: "Pas disponible pour le moment", shortLabel: "Indisponible", color: "text-red-500", dot: "bg-red-500", badge: "bg-red-500/10 text-red-600 border-red-500/20" },
  { value: "unset" as const, label: "Non renseigné", shortLabel: "", color: "text-text-muted", dot: "bg-text-muted", badge: "bg-bg-surface text-text-muted border-border-default" },
];

export function getAvailabilityOption(status: string) {
  return AVAILABILITY_OPTIONS.find((o) => o.value === status) ?? AVAILABILITY_OPTIONS[0];
}

// ─── Profile completeness ───

const COMPLETENESS_FIELDS: { key: string; label: string }[] = [
  { key: "first_name", label: "Prénom" },
  { key: "last_name", label: "Nom" },
  { key: "specialty_ids", label: "Spécialité" },
  { key: "location", label: "Localisation" },
  { key: "bio", label: "Bio" },
  { key: "years_experience", label: "Expérience" },
  { key: "country_code", label: "Pays" },
  { key: "skills", label: "Compétences" },
  { key: "website", label: "Site web" },
  { key: "daily_rate", label: "Tarif" },
  { key: "avatar_url", label: "Photo de profil" },
];

export function getProfileCompleteness(profile: Profile): { percent: number; missing: { key: string; label: string }[] } {
  const missing: { key: string; label: string }[] = [];

  for (const field of COMPLETENESS_FIELDS) {
    const val = (profile as Record<string, unknown>)[field.key];
    const filled = field.key === "skills" || field.key === "specialty_ids"
      ? Array.isArray(val) && val.length > 0
      : val != null && val !== "";
    if (!filled) missing.push(field);
  }

  const total = COMPLETENESS_FIELDS.length;
  const filled = total - missing.length;
  return { percent: Math.round((filled / total) * 100), missing };
}

// ─── Specialty display ───

export function getSpecialtyDisplay(
  profile: Pick<Profile, "specialty_ids" | "specialty_category_id"> & { specialty_category_ids?: string[] },
  categories: (SpecialtyCategory & { specialties: Specialty[] })[],
): { categoryName: string | null; categoryNames: string[]; specialtyNames: string[] } {
  const catIds = profile.specialty_category_ids?.length
    ? profile.specialty_category_ids
    : profile.specialty_category_id
      ? [profile.specialty_category_id]
      : [];

  if (catIds.length === 0) return { categoryName: null, categoryNames: [], specialtyNames: [] };

  const matchedCats = catIds.map((id) => categories.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
  const allSpecs = matchedCats.flatMap((c) => c.specialties || []);

  const specialtyNames = (profile.specialty_ids ?? [])
    .map((id) => allSpecs.find((s) => s.id === id)?.name)
    .filter((n): n is string => !!n);

  return {
    categoryName: matchedCats[0]?.name || null,
    categoryNames: matchedCats.map((c) => c.name),
    specialtyNames,
  };
}
