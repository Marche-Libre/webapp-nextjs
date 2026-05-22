# RFC - Suppression persistante des messages avec media

## Statut

Prêt pour implémentation (Phase 0 initiée - 2026-05-22).

## Date

2026-05-19

## Resume

La suppression actuelle d'un message de chat n'est pas persistante pour les messages avec media. Le client vide seulement `messages.content`, puis force localement l'affichage du message comme supprime. Si `messages.image_url` existe encore, le message est relu depuis Supabase apres navigation ou rechargement et le media reapparait.

Cette RFC propose de remplacer ce comportement par une suppression logique du message en base et une suppression physique des fichiers media via l'API Supabase Storage.

Decision proposee:

- garder le message en base sous forme de tombstone;
- retirer `content`, `image_url` et `is_pinned`;
- ajouter `deleted_at` et `deleted_by`;
- supprimer les objets Storage via `supabase.storage.from("medias").remove(paths)`;
- passer par une Server Action unique, pas par une mutation directe depuis le composant React.

## Probleme

Dans le chat, la suppression d'un message ne supprime pas reellement le message ni son media.

Flux actuel:

1. L'utilisateur clique sur supprimer.
2. Le composant appelle `supabase.from("messages").update({ content: "" })`.
3. Le composant met `deleted=true` localement.
4. Le message semble supprime.
5. Au changement de page, le canal recharge les messages depuis Supabase.
6. Si `image_url` existe encore, le message ne correspond plus a la condition de tombstone et reapparait avec son media.

Cause racine:

- la suppression est une mutation partielle du contenu, pas une suppression de l'entite;
- `image_url` est protege contre les updates arbitraires par trigger DB;
- le media Storage n'est jamais supprime dans le flux de suppression;
- l'etat local masque temporairement le probleme de persistence.

## Objectifs

- Garantir qu'une suppression de message soit persistante apres navigation et rechargement.
- Supprimer les fichiers media associes dans le bucket Supabase Storage `medias`.
- Conserver la chronologie du chat avec un tombstone lisible.
- Preserver les reponses, references, moderation et audit minimal.
- Centraliser l'autorisation cote serveur.
- Eviter toute suppression SQL directe dans `storage.objects`.

## Non-objectifs

- Suppression de compte utilisateur.
- Suppression de canaux entiers.
- Politique de retention legale complete.
- Nettoyage retrospectif massif des medias historiques.
- Refonte UX du chat.
- Mise en place obligatoire d'un job robuste de retry Storage dans le MVP.

## Portee

Inclus:

- messages du chat `public.messages`;
- medias stockes dans le bucket Supabase Storage `medias`;
- chemins media stockes dans `messages.image_url`;
- suppression par auteur du message;
- suppression par administrateur;
- affichage stable du tombstone apres reload;
- nettoyage des fichiers media associes pour les nouvelles suppressions.

Exclus:

- nettoyage destructif massif des medias historiques sans validation explicite;
- changement de modele de permissions global du chat;
- hard delete des messages.

## Decision proposee

Utiliser une suppression logique du message et une suppression physique du media.

Le message reste en base sous forme de tombstone. Le contenu visible et les references media sont retires de la ligne `messages`. Les objets Storage correspondants sont supprimes via l'API Supabase Storage.

Un message est considere supprime si `deleted_at IS NOT NULL`.

Pour un message supprime:

- `content = ''`;
- `image_url = NULL`;
- `is_pinned = FALSE`;
- `deleted_at` contient la date de suppression;
- `deleted_by` contient l'utilisateur qui a execute la suppression;
- les reponses existantes restent rattachees au message supprime;
- l'UI affiche "Ce message a ete supprime".

## Rationale

Le tombstone conserve la chronologie et evite de casser les replies. La suppression physique du fichier via Storage API evite de garder des medias accessibles ou orphelins dans le bucket.

La suppression Storage ne doit pas etre faite par SQL direct sur `storage.objects`. Supabase Storage doit etre manipule via son API pour respecter le comportement attendu du service, ses validations et ses policies.

La Server Action donne un point d'entree unique pour:

- recharger le message depuis la base;
- verifier l'utilisateur courant;
- verifier auteur ou admin;
- appliquer la transition tombstone;
- supprimer les objets Storage;
- eviter de faire confiance aux champs fournis par le client.

