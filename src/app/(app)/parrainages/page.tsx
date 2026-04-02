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
    .select("*")
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

  return (
    <div className="space-y-[24px]">
      <ParrainagesTabs
        sentInvitations={sentInvitations || []}
        filleuls={filleuls || []}
      />
    </div>
  );
}
