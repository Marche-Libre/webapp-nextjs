import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(x_handle, full_name, avatar_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-[24px]">
      <NotificationsList
        initialNotifications={(notifications as any) || []}
        userId={user.id}
      />
    </div>
  );
}
