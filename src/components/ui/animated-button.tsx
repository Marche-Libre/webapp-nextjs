"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState, type ButtonHTMLAttributes } from "react";

type ButtonSize = "sm" | "md" | "lg";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
}

const sizes: Record<ButtonSize, string> = {
  sm: "px-[12px] py-[6px] text-[13px] leading-[20px]",
  md: "px-[16px] py-[10px] text-[13px] leading-[20px]",
  lg: "px-[24px] py-[12px] text-[15px] leading-[24px]",
};

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, size = "md", disabled, children, ...props }, ref) => {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-[8px] rounded-lg font-semibold tracking-[-0.01em] transition-all duration-150 focus:outline-none focus:shadow-focus disabled:opacity-40 disabled:pointer-events-none cursor-pointer overflow-hidden",
          "bg-primary-500 text-white hover:bg-primary-600",
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {/* Sweep gradient overlay */}
        {!prefersReduced && !disabled && (
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(110deg, transparent 25%, oklch(100% 0 0 / 0.15) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
              animation: "sweep 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Glow border effect */}
        {!prefersReduced && !disabled && (
          <span
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: "0 0 20px oklch(72% 0.12 85 / 0.4), inset 0 0 20px oklch(72% 0.12 85 / 0.1)",
            }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 inline-flex items-center gap-[8px]">
          {children}
        </span>
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
