"use server";

import { revalidatePath } from "next/cache";
import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";
import { createClient } from "@/lib/supabase/server";

export async function submitSponsorshipRequest(
  sponsorHandle: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous avec X pour envoyer une demande de parrainage.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: "Impossible de verifier votre profil pour le moment.",
    };
  }

  if (profile.status !== "pending") {
    return {
      success: false,
      message:
        "Une demande de parrainage ne peut etre envoyee que pendant l'attente de validation.",
    };
  }

  const result = await createSponsorshipRequestForHandle(supabase, {
    requesterId: user.id,
    sponsorHandle,
  });

  revalidatePath("/en-attente");

  return {
    success: result.ok,
    message: result.message,
  };
}
