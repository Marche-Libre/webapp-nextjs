# Plan - Suppression des messages avec media

## Contexte

Dans le chat, la suppression actuelle d'un message ne supprime pas reellement le message ni son media. Le client vide seulement `messages.content`, puis force localement l'affichage du message comme supprime.

Pour un message texte seul, ce comportement ressemble a une suppression parce que le rendu detecte `content` vide et `image_url` vide. Pour un message avec photo, `image_url` reste en base. Au changement de page ou au rechargement du canal, le message est relu depuis Supabase avec son media et reapparait.

## Objectif

Garantir qu'une suppression de message soit persistante, coherente apres navigation/rechargement, et qu'elle nettoie les fichiers media associes dans Supabase Storage.

## Decision d'architecture

Utiliser une suppression logique du message et une suppression physique du media.

- Le message reste en base sous forme de tombstone pour conserver la chronologie, les reponses, la moderation et les references.
- Le contenu visible est retire.
- Les chemins media sont retires de `messages.image_url`.
- Les objets Storage correspondants sont supprimes via Supabase Storage API.
- La suppression passe par un point d'entree serveur unique, pas par une mutation directe depuis le composant React.

## Pourquoi pas une cascade SQL pure

Supabase Storage ne doit pas etre nettoye par suppression SQL directe sur `storage.objects`. La suppression doit passer par la Storage API, sinon le fichier peut rester orphelin dans le bucket.

Le schema SQL peut proteger la transition du message, mais la suppression fichier doit etre orchestree par une Server Action, un Route Handler, ou un job serveur.

## Portee

Inclus:

- Messages du chat `public.messages`.
- Medias stockes dans le bucket Supabase Storage `medias`.
- Chemins media stockes dans `messages.image_url`.
- Suppression par auteur du message.
- Suppression par administrateur.
- Nettoyage des fichiers media associes.
- Affichage stable du tombstone apres reload.

Exclus:

- Suppression de compte utilisateur.
- Suppression de canaux entiers.
- Politique de retention legale complete.
- Nettoyage retrospectif massif des medias historiques, sauf script separe approuve.
- Refonte UX du chat.

## Etat Actuel Observe

### Flux actuel

1. L'utilisateur clique sur supprimer.
2. Le composant appelle `supabase.from("messages").update({ content: "" })`.
3. Le composant met `deleted=true` localement.
4. Le message semble supprime.
5. Au changement de page, le canal recharge les messages depuis Supabase.
6. Si `image_url` existe encore, le message ne correspond plus a la condition de tombstone et reapparait avec son media.

### Cause racine

- La suppression est une mutation partielle du contenu, pas une suppression de l'entite.
- `image_url` est volontairement protege contre les updates arbitraires par trigger DB.
- Le media Storage n'est jamais supprime dans le flux de suppression.
- L'etat local masque temporairement le probleme de persistence.

## Modele Cible

### Colonnes recommandees

Ajouter a `public.messages`:

- `deleted_at TIMESTAMPTZ NULL`
- `deleted_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL`

Optionnel:

- `delete_reason TEXT NULL`

### Semantique cible

Un message est supprime si `deleted_at IS NOT NULL`.

Pour un message supprime:

- `content = ''`
- `image_url = NULL`
- `is_pinned = FALSE`
- `deleted_at` contient la date de suppression
- `deleted_by` contient l'utilisateur qui a execute la suppression
- Les reponses existantes restent rattachees au message supprime
- L'UI affiche "Ce message a ete supprime"

## Flux Cible

### Suppression utilisateur ou admin

1. Le client appelle `deleteChatMessage(messageId)`.
2. Le serveur recupere l'utilisateur courant avec `supabase.auth.getUser()`.
3. Le serveur charge le message cible.
4. Le serveur verifie l'autorisation:
   - auteur du message, ou
   - administrateur approuve et onboarde.
