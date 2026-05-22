# RFC - Onboarding non bloquant

## Statut

Implémenté et validé (2026-05-21), indépendant du fix parrainage.

Ce document est à jour pour reprise dans une nouvelle session agent.

## Problème

Aujourd'hui, un utilisateur `approved` peut être bloqué hors de `/chat` tant que `onboarding_completed` n'est pas `true`. Ce comportement mélange deux notions :

- l'admission dans l'application ;
- la complétion du profil.

Le produit attendu est différent : un utilisateur admis doit pouvoir accéder à l'application, même si son profil est incomplet. L'onboarding doit devenir un rappel non bloquant.

## Décision produit

`profiles.status = approved` donne accès à l'application.

`onboarding_completed = false` ne doit plus bloquer l'accès à `/chat`.

À l'arrivée dans l'application, afficher un rappel onboarding non bloquant si le profil est incomplet.

Le rappel est fermable.

Une fois fermé, il ne réapparaît plus automatiquement.

Le seuil produit V1 est `30%`.

## Changement attendu

Remplacer le redirect obligatoire vers `/onboarding` par un rappel dans l'app :

- garder `/onboarding` accessible manuellement ;
- ne plus rediriger automatiquement les utilisateurs `approved` mais non onboardés hors de `/chat` ;
- calculer un score simple de complétion profil ;
- afficher un rappel non bloquant si le score est inférieur à `30%` ;
- permettre à l'utilisateur de fermer le rappel ;
- ne plus afficher automatiquement le rappel après fermeture ;
- ne pas afficher le rappel si le score atteint ou dépasse `30%`.

## Score de complétion V1

Le score doit rester simple et explicable.

Le calcul V1 repose sur la logique de complétion profil existante (`getProfileCompleteness`), avec seuil d'affichage reminder à `30%`.

Objectif produit conservé : règle simple et explicable, sans système complexe de progression.

## Comportement attendu

### Profil admis mais incomplet

1. L'utilisateur a `status = approved`.
2. Il arrive sur `/chat`.
3. L'app s'affiche.
4. Un rappel onboarding non bloquant apparaît si le profil est sous `30%`.
5. L'utilisateur peut fermer le rappel et continuer à utiliser l'app.
6. Après fermeture, le rappel ne réapparaît plus automatiquement (V1: stockage local navigateur).

### Profil assez complet

1. L'utilisateur a `status = approved`.
2. Son score de complétion est au moins `30%`.
3. Il accède à l'app sans rappel onboarding automatique.

### Page onboarding

`/onboarding` reste accessible manuellement pour les utilisateurs `approved`, y compris quand `onboarding_completed = true`.

Elle ne doit plus être le passage obligatoire pour entrer dans l'app.

## Non-objectifs

- Ne pas modifier l'admission par parrainage dans cette tâche.
- Ne pas supprimer `onboarding_completed` maintenant.
- Ne pas refondre tout le profil utilisateur.
- Ne pas construire un système complexe de progression ou de gamification.
- Ne pas bloquer l'accès chat selon le score de profil.

## Critères d'acceptation

- Un utilisateur `approved` peut accéder à `/chat` même si `onboarding_completed = false`.
- Un utilisateur `pending` ou `rejected` reste bloqué hors de l'app.
- Le rappel onboarding non bloquant apparaît pour un profil sous `30%`.
- Le rappel est fermable.
- Le rappel n'apparaît plus automatiquement après fermeture.
- Le rappel n'apparaît pas automatiquement quand le profil atteint `30%` ou plus.
- `/onboarding` reste accessible manuellement.

## État d'implémentation (réalisé)

- Verrou d'accès supprimé sur `onboarding_completed` pour les `approved`.
- Routing auth/callback aligné sur `approved => /chat`.
- `/onboarding` non obligatoire et accessible manuellement pour `approved`.
- Reminder onboarding ajouté dans l'app shell.
- Persistance de fermeture reminder via `localStorage` (V1, sans migration DB).
- Couverture de tests ciblés ajoutée/mise à jour.

## Validation effectuée

- Tests ciblés passés: `6 files / 50 tests`.
- Lint ciblé des nouveaux fichiers reminder: passé.
- Le lint global du repo contient encore des erreurs hors périmètre de cette RFC.

## Notes brownfield

`onboarding_completed` peut rester en place pour compatibilité, mais ne doit plus être utilisé comme verrou d'accès à l'app. À terme, il pourra être remplacé par un score de complétion ou une logique plus explicite de rappel profil.

## Risques résiduels V1

- Si `localStorage` est indisponible (contexte navigateur restreint), la fermeture reminder peut ne pas persister inter-session.
- Le reminder est affiché dans l'app shell: vérifier le confort visuel mobile selon viewport.
