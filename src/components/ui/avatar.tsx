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

  if (!availability || availability === "unset") return inner;

  const opt = AVAILABILITY_OPTIONS.find((o) => o.value === availability);
  if (!opt) return inner;

  return (
    <div className="relative inline-flex shrink-0">
      {inner}
      <span
        className={cn(
          "absolute -bottom-[3px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-[5px] py-[1px] text-[8px] font-semibold leading-[11px]",
          opt.badge
        )}
      >
        {opt.shortLabel}
      </span>
    </div>
  );
}
