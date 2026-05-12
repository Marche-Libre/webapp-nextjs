"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types/database";

// ─── Types ───

export type FullMessage = Message & {
  author: { x_handle: string; full_name: string; avatar_url: string | null };
  /** Only set on optimistic messages — "sending" | "failed" */
  _status?: "sending" | "failed";
};

type ReactionEntry = { emoji: string; count: number; hasReacted: boolean };
export type ReactionMap = Record<string, ReactionEntry[]>;

type ChannelState = {
  messages: FullMessage[];
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
  reactions: {},
  hasMore: true,
  loaded: false,
};

// ─── Store (singleton, lives outside React) ───

function createChatStore(userId: string) {
  let state: StoreState = {
    channels: {},
    activePanel: { isOpen: false, slug: "general" },
  };

  const listeners = new Set<() => void>();
  const channelListeners = new Map<string, Set<() => void>>();
  const subscriptions = new Map<string, ReturnType<ReturnType<typeof createClient>["channel"]>>();
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
          const { data } = await supabase
            .from("messages")
            .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setChannel(channelId, (prev) => {
              const withoutOptimistic = prev.messages.filter((m) => {
                if (!m.id.startsWith("optimistic-")) return true;
                return !(m.content === (data as FullMessage).content && m.author_id === (data as FullMessage).author_id);
              });
              if (withoutOptimistic.find((m) => m.id === (data as FullMessage).id)) return { ...prev, messages: withoutOptimistic };
              return { ...prev, messages: [...withoutOptimistic, data as FullMessage] };
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setChannel(channelId, (prev) => ({
              ...prev,
              messages: prev.messages.map((m) => m.id === (data as FullMessage).id ? data as FullMessage : m),
            }));
          }
        }
      )
      .subscribe();

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
      .subscribe();

    subscriptions.set(channelId, msgChannel);
    subscriptions.set(`reactions:${channelId}`, reactChannel);
  }

  // ─── Public actions ───

  // Seed channel with server-fetched messages (no client fetch needed)
  function seedChannel(channelId: string, messages: FullMessage[]) {
    const ch = getChannel(channelId);
    if (ch.loaded) return; // Already loaded
    setChannel(channelId, () => ({
      messages,
      reactions: {},
      hasMore: messages.length >= 50,
      loaded: true,
    }));
    subscribeToChannel(channelId);
    setTimeout(() => fetchReactions(channelId), 100);
  }

  async function loadChannel(channelId: string, forceRefresh = false) {
    const ch = getChannel(channelId);
    if (ch.loaded && !forceRefresh) return; // Already cached

    const { data } = await supabase
      .from("messages")
      .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(50);

    const ordered = ((data || []) as FullMessage[]).reverse();

    setChannel(channelId, () => ({
      messages: ordered,
      reactions: {},
      hasMore: (data?.length || 0) >= 50,
      loaded: true,
    }));

    subscribeToChannel(channelId);
    // Fetch reactions after messages are set
    setTimeout(() => fetchReactions(channelId), 100);
  }

  async function loadOlderMessages(channelId: string) {
    const ch = getChannel(channelId);
    if (!ch.hasMore || ch.messages.length === 0) return;

    const oldest = ch.messages[0];
    const { data } = await supabase
      .from("messages")
      .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
      .eq("channel_id", channelId)
      .lt("created_at", oldest.created_at)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      setChannel(channelId, (prev) => ({
        ...prev,
        messages: [...(data as FullMessage[]).reverse(), ...prev.messages],
        hasMore: data.length >= 50,
      }));
      // Fetch reactions for new messages
      const newIds = data.map((m) => m.id);
      const newAuthorIds = new Map((data as FullMessage[]).map((m) => [m.id, m.author_id]));
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

  function addOptimisticMessage(channelId: string, content: string, userProfile: { x_handle: string; full_name: string; avatar_url: string | null }, imageUrl?: string): string {
    const id = `optimistic-${Date.now()}`;
    const optimistic = {
      id,
      channel_id: channelId,
      author_id: userId,
      content,
      image_url: imageUrl || null,
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
    const { data } = await supabase
      .from("messages")
      .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
      .eq("id", messageId)
      .single();

    if (data) {
      setChannel(channelId, (prev) => ({
        ...prev,
        messages: prev.messages.map((m) => m.id === messageId ? data as FullMessage : m),
      }));
    }
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
    subscriptions.clear();
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
    loadOlderMessages,
    addOptimisticMessage,
    markMessageFailed,
    confirmMessage,
    removeOptimistic,
    toggleReaction,
    refreshMessage,
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
