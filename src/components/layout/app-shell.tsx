"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SettingsShell } from "./settings-shell";
import { AdminShell } from "./admin-shell";
import { ChatStoreProvider } from "@/components/chat/chat-store";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { MemberProfileDrawerProvider } from "@/components/membres/member-profile-drawer-context";
import { PresenceProvider } from "@/components/presence/presence-provider";
import type { Profile } from "@/lib/types/database";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

const SETTINGS_ROUTES = ["/profil", "/notifications", "/parrainages"];

function MainArea({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isSettingsRoute = SETTINGS_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isChatRoute = pathname.startsWith("/chat");

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => !current);
  }, []);

  // Chat full-screen: no sidebar, no header, just the chat page
  if (isChatRoute) {
    return (
      <div className="flex h-[100svh] overflow-hidden bg-bg-elevated md:h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-elevated">
      <Sidebar
        profile={profile}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={handleCloseSidebar}
        onToggleCollapse={handleToggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={handleOpenSidebar}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 overflow-y-auto p-[16px] lg:p-[32px]">
          <div className="mx-auto max-w-5xl">
            {!isSettingsRoute && !isAdminRoute && children}
          </div>
        </main>
      </div>

      {/* Discord-style settings overlay */}
      {isSettingsRoute && <SettingsShell profile={profile}>{children}</SettingsShell>}
      {isAdminRoute && (
        <AdminShell>{children}</AdminShell>
      )}
    </div>
  );
}

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <NotificationProvider userId={profile.id}>
      <ChatStoreProvider userId={profile.id}>
        <PresenceProvider currentUserId={profile.id}>
          <MemberProfileDrawerProvider>
            <MainArea profile={profile}>{children}</MainArea>
          </MemberProfileDrawerProvider>
        </PresenceProvider>
      </ChatStoreProvider>
    </NotificationProvider>
  );
}
