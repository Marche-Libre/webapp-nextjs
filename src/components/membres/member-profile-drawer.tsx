"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Calendar, Clock, ExternalLink, Globe, MapPin, RefreshCw, Shield, X } from "lucide-react";
import { Avatar, AvailabilityBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMemberOnline } from "@/components/presence/presence-provider";
import { fetchUserPresence, formatLastActivityLabel } from "@/lib/presence";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate } from "@/lib/utils";
import { countryFlag, getSpecialtyDisplay } from "@/lib/profile-utils";
import type { Profile, Specialty, SpecialtyCategory } from "@/lib/types/database";
import type { MemberProfileSeed } from "./member-profile-drawer-context";

type PublicMemberProfile = {
  id: string;
  x_handle: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country_code: string | null;
  specialty_ids: string[];
  specialty_category_id: string | null;
  specialty_category_ids: string[];
  availability_status: Profile["availability_status"] | null;
  skills: string[];
  years_experience: number | null;
  daily_rate: string | null;
  website: string | null;
  links: Record<string, string> | null;
  sponsored_by: string | null;
  created_at: string | null;
};

type CategoryWithSpecialties = SpecialtyCategory & { specialties: Specialty[] };
type SponsorPreview = { x_handle: string } | null;

type DrawerLoadState =
  | { status: "idle"; profile: null; categories: CategoryWithSpecialties[]; sponsor: SponsorPreview; lastSeenAt: string | null }
  | { status: "loading"; profile: PublicMemberProfile | null; categories: CategoryWithSpecialties[]; sponsor: SponsorPreview; lastSeenAt: string | null }
  | { status: "ready"; profile: PublicMemberProfile; categories: CategoryWithSpecialties[]; sponsor: SponsorPreview; lastSeenAt: string | null }
  | { status: "error"; profile: PublicMemberProfile | null; categories: CategoryWithSpecialties[]; sponsor: SponsorPreview; lastSeenAt: string | null };

type MemberProfileDrawerProps = {
  memberId: string | null;
  seed: MemberProfileSeed | null;
  onClose: () => void;
};

type SupabaseClient = ReturnType<typeof createClient>;

const PUBLIC_MEMBER_PROFILE_FIELDS =
  "id,x_handle,full_name,avatar_url,bio,location,country_code,specialty_ids,specialty_category_id,specialty_category_ids,availability_status,skills,years_experience,daily_rate,website,links,sponsored_by,created_at";
const BASIC_PUBLIC_MEMBER_PROFILE_FIELDS =
  "id,x_handle,full_name,avatar_url,bio,location,specialty_category_id";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const profileCache = new Map<string, PublicMemberProfile>();
let categoriesCache: CategoryWithSpecialties[] | null = null;

function makeSeedProfile(memberId: string | null, seed: MemberProfileSeed | null): PublicMemberProfile | null {
  if (!memberId || !seed?.x_handle) return null;

  return {
    id: memberId,
    x_handle: seed.x_handle,
    full_name: seed.full_name ?? null,
    avatar_url: seed.avatar_url ?? null,
    bio: null,
    location: null,
    country_code: null,
    specialty_ids: [],
    specialty_category_id: null,
    specialty_category_ids: [],
    availability_status: null,
    skills: [],
    years_experience: null,
    daily_rate: null,
    website: null,
    links: null,
    sponsored_by: null,
    created_at: null,
  };
}

function normalizeLinks(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const entries = Object.entries(value)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0);

  if (entries.length === 0) return null;

  return Object.fromEntries(entries);
}

function normalizeProfile(row: Partial<PublicMemberProfile> | null): PublicMemberProfile | null {
  if (!row?.id || !row.x_handle) return null;

  return {
    id: row.id,
    x_handle: row.x_handle,
    full_name: row.full_name ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: row.bio ?? null,
    location: row.location ?? null,
    country_code: row.country_code ?? null,
    specialty_ids: Array.isArray(row.specialty_ids) ? row.specialty_ids : [],
    specialty_category_id: row.specialty_category_id ?? null,
    specialty_category_ids: Array.isArray(row.specialty_category_ids) ? row.specialty_category_ids : [],
    availability_status: row.availability_status ?? null,
    skills: Array.isArray(row.skills) ? row.skills : [],
    years_experience: row.years_experience ?? null,
    daily_rate: row.daily_rate ?? null,
    website: row.website ?? null,
    links: normalizeLinks(row.links),
    sponsored_by: row.sponsored_by ?? null,
    created_at: row.created_at ?? null,
  };
}

