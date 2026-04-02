"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore, useChannelState } from "./chat-store";

interface MessageAreaProps {
  channelId: string;
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
}

export function MessageArea({ channelId, userId, userProfile }: MessageAreaProps) {
  const store = useChatStore();
  const { messages, reactions, hasMore, loaded } = useChannelState(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const loadingMore = useRef(false);

  // Load initial messages + subscribe to realtime
  useEffect(() => {
    store.loadChannel(channelId);
  }, [channelId, store]);

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

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const loadMore = useCallback(async () => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    await store.loadOlderMessages(channelId);
    loadingMore.current = false;
  }, [channelId, store]);

  const addOptimisticMessage = useCallback((content: string, imageUrl?: string): string => {
    return store.addOptimisticMessage(channelId, content, userProfile, imageUrl);
  }, [channelId, store, userProfile]);

  const handleMessageConfirmed = useCallback((optimisticId: string, realMessage: any) => {
    store.confirmMessage(channelId, optimisticId, realMessage);
  }, [channelId, store]);

  const handleMessageFailed = useCallback((optimisticId: string) => {
    store.markMessageFailed(channelId, optimisticId);
  }, [channelId, store]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

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
              className="text-[12px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              Charger les messages précédents
            </button>
          </div>
        )}

        <div className="py-[8px] flex flex-col justify-end min-h-full">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              reactions={reactions[msg.id]}
              onReact={(emoji) => store.toggleReaction(channelId, msg.id, emoji)}
              currentUserId={userId}
              onMessageUpdated={() => store.refreshMessage(channelId, msg.id)}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <MessageInput
        channelId={channelId}
        userId={userId}
        onOptimisticMessage={addOptimisticMessage}
        onMessageConfirmed={handleMessageConfirmed}
        onMessageFailed={handleMessageFailed}
      />
    </div>
  );
}
