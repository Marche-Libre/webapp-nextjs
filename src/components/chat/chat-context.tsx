"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ChatPanelState {
  isOpen: boolean;
  activeSlug: string;
}

interface ChatPanelContextType extends ChatPanelState {
  openChat: (slug?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatPanelContext = createContext<ChatPanelContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatPanelState>({
    isOpen: false,
    activeSlug: "general",
  });

  const openChat = useCallback((slug?: string) => {
    setState((prev) => ({
      isOpen: true,
      activeSlug: slug || prev.activeSlug,
    }));
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  return (
    <ChatPanelContext.Provider value={{ ...state, openChat, closeChat, toggleChat }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) throw new Error("useChatPanel must be used within ChatProvider");
  return ctx;
}
