"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
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
  const router = useRouter();

  const handleAction = async (action: "approved" | "rejected") => {
    setLoading(true);
    const supabase = createClient();

    // Update request status
    await supabase
      .from("sponsorship_requests")
      .update({ status: action })
      .eq("id", request.id);

    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-[6px]">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="text-success border-success/20 hover:bg-success-bg"
      >
        <Check className="h-3.5 w-3.5" />
        Approuver
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="text-error border-error/20 hover:bg-error-bg"
      >
        <X className="h-3.5 w-3.5" />
        Refuser
      </Button>
    </div>
  );
}

export function ParrainagesTabs({ filleuls, receivedRequests, xHandle, isAdmin, pendingCount, totalFilleuls }: ParrainagesTabsProps) {
  const [activeTab, setActiveTab] = useState("sponsor");
  const [linkCopied, setLinkCopied] = useState(false);

  const isAtLimit = !isAdmin && (pendingCount >= MAX_PENDING || totalFilleuls >= MAX_TOTAL);
  const linkActive = !isAtLimit;
  const pendingRequests = receivedRequests.filter((r) => r.status === "pending");

  const tabs = [
    { label: "Parrainer", value: "sponsor" },
    { label: "Demandes reçues", value: "requests", count: pendingRequests.length },
    { label: "Mes filleuls", value: "filleuls", count: filleuls.length },
  ];

  return (
    <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="rounded-t-xl" />

      <div className="p-[24px]">
        {activeTab === "sponsor" && (
          <div className="space-y-[24px]">
            {/* Referral link */}
            <div className="rounded-xl border border-border-default bg-bg-elevated p-[16px] space-y-[10px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <Link className="h-[16px] w-[16px] text-primary-500" />
                  <h3 className="text-[13px] font-semibold text-text-primary">Votre lien de parrainage</h3>
                </div>
                {linkActive && <Badge variant="success">Actif</Badge>}
              </div>

              {linkActive ? (
                <>
                  <div className="flex items-center gap-[8px]">
                    <code className="flex-1 text-[12px] text-primary-500 bg-primary-50 rounded-lg px-[12px] py-[8px] truncate select-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/rejoindre?ref={xHandle}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/rejoindre?ref=${xHandle}`);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                    >
                      {linkCopied ? <><Check className="h-[14px] w-[14px]" /> Copié</> : <><Copy className="h-[14px] w-[14px]" /> Copier</>}
                    </Button>
                  </div>
                  {!isAdmin && (
                    <p className="text-[11px] text-text-muted">
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

          </div>
        )}

        {activeTab === "requests" && (
          <div>
            {receivedRequests.length > 0 ? (
              <div className="space-y-[8px]">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-[12px] p-[14px] rounded-lg border border-border-default bg-bg-elevated/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary">
                        @{req.requester?.x_handle || "inconnu"}
                      </p>
                      <p className="text-[11px] text-text-muted mt-[2px]">
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
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Inbox className="h-[24px] w-[24px] text-text-muted" />}
                title="Aucune demande"
                description="Les demandes de parrainage envoyées par de nouveaux membres apparaîtront ici."
              />
            )}
          </div>
        )}

        {activeTab === "filleuls" && (
          <div>
            {filleuls.length > 0 ? (
              <div className="space-y-[8px]">
                {filleuls.map((filleul) => (
                  <div
                    key={filleul.id}
                    className="flex items-center gap-[12px] p-[12px] rounded-lg border border-border-default bg-bg-elevated/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        @{filleul.x_handle}
                      </p>
                      <p className="text-[11px] text-text-muted truncate">
                        {filleul.full_name || "Nom non renseigné"}
                      </p>
                    </div>
                    <Badge
                      variant={filleul.status === "approved" ? "success" : "warning"}
                    >
                      {filleul.status === "approved"
                        ? "Actif"
                        : "En attente admin"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="h-[24px] w-[24px] text-text-muted" />}
                title="Aucun filleul"
                description="Vos filleuls apparaîtront ici une fois qu'ils se seront inscrits grâce à votre parrainage."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
