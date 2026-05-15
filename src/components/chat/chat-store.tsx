"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MESSAGE_WITH_AUTHOR_SELECT,
  attachReplyTargets,
  collectReplyToMessageIds,
  mapMessageRowToMessageWithAuthor,
  mapMessageRowsToMessagesWithAuthor,
  projectReplyTarget,
  type MessageRow,
  type MessageWithAuthor,
  type ReplyToMessage,
} from "@/lib/chat/messages";

// ─── Types ───

export type FullMessage = MessageWithAuthor & {
  /** Only set on optimistic messages — "sending" | "failed" */
  _status?: "sending" | "failed";
};

type ReactionEntry = { emoji: string; count: number; hasReacted: boolean };
export type ReactionMap = Record<string, ReactionEntry[]>;

type ChannelState = {
  messages: FullMessage[];
  pinnedMessage: FullMessage | null;
  reactions: ReactionMap;
  hasMore: boolean;
  loaded: boolean;
};

type StoreState = {
  channels: Record<string, ChannelState>;
  activePanel: { isOpen: boolean; slug: string };
};

const EMPTY_CHANNEL_STATE: ChannelState = {
  messages: [],
  pinnedMessage: null,
  reactions: {},
  hasMore: true,
  loaded: false,
};

const CHANNEL_SYNC_INTERVAL_MS = 5000;
const MESSAGE_JUMP_CONTEXT_LIMIT = 25;

// ─── Store (singleton, lives outside React) ───

