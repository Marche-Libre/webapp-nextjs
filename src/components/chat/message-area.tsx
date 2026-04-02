"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Spinner } from "@/components/ui/spinner";
import type { Message, MessageReaction } from "@/lib/types/database";

type FullMessage = Message & {
  author: { x_handle: string; full_name: string; avatar_url: string | null };
};

interface MessageAreaProps {
  channelId: string;
  userId: string;
  initialMessages: FullMessage[];
}

export function MessageArea({ channelId, userId, initialMessages }: MessageAreaProps) {
  const [messages, setMessages] = useState<FullMessage[]>(initialMessages);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 50);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [channelId]);

  // Track scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch the full message with author
          const { data } = await supabase
            .from("messages")
            .select("*, author:profiles(x_handle, full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.find((m) => m.id === data.id)) return prev;
              return [...prev, data as FullMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Load older messages (cursor-based pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;

    setLoadingMore(true);
    const supabase = createClient();
    const oldestMessage = messages[0];

    const { data } = await supabase
      .from("messages")
      .select("*, author:profiles(x_handle, full_name, avatar_url)")
      .eq("channel_id", channelId)
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      setMessages((prev) => [...(data as FullMessage[]).reverse(), ...prev]);
      setHasMore(data.length >= 50);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [channelId, loadingMore, hasMore, messages]);

  // Handle reaction toggle
  const handleReact = async (messageId: string, emoji: string) => {
    const supabase = createClient();

    // Check if already reacted
    const { data: existing } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("message_id", messageId)
      .eq("user_id", userId)
      .eq("emoji", emoji)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji);
    } else {
      await supabase
        .from("message_reactions")
        .insert({ message_id: messageId, user_id: userId, emoji });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {hasMore && (
          <div className="flex justify-center py-[12px]">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-[12px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              {loadingMore ? <Spinner size="sm" /> : "Charger les messages précédents"}
            </button>
          </div>
        )}

        <div className="py-[8px]">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onReact={(emoji) => handleReact(msg.id, emoji)}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <MessageInput channelId={channelId} userId={userId} />
    </div>
  );
}
