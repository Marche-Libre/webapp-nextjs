"use client";

import Link from "next/link";
import type { Profile } from "@/lib/types/database";

interface ProfileCompletionRingProps {
  profile: Profile;
}

const FIELDS: { key: keyof Profile; label: string }[] = [
  { key: "specialty_ids", label: "Spécialité" },
  { key: "location", label: "Localisation" },
  { key: "bio", label: "Bio" },
  { key: "avatar_url", label: "Photo de profil" },
  { key: "looking_for", label: "Ce que vous cherchez" },
];

export function ProfileCompletionRing({ profile }: ProfileCompletionRingProps) {
  const filled = FIELDS.filter((f) => {
    const val = profile[f.key];
    return Array.isArray(val) ? val.length > 0 : !!val;
  }).length;
  const total = FIELDS.length;
  const pct = Math.round((filled / total) * 100);

  if (pct === 100) return null;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Link
      href="/profil"
      className="flex items-center gap-4 p-4 rounded-xl border border-base-content/[0.08] bg-base-content/[0.02] hover:bg-base-content/[0.04] transition-colors"
    >
      <div className="relative h-12 w-12 shrink-0">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-base-content/[0.06]"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-accent transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-base-content">
          {pct}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-content">
          Profil complété à {pct}%
        </p>
        <p className="text-xs text-base-content/40 mt-0.5">
          {FIELDS.filter((f) => { const v = profile[f.key]; return Array.isArray(v) ? v.length === 0 : !v; }).map((f) => f.label).join(", ")}
        </p>
      </div>
    </Link>
  );
}
