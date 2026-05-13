"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Administration", href: "/admin", icon: ShieldCheck },
  { label: "Gestion des utilisateurs", href: "/admin/users", icon: Users },
];

const WIDE_CONTENT_ROUTES = ["/admin/users"];

interface AdminShellProps {
  children: React.ReactNode;
}

type AdminNavItem = (typeof adminNav)[number];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const close = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const isWideContentRoute = useMemo(() => {
    return WIDE_CONTENT_ROUTES.some((route) => pathname.startsWith(route));
  }, [pathname]);

  const renderDesktopNavItem = useCallback((item: AdminNavItem) => {
    const isActive = isActiveRoute(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-[10px] px-[12px] py-[8px] rounded-lg text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
        )}
      >
        <item.icon className="h-[18px] w-[18px]" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }, [pathname]);

  const renderMobileNavItem = useCallback((item: AdminNavItem) => {
    const isActive = isActiveRoute(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-muted hover:text-text-primary",
        )}
      >
        <item.icon className="h-[14px] w-[14px]" />
        <span>{item.label}</span>
      </Link>
    );
  }, [pathname]);

  const desktopNavItems = useMemo(() => {
    return adminNav.map(renderDesktopNavItem);
  }, [renderDesktopNavItem]);

  const mobileNavItems = useMemo(() => {
    return adminNav.map(renderMobileNavItem);
  }, [renderMobileNavItem]);

  return (
    <div className="fixed inset-0 z-[60] flex bg-bg-elevated">
      <div className="hidden sm:flex w-[240px] shrink-0 flex-col border-r border-border-default bg-bg-base">
        <div className="flex-1 overflow-y-auto px-[12px] py-[16px]">
          <button
            onClick={close}
            className="flex items-center gap-[8px] px-[12px] py-[8px] mb-[12px] rounded-lg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer w-full"
          >
            <ArrowLeft className="h-[16px] w-[16px]" />
            Retour
          </button>
          <p className="px-[12px] mb-[8px] text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Administration
          </p>
          {desktopNavItems}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex sm:hidden items-center gap-[8px] px-[16px] h-[56px] border-b border-border-subtle shrink-0">
          <button
            onClick={close}
            className="p-[8px] rounded-lg hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-[8px] overflow-x-auto scrollbar-hide">
            {mobileNavItems}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[16px] sm:p-[32px] lg:p-[48px]">
          <div className={cn("mx-auto", isWideContentRoute ? "max-w-5xl" : "max-w-2xl")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
