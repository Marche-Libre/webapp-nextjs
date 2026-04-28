import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
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
  if (profile.status !== "approved") redirect("/en-attente");
  if (profile.onboarding_completed) redirect("/chat");

  // Fetch specialties grouped by category
  const { data: specialtyCategories } = await supabase
    .from("specialty_categories")
    .select("*, specialties(*)")
    .order("sort_order", { ascending: true });

  // Count approved members for badge
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // Fetch sponsor info if applicable
  const sponsor = profile.sponsored_by
    ? (
        await supabase
          .from("profiles")
          .select("x_handle, full_name, avatar_url")
          .eq("id", profile.sponsored_by)
          .single()
      ).data
    : null;

  // Fetch a few members for discovery (will be filtered client-side based on user's search)
  const { data: members } = await supabase
    .from("profiles")
    .select("id, x_handle, full_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio")
    .eq("status", "approved")
    .neq("id", user.id)
    .limit(50);

  // Fetch countries from DB (city search is now API-driven)
  const { data: countries } = await supabase
    .from("countries")
    .select("id, name, flag, code, is_francophone")
    .order("is_francophone", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="min-h-dvh bg-base-200 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl">
        <OnboardingWizard
          profile={profile}
          specialtyCategories={specialtyCategories ?? []}
          memberCount={memberCount ?? 0}
          sponsor={sponsor}
          members={members ?? []}
          countries={countries ?? []}
        />
      </div>
    </div>
  );
}
