"use client";

import { useState } from "react";
import { SmilePlus } from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "👀", "🎉", "💯", "🤝"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
}

export function ReactionPicker({ onSelect }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
      >
        <SmilePlus className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-[4px] z-50 bg-bg-elevated border border-border-default rounded-lg shadow-modal p-[8px] flex gap-[4px]">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="w-[32px] h-[32px] flex items-center justify-center rounded hover:bg-bg-surface cursor-pointer text-[16px] transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
