"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { ReactionPicker } from "./reaction-picker";
import { Pencil, Trash2, Check, Flag, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types/database";
import { PostEmbed } from "./post-embed";
import { UserHoverCard } from "./user-hover-card";

const MENTION_REGEX = /@([A-Za-z0-9_]+)/g;

function renderContentWithMentions(content: string) {
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
      <span key={match.index} className={isEveryone ? "text-warning font-semibold bg-warning/10 px-[2px] rounded" : "text-primary-500 font-medium"}>
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

interface MessageBubbleProps {
  message: Message & {
    author: { x_handle: string; full_name: string; avatar_url: string | null };
    _status?: "sending" | "failed";
  };
  reactions?: MessageReactionEntry[];
  onReact?: (emoji: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onMessageUpdated?: () => void;
}

type MessageReactionEntry = { emoji: string; count: number; hasReacted: boolean };

const FORUM_LINK_REGEX = /\/forum\/posts\/([a-f0-9-]+)/;
const EMPTY_IMAGE_URLS: string[] = [];

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

function MessageImage({ url, index }: { url: string; index: number }) {
  return (
    <img
      src={url}
      alt={`Image ${index + 1}`}
      className="rounded-lg max-w-full sm:max-w-[400px] max-h-[300px] object-cover border border-border-default"
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
        "inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] border transition-all",
        reaction.hasReacted
          ? "bg-primary-50 border-primary-500/30 text-primary-700"
          : "bg-bg-surface border-border-default text-text-muted hover:border-border-strong",
        canReact ? "cursor-pointer" : "cursor-default"
      )}
    >
      <span>{reaction.emoji}</span>
      <span className="font-medium">{reaction.count}</span>
    </button>
  );
}

export function MessageBubble({ message, reactions, onReact, currentUserId, isAdmin, onMessageUpdated }: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [deleted, setDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [supabase] = useState(createClient);
  const deleteConfirmTimeoutRef = useRef<number | null>(null);

  const isOwn = currentUserId === message.author_id;
  const canReact = useMemo(() => {
    return Boolean(onReact);
  }, [onReact]);
  const isSending = message._status === "sending";
  const isFailed = message._status === "failed";
  // Consider edited only if updated_at is more than 2 seconds after created_at
  const isEdited = message.updated_at && message.created_at
    && (new Date(message.updated_at).getTime() - new Date(message.created_at).getTime() > 2000);
  const forumMatch = message.content.match(FORUM_LINK_REGEX);
  const resolveContentParts = useCallback(() => {
    return renderContentWithMentions(message.content);
  }, [message.content]);
  const resolveImageUrls = useCallback(() => {
    return parseImageUrls(message.image_url);
  }, [message.image_url]);
  const contentParts = useMemo(() => resolveContentParts(), [resolveContentParts]);
  const imageUrls = useMemo(() => resolveImageUrls(), [resolveImageUrls]);

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
    setDeleted(true);
    setDeleteConfirming(false);
    setSaving(false);
    onMessageUpdated?.();
  }, [message.id, onMessageUpdated, supabase]);

  const handleTogglePin = useCallback(async () => {
    await supabase
      .from("messages")
      .update({ is_pinned: !message.is_pinned })
      .eq("id", message.id);
    onMessageUpdated?.();
  }, [message.id, message.is_pinned, onMessageUpdated, supabase]);

  const handleReport = useCallback(async () => {
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

  const handleEditContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditContent(message.content);
    }
  }, [handleSaveEdit, message.content]);

  const handleStartEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const handleStartDeleteConfirming = useCallback(() => {
    setDeleteConfirming(true);
  }, []);

  const handleCancelDeleteConfirming = useCallback(() => {
    setDeleteConfirming(false);
  }, []);

  const handleReactionSelect = useCallback((emoji: string) => {
    onReact?.(emoji);
  }, [onReact]);

  const buildImageItems = useCallback(() => {
    if (imageUrls.length === 0) return null;

    const items: ReactNode[] = [];
    imageUrls.forEach((url: string, index: number) => {
      items.push(<MessageImage key={`${url}-${index}`} url={url} index={index} />);
    });
    return items;
  }, [imageUrls]);

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
        />
      );
    }
    return items;
  }, [canReact, handleReactionSelect, reactions]);

  const reactionItems = useMemo(() => buildReactionItems(), [buildReactionItems]);

  const pinnedIcon = message.is_pinned ? (
    <Pin className="h-[11px] w-[11px] text-primary-500 shrink-0 translate-y-[1px]" />
  ) : null;
  const editedLabel = isEdited && !editing ? (
    <span className="text-[10px] text-text-muted italic">(modifié)</span>
  ) : null;
  const contentNode = message.content ? (
    <div
      className={cn(
        "text-[13px] mt-[2px] whitespace-pre-wrap break-words",
        isOwn && "rounded-lg border px-[12px] py-[8px] text-left shadow-sm",
        !isOwn && (isSending ? "text-text-secondary opacity-50" : isFailed ? "text-error/70" : "text-text-secondary"),
        isOwn && (isSending
          ? "bg-primary-50/70 border-primary-500/15 text-text-secondary opacity-70"
          : isFailed
            ? "bg-error-bg border-error/20 text-error"
            : "bg-primary-50 border-primary-500/15 text-text-primary")
      )}
    >
      {contentParts}
    </div>
  ) : null;
  const failedNode = isFailed ? (
    <p className="text-[11px] text-error mt-[2px]">
      Échec de l&apos;envoi — vérifiez votre connexion
    </p>
  ) : null;
  const imageNode = imageItems ? (
    <div
      className={cn(
        "mt-[8px]",
        (imageUrls.length > 1 || isOwn) && "flex",
        imageUrls.length > 1 && "gap-[6px] flex-wrap",
        isOwn && "justify-end"
      )}
    >
      {imageItems}
    </div>
  ) : null;
  const forumEmbedNode = forumMatch ? <PostEmbed postId={forumMatch[1]} /> : null;
  const reactionsNode = reactionItems ? (
    <div className={cn("flex gap-[4px] mt-[6px] flex-wrap", isOwn && "justify-end")}>
      {reactionItems}
    </div>
  ) : null;
  const adminPinButton = isAdmin ? (
    <button
      onClick={handleTogglePin}
      className={`p-[4px] rounded hover:bg-bg-surface cursor-pointer transition-colors ${message.is_pinned ? "text-primary-500" : "text-text-muted hover:text-text-secondary"}`}
      title={message.is_pinned ? "Désépingler" : "Épingler"}
    >
      <Pin className="h-[13px] w-[13px]" />
    </button>
  ) : null;
  const deleteButton = deleteConfirming ? (
    <ConfirmDeleteButton
      saving={saving}
      onDelete={handleDelete}
      onCancel={handleCancelDeleteConfirming}
    />
  ) : (
    <DeleteButton
      saving={saving}
      onConfirm={handleStartDeleteConfirming}
    />
  );
  const ownerActions = isOwn && !editing ? (
    <>
      {/*TODO : on hover, animation texte apparait et push les autres icones sans saut*/}
      <button
        onClick={handleStartEditing}
        className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
        title="Modifier"
      >
        <Pencil className="h-[13px] w-[13px]" />
      </button>
      {deleteButton}
    </>
  ) : null;
  const reportButton = !isOwn && currentUserId ? (
    <button
      onClick={handleReport}
      className="p-[4px] rounded hover:bg-error-bg text-text-muted hover:text-error cursor-pointer transition-colors"
      title="Signaler"
    >
      <Flag className="h-[13px] w-[13px]" />
    </button>
  ) : null;
  const reactionPicker = canReact ? (
    <ReactionPicker onSelect={handleReactionSelect} />
  ) : null;
  const editContentNode = editing ? (
    <div className="mt-[4px] w-full space-y-[6px]">
      <textarea
        value={editContent}
        onChange={handleEditContentChange}
        onKeyDown={handleKeyDown}
        rows={2}
        className="w-full bg-bg-elevated border border-border-default rounded-lg px-[12px] py-[8px] text-[13px] text-text-primary focus:border-primary-500 focus:outline-none resize-none"
        autoFocus
      />
      <p className="text-[10px] text-text-muted mt-[2px]">Échap pour annuler · Entrée pour sauvegarder</p>
    </div>
  ) : null;
  const messageContentNode = editing ? editContentNode : (
    <>
      {contentNode}
      {failedNode}
      {imageNode}
      {forumEmbedNode}
    </>
  );

  const clearDeleteConfirmTimeout = useCallback(() => {
    if (deleteConfirmTimeoutRef.current === null) return;
    window.clearTimeout(deleteConfirmTimeoutRef.current);
    deleteConfirmTimeoutRef.current = null;
  }, []);

  const manageDeleteConfirmTimeoutEffect = useCallback(() => {
    clearDeleteConfirmTimeout();
    if (!deleteConfirming) return;

    deleteConfirmTimeoutRef.current = window.setTimeout(handleCancelDeleteConfirming, 3000);

    return clearDeleteConfirmTimeout;
  }, [clearDeleteConfirmTimeout, deleteConfirming, handleCancelDeleteConfirming]);

  useEffect(manageDeleteConfirmTimeoutEffect, [manageDeleteConfirmTimeoutEffect]);

  // Deleted message
  // TODO: Add revert option / rollback deletion
  if (deleted || (!message.content && !message.image_url)) {
    return (
      <div className={cn("flex items-start gap-[12px] px-[16px] py-[8px]", isOwn && "flex-row-reverse")}>
        <UserHoverCard
          authorId={message.author_id}
          x_handle={message.author.x_handle}
          full_name={message.author.full_name}
          avatar_url={message.author.avatar_url}
        >
          <Avatar src={message.author.avatar_url} name={message.author.x_handle} size="md" />
        </UserHoverCard>
        <div className={cn("min-w-0", isOwn ? "max-w-[75%] sm:max-w-[620px] flex flex-col items-end" : "flex-1")}>
          <div className={cn("flex items-baseline gap-[8px]", isOwn && "justify-end text-right")}>
            <span className="text-[13px] font-semibold text-text-primary">
              @{message.author.x_handle}
            </span>
            <span className="text-[10px] text-text-muted">
              {timeAgo(message.created_at)}
            </span>
          </div>
          <p className={cn("text-[13px] text-text-muted italic mt-[2px]", isOwn && "text-right")}>
            Ce message a été supprimé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-[12px] px-[16px] py-[8px] transition-colors group relative",
        isOwn ? "flex-row-reverse hover:bg-primary-50/20" : "hover:bg-bg-surface/50",
        message.is_pinned && (isOwn
          ? "bg-primary-50/30 border-r-2 border-primary-500"
          : "bg-primary-50/30 border-l-2 border-primary-500")
      )}
    >
      <UserHoverCard
        authorId={message.author_id}
        x_handle={message.author.x_handle}
        full_name={message.author.full_name}
        avatar_url={message.author.avatar_url}
      >
        <Avatar src={message.author.avatar_url} name={message.author.x_handle} size="md" className="cursor-pointer" />
      </UserHoverCard>
      <div
        className={cn(
          "min-w-0",
          isOwn ? "max-w-[75%] sm:max-w-[620px] flex flex-col items-end" : "flex-1",
          isOwn && editing && "w-[75%]"
        )}
      >
        <div className={cn("flex items-baseline gap-[8px]", isOwn && "justify-end text-right")}>
          {pinnedIcon}
          <UserHoverCard
            authorId={message.author_id}
            x_handle={message.author.x_handle}
            full_name={message.author.full_name}
            avatar_url={message.author.avatar_url}
          >
            <span className="text-[13px] font-semibold text-text-primary cursor-pointer hover:underline">
              @{message.author.x_handle}
            </span>
          </UserHoverCard>
          <span className="text-[10px] text-text-muted">
            {timeAgo(message.created_at)}
          </span>
          {editedLabel}
        </div>

        {/* Content or edit form */}
        {messageContentNode}

        {/* Reactions */}
        {reactionsNode}
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "absolute top-[4px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-[2px]",
          isOwn ? "left-[12px]" : "right-[12px]"
        )}
      >
        {adminPinButton}
        {ownerActions}
        {reportButton}
        {reactionPicker}
      </div>
    </div>
  );
}

function DeleteButton({ saving, onConfirm }: { saving: boolean; onConfirm: () => void }) {
  return (
    <button
      onClick={onConfirm}
      disabled={saving}
      className="p-[4px] rounded hover:bg-error-bg cursor-pointer transition-colors disabled:opacity-50 text-text-muted hover:text-error"
      title="Supprimer"
      aria-label="Supprimer le message"
    >
      <Trash2 className="h-[13px] w-[13px]" />
    </button>
  );
}

function ConfirmDeleteButton({ saving, onDelete, onCancel }: { saving: boolean; onDelete: () => void; onCancel: () => void }) {
  return (
    <button
      onClick={onDelete}
      onMouseLeave={onCancel}
      disabled={saving}
      className="p-[4px] rounded hover:bg-error-bg cursor-pointer transition-colors disabled:opacity-50 bg-error-bg text-error"
      title="Confirmer la suppression"
      aria-label="Confirmer la suppression du message"
    >
      <Check className="h-[13px] w-[13px]" />
    </button>
  );
}
