"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { getAuthCallbackUrl } from "@/lib/auth-url";

function RejoindreContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref")?.replace("@", "") || "";

  const handleSignUp = () => {
    // Store referral handle in cookie so the server-side callback can read it
    if (ref) {
      document.cookie = `ml-referral=${ref};path=/;max-age=3600;SameSite=Lax`;
    }
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo: getAuthCallbackUrl() },
    });
  };

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

        {ref ? (
          <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
            Votre demande d’admission mentionnera l’invitation de{" "}
            <span className="text-accent font-medium">@{ref}</span>
          </p>
        ) : (
          <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
            Club privé en bêta privée, avec admission revue manuellement
          </p>
        )}

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer"
        >
          <XLogo className="w-4 h-4" />
          Continuer avec X
        </button>

        {ref && (
          <p className="text-xs text-accent/60 text-center mt-3 leading-relaxed">
            Ce contexte sera joint à votre demande, sans approbation
            automatique.
          </p>
        )}

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
