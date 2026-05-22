# RFC - Afficher le parrain au filleul apres validation

## Statut

Propose - amelioration UX non urgente.

## Date

2026-05-22

## Resume

Le parcours de parrainage fonctionne: un compte annexe peut demander le parrainage du compte principal, le compte principal recoit la notification, valide la demande, puis le compte annexe obtient bien acces a l'application.

Il manque cependant un retour visible apres validation: le filleul doit pouvoir voir clairement qui est son parrain.

## Probleme

Apres acceptation du parrainage, l'utilisateur parraine accede a l'application, mais l'interface ne met pas assez en evidence la relation de confiance et d'origine d'admission.

Le compte parraine devrait voir un etat du type:

- `Parraine par @maxiime`;
- nom complet ou avatar du parrain si disponible;
- lien vers le profil public du parrain si la navigation membre le permet.

Le compte parrain doit aussi rester coherent: la section `Mes filleuls` de `/parrainages` doit afficher les filleuls acceptes si la relation `sponsored_by` est bien renseignee.

## Resultat attendu

- Un filleul approuve voit son parrain dans une zone evidente de l'application.
- Le libelle distingue clairement le parrainage de l'admission admin finale.
- Si aucun parrain n'existe, l'UI garde un etat vide propre.
- Le parrain voit ses filleuls acceptes dans `/parrainages`.
- La relation affichee correspond aux donnees source (`profiles.sponsored_by`, `profiles.sponsor_approved` ou demande de parrainage approuvee selon le contrat reel).

## Portee proposee

Inclus:

- page `/parrainages`;
- eventuellement page `/profil` ou en-tete compte si c'est le meilleur emplacement UX;
- chargement du profil parrain associe;
- verification que `Mes filleuls` affiche bien les filleuls apres validation;
- tests cible source/affichage si possible.

Exclus:

- changement de schema Supabase;
- changement de RLS;
- refonte du parcours d'admission;
- redesign global de `/parrainages`;
- changement de la logique d'approbation admin.

## Hypothese technique

La relation devrait pouvoir etre lue depuis `profiles.sponsored_by` lorsque le parrainage est accepte. Si ce champ n'est pas renseigne au moment de l'acceptation, il faudra investiguer la logique d'acceptation de parrainage avant de faire seulement un changement d'affichage.

Fichiers probables:

- `src/app/(app)/parrainages/page.tsx`;
- `src/components/sponsorship/parrainages-tabs.tsx`;
- `src/components/membres/member-profile.tsx`;
- `src/components/membres/member-profile-drawer.tsx`;
- action ou helper qui accepte une demande de parrainage si la relation n'est pas persistée.

## Verification attendue

- Compte A demande le parrainage de compte B.
- Compte B accepte.
- Compte A obtient acces a l'application.
- Compte A voit `Parraine par @B` dans l'interface choisie.
- Compte B voit compte A dans `Mes filleuls`.
- Les etats sans parrain restent inchanges.

## Priorite

P2. Non bloquant maintenant que le parcours d'admission fonctionne, mais important pour la comprehension et la confiance du parcours de parrainage.
