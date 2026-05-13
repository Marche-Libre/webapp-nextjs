"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, EyeOff, Eye, Hash } from "lucide-react";
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

interface DmChannelRowProps {
  dm: DmChannel;
  currentSlug: string;
  onSelect: (slug: string) => void;
}

interface ChannelRowProps {
  channel: Channel;
  currentSlug: string;
  hidden?: boolean;
  onSelect: (slug: string) => void;
  onToggleHidden: (channelId: string) => void;
}

function DmChannelRow({ dm, currentSlug, onSelect }: DmChannelRowProps) {
  const dmSlug = dm.slug || `dm-${dm.id}`;
  const isActive = currentSlug === dmSlug;

  const handleSelect = useCallback(() => {
    onSelect(dmSlug);
  }, [dmSlug, onSelect]);

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-[9px] rounded-full px-[12px] py-[8px] text-left text-[13px] font-semibold transition-all duration-150",
        isActive
          ? "bg-bg-surface-hover text-primary-400 shadow-card"
          : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
      )}
    >
      <Avatar
        src={dm.other_user.avatar_url}
        name={dm.other_user.x_handle}
        size="sm"
        className="h-[24px] w-[24px] shrink-0 rounded-full text-[9px]"
      />
      <span className="truncate">@{dm.other_user.x_handle}</span>
    </button>
  );
}

function ChannelRow({ channel, currentSlug, hidden = false, onSelect, onToggleHidden }: ChannelRowProps) {
  const isActive = currentSlug === channel.slug;
  const handleSelect = useCallback(() => {
    onSelect(channel.slug);
  }, [channel.slug, onSelect]);
  const handleToggleHidden = useCallback(() => {
    onToggleHidden(channel.id);
  }, [channel.id, onToggleHidden]);

  return (
    <div className="group/ch flex items-center gap-[4px]">
      <button
        type="button"
        onClick={handleSelect}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center gap-[9px] rounded-full px-[12px] py-[8px] text-left text-[13px] font-semibold transition-all",
          hidden
            ? "text-text-muted hover:bg-bg-surface hover:text-text-secondary"
            : isActive
              ? "bg-bg-surface-hover text-primary-400 shadow-card"
              : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
        )}
      >
        <Hash className={cn("h-[14px] w-[14px] shrink-0", hidden ? "opacity-40" : isActive ? "opacity-100" : "opacity-60")} />
        <span className="truncate">{channel.name}</span>
      </button>
      <button
        type="button"
        onClick={handleToggleHidden}
        className="shrink-0 cursor-pointer rounded-full p-[5px] text-text-muted opacity-0 transition-all hover:bg-bg-surface hover:text-text-secondary group-hover/ch:opacity-100"
        title={hidden ? "Réafficher ce salon" : "Masquer ce salon"}
      >
        {hidden ? <Eye className="h-[12px] w-[12px]" /> : <EyeOff className="h-[12px] w-[12px]" />}
      </button>
    </div>
  );
}

export function ChannelList({ channels, dmChannels, userId, hiddenChannelIds: initialHidden }: ChannelListProps) {
  const { activeSlug: currentSlug, setActiveSlug } = useActiveChannel();
  const [hiddenIds, setHiddenIds] = useState<string[]>(initialHidden);
  const [showArchived, setShowArchived] = useState(false);

  const visibleChannels = useMemo(() => {
    return channels.filter((channel) => !hiddenIds.includes(channel.id));
  }, [channels, hiddenIds]);
  const archivedChannels = useMemo(() => {
    return channels.filter((channel) => hiddenIds.includes(channel.id));
  }, [channels, hiddenIds]);

  const toggleHideChannel = useCallback(async (channelId: string) => {
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
  }, [hiddenIds, userId]);

  const handleToggleArchived = useCallback(() => {
    setShowArchived((current) => !current);
  }, []);

  const dmItems = useMemo(() => {
    if (!dmChannels || dmChannels.length === 0) return null;
    return dmChannels.map((dm) => (
      <DmChannelRow
        key={dm.id}
        dm={dm}
        currentSlug={currentSlug}
        onSelect={setActiveSlug}
      />
    ));
  }, [currentSlug, dmChannels, setActiveSlug]);

  const visibleChannelItems = useMemo(() => {
    return visibleChannels.map((channel) => (
      <ChannelRow
        key={channel.id}
        channel={channel}
        currentSlug={currentSlug}
        onSelect={setActiveSlug}
        onToggleHidden={toggleHideChannel}
      />
    ));
  }, [currentSlug, setActiveSlug, toggleHideChannel, visibleChannels]);

  const archivedChannelItems = useMemo(() => {
    return archivedChannels.map((channel) => (
      <ChannelRow
        key={channel.id}
        channel={channel}
        currentSlug={currentSlug}
        hidden
        onSelect={setActiveSlug}
        onToggleHidden={toggleHideChannel}
      />
    ));
  }, [archivedChannels, currentSlug, setActiveSlug, toggleHideChannel]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[56px] shrink-0 items-center gap-[10px] border-b border-border-subtle px-[18px]">
        <h2 className="font-display flex-1 text-[16px] font-semibold text-text-primary">
          Discussions
        </h2>
      </div>

      <nav className="flex-1 space-y-[3px] overflow-y-auto px-[10px] py-[10px]">
        {/* DM channels */}
        {dmItems && (
          <div className="mb-[8px] pb-[8px] border-b border-border-subtle">
            <p className="px-[12px] py-[5px] text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Messages
            </p>
            {dmItems}
          </div>
        )}

        {/* Visible channels */}
        {visibleChannelItems}

        {/* Archived channels */}
        {archivedChannels.length > 0 && (
          <div className="mt-[12px] pt-[12px] border-t border-border-subtle">
            <button
              type="button"
              onClick={handleToggleArchived}
              className="flex w-full cursor-pointer items-center gap-[6px] px-[12px] py-[5px] text-[10px] font-semibold uppercase tracking-wider text-text-muted transition-colors hover:text-text-secondary"
            >
              <ChevronDown className={cn("h-[12px] w-[12px] transition-transform", !showArchived && "-rotate-90")} />
              Masqués ({archivedChannels.length})
            </button>
            {showArchived && archivedChannelItems}
          </div>
        )}
      </nav>
    </div>
  );
}
