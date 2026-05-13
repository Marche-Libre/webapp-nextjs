"use client";

import { useEffect, useRef, useCallback, useMemo, useState, type CSSProperties, type ReactElement } from "react";
import { ArrowDown, Pin } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore, useChannelState, type FullMessage, type ReactionMap } from "./chat-store";
import { timeAgo } from "@/lib/utils";

const CHAT_LANE_CLASSNAME = "w-full max-w-[860px] mx-auto";
const GROUP_MAX_GAP_MS = 10 * 60 * 1000;
const CHAT_BOTTOM_THRESHOLD_PX = 100;
const SCROLL_TO_LATEST_COMPOSER_GAP_PX = 12;
const SCROLL_TO_LATEST_MIN_VIEWPORT_MARGIN_PX = 16;
const MESSAGE_HIGHLIGHT_DURATION_MS = 1600;
const MESSAGE_HIGHLIGHT_CLASSNAMES = ["bg-primary-50", "ring-1", "ring-primary-300"];
const SCROLL_TO_LATEST_LATEST_LABEL = "Aller au dernier message";
const SCROLL_TO_LATEST_NEW_MESSAGE_LABEL = "Aller aux nouveaux messages";

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

function resolvePinnedPreviewText(message: FullMessage) {
  const trimmedContent = message.content.trim();
  if (trimmedContent.length > 0) return trimmedContent;
  if (message.image_url) return "Message média épinglé";
  return "Message épinglé";
}

function getMessageDomId(messageId: string) {
  return `message-${messageId}`;
}

function resolveIsAtBottom(element: HTMLDivElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight < CHAT_BOTTOM_THRESHOLD_PX;
}

function resolveScrollToLatestPosition(composerLaneElement: HTMLDivElement) {
  const composerLaneRect = composerLaneElement.getBoundingClientRect();

  return {
    bottom: Math.max(
      window.innerHeight - composerLaneRect.top + SCROLL_TO_LATEST_COMPOSER_GAP_PX,
      SCROLL_TO_LATEST_MIN_VIEWPORT_MARGIN_PX,
    ),
    right: Math.max(
      window.innerWidth - composerLaneRect.right + SCROLL_TO_LATEST_COMPOSER_GAP_PX,
      SCROLL_TO_LATEST_MIN_VIEWPORT_MARGIN_PX,
    ),
  };
}

