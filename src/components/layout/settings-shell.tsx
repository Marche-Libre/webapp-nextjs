"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bell, LogOut, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { useNotifications } from "@/components/notifications/notification-provider";
import { createClient } from "@/lib/supabase/client";
import { AppInstallUpdatePanel } from "@/components/runtime/app-install-update-panel";
import type { Profile } from "@/lib/types/database";

const settingsNav = [
  { label: "Mon profil", href: "/profil", icon: User },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Parrainages", href: "/parrainages", icon: UserPlus },
];

const WIDE_CONTENT_ROUTES = ["/notifications"];

interface SettingsShellProps {
  profile: Profile;
  children: React.ReactNode;
}

type SettingsNavItem = (typeof settingsNav)[number];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsShell({ profile, children }: SettingsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const close = useCallback(() => {
    router.push("/chat");
  }, [router]);
  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  }, [router]);
  const unreadText = unreadCount > 99 ? "99+" : `${unreadCount}`;
  const isWideContentRoute = useMemo(() => {
    return WIDE_CONTENT_ROUTES.some((route) => pathname.startsWith(route));
  }, [pathname]);
  const profileDisplayName = useMemo(() => {
    return profile.full_name || `@${profile.x_handle}`;
  }, [profile.full_name, profile.x_handle]);
  const shouldShowHandle = useMemo(() => {
    if (!profile.full_name) return false;
    return profile.full_name.toLowerCase() !== profile.x_handle.toLowerCase();
  }, [profile.full_name, profile.x_handle]);

  const renderDesktopNavItem = useCallback((item: SettingsNavItem) => {
    const isActive = isActiveRoute(pathname, item.href);
    const showUnreadBadge = item.href === "/notifications" && unreadCount > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-[10px] px-[12px] py-[8px] rounded-lg text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
        )}
      >
        <item.icon className="h-[18px] w-[18px]" />
        <span className="truncate">{item.label}</span>
        {showUnreadBadge && (
          <span className="ml-auto h-[18px] min-w-[18px] px-[4px] rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {unreadText}
          </span>
        )}
      </Link>
    );
  }, [pathname, unreadCount, unreadText]);

  const renderMobileNavItem = useCallback((item: SettingsNavItem) => {
    const isActive = isActiveRoute(pathname, item.href);
    const showUnreadBadge = item.href === "/notifications" && unreadCount > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-[10px] px-[12px] py-[10px] rounded-lg text-[13px] font-medium transition-colors",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
        )}
      >
        <item.icon className="h-[16px] w-[16px] shrink-0" />
        <span className="truncate">{item.label}</span>
        {showUnreadBadge && (
          <span className="ml-auto h-[16px] min-w-[16px] px-[4px] rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {unreadText}
          </span>
        )}
      </Link>
    );
  }, [pathname, unreadCount, unreadText]);
  const desktopNavItems = useMemo(() => settingsNav.map(renderDesktopNavItem), [renderDesktopNavItem]);
  const mobileNavItems = useMemo(() => settingsNav.map(renderMobileNavItem), [renderMobileNavItem]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60] flex bg-bg-elevated">
      {/* Left nav */}
      <div className="hidden sm:flex w-[240px] shrink-0 flex-col border-r border-border-default bg-bg-base">
        <div className="flex flex-1 flex-col overflow-y-auto px-[12px] py-[16px]">
          <button
            onClick={close}
            className="flex items-center gap-[8px] px-[12px] py-[8px] mb-[12px] rounded-lg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer w-full"
          >
            <ArrowLeft className="h-[16px] w-[16px]" />
            Retour
          </button>
          <p className="px-[12px] mb-[8px] text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Réglages utilisateur
          </p>
          {desktopNavItems}
          <div className="mt-auto pt-[24px]">
            <AppInstallUpdatePanel />
          </div>
        </div>
        <div className="shrink-0 p-[12px] border-t border-border-subtle">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-lg text-[13px] font-medium text-error hover:bg-error-bg transition-colors cursor-pointer w-full"
          >
            <LogOut className="h-[16px] w-[16px]" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile: vertical account surface */}
        <div className="sm:hidden shrink-0 border-b border-border-subtle bg-bg-base">
          <div className="space-y-[12px] px-[16px] py-[12px]">
            <div className="flex items-center gap-[8px]">
              <button
                onClick={close}
                className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
                aria-label="Retour au chat"
              >
                <ArrowLeft className="h-[18px] w-[18px]" />
              </button>
              <p className="text-[14px] font-semibold text-text-primary">Compte</p>
            </div>

            <div className="flex items-center gap-[10px] rounded-lg border border-border-default bg-bg-elevated/50 px-[10px] py-[8px]">
              <Avatar src={profile.avatar_url} name={profile.x_handle} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-primary">
                  {profileDisplayName}
                </p>
                {shouldShowHandle && (
                  <p className="truncate text-[11px] text-text-muted">@{profile.x_handle}</p>
                )}
              </div>
            </div>

            <AppInstallUpdatePanel variant="priority" hideWhenIdle />

            <nav className="space-y-[6px]">
              {mobileNavItems}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-[10px] rounded-lg px-[12px] py-[10px] text-[13px] font-medium text-error transition-colors hover:bg-error-bg cursor-pointer"
            >
              <LogOut className="h-[16px] w-[16px]" />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-[16px] sm:p-[32px] lg:p-[48px]">
          <div className={cn("mx-auto", isWideContentRoute ? "max-w-5xl" : "max-w-2xl")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
