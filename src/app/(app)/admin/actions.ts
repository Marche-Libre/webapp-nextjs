"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, sponsored_by, sponsor_approved")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return { success: false, error: "Profil introuvable" };
  }

  if (!targetProfile.sponsored_by || targetProfile.sponsor_approved !== true) {
    return {
      success: false,
      error: "Approbation bloquée : le parrainage doit être confirmé.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", userId);

  if (error) {
    const message = error.message.includes(
      "profile_approval_requires_confirmed_sponsor",
    )
      ? "Approbation bloquée : le parrainage doit être confirmé."
      : error.message;

    return { success: false, error: message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function rejectUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Chat moderation ───

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Non authentifié" } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, status, onboarding_completed")
    .eq("id", user.id)
    .single();

  const hasMemberBoundary =
    profile?.status === "approved" && profile.onboarding_completed === true;

  if (!profile?.is_admin || !hasMemberBoundary) {
    return { supabase, error: "Accès refusé" } as const;
  }

  return { supabase, error: undefined } as const;
}

export async function muteUser(userId: string, durationMinutes: number): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };
  const mutedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  const { error } = await supabase.from("profiles").update({ chat_muted_until: mutedUntil }).eq("id", userId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function unmuteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };
  const { error } = await supabase.from("profiles").update({ chat_muted_until: null }).eq("id", userId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function banFromChat(userId: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };
  const { error } = await supabase.from("profiles").update({ chat_banned: true }).eq("id", userId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function unbanFromChat(userId: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };
  const { error } = await supabase.from("profiles").update({ chat_banned: false }).eq("id", userId);
  return error ? { success: false, error: error.message } : { success: true };
}
