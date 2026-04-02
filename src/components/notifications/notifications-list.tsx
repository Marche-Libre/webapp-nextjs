"use client";

import { useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types/database";

interface NotificationsListProps {
  initialNotifications: Notification[];
  userId: string;
}

const notifIcon = (type: string) => {
  if (type === "chat_mention") return "💬";
  if (type === "forum_mention") return "📢";
  if (type === "forum_reply") return "↩️";
  return "🔔";
};

const notifLabel = (type: string) => {
  if (type === "chat_mention") return "Mention chat";
  if (type === "forum_mention") return "Mention forum";
  if (type === "forum_reply") return "Réponse forum";
  return "Notification";
};

export function NotificationsList({ initialNotifications, userId }: NotificationsListProps) {
  const [activeTab, setActiveTab] = useState("unread");
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.is_read);
  const displayed = activeTab === "unread" ? unread : notifications;

  const tabs = [
    { label: "Non lues", value: "unread", count: unread.length },
    { label: "Toutes", value: "all", count: notifications.length },
  ];

  const markAsRead = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = (notif: Notification) => {
    if (notif.link) router.push(notif.link);
  };

  return (
    <div className="bg-bg-base rounded-xl shadow-card overflow-hidden">
      <div className="flex items-end">
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="flex-1 rounded-t-xl" />
        {unread.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[12px] text-primary-600 hover:text-primary-700 font-medium cursor-pointer whitespace-nowrap px-[16px] py-[12px] border-b border-border-default bg-bg-elevated/50"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="p-[24px]">
        {displayed.length > 0 ? (
          <div className="space-y-[8px]">
            {displayed.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "group relative p-[16px] rounded-lg border transition-all duration-150",
                  notif.link && "cursor-pointer",
                  notif.is_read
                    ? "border-border-default bg-bg-elevated/30 hover:border-border-strong"
                    : "border-primary-200 bg-primary-50/20 hover:border-primary-300"
                )}
              >
                <div className="flex items-start gap-[12px]">
                  <span className="text-[18px] mt-[1px] shrink-0">{notifIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <p className={cn(
                        "text-[13px] text-text-primary",
                        !notif.is_read && "font-semibold"
                      )}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="h-[7px] w-[7px] rounded-full bg-primary-500 shrink-0" />
                      )}
                    </div>
                    {notif.body && (
                      <p className="text-[12px] text-text-muted mt-[4px] line-clamp-2">
                        {notif.body}
                      </p>
                    )}
                    <div className="flex items-center gap-[8px] mt-[6px]">
                      <span className="text-[11px] text-text-muted">
                        {notifLabel(notif.type)}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {formatDate(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-[4px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => markAsRead(e, notif.id)}
                        className="p-[6px] rounded-md hover:bg-bg-surface text-text-muted hover:text-success cursor-pointer transition-colors"
                        title="Marquer comme lu"
                      >
                        <Check className="h-[14px] w-[14px]" />
                      </button>
                    )}
                    {notif.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(notif.link!);
                        }}
                        className="p-[6px] rounded-md hover:bg-bg-surface text-text-muted hover:text-primary-600 cursor-pointer transition-colors"
                        title="Voir"
                      >
                        <ExternalLink className="h-[14px] w-[14px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="h-[24px] w-[24px] text-text-muted" />}
            title={activeTab === "unread" ? "Aucune notification non lue" : "Aucune notification"}
            description="Vous serez notifié quand quelqu'un vous mentionne dans le chat ou sur le forum."
          />
        )}
      </div>
    </div>
  );
}
