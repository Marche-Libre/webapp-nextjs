# MarcheLibre Webapp

Application Next.js / Supabase du projet Le Marche Libre.

## Etat actuel

Au 2026-04-24, ce repo contient un prototype produit avance couvrant deja :

- auth X et session
- admission membre avec statuts
- onboarding et parrainage
- annuaire / profils
- forum
- chat / notifications
- admin

Le repo n'est cependant pas encore pleinement aligne avec le scope produit ecrit ni avec un niveau de qualite release-ready :

- `bun run build` passe
- `bun run lint` echoue
- `bunx vitest run` echoue partiellement
- le schema Supabase utilise en runtime n'est pas entierement reproductible depuis les migrations versionnees

Le cadrage, le PRD et la roadmap importes depuis
`Marche-Libre/le-marche-libre` sont maintenant centralises dans Speckit.

## Source de verite projet

Le point d'entree canonique pour le pilotage projet est Speckit:
`specs/004-release-readiness/tasks.md`.

Les sources importees du cadrage initial sont conservees dans:
`specs/archive/000-project-source-of-truth/README.md`.

GitHub Project 1 et `Marche-Libre/le-marche-libre` sont des sources importees,
pas des outils de pilotage actifs.

## Stack

- Next.js 16
- React 19
- TypeScript strict
- Supabase (auth, DB, storage, realtime)
- Tailwind CSS 4
- Vitest + Testing Library

## Commandes utiles

Depuis ce dossier :

```bash
bun run dev
bun run build
bun run start
bun run lint
bunx vitest run
```

## Zones fonctionnelles presentes

- landing + pages legales
- auth / callback OAuth
- onboarding
- forum
- annuaire membres
- profil et parametres
- chat
- notifications
- parrainages
- admin

## Risques connus

- drift entre code et scope produit ecrit
- drift entre code et schema Supabase versionne
- backlog GitHub encore peu representatif de l'etat reel du code
- absence de CI visible dans le repo

## Intention de travail

La priorite n'est pas d'ajouter de nouvelles features. La priorite est :

1. stabiliser les parcours coeur
2. rendre le schema et l'environnement reproductibles
3. realigner le backlog avec l'etat reel du produit
4. preparer une beta fermee proprement cadree
