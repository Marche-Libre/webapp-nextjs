import { createClient } from "@/lib/supabase/server";
import { MembresContent } from "@/components/membres/membres-content";

export default async function MembresPage() {
  const supabase = await createClient();

  const { data: membres } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Extract unique specialties and locations for filters
  const specialties = [
    ...new Set(
      (membres ?? [])
        .map((m) => m.specialty)
        .filter((s): s is string => !!s)
    ),
  ].sort();

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
      specialties={specialties}
      locations={locations}
    />
  );
}
