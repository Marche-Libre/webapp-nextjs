# TASK_08 - Chat MVP, Canaux Initiaux Et Jobs Admin-Only

## Objectif

Aligner le chat sur l'US3 MVP: canaux initiaux, lecture/ecriture selon droits, Jobs post admin-only.

## Triage - Priorites

| Priorite | Item | Impact | Effort | Risque |
| --- | --- | --- | --- | --- |
| P0 | Migration RLS `messages` | Critique securite | M | Eleve |
| P0 | Migration RLS `channels` | Critique securite | M | Eleve pour DMs |
| P0 | Seed canaux initiaux | Requis MVP | S | Faible/Moyen |
| P0 | UI full chat Jobs readonly non-admin | UX + defense | S | Faible |
| P1 | UI chat panel flottant | Si encore actif | S/M | Moyen |
| P1 | RLS `message_reactions` | Securite/coherence | S/M | Moyen |
| P2 | `sort_order` | Ordre stable | S | Faible |

Point critique: les policies RLS se combinent en OR; dropper/remplacer les policies permissives existantes.

## Canaux Initiaux

- `general` -> General ou General/Général selon copy finale.
- `business` -> Business.
- `politique` -> Politique.
- `divers` -> Divers.
- `jobs` -> Jobs.

## Migration / Seed

- Migration idempotente avec `INSERT ... ON CONFLICT (slug) DO UPDATE`.
- Ne pas migrer automatiquement `recrutement` vers `jobs` sans decision explicite sur l'historique.
- Ajouter `sort_order` seulement si l'ordre stable est requis par l'UI.

## RLS Channels

Important: les policies RLS sont combinees en OR. Il faut remplacer les policies permissives, pas seulement en ajouter.

Regles cible:

- Profils approved lisent canaux publics.
- Profils approved lisent canaux prives uniquement si membres.
- Admins creent les canaux publics.
- DMs: exception a cadrer; si conserves, membres peuvent creer uniquement des channels prives DM avec controles stricts.

## RLS Messages

Remplacer la policy insert globale par une policy qui verifie:

- `author_id = auth.uid()`;
- profil `status = 'approved'`;
- channel public autorise ou private avec membership;
- si `channels.slug = 'jobs'`, alors `public.is_admin()` obligatoire.

## UI

- Passer `isAdmin` et `activeChannel.slug` jusqu'a `MessageInput`.
- Dans `Jobs`, pour non-admin:
  - masquer/desactiver input;
  - afficher `Seuls les admins peuvent publier dans Jobs.`
- Gerer full chat et panel flottant si ce dernier reste actif.
- Ne jamais se reposer uniquement sur l'UI.

## Reactions

Decision a prendre:

- Recommandation MVP: autoriser les reactions si l'utilisateur peut lire le message/channel, y compris sur `Jobs`.
- Si la lecture Jobs doit etre stricte sans reactions, restreindre `message_reactions` explicitement.

## Critères De Completion

- Membre approved lit `Jobs`.
- Membre approved ne peut pas poster dans `Jobs` via UI ni via client Supabase direct.
- Admin peut poster dans `Jobs`.
- Membres approved postent dans les autres canaux publics.
- Non-approved ne lit/poste pas.
- Non-admin ne cree pas de canal public.
- DMs legacy restent toleres si le code existant en depend, ou sont explicitement hors scope.

## Risques

- Ancienne policy `messages INSERT` annule la restriction Jobs si elle reste active.
- Ancienne policy `channels INSERT` peut permettre creation de canal public par membre.
- DMs peuvent casser si on ferme trop largement `channels`/`channel_members`.
- Renommer `recrutement` en `jobs` peut introduire des anciens messages non-admin dans Jobs.

## Temoin - Corrections Integrees

- Remplacer/dropper les policies permissives, ne pas empiler.
- Ne pas migrer `recrutement` vers `jobs` par defaut.
- Couvrir full chat et chat panel.
