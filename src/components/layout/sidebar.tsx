"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  PanelLeftClose,
  ChevronUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useFavorites } from "@/components/favorites/favorites-context";
import type { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NotificationEntry } from "@/components/notifications/notification-entry";

interface SidebarProps {
  profile: Profile;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

import { MessageCircle } from "lucide-react";

const communaute = [
  { name: "Chat", href: "/chat", icon: MessageCircle },
];

export function Sidebar({ profile, open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { favorites, remove } = useFavorites();

  const handleCloseUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const handleToggleUserMenu = useCallback(() => {
    setUserMenuOpen((current) => !current);
  }, []);

  const handleNavigateFromUserControls = useCallback(() => {
    setUserMenuOpen(false);
    onClose();
  }, [onClose]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  }, [router]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        handleCloseUserMenu();
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [handleCloseUserMenu, userMenuOpen]);

  const renderLink = (item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        title={item.name}
        className={cn(
          "flex items-center gap-[12px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium transition-all duration-150",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  const renderSection = (label: string, items: typeof communaute) => (
    <>
      <p className="px-[12px] mb-[8px] mt-[16px] text-[11px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>
      {items.map(renderLink)}
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-bg-base border-r border-border-default flex flex-col transition-all duration-300 ease-out",
          "lg:static lg:z-auto",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop: collapsed or expanded
          collapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0">
          <Link href="/chat" className="flex items-center gap-[10px]">
            <img src="/images/logo.png" alt="MarchéLibre" className="h-[32px] w-[32px] object-contain" />
            <span className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em] whitespace-nowrap">
              MarchéLibre
            </span>
          </Link>
          <div className="flex items-center gap-[4px]">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-[6px] rounded-md hover:bg-bg-surface text-text-muted cursor-pointer transition-colors"
              title="Réduire la sidebar"
            >
              <PanelLeftClose className="h-[16px] w-[16px]" />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-[6px] rounded-md hover:bg-bg-surface text-text-muted cursor-pointer"
            >
              <X className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-[12px] py-[8px] space-y-[4px]">
          {/* Favorites */}
          {favorites.length > 0 && (
            <>
              <p className="px-[12px] mb-[8px] mt-[8px] text-[11px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Favoris
              </p>
              {favorites.map((fav) => (
                <div key={fav.id} className="group/fav flex items-center">
                  <Link
                    href={fav.href}
                    onClick={onClose}
                    className={cn(
                      "flex-1 flex items-center gap-[12px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium transition-all duration-150 min-w-0",
                      pathname === fav.href
                        ? "bg-primary-50 text-primary-700"
                        : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                    )}
                  >
                    <Star className="h-[16px] w-[16px] shrink-0 fill-primary-500 text-primary-500" />
                    <span className="truncate">{fav.label}</span>
                  </Link>
                  <button
                    onClick={() => remove(fav.id)}
                    className="p-[4px] rounded text-text-muted hover:text-error opacity-0 group-hover/fav:opacity-100 cursor-pointer transition-all shrink-0"
                    title="Retirer des favoris"
                  >
                    <X className="h-[12px] w-[12px]" />
                  </button>
                </div>
              ))}
              <div className="my-[8px] border-t border-border-subtle" />
            </>
          )}

          {renderSection("Communauté", communaute)}
        </nav>

        {/* Discord-style user bar */}
        <div ref={userMenuRef} className="relative shrink-0">
          {/* Popup menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-[8px] right-[8px] mb-[4px] bg-bg-base border border-border-default rounded-lg shadow-modal p-[4px] animate-in fade-in slide-in-from-bottom-2 duration-150">
              <Link
                href="/profil"
                onClick={handleNavigateFromUserControls}
                className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
              >
                <User className="h-[16px] w-[16px]" />
                Mon profil
              </Link>
              <Link
                href="/parametres"
                onClick={handleNavigateFromUserControls}
                className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
              >
                <Settings className="h-[16px] w-[16px]" />
                Paramètres
              </Link>
              {profile.is_admin && (
                <Link
                  href="/admin"
                  onClick={handleNavigateFromUserControls}
                  className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
                >
                  <ShieldCheck className="h-[16px] w-[16px]" />
                  Gestion admin
                </Link>
              )}
              <div className="my-[4px] border-t border-border-subtle" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-md text-[13px] font-medium text-error hover:bg-error-bg transition-colors w-full cursor-pointer"
              >
                <LogOut className="h-[16px] w-[16px]" />
                Déconnexion
              </button>
            </div>
          )}

          <div className="flex items-center gap-[6px] px-[8px] py-[8px] border-t border-border-subtle">
            <button
              type="button"
              onClick={handleToggleUserMenu}
              className={cn(
                "flex items-center gap-[10px] flex-1 min-w-0 px-[4px] py-[4px] rounded-md hover:bg-bg-surface transition-colors cursor-pointer",
                userMenuOpen && "bg-bg-surface"
              )}
            >
              <Avatar src={profile.avatar_url} name={profile.x_handle} size="sm" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[13px] leading-[18px] font-semibold text-text-primary truncate">
                  {profile.full_name || `@${profile.x_handle}`}
                </p>
                {profile.full_name && profile.full_name.toLowerCase() !== profile.x_handle.toLowerCase() && (
                  <p className="text-[11px] leading-[14px] text-text-muted truncate">
                    @{profile.x_handle}
                  </p>
                )}
              </div>
              <ChevronUp className={cn(
                "h-[14px] w-[14px] text-text-muted shrink-0 transition-transform duration-200",
                !userMenuOpen && "rotate-180"
              )} />
            </button>
            <NotificationEntry
              compact
              onNavigate={handleNavigateFromUserControls}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
