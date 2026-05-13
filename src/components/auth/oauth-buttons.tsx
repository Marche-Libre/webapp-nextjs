"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { XLogo } from "@/components/ui/x-logo";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import {
  AUTH_ENTRY_PROFILE_SELECT,
  getAuthEntryDestination,
} from "@/lib/auth-entry";

export function OAuthButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOAuth = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(AUTH_ENTRY_PROFILE_SELECT)
        .eq("id", user.id)
        .single();

      router.replace(getAuthEntryDestination(profile));
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
  }, [router]);

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
