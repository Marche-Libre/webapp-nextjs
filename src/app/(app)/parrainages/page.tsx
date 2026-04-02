import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ParrainagesTabs } from "@/components/sponsorship/parrainages-tabs";

export default async function ParrainagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");

  // Get invitations sent by this user
  const { data: sentInvitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("inviter_id", user.id)
    .order("created_at", { ascending: false });

  // Get sponsored users (filleuls) — users who accepted our invitation
  const { data: filleuls } = await supabase
    .from("profiles")
    .select("id, full_name, x_handle, avatar_url, status, created_at")
    .eq("sponsored_by", user.id)
    .order("created_at", { ascending: false });

  // Get sponsorship requests where this user is the sponsor
  const { data: receivedRequests } = await supabase
    .from("sponsorship_requests")
    .select("*, requester:profiles!requester_id(x_handle, full_name, avatar_url)")
    .eq("sponsor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-[24px]">
      <ParrainagesTabs
        sentInvitations={sentInvitations || []}
        filleuls={filleuls || []}
        receivedRequests={receivedRequests || []}
        xHandle={profile.x_handle}
        isAdmin={profile.is_admin}
        acceptReferrals={profile.accept_referrals ?? true}
        userId={user.id}
        pendingCount={receivedRequests?.filter((r) => r.status === "pending").length ?? 0}
        totalFilleuls={filleuls?.filter((f) => f.status === "approved").length ?? 0}
      />
    </div>
  );
}
