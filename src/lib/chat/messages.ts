import type { Message } from "@/lib/types/database";

export const MESSAGE_REPLY_RELATION_FKEY = "messages_reply_to_message_id_fkey";

export const MESSAGE_WITH_AUTHOR_SELECT = `
  *,
  author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)
`;

export const REPLY_UNAVAILABLE_LABEL = "Message indisponible";

export type MessageAuthor = {
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
};

export type ReplyToMessage = Pick<
  Message,
  "id" | "channel_id" | "content" | "image_url" | "created_at"
> & {
  author: MessageAuthor;
};

type MessageWithoutAuthor = Omit<Message, "author">;

export type MessageWithAuthor = MessageWithoutAuthor & {
  author: MessageAuthor;
  reply_to?: ReplyToMessage | null;
};

type MaybeRelation<T> = T | T[] | null | undefined;

type ReplyToMessageRow = Omit<ReplyToMessage, "author"> & {
  author: MaybeRelation<MessageAuthor>;
};

export type MessageRow = MessageWithoutAuthor & {
  author: MaybeRelation<MessageAuthor>;
  reply_to?: MaybeRelation<ReplyToMessageRow>;
};

const UNKNOWN_MESSAGE_AUTHOR: MessageAuthor = {
  x_handle: "membre",
  full_name: "Membre",
  avatar_url: null,
};

export function normalizeSingleRelation<T>(value: MaybeRelation<T>) {
  if (Array.isArray(value)) return value[0] ?? null;

  return value ?? null;
}

export function resolveReplyPreviewText(
  message: Pick<ReplyToMessage, "content" | "image_url">,
) {
  const trimmedContent = message.content.trim();
  if (trimmedContent.length > 0) return trimmedContent;
  if (message.image_url) return "Image";

  return "Message supprimé";
}

export function mapMessageRowToMessageWithAuthor(row: MessageRow) {
  const author = normalizeSingleRelation(row.author) ?? UNKNOWN_MESSAGE_AUTHOR;
  const replyTo = normalizeReplyToMessage(row.reply_to);

  return {
    ...row,
    author,
    reply_to_message_id: row.reply_to_message_id ?? null,
    reply_to: replyTo,
  } satisfies MessageWithAuthor;
}

export function mapMessageRowsToMessagesWithAuthor(rows: MessageRow[]) {
  const messages: MessageWithAuthor[] = [];

  for (const row of rows) {
    messages.push(mapMessageRowToMessageWithAuthor(row));
  }

  return messages;
}

export function collectReplyToMessageIds(messages: MessageWithAuthor[]) {
  const ids = new Set<string>();

  for (const message of messages) {
    if (!message.reply_to_message_id || message.reply_to) continue;

    ids.add(message.reply_to_message_id);
  }

  return [...ids];
}

export function projectReplyTarget(message: ReplyToMessage): ReplyToMessage {
  return {
    id: message.id,
    channel_id: message.channel_id,
    content: message.content,
    image_url: message.image_url,
    created_at: message.created_at,
    author: message.author,
  };
}

export function attachReplyTargets<T extends MessageWithAuthor>(
  messages: T[],
  replyTargets: ReplyToMessage[],
) {
  if (replyTargets.length === 0) return messages;

  const replyTargetsById = new Map<string, ReplyToMessage>();
  for (const replyTarget of replyTargets) {
    replyTargetsById.set(replyTarget.id, replyTarget);
  }

  const nextMessages: T[] = [];
  for (const message of messages) {
    const replyTarget = message.reply_to_message_id
      ? replyTargetsById.get(message.reply_to_message_id)
      : null;

    nextMessages.push({
      ...message,
      reply_to: message.reply_to ?? replyTarget ?? null,
    });
  }

  return nextMessages;
}

function normalizeReplyToMessage(value: MaybeRelation<ReplyToMessageRow>) {
  const replyTo = normalizeSingleRelation(value);
  if (!replyTo) return null;

  return {
    ...replyTo,
    author: normalizeSingleRelation(replyTo.author) ?? UNKNOWN_MESSAGE_AUTHOR,
  } satisfies ReplyToMessage;
}
