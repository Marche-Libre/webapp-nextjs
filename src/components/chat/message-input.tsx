"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notifyMentions } from "@/lib/notifications";
import { Avatar } from "@/components/ui/avatar";

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
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    const text = content.trim();
    if (!text) return;

    const optimisticId = onOptimisticMessage?.(text);
    setContent("");
    setSending(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        author_id: userId,
        content: text,
      });

    if (error) {
      if (optimisticId) onMessageFailed?.(optimisticId);
    } else {
      if (optimisticId) onMessageConfirmed?.(optimisticId, null);
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

  const canSend = content.trim();

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

      <div className="flex items-center gap-[8px] bg-bg-base border border-border-subtle rounded-lg px-[12px] py-[8px]">
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
