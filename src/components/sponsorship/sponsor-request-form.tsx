"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { SponsorshipRequest } from "@/lib/types/database";
import { createSponsorshipRequestForHandle } from "@/lib/sponsorship/requests";

interface SponsorRequestFormProps {
  existingRequests: SponsorshipRequest[];
  requesterId: string;
}

export function SponsorRequestForm({ existingRequests, requesterId }: SponsorRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const totalAttempts = existingRequests.length;
  const hasPending = existingRequests.some((r) => r.status === "pending");
  const hasApproved = existingRequests.some((r) => r.status === "approved");
  const maxedOut = totalAttempts >= 2 && !hasPending && !hasApproved;
  const canSubmit = !hasPending && !hasApproved && !submitted && totalAttempts < 2;

  function renderRequest(req: SponsorshipRequest) {
    return (
      <div
        key={req.id}
        className="flex items-center gap-[12px] p-[12px] rounded-lg border border-border-default bg-bg-elevated/50"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary">
            Demande envoyée à @{req.sponsor_handle}
          </p>
          <p className="text-[11px] text-text-muted">
            {formatDate(req.created_at)}
          </p>
        </div>
        {req.status === "approved" && (
          <Badge variant="success">Approuvée</Badge>
        )}
        {req.status === "rejected" && (
          <Badge variant="error">Refusée</Badge>
        )}
      </div>
    );
  }

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawHandle = formData.get("sponsor_handle");
    const handle = typeof rawHandle === "string" ? rawHandle : "";

    const supabase = createClient();
    const sponsorshipResult = await createSponsorshipRequestForHandle(supabase, {
      requesterId,
      sponsorHandle: handle,
    });

    if (!sponsorshipResult.ok) {
      setError(sponsorshipResult.message);
      setLoading(false);
      return;
    }

    setSuccess(sponsorshipResult.message);
    setSubmitted(true);
    form.reset();
    setLoading(false);
    router.refresh();
  }, [requesterId, router]);

  const requestItems = existingRequests.map(renderRequest);

  return (
    <div className="space-y-[16px] text-left">
      {/* Show existing request status */}
      {requestItems}

      {/* Approved message */}
      {hasApproved && (
        <div className="flex items-center gap-[10px] p-[12px] rounded-lg bg-success-bg/50 text-[13px] text-success">
          <CheckCircle className="h-[16px] w-[16px] shrink-0" />
          Votre parrain a approuve votre inscription. Votre acces est en cours d&apos;activation.
        </div>
      )}

      {/* Pending message */}
      {hasPending && (
        <div className="flex items-center gap-[10px] p-[12px] rounded-lg bg-warning-bg/50 text-[13px] text-warning">
          <Clock className="h-[16px] w-[16px] shrink-0" />
          Votre demande est en cours de traitement par le membre.
        </div>
      )}

      {/* Maxed out */}
      {maxedOut && (
        <div className="flex items-center gap-[10px] p-[12px] rounded-lg bg-warning-bg/50 text-[13px] text-warning">
          <AlertTriangle className="h-[16px] w-[16px] shrink-0" />
          Vos deux demandes de parrainage ont ete refusees. L&apos;acces necessite un parrain valide.
        </div>
      )}

      {/* Form to declare sponsor */}
      {canSubmit && (
        <div className="space-y-3">
          <div className="rounded-xl border border-base-content/[0.08] overflow-hidden">
            {/* Banner */}
            <div className="bg-[#000] px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <XLogo className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm text-white/70">
                {totalAttempts === 0
                  ? <>Identifiant <XLogo className="w-2.5 h-2.5 inline-block align-baseline text-white/90" /> de votre parrain</>
                  : "Déclarer un autre parrain"}
              </p>
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-base-content/[0.02]">
              <span className="text-base-content/30 text-sm pl-1">@</span>
              <input
                name="sponsor_handle"
                placeholder="identifiant"
                className="flex-1 bg-transparent text-sm text-base-content placeholder:text-base-content/25 outline-none"
              />
              <Button type="submit" disabled={loading} size="sm">
                {loading ? "Envoi…" : "Envoyer"}
              </Button>
            </form>
          </div>

          {error && <p className="text-xs text-error px-1">{error}</p>}
          {success && <p className="text-xs text-success px-1">{success}</p>}
        </div>
      )}
    </div>
  );
}
