"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, className, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-start gap-[12px] cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-sm mt-[2px]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {(label || description) && (
        <div>
          {label && (
            <span className="text-[13px] font-medium text-text-primary">{label}</span>
          )}
          {description && (
            <p className="text-[11px] text-text-muted mt-[2px]">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
