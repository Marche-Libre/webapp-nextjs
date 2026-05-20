# RFC - Triage des utilisateurs par canal

## Statut

Proposition prête pour implémentation, indépendante du parrainage et de l'onboarding.

## Problème

La liste des utilisateurs du chat affiche actuellement tous les membres approuvés dans tous les canaux. Quand on change de canal, la liste reste donc identique, même si ces membres n'ont jamais participé au canal actif.

Le besoin est de rendre cette liste contextuelle au canal.

## Décision produit

Dans un canal donné, afficher uniquement les utilisateurs qui ont écrit au moins un message dans ce canal.

La liste doit être organisée en deux groupes :

1. utilisateurs connectés ;
2. utilisateurs non connectés.

Les connectés apparaissent toujours au-dessus des non connectés.

## Contexte technique

Aujourd'hui, `src/app/(app)/chat/layout.tsx` charge `members` depuis `profiles` avec `status = 'approved'`, sans filtre par canal.

`src/components/chat/member-list.tsx` affiche simplement cette liste globale.

La présence utilisateur existe comme sujet séparé dans `plans/is-user-online.md`. Elle peut servir au tri connecté/non connecté, mais le filtrage par auteurs du canal peut être livré avant le tri de présence si nécessaire.

## Changement attendu

Remplacer la source globale des membres par une source dépendante du canal actif :

- récupérer les auteurs distincts de `messages.author_id` pour `activeChannelId` ;
- récupérer les profils minimaux correspondants ;
- afficher uniquement ces auteurs dans `MemberList` ;
- grouper ensuite ces auteurs selon le statut de présence disponible.

Pour les canaux publics, ne pas utiliser `channel_members` comme source principale : le besoin est "ceux qui ont écrit dans le canal", pas "ceux qui ont accès au canal".

## Données nécessaires

Pour chaque participant affiché :

- `id` ;
- `x_handle` ;
- `full_name` ;
- `avatar_url` ;
- statut connecté/non connecté si disponible ;
- optionnel : dernière date de message dans le canal.

## Découpage recommandé

### Tâche 1 - Filtrer par auteurs du canal

Priorité : P1.

Livrer une liste qui change quand le canal actif change et qui exclut les membres n'ayant jamais écrit dans ce canal.

### Tâche 2 - Ajouter le groupement connecté/non connecté

Priorité : P1 si la présence est stable, P2 sinon.

Utiliser le provider de présence existant si disponible. Si la présence échoue, garder la liste visible et classer les auteurs dans un groupe neutre ou hors ligne.

### Tâche 3 - Rafraîchir après nouveau message

Priorité : P2.

Quand un membre écrit pour la première fois dans le canal actif, il doit apparaître dans la liste sans rechargement global de la page.

## Critères d'acceptation

- Changer de canal change la liste des utilisateurs affichée.
- Un membre qui n'a jamais écrit dans le canal actif n'apparaît pas dans cette liste.
- Les membres connectés apparaissent au-dessus des non connectés quand la présence est disponible.
- La liste reste utilisable si la présence live échoue.
- Un canal sans message affiche un état vide clair.
- Aucun changement de permissions de canal n'est introduit.

## Non-objectifs

- Ne pas créer un annuaire global.
- Ne pas modifier l'admission par parrainage.
- Ne pas modifier le rappel d'onboarding.
- Ne pas créer de nouveaux DMs.
- Ne pas changer les droits de lecture ou d'écriture des canaux.
