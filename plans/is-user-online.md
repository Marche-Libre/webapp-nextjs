# RFC: Presence utilisateur et derniere activite

## Statut

Draft pour discussion produit/technique.

Cette RFC ne valide pas encore l'implementation. Le projet est en phase de stabilisation MVP, donc cette feature doit etre explicitement approuvee avant de devenir une story d'implementation.

## Probleme

Aujourd'hui, les profils affichent deja une disponibilite declarative via `availability_status` (`available`, `busy`, `unavailable`, `unset`). Cette disponibilite ne signifie pas que l'utilisateur est actuellement connecte.

On veut ajouter deux informations distinctes :

- une indication visuelle qu'un membre est actuellement en ligne, sous forme de petite bulle sur le profil/avatar ;
- une information de derniere connexion ou derniere activite sur le profil utilisateur.

## Objectifs

- Montrer aux membres approuves si un autre membre est probablement en ligne.
- Afficher sur le profil membre une date de derniere activite utile et comprehensible.
- Ne pas confondre presence reelle et disponibilite metier declaree.
- Eviter d'exposer cette information aux utilisateurs non approuves, refuses, en attente ou anonymes.
- Eviter une solution qui ecrit trop souvent en base et degrade `profiles.updated_at`.

## Non-objectifs

- Ne pas ajouter de chat typing indicator.
- Ne pas ajouter de statut manuel "invisible".
- Ne pas exposer la presence publiquement hors espace membre.
- Ne pas utiliser `availability_status` comme proxy de presence.
- Ne pas modifier le comportement d'admission, de sponsoring ou d'onboarding.

## Decision recommandee

Implementer une approche hybride :

1. Presence live via Supabase Realtime Presence.
2. Persistance d'un champ `last_seen_at` dans une table dediee, par exemple `public.user_presence`.
3. UI basee sur un statut derive :
   - `online` si Supabase Presence indique au moins une session active publiee sur le canal autorise ;
   - sinon `offline`, avec affichage de `last_seen_at` si disponible.

Ne pas stocker ces champs directement sur `profiles`, car `profiles` a deja un trigger `updated_at`. Un heartbeat de presence sur `profiles` ferait changer `updated_at` en permanence et polluerait la notion de profil modifie.

Decision architecturale apres revue : la presence live est un signal client
non autoritatif. Les policies Realtime peuvent autoriser l'acces au canal,
mais elles ne prouvent pas que le payload publie par le client est vrai. La
presence ne doit donc jamais servir aux permissions, a la moderation, a l'audit
ou a une promesse de disponibilite.

## Semantique produit

### Online

Un membre est considere "online" si au moins une session active publie sa presence sur le canal de presence autorise.

Le statut online est un signal best-effort :

- fermeture d'onglet, mobile sleep, perte reseau ou PWA en arriere-plan peuvent retarder la mise a jour ;
- le payload Realtime Presence est publie par le client et reste non autoritatif ;
- en cas de doute, l'UI ne doit pas promettre une exactitude forte.

Libelle recommande :

- bulle verte sans texte dans les listes compactes ;
- "Actuellement en ligne" dans les profils detailles ;
- fallback "Derniere activite ..." quand offline.

### Last connection

Eviter le terme strict "last connection" si on ne lit pas uniquement l'evenement d'authentification. Le meilleur libelle produit est :

- "Derniere activite" si le timestamp vient du heartbeat/app runtime ;
- "Derniere connexion" uniquement si le timestamp vient explicitement de l'auth sign-in.

Recommendation : utiliser "Derniere activite", affichee avec une precision arrondie en V1 pour eviter une impression de surveillance.

Exemples :

- "Actuellement en ligne"
- "Derniere activite recemment"
- "Derniere activite aujourd'hui"
- "Derniere activite cette semaine"
- "Derniere activite il y a plus d'une semaine"

### UX recommandee pour V1

La presence doit etre presentee comme un signal contextuel, pas comme une promesse de disponibilite.

