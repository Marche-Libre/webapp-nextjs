/**
 * @ARCHIVED - Potentially unused
 * Complex onboarding wizard exceeds Beta 1 needs (FR-001 simplified)
 * Consider: inline profile form instead
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConfetti } from "@/hooks/use-confetti";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchSelect } from "@/components/ui/search-select";
import { XLogo } from "@/components/ui/x-logo";
import Flag from "react-flagpack";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Briefcase,
  Search,
  User,
  UserPlus,
  MapPin,
  SkipForward,
  Check,
  Pencil,
  X,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { Profile, ProfileVisibility, SpecialtyCategory } from "@/lib/types/database";

type MemberPreview = {
  id: string;
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
  specialty_ids: string[];
  specialty_category_id: string | null;
  location: string | null;
  bio: string | null;
};

type CitySuggestion = {
  name: string;
  region: string | null;
  countryCode: string;
  countryName: string;
  label: string;
  source: "geonames" | "fallback-db";
};

interface OnboardingWizardProps {
  profile: Profile;
  specialtyCategories: (SpecialtyCategory & { specialties: { id: string; name: string }[] })[];
  memberCount: number;
  sponsor: { x_handle: string; full_name: string; avatar_url: string | null } | null;
  members: MemberPreview[];
  countries: { id: string; name: string; flag: string; code: string; is_francophone: boolean }[];
}

const TOTAL_STEPS = 8;

const STEP_META: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "Bienvenue" },
  { icon: User, label: "Identité" },
  { icon: Briefcase, label: "Métier" },
  { icon: MapPin, label: "Localisation" },
  { icon: FileText, label: "Bio" },
  { icon: Check, label: "Récap" },
  { icon: Search, label: "Recherche" },
  { icon: UserPlus, label: "Inviter" },
];

export function OnboardingWizard({
  profile,
  specialtyCategories,
  memberCount,
  sponsor,
  members,
  countries,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  // Confetti on welcome step
  useConfetti(step === 1);
  const [loading, setLoading] = useState(false);

  // Identity
  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");

  // Profile form state — multi-category specialty selection
  const [specialtyIds, setSpecialtyIds] = useState<string[]>(profile.specialty_ids ?? []);

  // Location
  const [country, setCountry] = useState(() => {
    if (profile.location?.includes(",")) return profile.location.split(",")[1]?.trim() || "";
    return "";
  });
  const [city, setCity] = useState(() => {
    if (profile.location?.includes(",")) return profile.location.split(",")[0]?.trim() || "";
    return "";
  });
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);

  const [bio, setBio] = useState(profile.bio || "");

  // Visibility toggles
  const [visibility, setVisibility] = useState<Partial<ProfileVisibility>>({
    specialty: true,
    location: true,
    bio: true,
  });
  const toggleVis = (key: keyof ProfileVisibility) =>
    setVisibility((v) => ({ ...v, [key]: !v[key] }));

  const location = city && country ? `${city}, ${country}` : city || country;

  // Looking for
  const [lookingForTags, setLookingForTags] = useState<string[]>([]);
  const [lookingForCities, setLookingForCities] = useState<string[]>([]);
  const [lookingForCityQuery, setLookingForCityQuery] = useState("");
  const [lookingForCitySuggestions, setLookingForCitySuggestions] = useState<CitySuggestion[]>([]);
  const [lookingForCityLoading, setLookingForCityLoading] = useState(false);
  const [lookingForCityError, setLookingForCityError] = useState<string | null>(null);

  const selectedCountry = countries.find((c) => c.name === country) ?? null;

  useEffect(() => {
    if (step !== 4) return;

    const query = city.trim();
    if (query.length < 2) {
      setCitySuggestions([]);
      setCitySearchError(null);
      setCitySearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setCitySearchLoading(true);
      setCitySearchError(null);

      try {
        const params = new URLSearchParams({ q: query, limit: "12", lang: "fr" });
        if (selectedCountry?.code) params.set("country", selectedCountry.code);

        const response = await fetch(`/api/geo/cities?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("city-search-failed");
        }

        const payload = (await response.json()) as { results?: CitySuggestion[] };
        setCitySuggestions(payload.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCitySearchError("Recherche indisponible pour le moment.");
          setCitySuggestions([]);
        }
      } finally {
        setCitySearchLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [city, selectedCountry?.code, step]);

  useEffect(() => {
    if (step !== 7) return;

    const query = lookingForCityQuery.trim();
    if (query.length < 2) {
      setLookingForCitySuggestions([]);
      setLookingForCityError(null);
      setLookingForCityLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLookingForCityLoading(true);
      setLookingForCityError(null);

      try {
        const params = new URLSearchParams({ q: query, limit: "10", lang: "fr" });

        const response = await fetch(`/api/geo/cities?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("city-search-failed");
        }

        const payload = (await response.json()) as { results?: CitySuggestion[] };
        const results = payload.results ?? [];

        setLookingForCitySuggestions(
          results.filter((item) => !lookingForCities.includes(item.name)),
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLookingForCityError("Recherche indisponible pour le moment.");
          setLookingForCitySuggestions([]);
        }
      } finally {
        setLookingForCityLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [lookingForCityQuery, lookingForCities, step]);

  // Specialty labels — handles both category IDs (cat:xxx) and specialty IDs
  const specNameMap = new Map<string, string>();
  const specToCat = new Map<string, string>();
  for (const cat of specialtyCategories) {
    specNameMap.set(`cat:${cat.id}`, cat.name);
    specToCat.set(`cat:${cat.id}`, cat.id);
    for (const s of cat.specialties) {
      specNameMap.set(s.id, `${cat.name} — ${s.name}`);
      specToCat.set(s.id, cat.id);
    }
  }
  const selectedCatIds = [...new Set(specialtyIds.map((id) => specToCat.get(id)).filter(Boolean))];
  const specialtyLabel = specialtyIds.map((id) => specNameMap.get(id)).filter(Boolean).join(", ");

  // Invite
  const [inviteSuccess, setInviteSuccess] = useState("");

  const supabase = createClient();
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  // Build tree: sector groups > categories (depth 0) > specialties (depth 1)
  const allSpecialties = specialtyCategories.flatMap((cat) => {
    const groupName = cat.sector || "Autre";
    const catOption = {
      value: `cat:${cat.id}`,
      label: cat.name,
      group: groupName,
      depth: 0 as const,
    };
    const specOptions = (cat.specialties || []).map((s) => ({
      value: s.id,
      label: s.name,
      group: groupName,
      depth: 1 as const,
    }));
    return [catOption, ...specOptions];
  });

  // Save profile (after step 3 — lieu)
  const saveProfile = async () => {
    setLoading(true);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    await supabase
      .from("profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: fullName || profile.full_name,
        specialty_ids: specialtyIds,
        specialty_category_id: selectedCatIds[0] || null,
        location: location || null,
        visibility: { ...profile.visibility, ...visibility },
      })
      .eq("id", profile.id);
    setLoading(false);
    next();
  };

  // Save bio (step 5)
  const saveBio = async () => {
    setLoading(true);
    await supabase.from("profiles").update({
      bio: bio || null,
      visibility: { ...profile.visibility, ...visibility },
    }).eq("id", profile.id);
    setLoading(false);
    next();
  };

  // Save looking_for (step 7)
  const saveLookingFor = async () => {
    setLoading(true);
    const tags = lookingForTags.join(", ");
    const citiesStr = lookingForCities.map((c) => c.startsWith("__") ? c.replace("__", "") : c).join(", ");
    const lookingFor = [tags, citiesStr].filter(Boolean).join(" · ");
    await supabase.from("profiles").update({ looking_for: lookingFor || null }).eq("id", profile.id);
    setLoading(false);
    next();
  };

  // Finish
  const finish = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", profile.id);
    if (error) {
      alert("Erreur lors de la finalisation. Veuillez réessayer.");
      setLoading(false);
      return;
    }
    await supabase.from("notifications").insert({
      user_id: profile.id,
      type: "welcome",
      title: "Bienvenue sur MarchéLibre !",
      body: "Votre compte est activé. Rejoignez le chat et échangez avec les membres vérifiés.",
      link: "/chat",
    });
    // Hard redirect to bypass middleware cache
    window.location.href = "/chat";
  };

  // Member matching
  const matchingMembers = members.filter((m) => {
    if (lookingForTags.length === 0 && lookingForCities.length === 0) return true;
    const memberSpecs = (m.specialty_ids ?? []).map((id) => specNameMap.get(id) || "").join(" ").toLowerCase();
    const tagMatch = lookingForTags.length === 0 || lookingForTags.some((t) => memberSpecs.includes(t.toLowerCase()));
    const cityMatch = lookingForCities.length === 0 || lookingForCities.some((c) => m.location?.toLowerCase().includes(c.toLowerCase()));
    return (
      tagMatch || cityMatch
    );
  }).slice(0, 5);

  const getMemberSpecLabel = (m: MemberPreview): string | null => {
    const cat = specialtyCategories.find((c) => c.id === m.specialty_category_id);
    if (!cat) return null;
    const names = (m.specialty_ids ?? []).map((id) => cat.specialties.find((s) => s.id === id)?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : cat.name;
  };

  // ============ STEP CONTENT ============

  const stepContent = (
    <div className="flex-1 flex flex-col">
      {/* ========= STEP 1: BIENVENUE ========= */}
      {step === 1 && (
        <div className="text-center space-y-8 animate-[slide-up_0.2s_ease-out] py-4">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-10 w-10 text-accent" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-base-content tracking-tight">
              Bienvenue, <span className="text-accent">@{profile.x_handle}</span>
            </h1>
            {sponsor && (
              <p className="text-base text-base-content/50">
                Parrainé par <span className="font-medium text-base-content/70">@{sponsor.x_handle}</span>
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 text-base font-medium text-accent">
            Vous êtes le {memberCount}ème membre
          </div>

          <p className="text-base text-base-content/50 leading-relaxed max-w-md mx-auto">
            Finalisez votre profil : identité, expertise, localisation et présentation.
            Une fois ces étapes terminées, vous accéderez directement au chat privé.
          </p>

          <Button onClick={next} size="lg" className="mx-auto">
            Commencer <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ========= STEP 2: IDENTITÉ (prénom / nom) ========= */}
      {step === 2 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-base-content tracking-tight">
                Comment vous appelez-vous ?
              </h2>
              <button
                type="button"
                onClick={() => toggleVis("first_name")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className={`text-xs font-medium ${visibility.first_name ? "text-accent" : "text-base-content/30"}`}>
                  {visibility.first_name ? "Visible" : "Invisible"}
                </span>
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${visibility.first_name ? "bg-accent" : "bg-base-content/15"}`}>
                  <div className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${visibility.first_name ? "left-[16px]" : "left-[2px]"}`} />
                </div>
              </button>
            </div>
            <p className="text-base text-base-content/45 mt-2">
              Facultatif — votre handle <XLogo className="w-3 h-3 inline-block align-baseline" /> <span className="text-base-content/70 font-medium">@{profile.x_handle}</span> reste votre identité principale.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-base-content/70">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/30 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-base-content/70">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/30 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={next}>
                Passer <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={next} disabled={!firstName.trim() && !lastName.trim()}>
                Continuer <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========= STEP 3: MÉTIER (direct specialty selection) ========= */}
      {step === 3 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              Votre expertise
            </h2>
            <p className="text-base text-base-content/45 mt-2">
              Sélectionnez jusqu&apos;à 3 spécialités, même dans des domaines différents.
            </p>
          </div>

          <div className="space-y-4">
            {/* Selected specialties as pills */}
            {specialtyIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specialtyIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-accent bg-accent/10 border border-accent/20">
                    {specNameMap.get(id)}
                    <button type="button" onClick={() => setSpecialtyIds((prev) => prev.filter((x) => x !== id))} className="hover:text-accent/70 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Direct specialty search */}
            {specialtyIds.length < 3 && (
              <SearchSelect
                placeholder="Rechercher un métier ou une spécialité…"
                value=""
                onChange={(value) => {
                  if (value && !specialtyIds.includes(value)) {
                    setSpecialtyIds((prev) => [...prev, value]);
                  }
                }}
                options={allSpecialties.filter((s) => !specialtyIds.includes(s.value))}
              />
            )}

            {specialtyIds.length === 0 && (
              <p className="text-sm text-base-content/30 text-center py-2">
                Commencez à taper pour trouver votre métier
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={next} disabled={specialtyIds.length === 0}>
              Continuer <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========= STEP 3: LOCALISATION ========= */}
      {step === 4 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-base-content tracking-tight">
                Où êtes-vous basé ?
              </h2>
              <button
                type="button"
                onClick={() => toggleVis("location")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className={`text-xs font-medium ${visibility.location ? "text-accent" : "text-base-content/30"}`}>
                  {visibility.location ? "Visible" : "Invisible"}
                </span>
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${visibility.location ? "bg-accent" : "bg-base-content/15"}`}>
                  <div className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${visibility.location ? "left-[16px]" : "left-[2px]"}`} />
                </div>
              </button>
            </div>
            <p className="text-base text-base-content/45 mt-2">
              Votre localisation aide les membres à vous trouver pour des collaborations locales.
            </p>
          </div>

          <div className="space-y-5">
            <SearchSelect
              label="Pays"
              placeholder="Sélectionner votre pays…"
              value={country}
              onChange={(value) => {
                setCountry(value === "__non_renseigne" ? "" : value);
                setCity("");
                setCitySuggestions([]);
                setCitySearchError(null);
              }}
              options={[
                { value: "__non_renseigne", label: "Non renseigné" },
                ...countries.map((c) => ({
                  value: c.name,
                  label: c.name,
                  icon: c.code ? <Flag code={c.code} size="s" className="shrink-0" /> : undefined,
                  group: c.is_francophone ? "Francophonie" : "Autres pays",
                })),
              ]}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-base-content/70">Ville</label>

              <div className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-2.5 focus-within:border-accent transition-colors">
                <input
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCitySearchError(null);
                  }}
                  placeholder="Rechercher votre ville…"
                  className="w-full bg-transparent text-sm text-base-content placeholder:text-base-content/30 focus:outline-none"
                />
              </div>

              {citySearchLoading && (
                <p className="text-xs text-base-content/40">Recherche de villes…</p>
              )}

              {citySearchError && (
                <p className="text-xs text-warning">{citySearchError}</p>
              )}

              {citySuggestions.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-base-content/[0.08] bg-base-100 divide-y divide-base-content/[0.05]">
                  {citySuggestions.map((item) => (
                    <button
                      key={`${item.name}-${item.countryCode}-${item.region ?? ""}`}
                      type="button"
                      onClick={() => {
                        setCity(item.name);
                        setCitySuggestions([]);
                        setCitySearchError(null);

                        if (!country) {
                          const detectedCountry =
                            countries.find((c) => c.code === item.countryCode)?.name ||
                            item.countryName;
                          setCountry(detectedCountry);
                        }
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-base-content/[0.04] transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-base-content">{item.name}</p>
                      <p className="text-xs text-base-content/40">
                        {[item.region, item.countryName].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-base-content/35">
                Tapez au moins 2 lettres pour rechercher parmi les villes mondiales.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { saveProfile(); }}>
                Passer <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={saveProfile} disabled={loading || !country}>
                {loading ? "Enregistrement…" : "Continuer"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========= STEP 5: RÉCAP ========= */}
      {step === 6 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              Votre carte de membre
            </h2>
            <p className="text-base text-base-content/45 mt-2">
              Voici comment les autres membres vous verront sur le réseau.
            </p>
          </div>

          {/* Profile preview card */}
          <div className="rounded-2xl border border-base-content/[0.08] bg-base-100 p-8">
            <div className="flex items-start gap-6">
              <Avatar src={profile.avatar_url} name={profile.x_handle} size="xl" />
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-xl font-bold text-base-content">
                  @{profile.x_handle}
                </h3>
                {profile.full_name && (
                  <p className="text-base text-base-content/60">{profile.full_name}</p>
                )}
                {specialtyLabel && (
                  <div className="flex flex-wrap gap-1.5">
                    {specialtyIds.map((id) => (
                      <span key={id} className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        {specNameMap.get(id)}
                      </span>
                    ))}
                  </div>
                )}
                {location && (
                  <p className="text-sm text-base-content/40 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </p>
                )}
              </div>
            </div>
            {bio && (
              <p className="mt-6 text-base text-base-content/60 leading-relaxed border-t border-base-content/[0.06] pt-5">
                {bio}
              </p>
            )}
            {!specialtyLabel && !location && !bio && (
              <p className="mt-6 text-base text-base-content/25 italic text-center">
                Profil non complété — vous pourrez le faire plus tard
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Button>
            <Button onClick={next}>
              C&apos;est bon <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========= STEP 5: BIO ========= */}
      {step === 5 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-base-content tracking-tight">
                Décrivez-vous
              </h2>
              <button
                type="button"
                onClick={() => toggleVis("bio")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className={`text-xs font-medium ${visibility.bio ? "text-accent" : "text-base-content/30"}`}>
                  {visibility.bio ? "Visible" : "Invisible"}
                </span>
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${visibility.bio ? "bg-accent" : "bg-base-content/15"}`}>
                  <div className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-transform ${visibility.bio ? "left-[16px]" : "left-[2px]"}`} />
                </div>
              </button>
            </div>
            <p className="text-base text-base-content/45 mt-2">
              Une courte bio aide les autres membres à mieux vous connaître.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex : Développeur fullstack passionné par les startups, basé à Lyon. J'accompagne les entreprises dans leur transformation digitale."
              rows={5}
              maxLength={300}
              className="w-full rounded-xl border border-base-content/[0.08] bg-base-100 px-5 py-4 text-base text-base-content placeholder:text-base-content/25 focus:border-accent focus:outline-none resize-none leading-relaxed"
            />
            <p className="text-xs text-base-content/30 text-right">{bio.length}/300</p>
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={next}>
                Passer <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={saveBio} disabled={loading || !bio.trim()}>
                {loading ? "Enregistrement…" : "Continuer"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========= STEP 6: RECHERCHE ========= */}
      {step === 7 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              Que recherchez-vous ?
            </h2>
            <p className="text-base text-base-content/45 mt-2">
              Dites-nous ce que vous cherchez, on vous montre qui peut vous aider.
            </p>
          </div>

          <div className="space-y-5">
            {/* What are you looking for — multi select with pills */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-base-content/70">Je cherche…</label>
              {lookingForTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {lookingForTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20">
                      {tag}
                      <button type="button" onClick={() => setLookingForTags((prev) => prev.filter((t) => t !== tag))} className="hover:text-accent/70 cursor-pointer">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <SearchSelect
                placeholder="Ajouter un objectif ou un métier…"
                value=""
                onChange={(_, label) => {
                  if (label && !lookingForTags.includes(label)) {
                    setLookingForTags((prev) => [...prev, label]);
                  }
                }}
                options={[
                  { value: "clients", label: "Des clients / missions", group: "Mon objectif" },
                  { value: "collaborateurs", label: "Des collaborateurs / associés", group: "Mon objectif" },
                  { value: "réseau", label: "Élargir mon réseau professionnel", group: "Mon objectif" },
                  { value: "prestataires", label: "Des prestataires / sous-traitants", group: "Mon objectif" },
                  ...allSpecialties
                    .filter((s) => !lookingForTags.includes(s.label))
                    .map((s) => ({ value: s.value, label: s.label, group: s.group })),
                ]}
              />
            </div>

            {/* Where — multi select with pills */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-base-content/70">Où ?</label>
              {lookingForCities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {lookingForCities.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20">
                      {c}
                      <button type="button" onClick={() => setLookingForCities((prev) => prev.filter((x) => x !== c))} className="hover:text-accent/70 cursor-pointer">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!lookingForCities.includes("__remote")) {
                      setLookingForCities((prev) => [...prev, "__remote"]);
                    }
                  }}
                >
                  À distance / Partout
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!lookingForCities.includes("__france")) {
                      setLookingForCities((prev) => [...prev, "__france"]);
                    }
                  }}
                >
                  Toute la France
                </Button>
              </div>

              <div className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-2.5 focus-within:border-accent transition-colors">
                <input
                  value={lookingForCityQuery}
                  onChange={(e) => {
                    setLookingForCityQuery(e.target.value);
                    setLookingForCityError(null);
                  }}
                  placeholder="Ajouter une ville…"
                  className="w-full bg-transparent text-sm text-base-content placeholder:text-base-content/30 focus:outline-none"
                />
              </div>

              {lookingForCityLoading && (
                <p className="text-xs text-base-content/40">Recherche de villes…</p>
              )}

              {lookingForCityError && (
                <p className="text-xs text-warning">{lookingForCityError}</p>
              )}

              {lookingForCitySuggestions.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-base-content/[0.08] bg-base-100 divide-y divide-base-content/[0.05]">
                  {lookingForCitySuggestions.map((item) => (
                    <button
                      key={`looking-for-${item.name}-${item.countryCode}-${item.region ?? ""}`}
                      type="button"
                      onClick={() => {
                        if (!lookingForCities.includes(item.name)) {
                          setLookingForCities((prev) => [...prev, item.name]);
                        }
                        setLookingForCityQuery("");
                        setLookingForCitySuggestions([]);
                        setLookingForCityError(null);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-base-content/[0.04] transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-base-content">{item.name}</p>
                      <p className="text-xs text-base-content/40">
                        {[item.region, item.countryName].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matching members */}
          {matchingMembers.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-base-content/40 uppercase tracking-wider">
                {matchingMembers.length} membre{matchingMembers.length > 1 ? "s" : ""} correspondant{matchingMembers.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {matchingMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-base-content/[0.06] bg-base-100">
                    <Avatar src={m.avatar_url} name={m.x_handle} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-base-content truncate">@{m.x_handle}</p>
                      <p className="text-xs text-base-content/40 truncate">
                        {[getMemberSpecLabel(m), m.location].filter(Boolean).join(" · ") || "Membre vérifié"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(lookingForTags.length > 0 || lookingForCities.length > 0) && matchingMembers.length === 0 && (
            <p className="text-base text-base-content/30 text-center py-6">
              Aucun membre trouvé. Le réseau grandit chaque jour !
            </p>
          )}

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={next}>
                Passer <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={saveLookingFor} disabled={loading || (lookingForTags.length === 0 && lookingForCities.length === 0)}>
                {loading ? "…" : "Continuer"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========= STEP 8: INVITER (lien de parrainage) ========= */}
      {step === 8 && (
        <div className="flex-1 flex flex-col space-y-8 animate-[slide-up_0.2s_ease-out]">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              Invitez un professionnel
            </h2>
            <p className="text-base text-base-content/45 mt-2">
              Partagez votre lien de parrainage — par DM, SMS, email ou WhatsApp.
            </p>
          </div>

          {/* Referral link */}
          <div className="space-y-4">
            <div className="rounded-xl border border-base-content/[0.08] bg-base-100 p-4">
              <p className="text-xs font-medium text-base-content/40 mb-2">Votre lien personnel</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-accent bg-accent/[0.06] rounded-lg px-3 py-2.5 truncate select-all">
                  {typeof window !== "undefined" ? window.location.origin : "https://marchelibre.com"}/rejoindre?ref={profile.x_handle}
                </code>
                <Button
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/rejoindre?ref=${profile.x_handle}`;
                    navigator.clipboard.writeText(url);
                    setInviteSuccess("copied");
                    setTimeout(() => setInviteSuccess(""), 2000);
                  }}
                >
                  {inviteSuccess === "copied" ? (
                    <><Check className="h-4 w-4" /> Copié</>
                  ) : (
                    "Copier"
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-base-content/30 text-center">
              Quand quelqu&apos;un s&apos;inscrit via votre lien, vous devenez automatiquement son parrain.
            </p>
          </div>

          <div className="flex justify-between pt-4 mt-auto">
            <Button variant="ghost" onClick={prev}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={finish} disabled={loading} size="lg">
              {loading ? "Finalisation…" : "Accéder au réseau"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Step 1 (welcome) — full-width centered, no sidebar
  if (step === 1) {
    return (
      <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl">
        <div className="px-10 sm:px-16 pb-12 pt-10">
          {stepContent}
        </div>
      </div>
    );
  }

  // Steps 2-8 — split layout with vertical stepper
  return (
    <div className="flex gap-0 sm:gap-10 items-center">
      {/* Vertical stepper sidebar */}
      <div className="hidden sm:block shrink-0 w-44">
        <div className="flex flex-col">
          {STEP_META.map((s, i) => {
            const stepNum = i + 1;
            if (stepNum === 1) return null;
            const Icon = s.icon;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            const isLast = i === STEP_META.length - 1;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => { if (isDone) setStep(stepNum); }}
                  className={`flex items-center gap-3 w-full py-1 transition-all duration-300 ${
                    isDone ? "cursor-pointer" : "cursor-default"
                  }`}
                  disabled={!isDone && !isActive}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : isDone
                        ? "border-accent/30 bg-accent/5 text-accent/60"
                        : "border-base-content/10 bg-base-content/[0.03] text-base-content/20"
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-sm font-medium transition-all duration-300 ${
                    isActive ? "text-accent" : isDone ? "text-base-content/50" : "text-base-content/20"
                  }`}>{s.label}</span>
                </button>
                {!isLast && (
                  <div className="flex justify-start pl-[19px]">
                    <div className={`w-0.5 h-6 transition-all duration-500 ${
                      isDone ? "bg-accent/30" : "bg-base-content/[0.06]"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content card — matches stepper height */}
      <div className="flex-1 min-w-0">
        <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl min-h-[480px] flex flex-col">
          <div className="px-6 sm:px-10 pb-8 pt-8 flex-1 flex flex-col">
            {stepContent}
          </div>
        </div>

        {/* Mobile step dots */}
        <div className="flex sm:hidden justify-center gap-1.5 mt-4">
          {STEP_META.map((_, i) => {
            const stepNum = i + 1;
            if (stepNum === 1) return null;
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepNum === step ? "w-6 bg-accent" : stepNum < step ? "w-1.5 bg-accent/40" : "w-1.5 bg-base-content/10"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
