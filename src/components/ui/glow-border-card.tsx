"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowBorderCardProps {
  children: ReactNode;
  className?: string;
  glowClassName?: string;
  animationDuration?: number;
  disabled?: boolean;
}

export function GlowBorderCard({
  children,
  className,
  glowClassName,
  animationDuration = 6,
  disabled = false,
}: GlowBorderCardProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const shouldAnimate = !disabled && !prefersReduced;

  return (
    <div className={cn("relative rounded-2xl", className)}>
      {/* Animated glow border */}
      {shouldAnimate && (
        <div
          className={cn(
            "absolute -inset-px rounded-2xl opacity-60",
            glowClassName
          )}
          style={{
            background: `conic-gradient(from 0deg, oklch(72% 0.12 85 / 0.6), oklch(72% 0.12 85 / 0.1), oklch(72% 0.12 85 / 0.05), oklch(72% 0.12 85 / 0.1), oklch(72% 0.12 85 / 0.6))`,
            animation: `glow-spin ${animationDuration}s linear infinite`,
          }}
        />
      )}

      {/* Outer glow blur */}
      {shouldAnimate && (
        <div
          className="absolute -inset-px rounded-2xl opacity-30 blur-md"
          style={{
            background: `conic-gradient(from 0deg, oklch(72% 0.12 85 / 0.5), transparent, oklch(72% 0.12 85 / 0.5))`,
            animation: `glow-spin ${animationDuration}s linear infinite`,
          }}
        />
      )}

      {/* Content with solid background */}
      <div className="relative rounded-2xl bg-base-300/50 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
