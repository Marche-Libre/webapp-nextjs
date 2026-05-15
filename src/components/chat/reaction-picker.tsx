"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😢", "👋", "😮"];
const PICKER_MENU_CLASSNAME =
  "fixed z-50 flex gap-[2px] whitespace-nowrap rounded-full border border-border-default bg-bg-elevated px-[5px] py-[3px] shadow-modal";
const EMOJI_BUTTON_CLASSNAME =
  "shrink-0 flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full text-[16px] transition-colors hover:bg-bg-surface-hover";
const PICKER_VIEWPORT_MARGIN_PX = 12;
const PICKER_VERTICAL_OFFSET_PX = 8;
const PICKER_BUTTON_HEIGHT_PX = 32;
const PICKER_HORIZONTAL_PADDING_PX = 10;
const PICKER_VERTICAL_PADDING_PX = 6;
const PICKER_EMOJI_GAP_PX = 2;
const PICKER_WIDTH_PX =
  EMOJIS.length * PICKER_BUTTON_HEIGHT_PX +
  (EMOJIS.length - 1) * PICKER_EMOJI_GAP_PX +
  PICKER_HORIZONTAL_PADDING_PX;

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

interface EmojiButtonProps {
  emoji: string;
  onSelect: (emoji: string) => void;
}

interface PickerPosition {
  top: number;
  left: number;
  width: number;
}

function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function resolvePickerHeight() {
  return PICKER_BUTTON_HEIGHT_PX + PICKER_VERTICAL_PADDING_PX;
}

function resolvePickerWidth() {
  return PICKER_WIDTH_PX;
}

function resolvePickerPosition(triggerRect: DOMRect): PickerPosition {
  const width = resolvePickerWidth();
  const height = resolvePickerHeight();

  const minLeft = PICKER_VIEWPORT_MARGIN_PX;
  const maxLeft = Math.max(
    minLeft,
    window.innerWidth - width - PICKER_VIEWPORT_MARGIN_PX,
  );
  const preferredLeft = triggerRect.right - width;
  const left = clamp(preferredLeft, minLeft, maxLeft);

  const minTop = PICKER_VIEWPORT_MARGIN_PX;
  const maxTop = Math.max(
    minTop,
    window.innerHeight - height - PICKER_VIEWPORT_MARGIN_PX,
  );
  const belowTop = triggerRect.bottom + PICKER_VERTICAL_OFFSET_PX;
  const aboveTop = triggerRect.top - height - PICKER_VERTICAL_OFFSET_PX;
  const top =
    belowTop <= maxTop
      ? belowTop
      : aboveTop >= minTop
        ? aboveTop
        : clamp(belowTop, minTop, maxTop);

  return { top, left, width };
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
      aria-label={`Réagir avec ${emoji}`}
      title={emoji}
    >
      {emoji}
    </button>
  );
}

export function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(
    null,
  );
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const updatePickerPosition = useCallback(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

    setPickerPosition(resolvePickerPosition(triggerElement.getBoundingClientRect()));
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      setOpen(false);
    },
    [onSelect],
  );

  const handlePointerDownOutside = useCallback((event: PointerEvent) => {
    const pickerElement = pickerRef.current;
    const triggerElement = triggerRef.current;
    const eventTarget = event.target as Node;
    const isInsidePicker = Boolean(
      pickerElement && pickerElement.contains(eventTarget),
    );
    const isTriggerClick = Boolean(
      triggerElement && triggerElement.contains(eventTarget),
    );
    if (isInsidePicker || isTriggerClick) return;

    setOpen(false);
  }, []);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePickerPosition();
    window.addEventListener("resize", updatePickerPosition);
    window.addEventListener("scroll", updatePickerPosition, true);
    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("resize", updatePickerPosition);
      window.removeEventListener("scroll", updatePickerPosition, true);
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleEscapeKey, handlePointerDownOutside, open, updatePickerPosition]);

  const pickerStyle = useMemo<CSSProperties | undefined>(() => {
    if (!pickerPosition) return undefined;

    return {
      top: `${pickerPosition.top}px`,
      left: `${pickerPosition.left}px`,
      width: `${pickerPosition.width}px`,
    };
  }, [pickerPosition]);

  const emojiButtons = useMemo(() => {
    return EMOJIS.map((emoji) => (
      <EmojiButton key={emoji} emoji={emoji} onSelect={handleSelect} />
    ));
  }, [handleSelect]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleOpen}
        className="cursor-pointer rounded-full p-[5px] text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary"
        aria-label="Réagir"
        title="Réagir"
      >
        <SmilePlus className="h-[14px] w-[14px]" />
      </button>
      {open && pickerStyle && (
        <div
          ref={pickerRef}
          className={cn(PICKER_MENU_CLASSNAME, className)}
          style={pickerStyle}
        >
          {emojiButtons}
        </div>
      )}
    </div>
  );
}
