"use client";

import { Shield, Users, Briefcase, Lock } from "lucide-react";
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

export function AnimatedHero() {
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

        {/* Admission-focused access card */}
        <FadeIn delay={0.1}>
          <div className="mt-10 max-w-2xl mx-auto rounded-3xl bg-base-100 border border-base-300 shadow-lg px-5 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-base-content">
                  Accès réservé aux candidats approuvés
                </p>
                <p className="mt-1 text-sm text-base-content/45">
                  X démarre une demande d’admission, puis l’équipe vérifie chaque candidature manuellement.
                </p>
              </div>
              <Link href="/inscription" className="btn btn-accent btn-sm rounded-full px-5 cursor-pointer">
                Demander l’accès
              </Link>
            </div>
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