5. Le serveur extrait les chemins media depuis `message.image_url`.
6. Le serveur tombstone le message en base:
   - `content = ''`
   - `image_url = NULL`
   - `is_pinned = FALSE`
   - `deleted_at = NOW()`
   - `deleted_by = auth.uid()`
7. Le serveur supprime les objets Storage via `supabase.storage.from("medias").remove(paths)`.
8. Le client rafraichit le message ou le canal.

## Strategie d'atomicite

La base de donnees et Supabase Storage ne forment pas une transaction atomique commune. Il faut choisir le comportement le plus sur pour l'utilisateur.

Decision: base d'abord, Storage ensuite.

Raison:

- Si la base echoue, rien ne doit changer.
- Si la base reussit mais Storage echoue, le message ne reapparait pas.
- Le fichier peut etre nettoye par retry sans exposer a nouveau le message dans l'UI.

Mesure compensatoire:

- Ajouter une table ou un mecanisme de retry pour medias a supprimer si le remove Storage echoue.

Option simple MVP:

- Log serveur + retour `success: true, cleanupWarning: true`.
- Ajouter un script manuel d'audit des medias orphelins.

Option robuste:

- Table `private.pending_storage_deletions`.
- Job periodique ou action admin pour retry les suppressions.

## Contrat Serveur

### Action

`deleteChatMessage(messageId: string): Promise<DeleteChatMessageResult>`

### Resultat

```ts
type DeleteChatMessageResult =
  | { success: true; cleanupWarning?: boolean }
  | { success: false; error: string };
```

### Regles

- Ne jamais faire confiance au client pour `author_id`, `channel_id`, `image_url`, ou `is_admin`.
- Le serveur recharge toujours le message depuis la base.
- Le serveur valide que l'utilisateur est approuve.
- Le serveur valide auteur ou admin.
- Le serveur ne retourne pas les chemins media au client.

## Changements DB

### Migration

1. Ajouter `deleted_at` et `deleted_by`.
2. Mettre a jour le trigger `private.prevent_message_unsafe_update`.
3. Autoriser une transition controlee vers tombstone.
4. Continuer d'interdire:
   - changement de `channel_id`
   - changement de `author_id`
   - changement arbitraire de `image_url`
   - changement de `reply_to_message_id`
   - pinning non-admin

### Politique RLS

Verifier que la policy UPDATE permet:

- auteur approuve et non banni/mute, si la suppression auteur reste autorisee;
- admin approuve/onboarde;
- aucun utilisateur non autorise.

Point a trancher:

- Un utilisateur mute peut-il supprimer ses propres anciens messages ?

Recommendation MVP:

- Oui pour l'auteur, car supprimer son propre contenu reduit le risque.
- Admin toujours autorise.

## Changements UI

1. Remplacer la mutation directe dans `MessageBubble`.
2. Appeler l'action serveur `deleteChatMessage`.
3. Gerer les erreurs explicitement.
4. Utiliser `deleted_at` comme source de verite.
5. Ne plus utiliser `deleted=true` comme preuve de suppression persistante.
6. Garder l'etat local uniquement pour feedback immediat apres succes serveur.

## Nettoyage Media

### Extraction des chemins

`image_url` peut contenir:

- un chemin string simple, exemple `chat/<channelId>/<userId>/<file>`
- potentiellement un tableau JSON de chemins, car le rendu supporte deja ce format
- une URL distante ou `blob:`/`data:` dans certains cas historiques ou previews

Regle:

- Supprimer uniquement les chemins internes Storage valides.
- Ignorer les URLs externes.
- Ignorer les `blob:` et `data:`.
- Limiter au prefixe `chat/`.

### Suppression

Utiliser:

```ts
await supabase.storage.from("medias").remove(paths);
```

Attention:

- La policy Storage actuelle autorise la suppression par proprietaire du chemin ou admin.
- Supabase Storage remove necessite les permissions Storage adequates.
- Pour un serveur avec client utilisateur, RLS reste appliquee.

