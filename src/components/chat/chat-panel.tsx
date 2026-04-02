"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Hash, ChevronDown, Maximize2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useChatPanel } from "./chat-context";
import { MessageArea } from "./message-area";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/types/database";

interface ChatPanelProps {
  userId: string;
}

export function ChatPanel({ userId }: ChatPanelProps) {
  const { isOpen, activeSlug, openChat, closeChat } = useChatPanel();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load channels on first open
  useEffect(() => {
    if (!isOpen || channels.length > 0) return;

    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("channels")
        .select("*")
        .order("name", { ascending: true });
      if (data) setChannels(data);
    };
    load();
  }, [isOpen, channels.length]);

  // Load messages when active slug changes
  const loadMessages = useCallback(async (slug: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data: channel } = await supabase
      .from("channels")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!channel) {
      setLoading(false);
      return;
    }

    setActiveChannel(channel);

    const { data: msgs } = await supabase
      .from("messages")
      .select("*, author:profiles(x_handle, full_name, avatar_url)")
      .eq("channel_id", channel.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setMessages((msgs || []).reverse());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeSlug) {
      loadMessages(activeSlug);
    }
  }, [isOpen, activeSlug, loadMessages]);

  const handleSelectChannel = (channel: Channel) => {
    setDropdownOpen(false);
    openChat(channel.slug);
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeChat}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-bg-base border-l border-border-default z-40 flex flex-col transition-transform duration-300 ease-out",
          "w-full sm:w-[400px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[16px] h-[64px] border-b border-border-subtle shrink-0">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-[8px] text-[15px] font-semibold text-text-primary hover:text-text-secondary cursor-pointer transition-colors"
            >
              <Hash className="h-[16px] w-[16px] text-text-muted" />
              {activeChannel?.name || activeSlug}
              <ChevronDown className="h-[14px] w-[14px] text-text-muted" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-[4px] w-[220px] bg-bg-elevated border border-border-default rounded-lg shadow-modal p-[4px] z-50">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className={cn(
                      "flex items-center gap-[8px] w-full px-[12px] py-[8px] rounded-md text-[13px] text-left cursor-pointer transition-colors",
                      ch.slug === activeSlug
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                    )}
                  >
                    <Hash className="h-[14px] w-[14px] shrink-0" />
                    {ch.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-[4px]">
            <Link
              href={`/chat/${activeSlug || "general"}`}
              onClick={closeChat}
              className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
              title="Ouvrir en grand"
            >
              <Maximize2 className="h-[16px] w-[16px]" />
            </Link>
            <button
              onClick={closeChat}
              className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : activeChannel ? (
            <MessageArea
              key={activeChannel.id}
              channelId={activeChannel.id}
              userId={userId}
              initialMessages={messages}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-text-muted">
              Sélectionnez un channel
            </div>
          )}
        </div>
      </div>
    </>
  );
}
