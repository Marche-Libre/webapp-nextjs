# Feature Specification: MVP UI Route Cleanup

**Feature Branch**: `006-mvp-ui-route-cleanup`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Aligner l'expérience Beta/MVP sur `/chat` comme destination principale après admission, masquer Forum, Annuaire, propositions de salons et promesses hors MVP, conserver les routes legacy accessibles directement, corriger les liens chat évidents et l'UX des utilisateurs refusés."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Membre approuvé arrive sur le chat (Priority: P1)

Un membre approuvé et onboardé doit arriver sur `/chat` lorsqu'il se connecte, termine son onboarding, revient depuis l'attente après validation, clique le logo ou revient depuis les paramètres.

**Why this priority**: Le chat est la destination principale de la Beta/MVP. Les redirections vers Forum créent une promesse produit trop large et contredisent le positionnement Beta 1.

**Independent Test**: Un membre approuvé et onboardé peut parcourir chaque entrée post-admission connue et constater que la destination par défaut est `/chat` sans passer par Forum.

**Acceptance Scenarios**:

1. **Given** un membre approuvé et onboardé, **When** il se connecte ou revient sur une page publique/auth, **Then** il est dirigé vers `/chat`.
2. **Given** un membre approuvé non onboardé, **When** il termine l'onboarding, **Then** il est dirigé vers `/chat` et le message de bienvenue ne l'oriente pas vers Forum.
3. **Given** un membre en attente qui vient d'être validé, **When** il vérifie son statut ou revient sur la page d'attente, **Then** il est dirigé vers `/chat` s'il est onboardé ou vers l'onboarding s'il ne l'est pas encore.
4. **Given** un membre non admin qui tente d'accéder à l'administration, **When** l'accès est refusé, **Then** il revient vers `/chat` plutôt que `/forum`.
5. **Given** un membre utilise le logo, la sidebar ou le retour paramètres, **When** il active ces contrôles, **Then** la destination par défaut est `/chat`.

---

### User Story 2 - Navigation MVP sans Forum ni Annuaire (Priority: P1)

Un membre validé doit voir une navigation principale centrée sur le chat, sans entrée visible Forum ni Annuaire.

**Why this priority**: La Beta 1 doit réduire la confusion et ne pas présenter les surfaces legacy comme fonctionnalités disponibles du MVP.

**Independent Test**: Un membre approuvé ouvre l'application et vérifie la navigation principale sur desktop et mobile: Chat reste visible, Forum et Annuaire ne sont plus mis en avant.

**Acceptance Scenarios**:

1. **Given** un membre approuvé ouvre l'application, **When** la sidebar principale est affichée, **Then** Forum n'apparaît pas comme entrée de navigation principale.
2. **Given** un membre approuvé ouvre l'application, **When** la sidebar principale est affichée, **Then** Annuaire n'apparaît pas comme entrée de navigation principale.
3. **Given** un membre utilise une route legacy directe, **When** `/forum`, `/membres` ou `/membres/[id]` est ouvert directement, **Then** la route reste accessible si l'utilisateur a les droits existants.

---

### User Story 3 - Landing publique alignée avec la Beta 1 (Priority: P1)

Un visiteur public doit comprendre que la Beta 1 donne accès à un réseau vérifié centré sur les échanges, sans promesse visible de Forum, Annuaire complet ou offres/jobs déjà disponibles.

**Why this priority**: Les promesses publiques hors MVP créent des attentes que la Beta 1 ne doit pas porter.

**Independent Test**: Un visiteur public parcourt la landing et le footer sans trouver de promesse fonctionnelle explicite pour Forum, Annuaire ou offres/jobs disponibles en Beta 1.

**Acceptance Scenarios**:

1. **Given** un visiteur ouvre la landing, **When** il lit les sections de fonctionnalités et d'étapes, **Then** les textes ne promettent plus Forum, Annuaire ou offres/jobs comme surfaces disponibles.
2. **Given** un visiteur parcourt le footer public, **When** il consulte les liens de plateforme, **Then** Forum et Annuaire ne sont plus proposés comme entrées publiques.
3. **Given** la landing mentionne la valeur du réseau, **When** elle décrit la Beta 1, **Then** elle reste compatible avec une expérience centrée sur admission, profils vérifiés et chat.

