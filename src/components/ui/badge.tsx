import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-surface text-text-secondary",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-[10px] py-[4px] text-[11px] leading-[16px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