## Alternatives considerees

### Option A - Garder la suppression client actuelle

Description:

- continuer a faire `update({ content: "" })` depuis `MessageBubble`;
- garder `deleted=true` localement.

Avantages:

- cout d'implementation minimal.

Inconvenients:

- ne corrige pas la reapparition des medias;
- laisse `image_url` en base;
- ne supprime pas les objets Storage;
- maintient une mutation directe fragile dans le client.

Decision:

- Rejetee.

### Option B - Hard delete SQL du message

Description:

- supprimer la ligne `public.messages`.

Avantages:

- modele simple a comprendre;
- plus de message a masquer.

Inconvenients:

- casse ou degrade les replies;
- retire du contexte de moderation;
- complique l'audit;
- ne regle pas seul la suppression Storage;
- risque de regression sur realtime et references existantes.

Decision:

- Rejetee.

### Option C - Tombstone DB + suppression Storage API

Description:

- ajouter `deleted_at` et `deleted_by`;
- vider `content`;
- mettre `image_url = NULL`;
- mettre `is_pinned = FALSE`;
- supprimer les fichiers via `supabase.storage.from("medias").remove(paths)`.

Avantages:

- stable apres reload;
- conserve la chronologie;
- preserve les replies;
- nettoie Storage par l'API correcte;
- compatible avec une implementation MVP.

Inconvenients:

- DB et Storage ne sont pas transactionnels ensemble;
- un echec Storage apres tombstone peut creer un fichier orphelin;
- demande une attention RLS/trigger.

Decision:

- Retenue pour le MVP.

### Option D - Tombstone DB + table de retry Storage

Description:

- meme approche que l'option C;
- ajouter `private.pending_storage_deletions`;
- enregistrer les chemins a supprimer;
- job periodique ou action admin pour retry.

Avantages:

- meilleure garantie operationnelle;
- rend les echecs Storage recuperables;
- facilite l'audit.

Inconvenients:

- plus de schema;
- plus de code serveur;
- besoin d'un job ou d'une action admin;
- peut depasser le besoin MVP immediat.

Decision:

- Reportee sauf si le owner demande une garantie robuste des maintenant.

## Modele cible

Colonnes a ajouter a `public.messages`:

- `deleted_at TIMESTAMPTZ NULL`;
- `deleted_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL`.

Colonne optionnelle non retenue pour le MVP:

- `delete_reason TEXT NULL`.

La source de verite UI devient `deleted_at IS NOT NULL`.

Le fallback `!content && !image_url` peut rester temporairement pour compatibilite historique, mais il ne doit plus etre considere comme preuve de suppression persistante.

## Flux cible

Suppression utilisateur ou admin:

1. Le client appelle `deleteChatMessage(messageId)`.
2. Le serveur recupere l'utilisateur courant avec `supabase.auth.getUser()`.
3. Le serveur charge le profil courant.
4. Le serveur charge le message cible depuis `public.messages`.
5. Le serveur verifie l'autorisation:
   - auteur du message;
   - ou administrateur approuve et onboarde.
6. Le serveur extrait les chemins media depuis `message.image_url`.
7. Le serveur applique le tombstone:
   - `content = ''`;
   - `image_url = NULL`;
   - `is_pinned = FALSE`;
   - `deleted_at = NOW()`;
   - `deleted_by = auth.uid()`.
8. Le serveur supprime les objets Storage via `supabase.storage.from("medias").remove(paths)`.
9. Le client rafraichit le message ou le canal.

## Strategie d'atomicite

La base de donnees et Supabase Storage ne forment pas une transaction atomique commune.

Decision proposee:

- faire la base d'abord;
- faire Storage ensuite.

Raison:

- si la base echoue, rien ne doit changer;
- si la base reussit mais Storage echoue, le message ne reapparait pas;
- le fichier peut etre nettoye plus tard sans exposer a nouveau le message dans l'UI.

Comportement MVP en cas d'echec Storage:

- log serveur obligatoire;
- retour `{ success: true, cleanupWarning: true }`;
- audit manuel separe des medias orphelins.

Limite du MVP:

