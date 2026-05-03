"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Shield, Users, Briefcase, Lock } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { ThreeDMarquee } from "@/components/ui/three-d-marquee";
import Image from "next/image";
import Link from "next/link";

const MARQUEE_IMAGES = [
  { src: "/images/marquee/doctor.jpg", alt: "Médecin" },
  { src: "/images/marquee/lawyer.jpg", alt: "Avocat" },
  { src: "/images/marquee/architect.jpg", alt: "Architecte" },
  { src: "/images/marquee/chef.jpg", alt: "Chef cuisinier" },
  { src: "/images/marquee/developer.jpg", alt: "Développeur" },
  { src: "/images/marquee/pharmacist.jpg", alt: "Pharmacien" },
  { src: "/images/marquee/designer.jpg", alt: "Designer" },
  { src: "/images/marquee/businessman.jpg", alt: "Consultant" },
  { src: "/images/marquee/surgeon.jpg", alt: "Chirurgien" },
  { src: "/images/marquee/photographer.jpg", alt: "Photographe" },
  { src: "/images/marquee/accountant.jpg", alt: "Comptable" },
  { src: "/images/marquee/engineer.jpg", alt: "Ingénieur" },
  { src: "/images/marquee/chef2.jpg", alt: "Chef pâtissier" },
  { src: "/images/marquee/lawyer2.jpg", alt: "Notaire" },
  { src: "/images/marquee/pharmacist2.jpg", alt: "Pharmacienne" },
  { src: "/images/marquee/factory.jpg", alt: "Technicien" },
  { src: "/images/marquee/businesswoman1.jpg", alt: "Entrepreneuse" },
  { src: "/images/marquee/businesswoman2.jpg", alt: "Manager" },
  { src: "/images/marquee/businesswoman3.jpg", alt: "Directrice" },
  { src: "/images/marquee/businesswoman4.jpg", alt: "Cadre" },
  { src: "/images/marquee/businesswoman5.jpg", alt: "Conseillère" },
  { src: "/images/marquee/businesswoman6.jpg", alt: "Superviseur" },
  { src: "/images/marquee/businesswoman7.jpg", alt: "Consultante" },
  { src: "/images/marquee/dentist1.jpg", alt: "Dentiste" },
  { src: "/images/marquee/dentist2.jpg", alt: "Orthodontiste" },
  { src: "/images/marquee/dentist3.jpg", alt: "Chirurgien-dentiste" },
  { src: "/images/marquee/dentist4.jpg", alt: "Stomatologue" },
  { src: "/images/marquee/nurse1.jpg", alt: "Infirmier" },
  { src: "/images/marquee/nurse2.jpg", alt: "Infirmière" },
  { src: "/images/marquee/nurse3.jpg", alt: "Aide-soignante" },
  { src: "/images/marquee/nurse4.jpg", alt: "Équipe médicale" },
  { src: "/images/marquee/artisan1.jpg", alt: "Artisan" },
  { src: "/images/marquee/artisan2.jpg", alt: "Artisan d'art" },
  { src: "/images/marquee/welder.jpg", alt: "Soudeur" },
  { src: "/images/marquee/welder2.jpg", alt: "Métallier" },
  { src: "/images/marquee/sculptor.jpg", alt: "Sculpteur" },
  { src: "/images/marquee/carpenter.jpg", alt: "Menuisier" },
  { src: "/images/marquee/luthier.jpg", alt: "Luthier" },
  { src: "/images/marquee/teacher1.jpg", alt: "Enseignante" },
  { src: "/images/marquee/teacher2.jpg", alt: "Formatrice" },
  { src: "/images/marquee/vet1.jpg", alt: "Vétérinaire" },
  { src: "/images/marquee/vet2.jpg", alt: "Vétérinaire chirurgien" },
  { src: "/images/marquee/vet3.jpg", alt: "Clinique vétérinaire" },
  { src: "/images/marquee/electrician1.jpg", alt: "Électricien" },
  { src: "/images/marquee/electrician2.jpg", alt: "Installateur" },
  { src: "/images/marquee/electrician3.jpg", alt: "Technicien électrique" },
  { src: "/images/marquee/scientist1.jpg", alt: "Chercheur" },
  { src: "/images/marquee/scientist2.jpg", alt: "Scientifique" },
  { src: "/images/marquee/scientist3.jpg", alt: "Laborantin" },
  { src: "/images/marquee/mechanic1.jpg", alt: "Mécanicien" },
  { src: "/images/marquee/mechanic2.jpg", alt: "Garagiste" },
  { src: "/images/marquee/mechanic3.jpg", alt: "Carrossier" },
  { src: "/images/marquee/barber1.jpg", alt: "Barbier" },
  { src: "/images/marquee/barber2.jpg", alt: "Coiffeur" },
  { src: "/images/marquee/barber3.jpg", alt: "Coiffeuse" },
  { src: "/images/marquee/coach1.jpg", alt: "Coach sportif" },
  { src: "/images/marquee/coach2.jpg", alt: "Préparateur physique" },
  { src: "/images/marquee/coach3.jpg", alt: "Entraîneur" },
  { src: "/images/marquee/coach4.jpg", alt: "Coach fitness" },
  { src: "/images/marquee/coding.jpg", alt: "Programmeur" },
  { src: "/images/marquee/surgeon2.jpg", alt: "Équipe chirurgicale" },
  { src: "/images/marquee/chef3.jpg", alt: "Cuisinier" },
  { src: "/images/marquee/lawyer3.jpg", alt: "Juriste" },
  { src: "/images/marquee/architect2.jpg", alt: "Maître d'œuvre" },
];

