"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string, label: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Rechercher…",
  label,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.group?.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Group by category
  const groups: Record<string, SearchSelectOption[]> = {};
  filtered.forEach((o) => {
    const g = o.group || "";
    if (!groups[g]) groups[g] = [];
    groups[g].push(o);
  });

  return (
    <div className={cn("space-y-2", className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-base-content/70">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border bg-base-100 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer",
            open
              ? "border-accent"
              : "border-base-content/[0.08] hover:border-base-content/15",
            !selectedLabel && "text-base-content/30"
          )}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-base-content/30 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-base-content/[0.08] bg-base-100 shadow-xl overflow-hidden animate-[slide-up_0.15s_ease-out]">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-base-content/[0.06]">
              <Search className="h-3.5 w-3.5 text-base-content/30 shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm text-base-content placeholder:text-base-content/30 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-base-content/30 hover:text-base-content/60 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {Object.keys(groups).length === 0 && (
                <p className="px-4 py-3 text-sm text-base-content/30">Aucun résultat</p>
              )}
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  {group && (
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-base-content/30 bg-base-content/[0.02]">
                      {group}
                    </div>
                  )}
                  {items.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        onChange(item.value, item.label);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left cursor-pointer transition-colors",
                        item.value === value
                          ? "text-accent bg-accent/[0.06] font-medium"
                          : "text-base-content hover:bg-base-content/[0.04]"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear button when value selected */}
        {selectedLabel && !open && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "");
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content/50 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
