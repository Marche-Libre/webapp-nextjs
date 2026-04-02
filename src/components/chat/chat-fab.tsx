"use client";

import { MessageCircle } from "lucide-react";
import { useChatPanel } from "./chat-context";

export function ChatFab() {
  const { isOpen, toggleChat } = useChatPanel();

  if (isOpen) return null;

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-[24px] right-[24px] z-50 h-[56px] w-[56px] rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary-700 hover:scale-105 active:scale-95"
      title="Ouvrir le chat"
    >
      <MessageCircle className="h-[22px] w-[22px]" />
    </button>
  );
}
