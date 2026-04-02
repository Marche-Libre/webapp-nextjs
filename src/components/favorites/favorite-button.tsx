"use client";

import { Star } from "lucide-react";
import { useFavorites, type Favorite } from "./favorites-context";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  item: Favorite;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ item, className, size = "sm" }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(item.id);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "cursor-pointer transition-all duration-200",
        size === "sm" ? "p-[4px]" : "p-[6px]",
        active
          ? "text-primary-500"
          : "text-text-muted hover:text-primary-500 opacity-0 group-hover:opacity-100",
        active && "opacity-100",
        className
      )}
    >
      <Star
        className={cn(
          size === "sm" ? "h-[14px] w-[14px]" : "h-[16px] w-[16px]",
          active && "fill-primary-500"
        )}
      />
    </button>
  );
}
