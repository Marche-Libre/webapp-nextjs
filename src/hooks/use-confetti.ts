"use client";

import { useEffect, useRef } from "react";

// Window.confetti type is declared in confetti-button.tsx

export function useConfetti(trigger: boolean = true) {
  const fired = useRef(false);

  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;

    // Load canvas-confetti from CDN
    const existing = document.querySelector('script[src*="canvas-confetti"]');
    if (existing) {
      fireConfetti();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js";
    script.onload = fireConfetti;
    document.head.appendChild(script);
  }, [trigger]);
}

function getColors(): string[] {
  // Detect theme from data-theme attribute
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "marchelibre-light") {
    // Light theme — richer, deeper colors that pop on white
    return ["#6C3FC5", "#8B5CF6", "#3B82F6", "#C4A24E", "#EC4899", "#10B981"];
  }
  // Dark theme — gold/warm tones that pop on dark
  return ["#C4A24E", "#D4B45E", "#FFD700", "#FFF8DC", "#F59E0B", "#FBBF24"];
}

function fireConfetti() {
  if (!window.confetti) return;

  const colors = getColors();

  // Burst from left
  window.confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.2, y: 0.6 },
    colors,
  });

  // Burst from right
  window.confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.8, y: 0.6 },
    colors,
  });

  // Center burst after small delay
  setTimeout(() => {
    window.confetti?.({
      particleCount: 40,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
    });
  }, 200);
}
