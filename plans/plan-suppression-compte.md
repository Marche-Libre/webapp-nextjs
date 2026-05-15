# Plan de suppression de compte

Statut : plan de cadrage avant implémentation  
Date : 14 mai 2026  
Périmètre : CGU, politique de confidentialité, interface profil, Supabase/Postgres, RLS, workflow serveur, affichage chat/forum

## 1. Objectif

Mettre en place une suppression de compte qui :

- supprime ou désassocie les données d'identité et de profil du membre ;
- supprime les médias personnels associés, sauf exception nécessaire ;
- conserve les contributions textuelles publiées dans les espaces collectifs lorsque cela est nécessaire à la continuité des discussions ;
- affiche ces contributions sous un auteur générique, par exemple `Utilisateur supprimé` ;
- empêche toute suppression en cascade non maîtrisée des conversations ;
- aligne les CGU, la politique de confidentialité, l'interface et le modèle de données.

Le point central : ne pas promettre une anonymisation complète des conversations. Le comportement attendu est une désassociation de l'auteur affiché et du profil, avec une procédure de demande ciblée si un contenu textuel contient encore des données personnelles.

## 2. Doctrine produit

Les espaces de chat et de forum sont des espaces collectifs visibles par les membres approuvés de MarchéLibre.

Lorsqu'un membre publie un message dans ces espaces, ce message s'inscrit dans l'historique des échanges de la communauté. En cas de suppression du compte, l'identité du membre et son profil ne doivent plus être affichés, mais ses contributions textuelles collectives peuvent rester visibles afin de préserver la cohérence des conversations.

Règles produit à acter :

- les chats et forums ne sont pas des espaces publics ouverts, mais des espaces collectifs internes aux membres approuvés ;
- les membres doivent éviter de publier des informations personnelles, sensibles ou confidentielles dans les espaces collectifs ;
- la plateforme peut modérer, restreindre ou supprimer des contenus lorsque cela est nécessaire, notamment en cas de demande fondée relative aux données personnelles ;
- à la suppression du compte, les données de profil et d'identité sont supprimées ou désidentifiées ;
- les contributions textuelles collectives restent visibles sous `Utilisateur supprimé`, sauf demande ciblée justifiée ;
- les médias uploadés par l'utilisateur sont supprimés par défaut ;
- les sauvegardes, traces de sécurité, éléments de preuve ou obligations légales peuvent imposer une conservation temporaire limitée.

## 3. Textes légaux et contenus publics

### 3.1 CGU

Fichier concerné : `src/app/cgu/page.tsx`

Sections à modifier :

- `5. Contenus des utilisateurs`
- `10.2 Résiliation par l'utilisateur`

Formulation cible pour les contributions collectives :

> Lorsque vous publiez un message, une réponse ou une contribution dans un espace collectif, cette contribution s'inscrit dans une conversation visible par les membres approuvés. Si vous supprimez votre compte, votre profil et vos informations d'identification ne seront plus affichés, mais vos contributions textuelles collectives pourront rester visibles afin de préserver la cohérence des échanges. Elles seront alors associées à un auteur générique, sauf demande spécifique justifiée portant sur des données personnelles contenues dans ces contributions.

Formulation cible sur la responsabilité des membres :

> Les membres doivent éviter de publier des informations personnelles, sensibles ou confidentielles dans les espaces collectifs. MarchéLibre peut modérer, restreindre ou supprimer des contenus lorsque cela est nécessaire, notamment en cas de demande fondée relative aux données personnelles.

La licence de contenu doit être ajustée. La version actuelle limite l'affichage du contenu à la durée d'inscription, ce qui contredit la conservation des contributions collectives après suppression. Elle doit être reformulée pour couvrir l'affichage des contributions collectives après suppression du compte, uniquement pour les besoins de fonctionnement, de lisibilité et d'historique des espaces collectifs.

### 3.2 Politique de confidentialité

Fichier concerné : `src/app/confidentialite/page.tsx`

