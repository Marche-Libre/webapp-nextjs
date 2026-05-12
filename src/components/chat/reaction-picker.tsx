/**
 * @ARCHIVED - Potentially unused
 * Message reactions marked as "parked" (DEC-003 open)
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SmilePlus } from "lucide-react";

// X-style limited emoji set
const EMOJIS = ["👍", "❤️", "🔥", "😂", "🙏", "😢"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
}

interface EmojiButtonProps {
  emoji: string;
  onSelect: (emoji: string) => void;
}

function EmojiButton({ emoji, onSelect }: EmojiButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(emoji);
  }, [emoji, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-bg-surface cursor-pointer text-[16px] transition-colors"
    >
      {emoji}
    </button>
  );
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

  const handleToggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const handleSelect = useCallback((emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  }, [onSelect]);

  const emojiButtons = EMOJIS.map((emoji) => (
    <EmojiButton key={emoji} emoji={emoji} onSelect={handleSelect} />
  ));

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={handleToggleOpen}
        className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
        title="Réagir"
      >
        <SmilePlus className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-[4px] z-50 bg-bg-elevated border border-border-default rounded-full shadow-modal px-[4px] py-[2px] flex gap-[2px]">
          {emojiButtons}
        </div>
      )}
    </div>
  );
}
