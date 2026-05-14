"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { ImagePlus, Send, Smile, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notifyMentions } from "@/lib/notifications";
import { Avatar } from "@/components/ui/avatar";
import type { FullMessage } from "./chat-store";

interface MessageInputProps {
  channelId: string;
  channelSlug?: string;
  canWrite?: boolean;
  noPermissionMessage?: string | null;
  isOffline?: boolean;
  offlineMessage?: string | null;
  userId: string;
  onOptimisticMessage?: (content: string, imageUrl?: string) => string;
  onMessageConfirmed?: (
    optimisticId: string,
    realMessage: FullMessage | null,
  ) => void;
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

interface EmojiPickerItemProps {
  emoji: string;
  onPick: (emoji: string) => void;
}

function EmojiPickerItem({ emoji, onPick }: EmojiPickerItemProps) {
  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onPick(emoji);
    },
    [emoji, onPick],
  );

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-lg text-[18px] transition-colors hover:bg-bg-surface-hover"
      aria-label={`Ajouter l'emoji ${emoji}`}
      title={emoji}
    >
      {emoji}
    </button>
  );
}

const EMOJI_OPTIONS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😅",
  "😆",
  "😉",
  "😊",
  "😍",
  "😘",
  "🥰",
  "😎",
  "🤗",
  "🤔",
  "🧐",
  "😐",
  "🙄",
  "😶",
  "😏",
  "😮",
  "😯",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤯",
  "😱",
  "😬",
  "🤪",
  "😜",
  "🥳",
  "😇",
  "🤓",
  "🤩",
  "🤐",
  "😭",
  "😴",
  "🤤",
  "👍",
  "🙌",
  "👏",
  "👎",
  "🙅",
  "🙆",
  "🤞",
  "🙏",
  "❤️",
  "💔",
  "💛",
  "💙",
  "🧡",
  "💚",
  "💜",
  "✨",
  "🌟",
  "💫",
  "🎉",
  "🎊",
  "🎈",
  "🚀",
  "🔥",
  "⚡",
  "💯",
  "✅",
  "❌",
  "⚠️",
  "🕊️",
  "⚖️",
  "🤝",
  "🇫🇷",
  "🏛️",
  "🗼",
  "🗽",
  "🚩",
  "🏳️‍🌈",
  "🥐",
  "🥖",
  "🧀",
  "🍷",
  "☕",
  "🏢",
  "💼",
  "🧾",
  "📈",
  "📉",
  "📊",
  "💳",
  "🧠",
  "💡",
  "🧮",
  "📅",
  "🗂️",
  "📌",
];

function MentionSuggestionItem({
  user,
  selected,
  onPick,
}: MentionSuggestionItemProps) {
  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onPick(user.x_handle);
    },
    [onPick, user.x_handle],
  );

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

const MAX_CHAT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const CHAT_MEDIA_BUCKET = "medias";
const MESSAGE_WITH_AUTHOR_SELECT =
  "*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)";

function resolveImageFileExtension(fileName: string) {
  const segments = fileName.split(".");
  if (segments.length <= 1) return null;

  return segments.at(-1)?.toLowerCase() ?? null;
}

function resolveImageUploadFileName(file: File) {
  const extension = resolveImageFileExtension(file.name);
  const randomSuffix =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return `${randomSuffix}${extension ? `.${extension}` : ""}`;
}

function resolveImageObjectKey(channelId: string, userId: string, file: File) {
  return `chat/${channelId}/${userId}/${resolveImageUploadFileName(file)}`;
}