- apres `image_url = NULL`, les chemins ne sont plus disponibles dans `messages`;
- un retry robuste necessite de stocker les chemins avant ou pendant la suppression, par exemple dans `private.pending_storage_deletions`.

## Contrat serveur

Action:

```ts
deleteChatMessage(messageId: string): Promise<DeleteChatMessageResult>
```

Resultat:

```ts
type DeleteChatMessageResult =
  | { success: true; cleanupWarning?: boolean }
  | { success: false; error: string };
```

Regles:

- ne jamais faire confiance au client pour `author_id`, `channel_id`, `image_url`, `is_admin` ou `deleted_by`;
- le serveur recharge toujours le message depuis la base;
- le serveur valide que l'utilisateur est approuve;
- le serveur valide auteur ou admin;
- le serveur ne retourne pas les chemins media au client;
- l'action est idempotente si le message est deja supprime.

Emplacement recommande:

- `src/app/(app)/chat/actions.ts`.

## Details DB et RLS

Migration:

1. Ajouter `deleted_at`.
2. Ajouter `deleted_by`.
3. Ajouter un index partiel sur `deleted_at` si utile pour audit/recherche des tombstones.
4. Mettre a jour `private.prevent_message_unsafe_update`.
5. Autoriser uniquement une transition controlee vers tombstone.
6. Supprimer la policy DELETE directe du flux chat si encore presente.

Transition tombstone autorisee pour un utilisateur standard:

```sql
OLD.deleted_at IS NULL
AND NEW.deleted_at IS NOT NULL
AND NEW.deleted_by = auth.uid()
AND NEW.content = ''
AND NEW.image_url IS NULL
AND NEW.is_pinned = FALSE
AND NEW.channel_id IS NOT DISTINCT FROM OLD.channel_id
AND NEW.author_id IS NOT DISTINCT FROM OLD.author_id
AND NEW.reply_to_message_id IS NOT DISTINCT FROM OLD.reply_to_message_id
```

Le trigger doit continuer d'interdire:

- changement de `channel_id`;
- changement de `author_id`;
- changement arbitraire de `image_url`;
- changement de `reply_to_message_id`;
- pinning non-admin;
- restauration d'un message deja tombstone par un utilisateur standard.

Policy UPDATE attendue:

- edition normale: auteur approuve, non banni, non mute;
- tombstone auteur: auteur approuve/onboarde, y compris si mute si decision MVP confirmee;
- tombstone admin: admin approuve/onboarde;
- aucun utilisateur non autorise.

## Nettoyage media

`image_url` peut contenir:

- un chemin string simple, exemple `chat/<channelId>/<userId>/<file>`;
- un tableau JSON de chemins;
- une URL distante;
- une preview locale `blob:` ou `data:`.

Regles d'extraction:

- accepter les strings simples;
- accepter les JSON arrays de strings;
- supprimer uniquement les chemins internes Storage valides;
- ignorer `http://` et `https://`;
- ignorer `blob:` et `data:`;
- limiter au prefixe `chat/`;
- dedupliquer les chemins.

Suppression:

```ts
await supabase.storage.from("medias").remove(paths);
```

Points a verifier:

- la policy Storage actuelle autorise la suppression par proprietaire du chemin;
- la policy Storage actuelle autorise la suppression par admin;
- avec un client serveur utilisateur, la RLS Storage reste appliquee.

## Changements UI

Modifier `MessageBubble`:

- remplacer la mutation directe `supabase.from("messages").update({ content: "" })`;
- appeler `deleteChatMessage(message.id)`;
- afficher une erreur si l'action retourne `success: false`;
- utiliser `deleted_at` comme source de verite;
- garder `deleted=true` seulement comme feedback local apres succes serveur;
- appeler `onMessageUpdated?.()` apres succes.

Modifier les types:

- ajouter `deleted_at` et `deleted_by` a `Message`;
- propager `deleted_at` aux types de reply si necessaire.

Modifier les citations:

- si la cible reply est tombstone, afficher "Message supprime";
- ne pas dependre seulement de `content` vide et `image_url` vide.

## Decisions a prendre

1. Un utilisateur mute peut-il supprimer ses propres anciens messages ?

Recommendation:

