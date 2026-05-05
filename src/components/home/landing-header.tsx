"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ToggleTheme } from "@/components/lightswind/toggle-theme";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-base-100">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img src="/images/logo.png" alt="MarchéLibre" className="w-8 h-8 object-contain" />
          <span className="font-bold text-[17px] text-base-content tracking-tight">
            MarchéLibre
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <ToggleTheme animationType="circle-spread" className="text-base-content/50" />
          <Link href="/connexion" className="btn btn-outline btn-sm border-base-300 text-base-content cursor-pointer">
            Connexion
          </Link>
          <Link href="/inscription" className="btn btn-accent btn-sm text-accent-content cursor-pointer">
            Demander l’accès
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <ToggleTheme animationType="circle-spread" className="text-base-content/50" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-base-200 text-base-content cursor-pointer transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-base-300 bg-base-100 px-4 py-4 space-y-3">
          <Link
            href="/connexion"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center btn btn-outline btn-sm border-base-300 text-base-content cursor-pointer"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center btn btn-accent btn-sm text-accent-content cursor-pointer"
          >
            Demander l’accès
          </Link>
        </div>
      )}
    </div>
  );
}
