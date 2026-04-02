import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface ForumBreadcrumbProps {
  crumbs: Crumb[];
}

export function ForumBreadcrumb({ crumbs }: ForumBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-[6px] text-[13px] flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-[6px]">
            {i > 0 && <ChevronRight className="h-[14px] w-[14px] text-text-muted shrink-0" />}
            {isLast || !crumb.href ? (
              <span className="text-text-primary font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
