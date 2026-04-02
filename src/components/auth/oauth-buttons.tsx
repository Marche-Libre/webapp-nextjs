"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { XLogo } from "@/components/ui/x-logo";

export function OAuthButtons() {
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleOAuth}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] transition-all disabled:opacity-40 cursor-pointer"
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <XLogo className="w-4 h-4" />
      )}
      Continuer avec X
    </button>
  );
}