Sections à modifier :

- données collectées ;
- finalités ;
- durées de conservation ;
- droits des utilisateurs ;
- contact et demandes ciblées.

La politique doit distinguer explicitement :

- données de profil : nom, handle X, email, téléphone, avatar, bio, localisation, liens, préférences visibles ;
- données d'authentification ;
- conversations collectives ;
- médias ;
- logs et traces de sécurité ;
- sauvegardes ;
- signalements, modération, preuve et litiges.

Formulation cible :

> La suppression du compte entraîne la suppression ou la désactivation des données de profil affichées, la suppression des médias personnels associés lorsque cela est techniquement possible et approprié, et la désassociation des contributions collectives de l'identité du membre. Certaines données peuvent être conservées temporairement lorsque cela est nécessaire pour la sécurité, la preuve, le respect d'obligations légales, la gestion des sauvegardes ou le traitement d'une demande.

Formulations à éviter :

- `Toutes vos données seront supprimées`
- `Vos messages seront anonymisés`
- `Nous supprimons toute trace`
- `Suppression définitive immédiate`
- `Les conversations ne contiennent plus aucune donnée personnelle`

Formulations à privilégier :

- `Votre profil ne sera plus visible`
- `Vos contributions collectives resteront visibles sous "Utilisateur supprimé"`
- `Les médias associés à votre compte seront supprimés sauf contrainte technique, légale ou demande de conservation nécessaire`
- `Les sauvegardes peuvent conserver temporairement des données jusqu'à leur expiration`

## 4. Interface utilisateur

Fichier concerné : `src/components/profile/profile-danger-zone.tsx`

Le bouton actuel promet une suppression définitive de toutes les données alors que le code ne fait qu'une déconnexion. Il faut remplacer ce comportement.

Texte de zone sensible cible :

> La suppression retire votre accès et désassocie vos données de profil. Vos messages publiés dans les espaces collectifs peuvent rester visibles sous "Utilisateur supprimé" afin de préserver le contexte des échanges.

Comportement attendu :

1. Afficher une modale dédiée, pas un simple `confirm()`.
2. Expliquer clairement les conséquences :
   - accès au compte supprimé ;
   - profil retiré ;
   - avatar et médias personnels supprimés ;
   - contributions textuelles collectives conservées sous `Utilisateur supprimé` ;
   - possibilité de demande ciblée si un message contient des données personnelles.
3. Demander une confirmation forte.
4. Appeler un workflow serveur protégé.
5. Déconnecter l'utilisateur et rediriger après traitement.

Texte de confirmation cible :

> Je comprends que mes contributions collectives resteront visibles sous "Utilisateur supprimé".

## 5. Audit base de données avant migration

Avant toute migration, inventorier toutes les foreign keys vers `public.profiles`.

Objectif : remplacer les suppressions implicites par un workflow explicite, ordonné et vérifiable. Les cascades ne doivent être que des filets de sécurité, jamais le mécanisme principal de suppression de compte.

Matrice de traitement à produire :

| Table | Comportement cible |
| --- | --- |
| `messages` | Réassigner `author_id` vers le profil système `Utilisateur supprimé` |
| `forum_posts` | Réassigner `author_id` vers le profil système |
| `forum_replies` | Réassigner `author_id` vers le profil système |
| `message_reactions` | Supprimer explicitement les réactions de l'utilisateur |
| `notifications` | Supprimer les notifications reçues par l'utilisateur ; mettre `actor_id` à `NULL` ou vers le profil système selon le besoin |
| `channel_members` | Supprimer explicitement les appartenances |
| `user_blocks` | Supprimer explicitement les blocages impliquant l'utilisateur |
| `user_reports` | Conserver l'événement si utile pour modération/preuve, mais désidentifier les personnes ou réassigner selon la politique retenue |
| `sponsorship_requests` | Conserver le minimum utile ou désidentifier selon le besoin produit/modération |
| `invitations` | Décider `SET NULL`, profil système ou suppression explicite selon l'utilité |
| `channel_proposals` / votes | Supprimer ou réassigner selon la valeur historique |
| `annonces` / `offres_emploi` | Supprimer explicitement, car ce ne sont pas des conversations collectives MVP |

