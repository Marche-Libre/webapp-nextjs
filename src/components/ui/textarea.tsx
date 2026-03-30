"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-border-default bg-bg-base px-[16px] py-[10px] text-[15px] leading-[24px] text-text-primary placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:shadow-focus transition-all duration-150 resize-none",
            error && "border-error focus:border-error",
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="text-[13px] leading-[20px] text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
