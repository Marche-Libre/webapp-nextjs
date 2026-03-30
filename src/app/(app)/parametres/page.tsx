"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "compte", label: "Compte" },
  { id: "securite", label: "Sécurité" },
];

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState("compte");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Mot de passe mis à jour avec succès.");
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="max-w-3xl space-y-[24px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Paramètres
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Gérez votre compte et votre sécurité
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-[4px] bg-bg-base border border-border-default rounded-lg p-[4px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-[16px] py-[8px] text-[13px] font-medium rounded-md transition-all duration-150 cursor-pointer",
              activeTab === tab.id
                ? "bg-bg-elevated text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "compte" && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display tracking-[-0.02em]">Informations du compte</CardTitle>
          </CardHeader>
          <p className="text-sm text-text-secondary">
            Pour modifier vos informations professionnelles, rendez-vous sur{" "}
            <a href="/profil" className="text-primary-600 hover:underline">
              votre profil
            </a>
            .
          </p>
          <div className="mt-[24px] pt-[24px] border-t border-border-default">
            <h4 className="text-sm font-semibold text-error mb-[8px]">
              Zone sensible
            </h4>
            <p className="text-sm text-text-muted mb-[12px]">
              La suppression du compte est définitive et irréversible.
            </p>
            <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
              Supprimer mon compte
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "securite" && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display tracking-[-0.02em]">Modifier le mot de passe</CardTitle>
          </CardHeader>

          {message && (
            <div
              className={cn(
                "mb-[16px] p-[12px] rounded-lg text-sm border",
                message.includes("succès")
                  ? "bg-success-bg border-success/20 text-success"
                  : "bg-error-bg border-error/20 text-error"
              )}
            >
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-[16px]">
            <Input
              id="new_password"
              name="new_password"
              type="password"
              label="Nouveau mot de passe"
              placeholder="6 caractères minimum"
              minLength={6}
              required
            />
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              label="Confirmer le mot de passe"
              placeholder="Répétez le mot de passe"
              minLength={6}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour…" : "Mettre à jour"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
