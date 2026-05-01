/**
 * @ARCHIVED - Potentially unused
 * Forum feature marked as "parked" (DEC-003 open)
 */
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RecentPost {
  id: string;
  title: string;
  created_at: string;
  author: { x_handle: string; full_name: string; avatar_url: string | null };
  category: { name: string; color: string | null; slug: string };
}

interface RecentPostsProps {
  posts: RecentPost[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="space-y-[8px]">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/forum/posts/${post.id}`}
          className="flex items-center gap-[12px] p-[12px] rounded-lg border border-border-default bg-bg-base hover:border-border-strong transition-all duration-150"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-medium text-text-primary truncate">
              {post.title}
            </h4>
            <div className="flex items-center gap-[8px] mt-[4px] flex-wrap">
              <span className="text-[11px] text-text-muted">
                @{post.author.x_handle}
              </span>
              <span
                className="text-[10px] font-medium px-[6px] py-[1px] rounded-full"
                style={{
                  backgroundColor: `${post.category.color || "#6b7280"}15`,
                  color: post.category.color || "#6b7280",
                }}
              >
                {post.category.name}
              </span>
              <span className="text-[11px] text-text-muted">
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
