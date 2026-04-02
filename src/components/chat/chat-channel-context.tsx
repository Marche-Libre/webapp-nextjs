"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

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

  // Extract slug from URL: /chat/business → "business", /chat → initialSlug
  const slugFromUrl = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]?.split("/")[0] || initialSlug
    : initialSlug;

  const [activeSlug, setActiveSlugState] = useState(slugFromUrl);

  // Sync if URL changes externally (e.g. browser navigation)
  useEffect(() => {
    if (slugFromUrl !== activeSlug) {
      setActiveSlugState(slugFromUrl);
    }
  }, [slugFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveSlug = useCallback((slug: string) => {
    window.history.replaceState(null, "", `/chat/${slug}`);
    setActiveSlugState(slug);
  }, []);

  return (
    <ChatChannelContext value={{ activeSlug, setActiveSlug }}>
      {children}
    </ChatChannelContext>
  );
}

export function useActiveChannel() {
  return useContext(ChatChannelContext);
}