Dans le profil membre drawer :

- afficher la bulle verte uniquement a cote de l'avatar ou du nom ;
- afficher le libelle "Actuellement en ligne" dans la zone de metadonnees du profil ;
- afficher la disponibilite declaree separement, avec un libelle explicite du type "Disponibilite declaree : Disponible / Occupe / Indisponible" ;
- ne jamais remplacer la disponibilite declaree par le statut de presence.

Quand le membre n'est pas en ligne :

- afficher "Derniere activite recemment" si l'activite date de moins d'une heure ;
- afficher "Derniere activite aujourd'hui" pour une activite le jour meme ;
- afficher "Derniere activite cette semaine" jusqu'a 7 jours ;
- afficher "Derniere activite il y a plus d'une semaine" au-dela ;
- ne rien afficher si aucune donnee fiable n'existe ;
- eviter l'heure exacte en V1, sauf decision produit explicite.

La hover card et la liste membres du chat restent hors V1. Elles pourront etre ajoutees apres retour utilisateur si la presence est comprise comme utile et non intrusive.

### Accessibilite

Si la bulle verte est accompagnee d'un libelle texte visible, elle doit etre
decorative pour les technologies d'assistance. Si elle est affichee seule dans
une surface post-V1, elle doit avoir un libelle accessible explicite, par
exemple "Membre actuellement en ligne".

## Visibilite et privacy

Regle recommandee :

- visible uniquement par les membres `approved` ;
- un membre peut voir la presence des autres membres `approved` ;
- pending/rejected/anonymous ne doivent pas pouvoir lire ces donnees ;
- pending/rejected/anonymous ne doivent pas pouvoir ecrire leur propre presence ;
- les admins peuvent lire pour moderation/support.

Question ouverte : ajouter un opt-out "Masquer ma presence" ?

Pour une premiere version, ne pas ajouter l'opt-out sauf decision produit explicite, afin d'eviter d'elargir le scope UI/settings. En revanche, garder la table et les helpers compatibles avec un futur champ `presence_visible`.

## Design technique propose

### Schema

Nouvelle table :

```sql
create table public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now()
);
```

Notes :

- `user_id` reference `profiles(id)` pour rester dans le domaine applicatif public/RLS.
- `last_seen_at` represente la derniere activite connue.
- `last_heartbeat_at` permet de diagnostiquer ou deriver un fallback offline.
- ne pas ajouter `updated_at` en V1 : il dupliquerait `last_heartbeat_at` sans semantique distincte.
- Ne pas exposer d'email, IP, device, user agent ou metadata sensible.

### RLS

Activer RLS sur `public.user_presence`.

Politiques attendues :

- un membre authentifie et approuve peut lire les lignes des membres approuves ;
- un membre authentifie et approuve peut insert/upsert/update uniquement sa propre ligne ;
- pending/rejected ne peuvent ni lire ni ecrire, meme si les guards UI les bloquent deja ;
- un admin peut lire les lignes ;
- aucun acces pour `anon`.

Attention : les policies doivent etre testees avec un utilisateur approved, pending et rejected.

### Realtime Presence

Creer un provider client dedie, positionne dans `src/components/layout/app-shell.tsx`
comme parent de `MemberProfileDrawerProvider`, avec `currentUserId={profile.id}`.

Ne pas le placer :

- dans `AppRuntimeProvider`, car ce provider racine couvre aussi les routes anonymes/auth ;
- uniquement dans le chat shell, car le drawer membre peut exister hors `/chat`.

Ce placement profite du guard serveur de `src/app/(app)/layout.tsx`, qui ne rend
`AppShell` qu'apres authentification, statut `approved` et onboarding termine.

Le provider :

- recupere l'utilisateur courant deja authentifie ;
- rejoint un channel de presence prive global des membres, par exemple `presence:members`;
- s'abonne avec une configuration Realtime privee, par exemple `config: { private: true }` ;
- publie un payload minimal :

