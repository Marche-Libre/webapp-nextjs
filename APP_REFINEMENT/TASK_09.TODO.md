# TASK_09 - Moderation Messages, Soft Delete, Edit/Delete Et Pin

## Objectif

Stabiliser les actions message MVP: edition auteur, suppression auteur, moderation admin, pin admin.

## Triage - Priorites

| Priorite | Item | Effort | Risque | Pourquoi |
| --- | --- | --- | --- | --- |
| P0 | Migration colonnes `messages` + `user_reports.message_id` | S | Moyen | Aligne DB avec UI/types existants |
| P0 | Remplacer mutations directes par actions serveur | M | Moyen | Centralise les regles |
| P0 | Durcir updates directs cote DB | M | Eleve | Les actions serveur seules ne suffisent pas |
| P1 | Tombstone soft delete complete | S | Moyen | Preserve le contexte sans exposer contenu |
| P1 | Exclure messages supprimes de la recherche | S | Faible | Critere de completion explicite |
| P1 | Aligner types TS | S | Faible | Evite incoherences UI |
| P2 | Audit admin-only du contenu supprime | M/L | Eleve | A repousser sauf besoin produit/legal |

Execution recommandee en deux slices: migration + securite DB, puis actions serveur + UI.

## Etat Actuel A Verifier

- UI/types utilisent `messages.is_pinned`, mais la colonne semble absente de la table `messages`.
- Suppression actuelle vide `content`, sans champ `is_deleted` explicite.
- `user_reports.message_id` est utilise cote UI mais peut manquer cote DB.
- Updates message sont directs cote client et trop larges si RLS reste permissive.

## Migration Minimale Recommandee

```sql
alter table public.messages
  add column if not exists is_pinned boolean not null default false,
  add column if not exists pinned_at timestamptz,
  add column if not exists pinned_by uuid references public.profiles(id) on delete set null,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
  add column if not exists deleted_by_admin boolean not null default false,
  add column if not exists edited_at timestamptz;

alter table public.user_reports
  add column if not exists message_id uuid references public.messages(id) on delete set null;
```

Garder `messages.content text not null`. Pour soft delete, ecrire `content = ''` et `image_url = null` afin que les clients ne puissent plus relire le contenu supprime via `messages`.

Si un audit de moderation doit conserver le contenu original, le stocker dans une table admin-only separee, jamais dans une colonne selectionnee par les clients.

## Actions Serveur

Remplacer les mutations directes client par:

- `editMessage(messageId, content)`
- `deleteOwnMessage(messageId)`
- `moderateDeleteMessage(messageId, reason?)`
- `togglePinMessage(messageId)`
- `reportMessage(messageId, reason)`

## Regles

- Auteur peut editer son message non supprime.
- Auteur peut soft-delete son message.
- Admin peut soft-delete n'importe quel message.
- Admin seul peut pin/unpin.
- Non-admin ne peut pas modifier `is_pinned`, `deleted_by_admin`, `pinned_by`.
- Message supprime n'affiche plus contenu, images, embed, reactions, report.

## UI Tombstone

Afficher:

- auteur/avatar/date si conserve;
- `Ce message a ete supprime`;
- optionnel: `Message supprime par la moderation` si `deleted_by_admin = true`.

## RLS / Securite

RLS ligne-niveau ne suffit pas pour limiter les colonnes modifiees.

Options:

1. Bloquer updates client et passer par server actions/RPC.
2. Ajouter triggers `BEFORE UPDATE` qui rejettent les changements interdits.
3. Utiliser RPC dediees et refuser update direct.

Recommandation MVP: server actions + trigger/policy/RPC qui empeche les updates directs sensibles.

## Critères De Completion

- `is_pinned` existe en DB.
- Soft delete affiche une tombstone apres refresh.
- Le contenu et les images ne sont plus exposes dans les messages supprimes.
- Auteur peut editer/supprimer son message.
- Admin peut moderer et pin/unpin.
- Non-admin ne peut pas pin/unpin via client direct.
- Recherche messages exclut les messages supprimes.
- `user_reports.message_id` fonctionne.

## Risques

- Ajouter des colonnes audit visibles dans `select('*')` expose des metadonnees.
- Server actions seules insuffisantes si RLS autorise toujours updates directs.
- Remonter les pinned en haut compliquerait pagination/scroll; MVP recommande ordre chronologique avec badge pin.

## Temoin - Corrections Integrees

- `is_pinned` est necessaire, pas optionnel.
- `content` reste NOT NULL.
- Repousser `moderation_events` sauf exigence audit forte.
- Focus sur migration minimale + server actions + retrait updates client directs.
