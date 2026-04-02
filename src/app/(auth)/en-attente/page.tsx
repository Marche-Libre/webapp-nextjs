import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { InvitationCard } from "@/components/sponsorship/invitation-card";
import type { Invitation } from "@/lib/types/database";

export default async function EnAttentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");

  // If already approved, redirect to dashboard
  if (profile.status === "approved") redirect("/forum");

  // Check for pending invitations for this user's x_handle
  const { data: invitations } = profile.x_handle
    ? await supabase
        .from("invitations")
        .select("*, inviter:profiles!inviter_id(x_handle, full_name, avatar_url)")
        .eq("invited_x_handle", profile.x_handle)
        .eq("status", "pending")
    : { data: null };

  const hasInvitations = invitations && invitations.length > 0;

  return (
    <div className="bg-bg-base rounded-2xl p-[32px] shadow-card text-center animate-[slide-up_0.25s_ease-out]">
      <div className="flex items-center gap-[10px] mb-[32px] justify-center">
        <div className="h-[32px] w-[32px] rounded-lg bg-primary-500 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-bold text-[13px]">ML</span>
        </div>
        <span className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
          MarchéLibre
        </span>
      </div>

      {hasInvitations ? (
        <>
          <div className="h-[64px] w-[64px] rounded-2xl bg-success-bg flex items-center justify-center mx-auto mb-[20px]">
            <CheckCircle className="h-[28px] w-[28px] text-success" />
          </div>
          <h1 className="font-display text-[20px] leading-[28px] font-bold text-text-primary mb-[8px] tracking-[-0.02em]">
            Vous avez une invitation !
          </h1>
          <p className="text-[13px] leading-[20px] text-text-secondary mb-[24px] max-w-[360px] mx-auto">
            Un membre du réseau vous a invité à rejoindre MarchéLibre. Acceptez l&apos;invitation pour poursuivre le processus de validation.
          </p>
          <div className="space-y-[8px] text-left mb-[24px]">
            {invitations.map((inv: Invitation & { inviter: { x_handle: string; full_name: string; avatar_url: string | null } }) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                mode="received"
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="h-[64px] w-[64px] rounded-2xl bg-warning-bg flex items-center justify-center mx-auto mb-[20px]">
            <Clock className="h-[28px] w-[28px] text-warning" />
          </div>
          <h1 className="font-display text-[20px] leading-[28px] font-bold text-text-primary mb-[8px] tracking-[-0.02em]">
            En attente de validation
          </h1>
          <p className="text-[13px] leading-[20px] text-text-secondary mb-[24px] max-w-[360px] mx-auto">
            Votre compte a bien été créé. Pour accéder au réseau, un membre existant doit vous inviter via votre identifiant @{profile.x_handle || "X"}, puis un administrateur finalisera la validation.
          </p>
        </>
      )}

      {profile.sponsor_approved && (
        <div className="mb-[16px] p-[12px] rounded-lg bg-success-bg/50 text-[13px] text-success">
          Votre parrain a approuvé votre inscription. Un administrateur finalisera bientôt la validation.
        </div>
      )}

      <Link href="/connexion" className="text-[13px] leading-[20px] text-primary-600 hover:text-primary-700 font-medium">
        Retour à la connexion
      </Link>
    </div>
  );
}