```ts
{
  user_id: profile.id,
  online_at: new Date().toISOString()
}
```

Le client derive un `Set<string>` des `user_id` en ligne depuis l'etat Presence.

Le context expose par le provider doit limiter les rerenders larges : les mises
a jour de presence ne doivent pas forcer tout `AppShell` ou tout le chat a se
rerendre a chaque sync. Les composants doivent consommer la presence uniquement
sur les surfaces qui l'affichent.

### Realtime Authorization

RLS sur `public.user_presence` ne protege pas le canal Realtime Presence. La
V1 doit aussi definir l'autorisation Realtime :

- utiliser un canal prive `presence:members` ;
- verifier les reglages Supabase Realtime, notamment l'acces public aux canaux ;
- ajouter des policies sur `realtime.messages` pour autoriser les membres
  `approved` et admins uniquement ;
- contraindre les policies au type Presence, par exemple `extension = 'presence'` ;
- contraindre le topic, par exemple `realtime.topic() = 'presence:members'` ;
- refuser `anon`, pending et rejected.

Cette autorisation controle qui peut rejoindre/ecouter/publier sur le canal.
Elle ne rend pas le payload Presence fiable : le payload reste client-authored.

### Heartbeat persistant

Au demarrage app et ensuite de facon throttlee :

- upsert `user_presence.user_id = auth.uid()`;
- mettre a jour `last_seen_at` et `last_heartbeat_at`;
- intervalle recommande : 60 a 120 secondes, pas moins.

Sur `visibilitychange` :

- quand la page redevient visible, envoyer un heartbeat immediat si le dernier date de plus de 60 secondes ;
- ne pas tenter d'ecrire en boucle quand l'app est cachee.

Lifecycle obligatoire du provider :

- `clearInterval` au demontage ;
- suppression du listener `visibilitychange` ;
- `channel.untrack()` avant retrait du canal ;
- `supabase.removeChannel(channel)` au cleanup ;
- comportement degrade silencieux en cas de timeout de subscribe, perte Realtime,
  reconnect, expiration JWT ou refresh de session.

Strategie multi-onglets a decider avant story :

- accepter un heartbeat par onglet visible, avec throttle 60 secondes minimum ;
- ou ajouter un mecanisme de tab leader pour reduire les writes.

### Fallback offline

Si Presence n'est pas disponible ou se deconnecte :

- ne pas afficher "online" ;
- afficher `last_seen_at` si disponible ;
- continuer a fonctionner sans bloquer le profil.

Le fallback ne doit pas retrograder l'auth, bloquer le drawer ou declencher des
retries agressifs. L'echec Realtime doit rester invisible hors absence de bulle
online.

## Surfaces UI concernees

### Profil membre detaille

Ajouter :

- bulle online sur l'avatar ou pres du handle ;
- ligne "En ligne" ou "Derniere activite ...".

Surface V1 :

- `src/components/membres/member-profile-drawer.tsx`

Contraintes V1 :

- lire `user_presence.last_seen_at` au moment de l'ouverture du drawer ;
- ne pas ajouter `last_seen_at` a `profiles` ni a `profiles_public` ;
- ne pas charger `last_seen_at` dans `src/app/(app)/chat/layout.tsx` en V1 ;
- proteger le load du drawer avec un request id ou un guard d'annulation, afin
  qu'une reponse lente du membre A ne puisse pas ecraser l'etat du membre B ;
- coordonner les lectures profile/categories/sponsor/presence pour le meme `memberId`.

Surface post-V1 eventuelle :

- `src/components/membres/member-profile.tsx` si cette vue reste utilisee.

### Hover card utilisateur

Hors V1. Optionnel post-V1 :

- afficher seulement la bulle online pres de l'avatar ;
- ne pas afficher le timestamp pour garder la carte compacte.

Surface probable :

- `src/components/chat/user-hover-card.tsx`

### Liste membres du chat

Hors V1. Optionnel post-V1, utile si le chat est le centre MVP :