function createChatStore(userId: string) {
  let state: StoreState = {
    channels: {},
    activePanel: { isOpen: false, slug: "general" },
  };

  const listeners = new Set<() => void>();
  const channelListeners = new Map<string, Set<() => void>>();
  const subscriptions = new Map<string, ReturnType<ReturnType<typeof createClient>["channel"]>>();
  const channelWatchCounts = new Map<string, number>();
  const channelSyncIntervals = new Map<string, ReturnType<typeof setInterval>>();
  const supabase = createClient();

  function emit() {
    // Create new ref so useSyncExternalStore detects changes
    state = { ...state };
    listeners.forEach((l) => l());
  }

  function getState() {
    return state;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function subscribeChannel(channelId: string, listener: () => void) {
    const channelSet = channelListeners.get(channelId) ?? new Set<() => void>();
    channelSet.add(listener);
    channelListeners.set(channelId, channelSet);

    return () => {
      channelSet.delete(listener);
      if (channelSet.size === 0) channelListeners.delete(channelId);
    };
  }

  function emitChannel(channelId: string) {
    const channelSet = channelListeners.get(channelId);
    if (!channelSet) return;
    channelSet.forEach((listener) => listener());
  }

  function getChannel(channelId: string): ChannelState {
    return state.channels[channelId] || EMPTY_CHANNEL_STATE;
  }

  function setChannel(channelId: string, updater: (prev: ChannelState) => ChannelState) {
    state = {
      ...state,
      channels: {
        ...state.channels,
        [channelId]: updater(getChannel(channelId)),
      },
    };
    emitChannel(channelId);
    emit();
  }

  // ─── Fetch reactions for a channel ───

  async function fetchReactions(channelId: string) {
    const ch = getChannel(channelId);
    const ids = ch.messages.filter((m) => !m.id.startsWith("optimistic-")).map((m) => m.id);
    if (ids.length === 0) return;
    const messageAuthorIds = new Map(ch.messages.map((m) => [m.id, m.author_id]));

    const { data } = await supabase
      .from("message_reactions")
      .select("message_id, user_id, emoji")
      .in("message_id", ids);

    if (!data) return;

    const map: ReactionMap = {};
    for (const r of data) {
      if (messageAuthorIds.get(r.message_id) === r.user_id) continue;
      if (!map[r.message_id]) map[r.message_id] = [];
      const existing = map[r.message_id].find((e) => e.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === userId) existing.hasReacted = true;
      } else {
        map[r.message_id].push({ emoji: r.emoji, count: 1, hasReacted: r.user_id === userId });
      }
    }

    setChannel(channelId, (prev) => ({ ...prev, reactions: map }));
  }

  async function fetchMessage(messageId: string) {
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .eq("id", messageId)
      .single();

    if (!data) return null;

    const message = mapMessageRowToMessageWithAuthor(data as MessageRow) as FullMessage;
    const hydratedMessages = await hydrateReplyTargets([message]);

    return hydratedMessages[0] ?? message;
  }

  async function hydrateReplyTargets(messages: FullMessage[]) {
    const replyToMessageIds = collectReplyToMessageIds(messages);
    if (replyToMessageIds.length === 0) return messages;

    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .in("id", replyToMessageIds);

    if (!data || data.length === 0) return messages;

    const replyTargets = mapMessageRowsToMessagesWithAuthor(data as MessageRow[]).map(projectReplyTarget);

    return attachReplyTargets(messages, replyTargets) as FullMessage[];
  }

  async function fetchPinnedMessage(channelId: string) {
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .eq("channel_id", channelId)
      .eq("is_pinned", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;

    const message = mapMessageRowToMessageWithAuthor(data as MessageRow) as FullMessage;
    const hydratedMessages = await hydrateReplyTargets([message]);

    return hydratedMessages[0] ?? message;
  }

  async function refreshPinnedMessage(channelId: string) {
    const pinnedMessage = await fetchPinnedMessage(channelId);

    setChannel(channelId, (prev) => ({
      ...prev,
      pinnedMessage,
    }));
  }

  async function syncLatestMessages(channelId: string) {
    const ch = getChannel(channelId);
    if (!ch.loaded) return;

    const latestMessage = getLatestPersistedMessage(ch.messages);
    if (!latestMessage) {
      if (hasPendingOptimisticMessage(ch.messages)) return;
      await loadChannel(channelId, true);
      return;
    }

    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .eq("channel_id", channelId)
      .gt("created_at", latestMessage.created_at)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!data || data.length === 0) return;

    const latestMessages = await hydrateReplyTargets(mapMessageRowsToMessagesWithAuthor(data as MessageRow[]) as FullMessage[]);
    setChannel(channelId, (prev) => ({
      ...prev,
      messages: mergeMessages(prev.messages, latestMessages),
    }));
    void fetchReactions(channelId);
  }

  // ─── Subscribe to realtime for a channel ───

  function subscribeToChannel(channelId: string) {
    if (subscriptions.has(channelId)) return;

    // Messages subscription
    const msgChannel = supabase
      .channel(`room:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const messageId = typeof payload.new.id === "string" ? payload.new.id : null;
          if (!messageId) return;
          const data = await fetchMessage(messageId);

          if (data) {
            setChannel(channelId, (prev) => {
              return {
                ...prev,
                messages: mergeMessages(prev.messages, [data]),
                pinnedMessage: data.is_pinned ? data : prev.pinnedMessage,
              };
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const messageId = typeof payload.new.id === "string" ? payload.new.id : null;
          if (!messageId) return;
          const data = await fetchMessage(messageId);

          if (data) {
            setChannel(channelId, (prev) => ({
              ...prev,
              messages: prev.messages.map((m) => m.id === data.id ? data : m),
              pinnedMessage: resolveUpdatedPinnedMessage(prev.pinnedMessage, data),
            }));
          }
        }
      )
      .subscribe((status, error) => {
        if (status === "SUBSCRIBED") {
          void syncLatestMessages(channelId);
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.warn("Chat realtime subscription issue", { channelId, status, error });
          void syncLatestMessages(channelId);
        }
      });

    // Reactions subscription
    const reactChannel = supabase
      .channel(`reactions:${channelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, (payload) => {
        const messageId = getReactionMessageId(payload);
        if (!messageId) return;
        const hasMessage = getChannel(channelId).messages.some((message) => message.id === messageId);
        if (!hasMessage) return;
        void fetchReactions(channelId);
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.warn("Chat reactions realtime subscription issue", { channelId, status, error });
        }
      });

    subscriptions.set(channelId, msgChannel);
    subscriptions.set(`reactions:${channelId}`, reactChannel);
  }

  function watchChannel(channelId: string) {
    const watchCount = channelWatchCounts.get(channelId) ?? 0;
    channelWatchCounts.set(channelId, watchCount + 1);
    subscribeToChannel(channelId);
    startChannelSync(channelId);
    void syncLatestMessages(channelId);

    return () => {
      const nextCount = (channelWatchCounts.get(channelId) ?? 1) - 1;
      if (nextCount > 0) {
        channelWatchCounts.set(channelId, nextCount);
        return;
      }

      channelWatchCounts.delete(channelId);
      stopChannelSync(channelId);
    };
  }

  function startChannelSync(channelId: string) {
    if (channelSyncIntervals.has(channelId)) return;

    const interval = setInterval(() => {
      void syncLatestMessages(channelId);
    }, CHANNEL_SYNC_INTERVAL_MS);
    channelSyncIntervals.set(channelId, interval);
  }

  function stopChannelSync(channelId: string) {
    const interval = channelSyncIntervals.get(channelId);
    if (!interval) return;

    clearInterval(interval);
    channelSyncIntervals.delete(channelId);
  }

  // ─── Public actions ───

  // Seed channel with server-fetched messages (no client fetch needed)
  function seedChannel(channelId: string, messages: FullMessage[]) {
    const ch = getChannel(channelId);
    if (ch.loaded) return; // Already loaded
    setChannel(channelId, () => ({
      messages,
      pinnedMessage: getPinnedMessageFromMessages(messages),
      reactions: {},
      hasMore: messages.length >= 50,
      loaded: true,
    }));
    subscribeToChannel(channelId);
    setTimeout(() => fetchReactions(channelId), 100);
    void refreshPinnedMessage(channelId);
  }

  async function loadChannel(channelId: string, forceRefresh = false) {
    const ch = getChannel(channelId);
    if (ch.loaded && !forceRefresh) return; // Already cached

    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(50);

    const ordered = await hydrateReplyTargets(
      mapMessageRowsToMessagesWithAuthor((data || []) as MessageRow[]).reverse() as FullMessage[],
    );

    setChannel(channelId, () => ({
      messages: ordered,
      pinnedMessage: getPinnedMessageFromMessages(ordered),
      reactions: {},
      hasMore: (data?.length || 0) >= 50,
      loaded: true,
    }));

    subscribeToChannel(channelId);
    // Fetch reactions after messages are set
    setTimeout(() => fetchReactions(channelId), 100);
    void refreshPinnedMessage(channelId);
  }

  async function loadOlderMessages(channelId: string) {
    const ch = getChannel(channelId);
    if (!ch.hasMore || ch.messages.length === 0) return;

    const oldest = ch.messages[0];
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .eq("channel_id", channelId)
      .lt("created_at", oldest.created_at)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      const olderMessages = await hydrateReplyTargets(mapMessageRowsToMessagesWithAuthor(data as MessageRow[]) as FullMessage[]);

      setChannel(channelId, (prev) => ({
        ...prev,
        messages: [...olderMessages.reverse(), ...prev.messages],
        pinnedMessage: getPinnedMessageFromMessages(olderMessages) ?? prev.pinnedMessage,
        hasMore: data.length >= 50,
      }));
      // Fetch reactions for new messages
      const newIds = data.map((m) => m.id);
      const newAuthorIds = new Map((data as MessageRow[]).map((m) => [m.id, m.author_id]));
      const { data: rxData } = await supabase
        .from("message_reactions")
        .select("message_id, user_id, emoji")
        .in("message_id", newIds);
      if (rxData && rxData.length > 0) {
        setChannel(channelId, (prev) => {
          const updatedReactions = { ...prev.reactions };
          for (const r of rxData) {
            if (newAuthorIds.get(r.message_id) === r.user_id) continue;
            if (!updatedReactions[r.message_id]) updatedReactions[r.message_id] = [];
            const existing = updatedReactions[r.message_id].find((e) => e.emoji === r.emoji);
            if (existing) { existing.count++; if (r.user_id === userId) existing.hasReacted = true; }
            else updatedReactions[r.message_id].push({ emoji: r.emoji, count: 1, hasReacted: r.user_id === userId });
          }
          return { ...prev, reactions: updatedReactions };
        });
      }
    } else {
      setChannel(channelId, (prev) => ({ ...prev, hasMore: false }));
    }
  }

  function addOptimisticMessage(
    channelId: string,
    content: string,
    userProfile: { x_handle: string; full_name: string; avatar_url: string | null },
    imageUrl?: string,
    replyTarget?: ReplyToMessage | null,
  ): string {
    const id = `optimistic-${Date.now()}`;
    const optimistic = {
      id,
      channel_id: channelId,
      author_id: userId,
      content,
      image_url: imageUrl || null,
      reply_to_message_id: replyTarget?.id ?? null,
      reply_to: replyTarget ? projectReplyTarget(replyTarget) : null,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: userProfile,
      _status: "sending" as const,
    } as FullMessage;
    setChannel(channelId, (prev) => ({ ...prev, messages: [...prev.messages, optimistic] }));
    return id;
  }

  function markMessageFailed(channelId: string, messageId: string) {
    setChannel(channelId, (prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === messageId ? { ...m, _status: "failed" as const } : m
      ),
    }));
  }

  function removeOptimistic(channelId: string, messageId: string) {
    setChannel(channelId, (prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== messageId),
    }));
  }

  function confirmMessage(channelId: string, optimisticId: string, realMessage: FullMessage | null) {
    setChannel(channelId, (prev) => {
      if (realMessage) {
        // Replace the optimistic message with the real one
        const withoutOptimistic = prev.messages.filter((m) => m.id !== optimisticId);
        if (withoutOptimistic.find((m) => m.id === realMessage.id)) return { ...prev, messages: withoutOptimistic };
        return { ...prev, messages: [...withoutOptimistic, realMessage] };
      }
      // No real message — just clear the "sending" status
      return {
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === optimisticId ? { ...m, _status: undefined } : m
        ),
      };
    });
  }

  async function toggleReaction(channelId: string, messageId: string, emoji: string) {
    const message = getChannel(channelId).messages.find((m) => m.id === messageId);
    if (!message || message.author_id === userId || message.id.startsWith("optimistic-")) return;

    // Optimistic
    setChannel(channelId, (prev) => {
      const reactions = { ...prev.reactions };
      const msgReactions = [...(reactions[messageId] || [])];
      const idx = msgReactions.findIndex((r) => r.emoji === emoji);

      if (idx >= 0 && msgReactions[idx].hasReacted) {
        msgReactions[idx] = { ...msgReactions[idx], count: msgReactions[idx].count - 1, hasReacted: false };
        if (msgReactions[idx].count <= 0) msgReactions.splice(idx, 1);
      } else if (idx >= 0) {
        msgReactions[idx] = { ...msgReactions[idx], count: msgReactions[idx].count + 1, hasReacted: true };
      } else {
        msgReactions.push({ emoji, count: 1, hasReacted: true });
      }
      reactions[messageId] = msgReactions;
      return { ...prev, reactions };
    });

    // Persist
    const { data: existing } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("message_id", messageId)
      .eq("user_id", userId)
      .eq("emoji", emoji)
      .maybeSingle();

    if (existing) {
      await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji);
    } else {
      await supabase.from("message_reactions").insert({ message_id: messageId, user_id: userId, emoji });
    }
  }

  async function refreshMessage(channelId: string, messageId: string) {
    const data = await fetchMessage(messageId);

    if (data) {
      setChannel(channelId, (prev) => ({
        ...prev,
        messages: prev.messages.map((m) => m.id === messageId ? data : m),
        pinnedMessage: resolveUpdatedPinnedMessage(prev.pinnedMessage, data),
      }));
    }
  }

  async function jumpToMessage(channelId: string, messageId: string) {
    const ch = getChannel(channelId);
    if (ch.messages.some((message) => message.id === messageId)) return true;

    const targetMessage = await fetchMessage(messageId);
    if (!targetMessage || targetMessage.channel_id !== channelId) return false;

    const [{ data: before }, { data: after }] = await Promise.all([
      supabase
        .from("messages")
        .select(MESSAGE_WITH_AUTHOR_SELECT)
        .eq("channel_id", channelId)
        .lt("created_at", targetMessage.created_at)
        .order("created_at", { ascending: false })
        .limit(MESSAGE_JUMP_CONTEXT_LIMIT),
      supabase
        .from("messages")
        .select(MESSAGE_WITH_AUTHOR_SELECT)
        .eq("channel_id", channelId)
        .gt("created_at", targetMessage.created_at)
        .order("created_at", { ascending: true })
        .limit(MESSAGE_JUMP_CONTEXT_LIMIT),
    ]);

    const beforeMessages = await hydrateReplyTargets(mapMessageRowsToMessagesWithAuthor((before || []) as MessageRow[]) as FullMessage[]);
    const afterMessages = await hydrateReplyTargets(mapMessageRowsToMessagesWithAuthor((after || []) as MessageRow[]) as FullMessage[]);
    const windowMessages = [
      ...beforeMessages.reverse(),
      targetMessage,
      ...afterMessages,
    ];

    setChannel(channelId, (prev) => ({
      ...prev,
      messages: mergeMessages(prev.messages, windowMessages),
      pinnedMessage: targetMessage.is_pinned ? targetMessage : prev.pinnedMessage,
      loaded: true,
    }));
    void fetchReactions(channelId);

    return true;
  }

  // Panel state
  function openPanel(slug?: string) {
    state = { ...state, activePanel: { isOpen: true, slug: slug || state.activePanel.slug } };
    emit();
  }

  function closePanel() {
    state = { ...state, activePanel: { ...state.activePanel, isOpen: false } };
    emit();
  }

  function togglePanel() {
    state = { ...state, activePanel: { ...state.activePanel, isOpen: !state.activePanel.isOpen } };
    emit();
  }

  function destroy() {
    for (const channel of subscriptions.values()) {
      void supabase.removeChannel(channel);
    }
    for (const interval of channelSyncIntervals.values()) {
      clearInterval(interval);
    }
    subscriptions.clear();
    channelWatchCounts.clear();
    channelSyncIntervals.clear();
    listeners.clear();
    channelListeners.clear();
  }

  return {
    getState,
    subscribe,
    subscribeChannel,
    getChannel,
    seedChannel,
    loadChannel,
    subscribeToChannel,
    watchChannel,
    loadOlderMessages,
    addOptimisticMessage,
    markMessageFailed,
    confirmMessage,
    removeOptimistic,
    toggleReaction,
    refreshMessage,
    jumpToMessage,
    openPanel,
    closePanel,
    togglePanel,
    destroy,
  };
}

