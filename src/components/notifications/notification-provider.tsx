"use client";

import { createContext, useContext, useCallback, useEffect, useState, useRef, type MouseEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types/database";

// ─── Toast notification (animated) ───

interface Toast {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string;
  channelName?: string;
  actorHandle?: string;
  fadingOut?: boolean;
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  onOpen: (toast: Toast) => void;
}

type NotificationRealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<Notification>;
};

function ToastNotification({ toast, onDismiss, onOpen }: ToastNotificationProps) {
  const handleOpen = useCallback(() => {
    onOpen(toast);
  }, [onOpen, toast]);

  const handleDismiss = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "group relative rounded-xl p-4 flex items-start gap-3 w-80 cursor-pointer transition-all duration-500 ease-out transform hover:scale-[1.02]",
        "bg-base-100/90 backdrop-blur-xl border border-base-content/10 shadow-2xl",
        toast.fadingOut ? "animate-[notification-exit_400ms_ease-out_forwards]" : "animate-[notification-enter_400ms_ease-out_forwards]"
      )}
      onClick={handleOpen}
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-accent" />

      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-base-content truncate">
            {toast.title}
          </h3>
          {toast.channelName && (
            <span className="text-[10px] text-base-content/40 font-mono ml-2 shrink-0">
              #{toast.channelName}
            </span>
          )}
        </div>
        {toast.body && (
          <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed mt-0.5">
            {toast.body}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-0.5 text-base-content/30 hover:text-base-content/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Context ───

interface NotificationContextType {
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

// ─── Provider ───

export function NotificationProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabaseRef = useRef(createClient());

  const fetchUnreadCount = useCallback(async () => {
    const { count } = await supabaseRef.current
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return count || 0;
  }, [userId]);

  // Fetch initial unread count
  useEffect(() => {
    let isMounted = true;
    void fetchUnreadCount().then((nextCount) => {
      if (isMounted) {
        setUnreadCount(nextCount);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchUnreadCount]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, fadingOut: true } : toast))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 400);
  }, []);

  const handleToastClick = useCallback((toast: Toast) => {
    dismissToast(toast.id);
    if (toast.link) {
      window.location.href = toast.link;
    }
  }, [dismissToast]);

  const handleNotificationChange = useCallback(async (payload: NotificationRealtimePayload) => {
    if (payload.eventType !== "INSERT") {
      const nextCount = await fetchUnreadCount();
      setUnreadCount(nextCount);
      return;
    }

    const notif = payload.new as Notification;

    if (!notif.is_read) {
      setUnreadCount((prev) => prev + 1);
    }

    let channelName: string | undefined;
    if (notif.link?.includes("channel=")) {
      const channelId = notif.link.split("channel=")[1];
      if (channelId) {
        const { data } = await supabaseRef.current
          .from("channels")
          .select("name")
          .eq("id", channelId)
          .single();
        channelName = data?.name || undefined;
      }
    }

    const toast: Toast = {
      id: notif.id,
      title: notif.title,
      body: notif.body,
      link: notif.link,
      type: notif.type,
      channelName,
    };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((currentToast) =>
          currentToast.id === toast.id ? { ...currentToast, fadingOut: true } : currentToast
        )
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((currentToast) => currentToast.id !== toast.id));
      }, 400);
    }, 5000);
  }, [fetchUnreadCount]);

  // Subscribe to new notifications in real-time
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        handleNotificationChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNotificationChange, userId]);

  const markAsRead = useCallback(async (id: string) => {
    await supabaseRef.current
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await supabaseRef.current
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(0);
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead, markAllAsRead }}>
      {children}

      {/* Toast container — top right */}
      {toasts.length > 0 && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes notification-enter {
              from { opacity: 0; transform: translateX(20px) scale(0.95); filter: blur(4px); }
              to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
            }
            @keyframes notification-exit {
              from { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
              to { opacity: 0; transform: translateX(20px) scale(0.95); filter: blur(4px); }
            }
          `}} />
          <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
            {toasts.map((toast) => (
              <ToastNotification
                key={toast.id}
                toast={toast}
                onDismiss={dismissToast}
                onOpen={handleToastClick}
              />
            ))}
          </div>
        </>
      )}
    </NotificationContext.Provider>
  );
}
