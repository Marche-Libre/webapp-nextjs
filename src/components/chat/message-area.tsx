"use client";

import { useEffect, useRef, useCallback, useMemo, type ReactElement } from "react";
import { Pin } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore, useChannelState, type FullMessage, type ReactionMap } from "./chat-store";
import { timeAgo } from "@/lib/utils";

const CHAT_LANE_CLASSNAME = "w-full max-w-[860px] mx-auto";
const GROUP_MAX_GAP_MS = 10 * 60 * 1000;

interface MessageAreaProps {
  channelId: string;
  userId: string;
  userProfile: { x_handle: string; full_name: string; avatar_url: string | null };
  isAdmin?: boolean;
}

type ChatStore = ReturnType<typeof useChatStore>;
type MessageReactions = ReactionMap[string] | undefined;

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function shouldJoinMessageGroup(previousMessage: FullMessage, nextMessage: FullMessage) {
  if (previousMessage.author_id !== nextMessage.author_id) return false;

  const previousTimestamp = parseTimestamp(previousMessage.created_at);
  const nextTimestamp = parseTimestamp(nextMessage.created_at);
  if (previousTimestamp === null || nextTimestamp === null) return false;

  return Math.abs(nextTimestamp - previousTimestamp) <= GROUP_MAX_GAP_MS;
}

function findPinnedMessage(messages: FullMessage[]) {
  let pinnedMessage: FullMessage | null = null;

  for (const message of messages) {
    if (!message.is_pinned) continue;
    pinnedMessage = message;
  }

  return pinnedMessage;
}

function resolvePinnedPreviewText(message: FullMessage) {
  const trimmedContent = message.content.trim();
  if (trimmedContent.length > 0) return trimmedContent;
  if (message.image_url) return "Message média épinglé";
  return "Message épinglé";
}

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
  const pinnedMessage = useMemo(() => findPinnedMessage(messages), [messages]);

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
          type="button"
          onClick={loadMore}
          className="cursor-pointer rounded-full border border-border-default bg-bg-surface px-[12px] py-[6px] text-[12px] font-medium text-primary-400 transition-colors hover:bg-bg-surface-hover hover:text-primary-500"
        >
          Charger les messages précédents
        </button>
      </div>
    );
  }, [hasMore, loadMore]);

  const messageItems = useMemo(() => {
    const items: ReactElement[] = [];

    for (let index = 0; index < messages.length; index += 1) {
      const msg = messages[index];
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
      const isFirstInGroup = !(previousMessage && shouldJoinMessageGroup(previousMessage, msg));
      const isLastInGroup = !(nextMessage && shouldJoinMessageGroup(msg, nextMessage));

      items.push(
        <MessageBubbleRow
          key={msg.id}
          channelId={channelId}
          userId={userId}
          isAdmin={isAdmin}
          message={msg}
          reactions={reactions[msg.id]}
          store={store}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
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
    <div className="flex h-full flex-col bg-bg-base">
      {pinnedMessage && (
        <div className="border-b border-border-subtle bg-bg-surface/50">
          <div className={`${CHAT_LANE_CLASSNAME} px-[6px] py-[8px] sm:px-[12px]`}>
            <PinnedMessageBanner message={pinnedMessage} />
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {/* Keep a readable lane on wide screens while preserving the existing chat flow. */}
        <div className={`${CHAT_LANE_CLASSNAME} flex min-h-full flex-col px-[6px] py-[10px] sm:px-[12px]`}>
          {hasMoreNode}
          {messageItems}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className={CHAT_LANE_CLASSNAME}>
        <MessageInput
          channelId={channelId}
          userId={userId}
          onOptimisticMessage={addOptimisticMessage}
          onMessageConfirmed={handleMessageConfirmed}
          onMessageFailed={handleMessageFailed}
        />
      </div>
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
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

function MessageBubbleRow({
  channelId,
  userId,
  isAdmin,
  message: msg,
  reactions,
  store,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleRowProps) {
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
      channelId={channelId}
      message={msg}
      reactions={reactions}
      onReact={reactionHandler}
      currentUserId={userId}
      isAdmin={isAdmin}
      onMessageUpdated={handleMessageUpdated}
      isFirstInGroup={isFirstInGroup}
      isLastInGroup={isLastInGroup}
    />
  );
}

function PinnedMessageBanner({ message }: { message: FullMessage }) {
  const previewText = resolvePinnedPreviewText(message);

  return (
    <section className="flex items-start gap-[8px] rounded-[10px] border border-primary-200 bg-primary-50/70 px-[10px] py-[8px]">
      <Pin className="mt-[1px] h-[14px] w-[14px] shrink-0 text-primary-500" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">
          Message épinglé
        </p>
        <p className="text-[11px] text-text-muted">
          @{message.author.x_handle} · {timeAgo(message.created_at)}
        </p>
        <p className="mt-[2px] max-h-[36px] overflow-hidden whitespace-pre-wrap break-words text-[13px] leading-[18px] text-text-primary">
          {previewText}
        </p>
      </div>
    </section>
  );
}
