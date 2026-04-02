"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
