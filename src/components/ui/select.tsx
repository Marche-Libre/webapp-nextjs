"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-[8px]">
        {label && (
          <label
            htmlFor={id}
            className="block text-[13px] leading-[20px] font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-border-default bg-bg-base px-[16px] py-[10px] text-[15px] leading-[24px] text-text-primary focus:border-primary-500 focus:outline-none focus:shadow-focus transition-all duration-150",
            error && "border-error",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[13px] leading-[20px] text-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
