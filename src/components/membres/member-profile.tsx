"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvailabilityBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MapPin, ExternalLink, MessageSquare, Calendar, Shield, MoreHorizontal, Flag, Ban, Mail, Globe, Briefcase, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { countryFlag, getSpecialtyDisplay } from "@/lib/profile-utils";
import type { Profile, SpecialtyCategory, Specialty } from "@/lib/types/database";

interface ForumPostPreview {
  id: string;
  title: string;
  reply_count: number;
  created_at: string;
  category: { name: string; color: string | null; slug: string } | null;
}

interface MemberProfileProps {
  member: Profile;
  sponsor: { x_handle: string } | null;
  recentPosts: ForumPostPreview[];
  currentUserId: string;
  isBlocked: boolean;
  categories: (SpecialtyCategory & { specialties: Specialty[] })[];
}

function ReportBlockMenu({ memberId, currentUserId }: { memberId: string; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const handleReport = async () => {
    const reason = prompt("Raison du signalement :");
    if (!reason) return;
    const supabase = createClient();
    await supabase.from("user_reports").insert({ reporter_id: currentUserId, reported_id: memberId, reason });
    setOpen(false);
    alert("Signalement envoyé.");
  };

  const handleBlock = async () => {
    if (!confirm("Bloquer ce membre ?")) return;
    const supabase = createClient();
    await supabase.from("user_blocks").insert({ blocker_id: currentUserId, blocked_id: memberId });
    setOpen(false);
    alert("Membre bloqué.");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-[8px] rounded-lg border border-border-default hover:border-border-strong text-text-muted hover:text-text-primary cursor-pointer transition-colors"
      >
        <MoreHorizontal className="h-[16px] w-[16px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-[4px] bg-bg-base border border-border-default rounded-lg shadow-modal p-[4px] z-20 w-[160px]">
          <button onClick={handleReport} className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-md text-[13px] text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors w-full cursor-pointer">
            <Flag className="h-[14px] w-[14px]" />Signaler
          </button>
          <button onClick={handleBlock} className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-md text-[13px] text-error hover:bg-error-bg transition-colors w-full cursor-pointer">
            <Ban className="h-[14px] w-[14px]" />Bloquer
          </button>
        </div>
      )}
    </div>
  );
}

