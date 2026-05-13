"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { createClient } from "@/lib/supabase/client";
import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserHoverCardProps {
  authorId: string;
  x_handle: string;
  full_name?: string | null;
  avatar_url: string | null;
  className?: string;
  children: ReactNode;
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

type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type UserHoverCardContentProps = {
  authorId: string;
  xHandle: string;
  displayFullName?: string | null;
  avatarUrl: string | null;
  categoryName: string | null;
  location?: string | null;
  bio?: string | null;
};

// Cache profiles to avoid re-fetching
const profileCache = new Map<string, MiniProfile>();
const categoryCache = new Map<string, string>();

function getCachedProfile(authorId: string) {
  return profileCache.get(authorId) ?? null;
}

function getCachedCategoryName(categoryId: string | null | undefined) {
  return categoryId ? categoryCache.get(categoryId) ?? null : null;
}

function UserHoverCardContent({
  authorId,
  xHandle,
  displayFullName,
  avatarUrl,
  categoryName,
  location,
  bio,
}: UserHoverCardContentProps) {
  return (
    <>
      <div className="flex items-start gap-[12px]">
        <Avatar src={avatarUrl} name={xHandle} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-text-primary truncate">
            @{xHandle}
          </p>
          {displayFullName ? (
            <p className="text-[12px] text-text-secondary truncate">{displayFullName}</p>
          ) : null}
          {categoryName ? (
            <span className="inline-flex items-center rounded-md px-[6px] py-[1px] text-[10px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20 mt-[4px]">
              {categoryName}
            </span>
          ) : null}
        </div>
      </div>

      {location ? (
        <div className="flex items-center gap-[4px] mt-[10px] text-[11px] text-text-muted">
          <MapPin className="h-[11px] w-[11px]" />
          {location}
        </div>
      ) : null}
      {bio ? (
        <p className="text-[11px] text-text-secondary leading-[16px] mt-[8px] line-clamp-3">
          {bio}
        </p>
      ) : null}

      <Link
        href={`/membres/${authorId}`}
        className="flex items-center gap-[6px] mt-[12px] pt-[10px] border-t border-border-subtle text-[12px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
      >
        <ExternalLink className="h-[12px] w-[12px]" />
        Voir le profil
      </Link>
    </>
  );
}

export function UserHoverCard({ authorId, x_handle, full_name, avatar_url, className, children }: UserHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<MiniProfile | null>(() => getCachedProfile(authorId));
  const [categoryName, setCategoryName] = useState<string | null>(() => getCachedCategoryName(getCachedProfile(authorId)?.specialty_category_id));

  const displayFullName = profile?.full_name ?? full_name;
  const resolvedAvatarUrl = profile?.avatar_url ?? avatar_url;
  const resolvedHandle = profile?.x_handle ?? x_handle;
  const profileLocation = profile?.location;
  const profileBio = profile?.bio;
  const categoryId = profile?.specialty_category_id;

  const applyFetchedProfile = useCallback((fetchedProfile: MiniProfile | null) => {
    if (!fetchedProfile) return;
    profileCache.set(authorId, fetchedProfile);
    setProfile(fetchedProfile);
    setCategoryName(getCachedCategoryName(fetchedProfile.specialty_category_id));
  }, [authorId]);

  const applyFetchedCategory = useCallback((categoryIdToCache: string, fetchedCategory: { name: string } | null) => {
    if (!fetchedCategory) return;
    categoryCache.set(categoryIdToCache, fetchedCategory.name);
    setCategoryName(fetchedCategory.name);
  }, []);

  const handleProfileResponse = useCallback((response: SupabaseResponse<MiniProfile>) => {
    if (response.error) return;
    applyFetchedProfile(response.data);
  }, [applyFetchedProfile]);

  const handleCategoryResponse = useCallback((response: SupabaseResponse<{ name: string }>) => {
    if (!categoryId || response.error) return;
    applyFetchedCategory(categoryId, response.data);
  }, [applyFetchedCategory, categoryId]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  useEffect(() => {
    if (!open || profile) return;
    const supabase = createClient();
    void supabase
      .from("profiles")
      .select("id, x_handle, full_name, avatar_url, bio, location, country_code, specialty_category_id")
      .eq("id", authorId)
      .maybeSingle()
      .then(handleProfileResponse);
  }, [authorId, handleProfileResponse, open, profile]);

  useEffect(() => {
    if (!open || !categoryId || categoryName) return;
    const supabase = createClient();
    void supabase
      .from("specialty_categories")
      .select("name")
      .eq("id", categoryId)
      .maybeSingle()
      .then(handleCategoryResponse);
  }, [categoryId, categoryName, handleCategoryResponse, open]);

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange} openDelay={120} closeDelay={120}>
      <HoverCardTrigger asChild>
        <span className={cn("inline-flex", className)}>
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={12}
        className="w-[260px] max-h-[calc(100vh-24px)] overflow-y-auto border-border-default rounded-xl p-[16px]"
      >
        <UserHoverCardContent
          authorId={authorId}
          xHandle={resolvedHandle}
          displayFullName={displayFullName}
          avatarUrl={resolvedAvatarUrl}
          categoryName={categoryName}
          location={profileLocation}
          bio={profileBio}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
