"use client";

import { useState } from "react";
import { UserPlus, Clock, ArrowLeft } from "lucide-react";
import { SponsorRequestForm } from "./sponsor-request-form";
import type { SponsorshipRequest } from "@/lib/types/database";

interface WaitingPageClientProps {
  existingRequests: SponsorshipRequest[];
  requesterId: string;
}

export function WaitingPageClient({ existingRequests, requesterId }: WaitingPageClientProps) {
  const hasExisting = existingRequests.length > 0;

  const [choice, setChoice] = useState<"sponsor" | "wait" | null>(
    hasExisting ? "sponsor" : null
  );

  // Sponsor form view
  if (choice === "sponsor") {
    return (
      <div className="space-y-4">
        {!hasExisting && (
          <button
            onClick={() => setChoice(null)}
            className="inline-flex items-center gap-1.5 text-xs text-base-content/35 hover:text-base-content/55 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour
          </button>
        )}
        <SponsorRequestForm
          existingRequests={existingRequests}
          requesterId={requesterId}
        />
      </div>
    );
  }

  // Wait view
  if (choice === "wait") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setChoice(null)}
          className="inline-flex items-center gap-1.5 text-xs text-base-content/35 hover:text-base-content/55 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour
        </button>
        <div className="py-4 text-center">
          <p className="text-sm text-base-content/50 leading-relaxed">
            Votre demande est en file d&apos;attente.
            <br />
            Un administrateur l&apos;examinera prochainement.
          </p>
        </div>
      </div>
    );
  }

  // Choice screen
  return (
    <div className="space-y-3">
      <button
        onClick={() => setChoice("sponsor")}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-base-content/[0.08] hover:border-accent/25 hover:bg-accent/[0.03] transition-all text-left cursor-pointer group"
      >
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
          <UserPlus className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-base-content">
            Je connais un membre
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Lui envoyer une demande de parrainage
          </p>
        </div>
      </button>

      <button
        onClick={() => setChoice("wait")}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-base-content/[0.08] hover:border-base-content/15 hover:bg-base-content/[0.02] transition-all text-left cursor-pointer group"
      >
        <div className="h-10 w-10 rounded-full bg-base-content/[0.06] flex items-center justify-center shrink-0 group-hover:bg-base-content/10 transition-colors">
          <Clock className="h-5 w-5 text-base-content/40" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-base-content">
            Je ne connais personne
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Un administrateur examinera votre demande
          </p>
        </div>
      </button>
    </div>
  );
}
