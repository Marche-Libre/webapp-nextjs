import { PREVIEW_IMAGES, createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Demander l'accès",
  description:
    "Demandez l'accès à MarchéLibre, club privé en bêta privée avec admission manuelle via identité X.",
  path: "/rejoindre",
  images: PREVIEW_IMAGES.authAccess,
  imageAlt: "Demande d'accès MarchéLibre",
});

export default function RejoindreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
