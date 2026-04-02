"use client";

import { useState, useRef } from "react";
import { Send, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MessageInputProps {
  channelId: string;
  userId: string;
}

export function MessageInput({ channelId, userId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (imageUrl?: string) => {
    const text = content.trim();
    if (!text && !imageUrl) return;

    setSending(true);
    const supabase = createClient();

    await supabase.from("messages").insert({
      channel_id: channelId,
      author_id: userId,
      content: text || (imageUrl ? "📷" : ""),
      image_url: imageUrl || null,
    });

    setContent("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const path = `${channelId}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("chat-images")
      .upload(path, file);

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(data.path);

      await sendMessage(urlData.publicUrl);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="px-[12px] py-[12px]">
      <div className="flex items-center gap-[8px] bg-bg-base border border-border-subtle rounded-lg px-[12px] py-[8px]">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer shrink-0 transition-colors"
        >
          <ImagePlus className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none resize-none max-h-[120px]"
        />
        <button
          onClick={() => sendMessage()}
          disabled={sending || (!content.trim())}
          className="p-[4px] rounded hover:bg-bg-surface text-primary-500 hover:text-primary-600 cursor-pointer shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </div>
      {uploading && (
        <p className="text-[11px] text-text-muted mt-[4px]">Upload en cours…</p>
      )}
    </div>
  );
}
