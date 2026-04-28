import Link from "next/link";
import { Shield, Users, MessageSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-base-200">
      {/* Left — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 bg-base-100 flex-col justify-between p-10 border-r border-base-300">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="MarchéLibre" className="w-9 h-9 object-contain" />
          <span className="font-bold text-[18px] text-base-content tracking-tight">
            MarchéLibre
          </span>
        </Link>

        <div className="space-y-8">
          <h2 className="text-3xl font-extrabold text-base-content tracking-tight leading-tight">
            Le réseau de confiance des professionnels libéraux
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-base-content">Membres vérifiés</p>
                <p className="text-xs text-base-content/45 mt-0.5">Chaque professionnel est parrainé et validé manuellement</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-base-content">Communauté vérifiée</p>
                <p className="text-xs text-base-content/45 mt-0.5">Des pairs identifiés pour échanger dans un cadre plus fiable</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-base-content">Chat privé</p>
                <p className="text-xs text-base-content/45 mt-0.5">Échangez en toute confiance avec des pairs vérifiés</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-base-content/25">
          © 2026 MarchéLibre — Tous droits réservés
        </p>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Mobile logo */}
        <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
          <img src="/images/logo.png" alt="MarchéLibre" className="w-9 h-9 object-contain" />
          <span className="font-bold text-[18px] text-base-content tracking-tight">
            MarchéLibre
          </span>
        </Link>

        <div className="w-full max-w-[400px]">{children}</div>

        <p className="mt-8 text-xs text-base-content/25 lg:hidden">
          © 2026 MarchéLibre
        </p>
      </div>
    </div>
  );
}
