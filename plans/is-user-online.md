# RFC: Presence utilisateur et derniere activite

## Statut

Document bascule en mode **review-first**.

Objectif: quand un agent parse ce fichier, il doit trouver immediatement:

- le contexte de review;
- le scope exact;
- le plan de review a executer;
- les criteres de sortie.

Tout le contenu non necessaire a l'execution de la review est archive en fin de document.

## Contexte de review (source de verite)

Commits associes (5 derniers):

- `614fdb2` - `fix: Sponsorship won't appear in channels` (indirect, verifier interactions `profiles.status`);
- `ec202fe` - `plan: Update RFC plan` (hors scope presence);
- `f99dcf2` - `doc: add new bug plan` (hors scope presence);
- `4f727e0` - `Feat: user online signal. Needs review` (**commit principal a reviewer**);
- `c21c6dc` - `doc : update and refine plan` (cadrage/doc presence).

Worktree connu au moment de la revue:

- `D parainage-bug.md`
- `M triage-utilisateurs-canaux.md`

Ces changements sont hors scope de cette review.

## Scope exact de la review

Fichiers a reviewer en priorite:

- `supabase/migrations/20260520155536_add_user_presence.sql`
- `src/components/presence/presence-provider.tsx`
- `src/lib/presence.ts`
- `src/components/layout/app-shell.tsx`
- `src/components/membres/member-profile-drawer.tsx`
- `src/lib/types/database.ts`
- `src/__tests__/presence.test.ts`

Hors scope V1:

- `src/app/(app)/chat/layout.tsx`
- `src/components/chat/member-list.tsx`
- `src/components/chat/user-hover-card.tsx`

## But de la review

Confirmer ou invalider que la V1 implementee est acceptable sur:

1. securite table + Realtime;
2. privacy (precision du timestamp expose);
3. robustesse runtime (fallback/offline/multi-onglets);
4. respect du scope V1;
5. qualite des tests et risque de regression.

## Gate de sortie (DoD review)

La review n'est **pas validable** tant que ces points ne sont pas statues:

1. Validation reelle Supabase des policies table `user_presence` pour `approved`, `pending`, `rejected`, `anon`.
2. Validation reelle Realtime channel prive `presence:members` + policies `realtime.messages`.
3. Decision explicite produit/security sur l'exposition potentielle de l'heure exacte via Data API.
4. Decision explicite sur l'acceptation du signal presence client-authored (spoof possible) comme limite V1.
5. Confirmation que le gate MVP/BMad autorise cette implementation runtime.

## Plan de review a executer

### Etape 1 - Pre-check contexte

- verifier que `4f727e0` est bien le diff principal;
- verifier si `c21c6dc` contient une contrainte de gate bloquante;
- confirmer qu'aucun changement hors scope n'est inclus dans la conclusion.

Commandes:

```bash
git show --stat --name-only 4f727e0
git show --stat --name-only c21c6dc
git log -5 --oneline
```

### Etape 2 - Review statique code/SQL

Verifier:

- policies RLS `user_presence` (select/insert/update);
- policies `realtime.messages` (select/insert) scopees a `presence:members` et `extension='presence'`;
- separation `presence` vs `availability_status`;
- guard stale responses (`loadRequestIdRef`);
- lifecycle provider: subscribe, heartbeat, visibilitychange, cleanup.

Commandes:

```bash
rg -n "user_presence|presence:members|realtime.messages|loadRequestIdRef|useIsMemberOnline|last_seen_at" supabase src
sed -n '1,240p' supabase/migrations/20260520155536_add_user_presence.sql
sed -n '1,260p' src/components/presence/presence-provider.tsx
sed -n '430,640p' src/components/membres/member-profile-drawer.tsx
```

### Etape 3 - Verification Supabase reelle (obligatoire)

Verifier en environnement cible:

