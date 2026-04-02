"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut, Settings, ShieldCheck, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Channel, Profile } from "@/lib/types/database";
import { ChannelList } from "./channel-list";
import { MemberList } from "./member-list";
import { Avatar } from "@/components/ui/avatar";

/* Context to let child pages open the channel drawer on mobile */
const ChannelDrawerContext = createContext<{ open: () => void }>({ open: () => {} });
export function useChannelDrawer() { return useContext(ChannelDrawerContext); }

export interface DmChannel {
  id: string;
  slug: string;
  created_at: string;
  other_user: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">;
}

interface ChatLayoutProps {
  channels: Channel[];
  dmChannels?: DmChannel[];
  members: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">[];
  profile: Profile;
  children: React.ReactNode;
}

function UserBar({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [menuOpen]);

  return (
    <div ref={ref} className="relative shrink-0">
      {menuOpen && (
        <div className="absolute bottom-full left-[8px] right-[8px] mb-[4px] bg-bg-base border border-border-default rounded-lg shadow-modal p-[4px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Link
            href="/profil"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          >
            <User className="h-[16px] w-[16px]" />
            Mon profil
          </Link>
          <Link
            href="/parametres"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          >
            <Settings className="h-[16px] w-[16px]" />
            Paramètres
          </Link>
          {profile.is_admin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
            >
              <ShieldCheck className="h-[16px] w-[16px]" />
              Gestion admin
            </Link>
          )}
          <div className="my-[4px] border-t border-border-subtle" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-error hover:bg-error-bg transition-colors w-full cursor-pointer"
          >
            <LogOut className="h-[16px] w-[16px]" />
            Déconnexion
          </button>
        </div>
      )}

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          "flex items-center gap-[10px] w-full px-[12px] py-[12px] hover:bg-bg-surface transition-colors cursor-pointer",
          menuOpen && "bg-bg-surface"
        )}
      >
        <Avatar src={profile.avatar_url} name={profile.x_handle} size="sm" />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[13px] leading-[18px] font-semibold text-text-primary truncate">
            @{profile.x_handle}
          </p>
          {profile.full_name && (
            <p className="text-[11px] leading-[14px] text-text-muted truncate">
              {profile.full_name}
            </p>
          )}
        </div>
        <ChevronUp className={cn(
          "h-[14px] w-[14px] text-text-muted shrink-0 transition-transform duration-200",
          !menuOpen && "rotate-180"
        )} />
      </button>
    </div>
  );
}

export function ChatLayout({ channels, dmChannels, members, profile, children }: ChatLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ChannelDrawerContext value={{ open: () => setDrawerOpen(true) }}>
      <div className="flex h-full">
        {/* Mobile channel drawer */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-bg-base border-r border-border-default flex flex-col animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between px-[16px] h-[48px] border-b border-border-subtle shrink-0">
                <span className="text-[13px] font-semibold text-text-primary">Salons</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
                >
                  <X className="h-[16px] w-[16px]" />
                </button>
              </div>
              <div className="flex-1" onClick={() => setDrawerOpen(false)}>
                <ChannelList channels={channels} dmChannels={dmChannels} userId={profile.id} hiddenChannelIds={profile.hidden_channel_ids || []} />
              </div>
              <UserBar profile={profile} />
            </div>
          </div>
        )}

        {/* Desktop channel list + user bar */}
        <div className="hidden md:flex w-[260px] border-r border-border-subtle bg-bg-base shrink-0 flex-col">
          <ChannelList channels={channels} dmChannels={dmChannels} userId={profile.id} hiddenChannelIds={profile.hidden_channel_ids || []} />
          <UserBar profile={profile} />
        </div>

        {/* Main message area */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>

        {/* Member list */}
        <div className="hidden lg:flex w-[260px] border-l border-border-subtle bg-bg-base shrink-0 flex-col">
          <MemberList members={members} />
        </div>
      </div>
    </ChannelDrawerContext>
  );
}
