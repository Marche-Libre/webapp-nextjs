"use client";

import Link from "next/link";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";
import { getAuthCallbackUrl } from "@/lib/auth-url";

export default function InscriptionPage() {
  const handleSignUp = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo: getAuthCallbackUrl() },
    });
  };

  return (
    <div className="animate-[slide-up_0.25s_ease-out]">
      <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
        Rejoindre MarchéLibre
      </h1>
      <p className="text-sm text-base-content/45 mt-2 mb-8">
        Le réseau fermé des professionnels libéraux vérifiés
      </p>

      <button
        type="button"
        onClick={handleSignUp}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#000000] px-5 py-3.5 text-[15px] font-semibold text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer shadow-lg hover:shadow-xl"
      >
        <XLogo className="w-[18px] h-[18px]" />
        S&apos;inscrire avec X
      </button>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-accent/[0.04] border border-accent/10 px-4 py-3">
        <Shield className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-base-content/45 leading-relaxed">
          Votre <span className="text-base-content/60 font-medium">@identifiant X</span> est votre identité sur le réseau.
          Un membre existant doit vous parrainer pour activer votre compte.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-base-content/[0.06]">
        <p className="text-center text-sm text-base-content/40">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-accent hover:text-accent/80 font-semibold transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