- approved/onboarded peut lire et ecrire sa presence;
- approved ne peut pas ecrire la presence d'un autre;
- pending/rejected/anon ne peuvent ni lire ni ecrire;
- admin lit les lignes selon policy;
- channel prive Presence refuse les profils non autorises.

SQL d'inspection recommande:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'user_presence'
order by grantee, privilege_type;

select policyname, roles, cmd, qual, with_check
from pg_policies
where (schemaname, tablename) in (('public','user_presence'), ('realtime','messages'))
order by schemaname, tablename, policyname;
```

### Etape 4 - Verification manuelle runtime

Cas minimaux:

- A/B approved: online visible puis fallback offline attendu;
- multi-onglets: fermeture d'un onglet ne doit pas faire passer offline si un autre reste actif;
- changement rapide de profil drawer: pas d'ecrasement stale A->B;
- Realtime indisponible: pas de faux online, drawer reste fonctionnel;
- mobile/background/visibility: pas de boucle d'ecriture.

### Etape 5 - Verification tests projet

Commandes minimales:

```bash
./node_modules/.bin/vitest run src/__tests__/presence.test.ts
./node_modules/.bin/vitest run src/__tests__/presence.test.ts src/__tests__/authorization-hardening.test.ts src/__tests__/auth-session-middleware.test.ts
npm run lint
npm run build
```

Note:

- distinguer baseline historique vs regression introduite par la feature.

### Etape 6 - Rapport final de review

Le rapport doit contenir:

1. findings ordonnes `P0/P1/P2` avec references fichier/ligne;
2. points bloques (go/no-go);
3. decisions requises produit/security;
4. conclusion claire: `APPROVE`, `APPROVE WITH CONDITIONS`, ou `BLOCK`.

## Risques priorises a traiter

### P1

- validation Supabase reelle non prouvee par les tests actuels;
- risque privacy: heure exacte lisible via `fetchUserPresence` alors que l'UI arrondit;
- policy Realtime valide en SQL mais reglage projet Realtime potentiellement contournable si public access mal configure;
- gate BMad/produit a clarifier avant approbation finale.

### P2

- signal Presence client-authored potentiellement spoofable;
- fallback Realtime (erreur/timeout/closed) a valider en comportement reel;
- erreurs heartbeat potentiellement silencieuses;
- couverture de test principalement statique (assertions de texte/source).

## Questions ouvertes (must-answer)

1. L'implementation runtime etait-elle explicitement approuvee au regard du freeze MVP/BMad?
2. Accepte-t-on l'exposition API du timestamp exact, ou faut-il une vue/RPC arrondie?
3. Accepte-t-on le spoofing possible comme limite V1 documentee?
4. Le reglage Supabase Realtime public access est-il confirme conforme sur l'environnement cible?
5. Le heartbeat 60s par onglet visible est-il acceptable pour la charge beta?

## Archive (hors execution de review)

### Resume archive

Contenu archive:

- probleme, objectifs, non-objectifs;
- semantique produit;
- design technique detaille;
- surfaces UI post-V1;
- complexite et historique des decisions.

Raison:

- conserver la trace documentaire sans polluer le parsing "plan de review".

### Extrait archive de reference

- La V1 implementee est limitee au `member-profile-drawer`.
- `PresenceProvider` est place dans `AppShell` au-dessus du drawer provider.
- La persistence utilise `public.user_presence` avec `last_seen_at` et `last_heartbeat_at`.
- Le canal Realtime Presence cible est `presence:members`.
- Les labels offline sont arrondis: `recemment`, `aujourd'hui`, `cette semaine`, `plus d'une semaine`.
- Hover card et member list chat sont explicitement hors V1.

### Sources archivees

- `plans/is-user-online.md` (version RFC initiale, avant restructuration review-first)
- `_bmad-output/implementation-artifacts/is-user-online-implementation-prep.md`
- `src/__tests__/presence.test.ts`
- `supabase/migrations/20260520155536_add_user_presence.sql`
