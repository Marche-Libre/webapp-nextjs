"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, EyeOff, Eye, Hash } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useActiveChannel } from "./chat-channel-context";
import { Avatar } from "@/components/ui/avatar";
import type { Channel } from "@/lib/types/database";
import type { DmChannel } from "./chat-layout";

interface ChannelListProps {
  channels: Channel[];
  dmChannels?: DmChannel[];
  userId: string;
  hiddenChannelIds: string[];
}

export function ChannelList({ channels, dmChannels, userId, hiddenChannelIds: initialHidden }: ChannelListProps) {
  const { activeSlug: currentSlug, setActiveSlug } = useActiveChannel();
  const [hiddenIds, setHiddenIds] = useState<string[]>(initialHidden);
  const [showArchived, setShowArchived] = useState(false);

  const visibleChannels = channels.filter((c) => !hiddenIds.includes(c.id));
  const archivedChannels = channels.filter((c) => hiddenIds.includes(c.id));

  const toggleHideChannel = async (channelId: string) => {
    const supabase = createClient();
    const isHidden = hiddenIds.includes(channelId);
    const newIds = isHidden
      ? hiddenIds.filter((id) => id !== channelId)
      : [...hiddenIds, channelId];

    setHiddenIds(newIds);
    await supabase
      .from("profiles")
      .update({ hidden_channel_ids: newIds })
      .eq("id", userId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[10px] px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <Link
          href="/chat"
          className="p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
          title="Retour"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <h2 className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em] flex-1">
          Salons
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-[8px] py-[8px] space-y-[2px]">
        {/* DM channels */}
        {dmChannels && dmChannels.length > 0 && (
          <div className="mb-[8px] pb-[8px] border-b border-border-subtle">
            <p className="px-[12px] py-[4px] text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Messages
            </p>
            {dmChannels.map((dm) => {
              const dmSlug = dm.slug || `dm-${dm.id}`;
              const isActive = currentSlug === dmSlug;
              return (
                <button
                  key={dm.id}
                  onClick={() => setActiveSlug(dmSlug)}
                  className={cn(
                    "flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium transition-all duration-150 w-full text-left cursor-pointer",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                  )}
                >
                  <Avatar
                    src={dm.other_user.avatar_url}
                    name={dm.other_user.x_handle}
                    size="sm"
                    className="h-[20px] w-[20px] text-[8px] rounded-md shrink-0"
                  />
                  <span className="truncate">@{dm.other_user.x_handle}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Visible channels */}
        {visibleChannels.map((channel) => {
          const isActive = currentSlug === channel.slug;
          return (
            <div key={channel.id} className="group/ch flex items-center">
              <button
                onClick={() => setActiveSlug(channel.slug)}
                className={cn(
                  "flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium transition-all duration-150 flex-1 min-w-0 text-left cursor-pointer",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                )}
              >
                <Hash className="h-[14px] w-[14px] shrink-0 opacity-60" />
                <span className="truncate">{channel.name}</span>
              </button>
              <button
                onClick={() => toggleHideChannel(channel.id)}
                className="opacity-0 group-hover/ch:opacity-100 p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-all shrink-0"
                title="Masquer ce salon"
              >
                <EyeOff className="h-[12px] w-[12px]" />
              </button>
            </div>
          );
        })}

        {/* Archived channels */}
        {archivedChannels.length > 0 && (
          <div className="mt-[12px] pt-[12px] border-t border-border-subtle">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-[6px] px-[12px] py-[4px] text-[10px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary cursor-pointer transition-colors w-full"
            >
              <ChevronDown className={cn("h-[12px] w-[12px] transition-transform", !showArchived && "-rotate-90")} />
              Masqués ({archivedChannels.length})
            </button>
            {showArchived && archivedChannels.map((channel) => (
              <div key={channel.id} className="flex items-center group/ch">
                <button
                  onClick={() => setActiveSlug(channel.slug)}
                  className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium text-text-muted hover:bg-bg-surface hover:text-text-secondary transition-all flex-1 min-w-0 text-left cursor-pointer"
                >
                  <Hash className="h-[14px] w-[14px] shrink-0 opacity-40" />
                  <span className="truncate">{channel.name}</span>
                </button>
                <button
                  onClick={() => toggleHideChannel(channel.id)}
                  className="opacity-0 group-hover/ch:opacity-100 p-[4px] rounded hover:bg-bg-surface text-text-muted hover:text-text-secondary cursor-pointer transition-all shrink-0"
                  title="Réafficher ce salon"
                >
                  <Eye className="h-[12px] w-[12px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
