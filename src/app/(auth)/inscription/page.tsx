"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XLogo } from "@/components/ui/x-logo";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function InscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const fullName = `${firstName} ${lastName}`.trim();
    const xHandle = (formData.get("x_handle") as string).replace("@", "");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, x_handle: xHandle } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/en-attente");
  };

  return (
    <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Retour
      </Link>
      <h1 className="text-xl font-bold text-base-content tracking-tight text-center">
        Créer votre compte
      </h1>
      <p className="text-sm text-base-content/45 text-center mt-1 mb-5">
        Rejoignez le réseau des professionnels vérifiés
      </p>

      <OAuthButtons />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-300" />
        <span className="text-xs text-base-content/30 uppercase">ou</span>
        <div className="flex-1 h-px bg-base-300" />
      </div>

      {error && (
        <div className="mb-4 p-2.5 rounded-lg bg-error/10 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input id="first_name" name="first_name" label="Prénom" placeholder="Marie" required />
          <Input id="last_name" name="last_name" label="Nom" placeholder="Dupont" required />
        </div>
        <Input id="email" name="email" type="email" label="E-mail" placeholder="marie@exemple.fr" required />
        <Input id="password" name="password" type="password" label="Mot de passe" placeholder="6 caractères minimum" minLength={6} required />
        <Input
          id="x_handle"
          name="x_handle"
          label={<span className="flex items-center gap-1.5">Identifiant <XLogo className="w-3.5 h-3.5" /></span>}
          placeholder="@votre_identifiant"
          required
        />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Création en cours…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-base-content/40">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-accent hover:text-accent/80 font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
