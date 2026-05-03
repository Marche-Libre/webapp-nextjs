"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ml-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("ml-cookie-consent", "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-[400px] z-[100] animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="card bg-neutral text-neutral-content shadow-2xl">
        <div className="card-body p-5 gap-0">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20 shrink-0 mt-0.5">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1">
                Nous utilisons des cookies
              </p>
              <p className="text-xs text-neutral-content/55 mb-4">
                Nous utilisons des cookies nécessaires au fonctionnement du service
                et à vos préférences. Aucun suivi publicitaire ni consentement
                facultatif n&apos;est utilisé.
              </p>
              <div className="flex gap-2">
                <button onClick={dismiss} className="btn btn-primary btn-sm">
                  Compris
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="btn btn-ghost btn-sm btn-square text-neutral-content/40"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
