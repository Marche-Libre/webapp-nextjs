import Link from "next/link";
import type { Metadata } from "next";
import { XLogo } from "@/components/ui/x-logo";

export const metadata: Metadata = {
  title: "Accès anticipé",
  description:
    "Club privé pour profils orientés liberté. Identité X comme preuve, accès sponsorisé, revue humaine. Demandez l'accès.",
  openGraph: {
    title: "Accès anticipé | MarchéLibre",
    description:
      "Un club privé pour travailler entre profils qui partagent votre cap. X ouvre le dossier, un sponsor le situe, l'équipe lit avant d'ouvrir les espaces.",
  },
};

type SearchParams = Promise<{ ref?: string | string[] }>;

function normalizeRef(value: string | string[] | undefined): string {
  if (!value) return "";
  const raw = Array.isArray(value) ? value[0] : value;
  return raw.replace(/^@+/, "").replace(/[^A-Za-z0-9_]/g, "").trim();
}

function buildCtaHref(ref: string): string {
  if (!ref) return "/rejoindre";
  return `/rejoindre?ref=${encodeURIComponent(ref)}`;
}

export default async function EarlyAccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const ref = normalizeRef(params.ref);
  const ctaHref = buildCtaHref(ref);

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-bg-elevated text-text-primary">
      <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-6 lg:max-w-4xl lg:px-8">
        {/* Minimal header */}
        <header className="mb-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[15px] font-semibold tracking-tight text-text-primary"
          >
            <img
              src="/images/logo.png"
              alt="MarchéLibre"
              className="h-8 w-8 rounded-2xl object-contain"
            />
            <span>MarchéLibre</span>
          </Link>

          <Link
            href={ctaHref}
            className="text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Demander l&apos;accès
          </Link>
        </header>

        {/* Hero — first viewport, immediate private club + access signal */}
        <section className="pt-6 pb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-400">
            Identité X · Accès sponsorisé · Revue humaine
          </div>

          <h1 className="mt-6 text-balance text-[clamp(2.35rem,7.2vw,3.65rem)] font-semibold leading-[0.96] tracking-[-0.048em]">
            Un club privé pour travailler entre profils qui partagent votre cap.
          </h1>

          <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-text-secondary sm:text-[15.5px]">
            X ouvre le dossier. Un sponsor le situe. L&apos;équipe lit avant d&apos;ouvrir les espaces privés.
          </p>

          <div className="mt-8">
            <AccessCta href={ctaHref} />
          </div>

          <p className="mt-3 text-xs text-text-muted">
            Accès anticipé. Admission manuelle.
          </p>
        </section>

        {/* Trust signals — messaging native, quiet */}
        <section className="border-t border-white/8 pt-9">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <XLogo className="h-3.5 w-3.5" />
                Identité X
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                Votre profil public est le premier contexte. Pas de pseudonyme vide.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">Sponsor explicite</div>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                Un nom réel accompagne la demande. Pas un signal vague.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">Revue humaine</div>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                L&apos;accès n&apos;est accordé qu&apos;après lecture du dossier. Pas d&apos;automatisme.
              </p>
            </div>
          </div>
        </section>

        {/* Inside — what members actually do (brief) */}
        <section className="mt-16 border-t border-white/8 pt-9">
          <div className="text-xs uppercase tracking-[0.18em] text-text-muted">À l&apos;intérieur</div>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
            Conversations utiles entre personnes qui ont déjà un contexte partagé.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-text-secondary">
            <span>Entreprises</span>
            <span className="text-white/20">·</span>
            <span>Politique</span>
            <span className="text-white/20">·</span>
            <span>Projets</span>
            <span className="text-white/20">·</span>
            <span>Emplois</span>
            <span className="text-white/20">·</span>
            <span>Opportunités</span>
            <span className="text-white/20">·</span>
            <span>Annonces</span>
            <span className="text-white/20">·</span>
            <span>Collaboration</span>
          </div>
        </section>

        {/* Admission — 4 steps, compressed */}
        <section className="mt-16 border-t border-white/8 pt-9">
          <div className="text-xs uppercase tracking-[0.18em] text-text-muted">Demande d&apos;accès</div>

          <ol className="mt-5 space-y-5 text-[13.5px]">
            <li className="flex gap-4">
              <span className="mt-0.5 inline-block h-5 w-5 flex-none rounded-full border border-white/15 text-center text-[10px] leading-5 text-text-muted">01</span>
              <div>
                <span className="font-medium text-text-primary">Connexion avec X</span>
                <span className="text-text-secondary"> — Votre identité publique ouvre la demande.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="mt-0.5 inline-block h-5 w-5 flex-none rounded-full border border-white/15 text-center text-[10px] leading-5 text-text-muted">02</span>
              <div>
                <span className="font-medium text-text-primary">Dossier bref</span>
                <span className="text-text-secondary"> — Vous confirmez ce qui situe votre activité.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="mt-0.5 inline-block h-5 w-5 flex-none rounded-full border border-white/15 text-center text-[10px] leading-5 text-text-muted">03</span>
              <div>
                <span className="font-medium text-text-primary">Sponsor</span>
                <span className="text-text-secondary"> — Le handle X d&apos;un soutien ou membre est joint.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="mt-0.5 inline-block h-5 w-5 flex-none rounded-full border border-white/15 text-center text-[10px] leading-5 text-text-muted">04</span>
              <div>
                <span className="font-medium text-text-primary">Lecture avant ouverture</span>
                <span className="text-text-secondary"> — Décision humaine. Accès non automatique.</span>
              </div>
            </li>
          </ol>
        </section>

        {/* Final gate + CTA */}
        <section className="mt-16 border-t border-white/8 pt-9">
          <p className="max-w-[38ch] text-[15px] leading-relaxed text-text-secondary">
            Demandez l&apos;accès si quelqu&apos;un peut déjà vous situer. Le reste se passe en privé.
          </p>

          <div className="mt-6">
            <AccessCta href={ctaHref} />
          </div>

          <div className="mt-14 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted">
            <Link href="/mentions-legales" className="hover:text-text-secondary">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-text-secondary">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-text-secondary">CGU</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function AccessCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Demander l'accès"
      className="group inline-flex items-center gap-2 rounded-full bg-[#8fd7ff] p-1.5 text-[13px] font-semibold leading-none text-[#03131f] shadow-[0_18px_46px_rgba(29,155,240,0.16)] transition-[transform,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#a7e1ff] hover:shadow-[0_22px_54px_rgba(29,155,240,0.22)] active:scale-[0.98] sm:gap-3 sm:text-sm"
    >
      <span className="whitespace-nowrap pl-4 pr-1">Demander l&apos;accès</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#03131f] text-white motion-reduce:transform-none motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-[1px] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:scale-[1.03] sm:h-9 sm:w-9">
        <span aria-hidden="true" className="text-base leading-none">→</span>
      </span>
    </Link>
  );
}
