"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ChatChannelContextType {
  activeSlug: string;
  setActiveSlug: (slug: string) => void;
}

const ChatChannelContext = createContext<ChatChannelContextType>({
  activeSlug: "general",
  setActiveSlug: () => {},
});

export function ChatChannelProvider({ initialSlug, children }: { initialSlug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract slug from URL: /chat/business → "business", /chat → initialSlug
  const activeSlug = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]?.split("/")[0] || initialSlug
    : initialSlug;

  const setActiveSlug = useCallback((slug: string) => {
    router.replace(`/chat/${encodeURIComponent(slug)}`, { scroll: false });
  }, [router]);

  const value = useMemo(() => {
    return { activeSlug, setActiveSlug };
  }, [activeSlug, setActiveSlug]);

  return (
    <ChatChannelContext value={value}>
      {children}
    </ChatChannelContext>
  );
}

export function useActiveChannel() {
  return useContext(ChatChannelContext);
}
