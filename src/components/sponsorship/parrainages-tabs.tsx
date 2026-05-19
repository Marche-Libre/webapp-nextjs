"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Inbox, Check, X, Copy, Link } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { SponsorshipRequest } from "@/lib/types/database";

interface Filleul {
  id: string;
  full_name: string;
  x_handle: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

type ReceivedRequest = SponsorshipRequest & {
  requester: { x_handle: string; full_name: string; avatar_url: string | null };
};

interface ParrainagesTabsProps {
  filleuls: Filleul[];
  receivedRequests: ReceivedRequest[];
  xHandle: string;
  isAdmin: boolean;
  pendingCount: number;
  totalFilleuls: number;
}

const MAX_PENDING = 5;
const MAX_TOTAL = 20;

function RequestActionButtons({ request }: { request: ReceivedRequest }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleAction = useCallback(async (action: "approved" | "rejected") => {
    setLoading(true);
    setErrorMessage("");
    const supabase = createClient();

    const { error } = await supabase
      .from("sponsorship_requests")
      .update({ status: action })
      .eq("id", request.id);

    if (error) {
      setErrorMessage("Impossible de traiter cette demande pour le moment.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }, [request.id, router]);

  const handleApprove = useCallback(() => {
    void handleAction("approved");
  }, [handleAction]);

  const handleReject = useCallback(() => {
    void handleAction("rejected");
  }, [handleAction]);

  return (
    <div className="space-y-[6px]">
      <div className="flex items-center gap-[6px]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleApprove}
          disabled={loading}
          className="text-success border-success/20 hover:bg-success-bg"
        >
          <Check className="h-3.5 w-3.5" />
          Approuver
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={loading}
          className="text-error border-error/20 hover:bg-error-bg"
        >
          <X className="h-3.5 w-3.5" />
          Refuser
        </Button>
      </div>
      {errorMessage ? (
        <p className="text-[11px] text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function ParrainagesTabs({ filleuls, receivedRequests, xHandle, isAdmin, pendingCount, totalFilleuls }: ParrainagesTabsProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralUrl, setReferralUrl] = useState("");

  const isAtLimit = !isAdmin && (pendingCount >= MAX_PENDING || totalFilleuls >= MAX_TOTAL);
  const linkActive = !isAtLimit;
  const pendingRequests = useMemo(() => {
    return receivedRequests.filter((request) => request.status === "pending");
  }, [receivedRequests]);

  const handleCopyReferralUrl = useCallback(() => {
    void navigator.clipboard.writeText(referralUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [referralUrl]);

  function renderReceivedRequest(req: ReceivedRequest) {
    return (
      <div
        key={req.id}
        className="flex flex-col gap-[12px] rounded-lg border border-border-default bg-bg-elevated/50 p-[14px] sm:flex-row sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-text-primary">
            @{req.requester?.x_handle || "inconnu"}
          </p>
          <p className="mt-[2px] text-[11px] text-text-muted">
            {req.requester?.full_name && (
              <span>{req.requester.full_name} — </span>
            )}
            Reçue le {formatDate(req.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          {req.status === "pending" ? (
            <RequestActionButtons request={req} />
          ) : req.status === "approved" ? (
            <Badge variant="success">Approuvée</Badge>
          ) : (
            <Badge variant="error">Refusée</Badge>
          )}
        </div>
      </div>
    );
  }

  function renderFilleul(filleul: Filleul) {
    return (
      <div
        key={filleul.id}
        className="flex items-center gap-[12px] rounded-lg border border-border-default bg-bg-elevated/50 p-[12px]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-text-primary">
            @{filleul.x_handle}
          </p>
          <p className="truncate text-[11px] text-text-muted">
            {filleul.full_name || "Nom non renseigné"}
          </p>
        </div>
        <Badge
          variant={filleul.status === "approved" ? "success" : "warning"}
        >
          {filleul.status === "approved" ? "Actif" : "En attente admin"}
        </Badge>
      </div>
    );
  }

  const requestItems = receivedRequests.map(renderReceivedRequest);
  const filleulItems = filleuls.map(renderFilleul);

  useEffect(() => {
    setReferralUrl(`${window.location.origin}/rejoindre?ref=${xHandle}`);
  }, [xHandle]);

  return (
    <div className="space-y-[16px]">
      <div className="rounded-xl bg-bg-base p-[24px] shadow-card">
        <div className="mb-[16px] flex items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <Link className="h-[18px] w-[18px] text-primary-500" />
            <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
              Votre lien de parrainage
            </h3>
          </div>
          {linkActive && <Badge variant="success">Actif</Badge>}
        </div>

        {linkActive ? (
          <>
            <div className="flex flex-col gap-[8px] sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 select-all truncate rounded-lg bg-primary-50 px-[12px] py-[8px] text-[12px] text-primary-500">
                {referralUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyReferralUrl}
              >
                {linkCopied ? (
                  <>
                    <Check className="h-[14px] w-[14px]" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-[14px] w-[14px]" />
                    Copier
                  </>
                )}
              </Button>
            </div>
            {!isAdmin && (
              <p className="mt-[10px] text-[11px] text-text-muted">
                {pendingCount}/{MAX_PENDING} demandes en attente · {totalFilleuls}/{MAX_TOTAL} filleuls
              </p>
            )}
          </>
        ) : (
          <p className="text-[12px] text-warning">
            Vous avez atteint la limite de parrainages ({pendingCount} en attente, {totalFilleuls} filleuls). Approuvez ou refusez les demandes en attente pour libérer des places.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-bg-base p-[24px] shadow-card">
        <div className="mb-[16px] flex items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <Inbox className="h-[18px] w-[18px] text-text-muted" />
            <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
              Demandes reçues
            </h3>
          </div>
          <Badge variant={pendingRequests.length > 0 ? "warning" : "default"}>
            {pendingRequests.length} en attente
          </Badge>
        </div>

        {receivedRequests.length > 0 ? (
          <div className="space-y-[8px]">{requestItems}</div>
        ) : (
          <EmptyState
            icon={<Inbox className="h-[24px] w-[24px] text-text-muted" />}
            title="Aucune demande"
            description="Les demandes de parrainage envoyées par de nouveaux membres apparaîtront ici."
          />
        )}
      </div>

      <div className="rounded-xl bg-bg-base p-[24px] shadow-card">
        <div className="mb-[16px] flex items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <Users className="h-[18px] w-[18px] text-text-muted" />
            <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
              Mes filleuls
            </h3>
          </div>
          <Badge variant="default">{filleuls.length}</Badge>
        </div>

        {filleuls.length > 0 ? (
          <div className="space-y-[8px]">{filleulItems}</div>
        ) : (
          <EmptyState
            icon={<Users className="h-[24px] w-[24px] text-text-muted" />}
            title="Aucun filleul"
            description="Vos filleuls apparaîtront ici une fois qu'ils se seront inscrits grâce à votre parrainage."
          />
        )}
      </div>
    </div>
  );
}
