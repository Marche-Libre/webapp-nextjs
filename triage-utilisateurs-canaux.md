# RFC - Triage des utilisateurs par canal

## Statut

Prêt pour implémentation.

Ce document est autonome : il contient les décisions produit, les décisions
techniques, le plan d'implémentation, les états UI, les critères d'acceptation
et les cas de test attendus.

Le changement est indépendant du parrainage, de l'onboarding, de l'admission et
des permissions de canaux.

## Problème

La liste des utilisateurs du chat affiche actuellement tous les membres approuvés
dans tous les canaux. Quand on change de canal, la liste reste donc identique,
même si ces membres n'ont jamais participé au canal actif.

Le besoin est de rendre cette liste contextuelle au canal actif.

## Objectif

Dans un canal donné, afficher uniquement les profils approuvés qui ont écrit au
moins un message dans ce canal.

La liste doit être organisée par présence :

1. utilisateurs connectés ;
2. utilisateurs non connectés ou présence inconnue.

Les connectés apparaissent toujours au-dessus des non connectés quand le signal
de présence est disponible.

## Décisions produit

- La source fonctionnelle est la participation réelle : un utilisateur est
  participant d'un canal s'il est auteur d'au moins un message dans ce canal.
- La règle s'applique aux canaux publics, aux canaux privés et aux DMs.
- Un DM sans message affiche donc un état vide dans la liste des participants.
- Pour les canaux publics, ne jamais utiliser `channel_members` comme source
  principale : le besoin est "ceux qui ont écrit dans le canal", pas "ceux qui
  ont accès au canal".
- Pour les DMs, `channel_members` reste seulement utile au fonctionnement
  existant des salons DM, pas à la liste des participants affichée.
- Afficher uniquement les profils encore `status = 'approved'`.
- Un ancien auteur dont le profil n'est plus approuvé n'apparaît pas dans la
  liste, même s'il a écrit dans le canal.
- Un message supprimé mais conservé en base sous forme de tombstone compte
  encore comme participation tant que `messages.author_id` existe.
- Un message supprimé physiquement ne compte plus comme participation.
- Un message sans `author_id` valide doit être ignoré.
- La présence est un signal UI non autoritatif. Elle ne sert jamais aux
  permissions, à la modération, à l'audit ou à une décision métier critique.
- Si la présence live échoue ou n'est pas encore disponible, la liste reste
  utilisable et les participants sont classés comme non connectés/inconnus.

## Non-objectifs

- Ne pas créer un annuaire global.
- Ne pas modifier l'admission par parrainage.
- Ne pas modifier le rappel d'onboarding.
- Ne pas créer de nouveaux DMs.
- Ne pas changer les droits de lecture ou d'écriture des canaux.
- Ne pas modifier la disponibilité déclarée des membres.
- Ne pas exposer la présence hors espace membre.
- Ne pas utiliser la présence comme source d'autorisation.

## Contexte technique existant

Aujourd'hui, `src/app/(app)/chat/layout.tsx` charge `members` depuis `profiles`
avec `status = 'approved'`, sans filtre par canal, puis passe cette liste à
`ChatLayout`.

`src/components/chat/member-list.tsx` affiche simplement cette liste globale.

Le canal actif est résolu côté client dans `src/components/chat/chat-layout.tsx`
via `ChatChannelProvider` et `useActiveChannel`.

Le store de chat, dans `src/components/chat/chat-store.tsx`, charge seulement
une fenêtre de messages par canal, souvent les 50 derniers. Il ne doit donc pas
être utilisé comme source complète initiale des participants, car un auteur qui
a écrit plus anciennement pourrait manquer.

La présence utilisateur existe déjà :

- RFC : `plans/is-user-online.md` ;
- provider : `src/components/presence/presence-provider.tsx` ;
- helpers : `src/lib/presence.ts` ;
- table : `public.user_presence`.

Ce RFC étend volontairement l'usage de la présence à la liste de participants du
chat. La présence reste un signal visuel contextuel, pas une vérité métier.

## Source de données retenue

La source de vérité est :

- `public.messages.author_id` ;
- filtré par `public.messages.channel_id = activeChannelId` ;
- joint avec `public.profiles` ;
- filtré sur `profiles.status = 'approved'`.

Les données retournées pour chaque participant sont :

- `id` ;
- `x_handle` ;
- `full_name` ;
- `avatar_url` ;
- `last_message_at`.

Le statut connecté/non connecté est ajouté côté client depuis le provider de
présence. Il ne doit pas venir de la requête SQL principale.

`x_handle` peut être vide ou nul dans certaines données historiques. L'UI doit
donc utiliser un fallback d'affichage :

1. `@${x_handle}` si `x_handle` est non vide ;
2. `full_name` si `full_name` est non vide ;
3. `Membre` en dernier recours.

