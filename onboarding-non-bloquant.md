# RFC - Onboarding non bloquant

## Statut

Proposition prête pour implémentation, indépendante du fix parrainage.

## Problème

Aujourd'hui, un utilisateur `approved` peut être bloqué hors de `/chat` tant que `onboarding_completed` n'est pas `true`. Ce comportement mélange deux notions :

- l'admission dans l'application ;
- la complétion du profil.

Le produit attendu est différent : un utilisateur admis doit pouvoir accéder à l'application, même si son profil est incomplet. L'onboarding doit devenir un rappel non bloquant.

## Décision produit

`profiles.status = approved` donne accès à l'application.

`onboarding_completed = false` ne doit plus bloquer l'accès à `/chat`.

À l'arrivée dans l'application ou à la reconnexion, afficher une modale de rappel si le profil est incomplet. Cette modale doit être fermable.

Ne plus rappeler l'utilisateur si son profil dépasse un seuil de complétion. Le seuil par défaut est `40%`.

## Changement attendu

Remplacer le redirect obligatoire vers `/onboarding` par un rappel dans l'app :

- garder `/onboarding` accessible manuellement ;
- ne plus rediriger automatiquement les utilisateurs `approved` mais non onboardés hors de `/chat` ;
- calculer un score simple de complétion profil ;
- afficher une modale si le score est inférieur à `40%` ;
- permettre à l'utilisateur de fermer la modale ;
- ne plus afficher la modale si le score atteint ou dépasse `40%`.

## Score de complétion V1

Le score doit rester simple et explicable.

Champs recommandés pour le calcul V1 :

- nom ou prénom renseigné ;
- catégorie ou spécialité renseignée ;
- localisation renseignée ;
- bio renseignée ;
- compétences renseignées ;
- lien ou site renseigné.

Chaque groupe rempli peut compter de manière équivalente. L'implémentation peut ajuster la liste exacte selon les champs déjà disponibles dans `Profile`, mais elle doit garder le seuil produit de `40%`.

## Comportement attendu

### Profil admis mais incomplet

1. L'utilisateur a `status = approved`.
2. Il arrive sur `/chat`.
3. L'app s'affiche.
4. Une modale de rappel onboarding apparaît si le profil est sous `40%`.
5. L'utilisateur peut fermer la modale et continuer à utiliser l'app.

### Profil assez complet

1. L'utilisateur a `status = approved`.
2. Son score de complétion est au moins `40%`.
3. Il accède à l'app sans rappel onboarding automatique.

### Page onboarding

`/onboarding` reste accessible pour compléter le profil. Elle ne doit plus être le passage obligatoire pour entrer dans l'app.

## Non-objectifs

- Ne pas modifier l'admission par parrainage dans cette tâche.
- Ne pas supprimer `onboarding_completed` maintenant.
- Ne pas refondre tout le profil utilisateur.
- Ne pas construire un système complexe de progression ou de gamification.
- Ne pas bloquer l'accès chat selon le score de profil.

## Critères d'acceptation

- Un utilisateur `approved` peut accéder à `/chat` même si `onboarding_completed = false`.
- Un utilisateur `pending` ou `rejected` reste bloqué hors de l'app.
- La modale de rappel apparaît pour un profil sous `40%`.
- La modale est fermable.
- La modale n'apparaît plus automatiquement quand le profil atteint `40%`.
- `/onboarding` reste accessible manuellement.

## Notes brownfield

`onboarding_completed` peut rester en place pour compatibilité, mais ne doit plus être utilisé comme verrou d'accès à l'app. À terme, il pourra être remplacé par un score de complétion ou une logique plus explicite de rappel profil.
