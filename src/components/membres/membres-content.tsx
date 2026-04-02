"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MapPin, Users, MoreHorizontal, Flag, Ban, X, List, LayoutGrid, ChevronLeft, ChevronRight, ArrowDownAZ, ArrowUpZA, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { MultiFilterDropdown, FilterDropdown } from "@/components/ui/filter-dropdown";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

interface MembresContentProps {
  membres: Profile[];
  specialties: string[];
  locations: string[];
  currentUserId: string;
}

const PER_PAGE = 12;

/* ─── Context menu ─── */

function MemberMenu({ memberId, currentUserId }: { memberId: string; currentUserId: string }) {
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

  if (memberId === currentUserId) return null;

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
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-[6px] rounded-md hover:bg-bg-surface-hover text-text-muted cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
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

/* ─── Pagination ─── */

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-[4px] pt-[20px]">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-[6px] rounded-lg hover:bg-bg-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
        <ChevronLeft className="h-[16px] w-[16px]" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-[6px] text-[13px] text-text-muted">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={cn("h-[32px] min-w-[32px] px-[6px] rounded-lg text-[13px] font-medium cursor-pointer transition-colors", p === page ? "bg-primary-500 text-bg-base" : "text-text-secondary hover:bg-bg-surface")}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="p-[6px] rounded-lg hover:bg-bg-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
        <ChevronRight className="h-[16px] w-[16px]" />
      </button>
    </div>
  );
}

/* ─── Main ─── */

