import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Briefcase, Users } from "lucide-react";
import Link from "next/link";

export default async function TableauDeBordPage() {
  const supabase = await createClient();

  const [
    { count: annoncesCount },
    { count: offresCount },
    { count: membresCount },
  ] = await Promise.all([
    supabase
      .from("annonces")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("offres_emploi")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  const { data: recentAnnonces } = await supabase
    .from("annonces")
    .select("id, title, category, created_at, author:profiles(full_name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentOffres } = await supabase
    .from("offres_emploi")
    .select(
      "id, title, contract_type, location, created_at, author:profiles(full_name)"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Tableau de bord
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Bienvenue sur votre espace MarchéLibre
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        <StatCard
          icon={<Megaphone className="h-5 w-5 text-primary-600" />}
          label="Annonces actives"
          value={annoncesCount ?? 0}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-primary-400" />}
          label="Offres d'emploi"
          value={offresCount ?? 0}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-primary-500" />}
          label="Membres vérifiés"
          value={membresCount ?? 0}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-[24px]">
        {/* Recent annonces */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display tracking-[-0.02em]">Dernières annonces</CardTitle>
            <Link
              href="/annonces"
              className="text-[13px] text-primary-600 hover:underline font-medium"
            >
              Tout voir
            </Link>
          </CardHeader>
          {recentAnnonces && recentAnnonces.length > 0 ? (
            <div className="space-y-[4px]">
              {recentAnnonces.map((a) => (
                <Link
                  key={a.id}
                  href={`/annonces/${a.id}`}
                  className="flex items-center justify-between p-[12px] rounded-lg hover:bg-bg-surface transition-colors duration-150"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {a.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {
                        (a.author as unknown as { full_name: string })
                          ?.full_name
                      }
                    </p>
                  </div>
                  {a.category && (
                    <Badge variant="primary">{a.category}</Badge>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Aucune annonce publiée pour le moment.
            </p>
          )}
        </Card>

        {/* Recent offres */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display tracking-[-0.02em]">Dernières offres</CardTitle>
            <Link
              href="/offres"
              className="text-[13px] text-primary-600 hover:underline font-medium"
            >
              Tout voir
            </Link>
          </CardHeader>
          {recentOffres && recentOffres.length > 0 ? (
            <div className="space-y-[4px]">
              {recentOffres.map((o) => (
                <Link
                  key={o.id}
                  href={`/offres/${o.id}`}
                  className="flex items-center justify-between p-[12px] rounded-lg hover:bg-bg-surface transition-colors duration-150"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {o.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {
                        (o.author as unknown as { full_name: string })
                          ?.full_name
                      }{" "}
                      {o.location && `· ${o.location}`}
                    </p>
                  </div>
                  {o.contract_type && (
                    <Badge variant="primary">{o.contract_type}</Badge>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Aucune offre publiée pour le moment.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="shadow-card">
      <div className="flex items-center gap-[16px]">
        <div className="h-12 w-12 rounded-lg bg-primary-50 border border-border-subtle flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary tracking-[-0.02em]">
            {value}
          </p>
          <p className="text-[13px] text-text-secondary">{label}</p>
        </div>
      </div>
    </Card>
  );
}