- oui pour l'auteur;
- raison: supprimer son propre contenu reduit le risque et ne permet pas de publier.

2. Les admins doivent-ils pouvoir supprimer les medias de tous les auteurs ?

Recommendation:

- oui;
- raison: moderation complete, coherent avec suppression admin de message.

3. Faut-il une table de retry Storage maintenant ?

Recommendation MVP:

- non;
- utiliser `cleanupWarning` + log serveur + audit manuel.

Recommendation robuste:

- oui si l'objectif est une garantie operationnelle forte;
- ajouter `private.pending_storage_deletions`.

## Consequences

Consequences positives:

- les messages avec photo ne reapparaissent plus apres reload;
- les replies restent rattachees;
- la moderation garde le contexte;
- le client ne porte plus l'autorisation de suppression;
- les medias sont supprimes via l'API correcte.

Consequences negatives:

- la suppression DB et Storage n'est pas atomique;
- des fichiers orphelins restent possibles en MVP;
- la migration RLS/trigger doit etre precise;
- un audit historique reste necessaire pour les medias deja orphelins.

## Plan d'execution

### Phase 0 - Preparation et hygiene

Priorite: P0  
Effort: S  
Risque: bas

Taches:

- Nettoyer les artefacts de travail non voulus avant implementation.
- Revalider le scope exact de la story.
- Verifier la policy `storage.objects` DELETE pour bucket `medias`.
- Verifier `private.prevent_message_unsafe_update`.
- Verifier la policy UPDATE sur `public.messages`.
- Verifier la doc Supabase Storage remove.

Definition de fini:

- le repo est propre pour commencer la feature;
- les contraintes RLS/trigger deja en place sont connues.

### Phase 1 - Decisions produit

Priorite: P0  
Effort: S  
Risque: bas

Taches:

- trancher suppression auteur quand mute;
- confirmer suppression admin globale des medias;
- confirmer strategie MVP `cleanupWarning` ou retry robuste.

Definition de fini:

- les decisions sont notees dans cette RFC ou dans la story d'implementation.

### Phase 2 - Migration DB

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- creer une migration Supabase;
- ajouter `deleted_at`, `deleted_by`;
- ajouter index(s) utile(s) si necessaire;
- adapter le trigger de protection des updates message;
- adapter les policies UPDATE;
- supprimer la policy DELETE directe du flux chat si encore presente;
- verifier que `image_url` reste immuable hors transition tombstone.

Definition de fini:

- un message peut etre tombstone par l'auteur/admin;
- un utilisateur non autorise ne peut pas tombstone;
- `image_url` ne peut pas etre modifie arbitrairement;
- un message deja tombstone ne peut pas etre restaure par un utilisateur standard.

### Phase 3 - Server Action

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- creer l'action serveur dediee au chat;
- recharger le message cote serveur;
- valider utilisateur, profil, auteur/admin;
- parser `image_url`;
- appliquer le tombstone;
- supprimer les medias Storage;
- retourner un resultat minimal au client;
- rendre l'action idempotente.

Definition de fini:

- le client ne fait plus de mutation directe pour supprimer un message;
- les echecs d'autorisation sont propres;
- les echecs Storage sont journalises;
- un echec Storage ne fait pas reapparaitre le message.

### Phase 4 - UI chat

Priorite: P0  
Effort: S  
Risque: bas

Taches:

- remplacer `handleDelete` dans `MessageBubble`;
- afficher le tombstone selon `deleted_at`;
- rafraichir le message/canal apres suppression;
- afficher une erreur si suppression refusee;
- garder l'etat local uniquement comme feedback apres succes serveur;
- mettre a jour les types;
- adapter le rendu des citations/replies.

Definition de fini:

- suppression message texte stable apres navigation;
- suppression message photo stable apres navigation;
- UX proche de l'existant.

### Phase 5 - Tests

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- test source: plus de `.update({ content: "" })` direct dans le composant;
- test action serveur: auteur autorise;
- test action serveur: admin autorise;
- test action serveur: autre membre refuse;
- test action serveur: message deja supprime;
- test action serveur: echec Storage -> `cleanupWarning: true`;
- test parser media: string, JSON array, URL externe, `blob:`, `data:`;
- test migration ou assertion source pour `deleted_at`;
- verifier lint/build/tests en distinguant les echecs preexistants.

