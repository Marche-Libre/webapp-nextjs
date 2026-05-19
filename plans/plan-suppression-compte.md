# RFC - Suppression d'un compte

## Statut

Proposé

## Date

19 mai 2026

## Résumé

Mettre en place une suppression de compte qui retire l'accès du membre, désassocie son profil de ses contributions collectives, supprime ou détache ses médias personnels, et conserve les conversations collectives sous un auteur générique `Utilisateur supprimé`.

La décision proposée est : **tombstone DB + suppression Storage via API serveur**.

Le système ne doit pas promettre une anonymisation complète des conversations. Le comportement attendu est une désassociation du profil affiché, avec conservation des contributions textuelles collectives lorsque cela est nécessaire à la continuité des échanges.

## Problème

Le bouton actuel de suppression de compte promet une suppression définitive de toutes les données alors que le code ne fait qu'une déconnexion. Cette promesse est inexacte et risquée.

Le modèle de données actuel expose aussi un risque plus grave : certaines foreign keys vers `public.profiles` peuvent supprimer des conversations par cascade si l'utilisateur Supabase Auth est supprimé directement.

Le besoin réel est double :

1. Donner au membre un chemin clair pour supprimer son compte et ses données de profil.
2. Préserver les conversations collectives internes afin que les échanges restent lisibles pour les autres membres approuvés.

## Objectifs

- Retirer l'accès applicatif du membre supprimé.
- Supprimer ou désassocier les données d'identité et de profil visibles.
- Supprimer les médias personnels associés lorsque c'est techniquement possible et approprié.
- Conserver les contributions textuelles collectives sous `Utilisateur supprimé`.
- Empêcher toute suppression en cascade non maîtrisée des conversations.
- Aligner les CGU, la politique de confidentialité, l'interface, la base et le workflow serveur.
- Journaliser le workflow avec des compteurs exploitables et sans email clair par défaut.

## Non-objectifs

- Ne pas garantir l'anonymisation complète du texte libre.
- Ne pas nettoyer automatiquement toutes les mentions ou toutes les données personnelles contenues dans les messages.
- Ne pas supprimer l'historique collectif des conversations par défaut.
- Ne pas permettre une suppression de compte depuis le client Supabase normal.
- Ne pas activer `deleteUser` tant que la migration anti-cascade n'est pas validée.
- Ne pas résoudre dans ce RFC la politique juridique finale de conservation des sauvegardes, logs et preuves.

## Décision proposée

Utiliser un modèle **tombstone DB + suppression Storage via API serveur**.

La suppression de compte sera un workflow serveur protégé qui :

1. crée une trace de demande de suppression ;
2. supprime ou détache les médias personnels ;
3. réassigne les contributions collectives vers un profil système `Utilisateur supprimé` ;
4. supprime les données périphériques non nécessaires ;
5. désidentifie le profil utilisateur ;
6. supprime l'utilisateur Supabase Auth seulement en fin de workflow ;
7. déconnecte le client et redirige.

Le profil système `Utilisateur supprimé` est un tombstone volontaire, pas un membre réel. Il sert uniquement à préserver la lisibilité des conversations.

## Comportement cible

### Pour le membre

- Le membre voit une zone sensible qui ne promet plus `Toutes vos données seront effacées`.
- Une modale dédiée explique les conséquences.
- Le membre doit confirmer explicitement :

> Je comprends que mes contributions collectives resteront visibles sous "Utilisateur supprimé".

- Après suppression réussie, il est déconnecté et redirigé.
- Son compte ne peut plus accéder aux routes membres.

### Pour les autres membres

- Les anciens messages restent visibles.
- L'auteur affiché devient `Utilisateur supprimé`.
- Aucun handle X n'est affiché.
- Aucun hover card, lien profil, DM, suggestion de mention ou entrée annuaire n'est disponible pour le tombstone.
- Les contenus déjà supprimés individuellement gardent leur tombstone existant, par exemple `Ce message a été supprimé`.

### Pour les demandes ciblées

- Si un message contient encore une donnée personnelle dans le texte libre, le traitement doit passer par une demande ciblée.
- Le produit ne doit pas promettre un nettoyage automatique global du texte libre.

## Alternatives considérées

### 1. Mutation client `content = ''`

Rejetée.

Une mutation client ne couvre pas la suppression de compte, ne supprime pas les médias, dépend de RLS ordinaires, ne garantit pas l'ordre des opérations, et peut casser l'historique sans workflow auditable.

### 2. Hard delete SQL

Rejetée.

Un hard delete de profil ou d'utilisateur peut déclencher des cascades destructrices, supprimer des conversations collectives, et rendre la suppression difficile à auditer ou à corriger.

### 3. Tombstone + Storage API

Retenue pour le MVP.

Cette option conserve les contributions textuelles collectives sous un auteur générique, supprime ou détache les médias via l'API Storage, et garde le workflow dans une couche serveur contrôlée.

### 4. Tombstone + retry table robuste

Option plus robuste, mais plus coûteuse.

