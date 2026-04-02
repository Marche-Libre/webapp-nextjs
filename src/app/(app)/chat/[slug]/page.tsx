import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ChatFullPage } from "@/components/chat/chat-full-page";

export default async function ChatChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!channel) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, author:profiles(x_handle, full_name, avatar_url)")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orderedMessages = (messages || []).reverse();

  return (
    <ChatFullPage
      activeChannel={channel}
      userId={user.id}
      initialMessages={orderedMessages as any}
    />
  );
}
