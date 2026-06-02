import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { PREVIEW_IMAGES, createPageMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";
import styles from "./landing3.module.css";

const ACCESS_ROUTE = "/rejoindre";

export const metadata: Metadata = createPageMetadata({
  title: "Accès privé",
  description:
    "Découvrez MarchéLibre, club privé à accès sponsorisé pour profils orientés liberté, avec identité X et revue manuelle.",
  path: "/landing3",
  images: PREVIEW_IMAGES.authAccess,
  imageAlt: "Accès privé MarchéLibre",
});

type EarlyAccessPageProps = {
  searchParams: Promise<{
    ref?: string | string[] | undefined;
  }>;
};

type ConversationRow = {
  room: string;
  summary: string;
};

type AdmissionStep = {
  id: string;
  title: string;
  description: string;
};

type FooterLink = {
  href: string;
  label: string;
};

type SignalItem = {
  title: string;
  description: string;
};

type ActivityTile = {
  title: string;
  description: string;
  tone?: "accent" | "default";
  className?: string;
};

const CONVERSATION_ROWS: ConversationRow[] = [
  {
    room: "Entreprises",
    summary: "Mises en relation ciblées, deals et retours de terrain.",
  },
  {
    room: "Politique",
    summary: "Débriefs rapides, signaux utiles et lectures coordonnées.",
  },
  {
    room: "Projets",
    summary: "Recherche d'associés, d'opérateurs ou de partenaires fiables.",
  },
  {
    room: "Emplois",
    summary: "Demandes précises, recommandations et opportunités qualifiées.",
  },
] as const;

const ADMISSION_STEPS: AdmissionStep[] = [
  {
    id: "01",
    title: "Connexion avec X",
    description:
      "Votre identité X ouvre la demande et donne un premier niveau de contexte.",
  },
  {
    id: "02",
    title: "Validation du profil",
    description:
      "Vous confirmez les informations utiles à la revue et au positionnement dans le club.",
  },
  {
    id: "03",
    title: "Ajout du sponsor",
    description:
      "Vous indiquez le @handle d'un soutien ou d'un membre qui vous recommande.",
  },
  {
    id: "04",
    title: "Revue d'admission",
    description:
      "L'équipe vérifie la cohérence du dossier avant de donner accès aux espaces privés.",
  },
] as const;

const MOBILE_SIGNAL_ITEMS: SignalItem[] = [
  {
    title: "Identité X",
    description: "Le profil public sert de point d'entrée.",
  },
  {
    title: "Parrainage",
    description: "Un sponsor explicite accompagne la demande.",
  },
  {
    title: "Revue humaine",
    description: "L'accès reste lu avant admission.",
  },
] as const;

const ACTIVITY_TILES: ActivityTile[] = [
  {
    title: "Entreprises",
    description: "Demandes ciblées, mises en relation et retours terrain.",
    tone: "accent",
    className: "md:col-span-2",
  },
  {
    title: "Politique",
    description: "Lectures rapides, signaux utiles, coordination discrète.",
  },
  {
    title: "Projets",
    description: "Recherche d'associés, d'opérateurs, de partenaires.",
  },
  {
    title: "Annonces et opportunités",
    description: "Appels clairs, offres nettes, recommandations traçables.",
    className: "md:col-span-2 xl:col-span-1",
  },
] as const;

const FOOTER_LINKS: FooterLink[] = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
] as const;

export default async function AccesPrivePage({
  searchParams,
}: EarlyAccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const referralHandle = normalizeReferralHandle(resolvedSearchParams.ref);
  const ctaHref = buildAccessHref(referralHandle);

  return (
    <main className="relative min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-bg-elevated text-text-primary">
      <PageBackdrop />

      <div className="relative mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-6xl flex-col overflow-x-hidden px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <EarlyAccessHeader ctaHref={ctaHref} />
        <HeroSection ctaHref={ctaHref} referralHandle={referralHandle} />
        <HeroSignalStrip />
        <EvidenceSection />
        <InsideSection />
        <AdmissionSection referralHandle={referralHandle} />
        <FinalGateSection ctaHref={ctaHref} />
      </div>
    </main>
  );
}