// Fake results that appear when searching — teaser content
const FAKE_RESULTS: { specialty: string; handle: string; location: string }[] = [
  { specialty: "Avocat fiscaliste", handle: "@j•••_droit", location: "Paris" },
  { specialty: "Avocat droit des affaires", handle: "@m•••_legal", location: "Lyon" },
  { specialty: "Développeur fullstack", handle: "@t•••_dev", location: "Bordeaux" },
  { specialty: "Expert-comptable", handle: "@c•••_compta", location: "Marseille" },
  { specialty: "Architecte d'intérieur", handle: "@l•••_archi", location: "Nantes" },
  { specialty: "Chirurgien-dentiste", handle: "@s•••_dent", location: "Toulouse" },
  { specialty: "Consultant cybersécurité", handle: "@a•••_sec", location: "Paris" },
  { specialty: "Kinésithérapeute sport", handle: "@p•••_kine", location: "Nice" },
  { specialty: "Photographe corporate", handle: "@n•••_photo", location: "Lille" },
  { specialty: "Coach professionnel", handle: "@r•••_coach", location: "Strasbourg" },
  { specialty: "Notaire", handle: "@f•••_not", location: "Rennes" },
  { specialty: "Designer UX/UI", handle: "@d•••_ux", location: "Montpellier" },
  { specialty: "Trader indépendant", handle: "@b•••_trade", location: "Paris" },
  { specialty: "Ostéopathe", handle: "@g•••_osteo", location: "Lyon" },
  { specialty: "Graphiste freelance", handle: "@e•••_graph", location: "Bordeaux" },
];

export function AnimatedHero() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q.length >= 2
    ? FAKE_RESULTS.filter((r) =>
        r.specialty.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const hasResults = filtered.length > 0;

  return (
    <section className="relative bg-base-100 overflow-hidden">
      {/* 3D Marquee background */}
      <div className="absolute inset-0 marquee-opacity">
        <ThreeDMarquee images={MARQUEE_IMAGES} className="h-full" />
      </div>
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-base-100 via-base-100/80 to-base-100" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32 pb-16 lg:pb-28 text-center">
        <FadeIn delay={0}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight leading-[1.08]">
            Arrêtez de collaborer avec des{" "}
            <span className="highlight">inconnus</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.06}>
          <p className="mt-6 text-lg text-base-content/55 max-w-xl mx-auto leading-relaxed">
            Un club privé en bêta privée pour professionnels libéraux.
            Chaque demande d’accès est revue manuellement.
          </p>
        </FadeIn>

        {/* Search bar with fake results */}
        <FadeIn delay={0.1}>
          <div ref={containerRef} className="mt-10 max-w-2xl mx-auto relative">
            <div className="flex items-center bg-base-100 border border-base-300 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 pl-5 pr-2 py-2">
              <Search className="w-5 h-5 text-base-content/30 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => { if (q.length >= 2) setShowResults(true); }}
                placeholder="Aperçu flouté de l’espace réservé aux membres admis…"
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-base-content placeholder:text-base-content/35 px-3"
              />
              <Link href="/inscription" className="btn btn-accent btn-sm rounded-full px-5 cursor-pointer">
                Demander l’accès
              </Link>
            </div>

            {/* Fake blurred results dropdown */}
            {showResults && q.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-2xl shadow-xl overflow-hidden z-50 animate-[slide-up_0.15s_ease-out]">
                {hasResults ? (
                  <>
                    {filtered.map((r, i) => (
                      <Link
                        key={i}
                        href="/inscription"
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-base-200/50 transition-colors"
                      >
                        {/* Blurred avatar placeholder */}
                        <div className="w-10 h-10 rounded-full bg-base-300 blur-[2px] shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[14px] font-semibold text-base-content">
                            Aperçu flouté d&apos;un profil membre
                          </p>
                          <p className="text-[12px] text-base-content/40">
                            Informations visibles après admission
                          </p>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-base-content/20 shrink-0" />
                      </Link>
                    ))}
                    <Link
                      href="/inscription"
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-accent/[0.06] text-accent text-[13px] font-medium hover:bg-accent/10 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Demander l’accès à la bêta privée
                    </Link>
                  </>
                ) : (
                    <div className="px-5 py-4 text-center">
                      <p className="text-[13px] text-base-content/40">
                        Le club privé s&apos;ouvre progressivement aux membres admis
                      </p>
                    <Link
                      href="/inscription"
                      className="inline-flex items-center gap-1.5 mt-2 text-[13px] font-medium text-accent hover:text-accent/80 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Déposer une demande d’admission
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Trust signals */}
        <FadeIn delay={0.14}>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-sm text-base-content/50">
              <Shield className="w-4 h-4 text-accent" />
              <span>Vérification manuelle</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/50">
              <Users className="w-4 h-4 text-accent" />
              <span>Bêta privée</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/50">
              <Briefcase className="w-4 h-4 text-accent" />
              <span>Réseau de confiance</span>
            </div>
          </div>
        </FadeIn>

        {/* Avatars */}
        <FadeIn delay={0.18}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              <Image src="/images/person-1.jpg" alt="" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-base-100 object-cover" />
              <Image src="/images/person-2.jpg" alt="" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-base-100 object-cover" />
              <Image src="/images/person-3.jpg" alt="" width={36} height={36} className="w-9 h-9 rounded-full border-2 border-base-100 object-cover" />
            </div>
            <p className="text-sm text-base-content/45">
              Candidatures revues manuellement
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