- bulle online sur les avatars ;
- tri par online non recommande en V1 pour eviter de rendre la liste instable.

Surface probable :

- `src/components/chat/member-list.tsx`
- `src/app/(app)/chat/layout.tsx` pour charger les champs persistants necessaires.

Si cette surface est ajoutee plus tard, charger les donnees persistantes par lot
et eviter les requetes par ligne ou par hover. Ne pas trier par online en V1 ou
post-V1 initial, afin d'eviter une liste instable.

## Complexite

Estimation recommandee : **L raisonnable**.

Raisons :

- migration SQL + RLS ;
- provider client Realtime Presence ;
- policies Supabase Realtime sur `realtime.messages` ;
- heartbeat throttle ;
- integration UI dans le drawer ;
- tests de policies et tests UI/logic ;
- gestion des cas reseau/mobile/multi-onglets.

Version reduite sans Presence live, avec uniquement `last_seen_at` : **S/M**, mais elle ne satisfait pas vraiment la bulle online.

Version Presence live sans persistance : **M**, mais elle ne satisfait pas le timestamp de derniere activite.

## Effets de bord et risques

- **Confusion produit** : `availability_status` existe deja et ne doit pas etre remplace par online.
- **Privacy** : la presence et la derniere activite sont des donnees comportementales. Limiter la precision et la visibilite.
- **Charge DB** : un heartbeat trop frequent peut augmenter les writes. Throttle obligatoire.
- **Pollution de profil** : ne pas mettre a jour `profiles.updated_at`.
- **RLS** : une mauvaise policy pourrait exposer la presence de membres a des utilisateurs non approuves.
- **Realtime authorization** : `public.user_presence` RLS ne protege pas le canal Presence ; il faut des policies `realtime.messages`.
- **Payload non fiable** : Presence est client-authored. Un payload malicieux ne doit jamais devenir une source d'autorisation.
- **Exactitude** : le statut online est best-effort, surtout mobile/PWA.
- **Multi-onglets** : online doit rester vrai tant qu'au moins une session est active.
- **Rerenders** : une presence globale peut provoquer trop de rerenders si le context est consomme trop haut ou trop largement.
- **Tests baseline** : distinguer les echecs existants des regressions de cette feature.

## Plan d'implementation propose

1. Valider les decisions produit/architecture ouvertes, y compris l'approbation explicite malgre le freeze MVP.
2. Verifier la documentation Supabase Realtime Presence et Realtime Authorization au moment de l'implementation.
3. Verifier les reglages Supabase Realtime du projet, notamment l'acces public aux canaux.
4. Ajouter une migration `user_presence` sans `updated_at`, avec RLS stricte approved/admin.
5. Ajouter les policies `realtime.messages` pour le canal prive `presence:members`.
6. Ajouter les types applicatifs correspondants.
7. Creer un helper de lecture/ecriture presence cote client :
   - heartbeat/upsert uniquement pour l'utilisateur courant approuve ;
   - lecture `last_seen_at` uniquement a l'ouverture du drawer en V1.
8. Creer un `PresenceProvider` client dans `AppShell`, parent de `MemberProfileDrawerProvider`, avec context stable et cleanup complet.
9. Ajouter un guard request id/cancellation dans le chargement du drawer.
10. Integrer le statut online au profil membre drawer via un composant separe de `AvailabilityBadge`/`Avatar.availability`.
11. Integrer le timestamp `last_seen_at` arrondi au profil membre drawer.
12. Tester RLS table avec users approved/pending/rejected/anonymous.
13. Tester Realtime Authorization avec users approved/pending/rejected/anonymous.
14. Tester UI offline, Realtime indisponible, multi-onglets, reload, mobile/PWA si possible.

## Criteres d'acceptation

