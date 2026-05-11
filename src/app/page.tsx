import Link from "next/link";
import { Suspense } from "react";
import { AccessModal } from "@/components/auth/access-modal";
import { ACCESS_MODAL_HREF } from "@/lib/auth-entry";
import { AnimatedHero } from "@/components/home/animated-hero";
import { AnimatedFeatures } from "@/components/home/animated-features";
import { AnimatedProfessions } from "@/components/home/animated-professions";
import { AnimatedSteps } from "@/components/home/animated-steps";
import { AnimatedCTA } from "@/components/home/animated-cta";
import { FloatingHeader } from "@/components/home/floating-header";
import { LandingHeader } from "@/components/home/landing-header";
import { CookieBanner } from "@/components/ui/cookie-banner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <LandingHeader />
      <FloatingHeader />

      <AnimatedHero />
      <AnimatedFeatures />
      <AnimatedProfessions />
      <AnimatedSteps />
      <AnimatedCTA />

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/images/logo.png"
                  alt="MarchéLibre"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-bold text-[17px] tracking-tight">
                  MarchéLibre
                </span>
              </div>
              <p className="text-sm text-neutral-content/50 leading-relaxed">
                Club privé en bêta privée pour professionnels libéraux, avec
                admission manuelle.
              </p>
            </div>

            {/* Accès */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-content/70 mb-4">
                Accès
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href={ACCESS_MODAL_HREF}
                    className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                  >
                    Demander l’accès
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-content/70 mb-4">
                Légal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/mentions-legales"
                    className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                  >
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/confidentialite"
                    className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                  >
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cgu"
                    className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors"
                  >
                    CGU
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-neutral-content/10">
            <p className="text-xs text-neutral-content/35 text-center">
              &copy; 2026 MarchéLibre &mdash; Tous droits réservés
            </p>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <AccessModal />
      </Suspense>
      <CookieBanner />
    </div>
  );
}
