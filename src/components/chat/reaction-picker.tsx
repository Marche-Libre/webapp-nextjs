/**
 * @ARCHIVED - Potentially unused
 * Message reactions marked as "parked" (DEC-003 open)
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

// X-style limited emoji set
const EMOJIS = ["👍", "❤️", "🔥", "😂", "😢", "👋", "😮"];
const MOBILE_MENU_CLASSNAME =
  "fixed bottom-[calc(env(safe-area-inset-bottom)_+_72px)] left-[12px] right-[12px] max-w-[calc(100vw_-_24px)] justify-center overflow-x-auto whitespace-nowrap";
const PICKER_MENU_CLASSNAME =
  "z-50 flex gap-[2px] rounded-full border border-border-default bg-bg-elevated px-[5px] py-[3px] shadow-modal";
const DESKTOP_PICKER_MENU_CLASSNAME =
  "sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-[6px] sm:w-max sm:max-w-none sm:justify-start sm:overflow-visible";
const EMOJI_BUTTON_CLASSNAME =
  "shrink-0 flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full text-[16px] transition-colors hover:bg-bg-surface-hover";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
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
      className={EMOJI_BUTTON_CLASSNAME}
    >
      {emoji}
    </button>
  );
}

export function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const handleToggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      setOpen(false);
    },
    [onSelect],
  );

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
        <div
          className={cn(
            PICKER_MENU_CLASSNAME,
            MOBILE_MENU_CLASSNAME,
            DESKTOP_PICKER_MENU_CLASSNAME,
            className,
          )}
        >
          {emojiButtons}
        </div>
      )}
    </div>
  );
}
