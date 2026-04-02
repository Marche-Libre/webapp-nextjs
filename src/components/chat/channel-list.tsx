"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, EyeOff, Eye, Hash, MessageCircle, Plus, ThumbsUp, Vote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import type { Channel, ChannelProposal, Profile } from "@/lib/types/database";
import type { DmChannel } from "./chat-layout";

const VOTE_THRESHOLD = 10;

interface ChannelListProps {
  channels: Channel[];
  dmChannels?: DmChannel[];
  userId: string;
  hiddenChannelIds: string[];
}

export function ChannelList({ channels, dmChannels, userId, hiddenChannelIds: initialHidden }: ChannelListProps) {
  const pathname = usePathname();
  const [proposals, setProposals] = useState<(ChannelProposal & { vote_count: number; has_voted: boolean })[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(initialHidden);
  const [showArchived, setShowArchived] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalName, setProposalName] = useState("");
  const [proposalDesc, setProposalDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const visibleChannels = channels.filter((c) => !hiddenIds.includes(c.id));
  const archivedChannels = channels.filter((c) => hiddenIds.includes(c.id));

  const fetchProposals = useCallback(async () => {
    const supabase = createClient();
    const { data: props } = await supabase
      .from("channel_proposals")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!props || props.length === 0) {
      setProposals([]);
      return;
    }

    const { data: votes } = await supabase
      .from("channel_votes")
      .select("proposal_id, user_id")
      .in("proposal_id", props.map((p) => p.id));

    const enriched = props.map((p) => {
      const pVotes = (votes || []).filter((v) => v.proposal_id === p.id);
      return {
        ...p,
        vote_count: pVotes.length,
        has_voted: pVotes.some((v) => v.user_id === userId),
      };
    });

    setProposals(enriched as any);
  }, [userId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleSubmitProposal = async () => {
    const name = proposalName.trim();
    if (!name) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("channel_proposals").insert({
      name,
      description: proposalDesc.trim() || null,
      created_by: userId,
    });
    setProposalName("");
    setProposalDesc("");
    setShowProposalForm(false);
    setSubmitting(false);
    fetchProposals();
  };

  const handleVote = async (proposalId: string, hasVoted: boolean) => {
    const supabase = createClient();
    if (hasVoted) {
      await supabase
        .from("channel_votes")
        .delete()
        .eq("proposal_id", proposalId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("channel_votes")
        .insert({ proposal_id: proposalId, user_id: userId });

      // Check if threshold reached — auto-create channel
      const { count } = await supabase
        .from("channel_votes")
        .select("*", { count: "exact", head: true })
        .eq("proposal_id", proposalId);

      if (count && count >= VOTE_THRESHOLD) {
        const proposal = proposals.find((p) => p.id === proposalId);
        if (proposal) {
          const slug = proposal.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          await supabase.from("channels").insert({
            name: proposal.name,
            slug,
            description: proposal.description,
            created_by: proposal.created_by,
          });

          await supabase
            .from("channel_proposals")
            .update({ status: "approved" })
            .eq("id", proposalId);
        }
      }
    }
    fetchProposals();
  };

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
          href="/forum"
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
              const isActive = pathname === `/chat/dm-${dm.id}`;
              return (
                <Link
                  key={dm.id}
                  href={`/chat/dm-${dm.id}`}
                  className={cn(
                    "flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium transition-all duration-150",
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
                </Link>
              );
            })}
          </div>
        )}

        {/* Visible channels */}
        {visibleChannels.map((channel) => {
          const isActive = pathname === `/chat/${channel.slug}`;
          return (
            <div key={channel.id} className="group/ch flex items-center">
              <Link
                href={`/chat/${channel.slug}`}
                className={cn(
                  "flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium transition-all duration-150 flex-1 min-w-0",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                )}
              >
                <Hash className="h-[14px] w-[14px] shrink-0 opacity-60" />
                <span className="truncate">{channel.name}</span>
              </Link>
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

        {/* Proposals section */}
        {proposals.length > 0 && (
          <div className="mt-[12px] pt-[12px] border-t border-border-subtle">
            <p className="px-[12px] text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-[6px]">
              Propositions
            </p>
            {proposals.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px]"
              >
                <Vote className="h-[14px] w-[14px] shrink-0 text-text-muted opacity-60" />
                <div className="flex-1 min-w-0">
                  <span className="text-text-secondary font-medium truncate block">{p.name}</span>
                </div>
                <button
                  onClick={() => handleVote(p.id, p.has_voted)}
                  className={cn(
                    "inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[11px] border cursor-pointer transition-all shrink-0",
                    p.has_voted
                      ? "bg-primary-50 border-primary-500/30 text-primary-700"
                      : "bg-bg-surface border-border-default text-text-muted hover:border-border-strong"
                  )}
                >
                  <ThumbsUp className="h-[10px] w-[10px]" />
                  <span className="font-medium">{p.vote_count}/{VOTE_THRESHOLD}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Propose button / form */}
        <div className="mt-[8px]">
          {showProposalForm ? (
            <div className="px-[8px] py-[8px] space-y-[6px]">
              <input
                type="text"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                placeholder="Nom du salon"
                className="w-full bg-bg-elevated border border-border-subtle rounded-md px-[10px] py-[6px] text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
                autoFocus
              />
              <input
                type="text"
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Description (optionnel)"
                className="w-full bg-bg-elevated border border-border-subtle rounded-md px-[10px] py-[6px] text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
              <div className="flex gap-[6px]">
                <button
                  onClick={handleSubmitProposal}
                  disabled={submitting || !proposalName.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-[12px] font-medium text-white rounded-md py-[6px] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proposer
                </button>
                <button
                  onClick={() => { setShowProposalForm(false); setProposalName(""); setProposalDesc(""); }}
                  className="px-[12px] text-[12px] text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowProposalForm(true)}
              className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[12px] font-medium text-text-muted hover:bg-bg-surface hover:text-text-secondary cursor-pointer transition-all w-full"
            >
              <Plus className="h-[14px] w-[14px]" />
              Proposer un salon
            </button>
          )}
        </div>

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
                <Link
                  href={`/chat/${channel.slug}`}
                  className="flex items-center gap-[8px] px-[12px] py-[6px] rounded-md text-[13px] font-medium text-text-muted hover:bg-bg-surface hover:text-text-secondary transition-all flex-1 min-w-0"
                >
                  <Hash className="h-[14px] w-[14px] shrink-0 opacity-40" />
                  <span className="truncate">{channel.name}</span>
                </Link>
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
