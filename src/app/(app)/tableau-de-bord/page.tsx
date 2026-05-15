import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ProfileCompletionRing } from "@/components/onboarding/profile-completion-ring";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Profile } from "@/lib/types/database";

export default async function TableauDeBordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  const { count: membresCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Bienvenue, @{profile?.x_handle}
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Votre espace MarchéLibre
        </p>
      </div>

      {/* Profile completion */}
      {profile && <ProfileCompletionRing profile={profile as Profile} />}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-[16px]">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary-500" />}
          label="Membres vérifiés"
          value={membresCount ?? 0}
        />
        <StatCard
          icon={<MessageCircle className="h-5 w-5 text-primary-400" />}
          label="Accéder au chat"
          value={0}
          href="/chat"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <Card className="shadow-card">
      <div className="flex items-center gap-[16px]">
        <div className="h-12 w-12 rounded-lg bg-primary-50 border border-border-subtle flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          {href ? (
            <p className="text-sm font-medium text-primary-600">Accéder →</p>
          ) : (
            <p className="text-2xl font-bold text-text-primary tracking-[-0.02em]">
              <AnimatedNumber value={value} />
            </p>
          )}
          <p className="text-[13px] text-text-secondary">{label}</p>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
