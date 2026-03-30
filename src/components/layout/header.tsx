"use client";

import { Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/database";

interface HeaderProps {
  profile: Profile;
  onMenuClick: () => void;
}

export function Header({ profile, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle px-[16px] lg:px-[24px] h-[64px] flex items-center justify-between gap-[16px]">
      <div className="flex items-center gap-[12px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
        >
          <Menu className="h-[20px] w-[20px]" />
        </button>

        <div className="hidden sm:flex items-center gap-[8px] bg-bg-elevated border border-border-subtle rounded-lg px-[12px] py-[8px] w-[256px] lg:w-[320px]">
          <Search className="h-[16px] w-[16px] text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un membre, une annonce..."
            className="bg-transparent text-[13px] leading-[20px] text-text-primary placeholder:text-text-muted focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-[12px]">
        <div className="hidden sm:block text-right">
          <p className="text-[13px] leading-[20px] font-medium text-text-primary">
            {profile.full_name}
          </p>
          <p className="text-[11px] leading-[16px] text-text-muted">
            {profile.specialty || "Professionnel libéral"}
          </p>
        </div>
        <Avatar src={profile.avatar_url} name={profile.full_name} size="md" />
      </div>
    </header>
  );
}
