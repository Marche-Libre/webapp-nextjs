"use server";

import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";
import { createClient } from "@/lib/supabase/server";

export async function createReferralSponsorshipRequest(
  sponsorHandle: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Connectez-vous avec X pour joindre ce parrainage à votre demande.",
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

  if (profile.status === "approved") {
    return {
      success: true,
      message: "Votre accès est déjà approuvé.",
    };
  }

  if (profile.status !== "pending") {
    return {
      success: false,
      message: "Cette demande de parrainage n'est plus modifiable.",
    };
  }

  const result = await createSponsorshipRequestForHandle(supabase, {
    requesterId: user.id,
    sponsorHandle,
  });

  return {
    success: result.ok,
    message: result.message,
  };
}
