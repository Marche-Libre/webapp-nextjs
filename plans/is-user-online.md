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
   - `online` si Supabase Presence indique au moins une session active ;
   - sinon `offline`, avec affichage de `last_seen_at` si disponible.

Ne pas stocker ces champs directement sur `profiles`, car `profiles` a deja un trigger `updated_at`. Un heartbeat de presence sur `profiles` ferait changer `updated_at` en permanence et polluerait la notion de profil modifie.

## Semantique produit

### Online

Un membre est considere "online" si au moins une session active publie sa presence sur le canal de presence autorise.

Le statut online est un signal best-effort :

- fermeture d'onglet, mobile sleep, perte reseau ou PWA en arriere-plan peuvent retarder la mise a jour ;
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

## Visibilite et privacy

Regle recommandee :

- visible uniquement par les membres `approved` ;
- un membre peut voir la presence des autres membres `approved` ;
- pending/rejected/anonymous ne doivent pas pouvoir lire ces donnees ;
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
  last_heartbeat_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Notes :

- `user_id` reference `profiles(id)` pour rester dans le domaine applicatif public/RLS.
- `last_seen_at` represente la derniere activite connue.
- `last_heartbeat_at` permet de diagnostiquer ou deriver un fallback offline.
- Ne pas exposer d'email, IP, device, user agent ou metadata sensible.

### RLS

Activer RLS sur `public.user_presence`.

Politiques attendues :

- un membre authentifie et approuve peut lire les lignes des membres approuves ;
- un utilisateur peut upsert/update uniquement sa propre ligne ;
- un admin peut lire les lignes ;
- aucun acces pour `anon`.

Attention : les policies doivent etre testees avec un utilisateur approved, pending et rejected.

### Realtime Presence

Creer un provider client, probablement sous l'app runtime ou le chat shell, qui :

- recupere l'utilisateur courant deja authentifie ;
- rejoint un channel de presence global des membres, par exemple `presence:members`;
- publie un payload minimal :

```ts
{
  user_id: profile.id,
  online_at: new Date().toISOString()
}
```

Le client derive un `Set<string>` des `user_id` en ligne depuis l'etat Presence.

### Heartbeat persistant

Au demarrage app et ensuite de facon throttlee :

- upsert `user_presence.user_id = auth.uid()`;
- mettre a jour `last_seen_at` et `last_heartbeat_at`;
- intervalle recommande : 60 a 120 secondes, pas moins.

Sur `visibilitychange` :

- quand la page redevient visible, envoyer un heartbeat immediat si le dernier date de plus de 60 secondes ;
- ne pas tenter d'ecrire en boucle quand l'app est cachee.

### Fallback offline

Si Presence n'est pas disponible ou se deconnecte :

- ne pas afficher "online" ;
- afficher `last_seen_at` si disponible ;
- continuer a fonctionner sans bloquer le profil.

## Surfaces UI concernees

### Profil membre detaille

Ajouter :

- bulle online sur l'avatar ou pres du handle ;
- ligne "En ligne" ou "Derniere activite ...".

Surface probable :

- `src/components/membres/member-profile-drawer.tsx`
- eventuellement `src/components/membres/member-profile.tsx` si cette vue reste utilisee.

### Hover card utilisateur

Optionnel post-V1 :

- afficher seulement la bulle online pres de l'avatar ;
- ne pas afficher le timestamp pour garder la carte compacte.

Surface probable :

- `src/components/chat/user-hover-card.tsx`

### Liste membres du chat

Optionnel post-V1, utile si le chat est le centre MVP :

- bulle online sur les avatars ;
- tri par online non recommande en V1 pour eviter de rendre la liste instable.

Surface probable :

- `src/components/chat/member-list.tsx`
- `src/app/(app)/chat/layout.tsx` pour charger les champs persistants necessaires.

## Complexite

Estimation recommandee : **L raisonnable**.

Raisons :

- migration SQL + RLS ;
- provider client Realtime Presence ;
- heartbeat throttle ;
- integration UI dans plusieurs composants ;
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
- **Exactitude** : le statut online est best-effort, surtout mobile/PWA.
- **Multi-onglets** : online doit rester vrai tant qu'au moins une session est active.
- **Realtime authorization** : verifier les reglages Supabase Realtime avant implementation.
- **Tests baseline** : distinguer les echecs existants des regressions de cette feature.

## Plan d'implementation propose

1. Valider les decisions produit ouvertes.
2. Verifier la documentation Supabase Realtime Presence et Realtime Authorization au moment de l'implementation.
3. Ajouter une migration `user_presence` avec RLS.
4. Ajouter les types applicatifs correspondants.
5. Creer un helper de lecture/ecriture presence cote client.
6. Creer un provider client de presence avec cleanup propre.
7. Integrer le statut online au profil membre detaille.
8. Integrer le timestamp `last_seen_at` au profil membre.
9. Ajouter integration optionnelle dans hover card et liste membres.
10. Tester RLS avec users approved/pending/rejected.
11. Tester UI offline, multi-onglets, reload, mobile/PWA si possible.

## Criteres d'acceptation

- Un membre approuve voit une bulle online pour un autre membre actuellement present.
- Le profil membre affiche "Actuellement en ligne" si le membre est online.
- Le profil membre affiche une derniere activite arrondie quand le membre n'est pas online et qu'un timestamp existe.
- Le drawer distingue visuellement et textuellement la disponibilite declaree du statut de presence.
- Le statut de presence n'est jamais utilise comme appel a contacter immediatement le membre.
- Le timestamp de derniere activite ne revele pas une heure exacte en V1.
- Si aucune donnee fiable n'existe, l'UI n'affiche pas d'etat ambigu.
- La presence reste secondaire dans la hierarchie du profil : identite, role/contexte et actions principales restent prioritaires.
- Les utilisateurs pending/rejected/anonymous ne peuvent pas lire la presence des membres.
- Un utilisateur ne peut ecrire que sa propre ligne `user_presence`.
- Le heartbeat ne met pas a jour `profiles.updated_at`.
- La feature continue a fonctionner en mode degrade si Realtime est indisponible.
- Aucun champ sensible supplementaire n'est stocke dans le payload presence.

## Questions ouvertes

- Le libelle final doit-il etre "Actuellement en ligne" ou un libelle plus prudent comme "Actif recemment" ?
- Quelle precision accepte-t-on pour la derniere activite : tranches larges V1, relatif precis, ou timestamp localise ?
- Ou apparait la disponibilite declaree dans le drawer pour garantir qu'elle ne soit pas confondue avec la presence ?
- La presence doit-elle etre visible par tous les membres approuves ou seulement les membres qui partagent un DM/channel ?
- Faut-il un opt-out utilisateur en V1 ?
- Faut-il ajouter une mention produit du type "Visible par les membres approuves" ?
- La bulle online doit-elle apparaitre partout ou seulement dans le profil detaille ?

## Recommendation pour V1

Faire une V1 limitee :

- presence visible uniquement dans le profil membre drawer ;
- timestamp "Derniere activite" arrondi dans le profil membre drawer ;
- disponibilite declaree affichee separement du statut de presence ;
- pas de hover card ni de liste chat en V1 ;
- pas de tri de liste par online ;
- pas d'opt-out ;
- heartbeat throttle a 60 secondes minimum ;
- RLS stricte membres approuves uniquement.

Cette V1 repond au besoin initial tout en limitant la surface produit, UI et securite.
