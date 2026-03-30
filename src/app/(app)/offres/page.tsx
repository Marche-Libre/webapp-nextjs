import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Banknote } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const contractLabels: Record<string, string> = {
  freelance: "Freelance",
  cdi: "CDI",
  cdd: "CDD",
  mission: "Mission",
  stage: "Stage",
};

export default async function OffresPage() {
  const supabase = await createClient();

  const { data: offres } = await supabase
    .from("offres_emploi")
    .select("*, author:profiles(full_name, specialty, avatar_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
            Offres d&apos;emploi
          </h1>
          <p className="text-sm text-text-secondary mt-[4px]">
            Missions, postes et opportunités du réseau
          </p>
        </div>
        <Link href="/offres/nouvelle">
          <Button>
            <Plus className="h-4 w-4" />
            Publier une offre
          </Button>
        </Link>
      </div>

      {offres && offres.length > 0 ? (
        <div className="space-y-[12px]">
          {offres.map((offre) => (
            <Link key={offre.id} href={`/offres/${offre.id}`}>
              <Card className="hover:border-border-strong transition-all duration-250 shadow-card hover:shadow-card-hover">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[12px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <h3 className="text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                        {offre.title}
                      </h3>
                      {offre.contract_type && (
                        <Badge variant="primary">
                          {contractLabels[offre.contract_type] ||
                            offre.contract_type}
                        </Badge>
                      )}
                    </div>
                    {offre.company_name && (
                      <p className="text-sm text-text-muted mb-[4px]">
                        {offre.company_name}
                      </p>
                    )}
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {offre.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-[12px] text-xs text-text-muted sm:flex-col sm:items-end sm:gap-1.5">
                    {offre.location && (
                      <span className="flex items-center gap-[4px]">
                        <MapPin className="h-3 w-3" />
                        {offre.location}
                      </span>
                    )}
                    {offre.salary_range && (
                      <span className="flex items-center gap-[4px]">
                        <Banknote className="h-3 w-3" />
                        {offre.salary_range}
                      </span>
                    )}
                    <span className="flex items-center gap-[4px]">
                      <Calendar className="h-3 w-3" />
                      {formatDate(offre.created_at)}
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
            Aucune offre publiée pour le moment.
          </p>
          <Link href="/offres/nouvelle">
            <Button>
              <Plus className="h-4 w-4" />
              Publier la première offre
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
