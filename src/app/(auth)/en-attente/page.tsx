import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, XCircle } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WaitingPageClient } from "@/components/sponsorship/waiting-page-client";
import { StatusPoller } from "@/components/sponsorship/status-poller";
import type { SponsorshipRequest } from "@/lib/types/database";

const WAITING_SIGN_OUT_CLASS =
  "inline-flex items-center gap-1.5 text-sm text-base-content/40 hover:text-base-content/60 transition-colors disabled:cursor-wait disabled:opacity-60";

export default async function EnAttentePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, status, x_handle")
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
            <SignOutButton
              label="Retour connexion"
              className={WAITING_SIGN_OUT_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }

  if (profile.status === "approved") {
    redirect("/chat");
  }

  const { data: sponsorshipRequests } = await supabase
    .from("sponsorship_requests")
    .select("*")
    .eq("requester_id", user.id)
    .order("attempt_number", { ascending: false });

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="bg-base-300/50 backdrop-blur-sm rounded-2xl border border-base-content/[0.06] shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center border-b border-base-content/[0.06]">
          <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-7 w-7 text-warning" />
          </div>
          <h1 className="text-xl font-bold text-base-content tracking-tight">
            En attente de parrainage
          </h1>
          <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
            {xHandle ? (
              <>
                Compte X detecte : <span className="text-accent">@{xHandle}</span>.
              </>
            ) : null}
          </p>
        </div>

        <div className="space-y-5 px-8 py-6">
          <WaitingPageClient
            existingRequests={(sponsorshipRequests as SponsorshipRequest[]) || []}
            requesterId={user.id}
          />
        </div>

        <div className="px-8 py-4 border-t border-base-content/[0.06] flex items-center justify-between">
          <StatusPoller userId={user.id} />
          <SignOutButton
            label="Se déconnecter"
            className={WAITING_SIGN_OUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
