"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, AtSign, Filter, X, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types/database";

interface MembresContentProps {
  membres: Profile[];
  specialties: string[];
  locations: string[];
}

export function MembresContent({
  membres,
  specialties,
  locations,
}: MembresContentProps) {
  const [query, setQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = membres;

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.specialty?.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q) ||
          m.x_handle?.toLowerCase().includes(q) ||
          m.bio?.toLowerCase().includes(q)
      );
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      result = result.filter(
        (m) => m.specialty && selectedSpecialties.includes(m.specialty)
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      result = result.filter(
        (m) => m.location && selectedLocations.includes(m.location)
      );
    }

    // Sort
    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "fr")
      );
    }

    return result;
  }, [membres, query, selectedSpecialties, selectedLocations, sortBy]);

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleLocation = (l: string) => {
    setSelectedLocations((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const activeFilterCount = selectedSpecialties.length + selectedLocations.length;

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setQuery("");
  };

  const filtersPanel = (
    <div className="space-y-6">
      {/* Specialties */}
      {specialties.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Spécialité
          </h3>
          <div className="space-y-1.5">
            {specialties.map((s) => (
              <label
                key={s}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(s)}
                  onChange={() => toggleSpecialty(s)}
                  className="checkbox checkbox-sm checkbox-accent"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Locations */}
      {locations.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Localisation
          </h3>
          <div className="space-y-1.5">
            {locations.map((l) => (
              <label
                key={l}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(l)}
                  onChange={() => toggleLocation(l)}
                  className="checkbox checkbox-sm checkbox-accent"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {l}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs text-accent hover:text-accent/80 font-medium transition-colors cursor-pointer"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
            Annuaire
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {filtered.length} professionnel{filtered.length !== 1 ? "s" : ""} vérifié{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
            className="select select-sm select-bordered text-sm bg-bg-base"
          >
            <option value="recent">Plus récents</option>
            <option value="name">Nom A → Z</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden btn btn-sm btn-ghost gap-1.5 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="badge badge-accent badge-sm">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, une spécialité, une ville…"
          className="input input-bordered w-full pl-10 text-sm bg-bg-base"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile filters (collapsible) */}
      {showMobileFilters && (
        <div className="lg:hidden bg-bg-base rounded-xl p-5 shadow-card border border-border-subtle">
          {filtersPanel}
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-6">{filtersPanel}</div>
        </aside>

        {/* Cards grid */}
        <div className="flex-1 min-w-0">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((membre) => (
                <div
                  key={membre.id}
                  className="bg-bg-base rounded-xl p-5 shadow-card hover:shadow-card-hover border border-border-subtle hover:border-border-strong transition-all duration-200 flex flex-col"
                >
                  {/* Top: avatar + name */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <Avatar
                      src={membre.avatar_url}
                      name={membre.full_name}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-text-primary truncate tracking-[-0.01em] text-[15px]">
                        {membre.full_name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                        <AtSign className="w-3 h-3" />
                        {membre.x_handle}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {membre.specialty && (
                      <Badge variant="primary">{membre.specialty}</Badge>
                    )}
                    {membre.location && (
                      <Badge>
                        <MapPin className="w-3 h-3 mr-1 -ml-0.5" />
                        {membre.location}
                      </Badge>
                    )}
                  </div>

                  {/* Bio */}
                  {membre.bio && (
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-3">
                      {membre.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-border-subtle flex items-center gap-2">
                    <a
                      href={`https://x.com/${membre.x_handle?.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm flex-1 cursor-pointer"
                    >
                      Contacter
                    </a>
                    <button className="btn btn-ghost btn-sm flex-1 cursor-pointer">
                      Voir le profil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-base rounded-xl p-12 shadow-card text-center">
              <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-medium">
                Aucun membre trouvé
              </p>
              <p className="text-sm text-text-muted mt-1">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="btn btn-sm btn-accent mt-4 cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
