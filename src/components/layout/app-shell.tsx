"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SettingsShell } from "./settings-shell";
import { ChatProvider, useChatPanel } from "@/components/chat/chat-context";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatFab } from "@/components/chat/chat-fab";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

const SETTINGS_ROUTES = ["/profil", "/parametres"];

function MainArea({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isOpen: chatOpen } = useChatPanel();
  const pathname = usePathname();

  const isSettingsRoute = SETTINGS_ROUTES.some((r) => pathname.startsWith(r));
  const isChatRoute = pathname.startsWith("/chat");

  // Chat full-screen: no sidebar, no header, just the chat page
  if (isChatRoute) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg-elevated">
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
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-[16px] lg:p-[32px]">
          <div
            className={cn(
              "mx-auto transition-[max-width,margin] duration-300",
              chatOpen ? "max-w-full sm:mr-[400px]" : "max-w-5xl"
            )}
          >
            {!isSettingsRoute && children}
          </div>
        </main>
      </div>
      <ChatPanel userId={profile.id} />
      <ChatFab />

      {/* Discord-style settings overlay */}
      {isSettingsRoute && (
        <SettingsShell>{children}</SettingsShell>
      )}
    </div>
  );
}

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <ChatProvider>
      <MainArea profile={profile}>{children}</MainArea>
    </ChatProvider>
  );
}
