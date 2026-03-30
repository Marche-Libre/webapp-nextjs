"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-border-default bg-bg-base px-[16px] py-[10px] text-[15px] leading-[24px] text-text-primary placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:shadow-focus transition-all duration-150",
            error && "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.3)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[13px] leading-[20px] text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
