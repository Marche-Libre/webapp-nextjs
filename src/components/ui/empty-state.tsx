import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-[48px] px-[24px] text-center", className)}>
      {icon && (
        <div className="h-[56px] w-[56px] rounded-2xl bg-bg-surface flex items-center justify-center mb-[16px]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-text-muted mt-[6px] max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div className="mt-[16px]">{action}</div>}
    </div>
  );
}
