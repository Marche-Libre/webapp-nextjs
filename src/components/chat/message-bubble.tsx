import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ReactionPicker } from "./reaction-picker";
import type { Message } from "@/lib/types/database";
import { PostEmbed } from "./post-embed";

const MENTION_REGEX = /@([A-Za-z0-9_]+)/g;

function renderContentWithMentions(content: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(MENTION_REGEX);
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="text-primary-500 font-medium">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

interface MessageBubbleProps {
  message: Message & {
    author: { x_handle: string; full_name: string; avatar_url: string | null };
  };
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  onReact?: (emoji: string) => void;
}

const FORUM_LINK_REGEX = /\/forum\/posts\/([a-f0-9-]+)/;

export function MessageBubble({ message, reactions, onReact }: MessageBubbleProps) {
  const forumMatch = message.content.match(FORUM_LINK_REGEX);

  return (
    <div className="flex items-start gap-[12px] px-[16px] py-[8px] hover:bg-bg-surface/50 transition-colors group relative">
      <Avatar
        src={message.author.avatar_url}
        name={message.author.x_handle}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-[8px]">
          <span className="text-[13px] font-semibold text-text-primary">
            @{message.author.x_handle}
          </span>
          <span className="text-[10px] text-text-muted">
            {formatDate(message.created_at)}
          </span>
        </div>
        <div className="text-[13px] text-text-secondary mt-[2px] whitespace-pre-wrap break-words">
          {renderContentWithMentions(message.content)}
        </div>
        {message.image_url && (
          <img
            src={message.image_url}
            alt="Image"
            className="mt-[8px] rounded-lg max-w-[400px] max-h-[300px] object-cover border border-border-default"
          />
        )}
        {forumMatch && (
          <PostEmbed postId={forumMatch[1]} />
        )}
        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="flex gap-[4px] mt-[6px] flex-wrap">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact?.(r.emoji)}
                className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] border cursor-pointer transition-all ${
                  r.hasReacted
                    ? "bg-primary-50 border-primary-500/30 text-primary-700"
                    : "bg-bg-surface border-border-default text-text-muted hover:border-border-strong"
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Hover reaction button */}
      {onReact && (
        <div className="absolute top-[4px] right-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
          <ReactionPicker onSelect={(emoji) => onReact(emoji)} />
        </div>
      )}
    </div>
  );
}
