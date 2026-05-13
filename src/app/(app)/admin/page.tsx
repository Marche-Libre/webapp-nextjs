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
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Administration
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Gestion des utilisateurs et de la plateforme
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary-500" />}
          label="Total"
          value={totalCount ?? 0}
        />
        <Link href="/admin/users">
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
            className="flex items-center gap-[12px] p-[12px] rounded-lg hover:bg-bg-surface transition-colors duration-150 text-sm"
          >
            <Clock className="h-5 w-5 text-warning" />
            <span className="font-medium text-text-primary">
              Gérer les inscriptions en attente
            </span>
            {!!pendingCount && pendingCount > 0 && (
              <span className="ml-auto bg-warning-bg text-warning text-xs font-medium px-2.5 py-[4px] rounded-md">
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
      <div className="flex items-center gap-[16px]">
        <div className="h-12 w-12 rounded-lg bg-bg-elevated border border-border-default flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary tracking-[-0.02em]">
            {value}
          </p>
          <p className="text-[13px] text-text-secondary">{label}</p>
        </div>
      </div>
    </Card>
  );
}
