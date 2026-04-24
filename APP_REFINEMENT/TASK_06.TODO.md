# TASK_06 - Refocus Navigation Et Retrait Forum/Annuaire Standalone

## Objectif

Retirer le forum et la page annuaire standalone du parcours MVP sans casser les anciens liens, notifications, favoris ou fiches membres internes.

## Dependances

- `TASK_01`: `app_flow.md` valide.
- Decision confirmee: destination app principale = `/chat`.
- Recommandation implementation: conserver temporairement `/membres/[id]` comme fiche interne depuis le chat, sauf remplacement explicite par drawer/modal.

## Triage - Decisions Et Priorites

| Decision | Recommandation | Pourquoi |
| --- | --- | --- |
| Destination post-auth | `/chat` | Coherent avec chat coeur MVP |
| `/membres/[id]` | Conserver temporairement ou remplacer explicitement | Le chat a besoin d'une fiche/detail membre |
| `/membres` | Rediriger vers `/chat` | Retire l'annuaire sans 404 produit |
| `/forum/*` | Rediriger vers `/chat` | Evite liens morts notifications/favoris/embeds |

Priorite globale: P0 avant suppression de code forum/annuaire.

## Inventaire `/forum` A Traiter

- Middleware post-auth/post-onboarding.
- OAuth callback.
- Onboarding server/client.
- `/en-attente` et status poller.
- Settings close.
- Admin non-admin redirect.
- Sidebar logo et nav.
- Chat channel back button.
- Dashboard.
- Landing/footer.
- Notifications historiques `/forum/posts/...`.
- Chat `PostEmbed` et anciens messages contenant liens forum.
- Favoris localStorage `ml-favorites` pointant vers forum.

## Inventaire `/membres` A Traiter

- Sidebar entree Annuaire.
- Header search membre.
- `UserHoverCard`.
- `/membres` page annuaire.
- `/membres/[id]` fiche membre.
- Composants `src/components/membres/**`.

## Strategie

### P0 - Redirections D'App

- Remplacer les destinations actives `/forum` par `/chat` apres validation `app_flow.md`.
- Ne pas supprimer les routes avant d'avoir ajoute des redirects legacy.

### P0 - Navigation Visible

- Retirer Forum de la sidebar.
- Retirer Annuaire de la sidebar.
- Logo app vers `/chat`.
- Retirer les liens footer publics vers Forum/Annuaire.

### P1 - Legacy Redirects

- `/forum` -> `/chat`.
- `/forum/*` -> `/chat` avec note perte de contexte.
- `/membres` -> `/chat`.
- `/membres/[id]` conserve si fiche interne maintenue.

### P1 - Surfaces Secondaires

- Header search: retirer posts forum.
- Header members: pointer vers fiche interne ou chat member drawer, pas `/membres` annuaire.
- Chat post embeds: transformer en lien legacy simple ou retirer enrichissement.
- Notifications forum historiques: ne pas mener vers 404.
- Favoris forum: tolerer via redirect ou nettoyer cote client.

### P2 - Suppression Code Mort

- Supprimer routes/composants forum quand plus aucune reference runtime.
- Supprimer page `/membres` annuaire quand recherche chat remplacee.
- Ne pas dropper tables forum dans cette tache.

## Critères De Completion

- Aucun lien visible de navigation principale vers Forum ou Annuaire.
- Les flux auth/onboarding/admission aboutissent a `/chat`.
- `/forum*` ne produit pas de 404 non maitrisee.
- `/membres` annuaire n'est plus expose comme produit.
- `/membres/[id]` est explicitement conserve ou remplace.
- Notifications/favoris/embeds historiques ont un comportement defini.
- `npm run lint` et `npm run build` passent apres implementation.

## Risques

- Casser les notifications historiques.
- Casser les favoris persistants.
- Supprimer `/membres/[id]` alors que chat en depend.
- Utiliser `/chat?channel=...` sans support reel query param.

## Temoin - Corrections Integrees

- Distinguer `/membres` annuaire et `/membres/[id]` fiche.
- Gerer favoris et notifications historiques.
- Ne pas rediriger aveuglement tous les anciens liens sans decision de contexte.
