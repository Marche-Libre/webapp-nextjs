"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ChevronUp, Hash, LogOut, Menu, Moon, Search, ShieldCheck, Sun, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Channel, Profile } from "@/lib/types/database";
import { ChannelList } from "./channel-list";
import { MemberList } from "./member-list";
import { MessageArea } from "./message-area";
import { Avatar } from "@/components/ui/avatar";
import { NotificationEntry } from "@/components/notifications/notification-entry";
import { ChatChannelProvider, useActiveChannel } from "./chat-channel-context";
import { useChatStore, type FullMessage } from "./chat-store";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/components/theme/theme-provider";

/* Context to let child pages open the channel drawer on mobile */
const ChannelDrawerContext = createContext<{ open: () => void }>({ open: () => {} });
export function useChannelDrawer() { return useContext(ChannelDrawerContext); }

export interface DmChannel {
  id: string;
  slug: string;
  created_at: string;
  other_user: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">;
}

type SearchResult = {
  id: string;
  content: string;
  created_at: string;
  author: Pick<Profile, "x_handle"> | null;
};

type SearchResultRow = Omit<SearchResult, "author"> & {
  author: Pick<Profile, "x_handle"> | Pick<Profile, "x_handle">[] | null;
};

interface ChatLayoutProps {
  channels: Channel[];
  dmChannels?: DmChannel[];
  members: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">[];
  profile: Profile;
  initialMessages?: FullMessage[];
  initialChannelId?: string | null;
  initialChannelSlug?: string | null;
  children?: ReactNode;
}

/* ── User bar at bottom of channel sidebar ── */

