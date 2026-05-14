"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ProfileDangerZone() {
  const router = useRouter();

  const handleDeleteAccount = useCallback(async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-error uppercase tracking-[0.06em] mb-[12px]">
        Zone sensible
      </h2>
      <div className="rounded-xl border border-error/20 bg-error-bg/30 p-[16px]">
        <p className="text-[13px] text-text-secondary mb-[12px]">
          La suppression du compte est définitive et irréversible. Toutes vos données seront effacées.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-lg bg-error text-white text-[13px] font-medium hover:bg-error/90 transition-colors cursor-pointer"
        >
          <Trash2 className="h-[14px] w-[14px]" />
          Supprimer mon compte
        </button>
      </div>
    </section>
  );
}
