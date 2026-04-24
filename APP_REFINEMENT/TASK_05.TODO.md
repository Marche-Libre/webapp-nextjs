# TASK_05 - Admin Approve, Refuse, Rebasculer Et Bypass

## Objectif

Stabiliser les actions admin de validation d'acces membre.

## Triage - Priorites

| Priorite | Item | Impact | Effort | Risque |
| --- | --- | --- | --- | --- |
| P0 | Bloquer auto-update de `profiles.status` cote DB/RLS | Tres eleve | M | Eleve |
| P0 | Centraliser transitions admin dans action/RPC controlee | Tres eleve | M | Moyen |
| P0 | Ajouter audit obligatoire | Eleve | M | Moyen |
| P1 | Valider parrainage avant approbation normale | Eleve | S/M | Moyen |
| P1 | UI admin: approval disabled + bypass distinct | Eleve | M | Moyen |
| P1 | Re-approbation rejected | Moyen | S | Faible |
| P2 | Notifications | Faible/Moyen | M | Faible |

Chemin critique: migration RLS + audit, puis refactor des actions admin, puis UI.

## Transitions Autorisees

| Transition | Autorisee | Conditions |
| --- | --- | --- |
| `pending -> approved` | oui | parrain valide ou bypass admin audite |
| `pending -> rejected` | oui | admin |
| `rejected -> approved` | oui | parrain valide ou bypass admin audite |
| `approved -> rejected` | oui | admin, coupe l'acces |
| `approved -> pending` | non par defaut | hors MVP |

## Actions Serveur

Centraliser les actions sensibles dans des server actions ou RPC controlees:

- `approveUser(userId)`
- `rejectUser(userId)`
- `reapproveUser(userId)` ou reutilisation claire de `approveUser`
- `approveUserWithSponsorshipBypass(userId, reason)`

Chaque action doit:

- verifier session;
- verifier admin via source DB fiable;
- charger le profil cible;
- verifier transition autorisee;
- confirmer qu'une ligne a ete modifiee;
- retourner `{ success, error }`;
- revalider `/admin/utilisateurs`.

## Regles D'Approbation

### Approbation Normale

Conditions requises:

- `profiles.sponsored_by IS NOT NULL`
- `profiles.sponsor_approved = true`
- demande parrainage coherente si `sponsorship_requests` existe
- profil cible non admin sauf action explicitement permise

### Bypass Parrainage

Conditions:

- admin uniquement;
- bouton distinct de l'approbation normale;
- confirmation UI;
- raison obligatoire;
- audit obligatoire;
- ne doit pas etre declenche automatiquement.

## Audit Minimal

Prevoir table ou mecanisme d'audit:

- `id`
- `admin_id`
- `target_user_id`
- `action`
- `previous_status`
- `new_status`
- `reason`
- `created_at`

Actions auditees:

- approval normal
- reject
- reapprove
- bypass sponsorship approval

## UI Admin

- Section pending avec etat parrainage visible.
- Bouton `Approuver` disabled si parrain non valide.
- Bouton `Bypass parrainage` visible admin avec confirmation et reason.
- Bouton `Refuser`.
- Pour `rejected`: bouton `Re-approuver` soumis aux memes regles.
- Afficher les erreurs en UI, pas seulement `console.error`.

## RLS / DB

- Un user ne peut pas update son propre `status`.
- Un sponsor ne peut pas update `profiles.status` d'un filleul.
- Admin update de `status` doit etre server/RPC ou RLS strictement controlee.
- `profiles.status` et `sponsorship_requests.status` doivent rester semantiquement distincts.

## Questions A Trancher

- Un admin peut-il agir sur un autre profil admin ? Recommandation: bloquer par defaut, sauf super-admin futur.
- La raison est-elle obligatoire pour `reject` ? Recommandation: obligatoire pour bypass, optionnelle pour reject MVP.
- Le bypass doit-il modifier `sponsor_approved` ? Recommandation: non, garder la semantique distincte.

## Notifications

Set minimal accepte pour le MVP:

- `welcome`;
- `sponsor_request`;
- `account_approved`;
- `chat_mention` si deja present.

Le bypass parrainage doit etre audite, pas notifie par defaut. `account_rejected` reste hors set minimal sauf decision produit separee.

## Critères De Completion

- Admin peut approuver un pending avec parrain valide.
- Admin ne peut pas approuver normalement sans parrain valide.
- Admin peut bypasser avec raison et audit.
- Admin peut refuser un pending.
- Admin peut re-approuver un rejected selon les memes regles.
- Non-admin ne peut pas appeler les actions avec succes.
- Un pending ne peut pas s'auto-approuver via client Supabase.
- Le sponsor ne peut pas approuver le compte final.
- Les transitions sont testees manuellement.

## Risques

- RLS ligne-niveau ne protege pas les colonnes sensibles.
- UI admin peut donner une impression de securite si DB reste permissive.
- Rejected UX actuellement insuffisante.
- Audit absent rend les bypass difficiles a tracer.

## Temoin - Corrections Integrees

- Bypass parrainage ajoute comme action separee.
- Audit obligatoire.
- Clarification des transitions.
- RLS `profiles` P0 avant confiance dans l'UI.
