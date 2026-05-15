"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { Pin, Reply } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageWithAuthor } from "@/lib/chat/messages";
import {
  REPLY_UNAVAILABLE_LABEL,
  resolveReplyPreviewText,
} from "@/lib/chat/messages";
import { extractFirstHttpUrl } from "@/lib/link-preview-url";
import { resolveMediaEmbed } from "@/lib/media-embed";
import { PostEmbed } from "./post-embed";
import { UserHoverCard } from "./user-hover-card";
import { LinkPreview } from "./link-preview";
import { MediaEmbed } from "./media-embed";
import { MessageInlineActions } from "./message-bubble-actions";
import { useReplySwipe } from "./use-reply-swipe";

const MENTION_REGEX = /@([A-Za-z0-9_]+)/g;

function renderContentWithMentions(content: string, isOwn: boolean) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(MENTION_REGEX);
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const isEveryone = match[1].toLowerCase() === "everyone";
    parts.push(
      <span
        key={match.index}
        className={cn(
          "font-semibold",
          isEveryone
            ? "rounded bg-warning/15 px-[3px] text-warning"
            : isOwn
              ? "text-white underline decoration-white/45 underline-offset-2"
              : "text-primary-400",
        )}
      >
        {match[0]}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

interface MessageBubbleProps {
  channelId: string;
  message: MessageWithAuthor & {
    _status?: "sending" | "failed";
  };
  reactions?: MessageReactionEntry[];
  onReact?: (emoji: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onMessageUpdated?: () => void;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: (message: MessageWithAuthor) => void;
  onReplyClick?: (messageId: string) => void;
}

type MessageReactionEntry = {
  emoji: string;
  count: number;
  hasReacted: boolean;
};

const FORUM_LINK_REGEX = /\/forum\/posts\/([a-f0-9-]+)/;
const DIRECT_IMAGE_URL_REGEX =
  /^https?:\/\/\S+\.(?:apng|avif|gif|jpe?g|png|webp)(?:[?#]\S*)?$/i;
const EMPTY_IMAGE_URLS: string[] = [];
const MESSAGE_WIDTH_CLASSNAME = "w-full sm:max-w-[760px]";
const MESSAGE_BUBBLE_MIN_WIDTH_CLASSNAME = "min-w-[80px] sm:min-w-[120px]";
const AVATAR_SLOT_CLASSNAME =
  "h-[32px] w-[32px] shrink-0 sm:h-[40px] sm:w-[40px]";
const MESSAGE_AVATAR_CLASSNAME = "h-[32px] w-[32px] sm:h-[40px] sm:w-[40px]";
const CHAT_IMAGE_SIGNED_URL_TTL_SECONDS = 3600;
const REPLY_ACTION_LABEL = "Répondre";
const REPLY_SWIPE_THRESHOLD_PX = 42;
const COPY_LABEL = "Copier";
const COPY_SUCCESS_LABEL = "Copié";
const COPY_EMPTY_LABEL = "Rien à copier";
const COPY_UNAVAILABLE_LABEL = "Copie indisponible";
const COPY_FAILED_LABEL = "Copie impossible";
const COPY_FEEDBACK_DURATION_MS = 1600;

type CopyFeedback =
  | "idle"
  | "copied"
  | "empty"
  | "unavailable"
  | "failed";

function parseImageUrls(imageUrl: string | null) {
  if (!imageUrl) return EMPTY_IMAGE_URLS;

  try {
    const parsed: unknown = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed.filter(isString) : [imageUrl];
  } catch {
    return [imageUrl];
  }
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function hasRemoteImageUrl(imageUrl: string) {
  return (
    /^https?:\/\//i.test(imageUrl) ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  );
}

function isDirectImageUrl(url: string | null) {
  return Boolean(url && DIRECT_IMAGE_URL_REGEX.test(url));
}

function resolveVisibleMessageContent(
  content: string,
  mediaUrl: string | null,
) {
  if (!mediaUrl) return content;
  if (!isDirectImageUrl(mediaUrl)) return content;
  if (content.trim() !== mediaUrl) return content;

  return "";
}

function MessageImage({ url, index }: { url: string; index: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Chat images can be arbitrary uploaded URLs outside Next image config.
    <img
      src={url}
      alt={`Image ${index + 1}`}
      className="h-auto max-h-[320px] w-auto max-w-full rounded-lg border border-border-default object-contain"
    />
  );
}

function MessageReactionButton({
  reaction,
  canReact,
  onReact,
}: {
  reaction: MessageReactionEntry;
  canReact: boolean;
  onReact?: (emoji: string) => void;
}) {
  const handleClick = useCallback(() => {
    onReact?.(reaction.emoji);
  }, [onReact, reaction.emoji]);

  const clickHandler = canReact ? handleClick : undefined;

  return (
    <button
      type="button"
      onClick={clickHandler}
      disabled={!canReact}
      className={cn(
        "inline-flex items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[11px] transition-all",
        reaction.hasReacted
          ? "border-primary-500/45 bg-primary-50 text-primary-400"
          : "border-border-default bg-bg-base text-text-muted hover:border-border-strong hover:bg-bg-surface",
        canReact ? "cursor-pointer" : "cursor-default",
      )}
    >
      <span>{reaction.emoji}</span>
      <span className="font-medium">{reaction.count}</span>
    </button>
  );
}

export function MessageBubble({
  channelId,
  message,
  reactions,
  onReact,
  currentUserId,
  isAdmin,
  onMessageUpdated,
  isFirstInGroup = true,
  isLastInGroup = true,
  onReply,
  onReplyClick,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [deleted, setDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>("idle");
  const [supabase] = useState(createClient);
  const [resolvedImageUrls, setResolvedImageUrls] = useState<string[]>([]);
  const mountedRef = useRef(true);
  const deleteConfirmTimeoutRef = useRef<number | null>(null);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);

  const isOwn = currentUserId === message.author_id;
  const canReact = useMemo(() => {
    return Boolean(onReact);
  }, [onReact]);
  const isSending = message._status === "sending";
  const isFailed = message._status === "failed";
  const replyToMessageId = message.reply_to_message_id;
  // Consider edited only if updated_at is more than 2 seconds after created_at
  const isEdited =
    message.updated_at &&
    message.created_at &&
    new Date(message.updated_at).getTime() -
      new Date(message.created_at).getTime() >
      2000;
  const showAvatar = isLastInGroup || editing;
  const showMessageMeta = isFirstInGroup || editing;
  const rowSpacingClass = isFirstInGroup ? "pt-[8px] pb-[3px]" : "py-[2px]";
  const headerSpacingClass = showMessageMeta
    ? "mb-[3px] px-[4px]"
    : "mb-[1px] px-[2px]";
  const bubbleRadiusClass = useMemo(() => {
    if (isFirstInGroup && isLastInGroup) return "rounded-[18px]";

    if (isOwn) {
      if (isFirstInGroup) return "rounded-[18px] rounded-br-[8px]";
      if (isLastInGroup) return "rounded-[18px] rounded-tr-[8px]";
      return "rounded-[18px] rounded-tr-[8px] rounded-br-[8px]";
    }

    if (isFirstInGroup) return "rounded-[18px] rounded-bl-[8px]";
    if (isLastInGroup) return "rounded-[18px] rounded-tl-[8px]";
    return "rounded-[18px] rounded-tl-[8px] rounded-bl-[8px]";
  }, [isFirstInGroup, isLastInGroup, isOwn]);
  const forumMatch = message.content.match(FORUM_LINK_REGEX);
  const rawImageUrls = useMemo(
    () => parseImageUrls(message.image_url),
    [message.image_url],
  );
  const previewUrl = useMemo(
    () => extractFirstHttpUrl(message.content),
    [message.content],
  );
  const mediaEmbed = useMemo(() => resolveMediaEmbed(previewUrl), [previewUrl]);
  const directImageUrl = useMemo(() => {
    if (!isDirectImageUrl(previewUrl)) return null;

    return previewUrl;
  }, [previewUrl]);
  const visibleContent = useMemo(() => {
    return resolveVisibleMessageContent(message.content, directImageUrl);
  }, [directImageUrl, message.content]);
  const resolveContentParts = useCallback(() => {
    return renderContentWithMentions(visibleContent, isOwn);
  }, [isOwn, visibleContent]);
  const contentParts = useMemo(
    () => resolveContentParts(),
    [resolveContentParts],
  );
  const resolveImageUrls = useCallback(async () => {
    if (rawImageUrls.length === 0) {
      return [];
    }

    return Promise.all(
      rawImageUrls.map(async (url) => {
        if (hasRemoteImageUrl(url)) return url;

        const { data, error } = await supabase.storage
          .from("medias")
          .createSignedUrl(url, CHAT_IMAGE_SIGNED_URL_TTL_SECONDS);
        if (error || !data?.signedUrl) return url;

        return data.signedUrl;
      }),
    );
  }, [rawImageUrls, supabase]);
  const imageUrls = useMemo(() => resolvedImageUrls, [resolvedImageUrls]);
  const displayedImageUrls = useMemo(() => {
    if (!directImageUrl) return imageUrls;
    if (imageUrls.includes(directImageUrl)) return imageUrls;

    return [...imageUrls, directImageUrl];
  }, [directImageUrl, imageUrls]);
  const shouldShowLinkPreview = useMemo(() => {
    return Boolean(previewUrl && !directImageUrl && !mediaEmbed);
  }, [directImageUrl, mediaEmbed, previewUrl]);
  const isReplyable = useMemo(() => {
    return Boolean(onReply && !isSending && !isFailed && !editing);
  }, [editing, isFailed, isSending, onReply]);
  const canReplyToMessage = useMemo(() => {
    return isReplyable || Boolean(isAdmin);
  }, [isAdmin, isReplyable]);
  const canCopyMessage = true;
  const canReportMessage = true;
  const canEditMessage = isOwn && !editing;
  const canDeleteMessage = isOwn && !editing;
  const canPinMessage = Boolean(isAdmin);
  const replyPreviewText = useMemo(() => {
    if (message.reply_to) return resolveReplyPreviewText(message.reply_to);
    if (replyToMessageId) return REPLY_UNAVAILABLE_LABEL;

    return "";
  }, [message.reply_to, replyToMessageId]);
  const replyAuthorLabel = useMemo(() => {
    if (!message.reply_to) return "Message cité";

    return `@${message.reply_to.author.x_handle}`;
  }, [message.reply_to]);
  const replyCitationAriaLabel = useMemo(() => {
    if (!message.reply_to) return "Aller au message cité";

    return `Aller au message de ${message.reply_to.author.x_handle}`;
  }, [message.reply_to]);
  const copyLabel = useMemo(() => {
    if (copyFeedback === "copied") return COPY_SUCCESS_LABEL;
    if (copyFeedback === "empty") return COPY_EMPTY_LABEL;
    if (copyFeedback === "unavailable") return COPY_UNAVAILABLE_LABEL;
    if (copyFeedback === "failed") return COPY_FAILED_LABEL;

    return COPY_LABEL;
  }, [copyFeedback]);
  const copySucceeded = copyFeedback === "copied";
  const trackMountedEffect = useCallback(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);
  const updateImageUrlsEffect = useCallback(() => {
    let isCancelled = false;
    const resolve = async () => {
      try {
        const imageUrls = await resolveImageUrls();
        if (isCancelled) return;
        setResolvedImageUrls(imageUrls);
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to resolve chat image URLs", error);
        setResolvedImageUrls(rawImageUrls);
      }
    };

    void resolve();

    return () => {
      isCancelled = true;
    };
  }, [rawImageUrls, resolveImageUrls]);

  useEffect(trackMountedEffect, [trackMountedEffect]);
  useEffect(updateImageUrlsEffect, [updateImageUrlsEffect]);

  const handleSaveEdit = useCallback(async () => {
    if (!editContent.trim() || editContent === message.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await supabase
      .from("messages")
      .update({ content: editContent, updated_at: new Date().toISOString() })
      .eq("id", message.id);
    if (!mountedRef.current) return;
    setSaving(false);
    setEditing(false);
    onMessageUpdated?.();
  }, [editContent, message.content, message.id, onMessageUpdated, supabase]);

  const handleDelete = useCallback(async () => {
    setSaving(true);
    await supabase
      .from("messages")
      .update({ content: "", updated_at: new Date().toISOString() })
      .eq("id", message.id);
    if (!mountedRef.current) return;
    setDeleted(true);
    setDeleteConfirming(false);
    setSaving(false);
    onMessageUpdated?.();
  }, [message.id, onMessageUpdated, supabase]);

  const handleTogglePin = useCallback(async () => {
    if (!isAdmin) return;

    setSaving(true);

    if (message.is_pinned) {
      const { error } = await supabase
        .from("messages")
        .update({ is_pinned: false })
        .eq("id", message.id)
        .eq("channel_id", channelId);
      if (!mountedRef.current) return;
      setSaving(false);

      if (error) {
        console.error("Failed to update message pin state", error);
        alert("Impossible de modifier l'épinglage du message pour le moment.");
        return;
      }

      onMessageUpdated?.();
      return;
    }

    const { error: clearExistingPinError } = await supabase
      .from("messages")
      .update({ is_pinned: false })
      .eq("channel_id", channelId)
      .eq("is_pinned", true);

    if (clearExistingPinError) {
      if (!mountedRef.current) return;
      setSaving(false);
      console.error(
        "Failed to clear existing pinned message",
        clearExistingPinError,
      );
      alert("Impossible de modifier l'épinglage du message pour le moment.");
      return;
    }

    const { error: setPinError } = await supabase
      .from("messages")
      .update({ is_pinned: true })
      .eq("id", message.id)
      .eq("channel_id", channelId);
    if (!mountedRef.current) return;
    setSaving(false);

    if (setPinError) {
      console.error("Failed to update message pin state", setPinError);
      alert("Impossible de modifier l'épinglage du message pour le moment.");
      return;
    }

    onMessageUpdated?.();
  }, [
    channelId,
    isAdmin,
    message.id,
    message.is_pinned,
    onMessageUpdated,
    supabase,
  ]);

  const handleReport = useCallback(async () => {
    if (!currentUserId) {
      alert("Impossible de signaler ce message pour le moment.");
      return;
    }

    const reason = prompt("Raison du signalement :");
    if (!reason) return;
    await supabase.from("user_reports").insert({
      reporter_id: currentUserId,
      reported_id: message.author_id,
      message_id: message.id,
      reason,
    });
    alert("Signalement envoyé. Un administrateur examinera ce message.");
  }, [currentUserId, message.author_id, message.id, supabase]);

  const clearCopyFeedbackTimeout = useCallback(() => {
    if (copyFeedbackTimeoutRef.current === null) return;
    window.clearTimeout(copyFeedbackTimeoutRef.current);
    copyFeedbackTimeoutRef.current = null;
  }, []);

  const showCopyFeedback = useCallback(
    (status: Exclude<CopyFeedback, "idle">) => {
      clearCopyFeedbackTimeout();
      setCopyFeedback(status);
      copyFeedbackTimeoutRef.current = window.setTimeout(() => {
        setCopyFeedback("idle");
        copyFeedbackTimeoutRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    },
    [clearCopyFeedbackTimeout],
  );

  const handleCopyMessage = useCallback(async () => {
    const textToCopy = message.content.trim();
    if (!textToCopy) {
      showCopyFeedback("empty");
      return;
    }

    if (!navigator.clipboard?.writeText) {
      showCopyFeedback("unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      showCopyFeedback("copied");
    } catch (error) {
      console.error("Failed to copy message text", error);
      showCopyFeedback("failed");
    }
  }, [message.content, showCopyFeedback]);

  const handleEditContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setEditContent(e.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSaveEdit();
      }
      if (e.key === "Escape") {
        setEditing(false);
        setEditContent(message.content);
      }
    },
    [handleSaveEdit, message.content],
  );

  const handleStartEditing = useCallback(() => {
    setEditContent(message.content);
    setEditing(true);
  }, [message.content]);

  const handleStartDeleteConfirming = useCallback(() => {
    setDeleteConfirming(true);
  }, []);

  const handleCancelDeleteConfirming = useCallback(() => {
    setDeleteConfirming(false);
  }, []);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      onReact?.(emoji);
    },
    [onReact],
  );

  const handleReply = useCallback(() => {
    onReply?.(message);
  }, [message, onReply]);

  const handleReplyCitationClick = useCallback(() => {
    if (!replyToMessageId) return;

    onReplyClick?.(replyToMessageId);
  }, [onReplyClick, replyToMessageId]);

  const {
    replySwipeIndicatorStyle,
    replySwipeTransformStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  } = useReplySwipe({
    enabled: canReplyToMessage,
    isOwn,
    onReply: handleReply,
    triggerThresholdPx: REPLY_SWIPE_THRESHOLD_PX,
  });

  const buildImageItems = useCallback(() => {
    if (displayedImageUrls.length === 0) return null;

    const items: ReactNode[] = [];
    displayedImageUrls.forEach((url: string, index: number) => {
      items.push(
        <MessageImage key={`${url}-${index}`} url={url} index={index} />,
      );
    });
    return items;
  }, [displayedImageUrls]);

  const imageItems = useMemo(() => buildImageItems(), [buildImageItems]);

  const buildReactionItems = useCallback(() => {
    if (!reactions || reactions.length === 0) return null;

    const items: ReactNode[] = [];
    for (const reaction of reactions) {
      items.push(
        <MessageReactionButton
          key={reaction.emoji}
          reaction={reaction}
          canReact={canReact}
          onReact={handleReactionSelect}
        />,
      );
    }
    return items;
  }, [canReact, handleReactionSelect, reactions]);

  const reactionItems = useMemo(
    () => buildReactionItems(),
    [buildReactionItems],
  );

  const replyCitation = useMemo(() => {
    if (!replyToMessageId) return null;

    return (
      <button
        type="button"
        onClick={handleReplyCitationClick}
        disabled={!onReplyClick}
        aria-label={replyCitationAriaLabel}
        className={cn(
          "mb-[7px] block max-w-full cursor-pointer rounded-[10px] border-l-2 px-[8px] py-[6px] text-left transition-colors disabled:cursor-default disabled:opacity-80",
          isOwn
            ? "border-white/65 bg-white/12 text-white hover:bg-white/18"
            : "border-primary-400 bg-bg-base/70 text-text-secondary hover:bg-bg-base",
        )}
      >
        <span
          className={cn(
            "block truncate text-[11px] font-semibold",
            isOwn ? "text-white" : "text-primary-500",
          )}
        >
          {replyAuthorLabel}
        </span>
        <span
          className={cn(
            "mt-[1px] line-clamp-2 whitespace-pre-wrap break-words text-[12px] leading-[16px]",
            isOwn ? "text-white/85" : "text-text-muted",
          )}
        >
          {replyPreviewText}
        </span>
      </button>
    );
  }, [
    handleReplyCitationClick,
    isOwn,
    onReplyClick,
    replyAuthorLabel,
    replyCitationAriaLabel,
    replyPreviewText,
    replyToMessageId,
  ]);

  const clearDeleteConfirmTimeout = useCallback(() => {
    if (deleteConfirmTimeoutRef.current === null) return;
    window.clearTimeout(deleteConfirmTimeoutRef.current);
    deleteConfirmTimeoutRef.current = null;
  }, []);

  const manageDeleteConfirmTimeoutEffect = useCallback(() => {
    clearDeleteConfirmTimeout();
    if (!deleteConfirming) return;

    deleteConfirmTimeoutRef.current = window.setTimeout(
      handleCancelDeleteConfirming,
      3000,
    );

    return clearDeleteConfirmTimeout;
  }, [
    clearDeleteConfirmTimeout,
    deleteConfirming,
    handleCancelDeleteConfirming,
  ]);

  const cleanupCopyFeedbackTimeoutEffect = useCallback(() => {
    return clearCopyFeedbackTimeout;
  }, [clearCopyFeedbackTimeout]);

  useEffect(manageDeleteConfirmTimeoutEffect, [
    manageDeleteConfirmTimeoutEffect,
  ]);
  useEffect(cleanupCopyFeedbackTimeoutEffect, [
    cleanupCopyFeedbackTimeoutEffect,
  ]);

  // Deleted message
  // TODO: Add revert option / rollback deletion
  if (deleted || (!message.content && !message.image_url)) {
    return (
      <article
        className={cn(
          "group flex items-end gap-[8px] px-[12px] transition-colors",
          rowSpacingClass,
          isOwn && "flex-row-reverse",
        )}
      >
        {showAvatar ? (
          <UserHoverCard
            authorId={message.author_id}
            x_handle={message.author.x_handle}
            full_name={message.author.full_name}
            avatar_url={message.author.avatar_url}
          >
            <Avatar
              src={message.author.avatar_url}
              name={message.author.x_handle}
              size="md"
              className={MESSAGE_AVATAR_CLASSNAME}
            />
          </UserHoverCard>
        ) : (
          <div className={AVATAR_SLOT_CLASSNAME} aria-hidden />
        )}
        <div
          className={cn(
            "min-w-0",
            MESSAGE_WIDTH_CLASSNAME,
            isOwn && "flex flex-col items-end",
          )}
        >
          {showMessageMeta && (
            <header
              className={cn(
                "flex items-baseline gap-[8px]",
                headerSpacingClass,
                isOwn && "justify-end text-right",
              )}
            >
              <span className="text-[13px] font-semibold text-text-primary">
                @{message.author.x_handle}
              </span>
              <span className="text-[10px] text-text-muted">
                {timeAgo(message.created_at)}
              </span>
            </header>
          )}
          <p
            className={cn(
              "select-text bg-bg-surface px-[14px] py-[8px] text-[13px] italic text-text-muted",
              MESSAGE_BUBBLE_MIN_WIDTH_CLASSNAME,
              bubbleRadiusClass,
              isOwn && "text-right",
            )}
          >
            Ce message a été supprimé
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={cn(
        "group relative touch-pan-y px-[8px] transition-colors sm:flex sm:items-end sm:gap-[8px] sm:px-[12px]",
        rowSpacingClass,
        isOwn ? "sm:flex-row-reverse" : "sm:hover:bg-bg-surface/20",
        message.is_pinned &&
          (isOwn
            ? "border-r-2 border-primary-500 bg-primary-50/30"
            : "border-l-2 border-primary-500 bg-primary-50/30"),
      )}
    >
      {canReplyToMessage && (
        <div
          aria-hidden
          style={replySwipeIndicatorStyle}
          className={cn(
            "pointer-events-none absolute top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-full bg-primary-50 text-primary-500 sm:hidden",
            isOwn ? "right-[12px]" : "left-[12px]",
          )}
        >
          <Reply className="h-[14px] w-[14px]" />
        </div>
      )}
      {showAvatar ? (
        <UserHoverCard
          authorId={message.author_id}
          x_handle={message.author.x_handle}
          full_name={message.author.full_name}
          avatar_url={message.author.avatar_url}
          className="hidden sm:block"
        >
          <Avatar
            src={message.author.avatar_url}
            name={message.author.x_handle}
            size="md"
            className={cn("cursor-pointer", MESSAGE_AVATAR_CLASSNAME)}
          />
        </UserHoverCard>
      ) : (
        <div
          className={cn("hidden sm:block", AVATAR_SLOT_CLASSNAME)}
          aria-hidden
        />
      )}
      <section
        style={replySwipeTransformStyle}
        className={cn(
          "min-w-0 flex w-full flex-col transition-transform",
          MESSAGE_WIDTH_CLASSNAME,
          isOwn ? "items-end" : "items-start",
          isOwn && editing && "w-[75%]",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center px-[2px] sm:hidden",
            showMessageMeta ? "mb-[3px] min-h-[28px]" : "mb-[2px]",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-[6px]",
              isOwn && "ml-auto",
              isOwn && "justify-end text-right",
            )}
          >
            {showMessageMeta && !isOwn && showAvatar && (
              <UserHoverCard
                authorId={message.author_id}
                x_handle={message.author.x_handle}
                full_name={message.author.full_name}
                avatar_url={message.author.avatar_url}
              >
                <Avatar
                  src={message.author.avatar_url}
                  name={message.author.x_handle}
                  size="md"
                  className="h-[28px] w-[28px]"
                />
              </UserHoverCard>
            )}
            {showMessageMeta && message.is_pinned && (
              <Pin className="h-[11px] w-[11px] shrink-0 translate-y-[1px] text-primary-500" />
            )}
            {showMessageMeta && (
              <UserHoverCard
                authorId={message.author_id}
                x_handle={message.author.x_handle}
                full_name={message.author.full_name}
                avatar_url={message.author.avatar_url}
              >
                <span className="cursor-pointer truncate text-[12px] font-semibold text-text-muted hover:text-text-secondary hover:underline">
                  @{message.author.x_handle}
                </span>
              </UserHoverCard>
            )}
            {showMessageMeta && (
              <span className="shrink-0 text-[10px] text-text-muted">
                {timeAgo(message.created_at)}
              </span>
            )}
            {showMessageMeta && isEdited && !editing && (
              <span className="shrink-0 text-[10px] italic text-text-muted">
                (modifié)
              </span>
            )}
          </div>
          <MessageInlineActions
            canReact={canReact}
            canCopy={canCopyMessage}
            canDelete={canDeleteMessage}
            canEdit={canEditMessage}
            canPin={canPinMessage}
            canReport={canReportMessage}
            copyLabel={copyLabel}
            copySucceeded={copySucceeded}
            deleteConfirming={deleteConfirming}
            isPinned={Boolean(message.is_pinned)}
            isReplyable={canReplyToMessage}
            replyLabel={REPLY_ACTION_LABEL}
            saving={saving}
            onCancelDelete={handleCancelDeleteConfirming}
            onConfirmDelete={handleStartDeleteConfirming}
            onCopy={handleCopyMessage}
            onDelete={handleDelete}
            onEdit={handleStartEditing}
            onPin={handleTogglePin}
            onReact={handleReactionSelect}
            onReply={handleReply}
            onReport={handleReport}
            className={cn("opacity-100", isOwn ? "ml-[6px]" : "ml-auto")}
          />
        </div>
        <header
          className={cn(
            "hidden items-center gap-[8px] sm:flex",
            headerSpacingClass,
            isOwn && "justify-end text-right",
          )}
        >
          {showMessageMeta && message.is_pinned && (
            <Pin className="h-[11px] w-[11px] text-primary-500 shrink-0 translate-y-[1px]" />
          )}
          {showMessageMeta && (
            <UserHoverCard
              authorId={message.author_id}
              x_handle={message.author.x_handle}
              full_name={message.author.full_name}
              avatar_url={message.author.avatar_url}
            >
              <span className="cursor-pointer text-[12px] font-semibold text-text-muted hover:text-text-secondary hover:underline">
                @{message.author.x_handle}
              </span>
            </UserHoverCard>
          )}
          {showMessageMeta && (
            <span className="text-[10px] text-text-muted">
              {timeAgo(message.created_at)}
            </span>
          )}
          {showMessageMeta && isEdited && !editing && (
            <span className="text-[10px] text-text-muted italic">
              (modifié)
            </span>
          )}
        </header>

        {editing ? (
          <div className="mt-[4px] w-full space-y-[6px]">
            <textarea
              value={editContent}
              onChange={handleEditContentChange}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full resize-none rounded-[18px] border border-border-default bg-bg-surface px-[14px] py-[10px] text-[14px] leading-[20px] text-text-primary focus:border-primary-500 focus:outline-none"
              autoFocus
            />
            <p className="text-[10px] text-text-muted mt-[2px]">
              Échap pour annuler · Entrée pour sauvegarder
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "max-w-full sm:flex sm:items-center sm:gap-[4px]",
              isOwn && "sm:flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "w-fit max-w-full px-3.5 py-2.25 shadow-card sm:max-w-full",
                MESSAGE_BUBBLE_MIN_WIDTH_CLASSNAME,
                bubbleRadiusClass,
                isOwn
                  ? "bg-primary-500 text-white"
                  : "border border-border-subtle bg-bg-surface-hover text-text-primary",
              )}
            >
              {replyCitation}
              {visibleContent && (
                <div
                  className={cn(
                    "select-text whitespace-pre-wrap break-words text-[14px] leading-[20px] [overflow-wrap:anywhere]",
                    isSending && "opacity-60",
                    isFailed
                      ? "text-error/80"
                      : isOwn
                        ? "text-white"
                        : "text-text-primary",
                  )}
                >
                  {contentParts}
                </div>
              )}
              {isFailed && (
                <p className="text-[11px] text-error mt-[2px]">
                  Échec de l&apos;envoi — vérifiez votre connexion
                </p>
              )}
              {imageItems && (
                <div
                  className={cn(
                    "mt-[8px]",
                    (displayedImageUrls.length > 1 || isOwn) && "flex",
                    displayedImageUrls.length > 1 && "gap-[6px] flex-wrap",
                    isOwn && "justify-end",
                  )}
                >
                  {imageItems}
                </div>
              )}
              {mediaEmbed && <MediaEmbed embed={mediaEmbed} />}
              {shouldShowLinkPreview && previewUrl && (
                <LinkPreview url={previewUrl} />
              )}
              {forumMatch && <PostEmbed postId={forumMatch[1]} />}
            </div>
            <MessageInlineActions
              canReact={canReact}
              canCopy={canCopyMessage}
              canDelete={canDeleteMessage}
              canEdit={canEditMessage}
              canPin={canPinMessage}
              canReport={canReportMessage}
              copyLabel={copyLabel}
              copySucceeded={copySucceeded}
              deleteConfirming={deleteConfirming}
              isPinned={Boolean(message.is_pinned)}
              isReplyable={canReplyToMessage}
              replyLabel={REPLY_ACTION_LABEL}
              saving={saving}
              onCancelDelete={handleCancelDeleteConfirming}
              onConfirmDelete={handleStartDeleteConfirming}
              onCopy={handleCopyMessage}
              onDelete={handleDelete}
              onEdit={handleStartEditing}
              onPin={handleTogglePin}
              onReact={handleReactionSelect}
              onReply={handleReply}
              onReport={handleReport}
              className="hidden sm:flex sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100"
            />
          </div>
        )}

        {reactionItems && (
          <div
            className={cn(
              "flex gap-[4px] mt-[6px] flex-wrap",
              isOwn && "justify-end",
            )}
          >
            {reactionItems}
          </div>
        )}
      </section>
    </article>
  );
}