Cette matrice doit être vérifiée contre la base réelle, pas uniquement contre les fichiers de migration, car la base Supabase connectée peut avoir évolué.

## 6. Migration préparatoire anti-cascade

Cette migration doit être faite avant tout workflow de suppression de compte.

Ordre impératif :

1. Supprimer ou remplacer la foreign key `profiles.id -> auth.users(id) ON DELETE CASCADE`.
2. Ajouter les champs nécessaires à `public.profiles` :
   - `deleted_at timestamptz`
   - `deletion_requested_at timestamptz`
   - `is_system boolean default false`
   - `is_deleted_placeholder boolean default false`
3. Créer un profil système unique `Utilisateur supprimé` avec un UUID fixe.
4. Modifier les foreign keys conversationnelles :
   - `messages.author_id`
   - `forum_posts.author_id`
   - `forum_replies.author_id`
5. Garder `author_id NOT NULL`.
6. Ajouter un `DEFAULT '<deleted-user-uuid>'` sur les colonnes `author_id` concernées.
7. Utiliser `ON DELETE SET DEFAULT` comme filet de sécurité.

La réassignation explicite dans le workflow serveur reste obligatoire. Le `SET DEFAULT` ne doit pas être considéré comme le workflow principal.

Point bloquant actuel : tant que `profiles.id -> auth.users(id) ON DELETE CASCADE` existe, il ne faut pas appeler `deleteUser`, car la suppression Auth peut déclencher la cascade que l'on veut éviter.

## 7. RLS et autorisations

Ne pas appliquer simplement `deleted_at IS NULL` partout, car cela pourrait masquer le profil système utilisé pour afficher les anciens messages.

Règles à appliquer :

- pour l'utilisateur courant, l'accès applicatif reste conditionné à un profil approuvé, non supprimé, non banni ;
- pour les auteurs de messages, le profil système `Utilisateur supprimé` doit rester lisible en lecture minimale ;
- le profil système ne doit jamais être listable comme membre réel ;
- le profil système ne doit jamais pouvoir être utilisé pour se connecter, recevoir des notifications, être recherché, être sponsorisé, être bloqué ou être ajouté à des DM ;
- les requêtes d'affichage doivent supporter soit un auteur placeholder lisible, soit un auteur `null` avec fallback UI.

Les policies qui vérifient l'utilisateur actif doivent rester centrées sur `auth.uid()` et le profil associé à cette session, pas sur le statut du profil auteur d'un ancien message.

## 8. Workflow serveur de suppression

Le workflow doit être implémenté uniquement côté serveur :

- Server Action Next.js ;
- route API protégée ;
- ou RPC SQL privée `SECURITY DEFINER` soigneusement bornée.

Il ne doit pas être exécuté depuis le client Supabase normal.

Ordre du workflow :

1. Vérifier l'utilisateur connecté.
2. Charger son profil et les identifiants utiles : `id`, email, handle X, avatar, chemins médias.
3. Créer une trace minimale de demande de suppression.
4. Lister les objets Storage sous les préfixes du type `chat/<channel_id>/<user_id>/<file>`.
5. Mettre `messages.image_url = NULL` pour les messages dont le média va être supprimé.
6. Supprimer les objets Storage.
7. Réassigner les contributions collectives :
   - `messages.author_id = <deleted-user-uuid>`
   - `forum_posts.author_id = <deleted-user-uuid>`
   - `forum_replies.author_id = <deleted-user-uuid>`
8. Supprimer explicitement les données périphériques :
   - réactions ;
   - notifications ;
   - memberships ;
   - blocks ;
   - données non conversationnelles ;
   - préférences visibles.
