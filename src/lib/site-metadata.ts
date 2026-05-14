import type { Metadata } from "next";

export const SITE_NAME = "MarchéLibre";
export const SITE_TITLE = "MarchéLibre | Club privé en bêta privée";
export const SITE_DESCRIPTION =
  "Un club privé en bêta privée pour professionnels libéraux. Chaque demande d'accès est revue manuellement.";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marchelibre.fr";
const normalizedSiteUrl = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

export const SITE_METADATA_BASE = new URL(normalizedSiteUrl);

type PreviewImages = {
  og: string;
  twitter: string;
};

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  images: PreviewImages;
  imageAlt: string;
};

export const PREVIEW_IMAGES = {
  home: {
    og: "/previews/home-og-1200x630.png",
    twitter: "/previews/home-twitter-card-1200x600.png",
  },
  authAccess: {
    og: "/previews/auth-access-og-1200x630.png",
    twitter: "/previews/auth-access-twitter-card-1200x600.png",
  },
  chat: {
    og: "/previews/chat-og-1200x630.png",
    twitter: "/previews/chat-twitter-card-1200x600.png",
  },
  confidentialite: {
    og: "/previews/confidentialite-og-1200x630.png",
    twitter: "/previews/confidentialite-twitter-card-1200x600.png",
  },
  mentionsLegales: {
    og: "/previews/mentions-legales-og-1200x630.png",
    twitter: "/previews/mentions-legales-twitter-card-1200x600.png",
  },
} satisfies Record<string, PreviewImages>;

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  images,
  imageAlt,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: images.og,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: images.twitter,
          alt: imageAlt,
        },
      ],
    },
  };
}