export function MessageArea({ channelId, userId, userProfile, isAdmin }: MessageAreaProps) {
  const store = useChatStore();
  const { messages, pinnedMessage, reactions, hasMore, loaded } = useChannelState(channelId);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [hasNewLatestMessage, setHasNewLatestMessage] = useState(false);
  const [scrollToLatestPosition, setScrollToLatestPosition] = useState<{ bottom: number; right: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerLaneRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const loadingMore = useRef(false);
  const highlightTimeoutRef = useRef<number | null>(null);
  const highlightedMessageElementRef = useRef<HTMLElement | null>(null);
  const latestMessageIdRef = useRef<string | null>(null);

  const messageCount = messages.length;
  const latestMessageId = useMemo(() => {
    if (!messages.length) return null;

    return messages[messages.length - 1]?.id ?? null;
  }, [messages]);
  const scrollToLatestAriaLabel = useMemo(() => {
    if (hasNewLatestMessage) return SCROLL_TO_LATEST_NEW_MESSAGE_LABEL;

    return SCROLL_TO_LATEST_LATEST_LABEL;
  }, [hasNewLatestMessage]);

  const syncBottomState = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    const atBottom = resolveIsAtBottom(element);
    isAtBottom.current = atBottom;
    setShowScrollToLatest(!atBottom);
    if (atBottom) setHasNewLatestMessage(false);
  }, []);

  const handleScroll = useCallback(() => {
    syncBottomState(scrollRef.current);
  }, [syncBottomState]);

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

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current === null) return;
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = null;
  }, []);

  const clearMessageHighlight = useCallback(() => {
    clearHighlightTimeout();
    highlightedMessageElementRef.current?.classList.remove(...MESSAGE_HIGHLIGHT_CLASSNAMES);
    highlightedMessageElementRef.current = null;
  }, [clearHighlightTimeout]);

  const highlightMessageElement = useCallback((messageElement: HTMLElement) => {
    clearMessageHighlight();
    messageElement.classList.add(...MESSAGE_HIGHLIGHT_CLASSNAMES);
    highlightedMessageElementRef.current = messageElement;
    highlightTimeoutRef.current = window.setTimeout(clearMessageHighlight, MESSAGE_HIGHLIGHT_DURATION_MS);
  }, [clearMessageHighlight]);

  const scrollToMessageElement = useCallback((messageId: string) => {
    const messageElement = document.getElementById(getMessageDomId(messageId));
    if (!messageElement) return false;

    messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightMessageElement(messageElement);
    return true;
  }, [highlightMessageElement]);

  const scheduleScrollToMessage = useCallback((messageId: string) => {
    window.requestAnimationFrame(() => {
      if (scrollToMessageElement(messageId)) return;

      window.requestAnimationFrame(() => {
        scrollToMessageElement(messageId);
      });
    });
  }, [scrollToMessageElement]);

  const handlePinnedMessageClick = useCallback(async () => {
    if (!pinnedMessage) return;

    const found = await store.jumpToMessage(channelId, pinnedMessage.id);
    if (!found) return;

    isAtBottom.current = false;
    setShowScrollToLatest(true);
    scheduleScrollToMessage(pinnedMessage.id);
  }, [channelId, pinnedMessage, scheduleScrollToMessage, store]);

  const handleScrollToLatest = useCallback(() => {
    clearMessageHighlight();
    isAtBottom.current = true;
    setShowScrollToLatest(false);
    setHasNewLatestMessage(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [clearMessageHighlight]);

  const updateScrollToLatestPosition = useCallback(() => {
    const composerLaneElement = composerLaneRef.current;
    if (!composerLaneElement) return;

    setScrollToLatestPosition(resolveScrollToLatestPosition(composerLaneElement));
  }, []);

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

  const syncBottomStateEffect = useCallback(() => {
    void messageCount;
    syncBottomState(scrollRef.current);
  }, [messageCount, syncBottomState]);

  const scrollToLatestPositionEffect = useCallback(() => {
    updateScrollToLatestPosition();

    const composerLaneElement = composerLaneRef.current;
    if (!composerLaneElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updateScrollToLatestPosition();
    });
    resizeObserver.observe(composerLaneElement);
    window.addEventListener("resize", updateScrollToLatestPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollToLatestPosition);
    };
  }, [updateScrollToLatestPosition]);

  const cleanupHighlightTimeoutEffect = useCallback(() => {
    return clearMessageHighlight;
  }, [clearMessageHighlight]);

  const latestMessageNotificationEffect = useCallback(() => {
    if (latestMessageId === null) {
      latestMessageIdRef.current = null;
      setHasNewLatestMessage(false);
      return;
    }

    const previousLatestMessageId = latestMessageIdRef.current;
    latestMessageIdRef.current = latestMessageId;

    if (!previousLatestMessageId) return;
    if (previousLatestMessageId === latestMessageId) return;
    if (isAtBottom.current) {
      setHasNewLatestMessage(false);
      return;
    }

    setShowScrollToLatest(true);
    setHasNewLatestMessage(true);
  }, [latestMessageId]);

  const scrollToLatestButtonStyle = useMemo<CSSProperties | undefined>(() => {
    if (!scrollToLatestPosition) return undefined;

    return {
      bottom: `${scrollToLatestPosition.bottom}px`,
      right: `${scrollToLatestPosition.right}px`,
    };
  }, [scrollToLatestPosition]);

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
  useEffect(syncBottomStateEffect, [syncBottomStateEffect]);
  useEffect(scrollToLatestPositionEffect, [scrollToLatestPositionEffect]);
  useEffect(cleanupHighlightTimeoutEffect, [cleanupHighlightTimeoutEffect]);
  useEffect(latestMessageNotificationEffect, [latestMessageNotificationEffect]);

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
            <PinnedMessageBanner message={pinnedMessage} onClick={handlePinnedMessageClick} />
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {showScrollToLatest && scrollToLatestButtonStyle && (
          <div className="pointer-events-none fixed z-20" style={scrollToLatestButtonStyle}>
            <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleScrollToLatest}
                  aria-label={scrollToLatestAriaLabel}
                  className="pointer-events-auto relative flex h-[40px] w-[40px] items-center justify-center rounded-full border border-border-default bg-bg-elevated text-text-primary shadow-modal transition-colors hover:bg-bg-surface focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <ArrowDown className="h-[16px] w-[16px]" />
                  {hasNewLatestMessage && (
                    <span className="absolute right-[6px] top-[6px] h-[8px] w-[8px] rounded-full border-2 border-bg-elevated bg-primary-500" />
                  )}
                </button>
              </div>
            </div>
        )}
        {/* Keep a readable lane on wide screens while preserving the existing chat flow. */}
        <div className={`${CHAT_LANE_CLASSNAME} flex min-h-full flex-col px-[6px] py-[10px] sm:px-[12px]`}>
          {hasMoreNode}
          {messageItems}
          <div ref={bottomRef} />
        </div>
      </div>

      <div ref={composerLaneRef} className={CHAT_LANE_CLASSNAME}>
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
    <div
      id={getMessageDomId(msg.id)}
      data-message-id={msg.id}
      className="scroll-mt-[96px] rounded-[16px] transition-colors duration-700"
    >
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
    </div>
  );
}

function PinnedMessageBanner({ message, onClick }: { message: FullMessage; onClick: () => void }) {
  const previewText = resolvePinnedPreviewText(message);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-start gap-[8px] rounded-[10px] border border-primary-200 bg-primary-50/70 px-[10px] py-[8px] text-left transition-colors hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
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
    </button>
  );
}
