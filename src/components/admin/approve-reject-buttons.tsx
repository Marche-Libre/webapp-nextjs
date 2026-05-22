"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { approveUser, rejectUser } from "@/app/(app)/admin/actions";

interface ApproveRejectButtonsProps {
  userId: string;
  currentStatus?: string;
  compact?: boolean;
  canApprove?: boolean;
  blockedReason?: string;
}

export function ApproveRejectButtons({
  userId,
  currentStatus,
  compact,
  canApprove = true,
  blockedReason = "Parrainage manquant",
}: ApproveRejectButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const runAction = useCallback(async (status: "approved" | "rejected") => {
    setLoading(true);
    setError("");

    const result =
      status === "approved"
        ? await approveUser(userId)
        : await rejectUser(userId);

    if (!result.success) {
      setError(result.error ?? "Action impossible");
    }

    setLoading(false);
    router.refresh();
  }, [router, userId]);

  const handleApprove = useCallback(async () => {
    await runAction("approved");
  }, [runAction]);

  const handleReject = useCallback(async () => {
    await runAction("rejected");
  }, [runAction]);

  const approveDisabled = loading || !canApprove;

  if (currentStatus === "approved") {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReject}
          disabled={loading}
          className="text-error hover:text-error hover:bg-error-bg"
        >
          <X className="h-3.5 w-3.5" />
          {!compact && "Rejeter"}
        </Button>
        {error ? <p className="text-xs text-error">{error}</p> : null}
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleApprove}
          disabled={approveDisabled}
          title={canApprove ? undefined : blockedReason}
          className="text-primary-600 hover:text-primary-600 hover:bg-primary-50"
        >
          <Check className="h-3.5 w-3.5" />
          {!compact && "Approuver"}
        </Button>
        {error ? <p className="text-xs text-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-[8px]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleApprove}
          disabled={approveDisabled}
          title={canApprove ? undefined : blockedReason}
          className="text-primary-600 border-primary-500/20 hover:bg-primary-50"
        >
          <Check className="h-3.5 w-3.5" />
          {!compact && "Approuver"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={loading}
          className="text-error border-error/20 hover:bg-error-bg"
        >
          <X className="h-3.5 w-3.5" />
          {!compact && "Rejeter"}
        </Button>
      </div>
      {!canApprove ? (
        <p className="text-xs text-text-muted">{blockedReason}</p>
      ) : null}
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
