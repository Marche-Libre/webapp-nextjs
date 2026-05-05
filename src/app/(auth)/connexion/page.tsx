"use client";

import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function ConnexionPage() {
  return (
    <div className="animate-[slide-up_0.25s_ease-out]">
      <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
        Content de vous revoir
      </h1>
      <p className="text-sm text-base-content/45 mt-2 mb-8">
        Connectez-vous pour accéder à votre réseau
      </p>

      <OAuthButtons />

      <div className="mt-8 pt-6 border-t border-base-content/[0.06]">
        <p className="text-center text-sm text-base-content/40">
          Pas encore membre ?{" "}
          <Link href="/inscription" className="text-accent hover:text-accent/80 font-semibold transition-colors">
            Demander l’accès
          </Link>
        </p>
      </div>
    </div>
  );
}
