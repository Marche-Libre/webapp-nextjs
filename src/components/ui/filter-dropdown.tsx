"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpecialtyCategory, Specialty } from "@/lib/types/database";

/* ─── Single-select dropdown ─── */

interface FilterDropdownProps {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}

export function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-[6px] px-[12px] py-[6px] rounded-lg text-[13px] font-medium cursor-pointer border transition-colors",
          value
            ? "border-primary-500 bg-primary-50 text-primary-500"
            : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
        )}
      >
        {value || label}
        <ChevronDown className={cn("h-[12px] w-[12px] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-[4px] w-[220px] max-w-[calc(100vw-32px)] max-h-[280px] overflow-y-auto bg-bg-base border border-border-default rounded-lg shadow-modal p-[4px] z-30">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className={cn(
              "flex items-center justify-between w-full px-[12px] py-[8px] rounded-md text-[13px] cursor-pointer transition-colors",
              !value
                ? "bg-primary-50 text-primary-500 font-medium"
                : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            )}
          >
            Tous
            {!value && <Check className="h-[14px] w-[14px]" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                "flex items-center justify-between w-full px-[12px] py-[8px] rounded-md text-[13px] cursor-pointer transition-colors",
                value === opt
                  ? "bg-primary-50 text-primary-500 font-medium"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              )}
            >
              <span className="truncate">{opt}</span>
              {value === opt && <Check className="h-[14px] w-[14px] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Multi-select dropdown with search ─── */

interface MultiFilterDropdownProps {
  label: string;
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
}

export function MultiFilterDropdown({ label, selected, options, onChange }: MultiFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      inputRef.current?.focus();
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-[6px] px-[12px] py-[6px] rounded-lg text-[13px] font-medium cursor-pointer border transition-colors",
          selected.length > 0
            ? "border-primary-500 bg-primary-50 text-primary-500"
            : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
        )}
      >
        {selected.length > 0 ? `${label} (${selected.length})` : label}
        <ChevronDown className={cn("h-[12px] w-[12px] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-[4px] w-[260px] max-w-[calc(100vw-32px)] bg-bg-base border border-border-default rounded-lg shadow-modal z-30">
          {/* Search */}
          <div className="p-[8px] border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-[8px] top-1/2 -translate-y-1/2 h-[13px] w-[13px] text-text-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-[28px] pr-[8px] py-[5px] text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[240px] overflow-y-auto p-[4px]">
            {filtered.length === 0 && (
              <p className="px-[12px] py-[8px] text-[12px] text-text-muted">Aucun résultat</p>
            )}
            {filtered.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={cn(
                    "flex items-center gap-[8px] w-full px-[10px] py-[7px] rounded-md text-[13px] cursor-pointer transition-colors",
                    checked
                      ? "text-primary-500"
                      : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                  )}
                >
                  <div className={cn(
                    "h-[16px] w-[16px] rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    checked ? "bg-primary-500 border-primary-500" : "border-border-strong"
                  )}>
                    {checked && <Check className="h-[10px] w-[10px] text-bg-base" />}
                  </div>
                  <span className="truncate">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="p-[8px] border-t border-border-subtle">
              <button
                onClick={() => onChange([])}
                className="text-[12px] text-text-muted hover:text-error cursor-pointer transition-colors"
              >
                Tout désélectionner
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Hierarchical filter dropdown (categories + sub-specialties) ─── */

export type CategoryWithSpecialties = SpecialtyCategory & { specialties: Specialty[] };

interface HierarchicalFilterDropdownProps {
  label: string;
  categories: CategoryWithSpecialties[];
  selectedSpecialtyIds: string[];
  onChange: (ids: string[]) => void;
}

export function HierarchicalFilterDropdown({ label, categories, selectedSpecialtyIds, onChange }: HierarchicalFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      inputRef.current?.focus();
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  // Filter categories and specialties by search query
  const filteredCategories = categories
    .map((cat) => {
      if (!q) return cat;
      const catMatch = cat.name.toLowerCase().includes(q);
      const matchingSubs = cat.specialties.filter((s) => s.name.toLowerCase().includes(q));
      if (catMatch) return cat; // show all subs if category matches
      if (matchingSubs.length > 0) return { ...cat, specialties: matchingSubs };
      return null;
    })
    .filter((c): c is CategoryWithSpecialties => c !== null);

  // Auto-expand categories when searching
  const effectiveExpanded = q
    ? new Set(filteredCategories.map((c) => c.id))
    : expanded;

  const toggleExpand = (catId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  const allSpecialtyIds = (cat: CategoryWithSpecialties) => cat.specialties.map((s) => s.id);

  const isCatFullySelected = (cat: CategoryWithSpecialties) =>
    cat.specialties.length > 0 && cat.specialties.every((s) => selectedSpecialtyIds.includes(s.id));

  const isCatPartiallySelected = (cat: CategoryWithSpecialties) =>
    cat.specialties.some((s) => selectedSpecialtyIds.includes(s.id)) && !isCatFullySelected(cat);

  const toggleCategory = (cat: CategoryWithSpecialties) => {
    const ids = allSpecialtyIds(cat);
    if (isCatFullySelected(cat)) {
      onChange(selectedSpecialtyIds.filter((id) => !ids.includes(id)));
    } else {
      onChange([...new Set([...selectedSpecialtyIds, ...ids])]);
    }
  };

  const toggleSpecialty = (specId: string) => {
    if (selectedSpecialtyIds.includes(specId)) {
      onChange(selectedSpecialtyIds.filter((id) => id !== specId));
    } else {
      onChange([...selectedSpecialtyIds, specId]);
    }
  };

  const count = selectedSpecialtyIds.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-[6px] px-[12px] py-[6px] rounded-lg text-[13px] font-medium cursor-pointer border transition-colors",
          count > 0
            ? "border-primary-500 bg-primary-50 text-primary-500"
            : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
        )}
      >
        {count > 0 ? `${label} (${count})` : label}
        <ChevronDown className={cn("h-[12px] w-[12px] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-[4px] w-[300px] max-w-[calc(100vw-32px)] bg-bg-base border border-border-default rounded-lg shadow-modal z-30">
          {/* Search */}
          <div className="p-[8px] border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-[8px] top-1/2 -translate-y-1/2 h-[13px] w-[13px] text-text-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-[28px] pr-[8px] py-[5px] text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="max-h-[320px] overflow-y-auto p-[4px]">
            {filteredCategories.length === 0 && (
              <p className="px-[12px] py-[8px] text-[12px] text-text-muted">Aucun résultat</p>
            )}
            {filteredCategories.map((cat) => {
              const isExpanded = effectiveExpanded.has(cat.id);
              const fullySelected = isCatFullySelected(cat);
              const partiallySelected = isCatPartiallySelected(cat);

              return (
                <div key={cat.id}>
                  {/* Category row */}
                  <div className="flex items-center gap-[4px]">
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="p-[4px] rounded text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                    >
                      <ChevronRight className={cn("h-[12px] w-[12px] transition-transform", isExpanded && "rotate-90")} />
                    </button>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "flex items-center gap-[8px] flex-1 px-[6px] py-[7px] rounded-md text-[13px] font-medium cursor-pointer transition-colors",
                        fullySelected
                          ? "text-primary-500"
                          : "text-text-primary hover:bg-bg-surface"
                      )}
                    >
                      <div className={cn(
                        "h-[16px] w-[16px] rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        fullySelected ? "bg-primary-500 border-primary-500" :
                        partiallySelected ? "border-primary-500 bg-primary-50" :
                        "border-border-strong"
                      )}>
                        {fullySelected && <Check className="h-[10px] w-[10px] text-bg-base" />}
                        {partiallySelected && <div className="h-[8px] w-[8px] rounded-sm bg-primary-500" />}
                      </div>
                      {cat.name}
                    </button>
                  </div>

                  {/* Sub-specialties */}
                  {isExpanded && (
                    <div className="ml-[24px]">
                      {cat.specialties.map((spec) => {
                        const checked = selectedSpecialtyIds.includes(spec.id);
                        return (
                          <button
                            key={spec.id}
                            onClick={() => toggleSpecialty(spec.id)}
                            className={cn(
                              "flex items-center gap-[8px] w-full px-[10px] py-[6px] rounded-md text-[12px] cursor-pointer transition-colors",
                              checked
                                ? "text-primary-500"
                                : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                            )}
                          >
                            <div className={cn(
                              "h-[14px] w-[14px] rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                              checked ? "bg-primary-500 border-primary-500" : "border-border-strong"
                            )}>
                              {checked && <Check className="h-[9px] w-[9px] text-bg-base" />}
                            </div>
                            <span className="truncate">{spec.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="p-[8px] border-t border-border-subtle">
              <button
                onClick={() => onChange([])}
                className="text-[12px] text-text-muted hover:text-error cursor-pointer transition-colors"
              >
                Tout désélectionner
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