function UserBar({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((current) => !current);
  }, []);

  const handleNavigate = useCallback(() => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate();
    }
  }, [onNavigate]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  }, [router]);

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handleCloseMenu();
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [handleCloseMenu, menuOpen]);

  return (
    <div ref={ref} className="relative shrink-0">
      {menuOpen && (
        <div className="absolute bottom-full left-[8px] right-[8px] mb-[4px] bg-bg-base border border-border-default rounded-lg shadow-modal p-[4px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Link
            href="/profil"
            onClick={handleNavigate}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          >
            <User className="h-[16px] w-[16px]" />
            Mon profil
          </Link>
          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-[16px] w-[16px]" />
            ) : (
              <Moon className="h-[16px] w-[16px]" />
            )}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
          {profile.is_admin && (
            <Link
              href="/admin"
              onClick={handleNavigate}
              className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
            >
              <ShieldCheck className="h-[16px] w-[16px]" />
              Administration
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

      <div className="flex items-center gap-[6px] px-[8px] py-[8px] border-t border-border-subtle">
        <button
          type="button"
          onClick={handleToggleMenu}
          className={cn(
            "flex items-center gap-[10px] flex-1 min-w-0 px-[4px] py-[6px] rounded-md hover:bg-bg-surface transition-colors cursor-pointer",
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
        <NotificationEntry compact onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

/* ── Chat area with header + search ── */

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
  initialMessages?: FullMessage[];
  initialChannelId?: string | null;
}) {
  const { activeSlug } = useActiveChannel();
  const { open: openChannelDrawer } = useChannelDrawer();
  const store = useChatStore();

  const activeChannel = useMemo(() => {
    return channels.find((channel) => channel.slug === activeSlug) || null;
  }, [activeSlug, channels]);
  const activeChannelId = activeChannel?.id ?? null;
  const activeChannelIsPrivate = activeChannel?.is_private ?? false;
  const activeChannelCanWrite = useMemo(() => {
    if (!activeChannel) return false;
    return activeChannel.write_permission === "all" || Boolean(isAdmin);
  }, [activeChannel, isAdmin]);
  const activeChannelNoPermissionMessage = useMemo(() => {
    if (!activeChannel || activeChannelCanWrite) return null;
    if (activeChannel.slug === "jobs") {
      return "Seuls les admins peuvent publier dans Jobs.";
    }
    return "Vous n'avez pas la permission de publier dans ce salon.";
  }, [activeChannel, activeChannelCanWrite]);

  // Seed the store with server-fetched messages on first mount
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !initialChannelId || !initialMessages?.length) return;
    seeded.current = true;
    store.seedChannel(initialChannelId, initialMessages);
  }, [initialChannelId, initialMessages, store]);

  // DM recipients
  const [dmRecipients, setDmRecipients] = useState<Record<string, { x_handle: string; full_name: string; avatar_url: string | null }>>({});
  const requestedDmRecipientIds = useRef(new Set<string>());
  const activeDmRecipient = activeChannelId ? dmRecipients[activeChannelId] : null;

  useEffect(() => {
    if (!activeChannelId || !activeChannelIsPrivate || requestedDmRecipientIds.current.has(activeChannelId)) return;
    requestedDmRecipientIds.current.add(activeChannelId);
    let cancelled = false;
    const supabase = createClient();
    void supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", activeChannelId)
      .neq("user_id", userId)
      .maybeSingle()
      .then(({ data: otherMember }) => {
        if (!otherMember || cancelled) {
          requestedDmRecipientIds.current.delete(activeChannelId);
          return;
        }
        void supabase
          .from("profiles")
          .select("x_handle, full_name, avatar_url")
          .eq("id", otherMember.user_id)
          .single()
          .then(({ data }) => {
            if (!data || cancelled) {
              requestedDmRecipientIds.current.delete(activeChannelId);
              return;
            }
            setDmRecipients((prev) => {
              if (prev[activeChannelId]) return prev;
              return { ...prev, [activeChannelId]: data };
            });
          });
      });
    return () => {
      cancelled = true;
    };
  }, [activeChannelId, activeChannelIsPrivate, userId]);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout>(undefined);
  const searchRequestRef = useRef(0);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  useEffect(() => {
    searchRequestRef.current += 1;
    const requestId = searchRequestRef.current;
    clearTimeout(searchTimerRef.current);

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || !activeChannelId) return;

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("id, content, created_at, author:profiles!messages_author_id_fkey(x_handle)")
        .eq("channel_id", activeChannelId)
        .ilike("content", `%${trimmedQuery}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (searchRequestRef.current !== requestId) return;
      const rows = (data || []) as unknown as SearchResultRow[];
      setSearchResults(rows.map((row) => ({
        ...row,
        author: Array.isArray(row.author) ? row.author[0] ?? null : row.author,
      })));
      setSearching(false);
    }, 300);
    return () => {
      clearTimeout(searchTimerRef.current);
    };
  }, [activeChannelId, searchQuery]);

  const channelTitle = useMemo(() => {
    if (!activeChannel) return "";
    if (activeChannel.is_private) {
      return activeDmRecipient ? `@${activeDmRecipient.x_handle}` : "Message privé";
    }
    return activeChannel.name;
  }, [activeChannel, activeDmRecipient]);

  const handleToggleSearch = useCallback(() => {
    setSearchOpen((current) => !current);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
    }
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const searchResultItems = useMemo(() => {
    return searchResults.map((msg) => (
      <div key={msg.id} className="px-[8px] py-[6px] rounded-md hover:bg-bg-surface transition-colors">
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[12px] font-semibold text-text-primary">@{msg.author?.x_handle}</span>
          <span className="text-[10px] text-text-muted">{new Date(msg.created_at).toLocaleDateString("fr-FR")}</span>
        </div>
        <p className="text-[12px] text-text-secondary line-clamp-2 mt-[2px]">{msg.content}</p>
      </div>
    ));
  }, [searchResults]);

  if (!activeChannel) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-semibold text-text-primary">
            {channels.length > 0 ? "Salon introuvable" : "Aucun salon disponible"}
          </p>
          <p className="text-xs text-text-muted">
            {channels.length > 0
              ? "Ce salon n'existe plus ou n'est pas accessible. Revenez au chat pour ouvrir un salon disponible."
              : "Aucun salon de discussion n'est disponible pour le moment."}
          </p>
          {channels.length > 0 && (
            <Link href="/chat" className="inline-flex text-xs font-medium text-primary-500 hover:underline">
              Retour au chat
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-border-subtle bg-bg-base/95 px-[18px] backdrop-blur">
        <div className="flex items-center gap-[10px] min-w-0">
          <button type="button" onClick={openChannelDrawer} className="cursor-pointer rounded-full p-[7px] text-text-muted transition-colors hover:bg-bg-surface md:hidden">
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-[8px] min-w-0">
            {activeChannel.is_private && activeDmRecipient ? (
              <Avatar src={activeDmRecipient.avatar_url} name={activeDmRecipient.x_handle} size="sm" />
            ) : (
              <Hash className="h-[18px] w-[18px] text-text-muted shrink-0" />
            )}
            <span className="truncate text-[15px] font-semibold text-text-primary">{channelTitle}</span>
            {activeChannel.description && !activeChannel.is_private && (
              <span className="hidden truncate text-[12px] text-text-muted sm:block">{activeChannel.description}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleSearch}
          className={cn("cursor-pointer rounded-full p-[7px] text-text-muted transition-colors hover:bg-bg-surface", searchOpen && "bg-bg-surface text-text-primary")}
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
            channelSlug={activeChannel.slug}
            canWrite={activeChannelCanWrite}
            noPermissionMessage={activeChannelNoPermissionMessage}
            userId={userId}
            userProfile={userProfile}
            isAdmin={isAdmin}
          />
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="flex w-full shrink-0 flex-col border-l border-border-subtle bg-bg-base sm:w-[320px]">
            <div className="border-b border-border-subtle p-[12px]">
              <div className="flex items-center gap-[8px] rounded-full border border-border-default bg-bg-surface px-[12px] py-[8px]">
                <Search className="h-[14px] w-[14px] text-text-muted shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher dans ce salon..."
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <button type="button" onClick={handleCloseSearch} className="cursor-pointer rounded-full p-[4px] text-text-muted hover:bg-bg-surface-hover hover:text-text-primary">
                  <X className="h-[14px] w-[14px]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-[8px]">
              {searching && <div className="flex justify-center py-[16px]"><Spinner size="sm" /></div>}
              {!searching && searchResults.length === 0 && searchQuery.trim() && (
                <p className="text-center text-[12px] text-text-muted py-[16px]">Aucun résultat</p>
              )}
              {searchResultItems}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main layout ── */

export function ChatLayout({ channels, dmChannels, members, profile, initialMessages, initialChannelId, initialChannelSlug, children }: ChatLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allChannels = useMemo<Channel[]>(() => {
    return [
      ...(channels || []),
      ...(dmChannels || []).map((dm) => ({
        id: dm.id,
        name: dm.other_user.x_handle,
        slug: dm.slug || `dm-${dm.id}`,
        description: null,
        created_by: null,
        is_private: true,
        read_permission: "all",
        write_permission: "all",
        created_at: dm.created_at,
      } as Channel)),
    ];
  }, [channels, dmChannels]);

  const defaultSlug = initialChannelSlug ?? allChannels[0]?.slug ?? "";
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);
  const drawerContextValue = useMemo(() => {
    return { open: openDrawer };
  }, [openDrawer]);
  const userProfile = useMemo(() => {
    return {
      x_handle: profile.x_handle,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    };
  }, [profile.avatar_url, profile.full_name, profile.x_handle]);

  return (
    <ChatChannelProvider initialSlug={defaultSlug}>
      {children}
      <ChannelDrawerContext value={drawerContextValue}>
        <div className="flex h-full">
          {/* Mobile channel drawer */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                type="button"
                aria-label="Fermer les salons"
                className="absolute inset-0 bg-black/60"
                onClick={closeDrawer}
              />
              <div className="animate-in absolute bottom-0 left-0 top-0 flex w-[280px] flex-col border-r border-border-default bg-bg-base shadow-modal slide-in-from-left duration-200">
                <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-border-subtle px-[18px]">
                  <span className="text-[13px] font-semibold text-text-primary">Discussions</span>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="cursor-pointer rounded-full p-[7px] text-text-muted transition-colors hover:bg-bg-surface"
                  >
                    <X className="h-[16px] w-[16px]" />
                  </button>
                </div>
                <div className="flex-1" onClick={closeDrawer}>
                  <ChannelList channels={channels} dmChannels={dmChannels} userId={profile.id} hiddenChannelIds={profile.hidden_channel_ids || []} />
                </div>
                <UserBar profile={profile} onNavigate={closeDrawer} />
              </div>
            </div>
          )}

          {/* Desktop channel list + user bar */}
          <div className="hidden w-[270px] shrink-0 flex-col border-r border-border-subtle bg-bg-base md:flex">
            <ChannelList channels={channels} dmChannels={dmChannels} userId={profile.id} hiddenChannelIds={profile.hidden_channel_ids || []} />
            <UserBar profile={profile} />
          </div>

          {/* Main message area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatArea
              channels={allChannels}
              userId={profile.id}
              userProfile={userProfile}
              isAdmin={profile.is_admin}
              initialMessages={initialMessages}
              initialChannelId={initialChannelId}
            />
          </div>

          {/* Member list */}
          <div className="hidden w-[260px] shrink-0 flex-col border-l border-border-subtle bg-bg-base xl:flex">
            <MemberList members={members} />
          </div>
        </div>
      </ChannelDrawerContext>
    </ChatChannelProvider>
  );
}
