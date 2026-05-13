"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/notifications/notification-provider";

interface NotificationEntryProps {
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function NotificationEntry({ compact = false, className, onNavigate }: NotificationEntryProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const isActive = pathname.startsWith("/notifications");
  const hasUnread = unreadCount > 0;
  const unreadText = unreadCount > 99 ? "99+" : `${unreadCount}`;

  const handleNavigate = useCallback(() => {
    if (onNavigate) {
      onNavigate();
    }
  }, [onNavigate]);

  if (compact) {
    return (
      <Link
        href="/notifications"
        onClick={handleNavigate}
        title="Notifications"
        aria-label="Notifications"
        className={cn(
          "relative flex h-[34px] w-[34px] items-center justify-center rounded-md transition-colors",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-muted hover:bg-bg-surface hover:text-text-primary",
          className
        )}
      >
        <Bell className="h-[16px] w-[16px]" />
        {hasUnread && (
          <span className="absolute -right-[3px] -top-[3px] min-w-[16px] h-[16px] px-[4px] rounded-full bg-error text-white text-[10px] leading-[16px] font-bold text-center">
            {unreadText}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/notifications"
      onClick={handleNavigate}
      title="Notifications"
      className={cn(
        "flex items-center gap-[10px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium transition-all duration-150",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
        className
      )}
    >
      <Bell className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">Notifications</span>
      {hasUnread && (
        <span className="ml-auto h-[18px] min-w-[18px] px-[4px] rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {unreadText}
        </span>
      )}
    </Link>
  );
}
