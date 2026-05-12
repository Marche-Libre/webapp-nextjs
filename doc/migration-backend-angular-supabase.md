# Migration progressive vers backend + Angular

## Objectif

Le but n'est pas de réécrire immédiatement l'application existante, mais de préparer une migration progressive vers une architecture où Supabase devient un détail d'infrastructure remplaçable.

Architecture cible :

```text
Next.js landing/site public
Angular app
        |
        v
Backend applicatif
        |
        v
Adapters infrastructure
  - Supabase Auth aujourd'hui
  - Supabase Postgres aujourd'hui
  - Supabase Realtime aujourd'hui
  - autre provider demain
```

L'application Angular ne doit pas dépendre directement du SDK Supabase si l'objectif est de pouvoir sortir Supabase plus tard. Elle doit consommer uniquement le backend : API HTTP et, si nécessaire, WebSocket ou SSE.

## Principe directeur

Le backend doit posséder les concepts métier. Supabase ne doit pas structurer le modèle public de l'application.

Concepts à exposer côté backend :

- `User`
- `Session`
- `AdmissionStatus`
- `Member`
- `Channel`
- `Message`
- `Reaction`
- `AdminDecision`

Adapters internes possibles :

- `AuthProvider` : Supabase Auth aujourd'hui, autre système demain.
- `UserRepository` : table `profiles` aujourd'hui, autre stockage demain.
- `ChatRepository` : tables `channels`, `messages`, `message_reactions` aujourd'hui.
- `RealtimeGateway` : Supabase Realtime aujourd'hui, WebSocket maison demain.

## Stratégie recommandée

1. Définir le contrat backend avant de construire l'application Angular.
2. Implémenter le backend au-dessus de Supabase sans changer la base dans un premier temps.
3. Faire pointer une petite surface Next.js existante vers le backend pour valider le contrat.
4. Construire l'application Angular contre ce backend.
5. Garder Next.js pour le site public, la landing page, le SEO, les pages légales et éventuellement l'entrée d'authentification.
6. Remplacer Supabase progressivement, adapter par adapter, seulement après stabilisation.

## Frontières à respecter

Angular ne devrait pas connaître :

- les noms de tables Supabase ;
- les colonnes Supabase ;
- les politiques RLS ;
- les channels Supabase Realtime ;
- les tokens ou détails de session propres à Supabase, si le backend peut les encapsuler.

Le backend peut continuer à utiliser Supabase temporairement, mais cette dépendance doit rester confinée dans des modules d'infrastructure.

## Authentification

Deux niveaux sont possibles.

Option rapide :

- Angular utilise encore Supabase Auth pour obtenir une session ou un JWT.
- Le backend valide ce JWT.
- C'est plus rapide, mais le client reste couplé à Supabase.

Option plus propre pour sortir Supabase :

- Le backend possède la session applicative.
- Supabase Auth est seulement un provider OAuth interne temporaire.
- Le backend émet son propre cookie de session ou token applicatif.
- Angular ne connaît que la session backend.

Si l'objectif de sortie de Supabase est sérieux, l'option session backend est préférable, même si elle coûte quelques jours de plus.

## Realtime

Trois niveaux sont possibles.

Option minimale :

- Angular utilise Supabase Realtime directement.
- C'est rapide, mais le couplage Supabase reste visible côté client.

Option intermédiaire recommandée :

- Angular se connecte au backend via WebSocket ou SSE.
- Le backend utilise Supabase Realtime en interne.
- Le contrat client est déjà indépendant de Supabase.

Option finale :

- Le backend gère lui-même le realtime avec Postgres, Redis, une file d'événements ou un service WebSocket dédié.
- Cette option doit attendre d'avoir une vraie raison opérationnelle.

## Estimation

Si le périmètre reste serré autour du chat, de l'admission et de l'admin minimal :

- Backend API autour de Supabase : 6 à 12 jours.
- Auth, session et admission guards : 4 à 8 jours.
- Chat API messages, salons, réactions, membres : 4 à 8 jours.
- Realtime backend minimal : 4 à 10 jours.
- Application Angular chat MVP : 7 à 15 jours.
- Next.js landing séparée/propre : 2 à 5 jours.
- Tests, déploiement, CORS, variables d'environnement, documentation : 3 à 7 jours.

Ordre de grandeur :

- Version minimale : 12 à 20 jours-homme.
- Version propre et remplaçable : 25 à 45 jours-homme.

Le coût réel n'est pas de migrer quelques requêtes SQL. Le coût est d'empêcher Supabase de fuiter dans le client, les contrats d'API et le modèle métier.

## Risques principaux

- Couplage client à Supabase si Angular utilise directement le SDK Supabase.
- Duplication des règles d'autorisation entre backend et RLS.
- Ambiguïtés entre session Supabase et session applicative.
- Realtime sous-estimé : reconnexion, ordre des messages, événements manqués, permissions par salon.
- Migration future plus chère si les DTO backend exposent les colonnes Supabase au lieu de concepts métier.

## Décision actuelle

La trajectoire préférée est :

```text
Angular -> backend applicatif -> adapters Supabase
```

Supabase peut rester en production dans un premier temps, mais il doit être caché derrière le backend dès que l'application Angular commence à être développée.