Le tri de secours doit utiliser la même logique normalisée :

1. `x_handle` normalisé ;
2. `full_name` normalisé ;
3. `id`.

## Décision technique Supabase

Créer une RPC SQL `public.get_channel_participants(p_channel_id uuid)` en
`SECURITY INVOKER`.

Raisons :

- éviter de charger tous les messages côté client ;
- éviter une double requête client `messages -> profiles` ;
- dédupliquer les auteurs côté Postgres ;
- récupérer `last_message_at` proprement ;
- respecter les RLS existantes sur `messages` et `profiles` ;
- ne pas introduire de service role côté client ;
- ne pas modifier les permissions de canaux.

Ne pas utiliser `SECURITY DEFINER` pour cette RPC.

Migration attendue :

```sql
create or replace function public.get_channel_participants(p_channel_id uuid)
returns table (
  id uuid,
  x_handle text,
  full_name text,
  avatar_url text,
  last_message_at timestamptz
)
language sql
security invoker
stable
set search_path = public, pg_temp
as $$
  select
    p.id,
    p.x_handle,
    p.full_name,
    p.avatar_url,
    max(m.created_at) as last_message_at
  from public.messages m
  join public.profiles p on p.id = m.author_id
  where m.channel_id = p_channel_id
    and p.status = 'approved'
  group by p.id, p.x_handle, p.full_name, p.avatar_url
  order by
    max(m.created_at) desc,
    lower(coalesce(nullif(p.x_handle, ''), nullif(p.full_name, ''), p.id::text)) asc;
$$;

create index if not exists idx_messages_channel_author_created
  on public.messages (channel_id, author_id, created_at desc);

revoke all on function public.get_channel_participants(uuid) from public;
grant execute on function public.get_channel_participants(uuid) to authenticated;
```

Notes :

- L'index existant `idx_messages_channel_created(channel_id, created_at desc)`
  aide pour charger les messages récents, mais pas idéalement pour grouper par
  auteur.
- Le nouvel index accélère le filtrage par canal, le groupement par auteur et
  le calcul de `max(created_at)`.
- La RPC doit retourner une liste vide si le canal est vide ou inaccessible par
  les RLS.
- La RPC doit être exécutable par les utilisateurs `authenticated` uniquement.
  Elle ne doit pas être exécutable par `anon` ou `public`.

## Intégration frontend attendue

### Suppression de la source globale

Dans `src/app/(app)/chat/layout.tsx` :

- supprimer la requête globale qui charge tous les `profiles` approuvés pour
  `members` ;
- ne plus passer `members` à `ChatLayout`.

### Branchement au canal actif

Dans `src/components/chat/chat-layout.tsx` :

- conserver le calcul existant de `allChannels` ;
- extraire un composant enfant `ChatLayoutInner` sous `ChatChannelProvider` pour
  pouvoir utiliser `useActiveChannel` dans la zone qui rend la liste membres ;
- résoudre `activeChannelId` depuis `activeSlug` et `allChannels` ;
- remplacer l'affichage global :

```tsx
<MemberList members={members} />
```

par une liste dépendante du canal actif, par exemple :

```tsx
<ChannelParticipantList channelId={activeChannelId} />
```

### Nouveau composant recommandé

Créer `src/components/chat/channel-participant-list.tsx`.

Responsabilités :

- recevoir `channelId: string | null` ;
- si `channelId` est `null`, ne pas appeler Supabase, ne pas appeler
  `useChannelState`, et rendre un état neutre ;
- appeler `supabase.rpc("get_channel_participants", { p_channel_id: channelId })`
  quand `channelId` non nul change ;
- exposer les états `loading`, `error`, `empty` et `participants` ;
- ignorer les réponses réseau obsolètes lors des changements rapides de canal ;
- ne jamais afficher la liste du canal précédent comme si elle appartenait au
  nouveau canal ;
- rafraîchir la liste quand un premier message d'un nouvel auteur arrive dans le
  canal actif ;
- rendre `MemberList`.

Protection contre les réponses obsolètes :

- utiliser un `requestIdRef`, ou un flag `cancelled` dans l'effet de chargement ;
- au retour de la RPC, vérifier que la réponse correspond encore au dernier
  `channelId` demandé.

Structure recommandée pour éviter les hooks avec `channelId = null` :

- `ChannelParticipantList` reçoit `channelId: string | null` ;
- si `channelId` est nul, il rend `MemberList` en état vide/idle ;
- sinon il rend `ChannelParticipantListForChannel channelId={channelId}` ;
- seul `ChannelParticipantListForChannel` appelle `useChannelState(channelId)` et
  la RPC.

### MemberList

