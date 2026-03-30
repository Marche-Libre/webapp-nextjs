"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Megaphone,
  Briefcase,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  profile: Profile;
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutDashboard },
  { name: "Mon profil", href: "/profil", icon: User },
  { name: "Annonces", href: "/annonces", icon: Megaphone },
  { name: "Offres d\u2019emploi", href: "/offres", icon: Briefcase },
  { name: "Annuaire", href: "/membres", icon: Users },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function Sidebar({ profile, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] bg-bg-base border-r border-border-default flex flex-col transition-transform duration-250 ease-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-[20px] h-[64px] border-b border-border-subtle shrink-0">
          <Link href="/tableau-de-bord" className="flex items-center gap-[10px]">
            <img src="/images/drapeau.jpg" alt="MarchéLibre" className="h-[32px] w-[32px] object-contain" />
            <span className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
              MarchéLibre
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-[6px] rounded-md hover:bg-bg-surface text-text-muted cursor-pointer"
          >
            <X className="h-[16px] w-[16px]" />
          </button>
        </div>

        {/* User card */}
        <div className="px-[16px] py-[16px] border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-lg bg-bg-elevated">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-[20px] font-medium text-text-primary truncate">
                {profile.full_name}
              </p>
              <p className="text-[11px] leading-[16px] text-text-muted truncate">
                @{profile.x_handle}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-[12px] py-[16px] space-y-[4px]">
          <p className="px-[12px] mb-[12px] text-[11px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-[12px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.name}
              </Link>
            );
          })}

          {profile.is_admin && (
            <>
              <div className="my-[16px] border-t border-border-subtle" />
              <p className="px-[12px] mb-[12px] text-[11px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Administration
              </p>
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-[12px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium transition-all duration-150",
                  pathname.startsWith("/admin")
                    ? "bg-primary-50 text-primary-700"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                )}
              >
                <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
                Gestion admin
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-[12px] border-t border-border-subtle shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-[12px] px-[12px] py-[8px] rounded-lg text-[13px] leading-[20px] font-medium text-text-muted hover:bg-error-bg hover:text-error transition-all duration-150 w-full cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
