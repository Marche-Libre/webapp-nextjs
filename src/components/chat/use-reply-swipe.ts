"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

const REPLY_SWIPE_MAX_OFFSET_PX = 56;
const REPLY_SWIPE_THRESHOLD_PX = 42;
const REPLY_SWIPE_START_THRESHOLD_PX = 8;
const REPLY_SWIPE_VERTICAL_CANCEL_PX = 12;

interface UseReplySwipeOptions {
  enabled: boolean;
  isOwn: boolean;
  onReply: () => void;
  triggerThresholdPx?: number;
}

export function useReplySwipe({
  enabled,
  isOwn,
  onReply,
  triggerThresholdPx,
}: UseReplySwipeOptions) {
  const [replySwipeOffset, setReplySwipeOffset] = useState(0);
  const pointerIdRef = useRef<number | null>(null);
  const pointerElementRef = useRef<HTMLElement | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const startedRef = useRef(false);
  const offsetRef = useRef(0);

  const replySwipeDirection = useMemo(() => {
    return isOwn ? -1 : 1;
  }, [isOwn]);
  const effectiveTriggerThresholdPx = useMemo(() => {
    return triggerThresholdPx ?? REPLY_SWIPE_THRESHOLD_PX;
  }, [triggerThresholdPx]);

  const replySwipeTransformStyle = useMemo<CSSProperties | undefined>(() => {
    if (replySwipeOffset <= 0) return undefined;

    return {
      transform: `translateX(${replySwipeOffset * replySwipeDirection}px)`,
    };
  }, [replySwipeDirection, replySwipeOffset]);

  const replySwipeIndicatorStyle = useMemo<CSSProperties>(() => {
    return {
      opacity: Math.min(replySwipeOffset / effectiveTriggerThresholdPx, 1),
    };
  }, [effectiveTriggerThresholdPx, replySwipeOffset]);

  const updateReplySwipeOffset = useCallback((nextOffset: number) => {
    offsetRef.current = nextOffset;
    setReplySwipeOffset(nextOffset);
  }, []);

  const releasePointerCapture = useCallback(() => {
    const pointerId = pointerIdRef.current;
    const pointerElement = pointerElementRef.current;
    pointerIdRef.current = null;
    pointerElementRef.current = null;

    if (pointerId === null || !pointerElement) return;
    if (!pointerElement.hasPointerCapture(pointerId)) return;

    pointerElement.releasePointerCapture(pointerId);
  }, []);

  const resetReplySwipe = useCallback(() => {
    releasePointerCapture();
    startedRef.current = false;
    updateReplySwipeOffset(0);
  }, [releasePointerCapture, updateReplySwipeOffset]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType === "mouse") return;

      pointerIdRef.current = event.pointerId;
      pointerElementRef.current = event.currentTarget;
      startRef.current = { x: event.clientX, y: event.clientY };
      startedRef.current = false;
      updateReplySwipeOffset(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled, updateReplySwipeOffset],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;

      const deltaX = event.clientX - startRef.current.x;
      const deltaY = event.clientY - startRef.current.y;
      const directedDeltaX = deltaX * replySwipeDirection;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (!startedRef.current) {
        if (
          absDeltaY > REPLY_SWIPE_VERTICAL_CANCEL_PX &&
          absDeltaY > absDeltaX
        ) {
          resetReplySwipe();
          return;
        }

        if (directedDeltaX < REPLY_SWIPE_START_THRESHOLD_PX) return;
        startedRef.current = true;
      }

      event.preventDefault();
      updateReplySwipeOffset(
        Math.min(Math.max(directedDeltaX, 0), REPLY_SWIPE_MAX_OFFSET_PX),
      );
    },
    [replySwipeDirection, resetReplySwipe, updateReplySwipeOffset],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;

      const shouldReply = offsetRef.current >= effectiveTriggerThresholdPx;
      resetReplySwipe();

      if (shouldReply) {
        onReply();
      }
    },
    [effectiveTriggerThresholdPx, onReply, resetReplySwipe],
  );

  const cleanupPointerCaptureEffect = useCallback(() => {
    return releasePointerCapture;
  }, [releasePointerCapture]);

  useEffect(cleanupPointerCaptureEffect, [cleanupPointerCaptureEffect]);

  return {
    replySwipeIndicatorStyle,
    replySwipeTransformStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  };
}
