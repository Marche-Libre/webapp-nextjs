import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { XLogo } from "@/components/ui/x-logo";
import { PREVIEW_IMAGES, createPageMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";
import { AccessStoryRail } from "./access-story-rail";
import styles from "./acces-prive.module.css";

const ACCESS_ROUTE = "/rejoindre";

export const metadata: Metadata = createPageMetadata({
  title: "Accès privé",
  description:
    "Découvrez MarchéLibre, club privé à accès sponsorisé pour profils orientés liberté, avec identité X et revue manuelle.",
  path: "/acces-prive",
  images: PREVIEW_IMAGES.authAccess,
  imageAlt: "Accès privé MarchéLibre",
});

type EarlyAccessPageProps = {
  searchParams: Promise<{
    ref?: string | string[] | undefined;
  }>;
};

type ClubTopic = {
  label: string;
  description: string;
};

type TrustLine = {
  label: string;
  detail: string;
};

type AdmissionStep = {
  title: string;
  description: string;
  signal: string;
};

type FooterLink = {
  href: string;
  label: string;
};

const SIGNAL_TICKER_PRIMARY = [
  "Entreprises / demandes ciblées",
  "Politique / signaux utiles",
  "Projets / partenaires fiables",
  "Emplois / recommandations nettes",
  "Annonces / messages courts",
] as const;

const SIGNAL_TICKER_SECONDARY = [
  "Identité X comme contexte initial",
  "Sponsor explicite joint à la demande",
  "Lecture humaine avant ouverture",
  "Accès privé, pas place publique",
] as const;

const CLUB_TOPICS: ClubTopic[] = [
  {
    label: "Entreprises",
    description: "Demandes ciblées, mises en relation et retours d'exécution.",
  },
  {
    label: "Politique",
    description: "Lectures rapides, signaux utiles et coordination discrète.",
  },
  {
    label: "Projets",
    description: "Associés, opérateurs, partenaires, soutien précis.",
  },
  {
    label: "Emplois",
    description: "Recherche sérieuse, recommandations, opportunités nettes.",
  },
  {
    label: "Annonces",
    description: "Messages courts quand quelque chose mérite d'être vu.",
  },
] as const;

const TRUST_LINES: TrustLine[] = [
  {
    label: "Identité X",
    detail: "Le profil public sert de premier contexte avant la demande.",
  },
  {
    label: "Sponsor explicite",
    detail: "Un nom réel accompagne la demande au lieu d'un signal vague.",
  },
  {
    label: "Revue humaine",
    detail: "L'accès n'est accordé qu'après lecture du dossier.",
  },
] as const;

const ADMISSION_STEPS: AdmissionStep[] = [
  {
    title: "Connexion avec X",
    description:
      "Votre identité publique ouvre la demande et fixe le niveau de contexte initial.",
    signal: "profil lisible",
  },
  {
    title: "Validation du dossier",
    description:
      "Vous confirmez les informations utiles pour situer votre activité et votre demande.",
    signal: "candidature brève",
  },
  {
    title: "Ajout du sponsor",
    description:
      "Vous indiquez le handle X d'un soutien ou d'un membre qui peut vous recommander.",
    signal: "confiance jointe",
  },
  {
    title: "Lecture avant ouverture",
    description:
      "L'équipe vérifie la cohérence du dossier avant d'ouvrir les espaces privés.",
    signal: "accès non automatique",
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

      <div className="relative mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-7xl flex-col overflow-x-hidden px-4 pb-18 pt-6 sm:px-6 lg:px-8">
        <EarlyAccessHeader ctaHref={ctaHref} />
        <HeroSection ctaHref={ctaHref} referralHandle={referralHandle} />
        <SignalTickerSection />
        <AccessStoryRail
          referralHandle={referralHandle}
          className={styles.revealSlow}
        />
        <InsideSection />
        <AdmissionSection ctaHref={ctaHref} referralHandle={referralHandle} />
        <FinalGateSection ctaHref={ctaHref} referralHandle={referralHandle} />
      </div>
    </main>
  );
}

function EarlyAccessHeader({ ctaHref }: { ctaHref: string }) {
  return (
    <header className="relative z-10 min-w-0">
      <Surface
        className="mx-auto w-full min-w-0 max-w-[23rem] sm:max-w-6xl"
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

          <AccessButton href={ctaHref} compact />
        </div>
      </Surface>
    </header>
  );
}

function SignalTickerSection() {
  const tickerRow = SIGNAL_TICKER_PRIMARY.map(renderTickerItem);
  const reverseTickerRow = SIGNAL_TICKER_SECONDARY.map(renderTickerItem);

  return (
    <section className={cn("py-10 lg:py-14", styles.reveal)}>
      <div className="rounded-[2rem] border border-white/8 bg-white/[0.025] p-1">
        <div className="overflow-hidden rounded-[calc(2rem-0.25rem)] border border-white/8 bg-black/18 py-4">
          <div className={styles.tickerTrack}>
            <div className="flex w-max items-center gap-3 px-3">{tickerRow}</div>
            <div
              aria-hidden="true"
              className="flex w-max items-center gap-3 px-3"
            >
              {tickerRow}
            </div>
          </div>

          <div className={cn("mt-3", styles.tickerTrackReverse)}>
            <div className="flex w-max items-center gap-3 px-3">
              {reverseTickerRow}
            </div>
            <div
              aria-hidden="true"
              className="flex w-max items-center gap-3 px-3"
            >
              {reverseTickerRow}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderTickerItem(label: string) {
  return (
    <span
      key={label}
      className="whitespace-nowrap px-3 text-[0.83rem] tracking-[0.14em] text-text-secondary uppercase"
    >
      {label}
    </span>
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
    <section className="py-16 lg:py-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-start">
        <div className={cn("min-w-0 max-w-3xl", styles.reveal)}>
          <SectionTag>Identité X, sponsor explicite, revue humaine.</SectionTag>
          <h1 className="mt-4 max-w-[15ch] text-[clamp(2.55rem,5vw,4.7rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-text-primary">
            Travaillez entre profils filtrés.
          </h1>

          <p className="mt-6 max-w-2xl text-[1.03rem] leading-8 text-text-secondary sm:text-[1.14rem]">
            X ouvre la demande, le sponsor la situe, l'équipe la relit avant
            d'ouvrir les espaces privés.
          </p>

          <div className="mt-8">
            <AccessButton href={ctaHref} />
          </div>
        </div>

        <HeroDesk
          referralHandle={referralHandle}
          className={cn("min-w-0", styles.revealSlow)}
        />
      </div>
    </section>
  );
}

function HeroDesk({
  referralHandle,
  className,
}: {
  referralHandle: string;
  className?: string;
}) {
  const roomElements = CLUB_TOPICS.slice(0, 4).map(renderHeroDeskRoom);
  const sponsorLabel = referralHandle ? `@${referralHandle}` : "@sponsor";
  const sponsorSummary = referralHandle
    ? `Sponsor joint: @${referralHandle}`
    : "Sponsor ajouté pendant la demande";

  return (
    <Surface
      className={cn("mx-auto w-full min-w-0 max-w-[34rem]", className)}
      innerClassName="overflow-hidden"
    >
      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative min-h-[18rem] min-w-0">
            <Image
              src="/images/freelancer.jpg"
              alt="Espace de travail discret"
              fill
              sizes="(min-width: 1024px) 28vw, 100vw"
              className="object-cover grayscale contrast-[1.18] brightness-[0.72]"
              preload
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/32 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/10 bg-black/54 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="max-w-[15rem] text-[1.4rem] font-medium leading-[1.16] tracking-[-0.035em] text-white">
              Le signal public ouvre. Le signal privé tranche.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 bg-black/26 p-5">
          <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-text-primary">
                Demande prête
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/[0.16] text-primary-400">
                <XLogo className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              X sert de base. {sponsorLabel} situe la relation. La lecture
              humaine ferme la boucle.
            </p>
            <p className="mt-3 rounded-full border border-white/10 bg-black/24 px-3 py-2 text-sm text-text-secondary">
              {sponsorSummary}
            </p>
          </div>

          <div className="rounded-[1.45rem] border border-white/10 bg-black/22 px-4 py-4">
            <p className="text-sm font-medium text-text-primary">
              Ce qui circule après admission
            </p>
            <ul className="mt-4 grid gap-3">{roomElements}</ul>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function renderHeroDeskRoom(topic: ClubTopic) {
  return (
    <li
      key={topic.label}
      className="flex items-start justify-between gap-3 border-b border-white/8 pb-3 last:border-b-0 last:pb-0"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{topic.label}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {topic.description}
        </p>
      </div>
    </li>
  );
}

function InsideSection() {
  const topicRows = CLUB_TOPICS.map(renderInsideTopicRow);

  return (
    <section className="py-24 lg:py-32">
      <div className={cn("max-w-3xl", styles.reveal)}>
        <h2 className="mt-4 text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-text-primary">
          Des conversations utiles, pas une place de marché publique.
        </h2>
        <p className="mt-5 text-base leading-8 text-text-secondary">
          Le club sert à demander un avis, partager un signal, débloquer un
          projet, recruter ou recommander. Le ton reste bref car les profils
          sont déjà situés.
        </p>
      </div>

      <Surface
        className={cn("mt-8 mx-auto w-full min-w-0 max-w-6xl", styles.revealSlow)}
        innerClassName="px-5 py-5 sm:px-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/24 p-1 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
              <div className="relative min-h-[14rem] overflow-hidden rounded-[calc(2rem-0.25rem)]">
                <Image
                  src="/images/workspace.jpg"
                  alt="Espace de travail discret"
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  className="object-cover grayscale contrast-[1.08] brightness-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />
                <p className="absolute inset-x-5 bottom-5 max-w-[14rem] text-[1.35rem] font-medium leading-[1.18] tracking-[-0.03em] text-white">
                  Les échanges restent exploitables parce que l'entrée reste
                  filtrée.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary-500/18 bg-[linear-gradient(180deg,rgba(143,215,255,0.08),rgba(6,10,15,0.94))] px-5 py-5 shadow-[0_20px_54px_rgba(5,10,18,0.28)]">
              <p className="text-lg font-medium leading-8 tracking-[-0.03em] text-text-primary">
                Pas d'accès instantané, pas de promesse de volume, pas de bruit
                public à entretenir.
              </p>
            </div>
          </div>

          <div className="grid gap-5">{topicRows}</div>
        </div>
      </Surface>
    </section>
  );
}

function renderInsideTopicRow(topic: ClubTopic) {
  return (
    <div
      key={topic.label}
      className="grid gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.02] px-4 py-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
    >
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-text-muted">
        {topic.label}
      </p>
      <p className="text-base leading-7 text-text-secondary">
        {topic.description}
      </p>
    </div>
  );
}

function AdmissionSection({
  ctaHref,
  referralHandle,
}: {
  ctaHref: string;
  referralHandle: string;
}) {
  const stepElements = ADMISSION_STEPS.map(renderAdmissionStep);
  const sponsorNote = referralHandle
    ? `Parrain détecté: @${referralHandle}. Le sponsor sera transmis avec votre demande d'accès.`
    : "Vous pouvez ajouter le handle X d'un supporter ou sponsor pendant la demande.";

  return (
    <section id="admission" className="py-24 lg:py-32">
      <div className={cn("max-w-3xl", styles.reveal)}>
        <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-text-primary">
          Une demande courte. Une décision lente.
        </h2>
        <p className="mt-5 text-base leading-8 text-text-secondary">
          Le formulaire reste bref parce que les vrais signaux sont ailleurs:
          profil public, sponsor explicite, lecture avant admission.
        </p>
        <p className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-text-secondary">
          {sponsorNote}
        </p>
      </div>

      <Surface
        className={cn("mt-8 mx-auto w-full min-w-0 max-w-6xl", styles.revealSlow)}
        innerClassName="px-5 py-5 sm:px-6"
      >
        <ol className="grid gap-5">{stepElements}</ol>

        <div className="mt-6 border-t border-white/10 pt-5">
          <AccessButton href={ctaHref} />
        </div>
      </Surface>
    </section>
  );
}

function renderAdmissionStep(step: AdmissionStep) {
  return (
    <li
      key={step.title}
      className="grid gap-3 border-b border-white/10 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start sm:gap-6"
    >
      <div className="min-w-0">
        <p className="text-lg font-medium tracking-[-0.02em] text-text-primary">
          {step.title}
        </p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          {step.description}
        </p>
      </div>
      <div className="rounded-[1.2rem] border border-white/10 bg-black/22 px-3 py-3 text-sm text-text-secondary">
        {step.signal}
      </div>
    </li>
  );
}

function FinalGateSection({
  ctaHref,
  referralHandle,
}: {
  ctaHref: string;
  referralHandle: string;
}) {
  const footerLinkElements = FOOTER_LINKS.map(renderFooterLink);
  const sponsorLabel = referralHandle
    ? `Un dossier avec @${referralHandle} peut partir immédiatement.`
    : "Le sponsor peut être ajouté pendant la demande si quelqu'un peut déjà vous situer.";

  return (
    <footer className="pb-4 pt-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] border border-primary-500/18 bg-[radial-gradient(circle_at_top_left,rgba(143,215,255,0.18),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:px-6 lg:px-8 lg:py-9",
          styles.reveal,
        )}
      >
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary-500/[0.12] blur-3xl" />

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)] lg:items-end">
          <div className="max-w-3xl">
            <h2 className="mt-4 text-[clamp(2.1rem,4vw,3.6rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-text-primary">
              Demandez l'accès si quelqu'un peut déjà vous situer.
            </h2>
            <p className="mt-4 text-base leading-8 text-text-secondary">
              Connexion X, dossier bref, handle du sponsor, puis lecture
              humaine. Rien de plus à promettre publiquement.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-black/28 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
            <p className="text-[0.78rem] font-medium tracking-[0.14em] text-text-muted">
              Demande d'accès
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {sponsorLabel}
            </p>

            <div className="mt-5 rounded-[1.45rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-sm font-medium text-text-primary">
                X ouvre le dossier.
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Le sponsor le situe. La lecture tranche avant l'ouverture.
              </p>
            </div>

            <div className="mt-6">
              <AccessButton href={ctaHref} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            MarchéLibre · accès privé sponsorisé
          </p>
          <div className="flex flex-wrap items-center gap-4">{footerLinkElements}</div>
        </div>
      </div>
    </footer>
  );
}

function renderFooterLink(link: FooterLink) {
  return (
    <Link
      key={link.href}
      href={link.href}
      className="text-sm text-text-secondary underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-text-primary hover:underline"
    >
      {link.label}
    </Link>
  );
}

function AccessButton({
  href,
  compact = false,
}: {
  href: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Demander l'accès"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-[#8fd7ff] p-1.5 text-[13px] font-semibold leading-none text-[#03131f] shadow-[0_18px_46px_rgba(29,155,240,0.16)] transition-[transform,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#a7e1ff] hover:shadow-[0_22px_54px_rgba(29,155,240,0.22)] active:scale-[0.98] sm:gap-3 sm:text-sm",
        compact ? "pl-3 pr-2.5" : "pl-4 pr-2.5",
      )}
    >
      <span className="whitespace-nowrap">Demander l&apos;accès</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#03131f] text-white motion-reduce:transform-none motion-reduce:transition-none motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-[1px] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:scale-[1.03] sm:h-9 sm:w-9">
        <span aria-hidden="true" className="text-base leading-none">
          →
        </span>
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

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-primary-400">
      {children}
    </div>
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
