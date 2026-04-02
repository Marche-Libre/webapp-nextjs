"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface FlipTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
}

export function FlipText({
  text,
  className,
  staggerDelay = 0.04,
}: FlipTextProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} style={{ display: "inline-flex" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{
            delay: i * staggerDelay,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: "inline-block",
            transformOrigin: "bottom",
            perspective: "1000px",
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
