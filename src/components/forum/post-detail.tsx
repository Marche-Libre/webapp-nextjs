import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/ui/tag-badge";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Pin, Lock } from "lucide-react";
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
}

export function PostDetail({ post, replies, postId }: PostDetailProps) {
  return (
    <div className="space-y-[24px]">
      {/* Post */}
      <div className="bg-bg-base rounded-xl border border-border-default p-[24px] shadow-card">
        <div className="flex items-start gap-[16px]">
          <Avatar
            src={post.author.avatar_url}
            name={post.author.full_name}
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
          </div>
        </div>
      </div>

      {/* Replies */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em] mb-[16px]">
          {replies.length} réponse{replies.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-[12px]">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-bg-base rounded-xl border border-border-default p-[20px]"
            >
              <div className="flex items-start gap-[12px]">
                <Avatar
                  src={reply.author.avatar_url}
                  name={reply.author.full_name}
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
                  </div>
                  <div className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
