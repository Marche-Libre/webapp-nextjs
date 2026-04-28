import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatLayout } from "@/components/chat/chat-layout";
import type { Channel, Message, Profile } from "@/lib/types/database";

type MessageWithAuthor = Message & {
  author: Pick<Profile, "x_handle" | "full_name" | "avatar_url">;
};

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
    .select("id, email, phone, x_handle, full_name, first_name, last_name, avatar_url, specialty_ids, specialty_category_id, specialty_category_ids, location, bio, status, is_admin, links, accept_dms, accept_sponsorship, accept_referrals, sponsored_by, sponsor_approved, onboarding_completed, looking_for, created_at, updated_at, hidden_channel_ids, availability_status, skills, country_code, years_experience, daily_rate, website, visibility")
    .eq("id", user.id)
    .single();

  // Fetch public channels
  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: true });
  const publicChannels = (channels || []) as Channel[];

  // Fetch DM channels for the current user
  const { data: dmMemberships } = await supabase
    .from("channel_members")
    .select("channel_id")
    .eq("user_id", user.id);

  let dmChannels: Array<{
    id: string;
    slug: string;
    created_at: string;
    other_user: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">;
  }> = [];

  if (dmMemberships && dmMemberships.length > 0) {
    const dmChannelIds = dmMemberships.map((m) => m.channel_id);

    // Fetch private channels from those IDs
    const { data: privateChannels } = await supabase
      .from("channels")
      .select("id, slug, created_at")
      .in("id", dmChannelIds)
      .eq("is_private", true)
      .order("created_at", { ascending: false });

    if (privateChannels && privateChannels.length > 0) {
      // For each DM channel, find the other member
      const { data: allDmMembers } = await supabase
        .from("channel_members")
        .select("channel_id, user_id")
        .in("channel_id", privateChannels.map((c) => c.id))
        .neq("user_id", user.id);

      const otherUserIds = [...new Set((allDmMembers || []).map((m) => m.user_id))];

      let otherProfiles: Pick<Profile, "id" | "x_handle" | "full_name" | "avatar_url">[] = [];
      if (otherUserIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, x_handle, full_name, avatar_url")
          .in("id", otherUserIds);
        otherProfiles = data || [];
      }

      const profileMap = new Map(otherProfiles.map((p) => [p.id, p]));
      const memberMap = new Map((allDmMembers || []).map((m) => [m.channel_id, m.user_id]));

      dmChannels = privateChannels
        .map((ch) => {
          const otherUserId = memberMap.get(ch.id);
          const otherUser = otherUserId ? profileMap.get(otherUserId) : null;
          if (!otherUser) return null;
          return { ...ch, other_user: otherUser };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    }
  }

  const { data: members } = await supabase
    .from("profiles")
    .select("id, x_handle, full_name, avatar_url")
    .eq("status", "approved")
    .order("x_handle", { ascending: true });

  // Fetch initial messages for the default channel (server-side)
  const defaultChannel = publicChannels.find((c) => c.slug === "general") || publicChannels[0];
  let initialMessages: MessageWithAuthor[] = [];
  if (defaultChannel) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*, author:profiles!messages_author_id_fkey(x_handle, full_name, avatar_url)")
      .eq("channel_id", defaultChannel.id)
      .order("created_at", { ascending: false })
      .limit(50);
    initialMessages = ((msgs || []) as MessageWithAuthor[]).reverse();
  }

  return (
    <ChatLayout
      channels={publicChannels}
      dmChannels={dmChannels}
      members={members || []}
      profile={profile as Profile}
      initialMessages={initialMessages}
      initialChannelId={defaultChannel?.id || null}
      initialChannelSlug={defaultChannel?.slug || null}
    >
      {children}
    </ChatLayout>
  );
}