Elle ajoute une table de jobs/retry pour reprendre automatiquement les suppressions Storage/Auth incomplètes. Recommandation MVP : commencer avec tombstone + trace d'erreur + reprise manuelle documentée, puis ajouter le retry robuste si le volume ou le risque opérationnel l'exige.

## Détails techniques

### DB

Avant toute suppression Auth, la base doit être protégée contre les cascades.

Changements à prévoir :

- remplacer `profiles.id -> auth.users(id) ON DELETE CASCADE` ;
- ajouter `profiles.deleted_at timestamptz` ;
- ajouter `profiles.deletion_requested_at timestamptz` ;
- ajouter `profiles.is_system boolean default false` ;
- ajouter `profiles.is_deleted_placeholder boolean default false` ;
- créer un profil système unique `Utilisateur supprimé` avec UUID fixe ;
- modifier `messages.author_id`, `forum_posts.author_id`, `forum_replies.author_id` en `ON DELETE SET DEFAULT` ;
- garder les colonnes `author_id` en `NOT NULL` ;
- définir le default des auteurs conversationnels vers le UUID du tombstone ;
- ajouter une table de trace minimale, par exemple `account_deletion_requests`.

La réassignation explicite dans le workflow reste obligatoire. `ON DELETE SET DEFAULT` est un filet de sécurité, pas le mécanisme principal.

### RLS

Les policies doivent distinguer :

- utilisateur actif : profil approuvé, non supprimé, non banni ;
- auteur historique : profil système lisible en lecture minimale ;
- profil supprimé : non listable comme membre réel ;
- tombstone : jamais sponsorisable, bloquable, DM-able, searchable ou ajoutable à des suggestions.

Les policies qui vérifient l'utilisateur courant doivent rester centrées sur `auth.uid()` et son profil actif, pas sur le statut du profil auteur d'un ancien message.

### Trigger

Les triggers existants qui protègent `messages.author_id` peuvent bloquer la réassignation vers le tombstone.

Le RFC recommande un bypass explicitement borné :

- soit une RPC privée `SECURITY DEFINER` ;
- soit un flag de transaction interne utilisé seulement par le workflow serveur ;
- jamais une ouverture large permettant aux clients de modifier `author_id`.

### Server Action ou Route Handler

Le workflow doit être appelé uniquement côté serveur.

Options acceptables :

- Server Action Next.js ;
- Route Handler protégé ;
- RPC SQL privée appelée par une action serveur.

Le client ne doit jamais manipuler directement les tables critiques avec la clé publishable pour supprimer un compte.

### Parser média

Le workflow doit être capable d'identifier les chemins Storage maîtrisés.

Règles :

- traiter les chemins internes de type `chat/<channel_id>/<user_id>/<file>` ;
- ignorer les URL externes non maîtrisées ;
- mettre `messages.image_url = NULL` avant suppression Storage ;
- journaliser les compteurs de médias détachés et supprimés.

### UI

Fichiers concernés :

- `src/components/profile/profile-danger-zone.tsx`
- `src/app/cgu/page.tsx`
- `src/app/confidentialite/page.tsx`
- composants chat/forum affichant `author:profiles(...)`
- annuaire, recherche membre, mentions, DM et parrainage

Le texte de zone sensible cible :

> La suppression retire votre accès et désassocie vos données de profil. Vos messages publiés dans les espaces collectifs peuvent rester visibles sous "Utilisateur supprimé" afin de préserver le contexte des échanges.

## Stratégie d'atomicité

La suppression ne peut pas être parfaitement atomique car elle touche Postgres, Storage et Supabase Auth.

La stratégie retenue est une atomicité applicative par étapes idempotentes :

1. créer une demande de suppression avec statut `processing` ;
2. exécuter les mutations DB critiques dans un ordre sûr ;
3. détacher les médias en DB avant suppression Storage ;
4. supprimer les objets Storage ;
5. réassigner les contributions collectives ;
6. désidentifier le profil ;
7. supprimer Auth en dernier ;
8. marquer la demande `completed` ou `failed`.

En cas d'échec Storage ou Auth :

- ne pas masquer l'échec ;
- garder une trace technique ;
- ne pas promettre une suppression totale immédiate ;
- permettre une reprise manuelle documentée en MVP.

La retry table robuste est différée sauf si le risque opérationnel est jugé trop élevé avant mise en production.

## Décisions à prendre

- Utilisateur mute peut supprimer son compte ou ses propres messages : recommandation oui. Le mute limite la participation, pas l'exercice d'un droit ou la suppression de contenus personnels.
- Admin supprime médias tous auteurs : recommandation oui, uniquement via workflow serveur audité et borné aux besoins de modération/suppression.
- Retry robuste maintenant ou MVP warning : recommandation MVP warning. Le workflow doit être idempotent et tracé ; la table de retry robuste peut venir ensuite.

## Plan d'exécution

### Phase 0 - Préparation

- Nettoyer les artefacts techniques non voulus avant implémentation.
- Relire les guides Next.js locaux pertinents.
- Vérifier la stratégie de clé serveur Supabase.
- Poser le verrou : aucun `deleteUser` tant que l'anti-cascade n'est pas validé.

