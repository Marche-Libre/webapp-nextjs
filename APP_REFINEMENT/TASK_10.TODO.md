# TASK_10 - Durcissement RLS, Nettoyage Et Verification Finale

## Objectif

Securiser les acces Supabase et nettoyer les surfaces non-MVP apres refocus, sans casser chat, parrainage, notifications ni admin.

## Triage - Lots Verifiables

| Priorite | Lot | Impact | Effort | Risque |
| --- | --- | --- | --- | --- |
| P0 | Inventaire DB reel | Tres haut | S | Moyen |
| P0 | Fonctions `SECURITY DEFINER` | Tres haut | M | Eleve |
| P0 | `profiles` RLS | Tres haut | M | Eleve |
| P0 | `channel_members` RLS | Tres haut | M | Eleve |
| P0 | `messages` / `message_reactions` RLS | Tres haut | M | Eleve |
| P0 | `notifications` INSERT | Haut | S/M | Moyen |
| P0 | `invitations` INSERT | Haut | S | Faible |
| P1 | Tests SQL negatifs | Tres haut | M | Moyen |
| P1 | Gel DB forum/proposals | Moyen | S | Moyen |
| P1 | Nettoyage UI non-MVP | Moyen | M | Moyen |
| P2 | Nettoyage code mort | Bas/Moyen | L | Moyen |

Ne pas melanger durcissement RLS, nettoyage UI et suppression de code dans le meme lot.

## Priorite P0 - RLS Et Fonctions

Auditer et corriger:

- `profiles`
- `sponsorship_requests`
- `invitations`
- `channels`
- `channel_members`
- `messages`
- `message_reactions`
- `notifications`
- tables forum/proposals exposees tant qu'elles existent

## Risques RLS Connus

- `profiles` self-update peut permettre escalation.
- `channel_members` policy peut etre recursive.
- `channel_members` insert peut permettre ajout arbitraire.
- `messages` insert peut ne pas verifier membership DM.
- `message_reactions` peut fuiter l'activite de channels prives.
- `notifications` peut permettre spam vers n'importe quel user.
- `invitations` insert peut ne pas forcer `inviter_id = auth.uid()`.
- Fonctions `SECURITY DEFINER` dans `public` doivent etre auditees, avec `search_path` fixe et grants controles.

## Ordre Recommande

1. Inventaire DB reel: policies, grants, functions, publications realtime.
2. Corriger primitives de securite: helpers admin/membership, fonctions, `search_path`.
3. Corriger RLS recursives ou trop larges.
4. Durcir inserts/updates identity-sensitive.
5. Valider par tests SQL negatifs.
6. Nettoyer UI visible forum/annuaire/proposals.
7. Nettoyer code mort par petits lots.
8. Geler DB non-MVP via policies restrictives si necessaire.
9. Ne faire des drops destructifs qu'en migration separee apres backup.

## Nettoyage Incremetal

### UI First

- Retirer liens Forum/Annuaire/Proposals.
- Garder redirects legacy.

### Code Second

- Supprimer imports/routes/composants non references.
- Verifier lint/build a chaque lot.

### DB Later

- Ne pas dropper forum/proposals immediatement.
- Ne pas supprimer `sponsorship_requests`.
- Ne pas supprimer colonnes parrainage de `profiles`.
- Exporter avant tout DROP.

## Tests Negatifs A Exiger

- Pending ne lit pas chat.
- Pending ne modifie pas `status`.
- Non-admin ne modifie pas `is_admin`.
- Sponsor ne modifie pas `profiles.status` du filleul.
- Membre ne cree pas canal public.
- Membre ne poste pas dans Jobs.
- Non-membre DM ne lit/poste pas dans DM.
- User ne notifie pas arbitrairement un autre user.
- User ne cree pas invitation au nom d'un autre.

## Verification App

- `npm run lint`
- `npm run build`
- Parcours manuel admin existant.
- Parcours manuel pending/rejected/approved.
- Parcours parrainage.
- Chat canaux publics.
- Jobs admin-only.
- Modération message.
- Notifications.

## Rollback

- Migrations RLS separees et inversibles.
- Backup avant changements destructifs.
- Ne pas melanger migration RLS et suppression massive de code.
- Deployer par lots.

## Critères De Completion

- Les surfaces non-MVP ne sont plus accessibles via UI principale.
- Les donnees non-MVP ne sont pas droppees sans backup.
- Les tests negatifs RLS critiques sont documentes et passent.
- Lint/build passent.
- Chat, parrainage, admin, notifications restent fonctionnels.

## Temoin - Corrections Integrees

- RLS recursive `channel_members` remontee en bloqueur.
- Fonctions `SECURITY DEFINER` dans `public` a auditer.
- Tests SQL negatifs requis.
- Nettoyage UI/code uniquement apres securite DB.