Adapter `src/components/chat/member-list.tsx` pour qu'il devienne un composant
de rendu de participants de canal.

Props recommandées :

```ts
type ChannelParticipant = {
  id: string;
  x_handle: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_message_at: string | null;
};

type MemberListProps = {
  members: ChannelParticipant[];
  onlineMemberIds: ReadonlySet<string>;
  presenceAvailable: boolean;
  loading?: boolean;
  error?: boolean;
};
```

États UI attendus :

- chargement : garder le panneau visible avec un état discret ;
- erreur : afficher `Participants indisponibles pour le moment.` ;
- vide : afficher `Aucun participant pour le moment.` ;
- présence indisponible : afficher la liste sans bloquer, en classant les
  participants comme non connectés/inconnus.
- affichage d'un membre : utiliser `@x_handle` si disponible, sinon `full_name`,
  sinon `Membre`.

## Groupement et tri

Le groupement connecté/non connecté se fait côté client.

Le groupement par présence fait partie de cette implémentation. Il est P1.

Pour éviter d'appeler un hook par membre dans une boucle parent, étendre
`src/components/presence/presence-provider.tsx` avec une API groupable unique :

```ts
type PresenceSnapshot = {
  onlineMemberIds: ReadonlySet<string>;
  available: boolean;
};

function usePresenceSnapshot(): PresenceSnapshot;
```

Contrat :

- `onlineMemberIds` contient les `user_id` actuellement annoncés en ligne par
  Supabase Realtime Presence ;
- `available` vaut `false` avant abonnement réussi ou après une erreur de canal
  Realtime ;
- `available` vaut `true` après abonnement réussi, même si
  `onlineMemberIds.size === 0` ;
- le hook doit utiliser `useSyncExternalStore` comme `useIsMemberOnline` pour
  éviter des rerenders larges ;
- `useIsMemberOnline(memberId)` peut rester disponible pour les surfaces
  existantes.

Règles de rendu :

- si `available = true`, afficher les groupes `Connectés` puis
  `Autres participants` ;
- si `available = false`, afficher tous les participants dans un seul groupe
  neutre `Participants` ;
- ne jamais masquer un participant parce que la présence est indisponible.

Tri attendu :

1. participants connectés ;
2. participants non connectés ou présence inconnue ;
3. dans chaque groupe : `last_message_at desc` ;
4. en cas d'égalité ou d'absence de date : clé normalisée
   `x_handle || full_name || id`.

Libellés recommandés :

- `Connectés` ;
- `Autres participants`.

Si un seul groupe est affiché parce que la présence est indisponible, le libellé
peut rester neutre : `Participants`.

## Rafraîchissement après nouveau message

Le chargement initial des participants ne doit pas dépendre de la fenêtre de
messages déjà chargée.

En revanche, le rafraîchissement peut utiliser le store de chat existant :

- `src/components/chat/chat-store.tsx` reçoit déjà les nouveaux messages via
  Realtime `INSERT` sur `messages` par `channel_id` ;
- `ChannelParticipantList` peut utiliser `useChannelState(channelId)` pour
  observer les messages du canal actif ;
- conserver un curseur local des messages déjà traités pour ce `channelId`, par
  exemple un `Set<string>` de `message.id` ou un `lastSeenCreatedAt` compatible
  avec le tri du store ;
- à chaque changement de `messages`, examiner tous les messages non encore
  traités, pas seulement le dernier message ;
- si au moins un message non traité a un `author_id` absent de la liste des
  participants courante, relancer une seule fois la RPC
  `get_channel_participants` ;
- marquer les messages observés comme traités après la décision de refresh ;
- si tous les auteurs des nouveaux messages sont déjà présents, ne rien faire ;
- si le message appartient à un autre canal, ne pas modifier la liste active.

En cas d'échec Realtime, la liste reste correcte au changement de canal ou au
rechargement de page. Aucun polling supplémentaire n'est requis pour cette
version.

## Règles React à respecter

- Ne pas définir de méthode inline dans le JSX.
- Les handlers passés au JSX doivent être nommés et mémorisés avec
  `useCallback`, sauf fonction module-level.
- Ne pas définir de composant dans un autre composant.
- Ne pas appeler `.map()`, `.filter()`, `.reduce()`, `.sort()` ou équivalent
  inline dans le JSX.
- Préparer les variables dérivées avant le `return`.
- Utiliser `useMemo` pour les groupes triés et les listes d'items rendus.
- Hoister les constantes statiques hors composant.
- Garder les classnames inline autant que possible, comme dans le code existant.
- Organiser les composants dans l'ordre projet : state, hooks/data, variables
  dérivées, méthodes/handlers, effets, return.

## Découpage d'implémentation

### Tâche 1 - Migration data

