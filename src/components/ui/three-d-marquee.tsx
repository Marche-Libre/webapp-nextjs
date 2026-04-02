"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ThreeDMarqueeProps {
  images: { src: string; alt: string }[];
  className?: string;
  cols?: number;
}

export function ThreeDMarquee({
  images,
  className = "",
  cols = 8,
}: ThreeDMarqueeProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const duplicated = [...images, ...images];
  const groupSize = Math.ceil(duplicated.length / cols);
  const columns = Array.from({ length: cols }, (_, i) =>
    duplicated.slice(i * groupSize, (i + 1) * groupSize)
  );

  return (
    <div
      className={`block h-full min-h-[500px] overflow-hidden ${className}`}
    >
      <div
        className="flex w-full h-full items-center justify-center"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg)",
          transformOrigin: "center center",
        }}
      >
        <div className="w-[200%] overflow-hidden">
          <div
            className="relative grid h-full w-full origin-center gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {columns.map((col, idx) => (
              <motion.div
                key={idx}
                animate={
                  prefersReduced
                    ? undefined
                    : { y: idx % 2 === 0 ? 80 : -80 }
                }
                transition={
                  prefersReduced
                    ? undefined
                    : {
                        duration: 12 + idx * 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear",
                      }
                }
                className="flex flex-col items-center gap-3"
              >
                {col.map((image, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="aspect-[3/2] w-full rounded-lg object-cover"
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
