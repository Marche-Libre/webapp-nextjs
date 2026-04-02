import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { MemberProfile } from "@/components/membres/member-profile";
import { applyVisibility } from "@/lib/profile-utils";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Fetch member profile + specialty categories in parallel
  const [{ data: member }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .single(),
    supabase
      .from("specialty_categories")
      .select("*, specialties(*)")
      .order("sort_order", { ascending: true }),
  ]);

  if (!member) notFound();

  // Apply visibility
  const visibleMember = applyVisibility(member, member.id === user.id);

  // Fetch sponsor info if sponsored_by is set
  let sponsor: { x_handle: string } | null = null;
  if (visibleMember.sponsored_by) {
    const { data } = await supabase
      .from("profiles")
      .select("x_handle")
      .eq("id", visibleMember.sponsored_by)
      .single();
    sponsor = data;
  }

  // Fetch recent forum posts by this member (last 5)
  const { data: recentPosts } = await supabase
    .from("forum_posts")
    .select("id, title, reply_count, created_at, category:forum_categories(name, color, slug)")
    .eq("author_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Check if current user has blocked this member
  const { data: blockRecord } = await supabase
    .from("user_blocks")
    .select("blocker_id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", id)
    .maybeSingle();

  return (
    <MemberProfile
      member={visibleMember}
      sponsor={sponsor}
      recentPosts={(recentPosts || []) as any}
      currentUserId={user.id}
      isBlocked={!!blockRecord}
      categories={categoriesData ?? []}
    />
  );
}