Priorité : P1.

- Ajouter la RPC `public.get_channel_participants(p_channel_id uuid)`.
- Ajouter l'index `idx_messages_channel_author_created`.
- Vérifier que la fonction est `SECURITY INVOKER`.
- Ne pas changer les policies RLS existantes.

### Tâche 2 - Retirer la liste globale

Priorité : P1.

- Supprimer le chargement global `profiles.status = approved` dans
  `src/app/(app)/chat/layout.tsx`.
- Retirer la prop `members` de `ChatLayout`.

### Tâche 3 - Charger les participants du canal actif

Priorité : P1.

- Créer `ChannelParticipantList`.
- Charger les participants via la RPC au changement de `activeChannelId`.
- Gérer `loading`, `error`, `empty`.
- Protéger contre les réponses obsolètes lors des changements rapides de canal.

### Tâche 4 - Afficher et grouper par présence

Priorité : P1.

- Étendre le provider de présence avec `usePresenceSnapshot()`.
- Grouper connectés au-dessus des non connectés.
- Garder la liste visible dans un groupe neutre si la présence échoue.

### Tâche 5 - Rafraîchir après premier message

Priorité : P1.

- Observer les nouveaux messages du canal actif via le store existant.
- Relancer la RPC si un nouvel auteur absent apparaît.
- Ne pas créer de nouvelle source de vérité à partir des 50 derniers messages.

### Tâche 6 - Tests et garde-fous

Priorité : P1.

- Ajouter ou adapter les tests frontend/source.
- Adapter le test existant de présence qui gardait la liste chat hors V1, car ce
  RFC change explicitement cette décision.
- Ajouter des tests SQL/RLS si l'environnement Supabase local le permet.

## Critères d'acceptation

- Changer de canal change la liste des utilisateurs affichée.
- Un membre qui n'a jamais écrit dans le canal actif n'apparaît pas dans cette
  liste.
- Un profil non approuvé n'apparaît pas, même s'il a écrit dans le canal.
- Les membres connectés apparaissent au-dessus des non connectés quand la
  présence est disponible.
- La liste reste visible et utilisable si la présence live échoue.
- Un canal sans message affiche `Aucun participant pour le moment.`.
- Un DM sans message affiche le même état vide.
- Un nouveau premier message dans le canal actif fait apparaître son auteur sans
  rechargement global de page.
- Un nouveau message d'un auteur déjà présent ne crée pas de doublon.
- Les changements rapides de canal ne permettent pas à une réponse réseau
  ancienne d'écraser la liste du canal actif.
- Aucun changement de permissions de canal n'est introduit.
- Aucun nouveau DM n'est créé.
- `channel_members` n'est pas utilisé comme source principale des participants
  affichés.

## Cas de test recommandés

### Data / RLS

- Un membre approuvé voit les participants d'un canal public où des messages
  existent.
- Un canal public vide retourne une liste vide.
- Un auteur ayant écrit dans le canal mais dont le profil est `pending`,
  `rejected` ou non approuvé n'est pas retourné.
- Un membre d'un DM voit uniquement les auteurs ayant écrit dans ce DM.
- Un utilisateur non membre d'un DM ne voit pas les participants de ce DM.
- La RPC respecte les RLS existantes et ne contourne pas les permissions.

### Frontend

- `src/app/(app)/chat/layout.tsx` ne charge plus tous les profils approuvés pour
  alimenter `MemberList`.
- Le changement de `activeChannelId` déclenche une nouvelle lecture participants.
- Une réponse réseau tardive d'un ancien canal est ignorée.
- `MemberList` affiche l'état vide.
- `MemberList` affiche l'état d'erreur sans bloquer le chat.
- Les participants connectés apparaissent avant les autres.
- L'absence de présence ne masque aucun participant.
- Un nouveau message d'un nouvel auteur déclenche un refresh et ajoute l'auteur.
- Un nouveau message d'un auteur déjà affiché ne duplique pas l'entrée.
- Un participant sans `x_handle` non vide utilise le fallback d'affichage prévu.
- `ChannelParticipantList` ne lance aucune requête et n'appelle pas
  `useChannelState` quand `channelId` est nul.

### Régressions à surveiller

- Le chat reste utilisable si la RPC échoue.
- Le panneau de recherche de messages n'est pas modifié.
- Le chargement des messages du canal n'est pas modifié.
- Les DMs existants continuent d'apparaître dans la liste des salons.
- Les permissions de lecture/écriture des canaux ne changent pas.

## Vérification attendue

Commandes recommandées après implémentation :

```bash
bun run check
bun test
```

Si l'environnement Supabase local est disponible :

```bash
supabase test db
```

La vérification doit distinguer les échecs préexistants des régressions causées
par cette implémentation.
