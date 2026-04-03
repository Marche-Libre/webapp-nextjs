"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { MapPin, ExternalLink } from "lucide-react";

interface UserHoverCardProps {
  authorId: string;
  x_handle: string;
  avatar_url: string | null;
  children: React.ReactNode;
}

type MiniProfile = {
  id: string;
  x_handle: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country_code: string | null;
  specialty_category_id: string | null;
};

// Cache profiles to avoid re-fetching
const profileCache = new Map<string, MiniProfile>();

export function UserHoverCard({ authorId, x_handle, avatar_url, children }: UserHoverCardProps) {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState<MiniProfile | null>(profileCache.get(authorId) || null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  };

  useEffect(() => {
    if (!show || profile) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, x_handle, full_name, avatar_url, bio, location, country_code, specialty_category_id")
      .eq("id", authorId)
      .single()
      .then(({ data }) => {
        if (data) {
          profileCache.set(authorId, data as MiniProfile);
          setProfile(data as MiniProfile);
          if (data.specialty_category_id) {
            supabase
              .from("specialty_categories")
              .select("name")
              .eq("id", data.specialty_category_id)
              .single()
              .then(({ data: cat }) => {
                if (cat) setCategoryName(cat.name);
              });
          }
        }
      });
  }, [show, profile, authorId]);

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      {show && (
        <div
          className="absolute left-0 top-full mt-[4px] z-50 w-[260px] bg-bg-elevated border border-border-default rounded-xl shadow-modal p-[16px] animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={() => clearTimeout(timeoutRef.current)}
          onMouseLeave={handleLeave}
        >
          <div className="flex items-start gap-[12px]">
            <Avatar src={profile?.avatar_url ?? avatar_url} name={x_handle} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-text-primary truncate">
                @{profile?.x_handle ?? x_handle}
              </p>
              {profile?.full_name && (
                <p className="text-[12px] text-text-secondary truncate">{profile.full_name}</p>
              )}
              {categoryName && (
                <span className="inline-flex items-center rounded-md px-[6px] py-[1px] text-[10px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20 mt-[4px]">
                  {categoryName}
                </span>
              )}
            </div>
          </div>

          {profile?.location && (
            <div className="flex items-center gap-[4px] mt-[10px] text-[11px] text-text-muted">
              <MapPin className="h-[11px] w-[11px]" />
              {profile.location}
            </div>
          )}

          {profile?.bio && (
            <p className="text-[11px] text-text-secondary leading-[16px] mt-[8px] line-clamp-3">
              {profile.bio}
            </p>
          )}

          <Link
            href={`/membres/${authorId}`}
            className="flex items-center gap-[6px] mt-[12px] pt-[10px] border-t border-border-subtle text-[12px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            <ExternalLink className="h-[12px] w-[12px]" />
            Voir le profil
          </Link>
        </div>
      )}
    </div>
  );
}
