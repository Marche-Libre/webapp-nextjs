# RFC - Parrainage obligatoire et validation admin finale

## Statut

Pret pour implementation.

## Date

2026-05-22

## Decision produit

Le parrain est obligatoire.

Il n'existe aucun parcours d'admission sans parrain. Un candidat sans parrain ne doit pas entrer dans une file d'attente admin, ne doit pas voir de promesse de revue admin, et ne doit pas pouvoir obtenir le statut `approved`.

## Resume

Le flux actuel contient un choix "Je ne connais personne" sur la page d'attente. Ce choix affiche un message indiquant qu'un administrateur examinera la demande, mais ne cree aucune donnee persistante exploitable par l'admin.

Le symptome observe est donc normal cote admin: aucune vraie demande n'est visible, car le parcours sans parrain ne cree pas d'objet metier a traiter.

La verification Supabase remote a aussi confirme que `private.confirm_sponsorship_request()` met actuellement le profil en `approved` quand le parrain approuve une demande. Ce comportement ne correspond pas au modele cible: le parrain confirme le parrainage, puis l'admin finalise l'acces.

## Objectif

Mettre en place un flux deterministe:

```text
candidat
-> X OAuth
-> parrain obligatoire
-> demande de parrainage
-> parrain accepte
-> admin voit la demande
-> admin approuve ou refuse l'acces final
```

## Non-objectifs

- Pas de parcours "sans parrain".
- Pas de demande admin fantome sans ligne persistante.
- Pas de nouvelle table de "demandes sans parrain".
- Pas d'exception legacy: la base est neuve et ne contient que deux admins.
- Pas de refonte globale de l'admission hors invariant parrainage.

## Invariant metier

Un profil ne peut pas passer a `approved` sans parrainage confirme:

```sql
sponsored_by IS NOT NULL
AND sponsor_approved IS TRUE
```

Le parrain confirme le lien de confiance. L'admin confirme l'acces membre.

## Sources de verite

- `sponsorship_requests`: evenement metier de demande et validation de parrainage.
- `profiles.sponsored_by`: parrain confirme materialise.
- `profiles.sponsor_approved`: confirmation materialisee du parrainage.
- `profiles.status`: decision finale d'admission, controlee par admin.

## Etat actuel verifie

### Base Supabase remote

`private.confirm_sponsorship_request()` contient actuellement:

```sql
UPDATE public.profiles
SET sponsored_by = OLD.sponsor_id,
    sponsor_approved = TRUE,
    status = 'approved'
WHERE id = OLD.requester_id;
```

Donc, aujourd'hui, l'approbation du parrain approuve aussi l'acces membre. C'est a corriger en premier.

### Code applicatif

Fichiers constates:

- `src/components/sponsorship/waiting-page-client.tsx` contient le choix "Je ne connais personne" et le message "Un administrateur examinera votre demande".
- `src/lib/sponsorship/requests.ts` contient encore le fallback apres deux tentatives: "Un administrateur examinera votre demande."
- `src/app/(auth)/en-attente/actions.ts` retourne encore "Demande envoyee. Un administrateur va l'examiner manuellement."
- `src/app/(app)/admin/users/page.tsx` liste deja les profils, mais ne fournit pas encore une interface unique "membres + parrain + etat de parrainage + action a traiter".

## Changements base de donnees

### 1. Modifier le trigger de confirmation de parrainage

Modifier `private.confirm_sponsorship_request()` pour que l'approbation du parrain mette uniquement a jour la relation de parrainage:

```sql
UPDATE public.profiles
SET sponsored_by = OLD.sponsor_id,
    sponsor_approved = TRUE
WHERE id = OLD.requester_id;
```

Ne plus modifier `profiles.status` dans ce trigger.

### 2. Ajouter un verrou d'admission

Ajouter un trigger `BEFORE UPDATE` sur `public.profiles` qui refuse tout passage vers `approved` si le parrainage n'est pas confirme.

