# US3 - Canaux et messages - Plan d'execution actualise

Mise a jour : 2026-05-13 (post-implementation US3 P0)

## Objectif

Consolider l'etat reel de l'US3 apres developpement, verifier les ecarts
restants, et expliciter la trajectoire de cloture.

## Canaux : actuel vs cible

### Canaux legacy identifies (avant normalisation)

- `general`
- `business`
- `recrutement`
- `aide`
- `random`

### Canaux cibles (taxonomie canonique exhaustive)

- `general`
- `business`
- `politique`
- `divers`
- `jobs`

### Regles de transition retenues

- `recrutement` -> remap vers `jobs`
- `random` -> remap vers `divers`
- `aide` -> suppression sans remap

## Etat implemente

### Base de donnees / migrations

- Migration ajoutee : `supabase/migrations/20260513230000_us3_launch_channel_taxonomy.sql`
- Upsert idempotent des 5 canaux canoniques.
- Permissions appliquees :
  - `read_permission = 'all'` sur les 5 canaux.
  - `write_permission = 'admin_only'` sur `jobs`.
  - `write_permission = 'all'` sur `general`, `business`, `politique`,
    `divers`.
- Remap des messages :
  - `recrutement` -> `jobs`
  - `random` -> `divers`
- Remap des memberships `channel_members` avec deduplication via
  `ON CONFLICT DO NOTHING`.
- Suppression des canaux legacy : `recrutement`, `aide`, `random`.

### Frontend / produit

- Type `Channel` etendu avec `read_permission` et `write_permission`.
- Liste des canaux chat cote layout limitee explicitement aux 5 slugs canoniques.
- Ordre stable de ces canaux via helper central
  `src/lib/chat/channels.ts`.
- Composer desactive si l'utilisateur ne peut pas ecrire dans le canal.
- Message explicite dans Jobs pour non-admin :
  `Seuls les admins peuvent publier dans Jobs.`
- Blocage du submit (clic + clavier) quand `canWrite = false`.
- Lien de notification de mention rendu canonique vers `/chat/<slug>` quand le
  slug est connu (fallback legacy conserve).
- Provider de notifications compatible :
  - liens legacy `?channel=<id>`
  - liens canoniques `/chat/<slug>`
- Recherche globale (header) filtree sur les canaux canoniques uniquement.

### Tests

- Renforcement de `src/__tests__/authorization-hardening.test.ts` :
  - presence/attendus de la migration US3
  - garde UI no-permission du composer
  - liens canoniques de notification
  - filtrage recherche globale sur les slugs canoniques
  - filtrage des canaux dans le layout chat
- Campagne executee :
  - `vitest` cible US3 chat/notifications/link-preview : OK
  - `lint` cible fichiers modifies : OK
  - `git diff --check` : OK

## Verification executee

Commandes executees :

```bash
./node_modules/.bin/vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/link-preview.test.ts src/__tests__/notifications.test.ts
npm run lint -- src/lib/chat/channels.ts src/components/chat/message-input.tsx src/components/chat/message-area.tsx src/components/chat/chat-layout.tsx src/components/layout/header.tsx src/components/notifications/notification-provider.tsx src/app/(app)/chat/layout.tsx src/lib/types/database.ts src/__tests__/authorization-hardening.test.ts
git diff --check
```

Resultats :

- Vitest cible : 34/34 tests passent.
- Lint cible : passe.
- Diff check whitespace: passe.

Note baseline hors US3 (deja connue) :

- `tsc --noEmit` echoue encore sur des erreurs preexistantes hors perimetre US3 :
  - `.next/types/validator.ts` (module route admin manquante)
  - `src/__tests__/profile-utils.test.ts` (mock `Profile` incomplet)

## Reste a faire (hors P0 deja livre)

### P1 - Admin channel management

- Ajouter/valider une action serveur admin dediee creation/modification de canal
  (si non deja couverte ailleurs).
- Verifier garde stricte :
  `is_admin = true`, `status = approved`, `onboarding_completed = true`.

### P1 - Hardening suppression message (decision produit)

- Le comportement UI est tombstone.
- A confirmer cote RLS : conserver ou supprimer la policy de `DELETE` physique
  own-message.

### P2 - Reply

- Hors scope tant qu'aucune confirmation explicite.

## Synthese

Le bloc US3 prioritaire est implemente : taxonomie canonique, permissions Jobs
admin-only, blocage ecriture UI, recherche globale filtree, liens de mention
canoniques, et couverture de tests ciblee.