## Plan d'execution

### Phase 1 - Specification et garde-fous

Priorite: P0  
Effort: S  
Risque: bas

Taches:

- Valider la decision tombstone + suppression Storage.
- Confirmer si un utilisateur mute peut supprimer ses messages.
- Confirmer si les admins doivent pouvoir supprimer les medias de tous les auteurs.

Definition de fini:

- Les choix ci-dessus sont notes dans la story ou l'issue d'implementation.

### Phase 2 - Migration DB

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- Creer une migration Supabase.
- Ajouter `deleted_at`, `deleted_by`.
- Adapter le trigger de protection des updates message.
- Ajouter ou ajuster les indexes si necessaire.
- Verifier RLS pour UPDATE.

Definition de fini:

- Un message peut etre tombstone par l'auteur/admin.
- Un utilisateur non autorise ne peut pas tombstone.
- `image_url` ne peut pas etre modifie arbitrairement.

### Phase 3 - Action serveur

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- Creer une action serveur dediee au chat.
- Recharger le message cote serveur.
- Valider utilisateur, profil, auteur/admin.
- Parser `image_url`.
- Appliquer le tombstone.
- Supprimer les medias Storage.
- Retourner un resultat minimal au client.

Definition de fini:

- Le client ne fait plus de mutation directe pour supprimer un message.
- Les echecs d'autorisation sont propres.
- Les echecs Storage sont journalises et ne font pas reapparaitre le message.

### Phase 4 - UI chat

Priorite: P0  
Effort: S  
Risque: bas

Taches:

- Remplacer `handleDelete` dans `MessageBubble`.
- Afficher le tombstone selon `deleted_at`.
- Rafraichir le message/canal apres suppression.
- Afficher une erreur si suppression refusee.

Definition de fini:

- Suppression message texte stable apres navigation.
- Suppression message photo stable apres navigation.
- L'UX reste proche de l'existant.

### Phase 5 - Tests

Priorite: P0  
Effort: M  
Risque: moyen

Taches:

- Test source ou comportement pour verifier que la suppression ne fait plus `.update({ content: "" })` directement dans le composant.
- Test action serveur: auteur autorise.
- Test action serveur: admin autorise.
- Test action serveur: autre membre refuse.
- Test parser media: string, JSON array, URL externe, blob/data.
- Test migration ou assertion source pour `deleted_at`.

Definition de fini:

- Les tests couvrent les regressions principales.
- Les echecs de test existants sont distingues des nouveaux echecs.

### Phase 6 - Nettoyage des orphelins

Priorite: P1  
Effort: M  
Risque: moyen

Taches:

- Auditer les objets `medias/chat/...` sans message actif correspondant.
- Produire une liste avant suppression.
- Demander validation owner avant suppression destructive.
- Supprimer par Storage API uniquement.

Definition de fini:

- Aucun nettoyage destructif n'est lance sans validation explicite.
- Les orphelins connus sont documentes.

## Risques

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Storage delete echoue apres tombstone | Fichier orphelin | Retry/log/job cleanup |
| RLS bloque la suppression Storage admin | Admin ne nettoie pas certains medias | Verifier policy `private.can_current_user_access_chat_media_path(..., 'delete')` |
| Trigger DB bloque `image_url = NULL` | Suppression impossible | Autoriser uniquement la transition tombstone |
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

## Ordre recommande

1. Valider les deux points produit: suppression auteur quand mute, suppression admin globale.
2. Implementer la migration DB.
3. Implementer l'action serveur.
4. Brancher l'UI.
5. Ajouter les tests.
6. Faire un audit separe des medias orphelins historiques.

## Decision en attente

- Un utilisateur mute peut-il supprimer ses propres messages ?
- Veut-on un retry robuste en base des suppressions Storage echouees des maintenant, ou un log + script manuel pour le MVP ?
