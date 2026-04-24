# TASK_07 - Profil Simple, Fiche Membre Et Recherche Dans Chat

## Objectif

Conserver la capacite de trouver et consulter un membre sans maintenir une page annuaire standalone.

## Triage - Priorites

Priorite globale: P1, avec privacy fiche membre en P0.

| Priorite | Item | Impact | Effort | Risque |
| --- | --- | --- | --- | --- |
| P0 | Privacy fiche membre | Evite fuite email/telephone/parrainage | M | Eleve |
| P1 | Recherche locale dans chat | Remplace l'annuaire | S | Faible |
| P1 | Ouverture fiche depuis chat | Maintient consultation membre | S/M | Moyen |
| P1 | Desactiver `/membres` annuaire | Reduit surface produit | S | Moyen |
| P1 | Simplifier fiche membre | Alignement MVP | M | Moyen |
| P2 | Simplifier `/profil` | Coherence MVP | M/L | Moyen |

Recommandation triage: ne pas simplifier completement `/profil` maintenant; limiter cette tache a la fiche interne et a la recherche chat.

## Perimetre

- Profil personnel `/profil`.
- Fiche membre interne depuis avatar/recherche chat.
- Recherche membre simple dans le chat.
- Lien X public.
- Visibilite parrainage self + admin uniquement.

## Profil Simple

Champs MVP:

- `x_handle`
- `avatar_url`
- `first_name`
- `last_name`
- `full_name`
- `bio`
- lien X derive de `x_handle`

Pour cette tache, ne pas simplifier toute la page `/profil` sauf besoin explicite; garantir seulement que prenom, nom et bio restent editables.

## Fiche Membre

Implementation recommandee:

- Supprimer `/membres` comme annuaire.
- Garder `/membres/[id]` comme fiche interne minimale accessible depuis le chat, ou remplacer par un drawer/modal chat.

La fiche ne doit pas exposer:

- email;
- telephone;
- `sponsored_by` sauf self/admin;
- donnees de parrainage a un autre membre.

## Recherche Dans Chat

- Ajouter recherche locale dans `MemberList`.
- Filtrer sur `x_handle`, `full_name`, `first_name`, `last_name`.
- Normaliser `@`, casse et espaces.
- Ne pas ajouter full-text DB au MVP sauf volume important.

## RLS / Privacy

- RLS ne masque pas les colonnes: eviter `select('*')` pour les fiches publiques.
- Si `profiles_public` existe, auditer sa definition.
- Sinon creer une selection minimale cote serveur.
- Parrainage visible uniquement:
  - au profil lui-meme;
  - aux admins;
  - pas aux autres membres, y compris le sponsor direct dans la fiche membre publique MVP.

## Critères De Completion

- `/profil` affiche et permet d'editer prenom, nom, bio.
- X handle et photo sont visibles.
- Le chat affiche une liste membres avec recherche.
- Un resultat membre ouvre une fiche interne ou un drawer defini.
- La page annuaire `/membres` n'est plus une surface produit.
- Le lien X fonctionne.
- Les informations de parrainage ne fuitent pas aux autres membres.

## Risques

- `profiles_public` absent ou trop large.
- `profiles` SELECT permet lignes approved mais pas privacy colonne.
- Supprimer trop largement `/membres` casse les fiches depuis chat.
- Le profil actuel est beaucoup plus riche que le MVP.

## Temoin - Corrections Integrees

- RLS/colonnes `profiles` est le risque majeur.
- Conserver `/membres/[id]` doit etre une decision explicite.
- La fiche interne ne doit pas redevenir un annuaire.
