import type { SupabaseClient } from "@supabase/supabase-js";
import { notifySponsorRequest } from "@/lib/notifications";

const MAX_SPONSORSHIP_ATTEMPTS = 2;

type SponsorProfile = {
  id: string;
  x_handle: string;
};

type ExistingSponsorshipRequest = {
  id: string;
  sponsor_handle: string;
  sponsor_id: string | null;
  status: "pending" | "approved" | "rejected";
  attempt_number: number;
};

type CreateSponsorshipRequestSuccess = {
  ok: true;
  status: "created" | "already_pending" | "already_approved";
  message: string;
  sponsorHandle?: string;
  sponsorId?: string;
};

type CreateSponsorshipRequestFailure = {
  ok: false;
  status:
    | "insert_failed"
    | "max_attempts"
    | "missing_handle"
    | "request_lookup_failed"
    | "self_sponsor"
    | "sponsor_lookup_failed"
    | "sponsor_not_found";
  message: string;
  technicalMessage?: string;
};

export type CreateSponsorshipRequestResult =
  | CreateSponsorshipRequestFailure
  | CreateSponsorshipRequestSuccess;

export function normalizeSponsorHandle(handle: string) {
  return handle.replace(/^@+/, "").trim().toLowerCase();
}

function getExistingActiveRequest(
  requests: ExistingSponsorshipRequest[],
) {
  return requests.find((request) => request.status !== "rejected") ?? null;
}

function getNextAttemptNumber(requests: ExistingSponsorshipRequest[]) {
  const highestAttempt = requests.reduce((currentHighest, request) => {
    return Math.max(currentHighest, request.attempt_number);
  }, 0);

  return highestAttempt + 1;
}

export async function createSponsorshipRequestForHandle(
  supabase: SupabaseClient,
  params: {
    requesterId: string;
    sponsorHandle: string;
  },
): Promise<CreateSponsorshipRequestResult> {
  const sponsorHandle = normalizeSponsorHandle(params.sponsorHandle);

  if (!sponsorHandle) {
    return {
      ok: false,
      status: "missing_handle",
      message: "Veuillez saisir un identifiant de parrain.",
    };
  }

  const { data: sponsor, error: sponsorError } = await supabase
    .from("profiles")
    .select("id, x_handle")
    .eq("status", "approved")
    .ilike("x_handle", sponsorHandle)
    .limit(1)
    .maybeSingle();

  if (sponsorError) {
    return {
      ok: false,
      status: "sponsor_lookup_failed",
      message: "Impossible de verifier ce parrain pour le moment.",
      technicalMessage: sponsorError.message,
    };
  }

  if (!sponsor) {
    return {
      ok: false,
      status: "sponsor_not_found",
      message:
        "Impossible de creer une demande pour cet identifiant. Verifiez l'identifiant X du parrain.",
    };
  }

  const sponsorProfile = sponsor as SponsorProfile;

  if (sponsorProfile.id === params.requesterId) {
    return {
      ok: false,
      status: "self_sponsor",
      message: "Vous ne pouvez pas vous parrainer vous-meme.",
    };
  }

  const { data: existingRequests, error: existingRequestsError } = await supabase
    .from("sponsorship_requests")
    .select("id, sponsor_handle, sponsor_id, status, attempt_number")
    .eq("requester_id", params.requesterId)
    .order("attempt_number", { ascending: false });

  if (existingRequestsError) {
    return {
      ok: false,
      status: "request_lookup_failed",
      message: "Impossible de verifier vos demandes de parrainage existantes.",
      technicalMessage: existingRequestsError.message,
    };
  }

  const requests = (existingRequests ?? []) as ExistingSponsorshipRequest[];
  const activeRequest = getExistingActiveRequest(requests);

  if (activeRequest?.status === "pending") {
    return {
      ok: true,
      status: "already_pending",
      message: "Une demande de parrainage est deja en attente.",
      sponsorHandle: activeRequest.sponsor_handle,
      sponsorId: activeRequest.sponsor_id ?? undefined,
    };
  }

  if (activeRequest?.status === "approved") {
    return {
      ok: true,
      status: "already_approved",
      message: "Votre parrainage est deja confirme.",
      sponsorHandle: activeRequest.sponsor_handle,
      sponsorId: activeRequest.sponsor_id ?? undefined,
    };
  }

  const nextAttempt = getNextAttemptNumber(requests);

  if (nextAttempt > MAX_SPONSORSHIP_ATTEMPTS) {
    return {
      ok: false,
      status: "max_attempts",
      message:
        "Vous avez deja utilise vos deux tentatives de parrainage. Un administrateur examinera votre demande.",
    };
  }

  const { error: insertError } = await supabase
    .from("sponsorship_requests")
    .insert({
      requester_id: params.requesterId,
      sponsor_handle: sponsorProfile.x_handle || sponsorHandle,
      sponsor_id: sponsorProfile.id,
      status: "pending",
      attempt_number: nextAttempt,
    });

  if (insertError) {
    return {
      ok: false,
      status: "insert_failed",
      message: "Erreur lors de l'envoi de la demande.",
      technicalMessage: insertError.message,
    };
  }

  await notifySponsorRequest(supabase, {
    sponsorId: sponsorProfile.id,
    requesterId: params.requesterId,
  });

  return {
    ok: true,
    status: "created",
    message: "Demande de parrainage envoyee.",
    sponsorHandle: sponsorProfile.x_handle || sponsorHandle,
    sponsorId: sponsorProfile.id,
  };
}
