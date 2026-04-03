"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect, type SearchSelectOption } from "@/components/ui/search-select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { COUNTRIES, AVAILABILITY_OPTIONS } from "@/lib/profile-utils";
import { cn } from "@/lib/utils";
import type { Profile, SpecialtyCategory, Specialty } from "@/lib/types/database";

interface ProfileEditAllProps {
  profile: Profile;
}

export function ProfileEditAll({ profile }: ProfileEditAllProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<(SpecialtyCategory & { specialties: Specialty[] })[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(profile.specialty_category_id || null);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(profile.specialty_ids ?? []);
  const [skills, setSkills] = useState<string[]>(profile.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [countryCode, setCountryCode] = useState(profile.country_code || "");
  const [availability, setAvailability] = useState(profile.availability_status || "available");
  const router = useRouter();

  useEffect(() => {
    if (open && categories.length === 0) {
      const supabase = createClient();
      supabase
        .from("specialty_categories")
        .select("*, specialties(*)")
        .order("sort_order", { ascending: true })
        .then(({ data }) => {
          if (data) setCategories(data as (SpecialtyCategory & { specialties: Specialty[] })[]);
        });
    }
  }, [open, categories.length]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subSpecialties = selectedCategory?.specialties ?? [];

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim() && skills.length < 5) {
      e.preventDefault();
      const tag = skillInput.trim();
      if (!skills.includes(tag)) {
        setSkills([...skills, tag]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const firstName = (formData.get("first_name") as string) || null;
    const lastName = (formData.get("last_name") as string) || null;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const updates = {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: (formData.get("phone") as string) || null,
      specialty_category_id: selectedCategoryId || null,
      specialty_ids: selectedSpecialtyIds,
      location: (formData.get("location") as string) || null,
      country_code: countryCode || null,
      years_experience: formData.get("years_experience") ? parseInt(formData.get("years_experience") as string, 10) : null,
      bio: (formData.get("bio") as string) || null,
      skills,
      daily_rate: (formData.get("daily_rate") as string) || null,
      website: (formData.get("website") as string) || null,
      availability_status: availability,
    };

    await supabase.from("profiles").update(updates).eq("id", profile.id);

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Modifier le profil
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-[16px]">
      <div className="bg-bg-elevated rounded-xl border border-border-default p-[24px] w-full max-w-lg shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-[20px]">
          <h3 className="font-display font-semibold text-text-primary tracking-[-0.02em]">
            Modifier le profil
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[20px]">
          {/* Personal */}
          <div className="space-y-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">Informations</p>
            <div className="grid grid-cols-2 gap-[12px]">
              <Input
                id="first_name"
                name="first_name"
                label="Prénom"
                defaultValue={profile.first_name || ""}
              />
              <Input
                id="last_name"
                name="last_name"
                label="Nom"
                defaultValue={profile.last_name || ""}
              />
            </div>
            <Input
              id="phone"
              name="phone"
              label="Téléphone"
              defaultValue={profile.phone || ""}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="h-px bg-border-subtle" />

          {/* Specialty */}
          <div className="space-y-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">Spécialité</p>
            <SearchSelect
              label="Catégorie"
              placeholder="Rechercher une catégorie…"
              value={selectedCategoryId || ""}
              onChange={(val) => {
                setSelectedCategoryId(val || null);
                setSelectedSpecialtyIds([]);
              }}
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            />

            {selectedCategoryId && subSpecialties.length > 0 && (
              <div className="space-y-[6px]">
                <label className="block text-[13px] font-medium text-text-secondary">
                  Sous-spécialités <span className="text-text-muted font-normal">({selectedSpecialtyIds.length}/3)</span>
                </label>
                {selectedSpecialtyIds.length > 0 && (
                  <div className="flex flex-wrap gap-[6px] mb-[6px]">
                    {selectedSpecialtyIds.map((id) => {
                      const spec = subSpecialties.find((s) => s.id === id);
                      if (!spec) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-[4px] rounded-md px-[8px] py-[3px] text-[12px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                        >
                          {spec.name}
                          <button
                            type="button"
                            onClick={() => setSelectedSpecialtyIds((prev) => prev.filter((x) => x !== id))}
                            className="hover:text-primary-700 cursor-pointer"
                          >
                            <X className="h-[10px] w-[10px]" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {selectedSpecialtyIds.length < 3 && (
                  <SearchSelect
                    placeholder="Rechercher une spécialité…"
                    value=""
                    onChange={(val) => {
                      if (val && !selectedSpecialtyIds.includes(val)) {
                        setSelectedSpecialtyIds((prev) => [...prev, val]);
                      }
                    }}
                    options={subSpecialties
                      .filter((s) => !selectedSpecialtyIds.includes(s.id))
                      .map((spec) => ({ value: spec.id, label: spec.name }))}
                  />
                )}
              </div>
            )}

            <Input
              id="years_experience"
              name="years_experience"
              label="Années d'expérience"
              type="number"
              min={0}
              max={50}
              defaultValue={profile.years_experience?.toString() || ""}
              placeholder="ex : 5"
            />

            {/* Skills tags */}
            <div className="space-y-[6px]">
              <label className="block text-[13px] font-medium text-text-secondary">
                Compétences <span className="text-text-muted font-normal">({skills.length}/5)</span>
              </label>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-[6px] mb-[6px]">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-[4px] rounded-md px-[8px] py-[3px] text-[12px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="hover:text-primary-700 cursor-pointer"
                      >
                        <X className="h-[10px] w-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {skills.length < 5 && (
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Taper + Entrée pour ajouter"
                  className="w-full rounded-lg border border-border-default bg-bg-elevated px-[12px] py-[9px] text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
                />
              )}
            </div>

            <Input
              id="daily_rate"
              name="daily_rate"
              label="Tarif journalier"
              defaultValue={profile.daily_rate || ""}
              placeholder="ex : 400-600€/jour"
            />

            <div className="grid grid-cols-2 gap-[12px]">
              <SearchSelect
                label="Pays"
                placeholder="Rechercher un pays…"
                value={countryCode}
                onChange={(val) => setCountryCode(val)}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name, icon: <span>{c.flag}</span> }))}
              />
              <Input
                id="location"
                name="location"
                label="Ville"
                defaultValue={profile.location || ""}
                placeholder="ex : Paris"
              />
            </div>
          </div>

          <div className="h-px bg-border-subtle" />

          {/* Bio */}
          <div className="space-y-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">Bio</p>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio || ""}
              placeholder="Présentez-vous en quelques mots : votre parcours, votre expertise..."
              rows={4}
            />
          </div>

          <div className="h-px bg-border-subtle" />

          {/* Web */}
          <div className="space-y-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">Web</p>
            <Input
              id="website"
              name="website"
              label="Site web"
              type="url"
              defaultValue={profile.website || ""}
              placeholder="https://monsite.com"
            />
          </div>

          <div className="h-px bg-border-subtle" />

          {/* Availability */}
          <div className="space-y-[12px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">Disponibilité</p>
            <div className="grid grid-cols-2 gap-[8px]">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvailability(opt.value)}
                  className={cn(
                    "flex items-center justify-center gap-[6px] px-[12px] py-[10px] rounded-lg border-2 text-[13px] font-medium cursor-pointer transition-all",
                    availability === opt.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-border-default hover:border-border-strong"
                  )}
                >
                  <span className={cn("h-[8px] w-[8px] rounded-full", opt.dot)} />
                  <span className={availability === opt.value ? opt.color : "text-text-secondary"}>
                    {opt.shortLabel || opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-[8px] pt-[8px]">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