Regle:

```sql
IF NEW.status = 'approved'
  AND OLD.status IS DISTINCT FROM 'approved'
  AND (
    NEW.sponsored_by IS NULL
    OR NEW.sponsor_approved IS NOT TRUE
  )
THEN
  RAISE EXCEPTION 'profile_approval_requires_confirmed_sponsor'
    USING ERRCODE = '23514';
END IF;
```

Ce verrou doit etre en base, pas seulement dans l'UI ou dans une Server Action.

### 3. Verifier les demandes actives concurrentes

Verifier la contrainte actuelle sur `public.sponsorship_requests`.

Comportement attendu:

- un requester ne doit pas avoir plusieurs demandes actives concurrentes;
- une demande `pending` ou `approved` doit bloquer la creation d'une autre demande active;
- une demande `rejected` peut permettre une nouvelle demande si le produit conserve la possibilite de changer de parrain.

La limite actuelle de deux tentatives doit etre reconsideree, car elle peut bloquer definitivement un candidat alors que le parrain est obligatoire.

### 4. Eviter la recursion RLS

Ne pas ajouter de policy `profiles` qui requete `sponsorship_requests`.

Le projet a deja corrige un risque de recursion RLS via `get_sponsor_requester_profiles`. Toute vue ou RPC admin doit eviter de reintroduire ce schema.

## Changements parcours candidat

### Page `/en-attente`

Fichiers probables:

- `src/app/(auth)/en-attente/page.tsx`
- `src/app/(auth)/en-attente/actions.ts`
- `src/components/sponsorship/waiting-page-client.tsx`
- `src/components/sponsorship/sponsor-request-form.tsx`

Changements:

- supprimer le choix "Je ne connais personne";
- supprimer tout message promettant une revue admin sans parrain;
- afficher clairement que le parrain est requis;
- afficher l'etat courant:
  - aucun parrain renseigne;
  - demande envoyee au parrain;
  - demande refusee par le parrain;
  - parrainage confirme, en attente de validation admin;
  - acces approuve ou refuse.

### Creation de demande de parrainage

La creation de `sponsorship_requests` doit passer par une Server Action:

- verifier l'utilisateur courant avec `createClient()`;
- verifier que le profil est `pending`;
- normaliser le handle;
- refuser le self-sponsor;
- verifier que le parrain existe et est `approved`;
- creer `sponsorship_requests`;
- revalider `/en-attente`.

Le lien de parrainage `/rejoindre?ref={x_handle}` reste le chemin recommande. La saisie manuelle d'un `@handle` reste un fallback valide.

## Changements admin

### Interface unique

Refondre `src/app/(app)/admin/users/page.tsx` en interface unique pour tous les membres et candidats.

Colonnes minimales:

- utilisateur: avatar, X handle, nom, email;
- statut admission: `pending`, `approved`, `rejected`;
- onboarding: complete ou incomplet;
- role: admin oui/non;
- parrain: handle et nom;
- etat de parrainage: absent, demandee, refusee, confirmee;
- derniere demande: parrain, tentative, date;
- action: approuver, refuser, ou bloque car parrainage manquant.

Filtres minimaux:

- tous;
- a traiter: parrainage confirme et profil `pending`;
- attente parrain;
- parrainage refuse;
- approuves;
- refuses;
- admins.

### Action d'approbation admin

`approveUser(userId)` doit:

- verifier que l'appelant est admin, approuve et onboarde;
- relire le profil cible;
- refuser si `sponsored_by` est null ou `sponsor_approved` n'est pas `true`;
- mettre `profiles.status = 'approved'` seulement si l'invariant est satisfait;
- retourner une erreur visible si l'approbation est bloquee.

`rejectUser(userId)` peut rester possible sans parrain confirme.

## Copies a corriger

Supprimer ou reformuler toute copie qui implique une revue admin sans parrain.

