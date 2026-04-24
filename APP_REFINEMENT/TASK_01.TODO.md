# TASK_01 - Generer `app_flow.md`

## Objectif

Creer `app_flow.md`, document de reference des routes, guards, redirections et flux applicatifs Next/Supabase.

Cette tache est documentaire: elle doit cartographier l'etat actuel et le MVP cible avant de modifier les redirections `/forum`.

## Triage - Priorite Et Decoupage

Priorite globale: P0 pour le retrait `/forum`.

| Item | Priorite | Effort | Risque | Critere |
| --- | --- | --- | --- | --- |
| Auditer middleware global | P0 | S | Eleve | Conditions et destinations documentees |
| Auditer OAuth callback | P0 | S | Eleve | Referral, profil, redirection et erreurs documentes |
| Auditer pages auth/public | P0 | M | Moyen | Routes publiques et auth-only classees |
| Auditer layouts app/admin/chat | P0 | M | Eleve | Guards layout et redirects listes |
| Cartographier `/forum/**` | P0 | M | Eleve | Toutes routes forum marquees legacy/remove |
| Cartographier liens internes | P1 | M | Moyen | Sidebar, header, notifications, sponsorship, chat audites |
| Produire Mermaid | P1 | M | Moyen | Diagrammes rendables |

Ordre conseille: guards centraux, auth/onboarding, routes app, recherche liens `/forum`/`/membres`, creation `app_flow.md`, puis validation Mermaid.

## Sources A Inspecter

- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/connexion/page.tsx`
- `src/app/(auth)/inscription/page.tsx`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/rejoindre/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/chat/layout.tsx`
- `src/app/(app)/chat/page.tsx`
- `src/app/(app)/chat/[slug]/page.tsx`
- `src/app/(app)/admin/layout.tsx`
- `src/app/(app)/admin/page.tsx`
- `src/app/(app)/admin/utilisateurs/page.tsx`
- `src/app/(app)/profil/page.tsx`
- `src/app/(app)/parametres/page.tsx`
- `src/app/(app)/notifications/page.tsx`
- `src/app/(app)/parrainages/page.tsx`
- `src/app/(app)/membres/page.tsx`
- `src/app/(app)/membres/[id]/page.tsx`
- `src/app/(app)/forum/**`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`
- `src/components/sponsorship/**`
- `src/components/chat/**`
- `src/components/membres/**`
- `src/lib/notifications.ts`

## Routes A Documenter

| Route | Statut Attendu |
| --- | --- |
| `/` | public |
| `/rejoindre` | public, referral cookie |
| `/connexion` | public/auth |
| `/inscription` | public/auth |
| `/auth/callback` | route serveur OAuth |
| `/en-attente` | auth pending/rejected |
| `/onboarding` | approved non onboarded |
| `/chat` | member-only |
| `/chat/[slug]` | member-only |
| `/profil` | member-only |
| `/parametres` | member-only |
| `/notifications` | member-only |
| `/parrainages` | sponsor/admission conserve; UX route a confirmer |
| `/admin` | admin-only |
| `/admin/utilisateurs` | admin-only |
| `/membres` | legacy annuaire standalone |
| `/membres/[id]` | fiche membre interne a confirmer |
| `/forum/**` | legacy/remove |
| `/api/geo/cities` | API publique ou protegee a confirmer |
| `/cgu`, `/mentions-legales`, `/confidentialite` | legales, doivent etre publiques |

## Diagrammes Mermaid A Produire

- `flowchart TD`: guards globaux et redirections.
- `stateDiagram-v2`: etats `anonymous`, `pending`, `rejected`, `approved_not_onboarded`, `approved_onboarded`, `admin`.
- `sequenceDiagram`: inscription X avec `/rejoindre?ref=...`, cookie `ml-referral`, callback, `sponsorship_requests`.
- `sequenceDiagram`: sponsor approuve le parrainage, admin approuve l'acces.
- `flowchart TD`: navigation MVP cible apres retrait forum/annuaire standalone.
- `flowchart TD`: notifications minimales.

## Divergences Actuelles A Capturer

- Plusieurs redirections pointent encore vers `/forum`.
- `rejected` peut creer une boucle ou une experience confuse entre `/en-attente` et `/connexion`.
- Pages legales existent mais ne semblent pas toutes dans les routes publiques middleware.
- `/membres` est le libelle Annuaire, il n'existe pas de route `/annuaire`.
- Onboarding cree encore du contenu forum.
- Notifications et embeds peuvent pointer vers `/forum/posts/...`.
- `chat?channel=...` est utilise par certains liens mais le chat semble route par slug.

## Critères De Completion

- `app_flow.md` existe.
- L'etat actuel et la cible MVP sont dans deux sections separees.
- Chaque route a un statut: `public`, `auth-only`, `member-only`, `admin-only`, `legacy`, `remove`, `unknown`.
- Chaque redirection critique est listee avec source, condition, destination actuelle, destination cible.
- Les flux auth, onboarding, sponsorship, admin approval et notifications sont documentes.
- Les diagrammes Mermaid sont rendables.
- Aucun diagramme cible MVP ne fait de `/forum` la destination principale.
- Les boucles potentielles sont signalees.
- Le document distingue l'etat actuel du MVP cible.

## Risques

- Remplacer `/forum` trop tot sans verifier les liens historiques.
- Confondre retrait de l'annuaire avec suppression de toute fiche membre.
- Oublier les routes serveur ou pages legales.
- Documenter un flux cible incompatible avec les guards actuels.

## Temoin - Corrections Integrees

- Inclure les pages legales dans l'audit public/private.
- Modeliser les boucles `rejected`.
- Documenter `/membres` comme route Annuaire, pas `/annuaire`.
- Inclure `/auth/callback` et `/api/geo/cities`.
