import { SponsorRequestForm } from "./sponsor-request-form";
import type { SponsorshipRequest } from "@/lib/types/database";

interface WaitingPageClientProps {
  existingRequests: SponsorshipRequest[];
}

export function WaitingPageClient({ existingRequests }: WaitingPageClientProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-base-content/55">
        La validation passe par un membre deja approuve. Saisissez son identifiant
        X pour lui envoyer une demande de parrainage.
      </p>
      <SponsorRequestForm existingRequests={existingRequests} />
    </div>
  );
}
