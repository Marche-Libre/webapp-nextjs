"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notifyMentions } from "@/lib/notifications";
import { Avatar } from "@/components/ui/avatar";
import type { FullMessage } from "./chat-store";

interface MessageInputProps {
  channelId: string;
  userId: string;
  onOptimisticMessage?: (content: string, imageUrl?: string) => string;
  onMessageConfirmed?: (optimisticId: string, realMessage: FullMessage | null) => void;
  onMessageFailed?: (optimisticId: string) => void;
}

type MentionSuggestion = {
  id: string;
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
};

interface MentionSuggestionItemProps {
  user: MentionSuggestion;
  selected: boolean;
  onPick: (handle: string) => void;
}

function MentionSuggestionItem({ user, selected, onPick }: MentionSuggestionItemProps) {
  const handleMouseDown = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onPick(user.x_handle);
  }, [onPick, user.x_handle]);

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      className={`flex w-full cursor-pointer items-center gap-[10px] px-[12px] py-[9px] text-left transition-colors ${
        selected
          ? "bg-primary-50 text-primary-400"
          : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
      }`}
    >
      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
      <div className="min-w-0">
        <span className="text-[13px] font-medium">@{user.x_handle}</span>
      </div>
    </button>
  );
}

export function MessageInput({ channelId, userId, onOptimisticMessage, onMessageConfirmed, onMessageFailed }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useCallback(async () => {
    if (sending) return;
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
  }, [channelId, content, onMessageConfirmed, onMessageFailed, onOptimisticMessage, sending, userId]);

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
    if (mentionQuery === null) return;

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

    void fetchSuggestions();
  }, [mentionQuery, userId]);

  const insertMention = useCallback((handle: string) => {
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
  }, [content]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    detectMentionQuery(value, e.target.selectionStart);
  }, [detectMentionQuery]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
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
      void sendMessage();
    }
  }, [insertMention, mentionQuery, selectedIndex, sendMessage, suggestions]);

  const handleSendClick = useCallback(() => {
    void sendMessage();
  }, [sendMessage]);

  const suggestionItems = useMemo(() => {
    return suggestions.map((user, index) => (
      <MentionSuggestionItem
        key={user.id}
        user={user}
        selected={index === selectedIndex}
        onPick={insertMention}
      />
    ));
  }, [insertMention, selectedIndex, suggestions]);

  const canSend = Boolean(content.trim());

  return (
    <div className="relative border-t border-border-subtle bg-bg-base/95 px-[12px] py-[10px] backdrop-blur">
      {/* Mention suggestions dropdown */}
      {suggestions.length > 0 && mentionQuery !== null && (
        <div className="absolute bottom-full left-[12px] right-[12px] z-50 mb-[8px] overflow-hidden rounded-2xl border border-border-default bg-bg-elevated shadow-modal">
          {suggestionItems}
        </div>
      )}

      <div className="flex min-h-[46px] items-end gap-[8px] rounded-[23px] border border-border-default bg-bg-surface-hover px-[14px] py-[8px] shadow-card transition-colors focus-within:border-primary-500 focus-within:shadow-focus">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          rows={1}
          className="max-h-[120px] min-h-[28px] flex-1 resize-none bg-transparent py-[4px] text-[15px] leading-[20px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSendClick}
          disabled={sending || !canSend}
          className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-bg-surface disabled:text-text-muted"
        >
          <Send className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}
