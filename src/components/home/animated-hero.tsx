"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Shield, Users, Briefcase } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import Image from "next/image";

export function AnimatedHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/annuaire?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/annuaire");
    }
  };

  return (
    <section className="bg-base-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32 pb-16 lg:pb-28 text-center">
        <FadeIn delay={0}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight leading-[1.08]">
            Arrêtez de collaborer avec des{" "}
            <span className="highlight">inconnus</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.06}>
          <p className="mt-6 text-lg text-base-content/55 max-w-xl mx-auto leading-relaxed">
            Le premier réseau fermé de professionnels libéraux en France.
            Chaque membre est vérifié manuellement.
          </p>
        </FadeIn>

        {/* Search bar */}
        <FadeIn delay={0.1}>
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
            <div className="flex items-center bg-base-100 border border-base-300 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 pl-5 pr-2 py-2">
              <Search className="w-5 h-5 text-base-content/30 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un professionnel, une annonce, une offre…"
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-base-content placeholder:text-base-content/35 px-3"
              />
              <button type="submit" className="btn btn-accent btn-sm rounded-full px-5 cursor-pointer">
                Rechercher
              </button>
            </div>
          </form>
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
              <span>100% profils vérifiés</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/50">
              <Briefcase className="w-4 h-4 text-accent" />
              <span>Annonces et offres</span>
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
              Rejoints par des professionnels vérifiés
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
