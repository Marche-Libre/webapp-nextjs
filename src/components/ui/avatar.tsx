import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  availability?: "available" | "busy" | "unavailable";
}

const sizes = {
  sm: "h-[32px] w-[32px] text-[11px]",
  md: "h-[40px] w-[40px] text-[13px]",
  lg: "h-[48px] w-[48px] text-[15px]",
  xl: "h-[72px] w-[72px] text-[24px]",
};

const dotColors = {
  available: "bg-green-500",
  busy: "bg-amber-500",
  unavailable: "bg-red-500",
};

const dotSizes = {
  sm: "h-[8px] w-[8px] border",
  md: "h-[10px] w-[10px] border-[1.5px]",
  lg: "h-[11px] w-[11px] border-[1.5px]",
  xl: "h-[14px] w-[14px] border-2",
};

// Twitter/X avatar URLs contain _normal (48px). Replace with a bigger variant.
function getHiResAvatar(url: string): string {
  return url.replace(/_normal\./, "_400x400.");
}

export function Avatar({ src, name, size = "md", className, availability }: AvatarProps) {
  const initials = name
    ? name.replace(/^@/, "")[0]?.toUpperCase() || ""
    : "";

  const inner = src ? (
    <img
      src={getHiResAvatar(src)}
      alt={name}
      className={cn("rounded-xl object-cover", sizes[size], className)}
    />
  ) : (
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

  if (!availability) return inner;

  return (
    <div className="relative inline-flex shrink-0">
      {inner}
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-bg-base",
          dotColors[availability],
          dotSizes[size]
        )}
      />
    </div>
  );
}
