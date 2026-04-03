"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChevronUp, Hash, LogOut, Menu, Search, Settings, ShieldCheck, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Channel, Profile } from "@/lib/types/database";
import { ChannelList } from "./channel-list";
import { MemberList } from "./member-list";
import { MessageArea } from "./message-area";
import { Avatar } from "@/components/ui/avatar";
import { ChatChannelProvider, useActiveChannel } from "./chat-channel-context";
import { useChatStore } from "./chat-store";
import { Spinner } from "@/components/ui/spinner";

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
  initialMessages?: any[];
  initialChannelId?: string | null;
}

/* ── User bar at bottom of channel sidebar ── */

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
          "flex items-center gap-[10px] w-full px-[12px] h-[60px] hover:bg-bg-surface transition-colors cursor-pointer",
          menuOpen && "bg-bg-surface"
        )}
      >
        <Avatar src={profile.avatar_url} name={profile.x_handle} size="sm" />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[13px] leading-[18px] font-semibold text-text-primary truncate">
            {profile.full_name || `@${profile.x_handle}`}
          </p>
          {profile.full_name && profile.full_name.toLowerCase() !== profile.x_handle.toLowerCase() && (
            <p className="text-[11px] leading-[14px] text-text-muted truncate">
              @{profile.x_handle}
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

/* ── Chat area with header + search (replaces ChatMain) ── */

function ChatArea({
  channels,
  userId,
  userProfile,
  isAdmin,
  initialMessages,
  initialChannelId,
}: {
  channels: Channel[];
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  isAdmin?: boolean;
  initialMessages?: any[];
  initialChannelId?: string | null;
}) {
  const { activeSlug } = useActiveChannel();
  const { open: openChannelDrawer } = useChannelDrawer();
  const store = useChatStore();

  const activeChannel = channels.find((c) => c.slug === activeSlug) || null;

  // Seed the store with server-fetched messages on first mount
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !initialChannelId || !initialMessages?.length) return;
    seeded.current = true;
    store.seedChannel(initialChannelId, initialMessages);
  }, [initialChannelId, initialMessages, store]);

  // DM recipients
  const [dmRecipients, setDmRecipients] = useState<Record<string, { x_handle: string; full_name: string; avatar_url: string | null }>>({});

  useEffect(() => {
    if (!activeChannel?.is_private || dmRecipients[activeChannel.id]) return;
    const supabase = createClient();
    supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", activeChannel.id)
      .neq("user_id", userId)
      .maybeSingle()
      .then(({ data: otherMember }) => {
        if (!otherMember) return;
        supabase
          .from("profiles")
          .select("x_handle, full_name, avatar_url")
          .eq("id", otherMember.user_id)
          .single()
          .then(({ data }) => {
            if (data) setDmRecipients((prev) => ({ ...prev, [activeChannel.id]: data }));
          });
      });
  }, [activeChannel, userId, dmRecipients]);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; content: string; created_at: string; author: { x_handle: string } }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim() || !activeChannel) { setSearchResults([]); return; }
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("id, content, created_at, author:profiles!messages_author_id_fkey(x_handle)")
        .eq("channel_id", activeChannel.id)
        .ilike("content", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      setSearchResults((data || []) as any);
      setSearching(false);
    }, 300);
  }, [searchQuery, activeChannel]);

  const getChannelTitle = () => {
    if (!activeChannel) return "";
    if (activeChannel.is_private) {
      const dm = dmRecipients[activeChannel.id];
      return dm ? `@${dm.x_handle}` : "Message privé";
    }
    return activeChannel.name;
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-[10px] min-w-0">
          <button onClick={openChannelDrawer} className="md:hidden p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors">
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-[8px] min-w-0">
            {activeChannel.is_private && dmRecipients[activeChannel.id] ? (
              <Avatar src={dmRecipients[activeChannel.id].avatar_url} name={dmRecipients[activeChannel.id].x_handle} size="sm" />
            ) : (
              <Hash className="h-[18px] w-[18px] text-text-muted shrink-0" />
            )}
            <span className="text-[15px] font-semibold text-text-primary truncate">{getChannelTitle()}</span>
            {activeChannel.description && !activeChannel.is_private && (
              <span className="text-[12px] text-text-muted truncate hidden sm:block">{activeChannel.description}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className={cn("p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors", searchOpen && "bg-bg-surface text-text-primary")}
        >
          <Search className="h-[16px] w-[16px]" />
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Message area — single channel at a time */}
        <div className="flex-1 flex flex-col min-w-0">
          <MessageArea
            key={activeChannel.id}
            channelId={activeChannel.id}
            userId={userId}
            userProfile={userProfile}
            isAdmin={isAdmin}
          />
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="w-full sm:w-[320px] border-l border-border-subtle bg-bg-base flex flex-col shrink-0">
            <div className="p-[12px] border-b border-border-subtle">
              <div className="flex items-center gap-[8px]">
                <Search className="h-[14px] w-[14px] text-text-muted shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans ce salon…"
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="p-[4px] text-text-muted hover:text-text-primary cursor-pointer">
                  <X className="h-[14px] w-[14px]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-[8px]">
              {searching && <div className="flex justify-center py-[16px]"><Spinner size="sm" /></div>}
              {!searching && searchResults.length === 0 && searchQuery.trim() && (
                <p className="text-center text-[12px] text-text-muted py-[16px]">Aucun résultat</p>
              )}
              {searchResults.map((msg) => (
                <div key={msg.id} className="px-[8px] py-[6px] rounded-md hover:bg-bg-surface transition-colors">
                  <div className="flex items-baseline gap-[6px]">
                    <span className="text-[12px] font-semibold text-text-primary">@{(msg.author as any)?.x_handle}</span>
                    <span className="text-[10px] text-text-muted">{new Date(msg.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary line-clamp-2 mt-[2px]">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main layout ── */

export function ChatLayout({ channels, dmChannels, members, profile, initialMessages, initialChannelId }: ChatLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allChannels: Channel[] = [
    ...(channels || []),
    ...(dmChannels || []).map((dm) => ({
      id: dm.id,
      name: dm.other_user.x_handle,
      slug: dm.slug || `dm-${dm.id}`,
      description: null,
      created_by: null,
      is_private: true,
      created_at: dm.created_at,
    } as Channel)),
  ];

  return (
    <ChatChannelProvider initialSlug="general">
      <ChannelDrawerContext value={{ open: () => setDrawerOpen(true) }}>
        <div className="flex h-full">
          {/* Mobile channel drawer */}
          {drawerOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-bg-base border-r border-border-default flex flex-col animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0">
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
            <ChatArea
              channels={allChannels}
              userId={profile.id}
              userProfile={{
                x_handle: profile.x_handle,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              }}
              isAdmin={profile.is_admin}
              initialMessages={initialMessages}
              initialChannelId={initialChannelId}
            />
          </div>

          {/* Member list */}
          <div className="hidden lg:flex w-[260px] border-l border-border-subtle bg-bg-base shrink-0 flex-col">
            <MemberList members={members} />
          </div>
        </div>
      </ChannelDrawerContext>
    </ChatChannelProvider>
  );
}