function SendDmButton({ memberId, currentUserId, acceptDms }: { memberId: string; currentUserId: string; acceptDms: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSendDm = async () => {
    if (!acceptDms) {
      setError("Ce membre n\u2019accepte pas les messages priv\u00e9s.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data: myChannels } = await supabase
      .from("channel_members")
      .select("channel_id")
      .eq("user_id", currentUserId);

    let existingChannelId: string | null = null;

    if (myChannels && myChannels.length > 0) {
      const channelIds = myChannels.map((c) => c.channel_id);

      const { data: sharedMemberships } = await supabase
        .from("channel_members")
        .select("channel_id")
        .eq("user_id", memberId)
        .in("channel_id", channelIds);

      if (sharedMemberships && sharedMemberships.length > 0) {
        const sharedIds = sharedMemberships.map((c) => c.channel_id);
        const { data: privateChannel } = await supabase
          .from("channels")
          .select("id")
          .in("id", sharedIds)
          .eq("is_private", true)
          .limit(1)
          .maybeSingle();

        if (privateChannel) {
          existingChannelId = privateChannel.id;
        }
      }
    }

    if (existingChannelId) {
      router.push(`/chat/dm-${existingChannelId}`);
      return;
    }

    const slug = `dm-${[currentUserId, memberId].sort().join("-").slice(0, 32)}`;
    const { data: newChannel, error: insertError } = await supabase
      .from("channels")
      .insert({
        name: `DM-${Date.now()}`,
        slug,
        is_private: true,
        created_by: currentUserId,
      })
      .select("id")
      .single();

    if (insertError || !newChannel) {
      setLoading(false);
      return;
    }

    await supabase.from("channel_members").insert([
      { channel_id: newChannel.id, user_id: currentUserId },
      { channel_id: newChannel.id, user_id: memberId },
    ]);

    setLoading(false);
    router.push(`/chat/dm-${newChannel.id}`);
  };

  return (
    <div className="flex flex-col items-end gap-[4px]">
      <Button
        onClick={handleSendDm}
        disabled={loading}
        size="sm"
        variant="outline"
        className="shrink-0"
      >
        <Mail className="h-[14px] w-[14px]" />
        {loading ? "..." : "Message"}
      </Button>
      {error && (
        <span className="text-[11px] text-error">{error}</span>
      )}
    </div>
  );
}

export function MemberProfile({ member, sponsor, recentPosts, currentUserId, isBlocked, categories }: MemberProfileProps) {
  const isOwnProfile = member.id === currentUserId;
  const links = member.links as Record<string, string> | null;
  const hasLinks = links && Object.keys(links).length > 0;
  const canDm = !isOwnProfile && !isBlocked && member.accept_dms;
  const skills = member.skills ?? [];
  const specDisplay = getSpecialtyDisplay(member, categories);

  return (
    <div className="max-w-[640px] mx-auto space-y-[24px]">
      {/* Header card */}
      <div className="bg-bg-base rounded-xl shadow-card p-[24px]">
        <div className="flex items-start gap-[16px]">
          <Avatar
            src={member.avatar_url}
            name={member.x_handle}
            size="xl"
            availability={member.availability_status}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[10px] flex-wrap">
              <h1 className="font-display text-[20px] font-bold text-text-primary tracking-[-0.02em]">
                @{member.x_handle}
              </h1>
              <AvailabilityBadge status={member.availability_status} />
            </div>
            {member.full_name && (
              <p className="text-[14px] text-text-secondary mt-[2px]">{member.full_name}</p>
            )}
            <div className="flex items-center gap-[8px] mt-[8px] flex-wrap">
              {specDisplay.categoryName && (
                <Badge variant="primary">{specDisplay.categoryName}</Badge>
              )}
              {specDisplay.specialtyNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                >
                  {name}
                </span>
              ))}
              {member.location && (
                <span className="flex items-center gap-[4px] text-[12px] text-text-muted">
                  <MapPin className="h-[12px] w-[12px]" />
                  {member.country_code && <span>{countryFlag(member.country_code)}</span>}
                  {member.location}
                </span>
              )}
            </div>

            {/* Extra info */}
            <div className="flex items-center gap-[12px] mt-[6px] flex-wrap">
              {member.years_experience != null && (
                <span className="text-[12px] text-text-muted flex items-center gap-[4px]">
                  <Briefcase className="h-[12px] w-[12px]" />
                  {member.years_experience} ans d&apos;expérience
                </span>
              )}
              {member.daily_rate && (
                <span className="text-[12px] text-text-muted flex items-center gap-[4px]">
                  <Clock className="h-[12px] w-[12px]" />
                  {member.daily_rate}
                </span>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-[6px] mt-[8px]">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Website */}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[6px] mt-[8px] px-[12px] py-[6px] rounded-lg border border-border-default hover:border-border-strong text-[12px] font-medium text-primary-500 hover:bg-bg-surface transition-all"
              >
                <Globe className="h-[12px] w-[12px]" />
                Visiter le site
              </a>
            )}
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="flex items-center gap-[6px] shrink-0">
              {canDm && (
                <SendDmButton memberId={member.id} currentUserId={currentUserId} acceptDms={!!member.accept_dms} />
              )}
              <ReportBlockMenu memberId={member.id} currentUserId={currentUserId} />
            </div>
          )}
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="text-[14px] leading-[22px] text-text-secondary mt-[16px]">
            {member.bio}
          </p>
        )}

        {/* Sponsor badge */}
        {sponsor && (
          <div className="mt-[16px] flex items-center gap-[6px]">
            <Shield className="h-[14px] w-[14px] text-primary-500" />
            <span className="text-[12px] font-medium text-text-secondary">
              Parrainé par <span className="text-primary-500">@{sponsor.x_handle}</span>
            </span>
          </div>
        )}

        {/* Member since */}
        <div className="mt-[12px] flex items-center gap-[6px] text-[12px] text-text-muted">
          <Calendar className="h-[12px] w-[12px]" />
          Membre depuis {formatDate(member.created_at)}
        </div>
      </div>

      {/* Links */}
      {hasLinks && (
        <div className="bg-bg-base rounded-xl shadow-card p-[24px]">
          <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
            Liens
          </h2>
          <div className="space-y-[8px]">
            {Object.entries(links).map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-lg border border-border-default hover:border-border-strong hover:bg-bg-surface transition-all text-[13px] font-medium text-text-primary"
              >
                <ExternalLink className="h-[14px] w-[14px] text-text-muted shrink-0" />
                <span className="truncate">{label}</span>
                <span className="text-[11px] text-text-muted truncate ml-auto">{url.replace(/^https?:\/\//, "")}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recent forum posts */}
      {recentPosts.length > 0 && (
        <div className="bg-bg-base rounded-xl shadow-card p-[24px]">
          <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-[0.06em] mb-[12px]">
            Publications récentes
          </h2>
          <div className="space-y-[6px]">
            {recentPosts.map((post) => {
              const cat = post.category as { name: string; color: string | null; slug: string } | null;
              return (
                <Link
                  key={post.id}
                  href={`/forum/posts/${post.id}`}
                  className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-lg hover:bg-bg-surface transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary truncate">{post.title}</p>
                    <div className="flex items-center gap-[8px] mt-[2px]">
                      {cat && (
                        <span
                          className="text-[10px] font-medium px-[6px] py-[1px] rounded-full"
                          style={{
                            backgroundColor: `${cat.color || "#6b7280"}15`,
                            color: cat.color || "#6b7280",
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                      <span className="text-[11px] text-text-muted">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-[3px] text-[11px] text-text-muted shrink-0">
                    <MessageSquare className="h-[12px] w-[12px]" />
                    {post.reply_count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