async function fetchProfileFromTable(
  supabase: SupabaseClient,
  tableName: "profiles_public" | "profiles",
  memberId: string,
  fields: string = PUBLIC_MEMBER_PROFILE_FIELDS,
) {
  const { data, error } = await supabase
    .from(tableName)
    .select(fields)
    .eq("id", memberId)
    .maybeSingle();

  if (error) return null;

  return normalizeProfile(data as Partial<PublicMemberProfile> | null);
}

async function fetchPublicMemberProfile(supabase: SupabaseClient, memberId: string) {
  const memberProfile = await fetchProfileFromTable(supabase, "profiles", memberId);
  if (memberProfile) return memberProfile;

  const publicProfile = await fetchProfileFromTable(supabase, "profiles_public", memberId);
  if (publicProfile) return publicProfile;

  const basicPublicProfile = await fetchProfileFromTable(
    supabase,
    "profiles_public",
    memberId,
    BASIC_PUBLIC_MEMBER_PROFILE_FIELDS,
  );
  if (basicPublicProfile) return basicPublicProfile;

  return null;
}

async function fetchSponsor(supabase: SupabaseClient, sponsorId: string | null) {
  if (!sponsorId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("x_handle")
    .eq("id", sponsorId)
    .maybeSingle();

  if (error || !data?.x_handle) return null;

  return { x_handle: data.x_handle };
}

async function fetchCategories(supabase: SupabaseClient) {
  if (categoriesCache) return categoriesCache;

  const { data } = await supabase
    .from("specialty_categories")
    .select("*, specialties(*)")
    .order("sort_order", { ascending: true });

  categoriesCache = (data ?? []) as CategoryWithSpecialties[];
  return categoriesCache;
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
}

function getXProfileUrl(xHandle: string) {
  return `https://x.com/${xHandle.replace(/^@/, "")}`;
}

function LoadingProfile() {
  return (
    <div className="space-y-[20px] p-[20px]">
      <div className="flex items-start gap-[14px]">
        <div className="h-[72px] w-[72px] rounded-xl bg-bg-surface animate-pulse" />
        <div className="flex-1 space-y-[8px] pt-[6px]">
          <div className="h-[18px] w-[120px] rounded bg-bg-surface animate-pulse" />
          <div className="h-[14px] w-[170px] rounded bg-bg-surface animate-pulse" />
          <div className="h-[20px] w-[84px] rounded-md bg-bg-surface animate-pulse" />
        </div>
      </div>
      <div className="space-y-[8px]">
        <div className="h-[12px] w-full rounded bg-bg-surface animate-pulse" />
        <div className="h-[12px] w-[82%] rounded bg-bg-surface animate-pulse" />
        <div className="h-[12px] w-[62%] rounded bg-bg-surface animate-pulse" />
      </div>
    </div>
  );
}

function ErrorProfile({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-[28px] text-center">
      <p className="text-[15px] font-semibold text-text-primary">Profil indisponible</p>
      <p className="mt-[6px] text-[13px] leading-[20px] text-text-muted">
        Les informations de ce membre ne peuvent pas être chargées pour le moment.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-[16px] inline-flex cursor-pointer items-center gap-[8px] rounded-lg border border-border-default px-[12px] py-[8px] text-[13px] font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <RefreshCw className="h-[14px] w-[14px]" />
        Réessayer
      </button>
    </div>
  );
}

function PresenceStatus({ profileId, lastSeenAt }: { profileId: string; lastSeenAt: string | null }) {
  const isOnline = useIsMemberOnline(profileId);
  const lastActivityLabel = useMemo(() => {
    if (isOnline) return null;

    return formatLastActivityLabel(lastSeenAt);
  }, [isOnline, lastSeenAt]);

  if (isOnline) {
    return (
      <span className="inline-flex items-center gap-[6px] text-[12px] font-medium text-emerald-700">
        <span className="h-[7px] w-[7px] rounded-full bg-emerald-500" aria-hidden="true" />
        Actuellement en ligne
      </span>
    );
  }

  if (!lastActivityLabel) return null;

  return (
    <span className="inline-flex items-center gap-[5px] text-[12px] text-text-muted">
      <Clock className="h-[13px] w-[13px]" />
      {lastActivityLabel}
    </span>
  );
}

function ProfileAvatar({ profile }: { profile: PublicMemberProfile }) {
  const isOnline = useIsMemberOnline(profile.id);

  return (
    <span className="relative inline-flex shrink-0">
      <Avatar
        src={profile.avatar_url}
        name={profile.x_handle}
        size="xl"
      />
      {isOnline ? (
        <span
          className="absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-bg-base bg-emerald-500"
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}

function ProfileContent({
  profile,
  categories,
  sponsor,
  lastSeenAt,
}: {
  profile: PublicMemberProfile;
  categories: CategoryWithSpecialties[];
  sponsor: SponsorPreview;
  lastSeenAt: string | null;
}) {
  const specDisplay = getSpecialtyDisplay(profile, categories);
  const skills = profile.skills ?? [];
  const links = profile.links ?? null;
  const hasLinks = links && Object.keys(links).length > 0;
  const xProfileUrl = getXProfileUrl(profile.x_handle);
  const categoryItems = specDisplay.categoryNames.map((name) => (
    <Badge key={name} variant="primary">{name}</Badge>
  ));
  const specialtyItems = specDisplay.specialtyNames.map((name) => (
    <span
      key={name}
      className="inline-flex items-center rounded-md border border-primary-500/20 bg-primary-50 px-[8px] py-[3px] text-[11px] font-medium text-primary-500"
    >
      {name}
    </span>
  ));
  const skillItems = skills.map((skill) => (
    <span
      key={skill}
      className="inline-flex items-center rounded-md border border-primary-500/20 bg-primary-50 px-[8px] py-[3px] text-[11px] font-medium text-primary-500"
    >
      {skill}
    </span>
  ));
  const linkItems = hasLinks
    ? Object.entries(links).map(([label, url]) => (
      <a
        key={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-[10px] rounded-lg border border-border-default px-[12px] py-[10px] text-[13px] font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Globe className="h-[14px] w-[14px] shrink-0 text-text-muted" />
        <span className="truncate">{label}</span>
        <span className="ml-auto truncate text-[11px] text-text-muted">{url.replace(/^https?:\/\//, "")}</span>
      </a>
    ))
    : [];
  return (
    <div className="space-y-[20px] p-[20px]">
      <section className="space-y-[14px]">
        <div className="flex items-start gap-[14px]">
          <ProfileAvatar profile={profile} />
          <div className="min-w-0 flex-1 pt-[2px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <a
                href={xProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center rounded-full border border-primary-500/25 bg-primary-50 px-[10px] py-[4px] font-display text-[18px] font-bold text-primary-400 transition-colors hover:border-primary-500/45 hover:bg-primary-500/20 hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <span className="truncate">@{profile.x_handle}</span>
              </a>
              <Badge variant="success">Vérifié</Badge>
            </div>
            {profile.full_name ? (
              <p className="mt-[2px] truncate text-[14px] text-text-secondary">{profile.full_name}</p>
            ) : null}
            {profile.location ? (
              <p className="mt-[4px] flex items-center gap-[4px] text-[12px] text-text-muted">
                <MapPin className="h-[12px] w-[12px]" />
                {profile.country_code ? <span>{countryFlag(profile.country_code)}</span> : null}
                <span className="truncate">{profile.location}</span>
              </p>
            ) : null}
            <div className="mt-[8px] flex flex-col items-start gap-[6px]">
              <PresenceStatus profileId={profile.id} lastSeenAt={lastSeenAt} />
              {profile.availability_status && profile.availability_status !== "unset" ? (
                <div className="flex flex-wrap items-center gap-[6px]">
                  <span className="text-[11px] font-medium text-text-muted">Disponibilité déclarée :</span>
                  <AvailabilityBadge status={profile.availability_status} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {(categoryItems.length > 0 || specialtyItems.length > 0) ? (
          <div className="flex flex-wrap items-center gap-[6px]">
            {categoryItems}
            {specialtyItems}
          </div>
        ) : null}

        {(profile.years_experience != null || profile.daily_rate) ? (
          <div className="flex flex-wrap items-center gap-[12px]">
            {profile.years_experience != null ? (
              <span className="flex items-center gap-[4px] text-[12px] text-text-muted">
                <Briefcase className="h-[12px] w-[12px]" />
                {profile.years_experience} ans d&apos;expérience
              </span>
            ) : null}
            {profile.daily_rate ? (
              <span className="flex items-center gap-[4px] text-[12px] text-text-muted">
                <Clock className="h-[12px] w-[12px]" />
                {profile.daily_rate}
              </span>
            ) : null}
          </div>
        ) : null}

        {(sponsor || profile.created_at) ? (
          <div className="flex flex-wrap items-center gap-[12px] border-t border-border-subtle pt-[12px]">
            {sponsor ? (
              <span className="flex items-center gap-[5px] text-[12px] font-medium text-text-secondary">
                <Shield className="h-[13px] w-[13px] text-primary-500" />
                Parrainé par <span className="text-primary-500">@{sponsor.x_handle}</span>
              </span>
            ) : null}
            {profile.created_at ? (
              <span className="flex items-center gap-[5px] text-[12px] text-text-muted">
                <Calendar className="h-[13px] w-[13px]" />
                Membre depuis {formatDate(profile.created_at)}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      {profile.bio ? (
        <section className="border-t border-border-subtle pt-[18px]">
          <p className="whitespace-pre-wrap text-[14px] leading-[22px] text-text-secondary">{profile.bio}</p>
        </section>
      ) : null}

      {skillItems.length > 0 ? (
        <section className="border-t border-border-subtle pt-[18px]">
          <h3 className="mb-[10px] text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
            Compétences
          </h3>
          <div className="flex flex-wrap gap-[6px]">{skillItems}</div>
        </section>
      ) : null}

      {profile.website ? (
        <section className="border-t border-border-subtle pt-[18px]">
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-[6px] rounded-lg border border-border-default px-[12px] py-[8px] text-[12px] font-medium text-primary-500 transition-colors hover:bg-bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ExternalLink className="h-[13px] w-[13px] shrink-0" />
            <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
          </a>
        </section>
      ) : null}

      {linkItems.length > 0 ? (
        <section className="space-y-[8px] border-t border-border-subtle pt-[18px]">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
            Liens
          </h3>
          {linkItems}
        </section>
      ) : null}

    </div>
  );
}

export function MemberProfileDrawer({ memberId, seed, onClose }: MemberProfileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const loadRequestIdRef = useRef(0);
  const [loadState, setLoadState] = useState<DrawerLoadState>({
    status: "idle",
    profile: null,
    categories: categoriesCache ?? [],
    sponsor: null,
    lastSeenAt: null,
  });

  const isOpen = !!memberId;
  const seedProfile = useMemo(() => makeSeedProfile(memberId, seed), [memberId, seed]);

  const loadProfile = useCallback(async () => {
    if (!memberId) return;

    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    const cachedProfile = profileCache.get(memberId) ?? seedProfile;
    setLoadState({
      status: "loading",
      profile: cachedProfile,
      categories: categoriesCache ?? [],
      sponsor: null,
      lastSeenAt: null,
    });

    const supabase = createClient();
    const [profile, categories, presence] = await Promise.all([
      fetchPublicMemberProfile(supabase, memberId),
      fetchCategories(supabase),
      fetchUserPresence(supabase, memberId),
    ]);
    if (loadRequestIdRef.current !== requestId) return;

    if (!profile) {
      setLoadState({
        status: "error",
        profile: cachedProfile,
        categories,
        sponsor: null,
        lastSeenAt: presence?.last_seen_at ?? null,
      });
      return;
    }

    const sponsor = await fetchSponsor(supabase, profile.sponsored_by);
    if (loadRequestIdRef.current !== requestId) return;

    profileCache.set(memberId, profile);
    setLoadState({
      status: "ready",
      profile,
      categories,
      sponsor,
      lastSeenAt: presence?.last_seen_at ?? null,
    });
  }, [memberId, seedProfile]);

  const handleRetry = useCallback(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleDrawerKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(drawerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, [onClose]);

  const drawerClassName = cn(
    "fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border-default bg-bg-base shadow-modal transition-transform duration-200 sm:w-[420px]",
    isOpen ? "translate-x-0" : "translate-x-full",
  );

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const loadTimer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [isOpen, loadProfile]);

  useEffect(() => {
    if (isOpen) return;

    loadRequestIdRef.current += 1;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le profil membre"
        className="absolute inset-0 cursor-default bg-text-primary/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-profile-drawer-title"
        tabIndex={-1}
        onKeyDown={handleDrawerKeyDown}
        className={drawerClassName}
      >
        <header className="sticky top-0 z-10 flex h-[56px] shrink-0 items-center gap-[12px] border-b border-border-subtle bg-bg-base px-[18px]">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-[7px] text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            aria-label="Fermer"
          >
            <X className="h-[16px] w-[16px]" />
          </button>
          <div className="min-w-0">
            <p id="member-profile-drawer-title" className="truncate text-[14px] font-semibold text-text-primary">
              Profil membre
            </p>
            {seed?.x_handle ? (
              <p className="truncate text-[11px] text-text-muted">@{seed.x_handle}</p>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadState.status === "loading" && loadState.profile ? (
            <ProfileContent
              profile={loadState.profile}
              categories={loadState.categories}
              sponsor={loadState.sponsor}
              lastSeenAt={loadState.lastSeenAt}
            />
          ) : null}
          {loadState.status === "loading" && !loadState.profile ? <LoadingProfile /> : null}
          {loadState.status === "ready" ? (
            <ProfileContent
              profile={loadState.profile}
              categories={loadState.categories}
              sponsor={loadState.sponsor}
              lastSeenAt={loadState.lastSeenAt}
            />
          ) : null}
          {loadState.status === "error" ? <ErrorProfile onRetry={handleRetry} /> : null}
        </div>
      </aside>
    </div>
  );
}
