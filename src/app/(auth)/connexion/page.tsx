"use client";

import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function ConnexionPage() {
  return (
    <div className="max-w-[400px] mx-auto bg-base-100 rounded-2xl p-8 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Retour
      </Link>
      <h1 className="text-xl font-bold text-base-content tracking-tight text-center">
        Content de vous revoir
      </h1>
      <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
        Connectez-vous à votre espace
      </p>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-base-content/40">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-accent hover:text-accent/80 font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
