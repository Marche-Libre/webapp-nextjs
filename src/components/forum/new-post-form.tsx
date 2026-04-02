"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { notifyMentions } from "@/lib/notifications";
import type { ForumCategory, ForumTag } from "@/lib/types/database";

interface NewPostFormProps {
  categories: ForumCategory[];
  tags: ForumTag[];
  defaultCategorySlug?: string;
}

export function NewPostForm({ categories, tags, defaultCategorySlug }: NewPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<ForumTag[]>([]);
  const [categoryId, setCategoryId] = useState(() => {
    if (defaultCategorySlug) {
      return categories.find((c) => c.slug === defaultCategorySlug)?.id || "";
    }
    return "";
  });
  const router = useRouter();

  const toggleTag = (tag: ForumTag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string).trim();
    const content = (formData.get("content") as string).trim();

    if (!title || !content || !categoryId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .insert({
        category_id: categoryId,
        author_id: user.id,
        title,
        content,
      })
      .select("id")
      .single();

    if (postError || !post) {
      setError("Erreur lors de la publication.");
      setLoading(false);
      return;
    }

    // Add tags
    if (selectedTags.length > 0) {
      await supabase.from("forum_post_tags").insert(
        selectedTags.map((t) => ({ post_id: post.id, tag_id: t.id }))
      );
    }

    // Fire-and-forget mention notifications
    notifyMentions(supabase, {
      content,
      authorId: user.id,
      type: "forum_mention",
      link: `/forum/posts/${post.id}`,
    });

    router.push(`/forum/posts/${post.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[16px]">
      {error && (
        <div className="p-2.5 rounded-lg bg-error/10 text-sm text-error">
          {error}
        </div>
      )}

      <Select
        id="category"
        label="Catégorie"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        placeholder="Choisir une catégorie"
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        required
      />

      <Input
        id="title"
        name="title"
        label="Titre"
        placeholder="Titre de votre post"
        required
      />

      <Textarea
        id="content"
        name="content"
        label="Contenu"
        placeholder="Rédigez votre message…"
        rows={8}
        required
      />

      {/* Tag selector */}
      <div>
        <p className="text-[12px] font-medium text-text-secondary mb-[8px]">
          Tags (optionnel)
        </p>
        <div className="flex flex-wrap gap-[6px]">
          {tags.map((tag) => {
            const isSelected = selectedTags.find((t) => t.id === tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer rounded-md px-[10px] py-[4px] text-[11px] font-medium border transition-all ${
                  isSelected
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-75"
                }`}
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color || undefined,
                  borderColor: `${tag.color}30`,
                }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          <Send className="h-3.5 w-3.5" />
          {loading ? "Publication…" : "Publier"}
        </Button>
      </div>
    </form>
  );
}
