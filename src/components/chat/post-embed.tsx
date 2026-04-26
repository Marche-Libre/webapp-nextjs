/**
 * @ARCHIVED - Potentially unused
 * Link preview not in Beta 1 requirements (FR-005/FR-006)
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

interface PostEmbedProps {
  postId: string;
}

export function PostEmbed({ postId }: PostEmbedProps) {
  const [post, setPost] = useState<{ title: string; reply_count: number; author: { x_handle: string } } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("forum_posts")
      .select("title, reply_count, author:profiles!forum_posts_author_id_fkey(x_handle)")
      .eq("id", postId)
      .single()
      .then(({ data }) => {
        if (data) setPost(data as any);
      });
  }, [postId]);

  if (!post) return null;

  return (
    <Link
      href={`/forum/posts/${postId}`}
      className="mt-[8px] block p-[12px] rounded-lg border border-border-default bg-bg-elevated hover:border-border-strong transition-colors max-w-[400px]"
    >
      <div className="flex items-start gap-[8px]">
        <MessagesSquare className="h-[16px] w-[16px] text-primary-500 shrink-0 mt-[2px]" />
        <div>
          <p className="text-[13px] font-medium text-text-primary line-clamp-1">{post.title}</p>
          <p className="text-[11px] text-text-muted mt-[2px]">
            @{post.author.x_handle} · {post.reply_count} réponse{post.reply_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
