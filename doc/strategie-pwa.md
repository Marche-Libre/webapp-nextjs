# Strategie PWA installable

## Objectif

Rendre rapidement l'application installable sur mobile et desktop, sans
introduire trop tot une logique de cache qui pourrait casser l'authentification,
les donnees utilisateur ou les mises a jour.

Le premier objectif n'est pas un mode offline complet. Le premier objectif est :

- apparition comme application installable ;
- ouverture en mode standalone ;
- icones correctes sur mobile et desktop ;
- comportement propre sur iOS, Android et navigateurs desktop Chromium ;
- faible risque de regression sur les routes applicatives.

## Decision recommandee

Commencer par une PWA minimale basee sur les conventions natives Next.js App
Router :

1. ajouter `src/app/manifest.ts` ;
2. completer les metadonnees du root layout ;
3. verifier les icones PWA ;
4. reporter le service worker avance a une deuxieme phase.

Ne pas ajouter immediatement `next-pwa`, Workbox ou une strategie de cache
globale. Sur cette application, le risque principal n'est pas de manquer un
cache offline, mais de servir des donnees obsoletes ou de perturber les flows
Supabase, auth, admin, chat et realtime.

## Phase 1 - Installabilite

### Manifest

Ajouter `src/app/manifest.ts` avec les champs minimums :

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarcheLibre",
    short_name: "MarcheLibre",
    description:
      "Club prive pour professionnels liberaux, avec admission manuelle.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080b12",
    theme_color: "#080b12",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
```

Le `start_url` peut rester `/` pour une entree publique, ou pointer vers
`/tableau-de-bord` si l'experience souhaitee est d'ouvrir directement l'espace
applicatif apres installation.

### Layout racine

Dans `src/app/layout.tsx`, garder les icones existantes et ajouter :

- `export const viewport` pour `themeColor`, car `metadata.themeColor` est
  deprecie depuis Next.js 14 ;
- `metadata.appleWebApp` pour ameliorer le comportement iOS ;
- des icones coherentes avec les fichiers disponibles.

Exemple de direction :

```ts
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#080b12",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "MarcheLibre | Club prive en beta",
  description:
    "MarcheLibre est un club prive en beta fermee pour professionnels liberaux, avec identite X et admission manuelle.",
  appleWebApp: {
    capable: true,
    title: "MarcheLibre",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};
```

### Icones

Verifier ou generer au minimum :

- une icone 192x192 ;
- une icone 512x512 ;
- une icone Apple 180x180 ;
- idealement une version maskable avec marge interne suffisante.

Les fichiers peuvent etre exposes depuis `public/` pour le manifest, ou via les
conventions `src/app/icon.png` et `src/app/apple-icon.png` pour les metadonnees
Next.js. Il faut eviter de referencer des tailles qui ne correspondent pas aux
dimensions reelles des images.

## Phase 2 - Service worker minimal

Ajouter un service worker seulement apres validation de l'installabilite.

Objectifs acceptables :

- page offline simple ;
- cache des assets statiques versionnes ;
- fallback de navigation pour les pages publiques seulement ;
- pas de cache agressif sur les donnees utilisateur.

Routes et ressources a eviter de cacher :

- routes d'authentification ;
- dashboard et espace membre ;
- admin ;
- API applicatives ;
- endpoints Supabase ;
- chat, notifications et realtime ;
- pages dont le contenu depend de la session.

Une strategie prudente :

- network-first pour les navigations applicatives ;
- cache-first uniquement pour les assets statiques hashes ;
- offline fallback seulement quand le reseau echoue ;
- invalidation explicite a chaque nouvelle version.

## Phase 3 - Capacites PWA avancees

A considerer plus tard seulement si le produit en a besoin :

- notifications push ;
- background sync ;
- badges ;
- raccourcis d'application dans le manifest ;
- partage natif via Web Share Target ;
- mode offline partiel pour certaines pages publiques.

Ces fonctions doivent etre traitees comme des features produit, pas comme une
simple configuration PWA.

## Verification

Tester au minimum :

- `next build` ;
- presence de `/manifest.webmanifest` ou de la route manifest generee par Next ;
- Lighthouse PWA/installability ;
- installation Chrome desktop ;
- installation Chrome Android ;
- ajout a l'ecran d'accueil iOS ;
- ouverture en mode standalone ;
- redirection correcte apres login ;
- absence de donnees obsoletes apres deconnexion/reconnexion.

## Risques

- Un service worker trop large peut servir une ancienne version de l'application.
- Le cache peut exposer ou conserver des donnees d'une session precedente.
- Les routes Supabase/realtime peuvent mal reagir a une strategie offline.
- Les comportements iOS et Android divergent, surtout autour de l'installation
  et des icones.
- Une PWA installee masque parfois la barre navigateur, donc les erreurs de
  navigation ou de redirection deviennent plus visibles.

## Decision actuelle

Mettre en place d'abord :

```text
manifest Next.js + metadonnees PWA + icones valides
```

Puis ajouter un service worker minimal seulement quand l'installabilite est
validee sur mobile et desktop.
