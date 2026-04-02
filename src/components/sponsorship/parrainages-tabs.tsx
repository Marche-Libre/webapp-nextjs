"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { InviteForm } from "@/components/sponsorship/invite-form";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Inbox, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Invitation, SponsorshipRequest } from "@/lib/types/database";

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
  sentInvitations: Invitation[];
  filleuls: Filleul[];
  receivedRequests: ReceivedRequest[];
}

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

    if (action === "approved") {
      // Update requester profile: set status to approved, sponsored_by to sponsor
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            status: "approved",
            sponsored_by: user.id,
            sponsor_approved: true,
          })
          .eq("id", request.requester_id);
      }
    }

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

export function ParrainagesTabs({ sentInvitations, filleuls, receivedRequests }: ParrainagesTabsProps) {
  const [activeTab, setActiveTab] = useState("sponsor");

  const pendingInvitations = sentInvitations.filter((inv) => inv.status === "pending");
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
            <div className="space-y-[16px]">
              <div className="flex items-start gap-[16px]">
                <div className="h-[48px] w-[48px] rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <UserPlus className="h-[22px] w-[22px] text-primary-500" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                    Parrainer un nouveau membre
                  </h2>
                  <p className="text-[13px] text-text-secondary mt-[2px]">
                    Saisissez l&apos;identifiant X du professionnel que vous souhaitez parrainer.
                    Il pourra rejoindre le réseau grâce à votre recommandation.
                  </p>
                </div>
              </div>
              <InviteForm />
            </div>

            {pendingInvitations.length > 0 && (
              <div>
                <h3 className="text-[13px] font-medium text-text-muted mb-[8px]">
                  En attente d&apos;inscription ({pendingInvitations.length})
                </h3>
                <div className="space-y-[8px]">
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-[12px] rounded-lg border border-border-default bg-bg-elevated/50"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-text-primary">
                          @{inv.invited_x_handle}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          Invité le {formatDate(inv.created_at)}
                        </p>
                      </div>
                      <Badge variant="warning">En attente</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