function EarlyAccessHeader({ ctaHref }: { ctaHref: string }) {
  return (
    <header className="relative z-10 min-w-0">
      <Surface
        className="mx-auto w-full min-w-0 max-w-[23rem] sm:max-w-5xl"
        innerClassName="px-3 py-2.5 sm:px-5 sm:py-3"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-3 text-sm font-medium tracking-tight text-text-primary"
          >
            <Image
              src="/images/logo.png"
              alt="MarchéLibre"
              width={40}
              height={40}
              className="h-10 w-10 rounded-2xl object-contain"
            />
            <span className="truncate text-[15px] font-semibold max-[430px]:hidden sm:text-base">
              MarchéLibre
            </span>
          </Link>

          <AccessButton href={ctaHref} compact mobileLabel="Accès" />
        </div>
      </Surface>
    </header>
  );
}

function HeroSection({
  ctaHref,
  referralHandle,
}: {
  ctaHref: string;
  referralHandle: string;
}) {
  return (
    <section className="py-12 lg:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
        <div className={cn("min-w-0 max-w-[22rem] sm:max-w-2xl", styles.reveal)}>
          <p className="text-[0.74rem] font-medium tracking-[0.12em] text-primary-400">
            Accès sponsorisé, revue humaine.
          </p>
          <h1 className="max-w-[22rem] break-words text-[clamp(2.1rem,9vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.05em] sm:max-w-4xl sm:text-[clamp(2.8rem,4.8vw,4.45rem)]">
            Travaillez entre profils filtrés.
          </h1>

          <p className="mt-6 max-w-[22rem] text-base leading-8 text-text-secondary sm:max-w-xl sm:text-[1.14rem]">
            MarchéLibre réunit des personnes orientées liberté qui veulent se
            trouver, se recommander et collaborer sans bruit inutile.
          </p>

          <div className="mt-8">
            <AccessButton href={ctaHref} />
          </div>
        </div>

        <ConversationPreview referralHandle={referralHandle} />
      </div>
    </section>
  );
}