- Un membre approuve voit une bulle online pour un autre membre actuellement present.
- Le profil membre affiche "Actuellement en ligne" si le membre est online.
- Le profil membre affiche une derniere activite arrondie quand le membre n'est pas online et qu'un timestamp existe.
- Le drawer distingue visuellement et textuellement la disponibilite declaree du statut de presence.
- Le statut de presence n'est jamais utilise comme appel a contacter immediatement le membre.
- Le statut de presence n'est jamais utilise pour permissions, moderation, audit ou logique metier critique.
- Le timestamp de derniere activite ne revele pas une heure exacte en V1.
- Si aucune donnee fiable n'existe, l'UI n'affiche pas d'etat ambigu.
- La presence reste secondaire dans la hierarchie du profil : identite, role/contexte et actions principales restent prioritaires.
- Les utilisateurs pending/rejected/anonymous ne peuvent pas lire la presence des membres.
- Les utilisateurs pending/rejected/anonymous ne peuvent pas ecrire de presence.
- Un membre approuve ne peut ecrire que sa propre ligne `user_presence`.
- Le canal Realtime Presence est prive et protege par des policies `realtime.messages`.
- Le payload Presence ne contient pas d'email, IP, device, user agent ou metadata sensible.
- Le heartbeat ne met pas a jour `profiles.updated_at`.
- `public.user_presence` ne contient pas de colonne `updated_at` en V1.
- `last_seen_at` n'est pas ajoute a `profiles` ni a `profiles_public`.
- `src/app/(app)/chat/layout.tsx`, la hover card et la liste membres ne sont pas modifies en V1.
- Le drawer ignore les reponses stale quand l'utilisateur ouvre rapidement plusieurs profils.
- Le provider nettoie interval, listener `visibilitychange`, track Presence et channel Supabase au demontage.
- Les mises a jour de presence ne provoquent pas de rerender large de tout `AppShell` ou du chat.
- La feature continue a fonctionner en mode degrade si Realtime est indisponible.
- La bulle online est decorative si un libelle texte est present, ou possede un libelle accessible si elle est affichee seule.

## Questions ouvertes

- Le product owner approuve-t-il cette feature malgre le freeze MVP ?
- Le libelle final doit-il etre "Actuellement en ligne" ou un libelle plus prudent comme "Actif recemment" ?
- Quelle precision accepte-t-on pour la derniere activite : tranches larges V1, relatif precis, ou timestamp localise ?
- Ou apparait la disponibilite declaree dans le drawer pour garantir qu'elle ne soit pas confondue avec la presence ?
- La presence doit-elle etre visible par tous les membres approuves ou seulement les membres qui partagent un DM/channel ?
- Faut-il un opt-out utilisateur en V1 ?
- Faut-il ajouter une mention produit du type "Visible par les membres approuves" ?
- La bulle online doit-elle apparaitre partout ou seulement dans le profil detaille ?
- Accepte-t-on explicitement que la presence live soit client-authored et non autoritative ?
- Pour les multi-onglets, accepte-t-on un heartbeat par onglet visible ou faut-il un tab leader ?

## Recommendation pour V1

Faire une V1 limitee :

- presence visible uniquement dans le profil membre drawer ;
- timestamp "Derniere activite" arrondi dans le profil membre drawer ;
- disponibilite declaree affichee separement du statut de presence ;
- provider `PresenceProvider` place dans `AppShell`, parent de `MemberProfileDrawerProvider` ;
- canal Realtime prive `presence:members` avec policies `realtime.messages` ;
- presence live acceptee uniquement comme signal UI non autoritatif ;
- lecture `last_seen_at` uniquement a l'ouverture du drawer ;
- pas de colonne `updated_at` dans `public.user_presence` en V1 ;
- pas de hover card ni de liste chat en V1 ;
- pas de changement dans `src/app/(app)/chat/layout.tsx` en V1 ;
- pas de tri de liste par online ;
- pas d'opt-out ;
- heartbeat throttle a 60 secondes minimum ;
- RLS stricte membres approuves uniquement, avec pending/rejected sans lecture ni ecriture.

Cette V1 repond au besoin initial tout en limitant la surface produit, UI et securite.
