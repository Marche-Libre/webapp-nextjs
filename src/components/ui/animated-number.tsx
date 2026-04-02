"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 1.2,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    const unsub = rounded.on("change", (v) => setDisplayValue(v));
    return () => unsub();
  }, [rounded, prefersReduced, value]);

  useEffect(() => {
    if (prefersReduced || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          animate(motionValue, value, {
            duration,
            ease: [0.16, 1, 0.3, 1],
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, motionValue, value, duration, prefersReduced]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
