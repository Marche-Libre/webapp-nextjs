import { Clock } from "lucide-react";
import Link from "next/link";

export default function EnAttentePage() {
  return (
    <div className="bg-bg-base rounded-2xl p-[32px] shadow-card text-center animate-[slide-up_0.25s_ease-out]">
      <div className="flex items-center gap-[10px] mb-[32px] justify-center">
        <div className="h-[32px] w-[32px] rounded-lg bg-primary-500 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-bold text-[13px]">ML</span>
        </div>
        <span className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
          MarchéLibre
        </span>
      </div>

      <div className="h-[64px] w-[64px] rounded-2xl bg-warning-bg flex items-center justify-center mx-auto mb-[20px]">
        <Clock className="h-[28px] w-[28px] text-warning" />
      </div>

      <h1 className="font-display text-[20px] leading-[28px] font-bold text-text-primary mb-[8px] tracking-[-0.02em]">
        Inscription en cours de validation
      </h1>
      <p className="text-[13px] leading-[20px] text-text-secondary mb-[24px] max-w-[360px] mx-auto">
        Votre demande a bien été enregistrée. Un administrateur va vérifier votre identifiant X et activer votre compte. Vous recevrez un e-mail dès que c&apos;est fait.
      </p>

      <Link href="/connexion" className="text-[13px] leading-[20px] text-primary-600 hover:text-primary-700 font-medium">
        Retour à la connexion
      </Link>
    </div>
  );
}
