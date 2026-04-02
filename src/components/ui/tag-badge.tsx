import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  onRemove?: () => void;
}

export function TagBadge({ name, color, className, onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[4px] rounded-md px-[8px] py-[2px] text-[11px] leading-[16px] font-medium",
        className
      )}
      style={{
        backgroundColor: color ? `${color}15` : undefined,
        color: color || undefined,
        border: color ? `1px solid ${color}30` : undefined,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-[2px] hover:opacity-70 cursor-pointer"
        >
          &times;
        </button>
      )}
    </span>
  );
}
