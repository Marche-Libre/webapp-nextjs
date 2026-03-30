"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ApproveRejectButtonsProps {
  userId: string;
  currentStatus?: string;
  compact?: boolean;
}

export function ApproveRejectButtons({
  userId,
  currentStatus,
  compact,
}: ApproveRejectButtonsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    const supabase = createClient();

    await supabase.from("profiles").update({ status }).eq("id", userId);

    setLoading(false);
    router.refresh();
  };

  if (currentStatus === "approved") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="text-error hover:text-error hover:bg-error-bg"
      >
        <X className="h-3.5 w-3.5" />
        {!compact && "Rejeter"}
      </Button>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="text-primary-600 hover:text-primary-600 hover:bg-primary-50"
      >
        <Check className="h-3.5 w-3.5" />
        {!compact && "Approuver"}
      </Button>
    );
  }

  return (
    <div className="flex gap-[8px]">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="text-primary-600 border-primary-500/20 hover:bg-primary-50"
      >
        <Check className="h-3.5 w-3.5" />
        {!compact && "Approuver"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="text-error border-error/20 hover:bg-error-bg"
      >
        <X className="h-3.5 w-3.5" />
        {!compact && "Rejeter"}
      </Button>
    </div>
  );
}
