"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import { XLogo } from "@/components/ui/x-logo";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Search,
  MessageSquare,
  UserPlus,
  MapPin,
  SkipForward,
  Check,
  Pencil,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Profile, SpecialtyCategory } from "@/lib/types/database";

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

interface OnboardingWizardProps {
  profile: Profile;
  specialtyCategories: (SpecialtyCategory & { specialties: { id: string; name: string }[] })[];
  memberCount: number;
  sponsor: { x_handle: string; full_name: string; avatar_url: string | null } | null;
  members: MemberPreview[];
  presentationsCategoryId: string | null;
  countries: { id: string; name: string; flag: string; is_francophone: boolean }[];
  cities: { id: string; name: string; country_id: string; region: string | null }[];
}

const TOTAL_STEPS = 7;

const STEP_META: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "Bienvenue" },
  { icon: User, label: "Métier" },
  { icon: MapPin, label: "Lieu & Bio" },
  { icon: Check, label: "Récap" },
  { icon: Search, label: "Recherche" },
  { icon: MessageSquare, label: "Présentation" },
  { icon: UserPlus, label: "Inviter" },
];

export function OnboardingWizard({
  profile,
  specialtyCategories,
  memberCount,
  sponsor,
  members,
  presentationsCategoryId,
  countries,
  cities,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [specialtyIds, setSpecialtyIds] = useState<string[]>(profile.specialty_ids ?? []);
  const [specialtyCategoryId, setSpecialtyCategoryId] = useState(profile.specialty_category_id || "");

  // Parse location if it contains a comma
  const [country, setCountry] = useState(() => {
    if (profile.location && profile.location.includes(",")) {
      return profile.location.split(",")[1]?.trim() || "";
    }
    return "";
  });

  const [city, setCity] = useState(() => {
    if (profile.location && profile.location.includes(",")) {
      return profile.location.split(",")[0]?.trim() || "";
    }
    return "";
  });

  const [bio, setBio] = useState(profile.bio || "");

  // Compute location from country and city
  const location = city && country ? `${city}, ${country}` : city || country;

  // Looking for state
  const [lookingForSpecialty, setLookingForSpecialty] = useState("");
  const [lookingForCity, setLookingForCity] = useState("");

  // Compute specialty display label for preview
  const selectedCategory = specialtyCategories.find((c) => c.id === specialtyCategoryId);
  const specialtyLabel = selectedCategory
    ? [selectedCategory.name, ...specialtyIds.map((id) => selectedCategory.specialties.find((s) => s.id === id)?.name).filter(Boolean)].join(", ")
    : "";

  // Intro post state
  const [introText, setIntroText] = useState(
    `Bonjour ! Je suis ${profile.full_name || profile.x_handle}${specialtyLabel ? `, ${specialtyLabel}` : ""}${location ? ` à ${location}` : ""}. Ravi de rejoindre le réseau !`
  );

  // Invite state
  const [inviteHandle, setInviteHandle] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const supabase = createClient();

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  // Save profile (step 2)
  const saveProfile = async () => {
    setLoading(true);
    await supabase
      .from("profiles")
      .update({
        specialty_ids: specialtyIds,
        specialty_category_id: specialtyCategoryId || null,
        location: location || null,
        bio: bio || null,
      })
      .eq("id", profile.id);
    setLoading(false);
    next();
  };

  // Save looking_for and go next (step 4)
  const saveLookingFor = async () => {
    setLoading(true);
    const lookingFor = [lookingForSpecialty, lookingForCity].filter(Boolean).join(" à ");
    await supabase
      .from("profiles")
      .update({ looking_for: lookingFor || null })
      .eq("id", profile.id);
    setLoading(false);
    next();
  };

  // Create intro post (step 5)
  const publishIntro = async () => {
    if (!introText.trim() || !presentationsCategoryId) {
      next();
      return;
    }
    setLoading(true);
    await supabase.from("forum_posts").insert({
      category_id: presentationsCategoryId,
      author_id: profile.id,
      title: `Bonjour, je suis @${profile.x_handle}`,
      content: introText,
    });
    setLoading(false);
    next();
  };

  // Send invite (step 6)
  const sendInvite = async () => {
    const handle = inviteHandle.replace("@", "").trim();
    if (!handle) return;
    setLoading(true);
    await supabase.from("invitations").insert({
      inviter_id: profile.id,
      invited_x_handle: handle,
    });
    setInviteSuccess(handle);
    setInviteHandle("");
    setLoading(false);
  };

  // Finish onboarding
  const finish = async () => {
    setLoading(true);
    // Mark onboarding as complete
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", profile.id);

    // Create welcome notification
    await supabase.from("notifications").insert({
      user_id: profile.id,
      type: "welcome",
      title: "Bienvenue sur MarchéLibre !",
      body: "Votre compte est activé. Explorez l'annuaire, rejoignez une discussion, ou invitez un professionnel.",
      link: "/forum",
    });

    router.push("/forum");
  };

  // Build specialty name lookup for member matching
  const specNameMap = new Map<string, string>();
  for (const cat of specialtyCategories) {
    for (const s of cat.specialties) {
      specNameMap.set(s.id, s.name);
    }
  }

  // Filter members based on looking_for
  const matchingMembers = members.filter((m) => {
    if (!lookingForSpecialty && !lookingForCity) return true;
    const memberSpecNames = (m.specialty_ids ?? []).map((id) => specNameMap.get(id) || "").join(" ");
    const matchSpec = !lookingForSpecialty || memberSpecNames.toLowerCase().includes(lookingForSpecialty.toLowerCase());
    const matchLoc = !lookingForCity || m.location?.toLowerCase().includes(lookingForCity.toLowerCase());
    return matchSpec || matchLoc;
  }).slice(0, 5);

  // Get display label for a member preview
  const getMemberSpecLabel = (m: MemberPreview): string | null => {
    const cat = specialtyCategories.find((c) => c.id === m.specialty_category_id);
    if (!cat) return null;
    const names = (m.specialty_ids ?? []).map((id) => cat.specialties.find((s) => s.id === id)?.name).filter(Boolean);
    return names.length > 0 ? `${cat.name} · ${names.join(", ")}` : cat.name;
  };

  // Flatten all specialties for the select
  const allSpecialties = specialtyCategories.flatMap((cat) =>
    (cat.specialties || []).map((s) => ({ ...s, categoryId: cat.id, categoryName: cat.name }))
  );

  return (
    <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl">
      {/* Step indicators — hidden on welcome step */}
      {step > 1 && (
        <div className="px-8 sm:px-12 pt-8 pb-0">
          <div className="flex items-center">
            {STEP_META.map((s, i) => {
              const stepNum = i + 1;
              const Icon = s.icon;
              const isActive = stepNum === step;
              const isDone = stepNum < step;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => { if (isDone) setStep(stepNum); }}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                      isDone ? "cursor-pointer" : "cursor-default"
                    }`}
                    disabled={!isDone}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-accent text-base-100"
                        : isDone
                          ? "bg-accent/20 text-accent"
                          : "bg-base-content/[0.06] text-base-content/20"
                    }`}>
                      {isDone ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${
                      isActive
                        ? "text-accent"
                        : isDone
                          ? "text-base-content/40"
                          : "text-base-content/20"
                    }`}>{s.label}</span>
                  </button>
                  {i < STEP_META.length - 1 && (
                    <div className="flex-1 h-px mx-1.5 mt-[-16px] sm:mt-0">
                      <div className={`h-full transition-all duration-500 ${
                        isDone ? "bg-accent/30" : "bg-base-content/[0.06]"
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-8 sm:px-12 pb-10 pt-8">
        {/* ========= STEP 1: BIENVENUE ========= */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-base-content tracking-tight">
                Bienvenue, <span className="text-accent">@{profile.x_handle}</span>
              </h1>
              {sponsor && (
                <p className="text-sm text-base-content/50 mt-2">
                  Parrainé par <span className="font-medium text-base-content/70">@{sponsor.x_handle}</span>
                </p>
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-sm font-medium text-accent">
              Vous êtes le {memberCount}ème membre
            </div>

            <p className="text-sm text-base-content/50 leading-relaxed max-w-sm mx-auto">
              Configurez votre profil en quelques étapes pour rejoindre la communauté.
            </p>

            <Button onClick={next} size="lg" className="mx-auto">
              Commencer <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ========= STEP 2: PROFIL ========= */}
        {step === 2 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Votre profil</h2>
                <p className="text-xs text-base-content/40">Étape 2/{TOTAL_STEPS}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category select — custom SearchSelect grouped by sector */}
              <SearchSelect
                label="Quel est votre métier ?"
                placeholder="Rechercher un métier…"
                value={specialtyCategoryId}
                onChange={(value) => { setSpecialtyCategoryId(value); setSpecialtyIds([]); }}
                options={specialtyCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                  group: cat.sector || "Autre",
                }))}
              />

              {/* Sub-specialties multi-select — custom styled */}
              {selectedCategory && selectedCategory.specialties.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-base-content/70">
                    Vos spécialités <span className="text-base-content/30">({specialtyIds.length}/3)</span>
                  </label>
                  {specialtyIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {specialtyIds.map((id) => {
                        const spec = selectedCategory.specialties.find((s) => s.id === id);
                        if (!spec) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-accent bg-accent/10">
                            {spec.name}
                            <button type="button" onClick={() => setSpecialtyIds((prev) => prev.filter((x) => x !== id))} className="hover:text-accent/70 cursor-pointer">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {specialtyIds.length < 3 && (
                    <SearchSelect
                      placeholder="Ajouter une spécialité…"
                      value=""
                      onChange={(value) => {
                        if (value && !specialtyIds.includes(value)) {
                          setSpecialtyIds((prev) => [...prev, value]);
                        }
                      }}
                      options={selectedCategory.specialties
                        .filter((s) => !specialtyIds.includes(s.id))
                        .map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                    />
                  )}
                </div>
              )}

            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={next} size="sm">
                  Passer <SkipForward className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={next} size="sm">
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========= STEP 3: LOCALISATION & BIO ========= */}
        {step === 3 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Où êtes-vous basé ?</h2>
                <p className="text-xs text-base-content/40">Étape 3/{TOTAL_STEPS}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <SearchSelect
                  label="Pays"
                  placeholder="Sélectionner…"
                  value={country}
                  onChange={(value) => { setCountry(value); setCity(""); }}
                  options={countries.map((c) => ({
                    value: c.name,
                    label: `${c.flag} ${c.name}`,
                    group: c.is_francophone ? "Francophonie" : "Autres pays",
                  }))}
                />
                <SearchSelect
                  label="Ville"
                  placeholder="Sélectionner…"
                  value={city}
                  onChange={(_, label) => setCity(label)}
                  options={(() => {
                    const co = countries.find((c) => c.name === country);
                    if (!co) return [];
                    return cities
                      .filter((c) => c.country_id === co.id)
                      .map((c) => ({ value: c.name, label: c.name, group: c.region || undefined }));
                  })()}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-base-content/70">
                  Décrivez-vous en quelques mots
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex : Développeur fullstack passionné par les startups…"
                  rows={3}
                  maxLength={300}
                  className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/30 focus:border-accent focus:outline-none resize-none"
                />
                <p className="text-xs text-base-content/30 text-right">{bio.length}/300</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={next} size="sm">
                  Passer <SkipForward className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={saveProfile} disabled={loading} size="sm">
                  {loading ? "Enregistrement…" : "Continuer"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========= STEP 4: RÉCAP PROFIL ========= */}
        {step === 4 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Votre carte de membre</h2>
                <p className="text-xs text-base-content/40">Étape 3/{TOTAL_STEPS}</p>
              </div>
            </div>

            {/* Profile preview card */}
            <div className="rounded-xl border border-base-content/[0.08] bg-base-100 p-5">
              <div className="flex items-start gap-4">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.x_handle}
                  size="xl"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-base-content">
                    @{profile.x_handle}
                  </h3>
                  {profile.full_name && (
                    <p className="text-sm text-base-content/60">{profile.full_name}</p>
                  )}
                  {specialtyLabel && (
                    <span className="inline-block mt-1.5 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      {specialtyLabel}
                    </span>
                  )}
                  {location && (
                    <p className="text-xs text-base-content/40 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {location}
                    </p>
                  )}
                </div>
              </div>
              {bio && (
                <p className="mt-3 text-sm text-base-content/60 leading-relaxed border-t border-base-content/[0.06] pt-3">
                  {bio}
                </p>
              )}
              {!specialtyLabel && !location && !bio && (
                <p className="mt-3 text-sm text-base-content/30 italic text-center">
                  Profil non complété — vous pourrez le faire plus tard
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </Button>
              <Button onClick={next} size="sm">
                C&apos;est bon <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========= STEP 5: QU'EST-CE QUE VOUS CHERCHEZ ========= */}
        {step === 5 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Que recherchez-vous ?</h2>
                <p className="text-xs text-base-content/40">Étape 5/{TOTAL_STEPS}</p>
              </div>
            </div>

            <p className="text-sm text-base-content/50">
              Dites-nous ce que vous cherchez, on vous montre qui peut vous aider.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <SearchSelect
                label="Spécialité recherchée"
                placeholder="Rechercher…"
                value={lookingForSpecialty}
                onChange={(_, label) => setLookingForSpecialty(label)}
                options={allSpecialties.map((s) => ({
                  value: s.name,
                  label: s.name,
                  group: s.categoryName,
                }))}
              />
              <SearchSelect
                label="Ville"
                placeholder="Rechercher…"
                value={lookingForCity}
                onChange={(_, label) => setLookingForCity(label)}
                options={cities.map((c) => ({ value: c.name, label: c.name }))}
              />
            </div>

            {/* Matching members */}
            {matchingMembers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                  {matchingMembers.length} membre{matchingMembers.length > 1 ? "s" : ""} correspondant{matchingMembers.length > 1 ? "s" : ""}
                </p>
                {matchingMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-base-content/[0.06] bg-base-100"
                  >
                    <Avatar src={m.avatar_url} name={m.x_handle} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-base-content truncate">
                        @{m.x_handle}
                      </p>
                      <p className="text-xs text-base-content/40 truncate">
                        {[getMemberSpecLabel(m), m.location].filter(Boolean).join(" · ") || "Membre vérifié"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (lookingForSpecialty || lookingForCity) ? (
              <p className="text-sm text-base-content/35 text-center py-4">
                Aucun membre trouvé pour cette recherche. Le réseau grandit chaque jour !
              </p>
            ) : null}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={next} size="sm">
                  Passer <SkipForward className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={saveLookingFor} disabled={loading} size="sm">
                  {loading ? "…" : "Continuer"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========= STEP 6: PRÉSENTEZ-VOUS ========= */}
        {step === 6 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Présentez-vous</h2>
                <p className="text-xs text-base-content/40">Étape 6/{TOTAL_STEPS}</p>
              </div>
            </div>

            <p className="text-sm text-base-content/50">
              Votre premier message sera publié dans la catégorie Présentations.
            </p>

            <textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:border-accent focus:outline-none resize-none"
            />

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={next} size="sm">
                  Passer <SkipForward className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={publishIntro} disabled={loading} size="sm">
                  {loading ? "Publication…" : "Publier"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========= STEP 7: INVITER ========= */}
        {step === 7 && (
          <div className="space-y-6 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-base-content">Inviter un professionnel</h2>
                <p className="text-xs text-base-content/40">Étape 7/{TOTAL_STEPS} — dernière étape</p>
              </div>
            </div>

            <p className="text-sm text-base-content/50">
              Connaissez-vous un professionnel qui devrait rejoindre le réseau ?
            </p>

            {/* X-style input */}
            <div className="rounded-xl border border-base-content/[0.08] overflow-hidden">
              <div className="bg-[#000] px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <XLogo className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-white/70">
                  Identifiant <XLogo className="w-2.5 h-2.5 inline-block align-baseline text-white/90" /> de votre contact
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-base-content/[0.02]">
                <span className="text-base-content/30 text-sm pl-1">@</span>
                <input
                  value={inviteHandle}
                  onChange={(e) => setInviteHandle(e.target.value)}
                  placeholder="identifiant"
                  className="flex-1 bg-transparent text-sm text-base-content placeholder:text-base-content/25 outline-none"
                />
                <Button onClick={sendInvite} disabled={loading || !inviteHandle.trim()} size="sm">
                  {loading ? "…" : "Inviter"}
                </Button>
              </div>
            </div>

            {inviteSuccess && (
              <p className="text-xs text-success">
                Invitation envoyée à @{inviteSuccess} !
              </p>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} size="sm">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={finish} disabled={loading} size="lg">
                {loading ? "Finalisation…" : "Accéder au réseau"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
