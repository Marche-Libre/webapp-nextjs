# Plan - Bypass X Auth On Request Access For Connected Users

## Objectif

Quand un utilisateur possede deja une session Supabase valide, le bouton
"Demander l'acces" ne doit pas relancer l'authentification X.

Le comportement attendu est:

- utilisateur deconnecte: lancer l'authentification X;
- utilisateur connecte, approuve et onboarde: envoyer vers `/chat`;
- utilisateur connecte, approuve mais non onboarde: envoyer vers `/onboarding`;
- utilisateur connecte, pending: envoyer vers `/en-attente`;
- utilisateur connecte, rejected: envoyer vers `/en-attente`;
- utilisateur connecte avec statut inconnu ou non approuve: envoyer vers `/en-attente`.

## Constat Actuel

Le bug vient des points d'entree client qui appellent toujours
`signInWithOAuth()`:

- `src/components/auth/oauth-buttons.tsx` pour la modale d'acces de la landing;
- `src/app/rejoindre/page.tsx` pour les liens d'acces et de parrainage.

Le middleware serveur contient deja l'intention de rediriger les utilisateurs
approuves et onboardes depuis les routes d'entree vers `/chat`, mais le bouton
client peut rester accessible sur une landing deja rendue. Il faut donc ajouter
une verification de session cote client avant de lancer OAuth.

## Portee

Cette correction doit rester minimale:

- pas de changement Supabase schema, RLS ou migration;
- pas de changement de provider OAuth;
- pas de changement de dependances;
- pas de redesign;
- pas de refonte globale du middleware;
- conserver `provider: "x"` et `getAuthCallbackUrl()`.

## Plan D'Implementation

### 1. Centraliser la resolution de destination

Ajouter un petit helper pur dans `src/lib/auth-entry.ts`.

Responsabilite:

```ts
approved + onboarding_completed === true -> "/chat"
approved + onboarding_completed !== true -> "/onboarding"
everything else -> "/en-attente"
```

Ce helper ne doit pas creer de client Supabase. Il doit seulement convertir un
etat de profil en route cible, pour eviter de dupliquer la logique dans les
composants.

### 2. Corriger la modale "Demander l'acces"

Modifier `src/components/auth/oauth-buttons.tsx`.

Avant `signInWithOAuth()`:

1. creer le client Supabase avec `createClient()`;
2. appeler `supabase.auth.getUser()`;
3. si aucun utilisateur n'existe, garder le flow actuel X OAuth;
4. si un utilisateur existe, lire `profiles.status,onboarding_completed`;
5. calculer la destination avec le helper;
6. appeler `router.replace(destination)`;
7. ne jamais appeler `signInWithOAuth()` pour un utilisateur deja connecte.

Contraintes React locales:

- utiliser `useRouter`;
- memoizer le handler avec `useCallback`;
- garder un handler nomme;
- ne pas ajouter de callback inline en JSX.

### 3. Corriger `/rejoindre`

Modifier `src/app/rejoindre/page.tsx`.

Le bouton doit suivre le meme principe:

1. verifier si une session existe;
2. si l'utilisateur est connecte, router directement selon le statut;
3. si l'utilisateur est deconnecte, conserver le comportement actuel:
   - stocker `ml-referral` si `ref` est present;
   - lancer X OAuth avec `getAuthCallbackUrl()`.

Point d'attention:

Un utilisateur deja connecte qui ouvre `/rejoindre?ref=...` ne repassera plus
par le callback OAuth. Si le produit doit rattacher une reference de parrainage
a un utilisateur pending deja connecte, il faudra une tache separee pour traiter
ce cas sans relancer OAuth.

### 4. Verifier le middleware sans le refondre

Le fichier racine actuel est `middleware.ts`.

Les docs Next.js 16 indiquent que `middleware.ts` est deprecie au profit de
`proxy.ts`, mais les artefacts BMad du projet demandent de ne pas migrer ce
point sauf necessite concrete.

Plan:

1. ne pas migrer `middleware.ts` dans cette correction;
2. garder `src/lib/supabase/middleware.ts` intact sauf preuve contraire;
3. verifier que la navigation directe vers `/` en utilisateur connecte continue
   de rediriger vers `/chat`;
4. ne prevoir une migration vers `proxy.ts` que si le middleware ne s'execute
   pas reellement avec la version Next.js actuelle.

### 5. Ajouter ou ajuster les tests

Tests minimum:

- helper: profil approved + onboarded -> `/chat`;
- helper: profil approved + non onboarded -> `/onboarding`;
- helper: profil pending/rejected/inconnu -> `/en-attente`;
- bouton OAuth: utilisateur deconnecte -> `signInWithOAuth({ provider: "x" })`;
- bouton OAuth: utilisateur connecte approved/onboarded -> `router.replace("/chat")`;
- bouton OAuth: utilisateur connecte -> ne doit pas appeler `signInWithOAuth()`.

Les tests middleware existants doivent continuer a passer, notamment ceux qui
verifient les redirections vers `/chat`, `/onboarding` et `/en-attente`.

### 6. Verification Manuelle

Executer les scenarios suivants dans le navigateur:

1. deconnecte -> `/` -> "Demander l'acces" -> X OAuth demarre;
2. approved + onboarded -> `/chat` fonctionne;
3. approved + onboarded -> `/` -> "Demander l'acces" -> redirection `/chat`,
   sans X OAuth;
4. approved + non onboarded -> "Demander l'acces" -> `/onboarding`;
5. pending -> "Demander l'acces" -> `/en-attente`;
6. rejected -> "Demander l'acces" -> `/en-attente`;
7. deconnecte -> `/rejoindre?ref=handle` -> cookie `ml-referral` conserve puis
   X OAuth demarre.

## Risques

- Duplication de logique entre middleware serveur et client si le helper n'est
  pas utilise proprement.
- Cas de parrainage deja connecte a clarifier: bypasser OAuth empeche le
  callback de traiter `ml-referral` pour une session deja existante.
- Si `middleware.ts` ne s'execute plus avec Next.js 16 dans l'environnement
  cible, la redirection directe depuis `/` devra etre corrigee separement via
  migration controlee vers `proxy.ts`.

## Definition De Fini

La correction est terminee quand:

- un utilisateur connecte ne voit plus X OAuth apres clic sur "Demander l'acces";
- les routes ciblees respectent la matrice de comportement;
- les utilisateurs deconnectes gardent le flow X OAuth existant;
- les tests unitaires pertinents passent;
- aucune modification de schema, provider, dependances ou design n'a ete faite.
