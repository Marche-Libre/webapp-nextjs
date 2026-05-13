# US3 - Canaux et messages - Plan d'execution

## Objectif

Livrer l'interface de conversations comme surface principale de participation membre, avec une liste de canaux de lancement, des permissions claires, des interactions message testables, et une recherche globale sur le perimetre retenu.

## Scope cible

Canaux de lancement :

- General
- Business
- Politique
- Divers
- Jobs

Regles produit :

- Les membres approuves peuvent lire les canaux autorises.
- Les membres approuves peuvent poster partout sauf dans Jobs.
- Jobs est lisible par les membres approuves, mais en ecriture admin only.
- La creation et la gestion de canaux sont reservees aux admins.
- Chaque membre peut editer et supprimer ses propres messages.
- Les mentions sont conservees.
- Un seul message peut etre epingle par canal, admin only.
- La recherche globale retrouve les messages dans les canaux retenus.
- La preview de lien simple est conservee.
- Reply reste hors scope tant qu'il n'est pas explicitement confirme dans le scope final.

## Etat verifie

Faits confirmes :

- Le schema possede deja `read_permission` et `write_permission` sur `channels`.
- Les politiques RLS de messages utilisent deja `write_permission` pour autoriser ou refuser l'ecriture.
- Le pin admin-only existe deja partiellement via `messages.is_pinned`.
- Une contrainte d'unicite existe pour limiter a un message epingle par canal.
- Les mentions existent dans le composer.
- La preview de lien existe et l'endpoint est protege pour les utilisateurs approuves.
- Les tests cibles chat/link-preview/notifications passent avec Vitest.

Ecarts confirmes :

- Les canaux cibles ne sont pas encore seedes : `politique`, `divers`, `jobs` manquent.
- Les anciens canaux `recrutement`, `aide`, `random` existent encore.
- `jobs.write_permission = 'admin_only'` n'est pas encore configure.
- Le type frontend `Channel` n'expose pas encore `read_permission` et `write_permission`.
- Le composer ne masque/desactive pas encore l'ecriture selon la permission du canal.
- La recherche globale ne filtre pas explicitement sur les canaux de lancement.
- Les liens de notifications de mention utilisent encore `/chat?channel=<id>`.
- La migration de replies existe mais est vide; reply n'est pas implemente.

## Plan priorise

### P0 - Taxonomie de lancement

Objectif : garantir que les bons canaux existent et que Jobs a la bonne permission.

Taches :

- Ajouter une migration idempotente qui upsert les canaux `general`, `business`, `politique`, `divers`, `jobs`.
- Configurer `read_permission = 'all'` pour les 5 canaux.
- Configurer `write_permission = 'admin_only'` pour `jobs`.
- Configurer `write_permission = 'all'` pour `general`, `business`, `politique`, `divers`.
- Ne pas supprimer les anciens canaux dans cette passe.
- Decider si les anciens canaux doivent etre masques, renommes, ou laisses comme legacy non promu.

Critere de sortie :

- Les 5 canaux de lancement sont presents de facon reproductible.
- Jobs est lisible par les membres approuves et writable seulement par les admins.

### P0 - Permissions d'ecriture dans l'UI

Objectif : eviter que l'UI propose une action interdite.

Taches :

- Ajouter `read_permission` et `write_permission` au type `Channel`.
- Propager la permission du canal actif jusqu'au composer.
- Desactiver le composer si l'utilisateur ne peut pas ecrire.
- Afficher un message clair dans Jobs pour les non-admins : `Seuls les admins peuvent publier dans Jobs.`
- Garder la RLS comme garde finale, meme si l'UI bloque deja.

Critere de sortie :

- Un membre non-admin ne voit pas de composer actif dans Jobs.
- Un admin peut poster dans Jobs.
- Un membre approuve peut poster dans les autres canaux.

### P0 - Tests de securite et de regression

Objectif : rendre les permissions testables.

Taches :

- Ajouter un test statique sur la migration de taxonomie.
- Ajouter un test qui verifie `jobs` avec `write_permission = 'admin_only'`.
- Ajouter un test UI/source qui verifie l'etat no-permission du composer.
- Garder les tests existants sur RLS message, pin admin-only, mentions et preview lien.

