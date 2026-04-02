"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/theme-provider";
import { Sun, Moon, LogOut, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ParametresPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [acceptDms, setAcceptDms] = useState(true);
  const [loadingDms, setLoadingDms] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("accept_dms")
        .eq("id", user.id)
        .single();
      if (data) setAcceptDms(data.accept_dms ?? true);
      setLoadingDms(false);
    };
    load();
  }, []);

  const handleToggleDms = async (checked: boolean) => {
    setAcceptDms(checked);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ accept_dms: checked })
      .eq("id", user.id);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-[32px]">
      {/* ─── Thème ─── */}
      <section>
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
          Thème
        </h2>
        <div className="grid sm:grid-cols-2 gap-[12px]">
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-[16px] p-[16px] rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
              theme === "dark"
                ? "border-primary-500 bg-primary-50"
                : "border-border-default hover:border-border-strong"
            )}
          >
            <div className="h-[44px] w-[44px] rounded-xl bg-[#0d0d1a] flex items-center justify-center shrink-0 border border-[#1e293b]">
              <Moon className="h-[20px] w-[20px] text-[#c9a84c]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-text-primary">Sombre</p>
              <p className="text-[12px] text-text-muted">Fond bleu-noir, accent doré</p>
            </div>
          </button>
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-[16px] p-[16px] rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
              theme === "light"
                ? "border-primary-500 bg-primary-50"
                : "border-border-default hover:border-border-strong"
            )}
          >
            <div className="h-[44px] w-[44px] rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0 border border-[#e0e0e4]">
              <Sun className="h-[20px] w-[20px] text-[#6366f1]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-text-primary">Clair</p>
              <p className="text-[12px] text-text-muted">Fond blanc, accent indigo</p>
            </div>
          </button>
        </div>
      </section>

      {/* ─── Confidentialité ─── */}
      <section>
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
          Confidentialité
        </h2>
        <div className="rounded-xl border border-border-default p-[16px]">
          <Toggle
            checked={acceptDms}
            onChange={handleToggleDms}
            disabled={loadingDms}
            label="Accepter les messages privés"
            description="Permettre aux autres membres de vous envoyer des messages directs."
          />
        </div>
      </section>

      {/* ─── Compte ─── */}
      <section>
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
          Compte
        </h2>
        <Card className="shadow-card">
          <p className="text-[13px] text-text-secondary">
            Pour modifier vos informations professionnelles, rendez-vous sur{" "}
            <a href="/profil" className="text-primary-500 hover:underline font-medium">
              votre profil
            </a>
            .
          </p>
        </Card>
      </section>

      {/* ─── Déconnexion ─── */}
      <section>
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
          Session
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-[10px] w-full px-[16px] py-[14px] rounded-xl border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <div className="text-left">
            <p className="text-[14px] font-medium">Se déconnecter</p>
            <p className="text-[12px] text-text-muted">Fermer votre session active</p>
          </div>
        </button>
      </section>

      {/* ─── Zone danger ─── */}
      <section>
        <h2 className="text-[13px] font-semibold text-error uppercase tracking-[0.06em] mb-[12px]">
          Zone sensible
        </h2>
        <div className="rounded-xl border border-error/20 bg-error-bg/30 p-[16px]">
          <p className="text-[13px] text-text-secondary mb-[12px]">
            La suppression du compte est définitive et irréversible. Toutes vos données seront effacées.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-lg bg-error text-white text-[13px] font-medium hover:bg-error/90 transition-colors cursor-pointer"
          >
            <Trash2 className="h-[14px] w-[14px]" />
            Supprimer mon compte
          </button>
        </div>
      </section>
    </div>
  );
}
