# Plan de migration progressive

## Objectif

Preparer une migration progressive vers une architecture ou Supabase devient un detail d'infrastructure remplacable.

L'objectif n'est pas de reecrire immediatement l'application existante. L'objectif est d'introduire des frontieres plus saines, puis de deplacer les responsabilites par etapes.

## Direction generale

La cible d'organisation est:

```text
UI
  -> adaptateurs framework
    -> services client TypeScript purs
      -> API client
        -> API backend
          -> services applicatifs
            -> domaine
              -> ports
                -> adapters infrastructure
```

Supabase peut rester utilise pendant la migration, mais il doit progressivement etre confine derriere des adapters.

## Frontieres recherchees

Le frontend ne doit pas porter la logique metier critique.

Les hooks React ou services Angular doivent rester des adaptateurs de framework. Ils consomment des services client TypeScript purs, reutilisables hors React ou Angular.

Les services client ne doivent pas dependre de Supabase. Ils doivent consommer des contrats API.

L'API backend doit devenir la frontiere stable entre l'interface utilisateur et le coeur applicatif.

Les services applicatifs backend doivent manipuler les concepts metier, pas les details de tables, colonnes ou providers.

Les adapters infrastructure doivent isoler les dependances concretes: Supabase, Postgres, Redis, OAuth, realtime ou tout autre provider.

## Trajectoire

### 1. Observer l'existant

Identifier les flux actuels, les dependances directes a Supabase et les zones ou les regles metier sont dispersees.

Cette etape sert a choisir les premieres frontieres a introduire sans modifier le comportement utilisateur.

### 2. Introduire une API au-dessus de l'existant

Ajouter une couche API qui continue d'utiliser l'infrastructure actuelle.

Le but est de stabiliser les contrats entre le frontend et le backend avant de changer le stockage ou les providers.

### 3. Introduire des services agnostiques

Cote frontend, faire consommer les hooks par des services client TypeScript purs.

Cote backend, faire passer l'API par des services applicatifs qui ne dependent pas directement de Supabase.

### 4. Confiner Supabase dans des adapters

Deplacer progressivement les appels Supabase directs vers des adapters dedies.

Le schema legacy peut rester en place, mais sa forme ne doit pas devenir le modele public de l'application.

### 5. Migrer flux par flux

Choisir un flux limite, le faire passer par la nouvelle frontiere, verifier qu'il garde le meme comportement, puis passer au flux suivant.

L'ordre exact dependra du risque, de la valeur et de l'etat du code au moment de l'implementation.

### 6. Preparer Angular

Construire Angular contre les contrats API stabilises, pas contre Supabase.

Next.js peut rester responsable du site public, des pages SEO, des pages legales ou d'autres surfaces pertinentes.

### 7. Separer le backend quand les contrats sont stables

La separation physique du backend doit venir apres la stabilisation des frontieres logiques.

Elle devient plus simple lorsque l'API, les services, le domaine, les ports et les adapters sont deja separes conceptuellement.

## Authentification

L'authentification doit suivre la meme logique de confinement.

Une solution transitoire peut conserver des dependances existantes si cela reduit le risque de migration.

La cible reste que le client consomme une session applicative ou un contrat d'authentification stable, sans connaitre les details internes du provider.

## Realtime

Le realtime doit etre migre progressivement.

Il peut rester appuye sur l'existant au debut, tant que le couplage est identifie et limite.

La cible est que le client consomme un contrat de realtime stable, independant du provider concret.

## Regles de prudence

- Migrer par petites surfaces.
- Ne pas changer le comportement utilisateur sans raison explicite.
- Ne pas changer le schema ou le provider avant d'avoir stabilise les contrats.
- Eviter que les DTO exposent le schema legacy.
- Garder les dependances framework hors des services TypeScript purs.
- Garder les dependances infrastructure hors du domaine et des services applicatifs.
- Verifier chaque etape avant de passer a la suivante.

## Risques a surveiller

- Supabase qui continue de fuiter dans le frontend.
- Hooks ou composants qui portent trop de logique applicative.
- Services client trop couples a React, Angular ou Next.js.
- API qui reproduit directement le schema legacy au lieu d'exposer un modele applicatif.
- Regles d'autorisation dupliquees entre plusieurs couches.
- Realtime sous-estime lors de la separation.
