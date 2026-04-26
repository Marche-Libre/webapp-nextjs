-- Note pour moi

Relire toutes les tasks pour le refinement et clean de l'app. Attention aux schemas de BDD

--

# TASK_00 - Cadrage MVP

## Objectif

Formaliser le perimetre MVP avant toute modification produit, app ou DB.

Ce document sert de reference pour les taches suivantes et evite de transformer le refocus en rebuild complet.

## Decisions Actees

| Sujet                   | Decision                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Rebuild                 | Pas de rebuild complet                                                             |
| Profils existants       | Les 2 profils actuellement en DB sont conserves et deviennent admins               |
| Parrainage              | 1 parrain unique par candidat pour le MVP                                          |
| Admission               | Sponsor valide le parrainage, admin valide l'acces final                           |
| Bypass parrainage       | Non par defaut; possible uniquement via bouton admin explicite, confirme et audite |
| Jobs                    | Canal lisible par membres approuves, publication admin-only                        |
| Refus                   | Admin peut rebasculer un compte refuse/rejected vers approved                      |
| Moderation              | Soft delete visible comme message supprime                                         |
| Contenu supprime        | Tombstone visible; contenu original non expose aux clients standards               |
| Parrainage visible      | Visible par soi-meme et par admin; pas par tous les membres                        |
| Annuaire                | Page annuaire standalone retiree                                                   |
| Membres                 | Liste/recherche membres conservees dans le chat                                    |
| DMs                     | Legacy tolere; pas coeur du MVP actif                                              |
| Notifications minimales | `welcome`, `sponsor_request`, `account_approved`, `chat_mention` si deja present   |

## Perimetre MVP

- Auth X uniquement.
- Admission avec email et 1 parrain.
- Statuts `pending`, `approved`, `rejected` en DB, avec libelles UI francais.
- Acces app uniquement apres `profiles.status = 'approved'`.
- Admin peut approuver, refuser, re-approuver, ou bypasser le parrainage avec audit.
- Profil simple: X handle, photo, prenom, nom, bio, lien X.
- Recherche membre simple sans page annuaire standalone.
- Chat par canaux: General, Business, Politique, Divers, Jobs.
- Creation de canaux publics admin-only.
- Jobs: lecture membres, ecriture admins.
- Edition/suppression de ses messages.
- Pin admin.
- Moderation admin par soft delete.
- DMs existants toleres si le code en depend, mais aucun nouveau workflow DM n'est prioritaire avant admission/RLS/canaux publics.

## Hors Scope

- Rebuild complet.
- Multi-parrainage.
- Page annuaire standalone.
- Forum comme produit actif.
- Workflow de roles complexe.
- Moderation avancee avec centre de traitement complet.
- Analytics produit.
- Suppression destructive immediate des tables historiques.
- Preview de liens si elle bloque le MVP.
- Recherche globale avancee si le chat de base n'est pas stabilise.

## Decisions Issues Du Triage

- DMs: `legacy tolere`, pas coeur MVP actif.
- Soft delete: contenu original non expose aux clients standards; audit admin-only separe si conservation necessaire.
- Notifications minimales: `welcome`, `sponsor_request`, `account_approved`, `chat_mention` si deja present.

## Ordre D'Execution Recommande

| Ordre | Tache     | Pourquoi                                   |
| ----- | --------- | ------------------------------------------ |
| 1     | `TASK_00` | Figer le perimetre                         |
| 2     | `TASK_02` | Documenter DB/RLS avant migrations         |
| 3     | `TASK_03` | Backup + bootstrap admins                  |
| 4     | `TASK_04` | Admission X/email/parrain/statuts          |
| 5     | `TASK_05` | Admin approve/refuse/bypass                |
| 6     | `TASK_08` | Chat canaux + Jobs admin-only              |
| 7     | `TASK_07` | Profil simple + recherche membre dans chat |
| 8     | `TASK_06` | Retrait forum/annuaire standalone          |
| 9     | `TASK_09` | Moderation/edit/delete/pin                 |
| 10    | `TASK_10` | Durcissement RLS + nettoyage final         |

## Critères De Completion

- Le perimetre MVP est documente et non ambigu.
- Les arbitrages qui reduisent les issues sont explicites, notamment 1 parrain malgre la mention `parrain(s)`.
- La distinction recherche membre vs recherche messages est claire.
- Les hors-scope sont listes pour eviter la derive.
- Les decisions sont utilisables directement par les taches `TASK_01` a `TASK_10`.
- Les decisions DMs, soft delete et notifications minimales sont explicites.

## Risques

- Sous-livrer l'US2 si le retrait de l'annuaire supprime aussi la recherche membre.
- Confondre validation parrainage et validation compte final.
- Laisser des checks de permissions uniquement cote UI.
- Deriver vers une refonte large du chat avant de securiser admission/RLS.

## Temoin - Corrections Integrees

- Le parrain unique est acte comme reduction explicite du scope `parrain(s)`.
- La recherche membre reste obligatoire meme sans page annuaire.
- `Jobs` est bien lecture membre, ecriture admin.
- Le bypass admin sans parrain est distinct de l'approbation normale et doit etre audite.

## Triage - Statut

- Priorite: P0 avant toute implementation DB/RLS.
- Effort restant: S.
- Risque principal: securite/RLS si les decisions restent uniquement cote UI.
