import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarchéLibre",
    short_name: "MarchéLibre",
    description: "Club privé en bêta fermée pour professionnels libéraux.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F1115",
    theme_color: "#0F1115",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
