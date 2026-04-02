"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ChatChannelContextType {
  activeSlug: string;
  setActiveSlug: (slug: string) => void;
}

const ChatChannelContext = createContext<ChatChannelContextType>({
  activeSlug: "general",
  setActiveSlug: () => {},
});

export function ChatChannelProvider({ initialSlug, children }: { initialSlug: string; children: React.ReactNode }) {
  const [activeSlug, setActiveSlugState] = useState(initialSlug);

  const setActiveSlug = useCallback((slug: string) => {
    // Update URL without full navigation
    window.history.replaceState(null, "", `/chat/${slug}`);
    setActiveSlugState(slug);
  }, []);

  return (
    <ChatChannelContext.Provider value={{ activeSlug, setActiveSlug }}>
      {children}
    </ChatChannelContext.Provider>
  );
}

export function useActiveChannel() {
  return useContext(ChatChannelContext);
}
