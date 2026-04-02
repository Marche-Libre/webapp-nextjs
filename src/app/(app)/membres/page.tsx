import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MembresContent } from "@/components/membres/membres-content";
import { applyVisibility } from "@/lib/profile-utils";

export default async function MembresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [{ data: membres }, { data: categories }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase
      .from("specialty_categories")
      .select("*, specialties(*)")
      .order("sort_order", { ascending: true }),
  ]);

  // Apply visibility: mask fields for other members
  const visibleMembres = (membres ?? []).map((m) => applyVisibility(m, m.id === user.id));

  // Extract unique locations for filters
  const locations = [
    ...new Set(
      visibleMembres
        .map((m) => m.location)
        .filter((l): l is string => !!l)
    ),
  ].sort();

  return (
    <MembresContent
      membres={visibleMembres}
      categories={categories ?? []}
      locations={locations}
      currentUserId={user.id}
    />
  );
}
