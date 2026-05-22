import { UserPlus } from "lucide-react";
import { SponsorRequestForm } from "./sponsor-request-form";
import type { SponsorshipRequest } from "@/lib/types/database";

interface WaitingPageClientProps {
  existingRequests: SponsorshipRequest[];
}

export function WaitingPageClient({ existingRequests }: WaitingPageClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-xl border border-accent/15 bg-accent/[0.03] p-4">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
          <UserPlus className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-base-content">
            Parrain requis
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Envoyez une demande à un membre approuvé. Après confirmation du parrainage,
            un admin finalisera votre accès.
          </p>
        </div>
      </div>

      <SponsorRequestForm existingRequests={existingRequests} />
    </div>
  );
}
