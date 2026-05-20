# RFC - Admission par parrainage

## Statut

Prêt pour implémentation.

Cette tâche couvre uniquement l'admission par parrainage. Le rappel d'onboarding non bloquant est documenté dans `onboarding-non-bloquant.md`. Le tri des utilisateurs par canal est documenté dans `triage-utilisateurs-canaux.md`.

## Problème

Quand un parrain approuve une demande de parrainage, le filleul est bien marqué comme parrainé, mais il reste parfois bloqué hors de l'application parce que `profiles.status` reste `pending`.

Ce comportement est incorrect pour le produit retenu : dans ce flow, le parrain est l'autorité d'admission. L'admin n'a pas à approuver une seconde fois un filleul déjà validé par son parrain.

## Décision produit

Quand le parrain approuve une demande :

1. `sponsorship_requests.status` passe à `approved`.
2. Le profil du filleul reçoit `sponsored_by = sponsor_id`.
3. Le profil du filleul reçoit `sponsor_approved = true`.
4. Le profil du filleul passe aussi à `status = approved`.

`onboarding_completed` ne fait pas partie de l'admission. Un profil incomplet ne doit pas empêcher l'admission du membre. Le traitement de l'onboarding devient un rappel non bloquant dans une tâche séparée.

## Contexte technique

Le bouton d'approbation dans `src/components/sponsorship/parrainages-tabs.tsx` met seulement à jour la demande :

```ts
supabase
  .from("sponsorship_requests")
  .update({ status: "approved" })
```

La base déclenche ensuite la fonction existante :

```sql
private.confirm_sponsorship_request()
```

Ce trigger est attaché à :

```sql
AFTER UPDATE OF status ON public.sponsorship_requests
```

Aujourd'hui, cette fonction met déjà à jour `profiles.sponsored_by` et `profiles.sponsor_approved`. Elle doit aussi promouvoir le filleul avec `profiles.status = 'approved'`.

## Changement attendu

Modifier la transition serveur existante pour que l'`UPDATE public.profiles` fasse :

```sql
SET sponsored_by = OLD.sponsor_id,
    sponsor_approved = TRUE,
    status = 'approved'
WHERE id = OLD.requester_id;
```

Ne pas ajouter de mutation directe de `profiles.status` côté client. Le client continue seulement à approuver ou refuser la ligne `sponsorship_requests`.

## Non-objectifs

- Ne pas refondre toute la state machine d'admission.
- Ne pas nettoyer maintenant la redondance entre `sponsor_approved` et `status`.
- Ne pas modifier le comportement d'onboarding dans cette tâche.
- Ne pas ajouter ou réparer de memberships de canaux publics : les canaux publics sont visibles par les profils `approved`.
- Ne pas créer de logique d'approbation admin pour ce flow.

## Critères d'acceptation

- Quand le bon parrain approuve une demande, le filleul obtient `sponsor_approved = true` et `status = approved`.
- Quand une demande est refusée, le filleul ne passe pas en `approved`.
- Un utilisateur qui n'est pas le parrain de la demande ne peut pas l'approuver.
- Un parrain non `approved` ne peut pas approuver une demande.
- Le front ne modifie pas directement `profiles.sponsored_by`, `profiles.sponsor_approved` ou `profiles.status`.
- Le comportement reste idempotent pour une demande déjà approuvée.

## Vérification recommandée

- Vérifier la fonction `private.confirm_sponsorship_request` en base.
- Tester une demande approuvée par un parrain réel ou un scénario contrôlé.
- Confirmer que le profil du filleul passe bien à `status = approved`.
- Exécuter les tests de garde d'autorisation liés au parrainage.

## Notes brownfield

Le modèle actuel est redondant : `sponsor_approved` et `status = approved` se recoupent pour ce flow. On conserve cette redondance temporairement pour limiter le changement. Un nettoyage ultérieur pourra clarifier ou déprécier `sponsor_approved`.
