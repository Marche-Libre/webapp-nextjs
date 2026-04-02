import { createClient } from "@/lib/supabase/server";
import { CategoryCard } from "@/components/forum/category-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default async function ForumPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("order", { ascending: true });

  // Get post counts per category
  const { data: posts } = await supabase
    .from("forum_posts")
    .select("category_id");

  const countMap: Record<string, number> = {};
  posts?.forEach((p) => {
    countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });

  // Get intro category IDs to filter from main feed
  const introCatIds = (categories ?? [])
    .filter((c) => c.is_introduction)
    .map((c) => c.id);

  // Get 5 most recent posts (excluding introductions) with author, category, and content preview
  let recentPostsQuery = supabase
    .from("forum_posts")
    .select("id, title, content, reply_count, created_at, author:profiles!forum_posts_author_id_fkey(x_handle, full_name, avatar_url), category:forum_categories(name, color, slug)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (introCatIds.length > 0) {
    recentPostsQuery = recentPostsQuery.not("category_id", "in", `(${introCatIds.join(",")})`);
  }

  const { data: recentPosts } = await recentPostsQuery;

  return (
    <div className="space-y-[24px]">
      {/* Recent posts — preview cards */}
      {recentPosts && recentPosts.length > 0 && (
        <section>
          <h2 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em] mb-[12px]">
            Dernières publications
          </h2>
          <div className="space-y-[8px]">
            {recentPosts.map((post) => {
              const author = post.author as unknown as { x_handle: string; full_name: string; avatar_url: string | null };
              const category = post.category as unknown as { name: string; color: string | null; slug: string };
              return (
                <Link
                  key={post.id}
                  href={`/forum/posts/${post.id}`}
                  className="flex gap-[14px] p-[16px] rounded-xl border border-border-default bg-bg-base hover:border-border-strong hover:shadow-card-hover transition-all duration-150"
                >
                  <Avatar
                    src={author?.avatar_url}
                    name={author?.x_handle || "?"}
                    size="md"
                    className="shrink-0 mt-[2px]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px] mb-[4px] flex-wrap">
                      <h3 className="text-[14px] font-semibold text-text-primary truncate">
                        {post.title}
                      </h3>
                      <span
                        className="text-[10px] font-medium px-[6px] py-[1px] rounded-full shrink-0"
                        style={{
                          backgroundColor: `${category?.color || "#6b7280"}15`,
                          color: category?.color || "#6b7280",
                        }}
                      >
                        {category?.name}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-secondary line-clamp-2 leading-relaxed mb-[8px]">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-[10px] text-[11px] text-text-muted">
                      <span className="font-medium">@{author?.x_handle}</span>
                      <span>{timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-[3px]">
                        <MessageSquare className="h-3 w-3" />
                        {post.reply_count}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories grid */}
      <section>
        <div className="flex items-center justify-between mb-[12px]">
          <h2 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
            Catégories
          </h2>
          <Link href="/forum/posts/nouveau">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nouveau post
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-[12px]">
          {categories?.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              postCount={countMap[cat.id] || 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