---

### User Story 4 - Chat débarrassé des propositions hors MVP (Priority: P2)

Un membre validé doit utiliser les salons existants sans être invité à proposer ou voter de nouveaux salons pendant la Beta 1.

**Why this priority**: Les propositions de salons impliquent une gouvernance et une automatisation non retenues pour Beta 1, et élargissent la promesse produit.

**Independent Test**: Un membre ouvre l'interface chat et vérifie que la liste de salons ne montre pas de section Propositions, bouton Proposer un salon, formulaire de proposition ou action de vote.

**Acceptance Scenarios**:

1. **Given** des propositions de salons existent déjà, **When** un membre ouvre le chat, **Then** elles ne sont pas affichées dans l'interface MVP.
2. **Given** un membre ouvre la liste des salons, **When** il cherche une action de création/proposition, **Then** aucun point d'entrée visible de proposition de salon n'est disponible.
3. **Given** des salons masqués existent pour le membre, **When** il utilise les contrôles de salons retenus, **Then** le masquage/affichage des salons existants reste inchangé.

---

### User Story 5 - Compatibilité legacy et refus explicite (Priority: P2)

Un membre ou ancien lien doit conserver un comportement contrôlé: les routes legacy restent accessibles directement, les liens chat évidents utilisent les routes canoniques, et un utilisateur refusé reçoit une information claire.

**Why this priority**: La réduction de surface MVP ne doit pas casser les liens existants ni masquer les décisions d'admission.

**Independent Test**: Un testeur ouvre les routes legacy directement, déclenche les liens chat connus et vérifie le parcours d'un utilisateur refusé sans constater de suppression de route ni de redirection silencieuse vers connexion.

**Acceptance Scenarios**:

1. **Given** un membre approuvé ouvre `/forum` directement, **When** la route charge, **Then** elle reste contrôlée et accessible selon les règles existantes, même si elle n'est plus visible dans la navigation MVP.
2. **Given** un membre approuvé ouvre `/membres` ou `/membres/[id]` directement, **When** la route charge, **Then** elle reste contrôlée et accessible selon les règles existantes, même si Annuaire n'est plus visible dans la navigation MVP.
3. **Given** un lien interne vers un salon dispose déjà d'un slug canonique, **When** ce lien est affiché ou généré, **Then** il pointe vers `/chat/[slug]` plutôt que `/chat?channel=...`.
4. **Given** un lien interne vers un salon ne dispose pas du slug sans élargir le flux de données, **When** la correction minimale n'est pas possible, **Then** le comportement existant peut rester toléré et doit être signalé comme suivi séparé.
5. **Given** un utilisateur authentifié a été refusé, **When** il tente d'accéder à l'application ou à l'attente, **Then** il voit un message clair de refus ou une sortie explicite, sans redirection silencieuse vers `/connexion`.

### Edge Cases

