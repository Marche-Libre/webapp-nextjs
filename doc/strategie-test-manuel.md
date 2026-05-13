# Strategie de test manuel

## Objectif

Pouvoir essayer a la main les fonctionnalites critiques de l'application sans
dependre de comptes X/Twitter reels, sans polluer la production, et sans devoir
changer constamment d'utilisateur dans le navigateur.

Le test manuel doit permettre de verifier concretement :

- la creation de fausses demandes d'admission ;
- leur apparition dans l'administration ;
- l'approbation et le rejet depuis l'admin ;
- les etats utilisateur apres approbation ou rejet ;
- les messages temps reel du chat ;
- les notifications temps reel ;
- les principaux cas de parrainage.

## Principe directeur

Ne pas utiliser la production comme terrain de test.

Les tests manuels doivent tourner sur un environnement de recette ou local, avec
un jeu de donnees controle. X/Twitter OAuth doit etre teste comme une integration
externe ponctuelle, mais il ne doit pas bloquer les tests quotidiens des flows
metier.

## Besoins concrets

### 1. Environnement de recette

Mettre en place un Supabase separe de la production :

- meme schema que la production ;
- memes migrations ;
- memes variables publiques adaptees a la recette ;
- donnees jetables ;
- possibilite de reset rapide.

La base Supabase connectee au projet est consideree comme production-impacting.
Les seeds, tests de statut, faux messages et fausses notifications doivent donc
viser un environnement dedie.

### 2. Comptes de test

Prevoir des comptes/personas fixes :

- `admin@dev.local` : admin, approuve, onboarding termine ;
- `pending@dev.local` : utilisateur en attente ;
- `rejected@dev.local` : utilisateur refuse ;
- `member1@dev.local` : membre approuve pour tester chat et notifications ;
- `member2@dev.local` : deuxieme membre approuve pour tester le temps reel ;
- `sponsor@dev.local` : parrain approuve.

Chaque profil doit avoir des donnees realistes :

- `x_handle` ;
- `full_name` ;
- `avatar_url` facultatif ;
- `status` ;
- `is_admin` ;
- `onboarding_completed` ;
- champs de parrainage si necessaire.

### 3. Authentification sans X/Twitter

En recette et en local seulement, utiliser une authentification de test :

- email/password ;
- magic link ;
- ou sessions generees pour les personas.

Les profils seedes doivent simuler l'etat apres callback X/Twitter. Cela permet
de tester l'admission, l'admin, le chat et les notifications sans creer plusieurs
comptes X/Twitter reels.

X/Twitter OAuth reste a tester separement avec un petit nombre de vrais comptes,
uniquement pour valider l'integration OAuth elle-meme.

### 4. Script de seed/reset

Ajouter une commande de recette du type :

```bash
bun run seed:test-users
```

Le script doit pouvoir :

- creer les utilisateurs Supabase Auth de test ;
- creer ou mettre a jour les lignes `profiles` ;
- creer des `sponsorship_requests` ;
- creer des channels et messages de reference ;
- creer des notifications de reference ;
- remettre les fixtures dans un etat connu.

Le script doit etre idempotent : relance plusieurs fois, il remet l'environnement
dans le meme etat au lieu d'empiler des doublons.

### 5. Panneau de test manuel

Ajouter, plus tard, une route cachee active uniquement en local/recette, par
exemple :

```text
/dev/test-lab
```

Fonctions utiles :

- creer une fausse demande d'admission ;
- creer une demande avec parrain ;
- approuver un utilisateur ;
- rejeter un utilisateur ;
- envoyer un message en tant que `member1` ;
- envoyer un message en tant que `member2` ;
- creer une notification pour un utilisateur ;
- reset les fixtures.

Cette route doit etre impossible a activer en production.

### 6. Harnais WebSocket/realtime

Pour tester le temps reel sans changer d'utilisateur, prevoir une page de test
qui affiche deux sessions cote a cote :

- panneau gauche : `member1` ;
- panneau droit : `member2`.

Chaque panneau doit utiliser une session Supabase differente. Cela permet de
tester :

- un message envoye par `member1` apparait chez `member2` sans refresh ;
- un message envoye par `member2` apparait chez `member1` sans refresh ;
- une notification creee pour `member1` apparait en realtime ;
- une notification creee pour `member2` apparait en realtime ;
- les compteurs non lus se mettent a jour.

## Scenarios de recette prioritaires

### P0 - Admission et admin

1. Reset les fixtures.
2. Se connecter avec `admin@dev.local`.
3. Ouvrir `/admin/users`.
4. Verifier que `pending@dev.local` apparait dans la section en attente.
5. Approuver `pending@dev.local`.
6. Verifier que son statut devient `approved`.
7. Reset les fixtures.
8. Rejeter `pending@dev.local`.
9. Verifier que son statut devient `rejected`.
10. Se connecter comme utilisateur rejete et verifier l'etat refuse sur
    `/en-attente`.

### P0 - Chat realtime

1. Ouvrir le harnais realtime.
2. Envoyer un message depuis `member1`.
3. Verifier son apparition dans le panneau `member2` sans refresh.
4. Envoyer un message depuis `member2`.
5. Verifier son apparition dans le panneau `member1` sans refresh.
6. Modifier ou supprimer un message si le flow existe, puis verifier la
   propagation.

### P0 - Notifications realtime

1. Ouvrir une session `member1`.
2. Creer une notification pour `member1` depuis le test-lab.
3. Verifier que le toast ou compteur apparait sans refresh.
4. Marquer la notification comme lue.
5. Verifier que le compteur non lu diminue.

### P1 - Parrainage

1. Reset les fixtures.
2. Creer une demande de parrainage depuis `pending@dev.local` vers
   `sponsor@dev.local`.
3. Se connecter comme `sponsor@dev.local`.
4. Verifier que la demande apparait dans `/parrainages`.
5. Approuver ou rejeter la demande.
6. Verifier que l'admin voit le nouvel etat.

### P1 - Onboarding apres approbation

1. Approuver un utilisateur pending sans onboarding termine.
2. Se connecter comme cet utilisateur.
3. Verifier la redirection vers `/onboarding`.
4. Terminer l'onboarding.
5. Verifier la redirection vers l'espace applicatif cible.

## Priorites de mise en place

### P0

- environnement Supabase de recette ;
- fixtures utilisateurs ;
- seed/reset idempotent ;
- login sans X/Twitter ;
- checklist admission/admin ;
- checklist chat realtime.

### P1

- test-lab cache ;
- harnais realtime deux sessions ;
- fixtures parrainage ;
- fixtures notifications.

### P2

- verification semi-automatisee des scenarios manuels ;
- journal de recette avant mise en production ;
- captures/logs realtime pour diagnostiquer les problemes intermittents.

## Points d'attention

- Ne jamais exposer de service role key cote client.
- Ne jamais activer le test-lab en production.
- Ne pas ecrire de fixtures dans la production.
- Garder les donnees de test reconnaissables avec un prefixe clair, par exemple
  `dev_` ou `test_`.
- Le realtime depend de la publication Supabase. Aujourd'hui les tables critiques
  a verifier sont au minimum `messages` et `notifications`.
- Les tests X/Twitter doivent rester separes des tests fonctionnels courants.

