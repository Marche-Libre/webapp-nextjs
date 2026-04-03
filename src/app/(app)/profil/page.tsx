import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvailabilityBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Briefcase, Clock } from "lucide-react";
import { ProfileEditAll } from "@/components/profile/profile-edit-all";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { countryFlag, getProfileCompleteness, getSpecialtyDisplay } from "@/lib/profile-utils";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [{ data: profile }, { data: categoriesData }] = await Promise.all([
    supabase.from("profiles").select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility").eq("id", user.id).single(),
    supabase.from("specialty_categories").select("*, specialties(*)").order("sort_order", { ascending: true }),
  ]);

  if (!profile) redirect("/connexion");

  const specDisplay = getSpecialtyDisplay(profile, categoriesData ?? []);

  const { percent, missing } = getProfileCompleteness(profile);
  const skills = profile.skills ?? [];

  return (
    <div className="space-y-[24px]">
      {/* Banner */}
      <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
        <div className="p-[24px]">
          <div className="flex flex-col sm:flex-row gap-[20px]">
            {/* Avatar + identity */}
            <div className="flex items-start gap-[16px] flex-1 min-w-0">
              <Avatar
                src={profile.avatar_url}
                name={profile.x_handle}
                size="xl"
                availability={profile.availability_status}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[10px] flex-wrap">
                  <h2 className="font-display text-xl font-bold text-text-primary tracking-[-0.02em]">
                    @{profile.x_handle}
                  </h2>
                  <Badge variant="success">Vérifié</Badge>
                  <AvailabilityBadge status={profile.availability_status} />
                </div>
                {profile.full_name && (
                  <p className="text-[14px] text-text-secondary mt-[2px]">
                    {profile.full_name}
                  </p>
                )}
                <div className="flex items-center gap-[8px] mt-[8px] flex-wrap">
                  {specDisplay.categoryNames.map((name) => (
                    <Badge key={name} variant="primary">{name}</Badge>
                  ))}
                  {specDisplay.specialtyNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                    >
                      {name}
                    </span>
                  ))}
                  {profile.location && (
                    <span className="text-[13px] text-text-muted flex items-center gap-[4px]">
                      <MapPin className="h-[13px] w-[13px]" />
                      {profile.country_code && <span>{countryFlag(profile.country_code)}</span>}
                      {profile.location}
                    </span>
                  )}
                </div>

                {/* Extra info row */}
                <div className="flex items-center gap-[12px] mt-[6px] flex-wrap">
                  {profile.years_experience != null && (
                    <span className="text-[12px] text-text-muted flex items-center gap-[4px]">
                      <Briefcase className="h-[12px] w-[12px]" />
                      {profile.years_experience} ans d&apos;expérience
                    </span>
                  )}
                  {profile.daily_rate && (
                    <span className="text-[12px] text-text-muted flex items-center gap-[4px]">
                      <Clock className="h-[12px] w-[12px]" />
                      {profile.daily_rate}
                    </span>
                  )}
                </div>

                {/* Skills chips */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-[6px] mt-[8px]">
                    {skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Website */}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[4px] text-[12px] text-primary-500 hover:underline mt-[6px]"
                  >
                    <Globe className="h-[12px] w-[12px]" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* Single edit button */}
            <div className="shrink-0">
              <ProfileEditAll profile={profile} />
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-[16px] text-[14px] text-text-secondary whitespace-pre-wrap leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Completeness bar */}
          {percent < 100 && (
            <div className="mt-[16px] pt-[16px] border-t border-border-subtle">
              <div className="flex items-center justify-between mb-[6px]">
                <span className="text-[12px] font-medium text-text-muted">Profil complété à {percent}%</span>
              </div>
              <div className="h-[4px] rounded-full bg-bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-[6px] mt-[8px]">
                {missing.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-bg-surface text-text-muted border border-border-subtle cursor-default"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coordonnées + Liens */}
      <ProfileTabs profile={profile} />
    </div>
  );
}
