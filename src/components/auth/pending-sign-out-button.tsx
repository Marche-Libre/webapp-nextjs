"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PendingSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = useCallback(async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/connexion");
    router.refresh();
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm text-base-content/40 transition-colors hover:text-base-content/60 disabled:cursor-wait disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      {pending ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
