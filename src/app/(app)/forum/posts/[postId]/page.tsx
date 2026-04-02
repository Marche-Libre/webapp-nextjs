import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/forum/post-detail";
import { ForumBreadcrumb } from "@/components/forum/forum-breadcrumb";
import type { ForumTag } from "@/lib/types/database";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, author:profiles(x_handle, full_name, avatar_url), category:forum_categories(name, slug)")
    .eq("id", postId)
    .single();

  if (!post) notFound();

  // Fetch tags for this post
  const { data: postTags } = await supabase
    .from("forum_post_tags")
    .select("tag:forum_tags(*)")
    .eq("post_id", postId);

  const tags: ForumTag[] = postTags?.map((pt) => pt.tag as unknown as ForumTag) || [];

  // Fetch replies
  const { data: replies } = await supabase
    .from("forum_replies")
    .select("*, author:profiles(x_handle, full_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const category = post.category as unknown as { name: string; slug: string };

  return (
    <div className="space-y-[16px]">
      <ForumBreadcrumb crumbs={[
        { label: "Forum", href: "/forum" },
        { label: category?.name || "Catégorie", href: `/forum/${category?.slug || ""}` },
        { label: post.title },
      ]} />

      <PostDetail
        post={{ ...post, tags, author: post.author as any } as any}
        replies={(replies || []) as any}
        postId={postId}
      />
    </div>
  );
}