export function MembresContent({ membres, specialties, locations, currentUserId }: MembresContentProps) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "az" | "za">("recent");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = membres;
    if (selectedSpecialties.length > 0) result = result.filter((m) => m.specialty && selectedSpecialties.includes(m.specialty));
    if (selectedLocation) result = result.filter((m) => m.location === selectedLocation);
    if (sortBy === "az") result = [...result].sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));
    else if (sortBy === "za") result = [...result].sort((a, b) => b.full_name.localeCompare(a.full_name, "fr"));
    return result;
  }, [membres, selectedSpecialties, selectedLocation, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) setPage(safePage);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const hasFilters = selectedSpecialties.length > 0 || selectedLocation;

  const clearFilters = () => { setSelectedSpecialties([]); setSelectedLocation(null); setPage(1); };

  return (
    <div className="space-y-[16px]">
      {/* Toolbar — single row */}
      <div className="flex items-center gap-[8px] flex-wrap">
        {/* Filters */}
        {specialties.length > 0 && (
          <MultiFilterDropdown
            label="Expertise"
            selected={selectedSpecialties}
            options={specialties}
            onChange={(v) => { setSelectedSpecialties(v); setPage(1); }}
          />
        )}
        {locations.length > 0 && (
          <FilterDropdown
            label="Ville"
            value={selectedLocation}
            options={locations}
            onChange={(v) => { setSelectedLocation(v); setPage(1); }}
          />
        )}
        {hasFilters && (
          <button onClick={clearFilters} className="p-[6px] rounded-md text-text-muted hover:text-error cursor-pointer transition-colors" title="Effacer les filtres">
            <X className="h-[14px] w-[14px]" />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        <span className="text-[12px] text-text-muted hidden sm:block">{filtered.length} membre{filtered.length !== 1 ? "s" : ""}</span>

        {/* Sort */}
        <div className="flex items-center rounded-lg border border-border-default overflow-hidden">
          <button onClick={() => setSortBy("recent")} title="Récents" className={cn("p-[6px] cursor-pointer transition-colors", sortBy === "recent" ? "bg-primary-50 text-primary-500" : "text-text-muted hover:text-text-primary hover:bg-bg-surface")}>
            <Clock className="h-[14px] w-[14px]" />
          </button>
          <div className="w-px h-[18px] bg-border-default" />
          <button onClick={() => setSortBy("az")} title="A → Z" className={cn("p-[6px] cursor-pointer transition-colors", sortBy === "az" ? "bg-primary-50 text-primary-500" : "text-text-muted hover:text-text-primary hover:bg-bg-surface")}>
            <ArrowDownAZ className="h-[14px] w-[14px]" />
          </button>
          <div className="w-px h-[18px] bg-border-default" />
          <button onClick={() => setSortBy("za")} title="Z → A" className={cn("p-[6px] cursor-pointer transition-colors", sortBy === "za" ? "bg-primary-50 text-primary-500" : "text-text-muted hover:text-text-primary hover:bg-bg-surface")}>
            <ArrowUpZA className="h-[14px] w-[14px]" />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border-default overflow-hidden">
          <button onClick={() => setView("list")} className={cn("p-[7px] cursor-pointer transition-colors", view === "list" ? "bg-primary-50 text-primary-500" : "text-text-muted hover:text-text-primary hover:bg-bg-surface")} title="Liste">
            <List className="h-[16px] w-[16px]" />
          </button>
          <div className="w-px h-[20px] bg-border-default" />
          <button onClick={() => setView("grid")} className={cn("p-[7px] cursor-pointer transition-colors", view === "grid" ? "bg-primary-50 text-primary-500" : "text-text-muted hover:text-text-primary hover:bg-bg-surface")} title="Grille">
            <LayoutGrid className="h-[16px] w-[16px]" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {(selectedSpecialties.length > 0 || selectedLocation) && (
        <div className="flex items-center gap-[6px] flex-wrap">
          {selectedSpecialties.map((s) => (
            <span key={s} className="inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[12px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20">
              {s}
              <button onClick={() => { setSelectedSpecialties((prev) => prev.filter((x) => x !== s)); setPage(1); }} className="hover:text-primary-700 cursor-pointer"><X className="h-[11px] w-[11px]" /></button>
            </span>
          ))}
          {selectedLocation && (
            <span className="inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[12px] font-medium bg-primary-50 text-primary-500 border border-primary-500/20">
              <MapPin className="h-[11px] w-[11px]" />
              {selectedLocation}
              <button onClick={() => { setSelectedLocation(null); setPage(1); }} className="hover:text-primary-700 cursor-pointer"><X className="h-[11px] w-[11px]" /></button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {paginated.length > 0 ? (
        <>
          {view === "list" ? (
            <div className="space-y-[4px]">
              {paginated.map((m) => (
                <div key={m.id} className="group flex items-center gap-[14px] px-[14px] py-[12px] rounded-xl border border-transparent hover:border-border-default hover:bg-bg-surface transition-all duration-150">
                  <Avatar src={m.avatar_url} name={m.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-[8px]">
                      <h3 className="text-[14px] font-semibold text-text-primary truncate">{m.full_name}</h3>
                      <span className="text-[12px] text-text-muted shrink-0 hidden sm:inline">@{m.x_handle}</span>
                    </div>
                    {(m.specialty || m.location) && (
                      <div className="flex items-center gap-[10px] mt-[2px]">
                        {m.specialty && <span className="text-[12px] font-medium text-primary-500">{m.specialty}</span>}
                        {m.location && <span className="flex items-center gap-[3px] text-[12px] text-text-muted"><MapPin className="h-[11px] w-[11px]" />{m.location}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-[4px] shrink-0">
                    <FavoriteButton
                      item={{
                        id: `member:${m.id}`,
                        label: m.full_name || `@${m.x_handle}`,
                        href: `/membres`,
                        type: "member",
                      }}
                    />
                    <a href={`https://x.com/${m.x_handle?.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="px-[14px] py-[6px] rounded-lg bg-primary-500 text-bg-base text-[12px] font-semibold hover:bg-primary-600 transition-colors cursor-pointer hidden sm:block">Contacter</a>
                    <MemberMenu memberId={m.id} currentUserId={currentUserId} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
              {paginated.map((m) => (
                <div key={m.id} className="group flex flex-col rounded-xl border border-border-subtle hover:border-border-default bg-bg-base hover:bg-bg-surface transition-all duration-150">
                  <div className="p-[20px] pb-[14px]">
                    <div className="flex items-start gap-[12px]">
                      <Avatar src={m.avatar_url} name={m.full_name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-text-primary truncate">{m.full_name}</h3>
                        <p className="text-[12px] text-text-muted mt-[2px]">@{m.x_handle}</p>
                      </div>
                      <MemberMenu memberId={m.id} currentUserId={currentUserId} />
                    </div>
                  </div>
                  <div className="px-[20px] flex flex-wrap gap-[6px]">
                    {m.specialty && <span className="inline-flex items-center rounded-md px-[8px] py-[3px] text-[11px] font-semibold bg-primary-50 text-primary-500">{m.specialty}</span>}
                    {m.location && <span className="inline-flex items-center gap-[3px] rounded-md px-[8px] py-[3px] text-[11px] font-medium bg-bg-surface-2 text-text-muted"><MapPin className="w-[11px] h-[11px]" />{m.location}</span>}
                  </div>
                  {m.bio && <p className="px-[20px] mt-[12px] text-[13px] text-text-secondary line-clamp-2 leading-relaxed">{m.bio}</p>}
                  <div className="mt-auto p-[16px]">
                    <a href={`https://x.com/${m.x_handle?.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-[8px] rounded-lg bg-primary-500 text-bg-base text-[13px] font-semibold hover:bg-primary-600 transition-colors cursor-pointer">Contacter</a>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-[64px] text-center">
          <div className="h-[56px] w-[56px] rounded-2xl bg-bg-surface flex items-center justify-center mb-[16px]">
            <Users className="h-[24px] w-[24px] text-text-muted" />
          </div>
          <p className="text-[15px] font-medium text-text-primary">Aucun membre trouvé</p>
          <p className="text-[13px] text-text-muted mt-[4px]">Essayez de modifier vos filtres</p>
          {hasFilters && <button onClick={clearFilters} className="mt-[16px] px-[16px] py-[8px] rounded-lg bg-primary-500 text-bg-base text-[13px] font-medium hover:bg-primary-600 transition-colors cursor-pointer">Réinitialiser</button>}
        </div>
      )}
    </div>
  );
}
