"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { XLogo } from "@/components/ui/x-logo";
import { getAuthCallbackUrl } from "@/lib/auth-url";

export function OAuthButtons() {
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleOAuth}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#000000] px-5 py-3.5 text-[15px] font-semibold text-[#ffffff] hover:bg-[#1a1a1a] transition-all disabled:opacity-40 cursor-pointer shadow-lg hover:shadow-xl"
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <XLogo className="w-[18px] h-[18px]" />
      )}
      Continuer avec X
    </button>
  );
}
