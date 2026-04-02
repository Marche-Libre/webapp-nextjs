"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { notifyForumReply, notifyMentions } from "@/lib/notifications";

interface ReplyFormProps {
  postId: string;
}

export function ReplyForm({ postId }: ReplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error: insertError } = await supabase.from("forum_replies").insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
    });

    if (insertError) {
      setError("Erreur lors de l'envoi. Réessayez.");
      setLoading(false);
      return;
    }

    // Fire-and-forget notifications
    notifyForumReply(supabase, { postId, replyAuthorId: user.id });
    notifyMentions(supabase, {
      content: content.trim(),
      authorId: user.id,
      type: "forum_mention",
      link: `/forum/posts/${postId}`,
    });

    setContent("");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-base rounded-xl border border-border-default p-[20px] shadow-card">
      <Textarea
        id="reply_content"
        label="Votre réponse"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrire une réponse…"
        rows={4}
      />
      {error && (
        <p className="text-[12px] text-error mt-[8px]">{error}</p>
      )}
      <div className="flex justify-end mt-[12px]">
        <Button type="submit" disabled={loading || !content.trim()}>
          <Send className="h-3.5 w-3.5" />
          {loading ? "Envoi…" : "Répondre"}
        </Button>
      </div>
    </form>
  );
}
