"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm",
  secondary:
    "bg-bg-surface text-text-primary hover:bg-bg-surface-2",
  outline:
    "border border-border-default text-text-primary hover:border-border-strong hover:bg-bg-elevated",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-surface",
  danger: "bg-error-bg text-error border border-error/15 hover:bg-error/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-[12px] py-[6px] text-[13px] leading-[20px]",
  md: "px-[16px] py-[10px] text-[13px] leading-[20px]",
  lg: "px-[24px] py-[12px] text-[15px] leading-[24px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-[8px] rounded-lg font-semibold tracking-[-0.01em] transition-all duration-150 focus:outline-none focus:shadow-focus disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
