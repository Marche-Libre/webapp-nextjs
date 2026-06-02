import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="break-words font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Administration
        </h1>
        <p className="mt-[4px] break-words text-sm text-text-secondary">
          Gestion des utilisateurs et de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-[16px]">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary-500" />}
          label="Total"
          value={totalCount ?? 0}
        />
        <Link href="/admin/users" className="min-w-0">
          <StatCard
            icon={<Clock className="h-5 w-5 text-warning" />}
            label="En attente"
            value={pendingCount ?? 0}
            highlight={!!pendingCount && pendingCount > 0}
          />
        </Link>
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-success" />}
          label="Approuvés"
          value={approvedCount ?? 0}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-error" />}
          label="Rejetés"
          value={rejectedCount ?? 0}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Actions rapides</CardTitle>
        </CardHeader>
        <div className="space-y-[4px]">
          <Link
            href="/admin/users"
            className="flex min-w-0 items-center gap-[12px] rounded-lg p-[12px] text-sm transition-colors duration-150 hover:bg-bg-surface"
          >
            <Clock className="h-5 w-5 shrink-0 text-warning" />
            <span className="min-w-0 flex-1 break-words font-medium text-text-primary">
              Gérer les inscriptions en attente
            </span>
            {!!pendingCount && pendingCount > 0 && (
              <span className="shrink-0 rounded-md bg-warning-bg px-2.5 py-[4px] text-xs font-medium text-warning">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "border-warning/30 bg-warning-bg shadow-card"
          : "shadow-card"
      }
    >
      <div className="flex min-w-0 items-center gap-[12px]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated sm:h-12 sm:w-12">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-bold text-text-primary tracking-[-0.02em]">
            {value}
          </p>
          <p className="truncate text-[13px] text-text-secondary">{label}</p>
        </div>
      </div>
    </Card>
  );
}
