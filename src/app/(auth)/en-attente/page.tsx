import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { InvitationCard } from "@/components/sponsorship/invitation-card";
import { WaitingPageClient } from "@/components/sponsorship/waiting-page-client";
import { StatusPoller } from "@/components/sponsorship/status-poller";
import type { Invitation, SponsorshipRequest } from "@/lib/types/database";

export default async function EnAttentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");
  if (profile.status === "approved") redirect("/forum");

  const { data: invitations } = profile.x_handle
    ? await supabase
        .from("invitations")
        .select("*, inviter:profiles!inviter_id(x_handle, full_name, avatar_url)")
        .eq("invited_x_handle", profile.x_handle)
        .eq("status", "pending")
    : { data: null };

  const hasInvitations = invitations && invitations.length > 0;

  const { data: sponsorshipRequests } = await supabase
    .from("sponsorship_requests")
    .select("*")
    .eq("requester_id", user.id)
    .order("attempt_number", { ascending: false });

  const xHandle = profile.x_handle || user.user_metadata?.user_name || user.user_metadata?.preferred_username;

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-base-content/[0.06]">
          {hasInvitations ? (
            <>
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h1 className="text-xl font-bold text-base-content tracking-tight">
                Vous avez une invitation !
              </h1>
              <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
                Acceptez pour poursuivre la validation.
              </p>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-warning" />
              </div>
              <h1 className="text-xl font-bold text-base-content tracking-tight">
                Bienvenue{xHandle ? <>, <span className="text-accent">@{xHandle}</span></> : null}
              </h1>
              <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
                MarchéLibre est un réseau sur invitation.
                <br />
                Pour activer votre compte, il vous faut un parrain.
              </p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {hasInvitations ? (
            <div className="space-y-2">
              {invitations.map((inv: Invitation & { inviter: { x_handle: string; full_name: string; avatar_url: string | null } }) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  mode="received"
                />
              ))}
            </div>
          ) : profile.sponsor_approved ? (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/10 text-sm text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Parrainage confirmé. Un admin finalisera bientôt votre accès.
            </div>
          ) : (
            <WaitingPageClient
              existingRequests={(sponsorshipRequests as SponsorshipRequest[]) || []}
              requesterId={user.id}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-base-content/[0.06] flex items-center justify-between">
          <StatusPoller userId={user.id} />
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 text-sm text-base-content/40 hover:text-base-content/60 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Se déconnecter
          </Link>
        </div>
      </div>
    </div>
  );
}
