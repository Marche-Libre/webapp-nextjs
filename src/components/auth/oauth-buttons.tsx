"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { XLogo } from "@/components/ui/x-logo";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import {
  AUTH_ENTRY_PROFILE_SELECT,
  getAuthEntryDestination,
} from "@/lib/auth-entry";
import { X_OAUTH_URL_SESSION_KEY } from "@/lib/auth/x-oauth";

const ERROR_LOADING_OAUTH_MESSAGE =
  "La connexion X a échoué. Veuillez réessayer dans quelques secondes.";

const getOAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_LOADING_OAUTH_MESSAGE;
};

export function OAuthButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError && !isAuthSessionMissingError(userError)) {
        throw userError;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(AUTH_ENTRY_PROFILE_SELECT)
          .eq("id", data.user.id)
          .single();

        router.replace(getAuthEntryDestination(profile));
        return;
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithOAuth({
          provider: "x",
          options: {
            redirectTo: getAuthCallbackUrl(),
            skipBrowserRedirect: true,
          },
        });

      if (signInError || !signInData.url) {
        throw signInError ??
          new Error("Le lien d'authentification n'a pas pu être généré.");
      }

      window.sessionStorage.setItem(X_OAUTH_URL_SESSION_KEY, signInData.url);
      router.replace("/auth/x/continue");
    } catch (requestError) {
      setError(getOAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="w-full">
      {error ? (
        <p className="text-xs text-error mb-2 text-center" role="alert">
          {error}
        </p>
      ) : null}
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
    </div>
  );
}
