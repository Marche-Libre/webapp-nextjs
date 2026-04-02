"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Channel } from "@/lib/types/database";

interface ChannelListProps {
  channels: Channel[];
}

export function ChannelList({ channels }: ChannelListProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[10px] px-[20px] h-[64px] border-b border-border-subtle shrink-0">
        <Link
          href="/forum"
          className="p-[6px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
          title="Retour"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <h2 className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
          Salons
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-[8px] py-[8px] space-y-[2px]">
        {channels.map((channel) => {
          const isActive = pathname === `/chat/${channel.slug}`;
          return (
            <Link
              key={channel.id}
              href={`/chat/${channel.slug}`}
              className={cn(
                "flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              )}
            >
              <Hash className="h-[14px] w-[14px] shrink-0 opacity-60" />
              {channel.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
