# RFC - Navigation vers un message depuis la recherche du canal

## Statut

Propose.

## Date

2026-05-20

## Resume

La recherche de messages fonctionne deja dans un canal de chat. Les resultats sont affiches dans le panneau de recherche, mais ils ne permettent pas encore de revenir au message correspondant dans la chronologie.

Cette RFC propose de rendre chaque resultat de recherche activable. Lorsqu'un utilisateur clique ou active un resultat au clavier, l'application doit charger le contexte du message si necessaire, faire defiler la liste jusqu'au message cible, le mettre temporairement en evidence et conserver les comportements existants du chat.

Decision proposee:

- garder la recherche limitee au canal actif;
- reutiliser le flux existant de saut vers message deja utilise par les messages epingles et les reponses;
- faire transiter l'intention de navigation de `ChatArea` vers `MessageArea` via une petite requete de saut;
- laisser `MessageArea` executer le chargement, le scroll, le focus et le highlight;
- transformer les resultats de recherche en vrais boutons accessibles;
- ne pas modifier la base, les policies Supabase, les routes, les URLs ou la qualite de recherche dans cette iteration.

## Revues appelees

Cette RFC integre trois revues demandees:

- Architecte: cadrage strict chat-only, separation des responsabilites entre recherche et zone de messages, reutilisation de `store.jumpToMessage`.
- UX: comportement attendu, clavier, focus, lecteurs d'ecran, mobile, reduced motion et etats d'erreur.
- Specialiste React frontend: plan d'implementation detaille conforme aux regles React du projet.

## Probleme

Dans `src/components/chat/chat-layout.tsx`, le panneau de recherche:

- conserve `searchOpen`, `searchQuery`, `searchResults` et `searching`;
- interroge `messages` avec `channel_id = activeChannelId`;
- affiche les resultats dans `searchResultItems`;
- rend actuellement les resultats comme des lignes visuelles, sans action de navigation.

Dans `src/components/chat/message-area.tsx`, l'application possede deja le comportement cible pour d'autres entrees:

- `handlePinnedMessageClick` charge et saute au message epingle;
- `handleReplyClick` charge et saute au message cite;
- `scheduleScrollToMessage` attend le rendu puis appelle `scrollToMessageElement`;
- `scrollToMessageElement` utilise l'id DOM `message-${messageId}`, centre le message et applique un highlight temporaire.

Dans `src/components/chat/chat-store.tsx`, `jumpToMessage(channelId, messageId)` sait deja:

- verifier si le message est deja dans la fenetre de messages chargee;
- charger le message cible;
- refuser un message qui n'appartient pas au canal demande;
- charger un contexte avant/apres le message;
- fusionner cette fenetre avec l'etat local du canal.

Le manque est donc une liaison propre entre le resultat de recherche et ce chemin existant.

## Objectifs

- Permettre a un utilisateur de cliquer sur un resultat de recherche pour aller au message.
- Permettre la meme action au clavier avec `Tab` puis `Enter` ou `Space`.
- Charger le message et son contexte si le resultat n'est pas dans la fenetre actuellement rendue.
- Centrer le message cible dans la zone de messages.
- Appliquer le highlight existant sur le message cible.
- Deplacer le focus vers le message cible apres un saut reussi.
- Garder le panneau de recherche accessible aux lecteurs d'ecran.
- Preserver les comportements existants des messages epingles, des reponses et du bouton "Aller au dernier message".
- Limiter l'implementation au MVP: pas de redesign, pas de migration, pas de recherche globale.

## Non-objectifs

- Recherche globale dans tous les canaux.
- Navigation cross-channel avant saut.
- Permalien de message.
- Changement d'URL, query param, hash, historique navigateur ou deep-link.
- Amelioration de la pertinence de recherche.
- Full-text search Postgres.
- Ajout d'index ou migration Supabase.
- Modification RLS ou schema.
- Refonte du panneau de recherche.
- Creation d'un service generique de scroll.
- Changement des composants de message hors besoin direct du focus/highlight.

## Portee

Inclus:

- `src/components/chat/chat-layout.tsx`;
- `src/components/chat/message-area.tsx`;
- eventuellement un test sous `src/__tests__`;
- comportement du panneau de recherche du canal actif;
- accessibilite minimale de la recherche et des resultats.

Exclus:

- `src/components/chat/chat-store.tsx`, sauf si une verification d'implementation revele une lacune non couverte par `jumpToMessage`;
- Supabase migrations;
- types generes Supabase;
- routes Next.js;
- middleware;
- PWA/service worker;
- package dependencies et lockfiles.

## Decision proposee

Faire de la selection d'un resultat de recherche une requete de saut de message.

`ChatArea` reste proprietaire de la recherche:

- ouverture/fermeture du panneau;
- valeur du champ;
- requete Supabase de recherche;
- resultats;
- etats de recherche;
- selection d'un resultat.

`MessageArea` reste proprietaire de la navigation dans la chronologie:

- chargement du message cible via le store;
- rendu de la fenetre de messages;
- scroll;
- highlight;
- focus du message cible;
- coherence avec `isAtBottom`, `showScrollToLatest` et `hasNewLatestMessage`.

Le contrat recommande est une prop optionnelle:

```ts
type MessageJumpRequest = {
  id: number;
  channelId: string;
  messageId: string;
  source: "search";
};
```

`id` est un compteur monotone. Il permet de declencher deux fois le meme saut si l'utilisateur clique deux fois le meme resultat.

`channelId` protege contre les courses lorsque l'utilisateur change de canal pendant une recherche ou un saut.

`messageId` identifie le message cible.

`source` garde le contrat extensible sans introduire une abstraction prematuree.

## Flux cible

1. L'utilisateur ouvre la recherche depuis l'en-tete du canal.
2. Le champ de recherche recoit le focus.
3. L'utilisateur tape une requete.
4. Le panneau affiche un spinner puis les resultats du canal actif.
5. Chaque resultat est rendu comme un `button type="button"`.
6. L'utilisateur clique, tape `Enter` ou tape `Space` sur un resultat.
7. `ChatArea` cree une `MessageJumpRequest` avec `channelId`, `messageId` et un nouvel `id`.
8. `MessageArea` recoit la requete.
9. `MessageArea` ignore la requete si `jumpRequest.channelId !== channelId`.
10. `MessageArea` appelle `store.jumpToMessage(channelId, messageId)`.
11. Si le message est trouve, `MessageArea` met a jour l'etat de bas de page, planifie le scroll, applique le highlight et focus le message.
12. Si le message est introuvable ou inaccessible, l'UI garde le focus dans le panneau et affiche un etat non bloquant.

## Comportement UX

### Activation

- Un resultat est activable a la souris, au tactile et au clavier.
- `Enter` et `Space` sur un resultat declenchent le saut.
- `Enter` depuis le champ de recherche peut activer le premier resultat uniquement lorsque les resultats sont charges.
- Les fleches haut/bas avec roving focus ne sont pas requises pour le MVP.

### Focus

- A l'ouverture du panneau, le champ de recherche recoit le focus.
- A la fermeture du panneau, le focus revient au bouton de recherche dans l'en-tete.
- Apres un saut reussi, le focus se deplace vers le message cible.
- Le wrapper DOM du message cible doit etre focusable programmatiquement, par exemple avec `tabIndex={-1}`.
- En cas de chargement ou d'echec du saut, le focus reste dans le panneau de recherche.

### Lecteurs d'ecran

Ajouter ou utiliser une region live polie pour annoncer:

- `Recherche en cours...`;
- `N resultats trouves`;
- `Aucun resultat`;
- `Message trouve, deplacement vers le message`;
- `Message introuvable ou inaccessible`;
- `Recherche impossible pour le moment`.

Les boutons de resultat doivent avoir un libelle accessible du type:

```txt
Aller au message de @handle du 20 mai 2026
```

Les icones decoratives doivent etre masquees aux technologies d'assistance avec `aria-hidden`.

### Mobile

- Le panneau plein largeur actuel est acceptable.
- Sur mobile, apres un saut reussi, le panneau de recherche doit se fermer pour rendre le message visible.
- Sur desktop, le panneau peut rester ouvert apres un saut reussi.
- Le panneau ne doit pas pieger le focus comme une modale s'il n'est pas implemente comme une modale.

### Reduced motion

- Si `prefers-reduced-motion` est actif, le saut depuis la recherche doit utiliser `behavior: "auto"` au lieu de `behavior: "smooth"`.
- Le highlight doit rester perceptible sans dependre uniquement d'une animation.
- Cette adaptation peut etre centralisee dans un helper local de `MessageArea`, sans refonte des autres flux.

## Etats a gerer

### Requete vide

Ne pas afficher `Aucun resultat` lorsque la requete est vide ou composee seulement d'espaces.

### Recherche en cours

Afficher le spinner existant et annoncer l'etat via la region live.

### Aucun resultat

Afficher `Aucun resultat` seulement lorsque la requete non vide a fini de chercher.

### Erreur de recherche

Afficher:

```txt
Recherche impossible pour le moment. Reessayez.
```

Le flux actuel ignore implicitement les erreurs Supabase. L'implementation doit stocker un etat d'erreur minimal.

### Saut en cours

Desactiver ou marquer comme occupe le resultat active pour eviter les doubles activations involontaires.

### Message introuvable ou inaccessible

Si `jumpToMessage` retourne `false`, ne pas bouger le scroll et afficher:

