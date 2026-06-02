"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AdminActionResult = Promise<{ success: boolean; error?: string }>;

const CHAT_MEDIA_BUCKET = "medias";

export async function approveUser(
  userId: string
): AdminActionResult {
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
): AdminActionResult {
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

export async function resetUserAdmission(userId: string): AdminActionResult {
  const { supabase, currentUserId, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  if (userId === currentUserId) {
    return {
      success: false,
      error: "Action bloquée : vous ne pouvez pas réinitialiser votre propre admission.",
    };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return { success: false, error: "Profil introuvable" };
  }

  if (targetProfile.status !== "rejected") {
    return {
      success: false,
      error: "Réinitialisation disponible uniquement pour un profil refusé.",
    };
  }

  const { error: requestsError } = await supabase
    .from("sponsorship_requests")
    .update({ status: "rejected" })
    .eq("requester_id", userId)
    .in("status", ["pending", "approved"]);

  if (requestsError) {
    return { success: false, error: requestsError.message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "pending",
      sponsored_by: null,
      sponsor_approved: false,
    })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/en-attente");
  return { success: true };
}

export async function toggleUserAdmin(
  userId: string,
  nextIsAdmin: boolean,
): AdminActionResult {
  const { supabase, currentUserId, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  if (userId === currentUserId) {
    return {
      success: false,
      error: "Action bloquée : vous ne pouvez pas modifier votre propre rôle admin.",
    };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, is_admin, status, onboarding_completed")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return { success: false, error: "Profil introuvable" };
  }

  if (
    targetProfile.is_admin === true &&
    targetProfile.status === "approved" &&
    targetProfile.onboarding_completed === true &&
    nextIsAdmin === false
  ) {
    const lastAdminCheck = await ensureMoreThanOneAdmin(supabase);
    if (lastAdminCheck.error) return lastAdminCheck;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: nextIsAdmin })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserPermanently(userId: string): AdminActionResult {
  const { supabase, currentUserId, error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  if (userId === currentUserId) {
    return {
      success: false,
      error: "Action bloquée : vous ne pouvez pas supprimer votre propre compte.",
    };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, is_admin, status, onboarding_completed")
    .eq("id", userId)
    .single();

  if (targetError || !targetProfile) {
    return { success: false, error: "Profil introuvable" };
  }

  if (
    targetProfile.is_admin === true &&
    targetProfile.status === "approved" &&
    targetProfile.onboarding_completed === true
  ) {
    const lastAdminCheck = await ensureMoreThanOneAdmin(supabase);
    if (lastAdminCheck.error) return lastAdminCheck;
  }

  let adminClient: ReturnType<typeof createAdminClient>;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Configuration Supabase admin invalide",
    };
  }

  await removeUserChatMedia(adminClient, userId);

  const cleanupError = await cleanupBlockingProfileReferences(adminClient, userId);
  if (cleanupError) {
    return { success: false, error: cleanupError };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId, false);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// Chat moderation

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, currentUserId: null, error: "Non authentifié" } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, status, onboarding_completed")
    .eq("id", user.id)
    .single();

  const hasMemberBoundary =
    profile?.status === "approved" && profile.onboarding_completed === true;

  if (!profile?.is_admin || !hasMemberBoundary) {
    return { supabase, currentUserId: user.id, error: "Accès refusé" } as const;
  }

  return { supabase, currentUserId: user.id, error: undefined } as const;
}

async function ensureMoreThanOneAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_admin", true)
    .eq("status", "approved")
    .eq("onboarding_completed", true);

  if (error) {
    return { success: false, error: error.message };
  }

  if ((count ?? 0) <= 1) {
    return {
      success: false,
      error: "Action bloquée : au moins un administrateur doit rester actif.",
    };
  }

  return { success: true };
}

async function removeUserChatMedia(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data: messages } = await adminClient
    .from("messages")
    .select("image_url")
    .eq("author_id", userId)
    .not("image_url", "is", null);

  const mediaPaths = Array.from(
    new Set(
      (messages ?? [])
        .map((message) => message.image_url)
        .filter((path): path is string => Boolean(path)),
    ),
  );

  if (mediaPaths.length === 0) return;

  await adminClient.storage.from(CHAT_MEDIA_BUCKET).remove(mediaPaths);
}

async function cleanupBlockingProfileReferences(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const updates = [
    adminClient
      .from("profiles")
      .update({ sponsored_by: null })
      .eq("sponsored_by", userId),
    adminClient
      .from("channels")
      .update({ created_by: null })
      .eq("created_by", userId),
    adminClient
      .from("invitations")
      .update({ accepted_by: null })
      .eq("accepted_by", userId),
  ];

  const results = await Promise.all(updates);
  const failedResult = results.find((result) => result.error);

  return failedResult?.error?.message ?? null;
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