function HeroSignalStrip() {
  const signalElements = MOBILE_SIGNAL_ITEMS.map((item) => {
    return (
      <li
        key={item.title}
        className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/[0.14] text-primary-400">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {item.description}
            </p>
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className={cn("mt-10 lg:hidden", styles.revealSlow)}>
      <div className="rounded-[2rem] border border-white/10 bg-black/22 p-1 shadow-[0_18px_46px_rgba(0,0,0,0.2)]">
        <div className="rounded-[calc(2rem-0.25rem)] border border-white/10 bg-black/45 px-4 py-4">
          <ul className="grid gap-3">{signalElements}</ul>
        </div>
      </div>
    </div>
  );
}

function ConversationPreview({ referralHandle }: { referralHandle: string }) {
  const conversationElements = CONVERSATION_ROWS.map((row) => (
    <li key={row.room} className="flex min-w-0 items-start gap-3">
      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary-400" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{row.room}</p>
        <p className="mt-1 text-sm leading-7 text-white/68">{row.summary}</p>
      </div>
    </li>
  ));

  const sponsorStatusLabel = referralHandle
    ? `Sponsor: @${referralHandle}`
    : "Sponsor demandé";

  return (
    <div className={cn("hidden lg:block", styles.revealSlow)}>
      <Surface
        className="mx-auto w-full min-w-0 max-w-[38rem]"
        innerClassName="overflow-hidden"
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1.02fr)_minmax(280px,0.98fr)]">
          <div className="relative min-h-[34rem] min-w-0">
            <Image
              src="/images/freelancer.jpg"
              alt="Demande préparée avec contexte"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
              preload
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/12 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/10 bg-black/54 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="max-w-[16rem] text-[1.95rem] font-medium leading-[1.18] tracking-[-0.035em] text-white">
                Les demandes arrivent avec un profil X lisible et un lien de
                confiance explicite.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-6 bg-black/28 p-7">
            <div className="min-w-0">
              <p className="text-[0.82rem] font-medium tracking-[0.12em] text-text-muted">
                Ce qui circule ensuite
              </p>
              <ul className="mt-6 grid min-w-0 gap-5">{conversationElements}</ul>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500/[0.16] text-primary-400">
                  <XLogo className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Identité X</p>
                  <p className="mt-1 text-sm leading-6 text-white/62">
                    {sponsorStatusLabel}
                  </p>
                  <div className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-white/58">
                    Revue manuelle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function EvidenceSection() {
  return (
    <section className="py-22 lg:py-30">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
        <div className={cn("max-w-lg lg:sticky lg:top-28", styles.reveal)}>
          <h2 className="max-w-[18rem] text-[clamp(2rem,11vw,3rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text-primary sm:max-w-[21rem] sm:text-[clamp(2.35rem,3.8vw,3.7rem)] lg:max-w-[23rem]">
            Un cercle utile car l&apos;entrée reste traçable.
          </h2>
          <p className="mt-5 text-base leading-8 text-text-secondary">
            L&apos;accès ne cherche pas le volume: il garde des échanges utiles
            entre profils déjà contextualisés.
          </p>
        </div>

        <EvidenceGrid />
      </div>
    </section>
  );
}

function EvidenceGrid() {
  return (
    <>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:hidden">
        <ImageEvidenceCard
          className={styles.driftCard}
          src="/images/workspace.jpg"
          alt="Espace de travail discret"
          title="Le filtre garde les échanges exploitables."
        />
        <TrustLedgerCard className={styles.revealSlow} />
        <QuietEvidenceCard
          className={styles.reveal}
          title="Pas de bruit public"
          description="Le produit ressemble d'abord à un lieu de travail, pas à une vitrine marketing."
        />
      </div>

      <div className="hidden min-w-0 auto-rows-[minmax(10rem,auto)] gap-4 lg:grid lg:grid-cols-6 lg:grid-flow-dense">
        <ImageEvidenceCard
          className={cn("lg:col-span-4 lg:row-span-2", styles.driftCard)}
          src="/images/workspace.jpg"
          alt="Espace de travail discret"
          title="Le filtre garde les échanges exploitables."
        />
        <TextEvidenceCard
          className={cn("lg:col-span-2", styles.reveal)}
          title="Identité X"
          description="Le profil public donne un contexte lisible avant le premier échange."
        />
        <TextEvidenceCard
          className={cn("lg:col-span-2", styles.revealSlow)}
          title="Sponsor explicite"
          description="Chaque candidature mentionne un soutien réel, pas une promesse anonyme."
        />
        <QuietEvidenceCard
          className={cn("lg:col-span-2", styles.reveal)}
          title="Relecture manuelle"
          description="L'accès n'est ni instantané ni automatique. Il reste relu avant admission."
        />
        <TrustLedgerCard className={cn("lg:col-span-2", styles.driftCard)} />
        <QuietEvidenceCard
          className={cn("lg:col-span-2", styles.revealSlow)}
          title="Pas de bruit public"
          description="Le produit ressemble d'abord à un lieu de travail, pas à une vitrine marketing."
        />
      </div>
    </>
  );
}

function ImageEvidenceCard({
  src,
  alt,
  title,
  className,
}: {
  src: string;
  alt: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-1 shadow-[0_22px_60px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="relative h-full min-h-[16rem] overflow-hidden rounded-[calc(2rem-0.25rem)]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover saturate-[0.9] contrast-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
        <div className="absolute inset-x-5 bottom-5">
          <p className="max-w-[19rem] text-[1.7rem] font-medium leading-[1.22] tracking-[-0.03em] text-white">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function TrustLedgerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[2rem] border border-primary-500/18 bg-[linear-gradient(180deg,rgba(143,215,255,0.08),rgba(6,10,15,0.94))] px-5 py-5 shadow-[0_20px_54px_rgba(5,10,18,0.28)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="max-w-[16rem] text-[1.15rem] font-medium leading-7 tracking-[-0.03em] text-text-primary">
            Une demande arrive avec trois signaux lisibles avant l&apos;admission.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500/[0.16] text-primary-400">
          <XLogo className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <LedgerRow label="Identité X" value="profil public consultable" />
        <LedgerRow label="Sponsor" value="soutien joint à la demande" />
        <LedgerRow label="Revue" value="lecture avant ouverture" />
      </div>
    </div>
  );
}

function LedgerRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-black/24 px-3 py-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="text-sm text-text-secondary sm:text-right">{value}</span>
      </div>
    </div>
  );
}

function TextEvidenceCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[2rem] border border-white/10 bg-black/38 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      <div className="h-1 w-14 rounded-full bg-primary-500/60" />
      <p className="mt-5 text-lg font-medium tracking-[-0.02em] text-text-primary">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function QuietEvidenceCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[2rem] border border-border-default/60 bg-base-100/[0.74] px-5 py-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <p className="text-[0.82rem] font-medium tracking-[0.12em] text-text-muted">
        {title}
      </p>
      <p className="mt-4 text-base leading-8 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function InsideSection() {
  const activityElements = ACTIVITY_TILES.map((tile) => {
    return (
      <li
        key={tile.title}
        className={cn(
          "rounded-[2rem] border px-5 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.14)]",
          tile.tone === "accent"
            ? "border-primary-500/20 bg-primary-500/[0.08]"
            : "border-border-default/60 bg-base-100/[0.72]",
          tile.className,
          styles.reveal,
        )}
      >
        <div className="h-1 w-14 rounded-full bg-primary-500/60" />
        <p className="mt-5 text-lg font-medium tracking-[-0.02em] text-text-primary">
          {tile.title}
        </p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {tile.description}
        </p>
      </li>
    );
  });

  return (
    <section className="py-22 lg:py-30">
      <div className={cn("max-w-3xl", styles.reveal)}>
        <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text-primary">
          Des demandes nettes, des introductions utiles.
        </h2>
        <p className="mt-5 text-base leading-8 text-text-secondary">
          Le club sert à aller vite entre personnes alignées: demander un avis,
          débloquer un projet, recruter ou partager une opportunité claire.
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:auto-rows-[1fr]">
        {activityElements}
      </ul>
    </section>
  );
}

function AdmissionSection({
  referralHandle,
}: {
  referralHandle: string;
}) {
  const stepElements = ADMISSION_STEPS.map((step) => (
    <li
      key={step.id}
      className="relative border-b border-border-default/60 pb-7 last:border-b-0 last:pb-0"
    >
      <span className="absolute -left-[3.2rem] top-0 flex h-10 w-10 items-center justify-center rounded-full border border-border-default/70 bg-base-100 text-sm font-semibold text-text-primary">
        {step.id}
      </span>
      <p className="text-lg font-medium text-text-primary">{step.title}</p>
      <p className="mt-2 max-w-xl text-sm leading-7 text-text-secondary">
        {step.description}
      </p>
    </li>
  ));

  const sponsorNote = referralHandle ? (
    <p className="mt-6 rounded-[1.35rem] border border-primary-500/25 bg-primary-500/[0.08] px-4 py-3 text-sm leading-6 text-primary-400">
      Parrain détecté: @{referralHandle}. Le sponsor sera transmis avec votre
      demande d&apos;accès.
    </p>
  ) : (
    <p className="mt-6 rounded-[1.35rem] border border-border-default/60 bg-base-100/[0.68] px-4 py-3 text-sm leading-6 text-text-secondary">
      Vous pouvez ajouter le handle X d&apos;un supporter ou sponsor pendant la
      demande.
    </p>
  );

  return (
    <section id="admission" className="py-22 lg:py-30">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <div className={cn("max-w-lg", styles.reveal)}>
          <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text-primary">
            Quatre étapes, puis revue humaine.
          </h2>
          <p className="mt-5 text-base leading-8 text-text-secondary">
            La demande reste brève: connexion X, validation du profil, ajout du
            sponsor, puis lecture manuelle avant ouverture des espaces privés.
          </p>
          {sponsorNote}
        </div>

        <ol
          className={cn(
            "ml-3 border-l border-border-default/60 pl-11",
            styles.revealSlow,
          )}
        >
          {stepElements}
        </ol>
      </div>
    </section>
  );
}

function FinalGateSection({ ctaHref }: { ctaHref: string }) {
  const footerLinkElements = FOOTER_LINKS.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="text-sm text-text-secondary underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-primary hover:underline"
    >
      {link.label}
    </Link>
  ));

  return (
    <footer className="pb-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-[2.4rem] border border-primary-500/18 bg-[radial-gradient(circle_at_top_left,rgba(143,215,255,0.18),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-5 py-7 shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:px-6 lg:px-8 lg:py-9",
          styles.reveal,
        )}
      >
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary-500/[0.12] blur-3xl" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.92fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <h2 className="text-[clamp(2.1rem,4vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text-primary">
              Demandez l&apos;accès si vous avez déjà un signal réel à faire
              valoir.
            </h2>
            <p className="mt-4 text-base leading-8 text-text-secondary">
              Connexion X, détails de candidature, @handle du sponsor, puis
              revue humaine. Rien de plus.
            </p>
          </div>

          <div className="flex w-full items-start lg:w-auto lg:justify-end">
            <div className="rounded-[1.7rem] border border-primary-500/18 bg-black/26 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
              <AccessButton href={ctaHref} />
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                Dossier bref, sponsor explicite, lecture humaine.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <FinalSignal
            label="Connexion X"
            detail="profil public lisible dès l'entrée"
          />
          <FinalSignal
            label="Sponsor explicite"
            detail="un soutien réel accompagne la demande"
          />
          <FinalSignal
            label="Revue humaine"
            detail="l'accès reste lu avant validation"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            MarchéLibre · accès privé sponsorisé
          </p>
          <div className="flex flex-wrap items-center gap-4">{footerLinkElements}</div>
        </div>
      </div>
    </footer>
  );
}