Critère de passage :

- Aucun changement destructif possible depuis le workflow.

### Phase 1 - Légal et UI non destructive

- Mettre à jour les CGU.
- Mettre à jour la politique de confidentialité.
- Remplacer le wording trompeur de la zone sensible.
- Créer une modale dédiée.
- Garder le workflow réel désactivé tant que la DB n'est pas prête.

Critère de passage :

- L'interface et les textes publics ne promettent plus une suppression totale inexacte.

### Phase 2 - Audit base réelle

- Inventorier toutes les foreign keys vers `public.profiles`.
- Comparer la base réelle aux migrations.
- Valider la matrice de traitement table par table.
- Identifier les triggers qui bloquent la réassignation d'auteur.

Critère de passage :

- Matrice DB validée contre la base réelle.

### Phase 3 - Migration anti-cascade

- Ajouter les colonnes tombstone.
- Créer le profil système.
- Modifier les FKs conversationnelles.
- Supprimer le risque `profiles -> auth.users ON DELETE CASCADE`.
- Ajouter la table de trace.
- Adapter les triggers pour le chemin privilégié.

Critère de passage :

- Supprimer un utilisateur test ne supprime plus ses conversations.

### Phase 4 - RLS et affichage

- Adapter les policies d'accès membre.
- Rendre le tombstone lisible en lecture minimale.
- Exclure tombstone et profils supprimés des surfaces membres.
- Adapter chat/forum/annuaire/recherche/mentions/DM.

Critère de passage :

- Les conversations historiques restent lisibles sans profil membre actif.

### Phase 5 - Workflow serveur

- Implémenter Server Action ou Route Handler.
- Vérifier session et confirmation forte.
- Détacher et supprimer médias.
- Réassigner contributions collectives.
- Supprimer périphériques non nécessaires.
- Désidentifier profil.
- Supprimer Auth en dernier.
- Déconnecter et rediriger.

Critère de passage :

- Workflow rejouable, audité, sans cascade.

### Phase 6 - Validation et activation

- Ajouter les tests unitaires et contrats SQL.
- Tester avec dataset représentatif.
- Vérifier RLS avec utilisateur approuvé, supprimé, admin et visiteur.
- Vérifier Storage.
- Documenter backup et rollback.
- Activer le bouton réel seulement après go/no-go.

Critère de passage :

- Checklist technique et juridique validée.

## Tests et vérification

Tests à ajouter ou mettre à jour :

- le bouton ne promet plus `Toutes vos données seront effacées` ;
- la CGU mentionne les contributions collectives conservées sous auteur générique ;
- la politique de confidentialité distingue profil, conversations, médias, logs et sauvegardes ;
- la migration supprime le risque de cascade destructrice ;
- supprimer un profil de test ne supprime pas ses messages ;
- les messages sont réassociés au profil système ;
- les médias sont supprimés ou détachés ;
- un compte supprimé ne peut plus accéder au chat ;
- les conversations restent visibles ;
- le profil système n'apparaît pas dans l'annuaire, la recherche membre, les DM ou les parrainages ;
- les joins `author:profiles(...)` ne cassent pas si l'auteur est le profil système ou absent.

Vérification recommandée :

1. Tester en base locale.
2. Tester avec messages, médias, forum, réactions, notifications, DM et signalements.
3. Vérifier les policies RLS avec les rôles pertinents.
4. Vérifier Storage après suppression.
5. Prévoir backup et rollback avant production.

## Risques

- Risque juridique : les textes publics doivent être validés avant publication.
- Risque cascade : `deleteUser` peut supprimer des conversations si la FK Auth n'est pas corrigée.
- Risque Storage : suppression non transactionnelle avec Postgres.
- Risque RLS : masquer trop largement `deleted_at` peut casser l'affichage du tombstone.
- Risque UX : une promesse trop absolue dans la modale crée une dette légale.
- Risque opérationnel : sans retry robuste, une suppression partielle doit être reprise manuellement.

## Critères d'acceptation

- L'interface ne promet plus une suppression totale inexacte.
- Les CGU et la politique de confidentialité sont alignées avec le comportement réel.
- Aucune suppression Auth ne peut supprimer les conversations par cascade.
- Les messages et réponses restent visibles sous `Utilisateur supprimé`.
- Les données de profil ne sont plus visibles après suppression.
- Les médias personnels sont supprimés ou détachés quand ils sont maîtrisés techniquement.
- L'utilisateur supprimé ne peut plus accéder à l'application.
- Le workflow est serveur-only, audité et idempotent.
- Les tests couvrent les chemins critiques.
- La procédure de rollback est documentée avant production.

## Points juridiques à valider

- Base légale de conservation des contributions collectives après suppression.
- Formulation exacte de la licence de contenu après suppression.
- Durée de conservation des conversations collectives.
- Durée de conservation des logs et traces de sécurité.
- Traitement des sauvegardes.
- Procédure de demande ciblée.
- Délai et canal de réponse aux demandes RGPD.
- Conservation des signalements et éléments de modération.
