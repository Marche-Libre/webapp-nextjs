import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MembresContent } from "@/components/membres/membres-content";
import { applyVisibility } from "@/lib/profile-utils";
import type { Profile } from "@/lib/types/database";

type DirectoryMemberProfile = Pick<
  Profile,
  | "id"
  | "x_handle"
  | "full_name"
  | "avatar_url"
  | "availability_status"
  | "specialty_ids"
  | "specialty_category_id"
  | "specialty_category_ids"
  | "location"
  | "country_code"
  | "skills"
  | "bio"
  | "status"
  | "created_at"
>;

const MEMBER_LIST_PROFILE_FIELDS =
  "id,x_handle,full_name,avatar_url,availability_status,specialty_ids,specialty_category_id,specialty_category_ids,location,country_code,skills,bio,status,created_at";

async function fetchDirectoryMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const publicProfiles = await supabase
    .from("profiles_public")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (!publicProfiles.error) {
    return (publicProfiles.data ?? []) as DirectoryMemberProfile[];
  }

  const profiles = await supabase
    .from("profiles")
    .select(MEMBER_LIST_PROFILE_FIELDS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (profiles.data ?? []) as DirectoryMemberProfile[];
}

export default async function MembresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [membres, { data: categories }] = await Promise.all([
    fetchDirectoryMembers(supabase),
    supabase
      .from("specialty_categories")
      .select("*, specialties(*)")
      .order("sort_order", { ascending: true }),
  ]);

  // Normalize legacy visibility preferences without masking public profile fields.
  // Only show members who have at least one specialty selected (profile "filled")
  const visibleMembres = membres
    .filter((m) => {
      const ids = Array.isArray(m.specialty_ids) ? m.specialty_ids : [];
      return ids.length > 0 || m.id === user.id;
    })
    .map((m) => applyVisibility(m, m.id === user.id));

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