function FinalSignal({
  label,
  detail,
}: Readonly<{
  label: string;
  detail: string;
}>) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-black/24 px-4 py-4">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p>
    </div>
  );
}

function AccessButton({
  href,
  mobileLabel,
  compact = false,
}: {
  href: string;
  mobileLabel?: string;
  compact?: boolean;
}) {
  const labelNode = mobileLabel ? (
    <>
      <span className="whitespace-nowrap sm:hidden">{mobileLabel}</span>
      <span className="hidden whitespace-nowrap sm:inline">
        Demander l&apos;accès
      </span>
    </>
  ) : (
    <span className="whitespace-nowrap">Demander l&apos;accès</span>
  );

  return (
    <Link
      href={href}
      aria-label="Demander l'accès"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-[#8fd7ff] p-1.5 text-[13px] font-semibold leading-none text-[#03131f] shadow-[0_18px_46px_rgba(29,155,240,0.16)] transition-[background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 hover:bg-[#a7e1ff] hover:shadow-[0_22px_54px_rgba(29,155,240,0.22)] sm:gap-3 sm:text-sm",
        compact ? "pl-2.5 pr-2 sm:pl-3 sm:pr-2.5" : "pl-4 pr-2.5",
      )}
    >
      {labelNode}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#03131f] text-white motion-reduce:transform-none motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:scale-[1.03] sm:h-9 sm:w-9">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function PageBackdrop() {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0", styles.pageAtmosphere)}
    />
  );
}

function Surface({
  children,
  className,
  innerClassName,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}>) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full rounded-[2rem] border border-white/10 bg-black/26 p-1 shadow-[0_24px_70px_rgba(15,20,25,0.18)]",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0 rounded-[calc(2rem-0.25rem)] border border-white/10 bg-black/50",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function normalizeReferralHandle(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return normalizeReferralHandle(value[0]);
  }

  if (!value) {
    return "";
  }

  return value.replace(/^@+/, "").replace(/[^A-Za-z0-9_]/g, "").trim();
}

function buildAccessHref(referralHandle: string): string {
  if (!referralHandle) {
    return ACCESS_ROUTE;
  }

  const queryParams = new URLSearchParams({
    ref: referralHandle,
  });

  return `${ACCESS_ROUTE}?${queryParams.toString()}`;
}
