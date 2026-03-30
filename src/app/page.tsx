import Link from "next/link";
import { AnimatedHero } from "@/components/home/animated-hero";
import { AnimatedFeatures } from "@/components/home/animated-features";
import { AnimatedSteps } from "@/components/home/animated-steps";
import { AnimatedCTA } from "@/components/home/animated-cta";
import { FloatingHeader } from "@/components/home/floating-header";
import { CookieBanner } from "@/components/ui/cookie-banner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Static top bar — visible at top of page */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-4 bg-base-100">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img src="/images/drapeau.jpg" alt="MarchéLibre" className="w-8 h-8 object-contain" />
          <span className="font-bold text-[17px] text-base-content tracking-tight">
            MarchéLibre
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link href="/connexion" className="btn btn-ghost btn-sm cursor-pointer">
            Connexion
          </Link>
          <Link href="/inscription" className="btn btn-accent btn-sm text-accent-content cursor-pointer">
            S&apos;inscrire gratuitement
          </Link>
        </div>
      </div>

      {/* Floating centered header — fades in on scroll */}
      <FloatingHeader />

      <AnimatedHero />
      <AnimatedFeatures />
      <AnimatedSteps />
      <AnimatedCTA />

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/drapeau.jpg" alt="MarchéLibre" className="w-8 h-8 object-contain" />
                <span className="font-bold text-[17px] tracking-tight">MarchéLibre</span>
              </div>
              <p className="text-sm text-neutral-content/50 leading-relaxed">
                Le réseau fermé des professionnels libéraux vérifiés en France.
              </p>
            </div>

            {/* Plateforme */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-content/70 mb-4">Plateforme</h3>
              <ul className="space-y-2.5">
                <li><Link href="/annonces" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Annonces</Link></li>
                <li><Link href="/annuaire" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Annuaire</Link></li>
                <li><Link href="/offres" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Offres d&apos;emploi</Link></li>
              </ul>
            </div>

            {/* Compte */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-content/70 mb-4">Compte</h3>
              <ul className="space-y-2.5">
                <li><Link href="/inscription" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">S&apos;inscrire</Link></li>
                <li><Link href="/connexion" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Connexion</Link></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-content/70 mb-4">Légal</h3>
              <ul className="space-y-2.5">
                <li><Link href="/mentions-legales" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">Confidentialité</Link></li>
                <li><Link href="/cgu" className="text-sm text-neutral-content/50 hover:text-neutral-content transition-colors">CGU</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-neutral-content/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-content/35">
              &copy; 2026 MarchéLibre &mdash; Tous droits réservés
            </p>
            <a href="https://x.com/monjodav" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-content/35 hover:text-neutral-content/60 transition-colors">
              Fait par <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor" aria-label="X"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> @monjodav
            </a>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