```txt
Message introuvable ou inaccessible.
```

### Canal change

Au changement de canal actif, effacer:

- la requete;
- les resultats;
- l'etat de recherche;
- l'erreur de recherche;
- l'erreur de saut;
- la requete de saut en attente.

## Architecture et responsabilites

### `ChatArea`

Responsabilites:

- gerer le panneau de recherche;
- executer la recherche Supabase limitee au canal actif;
- rendre les resultats;
- convertir une activation de resultat en `MessageJumpRequest`;
- restaurer le focus au bouton de recherche quand le panneau se ferme;
- afficher les etats du panneau.

Ne doit pas:

- appeler `document.getElementById`;
- connaitre `message-${id}` comme contrat de scroll;
- charger une fenetre de messages;
- appliquer le highlight.

### `MessageArea`

Responsabilites:

- recevoir `jumpRequest`;
- valider que la requete correspond au canal rendu;
- appeler `store.jumpToMessage`;
- planifier le scroll apres rendu;
- appliquer le highlight;
- focus le message cible;
- notifier `ChatArea` que la requete a ete traitee.

Ne doit pas:

- executer la recherche;
- connaitre la requete texte;
- gerer l'ouverture du panneau de recherche.

### `chat-store`

Responsabilites existantes a reutiliser:

- charger les messages du canal;
- charger les messages plus anciens;
- charger le contexte autour d'un message cible avec `jumpToMessage`;
- fusionner les messages sans doublons.

Changement attendu:

- aucun changement prevu.

## Plan d'implementation recommande

### 1. Types et props

Ajouter dans `message-area.tsx`:

```ts
export type MessageJumpRequest = {
  id: number;
  channelId: string;
  messageId: string;
  source: "search";
};
```

Etendre `MessageAreaProps`:

```ts
jumpRequest?: MessageJumpRequest | null;
onJumpRequestHandled?: (requestId: number, found: boolean) => void;
```

### 2. Etat de requete dans `ChatArea`

Ajouter:

```ts
const [searchJumpRequest, setSearchJumpRequest] = useState<MessageJumpRequest | null>(null);
const searchJumpRequestIdRef = useRef(0);
```

Ajouter un handler memoize:

```ts
const handleSearchResultSelect = useCallback((messageId: string) => {
  if (!activeChannelId) return;

  searchJumpRequestIdRef.current += 1;
  setSearchJumpRequest({
    id: searchJumpRequestIdRef.current,
    channelId: activeChannelId,
    messageId,
    source: "search",
  });
}, [activeChannelId]);
```

Ajouter un handler de completion:

```ts
const handleSearchJumpHandled = useCallback((requestId: number, found: boolean) => {
  setSearchJumpRequest((current) => current?.id === requestId ? null : current);
  if (!found) {
    setSearchJumpError("Message introuvable ou inaccessible.");
  }
}, []);
```

Sur mobile, fermer le panneau apres un saut reussi. Sur desktop, le garder ouvert.

### 3. Passage a `MessageArea`

Passer les props:

```tsx
<MessageArea
  ...
  jumpRequest={searchJumpRequest}
  onJumpRequestHandled={handleSearchJumpHandled}
/>
```

### 4. Execution du saut dans `MessageArea`

Ajouter un handler memoize:

```ts
const handleJumpRequest = useCallback(async () => {
  if (!jumpRequest) return;
  if (jumpRequest.channelId !== channelId) return;

  const found = await store.jumpToMessage(channelId, jumpRequest.messageId);
  onJumpRequestHandled?.(jumpRequest.id, found);
  if (!found) return;

  isAtBottom.current = false;
  setShowScrollToLatest(true);
  scheduleScrollToMessage(jumpRequest.messageId);
}, [channelId, jumpRequest, onJumpRequestHandled, scheduleScrollToMessage, store]);
```

Puis:

```ts
useEffect(handleJumpRequest, [handleJumpRequest]);
```

### 5. Resultats accessibles

Extraire un composant local sous `ChatArea`, pas a l'interieur de `ChatArea`:

```tsx
function SearchResultItem({
  result,
  onSelect,
  disabled,
}: {
  result: SearchResult;
  onSelect: (messageId: string) => void;
  disabled?: boolean;
}) {
  const handleClick = useCallback(() => {
    onSelect(result.id);
  }, [onSelect, result.id]);

  return (
    <button type="button" onClick={handleClick} disabled={disabled}>
      ...
    </button>
  );
}
```

`searchResultItems` reste un `useMemo`, mais rend `SearchResultItem`.

Cette approche respecte les regles React du projet:

- pas de handler inline dans JSX;
- pas de composant defini dans un composant;
- pas de `.map()` inline dans JSX;
- handlers nommes et memoizes avec `useCallback`;
- transformations de collections preparees avant le `return`.

