"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { XLogo } from "@/components/ui/x-logo";
import { X_OAUTH_URL_SESSION_KEY } from "@/lib/auth/x-oauth";
import {
  addAuthBreadcrumb,
  captureAuthException,
  captureAuthMessage,
} from "@/lib/observability/auth";

const COPY_SUCCESS_MESSAGE = "Lien copié";
const COPY_RESET_DELAY_MS = 2200;

export default function AuthXContinuePage() {
  const [oauthUrl, setOauthUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasOauthUrl = useMemo(() => oauthUrl.length > 0, [oauthUrl]);
  const pageMessage = useMemo(
    () =>
      hasOauthUrl
        ? "Terminez la connexion X dans votre navigateur."
        : "Le lien d'authentification n'a pas été trouvé.",
    [hasOauthUrl],
  );

  const resetCopyMessage = useCallback(() => {
    setCopyMessage("");
  }, []);

  const handleProceed = useCallback(() => {
    if (!oauthUrl) {
      captureAuthMessage(
        "Missing X OAuth URL on proceed",
        {
          source: "x_continue",
          step: "missing_oauth_url",
        },
        "warning",
      );
      setErrorMessage("Le lien d’authentification X n’est pas disponible.");
      return;
    }

    window.sessionStorage.removeItem(X_OAUTH_URL_SESSION_KEY);
    addAuthBreadcrumb("Navigating to X OAuth URL", {
      source: "x_continue",
      step: "handoff_to_provider",
    });
    window.location.href = oauthUrl;
  }, [oauthUrl]);

  const handleCopy = useCallback(async () => {
    if (!oauthUrl) {
      captureAuthMessage(
        "Missing X OAuth URL on copy",
        {
          source: "x_continue",
          step: "missing_oauth_url",
        },
        "warning",
      );
      setErrorMessage("Le lien d’authentification X n’est pas disponible.");
      return;
    }

    try {
      await navigator.clipboard.writeText(oauthUrl);
      addAuthBreadcrumb("X OAuth URL copied", {
        source: "x_continue",
        step: "copy_fallback_used",
      });
      setCopyMessage(COPY_SUCCESS_MESSAGE);
    } catch (copyError) {
      captureAuthException(copyError, {
        source: "x_continue",
        step: "copy_failed",
      });
      setCopyMessage("Impossible de copier le lien.");
    }
  }, [oauthUrl]);

  useEffect(() => {
    let canceled = false;

    const loadStoredOauthUrl = () => {
      if (canceled) {
        return;
      }

      const storedOauthUrl = window.sessionStorage.getItem(X_OAUTH_URL_SESSION_KEY);

      if (!storedOauthUrl) {
        captureAuthMessage(
          "X OAuth URL missing from session storage",
          {
            source: "x_continue",
            step: "session_storage_missing",
          },
          "warning",
        );
        setErrorMessage("Veuillez relancer la connexion depuis la page précédente.");
        return;
      }

      addAuthBreadcrumb("X OAuth URL restored from session storage", {
        source: "x_continue",
        step: "session_storage_restored",
      });
      setOauthUrl(storedOauthUrl);
    };

    window.queueMicrotask(loadStoredOauthUrl);

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!copyMessage) {
      return;
    }

    const timeoutId = window.setTimeout(resetCopyMessage, COPY_RESET_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [copyMessage, resetCopyMessage]);

  return (
    <div className="min-h-dvh bg-base-200 flex items-center justify-center px-4 py-6">
      <div className="max-w-[420px] w-full bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
        <p className="text-xs font-medium text-center tracking-wide text-base-content/60 mb-3 uppercase">
          Connexion avec X
        </p>
        <h1 className="text-xl font-semibold text-center mb-2">Étape de confirmation</h1>
        <p className="text-sm text-base-content/70 text-center mb-6 leading-relaxed">
          {pageMessage}
        </p>

        {errorMessage ? (
          <p className="text-sm text-error text-center mb-3" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {copyMessage ? (
          <p className="text-sm text-success text-center mb-3">{copyMessage}</p>
        ) : null}

        <button
          type="button"
          onClick={handleProceed}
          disabled={!hasOauthUrl}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#000000] px-4 py-3 text-sm font-medium text-[#ffffff] hover:bg-[#1a1a1a] disabled:opacity-40 cursor-pointer transition-all"
        >
          <XLogo className="w-4 h-4" />
          Continuer dans le navigateur
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasOauthUrl}
          className="w-full mt-2 border border-base-content/20 rounded-lg px-4 py-3 text-sm font-medium hover:bg-base-200 disabled:opacity-40 transition-all cursor-pointer"
        >
          Copier le lien
        </button>

        <p className="text-xs text-base-content/60 text-center mt-4 leading-relaxed">
          Si l’application X s’ouvre encore sur votre fil, revenez ici et utilisez
          &quot;Copier le lien&quot;, puis ouvrez ce lien dans votre navigateur.
        </p>

        <Link
          href="/connexion"
          className="mt-4 block text-center text-sm text-primary underline decoration-dotted underline-offset-2"
        >
          Annuler
        </Link>
      </div>
    </div>
  );
}
