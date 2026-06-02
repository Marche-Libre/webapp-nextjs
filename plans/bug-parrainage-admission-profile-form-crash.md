# RFC - Crash du formulaire d'admission apres connexion X via parrainage

## Statut

Clos - correctif implemente, verifie automatiquement et valide manuellement de bout en bout le 2026-05-22.

## Date

2026-05-22

## Resume

Le parcours de parrainage / admission pouvait faire planter la page apres connexion avec un autre compte X. Apres le retour navigateur, Next.js affichait l'overlay d'erreur et la page ne chargeait pas.

Deux erreurs sont visibles:

- avertissement Next/React sur un tag `<script>` rendu dans un composant React depuis `src/app/layout.tsx`;
- crash bloquant dans `AdmissionProfileForm`: `state.errors` est `undefined`, puis le composant tente d'acceder a `state.errors.displayName`.

Le crash du formulaire d'admission est le symptome bloquant du flow teste.

Correction appliquee:

- `AdmissionProfileForm` tolere maintenant les etats incomplets retournes par `useActionState`;
- l'etat initial du formulaire est sorti du fichier `"use server"` vers `src/lib/admission-profile-state.ts`;
- les valeurs saisies sont conservees apres erreur de validation pour eviter de forcer l'utilisateur a tout retaper;
- le `<script>` natif du layout racine a ete remplace par `next/script` avec un `id` et `strategy="beforeInteractive"`;
- le lien "Se deconnecter" de `/en-attente` est remplace par une vraie deconnexion Supabase, afin de permettre de changer de compte X pendant les tests de parrainage.

Validation manuelle finale:

- le compte annexe a demande le parrainage du compte principal;
- le compte principal a recu la notification de parrainage;
- le compte principal a valide la demande;
- le compte annexe a obtenu l'acces a l'application;
- aucun overlay Next.js ni crash `AdmissionProfileForm` n'a ete observe pendant le flow complet.

## Probleme

Le flow de parrainage / admission ne supporte pas correctement l'etat initial ou retourne du formulaire d'admission. Le composant `AdmissionProfileForm` suppose que `state.errors` existe toujours. Dans le test manuel, `state.errors` est absent, ce qui provoque une exception JavaScript pendant le rendu client.

Erreur console fournie:

```text
Uncaught TypeError: can't access property "displayName", state.errors is undefined
    AdmissionProfileForm admission-profile-form.tsx:92
```

Overlay Next.js fourni:

```text
Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead.

src/app/layout.tsx (113:9) @ RootLayout
```

## Impact

- Le nouvel utilisateur ne peut pas terminer ou poursuivre le parcours d'admission.
- Le parcours teste avec un autre compte X devient bloquant.
- Le bug touche une zone critique MVP: admission, attente et parrainage.
- L'overlay de developpement masque la page et rend le flow inutilisable en local.

## Flow de reproduction

1. Se connecter avec un autre compte X que le compte deja utilise.
2. Continuer dans le navigateur pendant le retour OAuth / admission.
3. Arriver sur le parcours d'attente / admission / parrainage.
4. Observer l'overlay d'erreur Next.js.
5. Ouvrir la console navigateur.
6. Constater l'erreur `state.errors is undefined` dans `src/components/auth/admission-profile-form.tsx`.

## Resultat observe

La page ne charge pas et affiche l'overlay:

```text
This page couldn't load
Reload to try again, or go back.
```

La console indique:

```text
14:09:29.599 Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client.

14:09:29.622 Uncaught TypeError: can't access property "displayName", state.errors is undefined
    AdmissionProfileForm admission-profile-form.tsx:92
```

## Resultat attendu

- Le retour de connexion X doit afficher une page d'attente / admission stable.
- `AdmissionProfileForm` doit pouvoir rendre son etat initial sans exception.
- Les erreurs de validation doivent rester optionnelles et ne jamais casser le rendu.
- Le flow de parrainage doit afficher un etat utilisateur comprehensible, meme si le profil est incomplet ou encore en attente.