### 6. Focus du message cible

Adapter le wrapper de message:

```tsx
<div
  id={getMessageDomId(msg.id)}
  data-message-id={msg.id}
  tabIndex={-1}
  className="scroll-mt-[96px] rounded-[16px] transition-colors duration-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
>
```

Apres scroll/highlight, appeler `messageElement.focus({ preventScroll: true })`.

### 7. Accessibilite du panneau

Ajouter:

- `aria-label` au bouton de recherche;
- `aria-label` au bouton de fermeture;
- `type="search"` et `name` au champ;
- une region live polie;
- des `aria-label` explicites sur les resultats;
- gestion de `Escape` pour fermer et restaurer le focus.

## Risques et mitigations

### Couplage DOM fragile

Risque:

- `ChatArea` pourrait etre tente d'appeler directement `document.getElementById("message-${id}")`.

Mitigation:

- garder le contrat DOM prive a `MessageArea`.

### Clic repete sur le meme resultat

Risque:

- un `useEffect` base uniquement sur `messageId` peut ignorer le second clic.

Mitigation:

- utiliser un `id` monotone dans `MessageJumpRequest`.

### Changement de canal pendant un saut

Risque:

- un resultat d'un ancien canal pourrait declencher un saut dans le nouveau canal.

Mitigation:

- inclure `channelId` dans la requete et ignorer les mismatches.

### Resultat stale

Risque:

- le message a ete supprime, deplace ou rendu inaccessible apres la recherche.

Mitigation:

- s'appuyer sur `jumpToMessage`; afficher l'etat `Message introuvable ou inaccessible` si `false`.

### Regression pinned/reply

Risque:

- changer le scroll/highlight casse les sauts existants.

Mitigation:

- reutiliser le code existant et tester explicitement pinned/reply apres implementation.

### Motion non respectee

Risque:

- le smooth scroll peut etre inconfortable pour les utilisateurs avec reduced motion.

Mitigation:

- choisir `auto` quand `prefers-reduced-motion` est actif.

## Criteres d'acceptation

- Un clic sur un resultat de recherche charge le message cible si necessaire, scroll jusqu'a lui et le highlight.
- `Tab` permet d'atteindre les resultats; `Enter` et `Space` declenchent le meme saut.
- Le message cible recoit le focus apres un saut reussi.
- Les resultats sont des boutons accessibles, pas des `div` cliquables.
- `Escape` ferme le panneau de recherche et restaure le focus au bouton de recherche.
- Une recherche vide n'affiche pas `Aucun resultat`.
- Les etats loading, aucun resultat, erreur de recherche, saut en cours et message introuvable sont visibles.
- Les etats asynchrones importants sont annonces via une region live polie.
- Sur mobile, un saut reussi ferme le panneau pour laisser voir le message.
- Sur desktop, le panneau peut rester ouvert apres un saut.
- Les utilisateurs avec `prefers-reduced-motion` n'ont pas de smooth scroll force.
- Les sauts existants depuis message epingle et reponse restent fonctionnels.
- Aucun changement de schema Supabase, route, URL, dependance ou service worker n'est introduit.

## Verification recommandee

Automatisee si le cout reste raisonnable:

- test du composant de resultat: l'activation appelle `onSelect(result.id)`;
- test de `MessageArea` avec store mocke: `jumpToMessage` retourne `true`, le saut est execute;
- test de `MessageArea` avec store mocke: `jumpToMessage` retourne `false`, pas de scroll et completion en erreur;
- test du double clic sur le meme `messageId` avec deux ids de requete distincts;
- test de non-regression pinned/reply si les tests existants le permettent.

Manuelle:

- chercher un message deja visible et cliquer le resultat;
- chercher un message plus ancien non visible et cliquer le resultat;
- cliquer deux fois le meme resultat;
- activer un resultat au clavier;
- fermer avec `Escape`;
- verifier mobile largeur et desktop;
- verifier un mode reduced motion si possible;
- verifier que les messages epingles et les reponses scrollent encore correctement.

Commandes de verification probables:

```bash
npm run lint
npm run build
```

## Questions ouvertes

- Sur desktop, faut-il garder le panneau ouvert apres un saut ou le fermer systematiquement? Recommandation: garder ouvert sur desktop, fermer sur mobile.
- Faut-il permettre `Enter` dans le champ de recherche pour activer le premier resultat des maintenant? Recommandation: oui si simple, sinon reporter sans bloquer le clic clavier sur les resultats.
- Faut-il afficher un etat offline dedie dans le panneau de recherche? Recommandation: reutiliser le pattern offline existant si disponible, sinon traiter l'echec Supabase comme une erreur de recherche non bloquante.
