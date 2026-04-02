import Link from "next/link";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import type { ForumCategory } from "@/lib/types/database";

interface CategoryCardProps {
  category: ForumCategory;
  postCount: number;
}

export function CategoryCard({ category, postCount }: CategoryCardProps) {
  return (
    <Link
      href={`/forum/${category.slug}`}
      className="group block p-[20px] rounded-xl bg-bg-base border border-border-default hover:border-border-strong shadow-card hover:shadow-lg transition-all duration-150"
    >
      <div className="flex items-start gap-[16px]">
        <div
          className="h-[44px] w-[44px] rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <span
            className="text-[20px]"
            style={{ color: category.color || undefined }}
          >
            {getCategoryEmoji(category.icon)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[4px]">
            <h3 className="font-display text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
              {category.name}
            </h3>
            <FavoriteButton
              item={{
                id: `category:${category.slug}`,
                label: category.name,
                href: `/forum/${category.slug}`,
                type: "category",
              }}
            />
          </div>
          {category.description && (
            <p className="text-[12px] text-text-muted mt-[2px] line-clamp-2">
              {category.description}
            </p>
          )}
          <p className="text-[11px] text-text-muted mt-[8px]">
            {postCount} post{postCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(icon: string | null): string {
  const map: Record<string, string> = {
    megaphone: "📢",
    briefcase: "💼",
    "trending-up": "📈",
    users: "👥",
    calendar: "📅",
    "heart-handshake": "🤝",
    coffee: "☕",
  };
  return icon ? map[icon] || "📌" : "📌";
}