## Portee d'investigation

Inclus:

- `src/components/auth/admission-profile-form.tsx`;
- l'etat initial utilise par le formulaire d'admission;
- les Server Actions de `src/app/(auth)/en-attente/actions.ts`;
- le rendu de `src/app/(auth)/en-attente/page.tsx`;
- le flow OAuth retour X vers `/en-attente`;
- l'avertissement `<script>` dans `src/app/layout.tsx` comme signal separe a classifier.

Exclus pour ce ticket:

- refonte du parcours de parrainage;
- changement de schema Supabase;
- changement de policies RLS;
- redesign UI;
- modification de la logique d'approbation admin.

## Hypothese initiale

`AdmissionProfileForm` lit probablement `state.errors.displayName` sans garantir que `state.errors` existe dans tous les etats possibles du formulaire. L'etat initial retourne par `useActionState`, ou par l'action serveur apres un cas non nominal, peut etre incomplet par rapport au type attendu par le composant.

L'avertissement `<script>` dans `RootLayout` peut etre independant du crash principal. Il doit etre classe pendant l'investigation, mais le blocage utilisateur observe vient de l'exception `state.errors is undefined`.

## Resultat d'investigation

Hypothese confirmee. Le composant lisait `state.errors.*` sans garde runtime. Le correctif normalise `state?.errors ?? {}` avant rendu.

Deux problemes adjacents ont ete trouves pendant le retest manuel:

- apres une erreur de validation, les champs soumis n'etaient pas renvoyes par l'action serveur, donc le formulaire revenait aux valeurs du profil et donnait l'impression que les saisies n'etaient pas prises en compte;
- le controle "Se deconnecter" de `/en-attente` etait un simple lien vers `/connexion`, pas une vraie deconnexion Supabase. Un utilisateur pending restait donc bloque sur sa session app existante meme apres changement de compte X dans le navigateur.

## Verification attendue apres correction

- Rejouer le flow manuel avec un autre compte X. Fait: compte annexe -> demande de parrainage -> notification compte principal -> validation -> acces application.
- Confirmer que `/en-attente` rend sans overlay. Fait.
- Confirmer que `AdmissionProfileForm` rend sans erreur quand `state.errors` est absent ou vide. Fait via test cible.
- Ajouter ou ajuster un test cible autour de l'etat initial du formulaire d'admission. Fait.
- Verifier que les valeurs saisies restent visibles apres erreur de validation. Fait via test cible.
- Verifier que la deconnexion depuis `/en-attente` appelle bien `supabase.auth.signOut()` avant retour connexion. Fait: le changement de compte a permis de poursuivre le test cote parrain.
- Executer au minimum:

```bash
npx vitest run src/__tests__/admission-profile-request.test.ts
```

Si `layout.tsx` est modifie pour le warning `<script>`, verifier aussi le rendu racine et la compatibilite Next.js 16 avant changement.

Verification effectuee:

```bash
npx vitest run src/__tests__/admission-profile-request.test.ts src/__tests__/admission-profile-form.test.tsx
./node_modules/.bin/eslint src/app/'(auth)'/en-attente/page.tsx src/components/auth/pending-sign-out-button.tsx src/app/layout.tsx src/components/auth/admission-profile-form.tsx src/app/'(auth)'/en-attente/actions.ts src/lib/admission-profile-state.ts src/__tests__/admission-profile-request.test.ts src/__tests__/admission-profile-form.test.tsx
npm run build
```

Resultat: commandes OK.

## Suivi non bloquant

Le flow technique est valide. Une amelioration UX separee reste ouverte pour afficher explicitement le parrain au filleul apres admission: `plans/parrainage-afficher-parrain-filleul.md`.

## Priorite

Critique a l'ouverture. Clos apres validation manuelle du parcours MVP d'entree par parrainage.
