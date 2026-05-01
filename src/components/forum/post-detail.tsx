/**
 * @ARCHIVED - Potentially unused
 * Forum feature marked as "parked" (DEC-003 open)
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { TagBadge } from "@/components/ui/tag-badge";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Pin, Lock, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { ForumPost, ForumTag, ForumReply } from "@/lib/types/database";
import { ReplyForm } from "./reply-form";

interface PostDetailProps {
  post: ForumPost & {
    author: { x_handle: string; full_name: string; avatar_url: string | null };
    tags: ForumTag[];
  };
  replies: (ForumReply & {
    author: { x_handle: string; full_name: string; avatar_url: string | null };
  })[];
  postId: string;
  currentUserId: string | null;
  isAdmin: boolean;
  categorySlug: string;
}

export function PostDetail({ post, replies: initialReplies, postId, currentUserId, isAdmin, categorySlug }: PostDetailProps) {
  const router = useRouter();
  const [replies, setReplies] = useState(initialReplies);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);

  const canDeletePost = currentUserId === post.author_id || isAdmin;

  const handleDeletePost = async () => {
    if (!confirmDeletePost) {
      setConfirmDeletePost(true);
      return;
    }
    setDeletingPost(true);
    const supabase = createClient();
    const { error } = await supabase.from("forum_posts").delete().eq("id", postId);
    if (!error) {
      router.push(categorySlug ? `/forum/${categorySlug}` : "/forum");
    }
    setDeletingPost(false);
  };

  const handleDeleteReply = async (replyId: string) => {
    if (deletingReplyId === replyId) return;
    setDeletingReplyId(replyId);
    const supabase = createClient();
    const { error } = await supabase.from("forum_replies").delete().eq("id", replyId);
    if (!error) {
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    }
    setDeletingReplyId(null);
  };

  return (
    <div className="space-y-[24px]">
      {/* Post */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] shadow-card">
        <div className="flex items-start gap-[16px]">
          <Avatar
            src={post.author.avatar_url}
            name={post.author.x_handle}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[8px] flex-wrap mb-[4px]">
              {post.is_pinned && <Pin className="h-3.5 w-3.5 text-primary-500" />}
              {post.is_locked && <Lock className="h-3.5 w-3.5 text-warning" />}
              <h1 className="font-display text-xl font-bold text-text-primary tracking-[-0.02em]">
                {post.title}
              </h1>
              <FavoriteButton
                item={{
                  id: `post:${postId}`,
                  label: post.title,
                  href: `/forum/posts/${postId}`,
                  type: "post",
                }}
                size="md"
              />
            </div>
            <div className="flex items-center gap-[8px] mb-[16px] flex-wrap">
              <span className="text-[13px] font-medium text-text-primary">
                @{post.author.x_handle}
              </span>
              <span className="text-[12px] text-text-muted">
                {formatDate(post.created_at)}
              </span>
              {post.tags.map((tag) => (
                <TagBadge key={tag.id} name={tag.name} color={tag.color} />
              ))}
            </div>
            <div className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </div>

            {/* Delete post button */}
            {canDeletePost && (
              <div className="mt-[16px] pt-[16px] border-t border-border-subtle">
                {confirmDeletePost ? (
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[12px] text-text-muted">Supprimer ce post et toutes ses réponses ?</span>
                    <button
                      onClick={handleDeletePost}
                      disabled={deletingPost}
                      className="text-[12px] font-medium text-error hover:text-error/80 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {deletingPost ? "Suppression…" : "Confirmer"}
                    </button>
                    <button
                      onClick={() => setConfirmDeletePost(false)}
                      className="text-[12px] text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-[6px] text-[12px] text-text-muted hover:text-error cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-[14px] w-[14px]" />
                    Supprimer le post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em] mb-[16px]">
          {replies.length} réponse{replies.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-[12px]">
          {replies.map((reply) => {
            const canDeleteReply = currentUserId === reply.author_id || isAdmin;
            return (
              <div
                key={reply.id}
                className="bg-bg-base rounded-xl border border-border-default p-[20px] group"
              >
                <div className="flex items-start gap-[12px]">
                  <Avatar
                    src={reply.author.avatar_url}
                    name={reply.author.x_handle}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <span className="text-[13px] font-medium text-text-primary">
                        @{reply.author.x_handle}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {formatDate(reply.created_at)}
                      </span>
                      {reply.author_id === post.author_id && (
                        <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-[6px] py-[1px] rounded-full">
                          Auteur
                        </span>
                      )}
                      {canDeleteReply && (
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          disabled={deletingReplyId === reply.id}
                          className="opacity-0 group-hover:opacity-100 ml-auto p-[4px] rounded hover:bg-error-bg text-text-muted hover:text-error cursor-pointer transition-all disabled:opacity-50"
                          title="Supprimer cette réponse"
                        >
                          <Trash2 className="h-[13px] w-[13px]" />
                        </button>
                      )}
                    </div>
                    <div className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
                      {reply.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply form */}
      {!post.is_locked && (
        <ReplyForm postId={postId} />
      )}

      {post.is_locked && (
        <div className="flex items-center gap-[8px] p-[16px] rounded-lg bg-warning-bg/50 text-[13px] text-warning">
          <Lock className="h-4 w-4" />
          Ce post est verrouillé. Vous ne pouvez plus y répondre.
        </div>
      )}
    </div>
  );
}
