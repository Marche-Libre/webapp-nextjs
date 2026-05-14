import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Le Marché Libre",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "fr",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#0F1115",
    theme_color: "#0F1115",
    categories: ["business", "productivity", "social"],
    icons: [
      {
        src: "/icons/icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-1024x1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home-mobile-1080x1920.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Accueil MarchéLibre sur mobile",
      },
      {
        src: "/screenshots/home-desktop-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Accueil MarchéLibre sur desktop",
      },
      {
        src: "/screenshots/chat-mobile-1080x1920.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Chat privé MarchéLibre sur mobile",
      },
      {
        src: "/screenshots/chat-desktop-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Chat privé MarchéLibre sur desktop",
      },
      {
        src: "/screenshots/auth-access-mobile-1080x1920.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Demande d'accès MarchéLibre sur mobile",
      },
      {
        src: "/screenshots/auth-access-desktop-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Demande d'accès MarchéLibre sur desktop",
      },
    ],
    shortcuts: [
      {
        name: "Ouvrir le chat",
        short_name: "Chat",
        description: "Accéder au chat privé MarchéLibre",
        url: "/chat",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Demander l'accès",
        short_name: "Accès",
        description: "Lancer une demande d'admission MarchéLibre",
        url: "/?auth=access",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
