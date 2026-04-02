"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { Invitation } from "@/lib/types/database";

interface InvitationCardProps {
  invitation: Invitation;
  mode: "sent" | "received";
}

export function InvitationCard({ invitation, mode }: InvitationCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "accepted" | "rejected") => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from("invitations")
      .update({
        status: action,
        accepted_by: action === "accepted" ? user?.id : null,
      })
      .eq("id", invitation.id);

    if (action === "accepted" && user) {
      // Set sponsored_by and sponsor_approved on the profile
      await supabase
        .from("profiles")
        .update({
          sponsored_by: invitation.inviter_id,
          sponsor_approved: true,
        })
        .eq("id", user.id);
    }

    setLoading(false);
    router.refresh();
  };

  const statusBadge = {
    pending: <Badge variant="warning">En attente</Badge>,
    accepted: <Badge variant="success">Acceptée</Badge>,
    rejected: <Badge variant="error">Refusée</Badge>,
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] p-[16px] rounded-lg border border-border-default bg-bg-elevated/50">
      <div className="flex-1 min-w-0">
        {mode === "sent" ? (
          <>
            <p className="text-[13px] font-medium text-text-primary">
              @{invitation.invited_x_handle}
            </p>
            <p className="text-[11px] text-text-muted mt-[2px]">
              Invité le {formatDate(invitation.created_at)}
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-medium text-text-primary">
              Invitation de @{invitation.inviter?.x_handle || "membre"}
            </p>
            <p className="text-[11px] text-text-muted mt-[2px]">
              Reçue le {formatDate(invitation.created_at)}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-[8px]">
        {statusBadge[invitation.status]}

        {mode === "received" && invitation.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("accepted")}
              disabled={loading}
              className="text-success border-success/20 hover:bg-success-bg"
            >
              <Check className="h-3.5 w-3.5" />
              Accepter
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
          </>
        )}
      </div>
    </div>
  );
}
