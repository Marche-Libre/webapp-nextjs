import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-[32px] w-[32px] text-[11px]",
  md: "h-[40px] w-[40px] text-[13px]",
  lg: "h-[48px] w-[48px] text-[15px]",
  xl: "h-[72px] w-[72px] text-[24px]",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-xl object-cover", sizes[size], className)}
      />
    );
  }

  return (
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
}
