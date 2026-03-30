import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Calendar, AtSign } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AnnonceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: annonce } = await supabase
    .from("annonces")
    .select(
      "*, author:profiles(full_name, specialty, avatar_url, x_handle, location)"
    )
    .eq("id", id)
    .single();

  if (!annonce) notFound();

  const author = annonce.author as unknown as {
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
          href="/annonces"
          className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-semibold text-text-secondary tracking-[-0.02em]">
          Retour aux annonces
        </h1>
      </div>

      <Card className="shadow-card">
        <div className="flex items-start justify-between mb-[16px]">
          <h2 className="font-display text-xl font-bold text-text-primary tracking-[-0.02em]">
            {annonce.title}
          </h2>
          {annonce.category && (
            <Badge variant="primary">{annonce.category}</Badge>
          )}
        </div>

        <div className="flex items-center gap-[16px] mb-[24px] text-sm text-text-muted">
          {annonce.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {annonce.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(annonce.created_at)}
          </span>
        </div>

        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
          {annonce.description}
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
