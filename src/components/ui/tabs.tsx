"use client";

import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn("flex w-full border-b border-border-default bg-bg-elevated/50 rounded-t-xl overflow-hidden", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          className={cn(
            "flex-1 py-[12px] text-[13px] font-semibold text-center transition-all duration-150 cursor-pointer border-b-2 -mb-px",
            value === tab.value
              ? "border-primary-600 text-primary-600 bg-bg-base"
              : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg-base/50"
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="ml-[6px] text-[11px] font-bold text-text-muted bg-bg-elevated rounded-full px-[6px] py-[1px]">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
