import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserCardProps {
  name: string;
  handle: string;
  avatarUrl?: string | null;
  subtitle?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function UserCard({ name, handle, avatarUrl, subtitle, className, size = "md" }: UserCardProps) {
  return (
    <div className={cn("flex items-center gap-[10px]", className)}>
      <Avatar
        src={avatarUrl}
        name={name}
        size={size === "sm" ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <p className={cn(
          "font-medium text-text-primary truncate",
          size === "sm" ? "text-[12px]" : "text-[13px]"
        )}>
          @{handle}
        </p>
        {name && (
          <p className={cn(
            "text-text-muted truncate",
            size === "sm" ? "text-[10px]" : "text-[11px]"
          )}>
            {name}
          </p>
        )}
        {subtitle && (
          <p className="text-[11px] text-text-muted truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
