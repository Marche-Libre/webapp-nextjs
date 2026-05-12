"use client";

import { useEffect, useRef, useCallback, useMemo, type ReactElement } from "react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore, useChannelState, type FullMessage, type ReactionMap } from "./chat-store";

interface MessageAreaProps {
  channelId: string;
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  isAdmin?: boolean;
}

type ChatStore = ReturnType<typeof useChatStore>;
type MessageReactions = ReactionMap[string] | undefined;

export function MessageArea({ channelId, userId, userProfile, isAdmin }: MessageAreaProps) {
  const store = useChatStore();
  const { messages, reactions, hasMore, loaded } = useChannelState(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const loadingMore = useRef(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    await store.loadOlderMessages(channelId);
    loadingMore.current = false;
  }, [channelId, store]);

  const addOptimisticMessage = useCallback((content: string, imageUrl?: string) => {
    return store.addOptimisticMessage(channelId, content, userProfile, imageUrl);
  }, [channelId, store, userProfile]);

  const handleMessageConfirmed = useCallback((optimisticId: string, realMessage: FullMessage | null) => {
    store.confirmMessage(channelId, optimisticId, realMessage);
  }, [channelId, store]);

  const handleMessageFailed = useCallback((optimisticId: string) => {
    store.markMessageFailed(channelId, optimisticId);
  }, [channelId, store]);

  const messageCount = messages.length;

  const loadChannelEffect = useCallback(() => {
    void store.loadChannel(channelId);
  }, [channelId, store]);

  const watchChannelEffect = useCallback(() => {
    return store.watchChannel(channelId);
  }, [channelId, store]);

  const autoScrollEffect = useCallback(() => {
    void messageCount;
    if (isAtBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageCount]);

  const initialScrollEffect = useCallback(() => {
    if (!channelId) return;
    bottomRef.current?.scrollIntoView();
  }, [channelId]);

  const hasMoreNode = useMemo(() => {
    if (!hasMore) return null;

    return (
      <div className="flex justify-center py-[12px]">
        <button
          onClick={loadMore}
          className="text-[12px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        >
          Charger les messages précédents
        </button>
      </div>
    );
  }, [hasMore, loadMore]);

  const messageItems = useMemo(() => {
    const items: ReactElement[] = [];

    for (const msg of messages) {
      items.push(
        <MessageBubbleRow
          key={msg.id}
          channelId={channelId}
          userId={userId}
          isAdmin={isAdmin}
          message={msg}
          reactions={reactions[msg.id]}
          store={store}
        />
      );
    }

    return items;
  }, [channelId, isAdmin, messages, reactions, store, userId]);

  useEffect(loadChannelEffect, [loadChannelEffect]);
  useEffect(watchChannelEffect, [watchChannelEffect]);
  useEffect(autoScrollEffect, [autoScrollEffect]);
  useEffect(initialScrollEffect, [initialScrollEffect]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {hasMoreNode}

        {/* We want the message to start from top */}
        <div className="pt-[8px] pb-[8px] flex flex-col min-h-full">
          {messageItems}
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

interface MessageBubbleRowProps {
  channelId: string;
  userId: string;
  isAdmin?: boolean;
  message: FullMessage;
  reactions?: MessageReactions;
  store: ChatStore;
}

function MessageBubbleRow({ channelId, userId, isAdmin, message: msg, reactions, store }: MessageBubbleRowProps) {
  const isOwnMessage = msg.author_id === userId;

  const handleReact = useCallback((emoji: string) => {
    void store.toggleReaction(channelId, msg.id, emoji);
  }, [channelId, msg.id, store]);

  const handleMessageUpdated = useCallback(() => {
    void store.refreshMessage(channelId, msg.id);
  }, [channelId, msg.id, store]);

  const reactionHandler = isOwnMessage ? undefined : handleReact;

  return (
    <MessageBubble
      message={msg}
      reactions={reactions}
      onReact={reactionHandler}
      currentUserId={userId}
      isAdmin={isAdmin}
      onMessageUpdated={handleMessageUpdated}
    />
  );
}
