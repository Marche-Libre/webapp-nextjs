"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function ConnexionPage() {
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

    const supabase = createClient();
    const { error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/tableau-de-bord");
    router.refresh();
  };

  return (
    <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-base-300 animate-[slide-up_0.25s_ease-out]">
      <h1 className="text-xl font-bold text-base-content tracking-tight text-center">
        Content de vous revoir
      </h1>
      <p className="text-sm text-base-content/45 text-center mt-1.5 mb-6">
        Connectez-vous à votre espace
      </p>

      <OAuthButtons />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-300" />
        <span className="text-xs text-base-content/30 uppercase">ou</span>
        <div className="flex-1 h-px bg-base-300" />
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-error/10 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" name="email" type="email" label="E-mail" placeholder="marie@exemple.fr" required />
        <Input id="password" name="password" type="password" label="Mot de passe" placeholder="Votre mot de passe" required />
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-base-content/40">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-accent hover:text-accent/80 font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
