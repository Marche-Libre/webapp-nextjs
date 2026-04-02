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
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  initialMessages: FullMessage[];
}

type ReactionMap = Record<string, { emoji: string; count: number; hasReacted: boolean }[]>;

export function MessageArea({ channelId, userId, userProfile, initialMessages }: MessageAreaProps) {
  const [messages, setMessages] = useState<FullMessage[]>(initialMessages);
  const [reactions, setReactions] = useState<ReactionMap>({});
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

  // Fetch reactions for visible messages
  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("message_reactions")
      .select("message_id, user_id, emoji")
      .in("message_id", messageIds);

    if (!data) return;

    const map: ReactionMap = {};
    for (const r of data) {
      if (!map[r.message_id]) map[r.message_id] = [];
      const existing = map[r.message_id].find((e) => e.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === userId) existing.hasReacted = true;
      } else {
        map[r.message_id].push({
          emoji: r.emoji,
          count: 1,
          hasReacted: r.user_id === userId,
        });
      }
    }
    setReactions(map);
  }, [userId]);

  // Load reactions whenever messages change
  useEffect(() => {
    const ids = messages.filter((m) => !m.id.startsWith("optimistic-")).map((m) => m.id);
    fetchReactions(ids);
  }, [messages, fetchReactions]);

  // Realtime subscription for reactions
  useEffect(() => {
    const supabase = createClient();
    const reactionChannel = supabase
      .channel(`reactions:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          // Refetch all reactions on any change
          const ids = messages.filter((m) => !m.id.startsWith("optimistic-")).map((m) => m.id);
          fetchReactions(ids);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionChannel);
    };
  }, [channelId, messages, fetchReactions]);

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
              // Remove optimistic messages that match this real one (by content + author)
              const withoutOptimistic = prev.filter((m) => {
                if (!m.id.startsWith("optimistic-")) return true;
                return !(m.content === data.content && m.author_id === data.author_id);
              });
              // Avoid duplicates
              if (withoutOptimistic.find((m) => m.id === data.id)) return withoutOptimistic;
              return [...withoutOptimistic, data as FullMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Optimistic message handler — called by MessageInput
  const addOptimisticMessage = useCallback((content: string, imageUrl?: string) => {
    const optimistic: FullMessage = {
      id: `optimistic-${Date.now()}`,
      channel_id: channelId,
      author_id: userId,
      content,
      image_url: imageUrl || null,
      created_at: new Date().toISOString(),
      author: userProfile,
    } as FullMessage;

    setMessages((prev) => [...prev, optimistic]);
  }, [channelId, userId, userProfile]);

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

  // Handle reaction toggle with optimistic update
  const handleReact = async (messageId: string, emoji: string) => {
    // Optimistic update
    setReactions((prev) => {
      const updated = { ...prev };
      const msgReactions = [...(updated[messageId] || [])];
      const idx = msgReactions.findIndex((r) => r.emoji === emoji);

      if (idx >= 0 && msgReactions[idx].hasReacted) {
        // Remove reaction
        msgReactions[idx] = {
          ...msgReactions[idx],
          count: msgReactions[idx].count - 1,
          hasReacted: false,
        };
        if (msgReactions[idx].count <= 0) {
          msgReactions.splice(idx, 1);
        }
      } else if (idx >= 0) {
        // Add to existing emoji
        msgReactions[idx] = {
          ...msgReactions[idx],
          count: msgReactions[idx].count + 1,
          hasReacted: true,
        };
      } else {
        // New emoji
        msgReactions.push({ emoji, count: 1, hasReacted: true });
      }

      updated[messageId] = msgReactions;
      return updated;
    });

    // Persist
    const supabase = createClient();
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
              reactions={reactions[msg.id]}
              onReact={(emoji) => handleReact(msg.id, emoji)}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <MessageInput
        channelId={channelId}
        userId={userId}
        onOptimisticMessage={addOptimisticMessage}
      />
    </div>
  );
}
