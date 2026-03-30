import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApproveRejectButtons } from "@/components/admin/approve-reject-buttons";
import { formatDate } from "@/lib/utils";

export default async function UtilisateursPage() {
  const supabase = await createClient();

  const { data: pendingUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("*")
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary tracking-[-0.02em]">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm text-text-secondary mt-[4px]">
          Validez ou rejetez les inscriptions au réseau
        </p>
      </div>

      {/* Pending users */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">
            En attente de validation
            {pendingUsers && pendingUsers.length > 0 && (
              <span className="ml-[8px] bg-warning-bg text-warning text-xs font-medium px-2.5 py-[4px] rounded-md">
                {pendingUsers.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        {pendingUsers && pendingUsers.length > 0 ? (
          <div className="space-y-[12px]">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center gap-[16px] p-[16px] rounded-lg border border-border-default bg-bg-elevated/50"
              >
                <Avatar
                  src={user.avatar_url}
                  name={user.full_name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-text-muted">{user.email}</p>
                  <div className="flex items-center gap-[12px] mt-[4px] text-sm">
                    <a
                      href={`https://x.com/${user.x_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline font-medium"
                    >
                      @{user.x_handle}
                    </a>
                    <span className="text-xs text-text-muted">
                      Inscrit le {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
                <ApproveRejectButtons userId={user.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Aucune inscription en attente de validation.
          </p>
        )}
      </Card>

      {/* All users */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display tracking-[-0.02em]">Tous les utilisateurs</CardTitle>
        </CardHeader>

        {allUsers && allUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left">
                  <th className="pb-[12px] font-medium text-text-muted">
                    Utilisateur
                  </th>
                  <th className="pb-[12px] font-medium text-text-muted hidden sm:table-cell">
                    X
                  </th>
                  <th className="pb-[12px] font-medium text-text-muted hidden md:table-cell">
                    Spécialité
                  </th>
                  <th className="pb-[12px] font-medium text-text-muted">Statut</th>
                  <th className="pb-[12px] font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-[12px]">
                      <div className="flex items-center gap-[12px]">
                        <Avatar
                          src={user.avatar_url}
                          name={user.full_name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-text-primary">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-[12px] hidden sm:table-cell">
                      <a
                        href={`https://x.com/${user.x_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm"
                      >
                        @{user.x_handle}
                      </a>
                    </td>
                    <td className="py-[12px] hidden md:table-cell text-text-muted">
                      {user.specialty || "-"}
                    </td>
                    <td className="py-[12px]">
                      <Badge
                        variant={
                          user.status === "approved"
                            ? "success"
                            : user.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                      >
                        {user.status === "approved"
                          ? "Approuvé"
                          : user.status === "rejected"
                          ? "Rejeté"
                          : "En attente"}
                      </Badge>
                    </td>
                    <td className="py-[12px]">
                      <ApproveRejectButtons
                        userId={user.id}
                        currentStatus={user.status}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Aucun utilisateur inscrit.</p>
        )}
      </Card>
    </div>
  );
}
