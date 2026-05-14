import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-context";
import { AppRuntimeProvider } from "@/components/runtime/app-runtime-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "MarchéLibre | Club privé en bêta",
  description:
    "MarchéLibre est un club privé en bêta fermée pour professionnels libéraux, avec identité X et admission manuelle.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full font-sans antialiased bg-bg-elevated text-text-primary">
        <AppRuntimeProvider>
          <ThemeProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </ThemeProvider>
        </AppRuntimeProvider>
      </body>
    </html>
  );
}
