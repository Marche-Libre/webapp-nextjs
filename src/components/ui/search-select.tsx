"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  group?: string;
  /** 0 = category/parent (bold, full-width), 1 = child (indented) */
  depth?: number;
  /** Optional icon element (e.g. flag) rendered before the label */
  icon?: React.ReactNode;
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption?.label || "";
  const selectedIcon = selectedOption?.icon;

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

  const isSearching = search.length > 0;

  // Normalize: remove accents + lowercase for accent-insensitive search
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = isSearching
    ? options.filter((o) => {
        const q = normalize(search);
        return normalize(o.label).includes(q) || (o.group && normalize(o.group).includes(q));
      })
    : options;

  // Check if options use depth (tree mode)
  const hasDepth = options.some((o) => o.depth !== undefined);

  // Group by category
  const groups: Record<string, SearchSelectOption[]> = {};
  filtered.forEach((o) => {
    const g = o.group || "";
    if (!groups[g]) groups[g] = [];
    groups[g].push(o);
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const selectItem = (item: SearchSelectOption) => {
    onChange(item.value, item.label);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("space-y-2", className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-base-content/70">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Unified search trigger — acts as both trigger and search input */}
        <div
          className={cn(
            "w-full flex items-center gap-2 rounded-lg border bg-base-100 px-3 py-2.5 transition-colors cursor-text",
            open
              ? "border-accent"
              : "border-base-content/[0.08] hover:border-base-content/15"
          )}
          onClick={() => { if (!open) setOpen(true); }}
        >
          <Search className="h-4 w-4 text-base-content/30 shrink-0" />
          {open ? (
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-base-content placeholder:text-base-content/30 outline-none"
            />
          ) : (
            <span className={cn("flex-1 text-sm truncate flex items-center gap-2", selectedLabel ? "text-base-content" : "text-base-content/30")}>
              {selectedIcon}
              {selectedLabel || placeholder}
            </span>
          )}
          {selectedLabel && !open && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange("", ""); }}
              className="p-0.5 rounded hover:bg-base-content/10 text-base-content/25 hover:text-base-content/50 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          {search && open && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-base-content/30 hover:text-base-content/60 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {!selectedLabel && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-base-content/30 transition-transform shrink-0",
                open && "rotate-180"
              )}
            />
          )}
        </div>

        {/* Dropdown — no duplicate search bar */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-base-content/[0.08] bg-base-100 shadow-xl overflow-hidden animate-[slide-up_0.15s_ease-out]">
            {/* Options */}
            <div className="max-h-80 overflow-y-auto">
              {Object.keys(groups).length === 0 && (
                <p className="px-4 py-3 text-sm text-base-content/30">Aucun résultat</p>
              )}
              {Object.entries(groups).map(([group, items], groupIdx) => {
                // In tree mode with no search: show sectors as collapsible headers
                // In search mode or flat mode: show all items
                const isExpanded = isSearching || expandedGroups.has(group) || !hasDepth;
                const parentItems = items.filter((i) => !i.depth || i.depth === 0);
                const childItems = items.filter((i) => i.depth === 1);

                return (
                  <div key={group}>
                    {group && (
                      <button
                        type="button"
                        onClick={() => hasDepth && !isSearching ? toggleGroup(group) : undefined}
                        className={cn(
                          "sticky top-0 z-10 w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-base-content/60 bg-base-200 border-b border-base-content/[0.06]",
                          groupIdx > 0 && "border-t",
                          hasDepth && !isSearching && "cursor-pointer hover:bg-base-200/80"
                        )}
                      >
                        <span>
                          {group}
                          <span className="ml-1.5 text-base-content/25 font-normal">{items.length}</span>
                        </span>
                        {hasDepth && !isSearching && (
                          <ChevronRight className={cn(
                            "h-3.5 w-3.5 text-base-content/25 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        )}
                      </button>
                    )}

                    {isExpanded && (hasDepth ? (
                      <>
                        {/* Parent items (categories) — bold, selectable */}
                        {parentItems.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => selectItem(item)}
                            className={cn(
                              "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left cursor-pointer transition-colors",
                              item.value === value
                                ? "text-accent bg-accent/[0.06] font-semibold"
                                : "text-base-content font-medium hover:bg-base-content/[0.04]"
                            )}
                          >
                            {item.icon}{item.label}
                          </button>
                        ))}
                        {/* Child items (specialties) — indented, lighter */}
                        {childItems.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => selectItem(item)}
                            className={cn(
                              "w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-sm text-left cursor-pointer transition-colors",
                              item.value === value
                                ? "text-accent bg-accent/[0.06]"
                                : "text-base-content/60 hover:bg-base-content/[0.04] hover:text-base-content"
                            )}
                          >
                            <span className="w-1 h-1 rounded-full bg-base-content/20 shrink-0" />
                            {item.icon}{item.label}
                          </button>
                        ))}
                      </>
                    ) : (
                      /* Flat mode — no depth distinction */
                      items.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => selectItem(item)}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2 text-sm text-left cursor-pointer transition-colors",
                            item.value === value
                              ? "text-accent bg-accent/[0.06] font-medium"
                              : "text-base-content hover:bg-base-content/[0.04]"
                          )}
                        >
                          {item.icon}{item.label}
                        </button>
                      ))
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
