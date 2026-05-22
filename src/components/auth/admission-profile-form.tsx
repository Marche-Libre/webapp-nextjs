"use client";

import { useActionState } from "react";
import { submitAdmissionProfile } from "@/app/(auth)/en-attente/actions";
import { Button } from "@/components/ui/button";
import { XLogo } from "@/components/ui/x-logo";
import { initialAdmissionActionState } from "@/lib/admission-profile-state";

type AdmissionProfile = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  specialty_ids: string[] | null;
  specialty_category_id: string | null;
  location: string | null;
  bio: string | null;
  x_handle: string | null;
};

type SpecialtyCategoryWithSpecialties = {
  id: string;
  name: string;
  specialties?: { id: string; name: string }[] | null;
};

type AdmissionProfileFormProps = {
  profile: AdmissionProfile;
  xHandle: string | null;
  specialtyCategories: SpecialtyCategoryWithSpecialties[];
};

export function AdmissionProfileForm({
  profile,
  xHandle,
  specialtyCategories,
}: AdmissionProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    submitAdmissionProfile,
    initialAdmissionActionState,
  );
  const selectedSpecialtyId = profile.specialty_ids?.[0] ?? "";
  const selectedCategoryId = profile.specialty_category_id
    ? `cat:${profile.specialty_category_id}`
    : "";
  const profileSpecialtyValue = selectedSpecialtyId || selectedCategoryId;
  const errors = state?.errors ?? {};
  const message = state?.message ?? "";
  const success = state?.success ?? false;
  const submittedValues = state?.values;
  const displayNameValue = submittedValues?.displayName ?? profile.full_name ?? "";
  const firstNameValue = submittedValues?.firstName ?? profile.first_name ?? "";
  const lastNameValue = submittedValues?.lastName ?? profile.last_name ?? "";
  const specialtyValue = submittedValues?.specialtyId ?? profileSpecialtyValue;
  const locationValue = submittedValues?.location ?? profile.location ?? "";
  const bioValue = submittedValues?.bio ?? profile.bio ?? "";
  const formKey = submittedValues
    ? [
        displayNameValue,
        firstNameValue,
        lastNameValue,
        specialtyValue,
        locationValue,
        bioValue,
      ].join("|")
    : "profile";
  const specialtyCategoryOptions = specialtyCategories.map(
    renderSpecialtyCategoryOptions,
  );

  return (
    <section className="space-y-5 rounded-2xl border border-base-content/[0.08] bg-base-100/60 p-4 text-left">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {"Demande d'acces"}
        </p>
        <h2 className="text-lg font-bold text-base-content">
          Quelques informations pour la Validation manuelle
        </h2>
        <p className="text-sm leading-relaxed text-base-content/55">
          {"Votre connexion X lance une demande d'admission. Ces informations aident l'equipe a verifier votre profil et ne donnent pas un acces immediat au reseau."}
        </p>
      </div>

      <div className="rounded-xl border border-base-content/[0.08] bg-base-content/[0.02] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <XLogo className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-base-content/45">
              Compte X verifie
            </p>
            <p className="text-sm font-semibold text-base-content">
              {xHandle ? `@${xHandle}` : "Identite X recue"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-base-content/40">
          {"Identifiant X non modifiable ici. Il sert au controle d'identite, pas a changer vos droits d'acces."}
        </p>
      </div>

      <form key={formKey} action={formAction} className="space-y-4">
        <label className="space-y-1.5 text-sm font-medium text-base-content/70">
          Nom d&apos;usage
          <input
            name="displayName"
            defaultValue={displayNameValue}
            className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors focus:border-accent"
            placeholder="Votre nom affiche"
          />
        </label>
        {errors.displayName ? (
          <p className="text-xs text-error">{errors.displayName}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-base-content/70">
            Prenom
            <input
              name="firstName"
              defaultValue={firstNameValue}
              className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors focus:border-accent"
              placeholder="Votre prenom"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-base-content/70">
            Nom
            <input
              name="lastName"
              defaultValue={lastNameValue}
              className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors focus:border-accent"
              placeholder="Votre nom"
            />
          </label>
        </div>

        <label className="space-y-1.5 text-sm font-medium text-base-content/70">
          Contexte professionnel
          <select
            name="specialtyId"
            defaultValue={specialtyValue}
            className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors focus:border-accent"
          >
            <option value="">Selectionner un metier ou domaine</option>
            {specialtyCategoryOptions}
          </select>
        </label>
        {errors.specialtyId ? (
          <p className="text-xs text-error">{errors.specialtyId}</p>
        ) : null}

        <label className="space-y-1.5 text-sm font-medium text-base-content/70">
          Pays ou ville
          <input
            name="location"
            defaultValue={locationValue}
            className="w-full rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors focus:border-accent"
            placeholder="Ex : Paris, France"
          />
        </label>
        {errors.location ? (
          <p className="text-xs text-error">{errors.location}</p>
        ) : null}

        <label className="space-y-1.5 text-sm font-medium text-base-content/70">
          Pourquoi souhaitez-vous rejoindre MarchéLibre ?
          <textarea
            name="bio"
            defaultValue={bioValue}
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-base-content/[0.08] bg-base-100 px-3 py-2 text-sm leading-relaxed text-base-content outline-none transition-colors focus:border-accent"
            placeholder="Quelques mots sur votre activite, votre contexte, ou ce que l'equipe doit comprendre."
          />
        </label>
        {errors.bio ? (
          <p className="text-xs text-error">{errors.bio}</p>
        ) : null}

        {message ? (
          <p
            className={`text-xs ${success ? "text-success" : "text-error"}`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={pending} className="w-full">
          {pending ? "Envoi en cours..." : "Envoyer ma demande"}
        </Button>
      </form>
    </section>
  );
}

const renderSpecialtyCategoryOptions = (
  category: SpecialtyCategoryWithSpecialties,
) => {
  const specialtyOptions = (category.specialties ?? []).map(
    renderSpecialtyOption,
  );

  return (
    <optgroup key={category.id} label={category.name}>
      <option value={`cat:${category.id}`}>{category.name}</option>
      {specialtyOptions}
    </optgroup>
  );
};

const renderSpecialtyOption = (specialty: { id: string; name: string }) => {
  return (
    <option key={specialty.id} value={specialty.id}>
      {specialty.name}
    </option>
  );
};
