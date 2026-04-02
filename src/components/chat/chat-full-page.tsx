"use client";

import { useState, useRef, useEffect } from "react";
import { Hash, Menu, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MessageArea } from "./message-area";
import { useChannelDrawer } from "./chat-layout";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { Channel } from "@/lib/types/database";

type FullMessage = {
  id: string;
  content: string;
  created_at: string;
  author: { x_handle: string; full_name: string; avatar_url: string | null };
};

interface ChatFullPageProps {
  activeChannel: Channel;
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  initialMessages: FullMessage[];
  dmRecipient?: { x_handle: string; full_name: string; avatar_url: string | null } | null;
}

type SearchResult = {
  id: string;
  content: string;
  created_at: string;
  author: { x_handle: string; full_name: string; avatar_url: string | null };
};

export function ChatFullPage({ activeChannel, userId, userProfile, initialMessages, dmRecipient }: ChatFullPageProps) {
  const { open: openChannelDrawer } = useChannelDrawer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("id, content, created_at, author:profiles(x_handle, full_name, avatar_url)")
        .eq("channel_id", activeChannel.id)
        .ilike("content", `%${value.trim()}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      setSearchResults((data as unknown as SearchResult[]) || []);
      setSearching(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0 bg-bg-base">
        <div className="flex items-center gap-[8px] min-w-0">
          {/* Mobile: open channel drawer */}
          <button
            onClick={openChannelDrawer}
            className="md:hidden p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors shrink-0"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
          {dmRecipient ? (
            <>
              <Avatar src={dmRecipient.avatar_url} name={dmRecipient.x_handle} size="sm" className="h-[24px] w-[24px] text-[9px] rounded-md shrink-0" />
              <h1 className="text-[15px] font-semibold text-text-primary truncate">@{dmRecipient.x_handle}</h1>
              {dmRecipient.full_name && (
                <>
                  <span className="text-text-muted hidden sm:inline shrink-0">·</span>
                  <p className="text-[12px] text-text-muted hidden sm:block truncate">{dmRecipient.full_name}</p>
                </>
              )}
            </>
          ) : (
            <>
              <Hash className="h-[16px] w-[16px] text-text-muted shrink-0" />
              <h1 className="text-[15px] font-semibold text-text-primary truncate">{activeChannel.name}</h1>
              {activeChannel.description && (
                <>
                  <span className="text-text-muted hidden sm:inline shrink-0">·</span>
                  <p className="text-[12px] text-text-muted hidden sm:block truncate">{activeChannel.description}</p>
                </>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className={cn(
            "p-[8px] rounded-lg cursor-pointer transition-colors shrink-0",
            searchOpen ? "bg-primary-50 text-primary-500" : "text-text-muted hover:bg-bg-surface hover:text-text-primary"
          )}
        >
          <Search className="h-[16px] w-[16px]" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Messages */}
        <div className="flex-1 min-w-0">
          <MessageArea
            key={activeChannel.id}
            channelId={activeChannel.id}
            userId={userId}
            userProfile={userProfile}
            initialMessages={initialMessages as any}
          />
        </div>

        {/* Search panel — full overlay on mobile, side panel on sm+ */}
        {searchOpen && (
          <div className="absolute inset-0 sm:static sm:w-[320px] shrink-0 border-l border-border-default bg-bg-base flex flex-col z-10">
            <div className="px-[12px] py-[10px] border-b border-border-subtle">
              <div className="flex items-center gap-[8px]">
                <div className="flex-1 relative">
                  <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-text-muted pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={`Rechercher dans #${activeChannel.name}…`}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-[32px] pr-[10px] py-[6px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="p-[6px] rounded-md hover:bg-bg-surface text-text-muted cursor-pointer transition-colors">
                  <X className="h-[14px] w-[14px]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {searching && <p className="px-[16px] py-[12px] text-[13px] text-text-muted">Recherche…</p>}
              {!searching && searchQuery.trim() && searchResults.length === 0 && (
                <p className="px-[16px] py-[12px] text-[13px] text-text-muted">Aucun résultat</p>
              )}
              {!searching && searchResults.map((msg) => (
                <div key={msg.id} className="px-[12px] py-[10px] border-b border-border-subtle hover:bg-bg-surface transition-colors">
                  <div className="flex items-center gap-[8px] mb-[4px]">
                    <Avatar src={msg.author.avatar_url} name={msg.author.x_handle} size="sm" />
                    <span className="text-[12px] font-medium text-text-primary">@{msg.author.x_handle}</span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(msg.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary line-clamp-3 ml-[40px]">{msg.content}</p>
                </div>
              ))}
              {!searching && !searchQuery.trim() && (
                <div className="flex flex-col items-center justify-center py-[48px] text-center px-[16px]">
                  <Search className="h-[24px] w-[24px] text-text-muted mb-[12px]" />
                  <p className="text-[13px] text-text-muted">Recherchez un message, un @utilisateur…</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
