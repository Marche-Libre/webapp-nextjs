"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface StatusPollerProps {
  userId: string;
}

export function StatusPoller({ userId }: StatusPollerProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<"approved" | "still-pending" | null>(null);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setResult(null);

    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, sponsor_approved")
        .eq("id", userId)
        .single();

      setChecking(false);

      if (profile?.status === "approved") {
        setResult("approved");
        setTimeout(() => router.push("/forum"), 1500);
        return;
      }

      // Refresh server page data (invitations, etc.)
      router.refresh();
      setResult("still-pending");
      setTimeout(() => setResult(null), 4000);
    } catch {
      setChecking(false);
      setResult("still-pending");
      setTimeout(() => setResult(null), 4000);
    }
  }, [userId, router]);

  if (result === "approved") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-success animate-[slide-up_0.2s_ease-out]">
        <CheckCircle className="h-3 w-3" />
        Compte validé ! Redirection…
      </div>
    );
  }

  if (result === "still-pending") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-base-content/35">
        <Clock className="h-3 w-3" />
        Toujours en attente
      </div>
    );
  }

  return (
    <button
      onClick={checkStatus}
      disabled={checking}
      className="inline-flex items-center gap-1.5 text-xs text-base-content/30 hover:text-base-content/50 transition-colors cursor-pointer disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
      {checking ? "Vérification…" : "Vérifier mon statut"}
    </button>
  );
}
