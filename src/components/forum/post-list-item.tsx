import Link from "next/link";
import { TagBadge } from "@/components/ui/tag-badge";
import { MessageSquare, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ForumTag } from "@/lib/types/database";

interface PostListItemProps {
  id: string;
  title: string;
  authorHandle: string;
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
  replyCount,
  createdAt,
  isPinned,
  tags,
}: PostListItemProps) {
  return (
    <Link
      href={`/forum/posts/${id}`}
      className="flex items-center gap-[16px] p-[16px] rounded-lg border border-border-default bg-bg-base hover:border-border-strong transition-all duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] flex-wrap">
          {isPinned && (
            <Pin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
          )}
          <h3 className="text-[14px] font-semibold text-text-primary truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-[8px] mt-[6px] flex-wrap">
          <span className="text-[12px] text-text-muted">
            @{authorHandle}
          </span>
          <span className="text-[11px] text-text-muted">
            {formatDate(createdAt)}
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
