"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function AnimatedCTA() {
  return (
    <section className="py-14 bg-base-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="card bg-primary text-primary-content shadow-lg">
            <div className="card-body py-12 sm:py-16 px-8 sm:px-12 flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Prêt à rejoindre le réseau ?
                </h2>
                <p className="mt-2 text-primary-content/55 text-sm sm:text-base">
                  Inscription gratuite. Validation sous 24h. Aucun engagement.
                </p>
              </div>
              <Link href="/inscription" className="btn bg-base-100 text-base-content border-none hover:bg-base-200 shrink-0 cursor-pointer">
                Créer mon compte
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
