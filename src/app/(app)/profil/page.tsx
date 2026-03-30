import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, AtSign, Mail, Phone } from "lucide-react";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");

  return (
    <div className="space-y-[24px] max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Mon profil
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Gérez vos informations professionnelles
        </p>
      </div>

      {/* Profile header card */}
      <Card className="shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[16px]">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="xl"
          />
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-text-primary tracking-[-0.02em]">
              {profile.full_name}
            </h2>
            <p className="text-sm text-text-secondary">
              {profile.specialty || "Professionnel libéral"}
            </p>
            {profile.location && (
              <p className="text-sm text-text-muted flex items-center gap-1.5 mt-[4px]">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </p>
            )}
          </div>
          <Badge variant="success">Vérifié</Badge>
        </div>
      </Card>

      {/* Personal info card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Informations personnelles</CardTitle>
          <ProfileEditForm profile={profile} section="personal" />
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-[24px]">
          <InfoField label="Nom complet" value={profile.full_name} />
          <InfoField
            label="Adresse e-mail"
            value={profile.email}
            icon={<Mail className="h-3.5 w-3.5" />}
          />
          <InfoField
            label="Identifiant X"
            value={`@${profile.x_handle}`}
            icon={<AtSign className="h-3.5 w-3.5" />}
          />
          <InfoField
            label="Téléphone"
            value={profile.phone || "Non renseigné"}
            icon={<Phone className="h-3.5 w-3.5" />}
          />
        </div>
      </Card>

      {/* Specialty & Location */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Spécialité et localisation</CardTitle>
          <ProfileEditForm profile={profile} section="specialty" />
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-[24px]">
          <InfoField
            label="Spécialité"
            value={profile.specialty || "Non renseigné"}
          />
          <InfoField
            label="Localisation"
            value={profile.location || "Non renseigné"}
            icon={<MapPin className="h-3.5 w-3.5" />}
          />
        </div>
      </Card>

      {/* Bio */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Bio</CardTitle>
          <ProfileEditForm profile={profile} section="bio" />
        </CardHeader>
        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
          {profile.bio || "Aucune biographie renseignée."}
        </p>
      </Card>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-[4px]">{label}</p>
      <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
        {icon && <span className="text-text-muted">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
