import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostListItem } from "@/components/forum/post-list-item";
import { ForumBreadcrumb } from "@/components/forum/forum-breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, MessagesSquare } from "lucide-react";
import Link from "next/link";
import type { ForumTag } from "@/lib/types/database";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, title, reply_count, created_at, is_pinned, is_locked, author:profiles!forum_posts_author_id_fkey(x_handle, avatar_url)")
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch tags for all posts
  const postIds = posts?.map((p) => p.id) || [];
  let postTagsMap: Record<string, ForumTag[]> = {};

  if (postIds.length > 0) {
    const { data: postTags } = await supabase
      .from("forum_post_tags")
      .select("post_id, tag:forum_tags(*)")
      .in("post_id", postIds);

    postTags?.forEach((pt) => {
      const tag = pt.tag as unknown as ForumTag;
      if (!postTagsMap[pt.post_id]) postTagsMap[pt.post_id] = [];
      postTagsMap[pt.post_id].push(tag);
    });
  }

  return (
    <div className="space-y-[24px]">
      <div>
        <div className="mb-[12px]">
          <ForumBreadcrumb crumbs={[
            { label: "Forum", href: "/forum" },
            { label: category.name },
          ]} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm text-text-secondary mt-[4px]">
                {category.description}
              </p>
            )}
          </div>
          <Link href={`/forum/posts/nouveau?category=${category.slug}`}>
            <Button>
              <Plus className="h-4 w-4" />
              Nouveau post
            </Button>
          </Link>
        </div>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-[8px]">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              id={post.id}
              title={post.title}
              authorHandle={(post.author as any)?.x_handle || "?"}
              authorAvatarUrl={(post.author as any)?.avatar_url}
              replyCount={post.reply_count}
              createdAt={post.created_at}
              isPinned={post.is_pinned}
              isLocked={post.is_locked}
              tags={postTagsMap[post.id]}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessagesSquare className="h-[24px] w-[24px] text-text-muted" />}
          title="Aucun post"
          description="Soyez le premier à publier dans cette catégorie."
          action={
            <Link href={`/forum/posts/nouveau?category=${category.slug}`}>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                Créer un post
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
