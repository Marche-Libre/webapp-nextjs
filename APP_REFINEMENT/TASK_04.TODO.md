# TASK_04 - Admission X, Email, Parrain Unique Et Statuts

## Objectif

Stabiliser le flux d'admission membre MVP.

## Triage - Priorites

| Priorite | Item | Impact | Effort | Risque |
| --- | --- | --- | --- | --- |
| P0 | Verrouiller DB/RLS `profiles` et `sponsorship_requests` | Eleve | M | Eleve |
| P0 | Corriger sponsor approval | Eleve | S/M | Eleve |
| P0 | Corriger admin approval rules | Eleve | M | Moyen |
| P1 | Ajouter bypass admin audite | Eleve | M | Moyen |
| P1 | Normaliser les etats `/en-attente` | Moyen | M | Moyen |
| P1 | Creer demandes parrainage cote serveur | Eleve | M | Moyen |
| P2 | Reconciler `invitations` vs `sponsorship_requests` | Moyen | L | Eleve |

Execution recommandee: securite DB/RLS, puis sponsor approval, puis admin approval, puis UI des etats.

## Flux Cible

1. Candidat arrive via `/rejoindre?ref=<x_handle>` ou inscription directe.
2. Auth X cree ou retrouve l'utilisateur Supabase.
3. `profiles` est cree en `pending`.
4. Email obligatoire; si X ne fournit pas l'email, demander completion avant admission finale.
5. Candidat choisit un parrain unique.
6. Une demande `sponsorship_requests` est creee en `pending`.
7. Le sponsor approuve/refuse le parrainage.
8. Si sponsor approuve: `profiles.sponsor_approved = true`, mais `profiles.status` reste `pending`.
9. Admin approuve/refuse l'acces final.
10. Acces app uniquement quand `profiles.status = 'approved'`.

## Regles Produit

- Un seul parrain actif par candidat.
- Un parrain peut avoir plusieurs filleuls.
- Le sponsor ne peut jamais approuver l'acces final.
- Admin ne peut pas approuver normalement sans parrain valide.
- Admin peut bypasser le parrainage uniquement via action explicite, confirmee et auditee.
- `rejected` est la valeur DB; `refuse` est un libelle UI.

## DB / RLS A Corriger

- `profiles` self-update ne doit pas permettre `status`, `is_admin`, `sponsored_by`, `sponsor_approved`.
- Policy sponsor sur `profiles` ne doit pas permettre update de tout le profil filleul.
- `sponsorship_requests` insert doit forcer:
  - `requester_id = auth.uid()`
  - `status = 'pending'`
  - sponsor approved
  - sponsor different du requester
  - requester non approved
  - une seule demande active
- `attempt_number` doit etre calcule cote serveur/DB, pas fourni librement par le client.
- `accept_referrals = false` doit etre applique dans tous les chemins, pas seulement callback.

## UI A Ajuster

### `/en-attente`

- Etat email manquant.
- Aucun parrain declare.
- Demande envoyee au parrain.
- Parrainage refuse.
- Parrainage approuve, attente admin.
- Compte refuse par admin.

### `/parrainages`

- Le bouton sponsor approuve uniquement le parrainage.
- Il ne doit jamais mettre `profiles.status = 'approved'`.
- Afficher que l'admin finalise l'acces.

### `/admin/utilisateurs`

- Afficher l'etat parrainage.
- Approbation normale disabled si `sponsor_approved !== true`.
- Bouton distinct `Bypass parrainage` pour admins uniquement.

## Audit Bypass

Le bypass admin doit enregistrer:

- `admin_id`
- `target_user_id`
- `previous_status`
- `new_status`
- `reason`
- `created_at`
- type action: `sponsorship_bypass_approval`

## Critères De Completion

- Un pending ne peut pas acceder a l'app.
- Un rejected voit un etat clair, pas une boucle confuse.
- Sponsor approval ne donne pas acces app.
- Admin approval normale exige parrain approuve.
- Admin bypass existe comme action separee et auditee.
- Une seule demande de parrainage active par candidat.
- Self-sponsor impossible.
- Non-admin ne peut pas modifier `status` ou `is_admin` par client Supabase.

## Risques

- RLS actuelle trop permissive.
- Deux chemins paralleles: `invitations` et `sponsorship_requests`.
- X OAuth peut ne pas fournir d'email.
- Divergence entre `profiles.status` et `sponsorship_requests.status`.

## Findings Code A Verifier

- Sponsor approval actuel peut mettre `profiles.status = 'approved'`.
- `approveUser()` admin peut approuver sans verifier `sponsor_approved`.
- Le formulaire de demande parrainage peut fournir `requester_id`, `sponsor_id`, `attempt_number` cote client.
- `/en-attente` peut rediriger les rejected vers `/connexion` au lieu d'un etat clair.

## Temoin - Corrections Integrees

- Sponsor approval ne doit pas approuver le compte final.
- Admin approval sans parrain = bypass explicite audite, jamais action normale.
- Contrainte active sur demandes de parrainage necessaire.
- Distinguer refus parrainage et rejet compte.
