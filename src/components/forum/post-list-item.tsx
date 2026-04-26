/**
 * @ARCHIVED - Potentially unused
 * Forum feature marked as "parked" (DEC-003 open)
 */
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { TagBadge } from "@/components/ui/tag-badge";
import { MessageSquare, Pin } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { ForumTag } from "@/lib/types/database";

interface PostListItemProps {
  id: string;
  title: string;
  authorHandle: string;
  authorAvatarUrl?: string | null;
  replyCount: number;
  createdAt: string;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: ForumTag[];
}

export function PostListItem({
  id,
  title,
  authorHandle,
  authorAvatarUrl,
  replyCount,
  createdAt,
  isPinned,
  tags,
}: PostListItemProps) {
  return (
    <Link
      href={`/forum/posts/${id}`}
      className="flex items-center gap-[12px] p-[16px] rounded-lg border border-border-default bg-bg-base hover:border-border-strong transition-all duration-150"
    >
      <Avatar src={authorAvatarUrl} name={authorHandle} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] flex-wrap">
          {isPinned && (
            <Pin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
          )}
          <h3 className="text-[14px] font-semibold text-text-primary truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-[8px] mt-[4px] flex-wrap">
          <span className="text-[12px] font-medium text-text-secondary">
            @{authorHandle}
          </span>
          <span className="text-[11px] text-text-muted">
            {timeAgo(createdAt)}
          </span>
          {tags && tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-[6px] text-text-muted shrink-0">
        <MessageSquare className="h-[14px] w-[14px]" />
        <span className="text-[12px] font-medium">{replyCount}</span>
      </div>
    </Link>
  );
}
