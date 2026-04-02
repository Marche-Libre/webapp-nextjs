import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ProfileTabs } from "@/components/profile/profile-tabs";

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
    <div className="space-y-[24px]">
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
              @{profile.x_handle}
            </h2>
            <p className="text-sm text-text-secondary">
              {profile.full_name || "Professionnel libéral"}
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

      {/* Tabbed sections */}
      <ProfileTabs profile={profile} />
    </div>
  );
}