export function MessageInput({
  channelId,
  channelSlug,
  canWrite = true,
  noPermissionMessage = null,
  isOffline = false,
  offlineMessage = null,
  userId,
  onOptimisticMessage,
  onMessageConfirmed,
  onMessageFailed,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mentionNotificationLink = useMemo(() => {
    if (channelSlug) return `/chat/${channelSlug}`;
    return `/chat?channel=${channelId}`;
  }, [channelId, channelSlug]);

  const sendMessage = useCallback(async () => {
    if (!canWrite) return;
    if (isOffline) return;
    if (sending) return;
    const text = content.trim();
    if (!text && !imageFile) return;

    const selectedImagePreviewUrl = imagePreviewUrl;
    const optimisticId = onOptimisticMessage?.(
      text,
      selectedImagePreviewUrl || undefined,
    );
    setError(null);
    setUploadingImage(Boolean(imageFile));
    setSending(true);

    const supabase = createClient();
    let uploadedImageUrl: string | null = null;

    if (imageFile) {
      const objectPath = resolveImageObjectKey(channelId, userId, imageFile);

      const { error: uploadError } = await supabase.storage
        .from(CHAT_MEDIA_BUCKET)
        .upload(objectPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        if (optimisticId) onMessageFailed?.(optimisticId);
        setError(`Échec du téléversement de l'image : ${uploadError.message}`);
        setSending(false);
        setUploadingImage(false);
        return;
      }

      uploadedImageUrl = objectPath;
    }

    const { data: insertedMessage, error: insertError } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        author_id: userId,
        content: text,
        image_url: uploadedImageUrl,
      })
      .select(MESSAGE_WITH_AUTHOR_SELECT)
      .single();

    if (insertError) {
      if (uploadedImageUrl) {
        await supabase.storage
          .from(CHAT_MEDIA_BUCKET)
          .remove([uploadedImageUrl]);
      }
      if (optimisticId) onMessageFailed?.(optimisticId);
      setError(`Échec de l'envoi du message : ${insertError.message}`);
    } else {
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
      setContent("");
      setImagePreviewUrl(null);
      if (optimisticId)
        onMessageConfirmed?.(
          optimisticId,
          insertedMessage as FullMessage | null,
        );
      if (text) {
        notifyMentions(supabase, {
          content: text,
          authorId: userId,
          type: "chat_mention",
          link: mentionNotificationLink,
        });
      }
    }

    setUploadingImage(false);
    setSending(false);
  }, [
    canWrite,
    channelId,
    content,
    imageFile,
    imagePreviewUrl,
    mentionNotificationLink,
    onMessageConfirmed,
    onMessageFailed,
    onOptimisticMessage,
    isOffline,
    sending,
    userId,
  ]);

  const clearImageSelection = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreviewUrl]);

  const handleImageRemove = useCallback(() => {
    clearImageSelection();
  }, [clearImageSelection]);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleEmojiPickerClose = useCallback(() => {
    setEmojiPickerOpen(false);
  }, []);

  const handleEmojiPickerToggle = useCallback(() => {
    setEmojiPickerOpen((previous) => !previous);
  }, []);

  const applyImageSelection = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide.");
        clearImageSelection();
        return;
      }

      if (selectedFile.size > MAX_CHAT_IMAGE_SIZE_BYTES) {
        setError(
          `L'image dépasse la limite de ${MAX_CHAT_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
        );
        clearImageSelection();
        return;
      }

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(selectedFile);
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    },
    [clearImageSelection, imagePreviewUrl],
  );

  const handleImageFileSelected = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      applyImageSelection(selectedFile);
    },
    [applyImageSelection],
  );

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

  const insertTextAtCursor = useCallback(
    (nextText: string) => {
      if (!nextText) return;

      const textarea = textareaRef.current;
      if (!textarea) {
        setContent((previous) => previous + nextText);
        return;
      }

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const before = content.slice(0, selectionStart);
      const after = content.slice(selectionEnd);
      const merged = `${before}${nextText}${after}`;

      setContent(merged);
      setMentionQuery(null);
      setSuggestions([]);

      requestAnimationFrame(() => {
        const cursorPos = before.length + nextText.length;
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
        detectMentionQuery(merged, cursorPos);
      });
    },
    [content, detectMentionQuery],
  );

  const handleInsertEmoji = useCallback(
    (emoji: string) => {
      insertTextAtCursor(emoji);
      handleEmojiPickerClose();
    },
    [handleEmojiPickerClose, insertTextAtCursor],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const clipboardItems = Array.from(event.clipboardData?.items || []);
      const pastedImage = clipboardItems.find(
        (item) => item.kind === "file" && item.type.startsWith("image/"),
      );

      if (!pastedImage) return;

      const pastedFile = pastedImage.getAsFile();
      if (!pastedFile) return;

      event.preventDefault();
      insertTextAtCursor(event.clipboardData?.getData("text/plain") ?? "");
      applyImageSelection(pastedFile);
    },
    [applyImageSelection, insertTextAtCursor],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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

  const insertMention = useCallback(
    (handle: string) => {
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
    },
    [content],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);
      detectMentionQuery(value, e.target.selectionStart);
    },
    [detectMentionQuery],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!canWrite && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        return;
      }

      if (suggestions.length > 0 && mentionQuery !== null) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % suggestions.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(
            (i) => (i - 1 + suggestions.length) % suggestions.length,
          );
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
          if (emojiPickerOpen) {
            handleEmojiPickerClose();
          }
          return;
        }
      }

      if (emojiPickerOpen && e.key === "Escape") {
        e.preventDefault();
        handleEmojiPickerClose();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [
      canWrite,
      emojiPickerOpen,
      handleEmojiPickerClose,
      insertMention,
      mentionQuery,
      selectedIndex,
      sendMessage,
      suggestions,
    ],
  );

  const handleComposerFocus = useCallback(() => {
    if (emojiPickerOpen) {
      handleEmojiPickerClose();
    }
  }, [emojiPickerOpen, handleEmojiPickerClose]);

  const emojiPickerItems = useMemo(() => {
    return EMOJI_OPTIONS.map((emoji, index) => (
      <EmojiPickerItem key={`${emoji}-${index}`} emoji={emoji} onPick={handleInsertEmoji} />
    ));
  }, [handleInsertEmoji]);

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

  const canSubmit = canWrite && (Boolean(content.trim()) || Boolean(imageFile));
  const isBusy = sending || uploadingImage;
  const inputDisabled = isBusy || !canWrite || isOffline;
  const sendButtonDisabled = inputDisabled || !canSubmit;
  const emojiPickerTitle = emojiPickerOpen
    ? "Fermer la palette d'emojis"
    : "Ajouter un emoji";
  const helperMessage = useMemo(() => {
    if (isOffline && offlineMessage) return offlineMessage;
    if (!canWrite && noPermissionMessage) return noPermissionMessage;
    return null;
  }, [canWrite, isOffline, noPermissionMessage, offlineMessage]);

  const imagePreview = useMemo(() => {
    if (!imagePreviewUrl) return null;

    return (
      <div className="mt-[8px] flex items-center gap-[8px] rounded-[12px] border border-border-default bg-bg-surface px-[10px] py-[8px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- Chat composer image previews are local blob URLs handled by the browser. */}
        <img
          src={imagePreviewUrl}
          alt="Aperçu du fichier"
          className="h-[64px] w-[64px] rounded-md object-cover"
        />
        <button
          type="button"
          onClick={handleImageRemove}
          className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-full bg-bg-surface-hover text-text-muted hover:text-text-secondary"
          aria-label="Supprimer l'image"
        >
          <X className="h-[14px] w-[14px]" />
        </button>
      </div>
    );
  }, [handleImageRemove, imagePreviewUrl]);

  return (
    <div className="relative border-t border-border-subtle bg-bg-base/95 px-[12px] py-[10px] backdrop-blur">
      {/* Mention suggestions dropdown */}
      {suggestions.length > 0 && mentionQuery !== null && (
        <div className="absolute bottom-full left-[12px] right-[12px] z-50 mb-[8px] overflow-hidden rounded-2xl border border-border-default bg-bg-elevated shadow-modal">
          {suggestionItems}
        </div>
      )}

      {emojiPickerOpen && (
        <div className="absolute bottom-full left-[12px] right-[12px] z-50 mb-[8px] overflow-hidden rounded-2xl border border-border-default bg-bg-elevated p-[8px] shadow-modal">
          <div className="grid grid-cols-8 gap-[4px]">{emojiPickerItems}</div>
        </div>
      )}

      <div className="flex min-h-[46px] items-end gap-[3px] rounded-[23px] border border-border-default bg-bg-surface-hover px-[14px] py-[8px] shadow-card transition-colors focus-within:border-primary-500 focus-within:shadow-focus">
        <button
          type="button"
          onClick={handleImageClick}
          disabled={inputDisabled}
          className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Ajouter une image"
          title="Ajouter une image"
        >
          <ImagePlus className="h-[16px] w-[16px]" />
        </button>
        <button
          type="button"
          onClick={handleEmojiPickerToggle}
          disabled={inputDisabled}
          className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-surface hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={emojiPickerTitle}
          title={emojiPickerTitle}
        >
          <Smile className="h-[16px] w-[16px]" />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleComposerFocus}
          onPaste={handlePaste}
          disabled={inputDisabled}
          placeholder="Écrire un message..."
          rows={1}
          className="max-h-[120px] min-h-[28px] min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-[4px] text-[15px] leading-[20px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSendClick}
          disabled={sendButtonDisabled}
          className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-bg-surface disabled:text-text-muted"
        >
          <Send className="h-[16px] w-[16px]" />
        </button>
      </div>
      {imagePreview}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelected}
        className="hidden"
      />
      {error && <p className="mt-[8px] text-[11px] text-error">{error}</p>}
      {helperMessage && <p className="mt-[8px] text-[11px] text-text-muted">{helperMessage}</p>}
    </div>
  );
}
