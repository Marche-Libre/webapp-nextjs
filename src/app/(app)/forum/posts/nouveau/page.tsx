import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { NewPostForm } from "@/components/forum/new-post-form";
import { ForumBreadcrumb } from "@/components/forum/forum-breadcrumb";

export default async function NouveauPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("order", { ascending: true });

  const { data: tags } = await supabase
    .from("forum_tags")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-2xl space-y-[16px]">
      <ForumBreadcrumb crumbs={[
        { label: "Forum", href: "/forum" },
        { label: "Nouveau post" },
      ]} />

      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Nouveau post
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Partagez avec la communauté
        </p>
      </div>

      <Card className="shadow-card">
        <NewPostForm
          categories={categories || []}
          tags={tags || []}
          defaultCategorySlug={categorySlug}
        />
      </Card>
    </div>
  );
}
