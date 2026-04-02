"use client";

import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, children, align = "end", className }: DropdownProps) {
  return (
    <div className={cn("dropdown", align === "end" && "dropdown-end", className)}>
      <div tabIndex={0} role="button">
        {trigger}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-bg-elevated border border-border-default rounded-lg shadow-modal z-10 w-52 p-[4px] mt-[4px]"
      >
        {children}
      </ul>
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownItem({ children, onClick, className }: DropdownItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-md px-[12px] py-[8px] w-full text-left cursor-pointer",
          className
        )}
      >
        {children}
      </button>
    </li>
  );
}
