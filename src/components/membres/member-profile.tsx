"use client";

import { Avatar, AvailabilityBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MapPin, ExternalLink, Calendar, Shield, Globe, Briefcase, Clock } from "lucide-react";
import { countryFlag, getSpecialtyDisplay } from "@/lib/profile-utils";
import type { Profile, SpecialtyCategory, Specialty } from "@/lib/types/database";

interface MemberProfileProps {
  member: Profile;
  sponsor: { x_handle: string } | null;
  categories: (SpecialtyCategory & { specialties: Specialty[] })[];
}

function getXProfileUrl(xHandle: string) {
  return `https://x.com/${xHandle.replace(/^@/, "")}`;
}

export function MemberProfile({ member, sponsor, categories }: MemberProfileProps) {
  const links = member.links as Record<string, string> | null;
  const hasLinks = links && Object.keys(links).length > 0;
  const skills = member.skills ?? [];
  const specDisplay = getSpecialtyDisplay(member, categories);
  const xProfileUrl = getXProfileUrl(member.x_handle);

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
              <a
                href={xProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-[20px] font-bold text-text-primary tracking-[-0.02em] transition-colors hover:text-primary-500"
              >
                @{member.x_handle}
              </a>
              <AvailabilityBadge status={member.availability_status} />
            </div>
            {member.full_name && (
              <p className="text-[14px] text-text-secondary mt-[2px]">{member.full_name}</p>
            )}
            {member.location && (
              <p className="mt-[4px] flex items-center gap-[4px] text-[12px] text-text-muted">
                <MapPin className="h-[12px] w-[12px]" />
                {member.country_code && <span>{countryFlag(member.country_code)}</span>}
                <span className="truncate">{member.location}</span>
              </p>
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

    </div>
  );
}
