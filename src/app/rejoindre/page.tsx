"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useCallback, useMemo, useState } from "react";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import {
  AUTH_ENTRY_PROFILE_SELECT,
  getAuthEntryDestination,
} from "@/lib/auth-entry";
import { X_OAUTH_URL_SESSION_KEY } from "@/lib/auth/x-oauth";
import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";

const ERROR_MESSAGE_DEFAULT =
  "Impossible de démarrer la connexion X. Réessayez dans un instant.";

const getSignInErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGE_DEFAULT;
};

function RejoindreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralHandle = useMemo(
    () => searchParams.get("ref")?.replace("@", "") || "",
    [searchParams],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const admissionIntro = referralHandle ? (
    <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
      Votre demande d’admission mentionnera l’invitation de{" "}
      <span className="text-accent font-medium">@{referralHandle}</span>
    </p>
  ) : (
    <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
      Club privé en bêta privée, avec admission revue manuellement
    </p>
  );
  const referralContext = referralHandle ? (
    <p className="text-xs text-accent/60 text-center mt-3 leading-relaxed">
      Ce contexte sera joint à votre demande, sans approbation automatique.
    </p>
  ) : null;

  const handleSignUp = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const supabase = createClient();

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError && !isAuthSessionMissingError(userError)) {
        throw userError;
      }

      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(AUTH_ENTRY_PROFILE_SELECT)
          .eq("id", userData.user.id)
          .single();

        if (referralHandle && profile?.status !== "approved") {
          const sponsorshipResult = await createSponsorshipRequestForHandle(
            supabase,
            {
              requesterId: userData.user.id,
              sponsorHandle: referralHandle,
            },
          );

          if (!sponsorshipResult.ok) {
            setErrorMessage(sponsorshipResult.message);
            return;
          }
        }

        router.replace(getAuthEntryDestination(profile));
        return;
      }

      // Store referral handle in cookie so the server-side callback can read it
      if (referralHandle) {
        document.cookie = `ml-referral=${referralHandle};path=/;max-age=3600;SameSite=Lax`;
      }

      const { data: signInData, error } = await supabase.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: getAuthCallbackUrl(),
          skipBrowserRedirect: true,
        },
      });

      if (error || !signInData.url) {
        throw error ??
          new Error("Le lien d'authentification n'a pas pu être généré.");
      }

      window.sessionStorage.setItem(X_OAUTH_URL_SESSION_KEY, signInData.url);
      router.replace("/auth/x/continue");
    } catch (requestError) {
      setErrorMessage(getSignInErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [referralHandle, router]);

  return (
    <div className="min-h-dvh bg-base-200 flex items-center justify-center px-4 py-6">
      <div className="max-w-[400px] w-full bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Retour
        </Link>

        <h1 className="text-xl font-bold text-base-content tracking-tight text-center">
          Demander l’accès à MarchéLibre
        </h1>

        {admissionIntro}

        {errorMessage ? (
          <p className="text-sm text-error text-center mb-3" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer disabled:opacity-40"
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <XLogo className="w-4 h-4" />
          )}
          Continuer avec X
        </button>

        {referralContext}

        <p className="text-xs text-base-content/40 text-center mt-4 leading-relaxed max-w-[300px] mx-auto">
          Votre identifiant X démarre la demande d’admission et sert d’identité
          pour la revue manuelle.
        </p>

      </div>
    </div>
  );
}

export default function RejoindrePage() {
  return (
    <Suspense>
      <RejoindreContent />
    </Suspense>
  );
}