- Un utilisateur approuvé mais non onboardé tente d'ouvrir `/chat` directement.
- Un utilisateur en attente devient approuvé pendant qu'il est sur `/en-attente`.
- Un utilisateur non admin tente d'accéder à `/admin` ou `/admin/utilisateurs`.
- Des favoris, notifications ou embeds historiques pointent encore vers `/forum/posts/...`.
- Un résultat de recherche message a un slug de salon disponible, tandis qu'une notification de mention peut n'avoir que l'identifiant du salon.
- Des DMs existants restent techniquement présents dans le chat.
- Un utilisateur refusé est encore authentifié et tente d'ouvrir une route protégée.
- Une personne non authentifiée tente d'ouvrir une route legacy protégée.
- Des données de propositions de salons existent déjà mais ne doivent pas être exposées dans l'interface MVP.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Les parcours post-login pour les membres approuvés et onboardés MUST utiliser `/chat` comme destination par défaut.
- **FR-002**: Le parcours post-onboarding MUST terminer sur `/chat` et ne MUST plus créer de destination utilisateur visible vers Forum.
- **FR-003**: Le parcours d'attente validée MUST envoyer un membre onboardé vers `/chat` et un membre non onboardé vers l'onboarding.
- **FR-004**: Les retours depuis paramètres, logo/sidebar et fallback admin non autorisé MUST pointer vers `/chat` par défaut.
- **FR-005**: La navigation principale membre MUST masquer Forum comme entrée MVP visible.
- **FR-006**: La navigation principale membre MUST masquer Annuaire comme entrée MVP visible.
- **FR-007**: `/forum`, `/membres` et `/membres/[id]` MUST rester accessibles directement selon les règles d'accès existantes.
- **FR-008**: `/chat` et `/chat/[slug]` MUST rester les routes canoniques visibles du chat.
- **FR-009**: L'interface chat MUST masquer la section des propositions de salons, les votes associés, le formulaire de proposition et l'action "Proposer un salon".
- **FR-010**: Les DMs existants MAY rester techniquement présents, mais cette feature MUST NOT ajouter ou mettre en avant de nouveaux points d'entrée visibles vers les DMs.
- **FR-011**: La landing publique MUST retirer ou reformuler les promesses explicites de Forum, Annuaire et offres/jobs comme fonctionnalités Beta 1 disponibles.
- **FR-012**: Le footer public et les liens publics évidents MUST ne plus proposer Forum ou Annuaire comme entrées de plateforme.
- **FR-013**: Les liens internes évidents vers `/chat?channel=...` MUST être remplacés par `/chat/[slug]` lorsque le slug canonique est déjà disponible sans refactor large.
- **FR-014**: Les liens `/chat?channel=...` qui ne peuvent pas être corrigés minimalement MUST rester fonctionnels ou tolérés sans élargissement de scope, et être documentés pour suivi ultérieur.
- **FR-015**: Un utilisateur refusé MUST recevoir une indication explicite de refus ou une sortie contrôlée, et MUST NOT être simplement renvoyé vers `/connexion` sans contexte.
- **FR-016**: La feature MUST NOT supprimer les routes legacy existantes.
- **FR-017**: La feature MUST NOT modifier les migrations, fichiers Supabase, règles d'autorisation, schéma de base de données, dépendances ou fichiers de lock.
- **FR-018**: La feature MUST préserver le comportement de lecture/envoi chat retenu pour les salons existants.
- **FR-019**: La feature MUST passer la vérification de build existante et les tests ciblés existants pertinents pour les surfaces touchées.

### Key Entities

- **Membre approuvé et onboardé**: Utilisateur admis qui doit être dirigé vers l'expérience principale `/chat`.
- **Membre en attente**: Utilisateur authentifié qui n'a pas encore accès à l'application principale et peut être redirigé vers l'onboarding ou le chat après validation.
- **Utilisateur refusé**: Utilisateur authentifié dont l'admission est refusée et qui doit recevoir un état explicite.
- **Surface MVP visible**: Ensemble des entrées et promesses exposées dans la navigation principale, le chat et la landing publique.
- **Route legacy**: Route existante conservée pour compatibilité directe, notamment `/forum`, `/membres` et `/membres/[id]`.
- **Route chat canonique**: Destination visible retenue pour le chat, notamment `/chat` et `/chat/[slug]`.
- **Proposition de salon**: Fonctionnalité existante ou donnée associée aux propositions/votes de salons, masquée pour Beta 1.

## Brownfield Context *(mandatory)*

