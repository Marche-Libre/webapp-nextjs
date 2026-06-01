"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  label: string;
  className: string;
}

export function SignOutButton({ label, className }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[sign-out] failed", error.message);
      setLoading(false);
      return;
    }

    router.replace("/?auth=access");
    router.refresh();
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      <LogOut className="h-3.5 w-3.5" />
      {loading ? "Deconnexion..." : label}
    </button>
  );
}
