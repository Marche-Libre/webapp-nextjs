"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function FloatingHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none">
      <header
        className="pointer-events-auto transition-all duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-12px)",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <nav className="flex items-center gap-2 bg-base-100/80 backdrop-blur-xl border border-base-300 rounded-full px-2 py-1.5 shadow-lg">
          <Link href="/" className="flex items-center gap-2 pl-2 pr-3 cursor-pointer">
            <img src="/images/logo.png" alt="MarchéLibre" className="w-7 h-7 object-contain" />
            <span className="font-bold text-[15px] text-base-content tracking-tight hidden sm:inline">
              MarchéLibre
            </span>
          </Link>

          <div className="w-px h-5 bg-base-300" />

          <Link href="/connexion" className="btn btn-outline btn-sm rounded-full border-base-300 text-base-content cursor-pointer">
            Connexion
          </Link>
          <Link href="/inscription" className="btn btn-accent btn-sm rounded-full text-accent-content cursor-pointer">
            S&apos;inscrire
          </Link>
        </nav>
      </header>
    </div>
  );
}
