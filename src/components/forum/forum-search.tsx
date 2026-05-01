/**
 * @ARCHIVED - Potentially unused
 * Forum feature marked as "parked" (DEC-003 open)
 */
"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { PostListItem } from "@/components/forum/post-list-item";
import { createClient } from "@/lib/supabase/client";
import type { ForumTag } from "@/lib/types/database";

export function ForumSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults(null);
      return;
    }

    setSearching(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("forum_posts")
      .select("id, title, reply_count, created_at, is_pinned, author:profiles!forum_posts_author_id_fkey(x_handle, avatar_url)")
      .textSearch("title", value, { type: "websearch", config: "french" })
      .order("created_at", { ascending: false })
      .limit(10);

    setResults(data || []);
    setSearching(false);
  };

  return (
    <div>
      <SearchInput
        value={query}
        onChange={handleSearch}
        placeholder="Rechercher un post…"
      />
      {results !== null && (
        <div className="mt-[16px] space-y-[8px]">
          {searching && (
            <p className="text-[13px] text-text-muted">Recherche en cours…</p>
          )}
          {!searching && results.length === 0 && (
            <p className="text-[13px] text-text-muted">Aucun résultat pour « {query} »</p>
          )}
          {!searching && results.map((post) => (
            <PostListItem
              key={post.id}
              id={post.id}
              title={post.title}
              authorHandle={(post.author as any)?.x_handle || "?"}
              authorAvatarUrl={(post.author as any)?.avatar_url}
              replyCount={post.reply_count}
              createdAt={post.created_at}
              isPinned={post.is_pinned}
            />
          ))}
        </div>
      )}
    </div>
  );
}
