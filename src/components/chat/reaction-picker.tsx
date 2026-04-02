"use client";

import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";

const EMOJIS = [
  "👍", "❤️", "🔥", "😂", "👏", "💯", "👀", "🤔",
  "🚀", "🎉", "✅", "❌", "👋", "🙏", "⭐", "✨",
  "💡", "🧠", "👑", "💪",
];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
}

export function ReactionPicker({ onSelect }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
        title="Réagir"
      >
        <SmilePlus className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-[4px] z-50 bg-bg-elevated border border-border-default rounded-lg shadow-modal p-[6px] grid grid-cols-5 gap-[2px] w-[180px]">
          {EMOJIS.map((emoji) => (
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
      )}
    </div>
  );
}
