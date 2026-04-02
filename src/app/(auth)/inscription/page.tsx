"use client";

import Link from "next/link";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const handleSignUp = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="max-w-[400px] mx-auto bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
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
      <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
        Le réseau fermé des professionnels libéraux vérifiés
      </p>

      <button
        type="button"
        onClick={handleSignUp}
        className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer"
      >
        <XLogo className="w-4 h-4" />
        S&apos;inscrire avec X
      </button>

      <p className="text-xs text-base-content/40 text-center mt-4 leading-relaxed max-w-[300px] mx-auto">
        Votre identifiant X est votre identité sur le réseau. Un membre existant doit vous inviter pour activer votre compte.
      </p>

      <p className="mt-6 text-center text-sm text-base-content/40">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-accent hover:text-accent/80 font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
