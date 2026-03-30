import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Banknote,
  Building2,
  AtSign,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const contractLabels: Record<string, string> = {
  freelance: "Freelance",
  cdi: "CDI",
  cdd: "CDD",
  mission: "Mission",
  stage: "Stage",
};

export default async function OffreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: offre } = await supabase
    .from("offres_emploi")
    .select(
      "*, author:profiles(full_name, specialty, avatar_url, x_handle, location)"
    )
    .eq("id", id)
    .single();

  if (!offre) notFound();

  const author = offre.author as unknown as {
    full_name: string;
    specialty: string | null;
    avatar_url: string | null;
    x_handle: string;
    location: string | null;
  };

  return (
    <div className="max-w-3xl space-y-[24px]">
      <div className="flex items-center gap-[12px]">
        <Link
          href="/offres"
          className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-semibold text-text-secondary tracking-[-0.02em]">
          Retour aux offres
        </h1>
      </div>

      <Card className="shadow-card">
        <div className="flex items-start justify-between mb-[8px]">
          <h2 className="font-display text-xl font-bold text-text-primary tracking-[-0.02em]">
            {offre.title}
          </h2>
          {offre.contract_type && (
            <Badge variant="primary">
              {contractLabels[offre.contract_type] || offre.contract_type}
            </Badge>
          )}
        </div>

        {offre.company_name && (
          <p className="text-sm text-text-secondary flex items-center gap-1.5 mb-[16px]">
            <Building2 className="h-4 w-4 text-text-muted" />
            {offre.company_name}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-[16px] mb-[24px] text-sm text-text-muted">
          {offre.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {offre.location}
            </span>
          )}
          {offre.salary_range && (
            <span className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4" />
              {offre.salary_range}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(offre.created_at)}
          </span>
        </div>

        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
          {offre.description}
        </p>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Publié par</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-[16px]">
          <Avatar
            src={author?.avatar_url}
            name={author?.full_name || ""}
            size="lg"
          />
          <div>
            <p className="font-semibold text-text-primary">
              {author?.full_name}
            </p>
            <p className="text-sm text-text-secondary">
              {author?.specialty || "Professionnel libéral"}
            </p>
            <p className="text-sm text-text-muted flex items-center gap-[4px] mt-0.5">
              <AtSign className="h-3.5 w-3.5" />
              {author?.x_handle}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
