import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle, Clock, CheckCircle, LogOut, XCircle } from "lucide-react";
import Link from "next/link";
import { InvitationCard } from "@/components/sponsorship/invitation-card";
import { WaitingPageClient } from "@/components/sponsorship/waiting-page-client";
import { StatusPoller } from "@/components/sponsorship/status-poller";
import { AdmissionProfileForm } from "@/components/auth/admission-profile-form";
import type { Invitation, SponsorshipRequest } from "@/lib/types/database";

export default async function EnAttentePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, status, onboarding_completed, x_handle, sponsor_approved, first_name, last_name, full_name, specialty_ids, specialty_category_id, location, bio")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[en-attente] profile fetch failed", profileError.message);
    redirect("/connexion");
  }

  if (!profile) redirect("/connexion");

  const xHandle =
    profile.x_handle ||
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username;

  if (profile.status === "rejected") {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-base-content/[0.06]">
            <div className="h-14 w-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-7 w-7 text-error" />
            </div>
            <h1 className="text-xl font-bold text-base-content tracking-tight">
              Votre demande d&apos;acces n&apos;a pas ete retenue
            </h1>
            <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
              {xHandle
                ? `Le compte @${xHandle} n'a pas ete retenu pour la beta fermee.`
                : "Votre compte n'a pas ete retenu pour la beta fermee."}
              <br />
              L&apos;acces aux espaces membres reste indisponible.
            </p>
          </div>

          <div className="px-8 py-4 flex justify-center">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 text-sm text-base-content/40 hover:text-base-content/60 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Retour connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (profile.status === "approved") {
    redirect(profile.onboarding_completed ? "/chat" : "/onboarding");
  }

  const { data: invitations } = profile.x_handle
    ? await supabase
        .from("invitations")
        .select(
          "*, inviter:profiles!inviter_id(x_handle, full_name, avatar_url)",
        )
        .eq("invited_x_handle", profile.x_handle)
        .eq("status", "pending")
    : { data: null };

  const hasInvitations = !!invitations?.length;

  const { data: sponsorshipRequests } = await supabase
    .from("sponsorship_requests")
    .select("*")
    .eq("requester_id", user.id)
    .order("attempt_number", { ascending: false });

  const { data: specialtyCategories, error: specialtyCategoriesError } = await supabase
    .from("specialty_categories")
    .select("*, specialties(*)")
    .order("sort_order", { ascending: true });
  const canShowAdmissionForm =
    !specialtyCategoriesError && !!specialtyCategories?.length;

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl overflow-hidden">
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
                <br />
                Validation manuelle en cours.
                <br />
                L&apos;acces aux espaces membres reste bloque tant que votre demande n&apos;est pas approuvee.
              </p>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-warning" />
              </div>
              <h1 className="text-xl font-bold text-base-content tracking-tight">
                Demande en cours d&apos;examen
              </h1>
              <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
                {xHandle ? (
                  <>
                    Compte X detecte : <span className="text-accent">@{xHandle}</span>.
                    <br />
                  </>
                ) : null}
                Validation manuelle en cours.
                <br />
                L&apos;acces aux espaces membres reste bloque tant que votre demande n&apos;est pas approuvee.
              </p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="space-y-5 px-8 py-6">
          {!hasInvitations && !canShowAdmissionForm ? (
            <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-warning">
                  Formulaire indisponible
                </p>
                <p className="leading-relaxed text-warning/80">
                  Impossible de charger le formulaire pour le moment. Reessayez plus tard.
                </p>
              </div>
            </div>
          ) : null}

          {hasInvitations ? (
            <div className="space-y-2">
              {invitations.map(
                (
                  inv: Invitation & {
                    inviter: {
                      x_handle: string;
                      full_name: string;
                      avatar_url: string | null;
                    };
                  },
                ) => (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    mode="received"
                  />
                ),
              )}
            </div>
          ) : canShowAdmissionForm ? (
            <>
              <AdmissionProfileForm
                profile={profile}
                xHandle={xHandle ?? null}
                specialtyCategories={specialtyCategories}
              />

              {profile.sponsor_approved ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/10 text-sm text-success">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Parrainage confirmé. Un admin finalisera bientôt votre accès.
                </div>
              ) : (
                <WaitingPageClient
                  existingRequests={
                    (sponsorshipRequests as SponsorshipRequest[]) || []
                  }
                  requesterId={user.id}
                />
              )}
            </>
          ) : null}
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
