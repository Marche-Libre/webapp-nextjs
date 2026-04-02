import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatLayout } from "@/components/chat/chat-layout";
import type { Profile } from "@/lib/types/database";

export default async function ChatLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: members } = await supabase
    .from("profiles")
    .select("id, x_handle, full_name, avatar_url")
    .eq("status", "approved")
    .order("x_handle", { ascending: true });

  return (
    <ChatLayout
      channels={channels || []}
      members={members || []}
      profile={profile as Profile}
    >
      {children}
    </ChatLayout>
  );
}