Occurrences connues:

- `src/components/sponsorship/waiting-page-client.tsx`
  - "Je ne connais personne"
  - "Un administrateur examinera votre demande"
  - "Votre demande est en file d'attente. Un administrateur l'examinera prochainement."
- `src/lib/sponsorship/requests.ts`
  - "Vous avez deja utilise vos deux tentatives de parrainage. Un administrateur examinera votre demande."
- `src/app/(auth)/en-attente/actions.ts`
  - "Demande envoyee. Un administrateur va l'examiner manuellement."

La copie correcte doit dire qu'un parrain est requis, puis qu'un admin finalisera l'acces apres parrainage confirme.

## Critères d'acceptation

- Aucun texte ni bouton ne propose un parcours sans parrain.
- Un candidat sans parrain ne peut pas creer une demande d'acces validable.
- Le lien `/rejoindre?ref={x_handle}` cree ou pre-remplit le contexte de parrainage.
- La saisie manuelle d'un `@handle` cree une demande de parrainage.
- Le parrain qui accepte une demande renseigne `profiles.sponsored_by` et `profiles.sponsor_approved`, mais ne passe pas `profiles.status` a `approved`.
- L'admin voit tous les profils dans une seule interface.
- L'admin voit qui parraine qui.
- L'admin voit les demandes a traiter: parrainage confirme + profil `pending`.
- L'admin ne peut pas approuver un profil sans parrainage confirme.
- La DB bloque aussi l'approbation sans parrainage confirme, meme si l'UI ou une Server Action est contournee.

## Tests attendus

Tests cibles:

- sans parrain, l'approbation admin est refusee;
- avec parrainage `pending`, l'approbation admin est refusee;
- quand le parrain accepte, `sponsored_by` et `sponsor_approved` sont mis a jour sans `status = approved`;
- apres parrainage confirme, l'admin peut approuver;
- `/en-attente` ne contient plus de parcours sans parrain;
- `/admin/users` affiche `pending`, `approved`, `rejected` dans une interface unique;
- le lien `/rejoindre?ref=` continue de creer la demande de parrainage;
- la saisie manuelle d'un `@handle` continue de creer la demande de parrainage.

Commandes:

```bash
npx vitest run src/__tests__/admission-profile-request.test.ts src/__tests__/authorization-hardening.test.ts src/__tests__/oauth-buttons.test.tsx
npm run lint
npm run build
```

## Ordre d'execution recommande

1. Creer la migration Supabase.
2. Verifier en lecture seule la definition remote de `private.confirm_sponsorship_request()` apres migration.
3. Ajouter les tests d'invariant DB/source.
4. Migrer la creation de demande de parrainage vers Server Action.
5. Supprimer le parcours sans parrain.
6. Mettre a jour les copies.
7. Refondre `/admin/users` en interface unique.
8. Verifier les tests cibles, lint et build.

## Risques et mitigations

### Divergence production / migrations

Risque: la base remote peut diverger des migrations locales.

Mitigation: inspecter `pg_get_functiondef('private.confirm_sponsorship_request()'::regprocedure)` avant et apres migration.

### Approbation parrain trop puissante

Risque: le parrain donne acces au chat sans admin.

Mitigation: retirer `status = 'approved'` du trigger de parrainage et ajouter le verrou DB sur `profiles`.

### Recursion RLS

Risque: une policy `profiles` qui lit `sponsorship_requests` peut recreer une recursion.

Mitigation: ne pas ajouter ce type de policy; utiliser une requete admin autorisee existante ou une RPC dediee.

### Candidat bloque par limite de tentatives

Risque: si le parrain est obligatoire et que les deux tentatives sont epuisees, le candidat n'a plus de parcours valide.

Mitigation: reevaluer la limite de deux tentatives avant de figer l'invariant.

## Priorite

P0.

Ce plan corrige un blocage d'admission MVP et un risque de contournement de la validation admin finale.