Definition de fini:

- les regressions principales sont couvertes;
- les echecs de test existants sont distingues des nouveaux echecs.

### Phase 6 - Nettoyage des orphelins historiques

Priorite: P1  
Effort: M  
Risque: moyen

Taches:

- auditer les objets `medias/chat/...` sans message actif correspondant;
- produire une liste avant suppression;
- demander validation owner avant suppression destructive;
- supprimer par Storage API uniquement.

Definition de fini:

- aucun nettoyage destructif n'est lance sans validation explicite;
- les orphelins connus sont documentes.

## Sequencement recommande

1. Clore les decisions produit.
2. Executer Phase 0.
3. Implementer migration DB.
4. Implementer Server Action + parser media.
5. Brancher UI + types.
6. Ajouter les tests et verifier.
7. Lancer l'audit historique separe.

## Risques

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Storage delete echoue apres tombstone | Fichier orphelin | Log + `cleanupWarning`; retry robuste si besoin |
| RLS bloque la suppression Storage admin | Admin ne nettoie pas certains medias | Verifier `private.can_current_user_access_chat_media_path(..., 'delete')` |
| Trigger DB bloque `image_url = NULL` | Suppression impossible | Autoriser uniquement la transition tombstone |
| Policy UPDATE bloque auteur mute | Auteur ne peut pas supprimer son contenu | Autoriser tombstone auteur meme mute si decision confirmee |
| Realtime ne propage pas le tombstone | UI stale jusqu'au refresh | Rafraichir message/canal apres action |
| Hard delete casse les replies | Perte contexte | Garder tombstone |

## Criteres d'acceptation

- Supprimer un message texte affiche un tombstone et reste supprime apres changement de page.
- Supprimer un message avec photo affiche un tombstone et reste supprime apres changement de page.
- Le media associe est supprime du bucket `medias`.
- Un membre ne peut supprimer que ses propres messages.
- Un admin peut supprimer tout message.
- Un membre non autorise ne peut pas supprimer le message d'un autre.
- Les reponses vers un message supprime restent visibles avec une citation "Message supprime" ou equivalent.
- Aucun secret Supabase n'est expose cote client.
- Aucune suppression SQL directe de fichiers Storage n'est utilisee.

## Verification manuelle

1. Envoyer un message texte.
2. Supprimer le message.
3. Changer de canal puis revenir.
4. Verifier que le tombstone reste affiche.
5. Envoyer un message avec photo.
6. Supprimer le message.
7. Changer de canal puis revenir.
8. Verifier que la photo ne reapparait pas.
9. Verifier dans Storage que l'objet `medias/chat/...` a ete supprime.
10. Essayer de supprimer le message d'un autre membre non-admin.
11. Verifier que l'action est refusee.
12. Essayer avec un admin.
13. Verifier que la suppression reussit.

## Historique d'implémentation (ajouté 2026-05-22)

**Statut actuel :** Prêt pour Phase 0.

**Ce qui a été fait :**
- Exécution du workflow `bmad-check-implementation-readiness`.
- Validation alignement avec le PRD (FR17–FR21 chat fiable + NFR1–NFR11, NFR29).
- Analyse du code actuel :
  - `src/components/chat/message-bubble.tsx:386` : `handleDelete` fait un update client direct :
    ```ts
    .update({ content: "", updated_at: new Date().toISOString() })
    ```
  - + état local `deleted` + `deleteConfirming`.
  - Comportement exactement décrit dans la section "Problème" de cette RFC (media réapparaît après reload).
- `message-bubble-actions.tsx` et `chat-store.tsx` également concernés.
- Aucune Server Action dédiée n'existe encore (`deleteChatMessage` à créer dans `src/app/(app)/chat/actions.ts`).

**Prochaine étape :**
- Lancer **Phase 0** (vérification policies RLS, trigger `private.prevent_message_unsafe_update`, Storage DELETE policy sur bucket `medias`, hygiene).
- Puis Phase 2 (migration DB : `deleted_at`, `deleted_by`, mise à jour trigger + policies).

Le fichier est maintenant à jour. On peut lancer la Phase 0 dès que tu dis "go phase 0".
