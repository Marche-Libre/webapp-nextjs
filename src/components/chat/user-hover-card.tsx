"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
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

type CardPosition = {
  left: number;
  top: number;
  placement: "top" | "bottom";
};

type UserHoverCardContentProps = {
  authorId: string;
  xHandle: string;
  displayFullName?: string | null;
  avatarUrl: string | null;
  categoryName: string | null;
  location?: string | null;
  bio?: string | null;
  style: CSSProperties;
  onCardEnter: () => void;
  onCardLeave: () => void;
};

// Cache profiles to avoid re-fetching
const profileCache = new Map<string, MiniProfile>();
const categoryCache = new Map<string, string>();
const CARD_WIDTH = 260;
const CARD_GAP = 8;
const VIEWPORT_PADDING = 12;
const ESTIMATED_CARD_HEIGHT = 220;
const HIDE_DELAY_MS = 200;

function getCardPosition(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - CARD_WIDTH - VIEWPORT_PADDING);
  const left = Math.min(Math.max(rect.left, VIEWPORT_PADDING), maxLeft);
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const placement: CardPosition["placement"] = spaceBelow < ESTIMATED_CARD_HEIGHT && spaceAbove > spaceBelow ? "top" : "bottom";
  const top = placement === "top"
    ? Math.max(VIEWPORT_PADDING, rect.top - CARD_GAP)
    : Math.min(window.innerHeight - VIEWPORT_PADDING, rect.bottom + CARD_GAP);

  return { left, top, placement };
}

function getCachedProfile(authorId: string) {
  return profileCache.get(authorId) ?? null;
}

function getCachedCategoryName(categoryId: string | null | undefined) {
  return categoryId ? categoryCache.get(categoryId) ?? null : null;
}

function getCardStyle(cardPosition: CardPosition | null): CSSProperties | undefined {
  if (!cardPosition) return undefined;

  return {
    left: cardPosition.left,
    top: cardPosition.top,
    transform: cardPosition.placement === "top" ? "translateY(-100%)" : undefined,
  };
}

function UserHoverCardContent({
  authorId,
  xHandle,
  displayFullName,
  avatarUrl,
  categoryName,
  location,
  bio,
  style,
  onCardEnter,
  onCardLeave,
}: UserHoverCardContentProps) {
  const fullNameNode = displayFullName ? (
    <p className="text-[12px] text-text-secondary truncate">{displayFullName}</p>
  ) : null;
  const categoryNode = categoryName ? (
    <span className="inline-flex items-center rounded-md px-[6px] py-[1px] text-[10px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20 mt-[4px]">
      {categoryName}
    </span>
  ) : null;
  const locationNode = location ? (
    <div className="flex items-center gap-[4px] mt-[10px] text-[11px] text-text-muted">
      <MapPin className="h-[11px] w-[11px]" />
      {location}
    </div>
  ) : null;
  const bioNode = bio ? (
    <p className="text-[11px] text-text-secondary leading-[16px] mt-[8px] line-clamp-3">
      {bio}
    </p>
  ) : null;

  return (
    <div
      className="fixed z-[100] w-[260px] bg-bg-elevated border border-border-default rounded-xl shadow-modal p-[16px] animate-in fade-in zoom-in-95 duration-150"
      style={style}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
      onFocus={onCardEnter}
      onBlur={onCardLeave}
    >
      <div className="flex items-start gap-[12px]">
        <Avatar src={avatarUrl} name={xHandle} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-text-primary truncate">
            @{xHandle}
          </p>
          {fullNameNode}
          {categoryNode}
        </div>
      </div>

      {locationNode}
      {bioNode}

      <Link
        href={`/membres/${authorId}`}
        className="flex items-center gap-[6px] mt-[12px] pt-[10px] border-t border-border-subtle text-[12px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
      >
        <ExternalLink className="h-[12px] w-[12px]" />
        Voir le profil
      </Link>
    </div>
  );
}

export function UserHoverCard({ authorId, x_handle, full_name, avatar_url, className, children }: UserHoverCardProps) {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState<MiniProfile | null>(() => getCachedProfile(authorId));
  const [categoryName, setCategoryName] = useState<string | null>(() => getCachedCategoryName(getCachedProfile(authorId)?.specialty_category_id));
  const [cardPosition, setCardPosition] = useState<CardPosition | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const cardStyle = useMemo(() => getCardStyle(cardPosition), [cardPosition]);
  const displayFullName = profile?.full_name ?? full_name;
  const resolvedAvatarUrl = profile?.avatar_url ?? avatar_url;
  const resolvedHandle = profile?.x_handle ?? x_handle;
  const profileLocation = profile?.location;
  const profileBio = profile?.bio;
  const categoryId = profile?.specialty_category_id;

  const clearHideTimeout = useCallback(() => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const handleCardEnter = useCallback(() => {
    clearHideTimeout();
  }, [clearHideTimeout]);

  const updatePosition = useCallback(() => {
    if (ref.current) setCardPosition(getCardPosition(ref.current));
  }, []);

  const openCard = useCallback(() => {
    updatePosition();
    setShow(true);
  }, [updatePosition]);

  const hideCard = useCallback(() => {
    setShow(false);
  }, []);

  const handleEnter = useCallback(() => {
    clearHideTimeout();
    openCard();
  }, [clearHideTimeout, openCard]);

  const handleLeave = useCallback(() => {
    clearHideTimeout();
    timeoutRef.current = window.setTimeout(hideCard, HIDE_DELAY_MS);
  }, [clearHideTimeout, hideCard]);

  const card = show && cardStyle && typeof document !== "undefined"
    ? createPortal(
        <UserHoverCardContent
          authorId={authorId}
          xHandle={resolvedHandle}
          displayFullName={displayFullName}
          avatarUrl={resolvedAvatarUrl}
          categoryName={categoryName}
          location={profileLocation}
          bio={profileBio}
          style={cardStyle}
          onCardEnter={handleCardEnter}
          onCardLeave={handleLeave}
        />,
        document.body
      )
    : null;

  const clearTimeoutOnUnmountEffect = useCallback(() => {
    return clearHideTimeout;
  }, [clearHideTimeout]);

  const removeWindowListeners = useCallback(() => {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
  }, [updatePosition]);

  const syncWindowListenersEffect = useCallback(() => {
    if (!show) return;

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return removeWindowListeners;
  }, [removeWindowListeners, show, updatePosition]);

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

  useEffect(() => {
    if (!show || profile) return;
    const supabase = createClient();
    void supabase
      .from("profiles_public")
      .select("id, x_handle, full_name, avatar_url, bio, location, country_code, specialty_category_id")
      .eq("id", authorId)
      .maybeSingle()
      .then(handleProfileResponse);
  }, [authorId, handleProfileResponse, profile, show]);

  useEffect(() => {
    if (!show || !categoryId || categoryName) return;
    const supabase = createClient();
    void supabase
      .from("specialty_categories")
      .select("name")
      .eq("id", categoryId)
      .maybeSingle()
      .then(handleCategoryResponse);
  }, [categoryId, categoryName, handleCategoryResponse, show]);

  useEffect(clearTimeoutOnUnmountEffect, [clearTimeoutOnUnmountEffect]);
  useEffect(syncWindowListenersEffect, [syncWindowListenersEffect]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      {card}
    </div>
  );
}
