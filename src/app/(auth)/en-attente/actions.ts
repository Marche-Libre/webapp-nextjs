"use server";

import { revalidatePath } from "next/cache";
import type {
  AdmissionActionState,
  AdmissionFormValues,
} from "@/lib/admission-profile-state";
import { createClient } from "@/lib/supabase/server";

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function admissionFormValues(formData: FormData): AdmissionFormValues {
  return {
    displayName: textField(formData, "displayName"),
    firstName: textField(formData, "firstName"),
    lastName: textField(formData, "lastName"),
    specialtyId: textField(formData, "specialtyId"),
    location: textField(formData, "location"),
    bio: textField(formData, "bio"),
  };
}

export async function submitAdmissionProfile(
  _previousState: AdmissionActionState,
  formData: FormData,
): Promise<AdmissionActionState> {
  const values = admissionFormValues(formData);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous avec X pour envoyer votre demande.",
      errors: {},
      values,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "pending") {
    return {
      success: false,
      message: "Cette demande ne peut etre modifiee que pendant l'attente de validation.",
      errors: {},
      values,
    };
  }

  const {
    firstName,
    lastName,
    displayName,
    specialtyId,
    location,
    bio,
  } = values;
  const errors: Record<string, string> = {};

  if (!firstName && !lastName && !displayName) {
    errors.displayName = "Indiquez au moins un prenom, un nom ou un nom d'usage.";
  }

  if (!specialtyId) {
    errors.specialtyId = "Selectionnez le contexte professionnel le plus proche.";
  }

  if (location.length < 2) {
    errors.location = "Indiquez au moins un pays ou une ville.";
  }

  if (bio.length < 10) {
    errors.bio = "Ajoutez quelques mots pour aider l'equipe a comprendre votre demande.";
  }

  if (bio.length > 500) {
    errors.bio = "Limitez ce texte a 500 caracteres maximum.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Corrigez les champs indiques avant l'envoi.",
      errors,
      values,
    };
  }

  let specialtyCategoryId: string | null = null;
  let specialtyIds: string[] = [];

  if (specialtyId.startsWith("cat:")) {
    specialtyCategoryId = specialtyId.replace("cat:", "").trim();

    if (!specialtyCategoryId) {
      return {
        success: false,
        message: "Le contexte professionnel selectionne est introuvable.",
        errors: { specialtyId: "Selectionnez une option valide." },
        values,
      };
    }

    const { data: specialtyCategory } = await supabase
      .from("specialty_categories")
      .select("id")
      .eq("id", specialtyCategoryId)
      .single();

    if (!specialtyCategory) {
      return {
        success: false,
        message: "Le contexte professionnel selectionne est introuvable.",
        errors: { specialtyId: "Selectionnez une option valide." },
        values,
      };
    }
  } else {
    const { data: specialty } = await supabase
      .from("specialties")
      .select("id, category_id")
      .eq("id", specialtyId)
      .single();

    if (!specialty) {
      return {
        success: false,
        message: "Le contexte professionnel selectionne est introuvable.",
        errors: { specialtyId: "Selectionnez une option valide." },
        values,
      };
    }

    specialtyCategoryId = specialty.category_id;
    specialtyIds = [specialty.id];
  }

  const fullName = displayName || [firstName, lastName].filter(Boolean).join(" ");
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: fullName,
      specialty_ids: specialtyIds,
      specialty_category_id: specialtyCategoryId,
      location,
      bio,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: "Impossible d'enregistrer la demande pour le moment. Reessayez dans quelques instants.",
      errors: {},
      values,
    };
  }

  revalidatePath("/en-attente");

  return {
    success: true,
    message: "Demande envoyee. Un administrateur va l'examiner manuellement.",
    errors: {},
    values,
  };
}
