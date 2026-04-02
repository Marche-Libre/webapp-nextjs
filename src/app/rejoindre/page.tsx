"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-dvh bg-base-200 flex items-center justify-center px-4 py-6">
      <div className="max-w-[400px] w-full bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </Link>

        <h1 className="text-xl font-bold text-base-content tracking-tight text-center">
          Rejoindre MarchéLibre
        </h1>

        {ref ? (
          <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
            Vous avez été invité par <span className="text-accent font-medium">@{ref}</span>
          </p>
        ) : (
          <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
            Le réseau fermé des professionnels libéraux vérifiés
          </p>
        )}

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer"
        >
          <XLogo className="w-4 h-4" />
          S&apos;inscrire avec X
        </button>

        {ref && (
          <p className="text-xs text-accent/60 text-center mt-3 leading-relaxed">
            Votre compte sera automatiquement rattaché à @{ref} comme parrain.
          </p>
        )}

        <p className="text-xs text-base-content/40 text-center mt-4 leading-relaxed max-w-[300px] mx-auto">
          Votre identifiant X est votre identité sur le réseau.
        </p>

        <p className="mt-6 text-center text-sm text-base-content/40">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-accent hover:text-accent/80 font-medium">
            Se connecter
          </Link>
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
