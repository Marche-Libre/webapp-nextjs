"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, PanelLeftOpen, Search, X, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LAUNCH_CHAT_CHANNEL_SLUGS } from "@/lib/chat/channels";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { MemberProfileTrigger } from "@/components/membres/member-profile-trigger";
import type { MemberProfileSeed } from "@/components/membres/member-profile-drawer-context";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onToggleSidebar: () => void;
}

type SearchResult = {
  type: "member" | "message";
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  avatarUrl?: string | null;
  memberSeed?: MemberProfileSeed;
};

type ChatChannelRow = {
  id: string;
  slug: string;
};

export function Header({ sidebarCollapsed, onMenuClick, onToggleSidebar }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const q = value.trim();

      const [membersRes, launchChannelsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, x_handle, avatar_url")
          .eq("status", "approved")
          .or(`full_name.ilike.%${q}%,x_handle.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("channels")
          .select("id, slug")
          .in("slug", [...LAUNCH_CHAT_CHANNEL_SLUGS]),
      ]);
      const launchChannelIds = ((launchChannelsRes.data || []) as ChatChannelRow[]).map(
        (channel) => channel.id,
      );

      let messageRows: Array<{
        id: string;
        content: string;
        channel_id: string;
        author: unknown;
        channel: unknown;
      }> = [];
      if (launchChannelIds.length > 0) {
        const { data: messages } = await supabase
          .from("messages")
          .select("id, content, channel_id, author:profiles!messages_author_id_fkey(x_handle), channel:channels(name, slug)")
          .in("channel_id", launchChannelIds)
          .textSearch("content", q, { type: "plain", config: "french" })
          .order("created_at", { ascending: false })
          .limit(5);
        messageRows = messages || [];
      }

      const items: SearchResult[] = [];

      membersRes.data?.forEach((m) => {
        items.push({
          type: "member",
          id: m.id,
          title: `@${m.x_handle}`,
          subtitle: m.full_name || "",
          avatarUrl: m.avatar_url,
          memberSeed: {
            x_handle: m.x_handle,
            full_name: m.full_name || null,
            avatar_url: m.avatar_url,
          },
        });
      });

      messageRows.forEach((m) => {
        const author = m.author as unknown as { x_handle: string } | null;
        const channel = m.channel as unknown as { name: string; slug: string } | null;
        items.push({
          type: "message",
          id: m.id,
          title: m.content.length > 80 ? m.content.slice(0, 80) + "…" : m.content,
          subtitle: `@${author?.x_handle || "?"} · #${channel?.name || "chat"}`,
          href: channel?.slug ? `/chat/${channel.slug}` : "/chat",
        });
      });

      setResults(items);
      setLoading(false);
    }, 250);
  };

  const handleCloseResults = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle px-[16px] lg:px-[24px] h-[64px] flex items-center gap-[12px]">
      {/* Left: sidebar toggles */}
      <div className="flex items-center gap-[4px] shrink-0">
        {/* Mobile: open sidebar overlay */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
        >
          <Menu className="h-[20px] w-[20px]" />
        </button>
        {/* Desktop: toggle sidebar collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors duration-150"
            title="Ouvrir la sidebar"
          >
            <PanelLeftOpen className="h-[20px] w-[20px]" />
          </button>
        )}
      </div>

      {/* Global search — centered via flex spacers */}
      <div className="flex-1" />
      <div ref={containerRef} className="relative w-full max-w-[480px]">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="Rechercher…"
          className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-[36px] pr-[36px] py-[8px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-[10px] top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-surface text-text-muted cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Dropdown results */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-[4px] bg-bg-base border border-border-default rounded-lg shadow-modal overflow-hidden z-50">
            {loading && (
              <p className="px-[16px] py-[12px] text-[13px] text-text-muted">Recherche…</p>
            )}
            {!loading && results.length === 0 && query.trim() && (
              <p className="px-[16px] py-[12px] text-[13px] text-text-muted">Aucun résultat pour « {query} »</p>
            )}
            {!loading && results.length > 0 && (
              <div className="py-[4px] max-h-[360px] overflow-y-auto">
                {/* Members section */}
                {results.some((r) => r.type === "member") && (
                  <>
                    <p className="px-[12px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                      Membres
                    </p>
                    {results.filter((r) => r.type === "member").map((r) => (
                      <MemberProfileTrigger
                        key={r.id}
                        memberId={r.id}
                        seed={r.memberSeed}
                        onOpen={handleCloseResults}
                        className="flex w-full items-center gap-[10px] px-[12px] py-[8px] transition-colors hover:bg-bg-surface"
                      >
                        <Avatar src={r.avatarUrl} name={r.title} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-text-primary truncate">{r.title}</p>
                          <p className="text-[11px] text-text-muted truncate">{r.subtitle}</p>
                        </div>
                      </MemberProfileTrigger>
                    ))}
                  </>
                )}
                {/* Messages section */}
                {results.some((r) => r.type === "message") && (
                  <>
                    <p className="px-[12px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mt-[4px]">
                      Messages
                    </p>
                    {results.filter((r) => r.type === "message").map((r) => (
                      <Link
                        key={r.id}
                        href={r.href ?? "/chat"}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-[10px] px-[12px] py-[8px] hover:bg-bg-surface transition-colors"
                      >
                        <div className="h-[32px] w-[32px] rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                          <MessageCircle className="h-[16px] w-[16px] text-text-muted" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-text-primary truncate">{r.title}</p>
                          <p className="text-[11px] text-text-muted truncate">{r.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1" />
    </header>
  );
}
