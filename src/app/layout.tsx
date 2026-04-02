import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-context";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "MarchéLibre | Le réseau des indépendants",
  description:
    "Trouvez des missions, publiez vos services et connectez-vous avec des professionnels libéraux vérifiés.",
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
        <ThemeProvider><FavoritesProvider>{children}</FavoritesProvider></ThemeProvider>
      </body>
    </html>
  );
}
