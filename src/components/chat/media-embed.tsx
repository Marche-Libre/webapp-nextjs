"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { MediaEmbed as MediaEmbedData } from "@/lib/media-embed";
import { cn } from "@/lib/utils";

type MediaEmbedProps = {
  embed: MediaEmbedData;
};

export function MediaEmbed({ embed }: MediaEmbedProps) {
  const usesFixedHeight = embed.aspectRatio === "100%";
  const frameStyle = useMemo<CSSProperties>(() => {
    if (!usesFixedHeight) return {};

    return { height: embed.height };
  }, [embed.height, usesFixedHeight]);

  return (
    <iframe
      title={`${embed.title} intégré`}
      src={embed.embedUrl}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      style={frameStyle}
      className={cn(
        "mt-[8px] block w-[min(420px,100%)] rounded-lg border border-border-default bg-bg-elevated",
        !usesFixedHeight && "aspect-video"
      )}
    />
  );
}
