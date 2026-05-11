"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function AccessModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = searchParams.get("auth") === "access";

  const close = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("auth");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname || "/", {
      scroll: false,
    });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Demander l’accès"
      className="max-w-[420px]"
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Accès à MarchéLibre
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Connectez-vous avec X pour lancer une demande d’admission. Chaque
            candidature est revue manuellement avant l’accès membre.
          </p>
        </div>

        <OAuthButtons />

        <div className="flex items-start gap-3 rounded-xl bg-accent/[0.04] border border-accent/10 px-4 py-3">
          <Shield className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-text-muted">
            Un seul point d’entrée : votre compte X sert à la connexion et à la
            demande d’accès.
          </p>
        </div>
      </div>
    </Modal>
  );
}
