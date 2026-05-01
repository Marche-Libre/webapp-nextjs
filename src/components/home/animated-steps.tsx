"use client";

import { FadeIn } from "@/components/ui/motion";
import { XLogo } from "@/components/ui/x-logo";
import Image from "next/image";

const steps = [
  {
    num: "1",
    title: "Créez votre compte",
    desc: (
      <>
        Nom, e-mail et identifiant <XLogo className="w-3 h-3 inline -mt-0.5" />
      </>
    ),
  },
  {
    num: "2",
    title: "On vérifie votre profil",
    desc: (
      <>
        Un admin consulte votre{" "}
        <XLogo className="w-3 h-3 inline -mt-0.5" /> et active votre compte
      </>
    ),
  },
  {
    num: "3",
    title: "Le réseau est à vous",
    desc: <>Chat et profils vérifiés — un espace simple pour échanger</>,
  },
];

export function AnimatedSteps() {
  return (
    <>
      <section className="py-20 bg-base-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-sm font-bold text-accent tracking-wide uppercase mb-3">
                Comment ça marche
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                Actif en <span className="highlight">3 étapes</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={0.06 * i}>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-content text-sm font-bold flex items-center justify-center mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-base-content text-[15px]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-base-content/50 mt-1.5 leading-relaxed max-w-[240px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-base-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="card bg-base-100 shadow-md border border-base-300 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_340px]">
                <div className="card-body p-8 sm:p-12 justify-center">
                  <p className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-snug">
                    &laquo;{"\u2009"}On voulait un espace où chaque profil est{" "}
                    <span className="highlight">réel et vérifié</span>.
                    Fini les plateformes anonymes.{"\u2009"}&raquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-0.5 w-6 bg-accent rounded-full" />
                    <p className="text-sm text-base-content/45 font-medium">
                      La philosophie derrière MarchéLibre
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Image
                    src="/images/teamwork.jpg"
                    alt="Collaboration entre professionnels"
                    width={340}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
