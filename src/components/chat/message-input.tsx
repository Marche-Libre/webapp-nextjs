"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notifyMentions } from "@/lib/notifications";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

const MAX_IMAGES = 3;

interface MessageInputProps {
  channelId: string;
  userId: string;
  onOptimisticMessage?: (content: string, imageUrl?: string) => string;
  onMessageConfirmed?: (optimisticId: string, realMessage: any) => void;
  onMessageFailed?: (optimisticId: string) => void;
}

type MentionSuggestion = {
  id: string;
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
};

export function MessageInput({ channelId, userId, onOptimisticMessage, onMessageConfirmed, onMessageFailed }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    const text = content.trim();
    const images = pendingImages;
    if (!text && images.length === 0) return;

    const msgContent = text || (images.length > 0 ? "📷" : "");
    // Store as JSON array if multiple, single URL if one, null if none
    const imageUrl = images.length > 1
      ? JSON.stringify(images)
      : images.length === 1
        ? images[0]
        : null;

    const optimisticId = onOptimisticMessage?.(msgContent, imageUrl || undefined);
    setContent("");
    setPendingImages([]);
    setSending(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        author_id: userId,
        content: msgContent,
        image_url: imageUrl,
      });

    if (error) {
      if (optimisticId) onMessageFailed?.(optimisticId);
    } else {
      if (optimisticId) onMessageConfirmed?.(optimisticId, null);
    }

    if (text) {
      notifyMentions(supabase, {
        content: text,
        authorId: userId,
        type: "chat_mention",
        link: `/chat?channel=${channelId}`,
      });
    }

    setSending(false);
  };

  const detectMentionQuery = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@([A-Za-z0-9_]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setSelectedIndex(0);
    } else {
      setMentionQuery(null);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (mentionQuery === null) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const supabase = createClient();
      let query = supabase
        .from("profiles")
        .select("id, x_handle, full_name, avatar_url")
        .eq("status", "approved")
        .neq("id", userId)
        .order("x_handle", { ascending: true })
        .limit(8);

      if (mentionQuery.length > 0) {
        query = query.ilike("x_handle", `${mentionQuery}%`);
      }

      const { data } = await query;
      setSuggestions((data as MentionSuggestion[]) || []);
    };

    fetchSuggestions();
  }, [mentionQuery, userId]);

  const insertMention = (handle: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const before = content.slice(0, cursorPos);
    const after = content.slice(cursorPos);
    const mentionStart = before.lastIndexOf("@");

    const newContent = before.slice(0, mentionStart) + `@${handle} ` + after;
    setContent(newContent);
    setMentionQuery(null);
    setSuggestions([]);

    requestAnimationFrame(() => {
      const newPos = mentionStart + handle.length + 2;
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    detectMentionQuery(value, e.target.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0 && mentionQuery !== null) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(suggestions[selectedIndex].x_handle);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        setSuggestions([]);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - pendingImages.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploadingCount((c) => c + toUpload.length);
    const supabase = createClient();

    const uploaded: string[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop();
      const path = `${channelId}/${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("chat-images")
        .upload(path, file);

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("chat-images")
          .getPublicUrl(data.path);
        uploaded.push(urlData.publicUrl);
      }
      setUploadingCount((c) => c - 1);
    }

    if (uploaded.length > 0) {
      setPendingImages((prev) => [...prev, ...uploaded].slice(0, MAX_IMAGES));
    }

    if (fileRef.current) fileRef.current.value = "";
    textareaRef.current?.focus();
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = content.trim() || pendingImages.length > 0;
  const canAddImage = pendingImages.length < MAX_IMAGES && uploadingCount === 0;

  return (
    <div className="px-[12px] py-[12px] relative">
      {/* Mention suggestions dropdown */}
      {suggestions.length > 0 && mentionQuery !== null && (
        <div className="absolute bottom-full left-[12px] right-[12px] mb-[4px] bg-bg-elevated border border-border-default rounded-lg shadow-modal overflow-hidden z-50">
          {suggestions.map((user, i) => (
            <button
              key={user.id}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user.x_handle);
              }}
              className={`flex items-center gap-[10px] px-[12px] py-[8px] w-full text-left cursor-pointer transition-colors ${
                i === selectedIndex
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-bg-surface text-text-secondary"
              }`}
            >
              <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
              <div className="min-w-0">
                <span className="text-[13px] font-medium">@{user.x_handle}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pending images preview */}
      {(pendingImages.length > 0 || uploadingCount > 0) && (
        <div className="mb-[8px] flex items-start gap-[8px]">
          {pendingImages.map((url, i) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="h-[64px] w-[64px] rounded-lg object-cover border border-border-subtle"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-[6px] -right-[6px] h-[20px] w-[20px] rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer transition-colors shadow-sm"
              >
                <X className="h-[12px] w-[12px]" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`uploading-${i}`} className="h-[64px] w-[64px] rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center">
              <Spinner size="sm" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-[8px] bg-bg-base border border-border-subtle rounded-lg px-[12px] py-[8px]">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!canAddImage}
          className="p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ImagePlus className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none resize-none max-h-[120px]"
        />
        <button
          onClick={() => sendMessage()}
          disabled={sending || !canSend}
          className="p-[4px] rounded hover:bg-bg-surface text-primary-500 hover:text-primary-600 cursor-pointer shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
