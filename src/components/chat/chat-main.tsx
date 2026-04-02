"use client";

import { useState, useEffect, useRef } from "react";
import { Hash, Menu, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MessageArea } from "./message-area";
import { useActiveChannel } from "./chat-channel-context";
import { useChannelDrawer } from "./chat-layout";
import { useChatStore } from "./chat-store";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/types/database";

interface ChatMainProps {
  channels: Channel[];
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  initialMessages?: any[];
  initialChannelId?: string | null;
}

export function ChatMain({ channels, userId, userProfile, initialMessages, initialChannelId }: ChatMainProps) {
  const { activeSlug } = useActiveChannel();
  const { open: openChannelDrawer } = useChannelDrawer();
  const store = useChatStore();

  // Track visited channels to keep them mounted
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const activeChannel = channels.find((c) => c.slug === activeSlug) || null;

  // Seed the store with server-fetched messages on first mount
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !initialChannelId || !initialMessages?.length) return;
    seeded.current = true;
    store.seedChannel(initialChannelId, initialMessages);
  }, [initialChannelId, initialMessages, store]);

  // Load channel when active changes
  useEffect(() => {
    if (!activeChannel) return;
    store.loadChannel(activeChannel.id);
    setVisitedIds((prev) => new Set(prev).add(activeChannel.id));
  }, [activeChannel, store]);

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-[10px] min-w-0">
          <button onClick={openChannelDrawer} className="md:hidden p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors">
            <Menu className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-[8px] min-w-0">
            {activeChannel?.is_private && dmRecipients[activeChannel.id] ? (
              <Avatar src={dmRecipients[activeChannel.id].avatar_url} name={dmRecipients[activeChannel.id].x_handle} size="sm" />
            ) : (
              <Hash className="h-[18px] w-[18px] text-text-muted shrink-0" />
            )}
            <span className="text-[15px] font-semibold text-text-primary truncate">{getChannelTitle()}</span>
            {activeChannel?.description && !activeChannel.is_private && (
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
        {/* All visited channels stay mounted — only active one visible */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {Array.from(visitedIds).map((chId) => {
            const ch = channels.find((c) => c.id === chId);
            if (!ch) return null;
            return (
              <div key={chId} className={cn("flex-1 flex flex-col", activeChannel?.id !== chId && "hidden")}>
                <MessageArea channelId={chId} userId={userId} userProfile={userProfile} />
              </div>
            );
          })}
          {!activeChannel && (
            <div className="flex items-center justify-center h-full"><Spinner /></div>
          )}
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