Critere de sortie :

- Les tests cibles US3 passent avec `bunx vitest run`.
- Les fichiers chat touches passent `npm run lint -- <fichiers>`.

### P1 - Creation et gestion admin des canaux

Objectif : respecter "seuls les admins peuvent creer un canal" sans ouvrir de mutation client directe.

Taches :

- Ajouter une action serveur admin pour creer ou modifier un canal.
- Verifier `is_admin`, `status = approved`, `onboarding_completed = true`.
- Permettre nom, slug, description, permission lecture, permission ecriture.
- Refuser les mutations non-admin.
- Ajouter une UI admin minimale si necessaire pour beta operation.

Critere de sortie :

- Un admin peut creer/configurer un canal sans edition DB directe.
- Un non-admin ne peut pas creer/configurer un canal via UI, action, API ou RLS.

### P1 - Interactions message retenues

Objectif : documenter et tester les interactions conservees.

Interactions retenues :

- Envoyer un message.
- Editer son propre message.
- Supprimer son propre message via tombstone.
- Mentionner un membre par `@handle`.
- Recevoir une notification de mention apres insert reussi.
- Epingler/desepingler un message, admin only.
- Avoir un seul message epingle par canal.
- Afficher une preview simple pour le premier lien HTTP(S).

Taches :

- Corriger les liens de mentions vers une route canonique quand le slug est disponible.
- Tester que les mentions ne partent pas si l'insert message echoue.
- Tester edit/delete own message.
- Tester qu'un membre ne peut pas modifier `channel_id`, `author_id`, `image_url`, ou `is_pinned`.
- Tester pin admin-only et unicite du pin par canal.
- Garder les protections SSRF de preview lien.

Critere de sortie :

- Les interactions retenues sont explicites dans les tests.
- Aucune interaction non retenue n'est impliquee comme terminee.

### P1 - Recherche globale sur le perimetre retenu

Objectif : retrouver un message dans les canaux retenus.

Taches :

- Definir la liste canonique des slugs recherches : `general`, `business`, `politique`, `divers`, `jobs`.
- Filtrer la recherche globale messages sur ces canaux.
- Afficher contenu, auteur, canal, date.
- Lier le resultat vers `/chat/<slug>`.
- Si le jump message existe de facon fiable, ajouter un deep-link message; sinon garder le lien canal pour la premiere passe.

Critere de sortie :

- Un message present dans un canal retenu est retrouvable.
- Les messages de canaux legacy/parques ne sont pas promus dans la recherche globale US3.

### P2 - Reply

Decision par defaut : hors scope.

Raison :

- La migration de reply est vide.
- Aucun modele `reply_to_message_id` n'est implemente cote chat.
- Ajouter reply maintenant implique schema, RLS, UI, rendu contexte, notifications potentielles et tests.

Option si confirme dans le scope final :

- Ajouter `reply_to_message_id` nullable sur `messages`.
- Restreindre la reference au meme canal.
- Afficher un contexte compact du message parent.
- Permettre "repondre" depuis une action message.
- Tester envoi, lecture, suppression parent, et acces RLS.

## Verification a conserver

Commandes utiles :

```bash
bunx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/link-preview.test.ts src/__tests__/notifications.test.ts
npm run lint -- src/components/chat/message-input.tsx src/components/chat/message-bubble.tsx src/__tests__/authorization-hardening.test.ts
./node_modules/.bin/tsc --noEmit --incremental false
git diff --check
```

Etat de verification observe avant implementation US3 :

- Tests cibles chat/link-preview/notifications : 30/30 passent.
- Vitest global : 86/89 passent; 3 echecs hors US3 sur les labels de disponibilite profil.
- Lint global : echoue sur des erreurs baseline larges.
- Lint cible chat : passe.
- Typecheck : echoue sur un mock `Profile` incomplet dans `profile-utils.test.ts`.

## Ordre d'execution recommande

1. Migration taxonomie canaux + Jobs admin-only.
2. Types `Channel` + composer no-permission.
3. Tests cibles permissions.
4. Recherche globale filtree.
5. Correction liens de mention.
6. Admin channel management minimal.
7. Decision finale reply.
