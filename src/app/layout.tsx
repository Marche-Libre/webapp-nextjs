import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-context";
import { AppRuntimeProvider } from "@/components/runtime/app-runtime-provider";
import {
  PREVIEW_IMAGES,
  SITE_DESCRIPTION,
  SITE_METADATA_BASE,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/site-metadata";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase: SITE_METADATA_BASE,
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/icons/apple-touch-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/icons/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-touch-icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: PREVIEW_IMAGES.home.og,
        width: 1200,
        height: 630,
        alt: "MarchéLibre, club privé en bêta privée pour professionnels libéraux",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: PREVIEW_IMAGES.home.twitter,
        alt: "MarchéLibre, club privé en bêta privée pour professionnels libéraux",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
  ],
};

// Inline script to prevent flash of wrong theme
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('ml-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'marchelibre-light' : 'marchelibre');
    document.documentElement.setAttribute('data-mode', t);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} h-full`} suppressHydrationWarning>
      <body className="h-full font-sans antialiased bg-bg-elevated text-text-primary">
        <Script
          id="marchelibre-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <AppRuntimeProvider>
          <ThemeProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </ThemeProvider>
        </AppRuntimeProvider>
      </body>
    </html>
  );
}
