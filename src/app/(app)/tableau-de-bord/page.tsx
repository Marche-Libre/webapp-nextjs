import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, Users, MessageCircle } from "lucide-react";
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
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  const [
    { count: postsCount },
    { count: membresCount },
  ] = await Promise.all([
    supabase
      .from("forum_posts")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  const { data: recentPosts } = await supabase
    .from("forum_posts")
    .select("id, title, created_at, reply_count, author:profiles!forum_posts_author_id_fkey(x_handle), category:forum_categories(name, slug, color)")
    .order("created_at", { ascending: false })
    .limit(5);

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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        <StatCard
          icon={<MessagesSquare className="h-5 w-5 text-primary-600" />}
          label="Posts sur le forum"
          value={postsCount ?? 0}
        />
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

      {/* Recent forum posts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Derniers posts du forum</CardTitle>
          <Link
            href="/forum"
            className="text-[13px] text-primary-600 hover:underline font-medium"
          >
            Tout voir
          </Link>
        </CardHeader>
        {recentPosts && recentPosts.length > 0 ? (
          <div className="space-y-[4px]">
            {recentPosts.map((p) => {
              const category = p.category as unknown as { name: string; slug: string; color: string } | null;
              const author = p.author as unknown as { x_handle: string } | null;
              return (
                <Link
                  key={p.id}
                  href={`/forum/posts/${p.id}`}
                  className="flex items-center justify-between p-[12px] rounded-lg hover:bg-bg-surface transition-colors duration-150"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {p.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      @{author?.x_handle} · {p.reply_count} réponse{p.reply_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {category && (
                    <Badge variant="primary">{category.name}</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Aucun post sur le forum pour le moment.
          </p>
        )}
      </Card>
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
