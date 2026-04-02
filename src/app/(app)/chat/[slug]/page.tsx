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

  const { data: profile } = await supabase
    .from("profiles")
    .select("x_handle, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const userProfile = {
    x_handle: profile?.x_handle ?? "",
    full_name: profile?.full_name ?? "",
    avatar_url: profile?.avatar_url ?? null,
  };

  // Try to find the channel by slug first
  let { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("slug", slug)
    .single();

  // If not found and slug starts with "dm-", try finding by ID
  if (!channel && slug.startsWith("dm-")) {
    const channelId = slug.slice(3);
    const { data: dmChannel } = await supabase
      .from("channels")
      .select("*")
      .eq("id", channelId)
      .eq("is_private", true)
      .single();

    if (dmChannel) {
      // Verify current user is a member of this DM channel
      const { data: membership } = await supabase
        .from("channel_members")
        .select("channel_id")
        .eq("channel_id", channelId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership) {
        channel = dmChannel;
      }
    }
  }

  if (!channel) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, author:profiles(x_handle, full_name, avatar_url)")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orderedMessages = (messages || []).reverse();

  // For DM channels, get the other user's info for the header
  let dmRecipient: { x_handle: string; full_name: string; avatar_url: string | null } | null = null;
  if (channel.is_private) {
    const { data: otherMember } = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", channel.id)
      .neq("user_id", user.id)
      .maybeSingle();

    if (otherMember) {
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("x_handle, full_name, avatar_url")
        .eq("id", otherMember.user_id)
        .single();
      dmRecipient = otherProfile;
    }
  }

  return (
    <ChatFullPage
      activeChannel={channel}
      userId={user.id}
      userProfile={userProfile}
      initialMessages={orderedMessages as any}
      dmRecipient={dmRecipient}
    />
  );
}
