"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import { ReactionPicker } from "./reaction-picker";
import { Pencil, Trash2, Check, Flag, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types/database";
import { PostEmbed } from "./post-embed";
import { UserHoverCard } from "./user-hover-card";

const MENTION_REGEX = /@([A-Za-z0-9_]+)/g;

function renderContentWithMentions(content: string) {
  const parts: React.ReactNode[] = [];
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
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  onReact?: (emoji: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onMessageUpdated?: () => void;
}

const FORUM_LINK_REGEX = /\/forum\/posts\/([a-f0-9-]+)/;
const DELETE_BUTTON_BASE_CLASS = "p-[4px] rounded hover:bg-error-bg cursor-pointer transition-colors disabled:opacity-50";

export function MessageBubble({ message, reactions, onReact, currentUserId, isAdmin, onMessageUpdated }: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [deleted, setDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const isOwn = currentUserId === message.author_id;
  const canReact = Boolean(onReact);
  const isSending = message._status === "sending";
  const isFailed = message._status === "failed";
  // Consider edited only if updated_at is more than 2 seconds after created_at
  const isEdited = message.updated_at && message.created_at
    && (new Date(message.updated_at).getTime() - new Date(message.created_at).getTime() > 2000);
  const forumMatch = message.content.match(FORUM_LINK_REGEX);

  const supabase = createClient();

  useEffect(() => {
    if (!deleteConfirming) return;

    const timeout = window.setTimeout(() => {
      setDeleteConfirming(false);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [deleteConfirming]);

  const handleSaveEdit = async () => {
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
  };

  const handleDelete = async () => {
    setSaving(true);
    await supabase
      .from("messages")
      .update({ content: "", updated_at: new Date().toISOString() })
      .eq("id", message.id);
    setDeleted(true);
    setDeleteConfirming(false);
    setSaving(false);
    onMessageUpdated?.();
  };

  const handleTogglePin = async () => {
    await supabase
      .from("messages")
      .update({ is_pinned: !message.is_pinned })
      .eq("id", message.id);
    onMessageUpdated?.();
  };

  const handleReport = async () => {
    const reason = prompt("Raison du signalement :");
    if (!reason) return;
    const supabase = createClient();
    await supabase.from("user_reports").insert({
      reporter_id: currentUserId,
      reported_id: message.author_id,
      message_id: message.id,
      reason,
    });
    alert("Signalement envoyé. Un administrateur examinera ce message.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditContent(message.content);
    }
  };

  // Deleted message
  // TODO: Add revert option / rollback deletion
  if (deleted || (!message.content && !message.image_url)) {
    return (
      <div className="flex items-start gap-[12px] px-[16px] py-[8px]">
        <Avatar src={message.author.avatar_url} name={message.author.x_handle} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-[8px]">
            <span className="text-[13px] font-semibold text-text-primary">
              @{message.author.x_handle}
            </span>
            <span className="text-[10px] text-text-muted">
              {timeAgo(message.created_at)}
            </span>
          </div>
          <p className="text-[13px] text-text-muted italic mt-[2px]">
            Ce message a été supprimé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-[12px] px-[16px] py-[8px] hover:bg-bg-surface/50 transition-colors group relative ${message.is_pinned ? "bg-primary-50/30 border-l-2 border-primary-500" : ""}`}>
      <UserHoverCard authorId={message.author_id} x_handle={message.author.x_handle} avatar_url={message.author.avatar_url}>
        <Avatar src={message.author.avatar_url} name={message.author.x_handle} size="md" className="cursor-pointer" />
      </UserHoverCard>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-[8px]">
          {message.is_pinned && (
            <Pin className="h-[11px] w-[11px] text-primary-500 shrink-0 translate-y-[1px]" />
          )}
          <UserHoverCard authorId={message.author_id} x_handle={message.author.x_handle} avatar_url={message.author.avatar_url}>
            <span className="text-[13px] font-semibold text-text-primary cursor-pointer hover:underline">
              @{message.author.x_handle}
            </span>
          </UserHoverCard>
          <span className="text-[10px] text-text-muted">
            {timeAgo(message.created_at)}
          </span>
          {isEdited && !editing && (
            <span className="text-[10px] text-text-muted italic">(modifié)</span>
          )}
        </div>

        {/* Content or edit form */}
        {editing ? (
          <div className="mt-[4px] space-y-[6px]">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full bg-bg-elevated border border-border-default rounded-lg px-[12px] py-[8px] text-[13px] text-text-primary focus:border-primary-500 focus:outline-none resize-none"
              autoFocus
            />
            <p className="text-[10px] text-text-muted mt-[2px]">Échap pour annuler · Entrée pour sauvegarder</p>
          </div>
        ) : (
          <>
            <div className={`text-[13px] mt-[2px] whitespace-pre-wrap break-words ${isSending ? "text-text-secondary opacity-50" : isFailed ? "text-error/70" : "text-text-secondary"}`}>
              {renderContentWithMentions(message.content)}
            </div>
            {isFailed && (
              <p className="text-[11px] text-error mt-[2px]">
                Échec de l&apos;envoi — vérifiez votre connexion
              </p>
            )}
            {message.image_url && (() => {
              let urls: string[];
              try {
                const parsed = JSON.parse(message.image_url);
                urls = Array.isArray(parsed) ? parsed : [message.image_url];
              } catch {
                urls = [message.image_url];
              }
              return (
                <div className={urls.length > 1 ? "mt-[8px] flex gap-[6px] flex-wrap" : "mt-[8px]"}>
                  {urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Image ${i + 1}`}
                      className="rounded-lg max-w-[400px] max-h-[300px] object-cover border border-border-default"
                    />
                  ))}
                </div>
              );
            })()}
            {forumMatch && <PostEmbed postId={forumMatch[1]} />}
          </>
        )}

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="flex gap-[4px] mt-[6px] flex-wrap">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={canReact ? () => onReact?.(r.emoji) : undefined}
                disabled={!canReact}
                className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] border transition-all ${
                  r.hasReacted
                    ? "bg-primary-50 border-primary-500/30 text-primary-700"
                    : "bg-bg-surface border-border-default text-text-muted hover:border-border-strong"
                } ${canReact ? "cursor-pointer" : "cursor-default"}`}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute top-[4px] right-[12px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-[2px]">
        {isAdmin && (
          <button
            onClick={handleTogglePin}
            className={`p-[4px] rounded hover:bg-bg-surface cursor-pointer transition-colors ${message.is_pinned ? "text-primary-500" : "text-text-muted hover:text-text-secondary"}`}
            title={message.is_pinned ? "Désépingler" : "Épingler"}
          >
            <Pin className="h-[13px] w-[13px]" />
          </button>
        )}
        {isOwn && !editing && (
          <>
            {/*TODO : on hover, animation texte apparait et push les autres icones sans saut*/}
            <button
              onClick={() => setEditing(true)}
              className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
              title="Modifier"
            >
              <Pencil className="h-[13px] w-[13px]" />
            </button>

            {deleteConfirming ? (
              <ConfirmDeleteButton
                saving={saving}
                onDelete={handleDelete}
                onCancel={() => setDeleteConfirming(false)}
              />
            ) : (
              <DeleteButton
                saving={saving}
                onConfirm={() => setDeleteConfirming(true)}
              />
            )}
          </>
        )}
        {!isOwn && currentUserId && (
          <button
            onClick={handleReport}
            className="p-[4px] rounded hover:bg-error-bg text-text-muted hover:text-error cursor-pointer transition-colors"
            title="Signaler"
          >
            <Flag className="h-[13px] w-[13px]" />
          </button>
        )}
        {canReact && (
          <ReactionPicker onSelect={(emoji) => onReact?.(emoji)} />
        )}
      </div>
    </div>
  );
}

function DeleteButton({ saving, onConfirm }: { saving: boolean; onConfirm: () => void }) {
  return (
    <button
      onClick={onConfirm}
      disabled={saving}
      className={`${DELETE_BUTTON_BASE_CLASS} text-text-muted hover:text-error`}
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
      className={`${DELETE_BUTTON_BASE_CLASS} bg-error-bg text-error`}
      title="Confirmer la suppression"
      aria-label="Confirmer la suppression du message"
    >
      <Check className="h-[13px] w-[13px]" />
    </button>
  );
}