- **Current behavior**: Les audits `app_flow.md` et `specs/004-release-readiness/phase-2-audit.md` indiquent que Forum reste la destination dominante dans les parcours de login, onboarding, attente validée, fallback admin, retour paramètres, logo/sidebar, notifications et embeds. La landing et son footer exposent encore Forum, Annuaire et des promesses d'offres/jobs. Le chat expose encore les propositions de salons et certains liens internes peuvent utiliser `/chat?channel=...` alors que `/chat` et `/chat/[slug]` sont les routes canoniques.
- **Affected surface**: Routes publiques/auth (`/`, `/connexion`, `/inscription`, `/auth/callback`, `/en-attente`, `/onboarding`), routes app (`/chat`, `/chat/[slug]`, `/forum`, `/membres`, `/membres/[id]`, `/parametres`, `/admin`), navigation principale, landing publique, interface de liste des salons, liens/recherches/notifications chat, et UX des statuts d'admission.
- **Keep**: `/chat` et `/chat/[slug]` comme destinations visibles; `/forum`, `/membres` et `/membres/[id]` comme routes directes compatibles; les salons existants; les DMs existants si leur retrait exige un refactor; les liens internes de profil membre déjà utilisés.
- **Adapt**: Destinations par défaut vers `/chat`; navigation principale; landing publique; propositions de salons visibles; liens `/chat?channel=...` évidents; message ou sortie des utilisateurs refusés.
- **Freeze**: Supabase, migrations, RLS, schéma DB, dépendances, package locks, suppression de routes legacy, refonte UI, refactor large du chat/forum/annuaire/notifications, et implémentation jobs/offres.
- **Archive later**: Retrait complet de Forum, retrait complet Annuaire, remplacement profond des DMs, gouvernance des propositions de salons et nouvelles offres/jobs restent hors de cette feature.
- **Compatibility risks**: Remplacer trop largement les liens Forum peut casser notifications et bookmarks historiques; supprimer `/membres/[id]` peut casser les fiches internes; corriger `/chat?channel=...` sans slug disponible peut imposer un refactor; masquer des surfaces sans conserver l'accès direct peut casser la compatibilité legacy; renvoyer les refusés vers connexion sans message peut créer une boucle incompréhensible.
- **Out of scope**: Toute migration Supabase, changement RLS, changement de schéma, suppression de route, changement de dépendance, refonte UI, refactor large, création du système jobs/offres, ou modification profonde des permissions chat/forum/annuaire.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des destinations par défaut post-login, post-onboarding, attente validée, retour paramètres, logo/sidebar et fallback admin non autorisé mènent à `/chat` pour un membre approuvé et onboardé.
- **SC-002**: 0 entrée Forum et 0 entrée Annuaire sont visibles dans la navigation principale membre.
- **SC-003**: 0 promesse publique explicite de Forum, Annuaire ou offres/jobs disponibles en Beta 1 reste visible sur la landing et son footer.
- **SC-004**: 0 contrôle visible de proposition, vote ou liste de propositions de salons reste affiché dans l'interface chat MVP.
- **SC-005**: 100% des routes legacy retenues (`/forum`, `/membres`, `/membres/[id]`) restent accessibles directement selon les règles d'accès existantes.
- **SC-006**: 100% des liens internes chat disposant déjà d'un slug canonique ouvrent `/chat/[slug]` plutôt que `/chat?channel=...`.
- **SC-007**: 100% des utilisateurs refusés testés voient un état explicite de refus ou une sortie contrôlée, sans redirection silencieuse vers connexion.
- **SC-008**: 0 changement est présent dans les migrations, fichiers Supabase, règles d'autorisation, schéma DB, dépendances ou fichiers de lock.
- **SC-009**: La vérification de build existante réussit et les tests ciblés pertinents pour les surfaces touchées réussissent.

## Assumptions

- Le terme "navigation principale" couvre la sidebar membre et les entrées publiques évidentes de plateforme, pas les liens contextuels historiques dans des contenus ou notifications legacy.
- `/forum` et `/membres` restent des surfaces legacy tolérées, non promues, et non supprimées.
- `/membres/[id]` peut rester accessible depuis les liens internes existants, car il sert de fiche membre compatible.
- Les liens Forum dans notifications, embeds, posts ou activités historiques peuvent rester si leur correction dépasse le retrait des destinations par défaut et de la navigation visible.
- Les propositions de salons sont masquées pour Beta 1 sans supprimer les données existantes.
- Les DMs existants peuvent rester si leur masquage complet exige un refactor ou casse des conversations existantes.
- La correction `/chat?channel=...` vers `/chat/[slug]` est limitée aux endroits où le slug est déjà disponible dans le contexte courant.
- Les vérifications ciblées utilisent les tests existants pertinents; de nouveaux tests ne sont requis que si le plan d'implémentation estime qu'ils sont nécessaires pour sécuriser un flux touché.
