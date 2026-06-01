import { XLogo } from "@/components/ui/x-logo";
import { cn } from "@/lib/utils";
import styles from "./acces-prive.module.css";

type AccessStoryRailProps = {
  referralHandle: string;
  className?: string;
};

type StoryPanel = {
  key: "identity" | "sponsor" | "review";
  eyebrow: string;
  title: string;
  body: string;
  aside: string;
  notes: string[];
};

const STORY_PANELS: StoryPanel[] = [
  {
    key: "identity",
    eyebrow: "Signal public",
    title: "Le profil X sert d'entrée, pas de passe-droit.",
    body: "Le club ne remplace pas l'identité par un formulaire plus long. Il part d'un profil déjà lisible.",
    aside: "contexte avant contact",
    notes: [
      "bio, ton et graphe social visibles",
      "pas d'identité parallèle à maintenir",
      "la demande commence sans friction inutile",
    ],
  },
  {
    key: "sponsor",
    eyebrow: "Signal privé",
    title: "Le sponsor ne décide pas seul. Il situe la demande.",
    body: "Le handle joint à la demande dit d'où vient la relation. Il ne remplace pas la lecture humaine.",
    aside: "confiance jointe",
    notes: [
      "@sponsor ajouté au dossier",
      "la relation est explicite dès l'entrée",
      "le signal reste court mais vérifiable",
    ],
  },
  {
    key: "review",
    eyebrow: "Lecture finale",
    title: "L'équipe lit avant d'ouvrir les espaces privés.",
    body: "Le produit garde un ton calme parce que l'accès n'est ni instantané ni mis en scène publiquement.",
    aside: "lecture finale",
    notes: [
      "pas de volume recherché pour lui-même",
      "les espaces restent fermés tant que le dossier n'est pas lu",
      "la sélection protège la qualité des échanges",
    ],
  },
] as const;

export function AccessStoryRail({
  referralHandle,
  className,
}: AccessStoryRailProps) {
  const normalizedPanels = STORY_PANELS.map((panel) =>
    panel.key === "sponsor"
      ? {
          ...panel,
          notes: [
            `${referralHandle ? `@${referralHandle}` : "@sponsor"} joint à la demande`,
            panel.notes[1],
            panel.notes[2],
          ],
        }
      : panel,
  );

  function renderPanel(panel: StoryPanel, index: number) {
    return <StoryPanelCard key={panel.key} index={index} panel={panel} />;
  }

  const panelElements = normalizedPanels.map(renderPanel);

  return (
    <section className={cn("relative py-24 lg:py-32", className)}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className={cn("max-w-2xl lg:sticky lg:top-26", styles.reveal)}>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-primary-400">
            Pourquoi l'entrée reste lente
          </div>
          <h2 className="mt-4 text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-text-primary">
            Trois signaux courts avant que quelque chose d'utile circule.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">
            La page promet peu parce que le produit dépend surtout d'une
            frontière crédible entre ce qui reste public et ce qui s'ouvre
            après admission.
          </p>
        </div>

        <ol className="relative grid gap-5 lg:gap-7">{panelElements}</ol>
      </div>
    </section>
  );
}

function StoryPanelCard({
  index,
  panel,
}: {
  index: number;
  panel: StoryPanel;
}) {
  const noteElements =
    panel.key === "review"
      ? panel.notes.map(renderReviewNote)
      : panel.notes.map(renderStoryNote);
  const contentClassName =
    panel.key === "sponsor"
      ? "bg-[linear-gradient(180deg,rgba(7,11,18,0.88),rgba(4,8,14,0.98))]"
      : panel.key === "review"
        ? "bg-black/52"
        : "bg-black/46";
  const titleClassName =
    panel.key === "review"
      ? "max-w-[22rem] text-[1.72rem] font-medium leading-[1.1] tracking-[-0.045em] text-text-primary"
      : "max-w-[24rem] text-[1.5rem] font-medium leading-[1.14] tracking-[-0.04em] text-text-primary";
  const bodyClassName =
    panel.key === "review"
      ? "text-base leading-8 text-text-secondary"
      : "text-sm leading-7 text-text-secondary";

  return (
    <li
      className={cn(
        "group origin-top-left rounded-[2rem] border p-1 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
        index === 1
          ? "border-primary-500/18 bg-[linear-gradient(180deg,rgba(143,215,255,0.08),rgba(6,10,15,0.94))] lg:ml-10"
          : "border-white/10 bg-black/24",
        index === 2 ? "lg:ml-20" : "",
        index === 0 ? styles.reveal : styles.revealSlow,
      )}
    >
      <div
        className={cn(
          "rounded-[calc(2rem-0.25rem)] border border-white/10 px-5 py-5",
          contentClassName,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-primary-400">
              {panel.eyebrow}
            </div>
            <p className={cn("mt-4", titleClassName)}>
              {panel.title}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500/[0.16] text-primary-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <XLogo className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_11rem]">
          <p className={bodyClassName}>{panel.body}</p>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-text-secondary">
            {panel.aside}
          </div>
        </div>

        <ul className="mt-5 grid gap-3">{noteElements}</ul>
      </div>
    </li>
  );
}

function renderStoryNote(note: string) {
  return (
    <li
      key={note}
      className="rounded-[1.15rem] border border-white/10 bg-black/22 px-3 py-3 text-sm leading-6 text-text-secondary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
    >
      {note}
    </li>
  );
}

function renderReviewNote(note: string) {
  return (
    <li
      key={note}
      className="border-l border-primary-500/40 pl-4 text-sm leading-6 text-text-secondary"
    >
      {note}
    </li>
  );
}
