"use client";

import { Search, ShieldCheck, Megaphone, Briefcase, MapPin } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import Image from "next/image";

export function AnimatedFeatures() {
  return (
    <>
      {/* Bento Features Grid */}
      <section className="py-20 bg-base-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-sm font-bold text-accent tracking-wide uppercase mb-3">Fonctionnalités</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                Tout ce qu&apos;il faut pour <span className="highlight">travailler ensemble</span>
              </h2>
            </div>
          </FadeIn>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card — Annonces (spans 2 cols) */}
            <FadeIn delay={0.06} className="sm:col-span-2 lg:col-span-2">
              <div className="rounded-2xl bg-[var(--bento-coral)] text-white shadow-lg overflow-hidden h-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Megaphone className="w-5 h-5 text-white/70" />
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wide">Conversations</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Échangez. Coordonnez. Collaborez.
                    </h3>
                    <p className="text-white/75 mt-2 max-w-md text-sm leading-relaxed">
                      Un espace de discussion simple pour les membres vérifiés du réseau.
                      La Beta 1 se concentre sur des échanges directs et lisibles.
                    </p>
                  </div>
                  <div className="hidden sm:block shrink-0 rounded-xl overflow-hidden w-[200px] h-[140px]">
                    <Image src="/images/workspace.jpg" alt="Espace de travail" width={200} height={140} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Vérification */}
            <FadeIn delay={0.1}>
              <div className="rounded-2xl bg-[var(--bento-emerald)] text-white shadow-lg h-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="p-7">
                  <ShieldCheck className="w-6 h-6 text-white/80" />
                  <h3 className="text-lg font-bold tracking-tight mt-3">Zéro compte anonyme</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">
                    Identifiant X obligatoire. Validation manuelle par un administrateur.
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-2 h-2 rounded-full bg-white/80" /> @marie_ux — vérifiée
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-2 h-2 rounded-full bg-white/40" /> @thomas_dev — en attente
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Profils vérifiés */}
            <FadeIn delay={0.14}>
              <div className="rounded-2xl bg-[var(--bento-amber)] text-white shadow-lg h-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="p-7">
                  <Search className="w-6 h-6 text-white/80" />
                  <h3 className="text-lg font-bold tracking-tight mt-3">Profils vérifiés</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">
                    Chaque membre rejoint le réseau avec une identité claire et validée.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Signal utile */}
            <FadeIn delay={0.18}>
              <div className="rounded-2xl bg-[var(--bento-indigo)] text-white shadow-lg h-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="p-7">
                  <Briefcase className="w-6 h-6 text-white/80" />
                  <h3 className="text-lg font-bold tracking-tight mt-3">Réseau qualifié</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">
                    Des professionnels identifiés pour créer des conversations plus fiables.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Localisation */}
            <FadeIn delay={0.22}>
              <div className="rounded-2xl bg-[var(--bento-sky)] text-white shadow-lg h-full cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                <div className="p-7">
                  <MapPin className="w-6 h-6 text-white/80" />
                  <h3 className="text-lg font-bold tracking-tight mt-3">Réseau local</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-2">
                    La localisation aide les membres approuvés à situer les échanges, sans annuaire public.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
