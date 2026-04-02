import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { MembresContent } from "@/components/membres/membres-content";

const getSpecialtyCategories = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("specialty_categories")
      .select("*, specialties(*)")
      .order("sort_order", { ascending: true });
    return data ?? [];
  },
  ["specialty-categories"],
  { revalidate: 600, tags: ["specialty-categories"] }
);

export default async function MembresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [{ data: membres }, categories] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    getSpecialtyCategories(),
  ]);

  // Extract unique locations for filters
  const locations = [
    ...new Set(
      (membres ?? [])
        .map((m) => m.location)
        .filter((l): l is string => !!l)
    ),
  ].sort();

  return (
    <MembresContent
      membres={membres ?? []}
      categories={categories ?? []}
      locations={locations}
      currentUserId={user.id}
    />
  );
}
