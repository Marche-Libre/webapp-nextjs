import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AnnoncesPage() {
  const supabase = await createClient();

  const { data: annonces } = await supabase
    .from("annonces")
    .select("*, author:profiles(full_name, specialty, avatar_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
            Annonces
          </h1>
          <p className="text-sm text-text-secondary mt-[4px]">
            Parcourez les annonces publiées par la communauté
          </p>
        </div>
        <Link href="/annonces/nouvelle">
          <Button>
            <Plus className="h-4 w-4" />
            Publier une annonce
          </Button>
        </Link>
      </div>

      {annonces && annonces.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {annonces.map((annonce) => (
            <Link key={annonce.id} href={`/annonces/${annonce.id}`}>
              <Card className="hover:border-border-strong transition-all duration-250 h-full shadow-card hover:shadow-card-hover">
                <div className="flex items-start justify-between mb-[12px]">
                  <h3 className="text-[15px] font-semibold text-text-primary line-clamp-2 tracking-[-0.01em]">
                    {annonce.title}
                  </h3>
                  {annonce.category && (
                    <Badge variant="primary" className="shrink-0 ml-[8px]">
                      {annonce.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary line-clamp-3 mb-[16px] leading-relaxed">
                  {annonce.description}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    {
                      (annonce.author as unknown as { full_name: string })
                        ?.full_name
                    }
                  </span>
                  <div className="flex items-center gap-[12px]">
                    {annonce.location && (
                      <span className="flex items-center gap-[4px]">
                        <MapPin className="h-3 w-3" />
                        {annonce.location}
                      </span>
                    )}
                    <span className="flex items-center gap-[4px]">
                      <Calendar className="h-3 w-3" />
                      {formatDate(annonce.created_at)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-[64px] shadow-card">
          <p className="text-text-secondary mb-[16px]">
            Aucune annonce publiée pour le moment.
          </p>
          <Link href="/annonces/nouvelle">
            <Button>
              <Plus className="h-4 w-4" />
              Publier la première annonce
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
