/**
 * @ARCHIVED - Potentially unused
 * Message reactions marked as "parked" (DEC-003 open)
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full text-[16px] transition-colors hover:bg-bg-surface-hover"
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

  const emojiButtons = useMemo(() => {
    return EMOJIS.map((emoji) => (
      <EmojiButton key={emoji} emoji={emoji} onSelect={handleSelect} />
    ));
  }, [handleSelect]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={handleToggleOpen}
        className="cursor-pointer rounded-full p-[5px] text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary"
        title="Réagir"
      >
        <SmilePlus className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-[6px] flex gap-[2px] rounded-full border border-border-default bg-bg-elevated px-[5px] py-[3px] shadow-modal">
          {emojiButtons}
        </div>
      )}
    </div>
  );
}