function getReactionMessageId(payload: { new?: { message_id?: unknown }; old?: { message_id?: unknown } }) {
  const messageId = payload.new?.message_id ?? payload.old?.message_id;
  return typeof messageId === "string" ? messageId : null;
}

function getLatestPersistedMessage(messages: FullMessage[]) {
  let latestMessage: FullMessage | null = null;

  for (const message of messages) {
    if (message.id.startsWith("optimistic-")) continue;
    if (!latestMessage || compareMessages(message, latestMessage) > 0) {
      latestMessage = message;
    }
  }

  return latestMessage;
}

function hasPendingOptimisticMessage(messages: FullMessage[]) {
  return messages.some((message) => message.id.startsWith("optimistic-") && message._status === "sending");
}

function getPinnedMessageFromMessages(messages: FullMessage[]) {
  for (const message of messages) {
    if (message.is_pinned) return message;
  }

  return null;
}

function resolveUpdatedPinnedMessage(currentPinnedMessage: FullMessage | null, updatedMessage: FullMessage) {
  if (updatedMessage.is_pinned) return updatedMessage;
  if (currentPinnedMessage?.id === updatedMessage.id) return null;
  return currentPinnedMessage;
}

function mergeMessages(currentMessages: FullMessage[], incomingMessages: FullMessage[]) {
  const incomingById = new Map(incomingMessages.map((message) => [message.id, message]));
  const optimisticIdsToRemove = new Set<string>();

  for (const optimisticMessage of currentMessages) {
    if (!optimisticMessage.id.startsWith("optimistic-")) continue;

    for (const incomingMessage of incomingMessages) {
      if (
        optimisticMessage.content === incomingMessage.content &&
        optimisticMessage.author_id === incomingMessage.author_id &&
        optimisticMessage.reply_to_message_id === incomingMessage.reply_to_message_id
      ) {
        optimisticIdsToRemove.add(optimisticMessage.id);
      }
    }
  }

  const mergedById = new Map<string, FullMessage>();
  for (const message of currentMessages) {
    if (optimisticIdsToRemove.has(message.id)) continue;
    mergedById.set(message.id, incomingById.get(message.id) ?? message);
  }

  for (const message of incomingMessages) {
    mergedById.set(message.id, message);
  }

  return [...mergedById.values()].sort(compareMessages);
}

function compareMessages(a: FullMessage, b: FullMessage) {
  const createdAtDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  if (createdAtDiff !== 0) return createdAtDiff;
  return a.id.localeCompare(b.id);
}

// ─── React Context ───

type ChatStoreType = ReturnType<typeof createChatStore>;

const ChatStoreContext = createContext<ChatStoreType | null>(null);

export function ChatStoreProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [store] = useState(() => createChatStore(userId));

  useEffect(() => {
    return store.destroy;
  }, [store]);

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  );
}

export function useChatStore() {
  const store = useContext(ChatStoreContext);
  if (!store) throw new Error("useChatStore must be used within ChatStoreProvider");
  return store;
}

// Hook to get reactive state
export function useChatState() {
  const store = useChatStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

// Hook to get a channel's state reactively
export function useChannelState(channelId: string) {
  const store = useChatStore();
  const subscribe = useCallback((listener: () => void) => {
    return store.subscribeChannel(channelId, listener);
  }, [channelId, store]);
  const getSnapshot = useCallback(() => {
    return store.getChannel(channelId);
  }, [channelId, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Hook for panel state
export function usePanelState() {
  const state = useChatState();
  return state.activePanel;
}
