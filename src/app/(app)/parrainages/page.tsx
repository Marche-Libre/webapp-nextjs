import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ParrainagesTabs } from "@/components/sponsorship/parrainages-tabs";
import type {
  SponsorRequesterProfile,
  SponsorshipRequest,
} from "@/lib/types/database";

type RequesterSummary = {
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
};

type ReceivedRequest = Omit<SponsorshipRequest, "requester"> & {
  requester: RequesterSummary;
};

type FilleulSummary = {
  status: string;
};

const UNKNOWN_REQUESTER: RequesterSummary = {
  x_handle: "",
  full_name: "",
  avatar_url: null,
};

function mapRequesterProfile(profile: SponsorRequesterProfile): [string, RequesterSummary] {
  return [
    profile.sponsorship_request_id,
    {
      x_handle: profile.x_handle ?? "",
      full_name: profile.full_name ?? "",
      avatar_url: profile.avatar_url,
    },
  ];
}

function attachRequesterProfiles(
  requests: SponsorshipRequest[],
  requesterProfiles: SponsorRequesterProfile[],
) {
  const requesterProfilesByRequestId = new Map(requesterProfiles.map(mapRequesterProfile));

  return requests.map((request) => ({
    ...request,
    requester: requesterProfilesByRequestId.get(request.id) ?? UNKNOWN_REQUESTER,
  }));
}

function countPendingRequests(requests: ReceivedRequest[]) {
  return requests.filter((request) => request.status === "pending").length;
}

function countApprovedFilleuls(filleuls: FilleulSummary[]) {
  return filleuls.filter((filleul) => filleul.status === "approved").length;
}

export default async function ParrainagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");

  // Get sponsored users (filleuls) — users who accepted our invitation
  const { data: filleuls } = await supabase
    .from("profiles")
    .select("id, full_name, x_handle, avatar_url, status, created_at")
    .eq("sponsored_by", user.id)
    .order("created_at", { ascending: false });

  // Get sponsorship requests where this user is the sponsor
  const { data: receivedRequests } = await supabase
    .from("sponsorship_requests")
    .select(
      "id, requester_id, sponsor_handle, sponsor_id, status, attempt_number, created_at, updated_at",
    )
    .eq("sponsor_id", user.id)
    .order("created_at", { ascending: false });

  const { data: requesterProfiles, error: requesterProfilesError } = await supabase.rpc(
    "get_sponsor_requester_profiles",
  );

  if (requesterProfilesError) {
    console.error("Failed to load sponsor requester profiles", requesterProfilesError);
  }

  const receivedRequestsWithRequesters = attachRequesterProfiles(
    (receivedRequests || []) as SponsorshipRequest[],
    (requesterProfiles || []) as SponsorRequesterProfile[],
  );
  const safeFilleuls = filleuls || [];
  const pendingCount = countPendingRequests(receivedRequestsWithRequesters);
  const totalFilleuls = countApprovedFilleuls(safeFilleuls);

  return (
    <div className="space-y-[24px]">
      <ParrainagesTabs
        filleuls={safeFilleuls}
        receivedRequests={receivedRequestsWithRequesters}
        xHandle={profile.x_handle}
        isAdmin={profile.is_admin}
        pendingCount={pendingCount}
        totalFilleuls={totalFilleuls}
      />
    </div>
  );
}
