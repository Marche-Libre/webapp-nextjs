"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { AVAILABILITY_OPTIONS } from "@/lib/profile-utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  availability?: string;
}

const sizes = {
  sm: "h-[32px] w-[32px] text-[11px]",
  md: "h-[40px] w-[40px] text-[13px]",
  lg: "h-[48px] w-[48px] text-[15px]",
  xl: "h-[72px] w-[72px] text-[24px]",
};

const dotSizes = {
  sm: "h-[8px] w-[8px] border",
  md: "h-[10px] w-[10px] border-[1.5px]",
  lg: "h-[11px] w-[11px] border-[1.5px]",
  xl: "h-[14px] w-[14px] border-2",
};

type AvatarImageState = {
  src: string | null;
  tryOriginal: boolean;
  failed: boolean;
};

// Twitter/X avatar URLs contain _normal (48px). Replace with a bigger variant.
function getHiResAvatar(url: string): string {
  return url.replace(/_normal\./, "_400x400.");
}

export function Avatar({ src, name, size = "md", className, availability }: AvatarProps) {
  const [imageState, setImageState] = useState<AvatarImageState>({
    src: null,
    tryOriginal: false,
    failed: false,
  });
  const stateForCurrentSrc = imageState.src === src ? imageState : null;
  const imageSrc = src
    ? stateForCurrentSrc?.tryOriginal
      ? src
      : getHiResAvatar(src)
    : null;
  const imageFailed = stateForCurrentSrc?.failed ?? false;
  const initials = name
    ? name.replace(/^@/, "")[0]?.toUpperCase() || ""
    : "";

  const fallback = (
    <div
      className={cn(
        "rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-semibold",
        sizes[size],
        className
      )}
    >
      {initials || <User className="h-1/2 w-1/2" />}
    </div>
  );

  const inner = imageSrc && !imageFailed ? (
    <img
      src={imageSrc}
      alt={name}
      className={cn("rounded-xl object-cover", sizes[size], className)}
      onError={() => {
        if (src && imageSrc !== src) {
          setImageState({ src, tryOriginal: true, failed: false });
          return;
        }
        setImageState({ src: src ?? null, tryOriginal: false, failed: true });
      }}
    />
  ) : fallback;

  if (!availability || availability === "unset") return inner;

  const opt = AVAILABILITY_OPTIONS.find((o) => o.value === availability);
  if (!opt) return inner;

  return (
    <div className="relative inline-flex shrink-0">
      {inner}
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-bg-base",
          opt.dot,
          dotSizes[size]
        )}
      />
    </div>
  );
}

/** Standalone availability badge — use next to handle/name */
export function AvailabilityBadge({ status }: { status?: string }) {
  if (!status || status === "unset") return null;
  const opt = AVAILABILITY_OPTIONS.find((o) => o.value === status);
  if (!opt) return null;

  return (
    <span className={cn("inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] font-medium border", opt.badge)}>
      <span className={cn("h-[6px] w-[6px] rounded-full", opt.dot)} />
      {opt.label}
    </span>
  );
}
