"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ReplyFormProps {
  postId: string;
}

export function ReplyForm({ postId }: ReplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("forum_replies").insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
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
      <div className="flex justify-end mt-[12px]">
        <Button type="submit" disabled={loading || !content.trim()}>
          <Send className="h-3.5 w-3.5" />
          {loading ? "Envoi…" : "Répondre"}
        </Button>
      </div>
    </form>
  );
}