9. Désidentifier ou supprimer les données de profil restantes.
10. Supprimer l'utilisateur Supabase Auth avec une clé privilégiée côté serveur.
11. Déconnecter la session côté client et rediriger.

Les opérations sensibles doivent être journalisées avec des compteurs de lignes traitées et les erreurs éventuelles. La trace ne doit pas conserver d'email clair sauf justification explicite.

## 9. Mentions et texte libre

Ne pas promettre de nettoyer automatiquement toutes les mentions ou toutes les données personnelles contenues dans le texte libre.

Politique cible :

- nettoyer uniquement les références maîtrisées techniquement si c'est fiable ;
- ne pas casser l'historique des conversations ;
- journaliser le nombre de remplacements si un nettoyage automatique est effectué ;
- traiter les demandes ciblées au cas par cas.

Exemple : remplacer automatiquement `@ancien_handle` peut être envisagé uniquement si l'on est certain qu'il s'agit d'une mention système de ce membre et pas d'un texte libre ambigu.

## 10. Affichage applicatif

Mettre à jour les composants chat/forum/profil pour gérer l'auteur supprimé.

Comportement d'affichage :

- nom : `Utilisateur supprimé` ;
- aucun handle X ;
- avatar générique ;
- pas de hover card ;
- pas de lien vers une page profil ;
- pas de page membre ;
- pas de résultat dans l'annuaire ;
- pas de suggestion dans les mentions ;
- pas de possibilité de DM.

Sur les contenus déjà supprimés individuellement, conserver le tombstone existant du type `Ce message a été supprimé`.

## 11. Tests et vérification

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
- les joins `author:profiles(...)` ne cassent pas si l'auteur est le profil système ou si l'auteur est absent.

Vérification recommandée :

1. Tester en base locale.
2. Tester avec un jeu de données représentatif : messages, médias, forum, réactions, notifications, DM, signalements.
3. Vérifier les policies RLS avec un utilisateur approuvé, un utilisateur supprimé, un admin et un visiteur non connecté.
4. Vérifier Storage : les objets du compte supprimé ne doivent plus être accessibles.
5. Prévoir sauvegarde et rollback avant toute exécution sur production.

## 12. Ordre d'exécution recommandé

1. Mettre à jour CGU et politique de confidentialité.
2. Corriger le wording de l'interface pour supprimer la promesse trompeuse.
3. Auditer toutes les foreign keys vers `profiles`.
4. Créer la migration préparatoire anti-cascade.
5. Adapter RLS pour les profils supprimés et le profil placeholder.
6. Adapter l'affichage `Utilisateur supprimé`.
7. Implémenter le workflow serveur de suppression.
8. Ajouter les tests DB, RLS, UI et Storage.
9. Vérifier en local/staging avec sauvegarde et rollback.
10. Activer le bouton de suppression réel uniquement après validation de bout en bout.

## 13. Points à valider juridiquement

Ces points ne bloquent pas le cadrage technique, mais doivent être confirmés avant publication finale :

- base légale de conservation des contributions collectives après suppression du compte ;
- formulation exacte de la licence de contenu après suppression ;
- durée de conservation des conversations collectives ;
- durée de conservation des logs et traces de sécurité ;
- traitement des sauvegardes ;
- procédure de demande ciblée ;
- délai et canal de réponse aux demandes RGPD ;
- conservation des signalements et éléments de modération.

## 14. Définition de terminé

Le chantier est terminé lorsque :

- l'interface ne promet plus une suppression totale inexacte ;
- les CGU et la politique de confidentialité sont alignées avec le comportement réel ;
- aucune suppression Auth ne peut supprimer les conversations par cascade ;
- les messages et réponses restent visibles sous `Utilisateur supprimé` ;
- les données de profil ne sont plus visibles après suppression ;
- les médias personnels sont supprimés ou détachés ;
- l'utilisateur supprimé ne peut plus accéder à l'application ;
- les tests couvrent les chemins critiques ;
- la procédure est documentée et exécutable sans intervention manuelle dangereuse.
