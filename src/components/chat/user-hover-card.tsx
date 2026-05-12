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

type CardPosition = {
  left: number;
  top: number;
  placement: "top" | "bottom";
};

// Cache profiles to avoid re-fetching
const profileCache = new Map<string, MiniProfile>();
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

export function UserHoverCard({ authorId, x_handle, full_name, avatar_url, className, children }: UserHoverCardProps) {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState<MiniProfile | null>(profileCache.get(authorId) || null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [cardPosition, setCardPosition] = useState<CardPosition | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const displayFullName = useMemo(() => {
    return profile?.full_name ?? full_name;
  }, [full_name, profile?.full_name]);

  const buildCardStyle = useCallback(() => {
    if (!cardPosition) return undefined;

    return {
      left: cardPosition.left,
      top: cardPosition.top,
      transform: cardPosition.placement === "top" ? "translateY(-100%)" : undefined,
    };
  }, [cardPosition]);

  const cardStyle = useMemo<CSSProperties | undefined>(() => buildCardStyle(), [buildCardStyle]);

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

  const buildCard = useCallback(() => {
    if (!show || !cardPosition || !cardStyle || typeof document === "undefined") return null;

    const profileLocation = profile?.location;
    const profileBio = profile?.bio;
    const resolvedAvatarUrl = profile?.avatar_url ?? avatar_url;
    const resolvedHandle = profile?.x_handle ?? x_handle;

    const fullNameNode = displayFullName ? (
      <p className="text-[12px] text-text-secondary truncate">{displayFullName}</p>
    ) : null;
    const categoryNode = categoryName ? (
      <span className="inline-flex items-center rounded-md px-[6px] py-[1px] text-[10px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20 mt-[4px]">
        {categoryName}
      </span>
    ) : null;
    const locationNode = profileLocation ? (
      <div className="flex items-center gap-[4px] mt-[10px] text-[11px] text-text-muted">
        <MapPin className="h-[11px] w-[11px]" />
        {profileLocation}
      </div>
    ) : null;
    const bioNode = profileBio ? (
      <p className="text-[11px] text-text-secondary leading-[16px] mt-[8px] line-clamp-3">
        {profileBio}
      </p>
    ) : null;

    return createPortal(
      <div
        className="fixed z-[100] w-[260px] bg-bg-elevated border border-border-default rounded-xl shadow-modal p-[16px] animate-in fade-in zoom-in-95 duration-150"
        style={cardStyle}
        onPointerEnter={handleCardEnter}
        onPointerLeave={handleLeave}
      >
        <div className="flex items-start gap-[12px]">
          <Avatar src={resolvedAvatarUrl} name={x_handle} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-text-primary truncate">
              @{resolvedHandle}
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
      </div>,
      document.body
    );
  }, [
    authorId,
    avatar_url,
    cardPosition,
    cardStyle,
    categoryName,
    displayFullName,
    handleCardEnter,
    handleLeave,
    profile?.avatar_url,
    profile?.bio,
    profile?.location,
    profile?.x_handle,
    show,
    x_handle,
  ]);

  const card = useMemo(() => buildCard(), [buildCard]);

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
  }, [authorId]);

  const applyFetchedCategory = useCallback((fetchedCategory: { name: string } | null) => {
    if (!fetchedCategory) return;
    setCategoryName(fetchedCategory.name);
  }, []);

  useEffect(() => {
    if (!show || profile) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, x_handle, full_name, avatar_url, bio, location, country_code, specialty_category_id")
      .eq("id", authorId)
      .single()
      .then(({ data }) => {
        applyFetchedProfile(data as MiniProfile | null);
      });
  }, [applyFetchedProfile, authorId, profile, show]);

  useEffect(() => {
    const categoryId = profile?.specialty_category_id;
    if (!show || !categoryId || categoryName) return;
    const supabase = createClient();
    supabase
      .from("specialty_categories")
      .select("name")
      .eq("id", categoryId)
      .single()
      .then(({ data }) => {
        applyFetchedCategory(data as { name: string } | null);
      });
  }, [applyFetchedCategory, categoryName, profile?.specialty_category_id, show]);

  useEffect(clearTimeoutOnUnmountEffect, [clearTimeoutOnUnmountEffect]);
  useEffect(syncWindowListenersEffect, [syncWindowListenersEffect]);

  useEffect(() => {
    if (!show || !profile?.specialty_category_id || categoryName) return;
    const supabase = createClient();
    supabase
      .from("specialty_categories")
      .select("name")
      .eq("id", profile.specialty_category_id)
      .single()
      .then(({ data: cat }) => {
        if (cat) setCategoryName(cat.name);
      });
  }, [show, profile?.specialty_category_id, categoryName]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex", className)}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {children}
      {card}
    </div>
  );
}
