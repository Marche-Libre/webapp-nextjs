"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = "Rechercher…",
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [internal, setInternal] = useState(controlledValue ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (controlledValue !== undefined) setInternal(controlledValue);
  }, [controlledValue]);

  const handleChange = (val: string) => {
    setInternal(val);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(val), debounceMs);
  };

  const handleClear = () => {
    setInternal("");
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-text-muted pointer-events-none" />
      <input
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-[36px] pr-[36px] py-[8px] text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
      />
      {internal && (
        <button
          onClick={handleClear}
          className="absolute right-[10px] top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-surface text-text-muted cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
