"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { writePresenceHeartbeat } from "@/lib/presence";

type PresencePayload = {
  user_id?: unknown;
  online_at?: unknown;
};

type PresenceState = Record<string, PresencePayload[]>;

type PresenceStore = {
  getSnapshot: () => number;
  isOnline: (memberId: string | null) => boolean;
  subscribe: (listener: () => void) => () => void;
};

const HEARTBEAT_INTERVAL_MS = 60_000;
const MIN_VISIBLE_HEARTBEAT_MS = 60_000;
const PRESENCE_CHANNEL = "presence:members";
const PresenceContext = createContext<PresenceStore | null>(null);
const EMPTY_PRESENCE_STORE: PresenceStore = {
  getSnapshot: () => 0,
  isOnline: () => false,
  subscribe: () => {
    return () => {};
  },
};

const ignorePresenceError = () => {};

function getOnlineMemberIds(state: PresenceState) {
  const onlineIds = new Set<string>();

  Object.values(state).forEach((payloads) => {
    payloads.forEach((payload) => {
      if (typeof payload.user_id === "string") {
        onlineIds.add(payload.user_id);
      }
    });
  });

  return onlineIds;
}

export function PresenceProvider({ currentUserId, children }: { currentUserId: string; children: ReactNode }) {
  const supabaseRef = useRef(createClient());
  const onlineIdsRef = useRef(new Set<string>());
  const listenersRef = useRef(new Set<() => void>());
  const versionRef = useRef(0);
  const lastHeartbeatAtRef = useRef(0);

  const notifyPresenceListeners = useCallback(() => {
    versionRef.current += 1;
    listenersRef.current.forEach((listener) => {
      listener();
    });
  }, []);

  const updateOnlineIds = useCallback((state: PresenceState) => {
    onlineIdsRef.current = getOnlineMemberIds(state);
    notifyPresenceListeners();
  }, [notifyPresenceListeners]);

  const sendHeartbeat = useCallback(async () => {
    lastHeartbeatAtRef.current = Date.now();
    try {
      await writePresenceHeartbeat(supabaseRef.current, currentUserId);
    } catch {
      // Presence is best-effort and must not interrupt the app shell.
    }
  }, [currentUserId]);

  const getSnapshot = useCallback(() => versionRef.current, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const isOnline = useCallback((memberId: string | null) => {
    return !!memberId && onlineIdsRef.current.has(memberId);
  }, []);

  const contextValue = useMemo(() => {
    return {
      getSnapshot,
      isOnline,
      subscribe,
    };
  }, [getSnapshot, isOnline, subscribe]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        private: true,
        presence: {
          key: currentUserId,
        },
      },
    });

    const handlePresenceSync = () => {
      updateOnlineIds(channel.presenceState() as PresenceState);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastHeartbeatAtRef.current < MIN_VISIBLE_HEARTBEAT_MS) return;

      void sendHeartbeat();
    };

    const handleSubscribeStatus = (status: string) => {
      if (status !== "SUBSCRIBED") return;

      void channel.track({
        user_id: currentUserId,
        online_at: new Date().toISOString(),
      }).catch(ignorePresenceError);
      void sendHeartbeat();
    };

    const handleHeartbeatInterval = () => {
      if (document.visibilityState === "hidden") return;

      void sendHeartbeat();
    };

    channel
      .on("presence", { event: "sync" }, handlePresenceSync)
      .subscribe(handleSubscribeStatus);

    const heartbeatInterval = window.setInterval(handleHeartbeatInterval, HEARTBEAT_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void channel.untrack().catch(ignorePresenceError);
      void supabase.removeChannel(channel).catch(ignorePresenceError);
      onlineIdsRef.current = new Set<string>();
      notifyPresenceListeners();
    };
  }, [currentUserId, notifyPresenceListeners, sendHeartbeat, updateOnlineIds]);

  return (
    <PresenceContext.Provider value={contextValue}>
      {children}
    </PresenceContext.Provider>
  );
}

export function useIsMemberOnline(memberId: string | null) {
  const context = useContext(PresenceContext);
  const store = context ?? EMPTY_PRESENCE_STORE;

  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return store.isOnline(memberId);
}
