import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Insert a single notification row.
 */
export async function createNotification(
  supabase: SupabaseClient,
  params: {
    userId: string;
    actorId: string;
    type: string;
    title: string;
    body?: string;
    link?: string;
  }
) {
  // Don't notify yourself
  if (params.userId === params.actorId) return;

  await supabase.from("notifications").insert({
    user_id: params.userId,
    actor_id: params.actorId,
    type: params.type,
    title: params.title,
    body: params.body || null,
    link: params.link || null,
  });
}

/**
 * Notify the original post author when someone replies to their forum post.
 */
export async function notifyForumReply(
  supabase: SupabaseClient,
  params: { postId: string; replyAuthorId: string }
) {
  // Fetch the post to find the author
  const { data: post } = await supabase
    .from("forum_posts")
    .select("author_id, title")
    .eq("id", params.postId)
    .single();

  if (!post) return;

  // Fetch reply author handle for the notification title
  const { data: actor } = await supabase
    .from("profiles")
    .select("x_handle")
    .eq("id", params.replyAuthorId)
    .single();

  await createNotification(supabase, {
    userId: post.author_id,
    actorId: params.replyAuthorId,
    type: "forum_reply",
    title: `@${actor?.x_handle ?? "?"} a répondu à votre post`,
    body: post.title,
    link: `/forum/posts/${params.postId}`,
  });
}

/**
 * Parse @handles from content, look up profiles, create mention notifications.
 */
export async function notifyMentions(
  supabase: SupabaseClient,
  params: {
    content: string;
    authorId: string;
    type: "chat_mention" | "forum_mention";
    link?: string;
  }
) {
  // Match @handle patterns (alphanumeric + underscores, like X handles)
  const mentions = params.content.match(/@([A-Za-z0-9_]+)/g);
  if (!mentions || mentions.length === 0) return;

  // Deduplicate handles
  const handles = [...new Set(mentions.map((m) => m.slice(1).toLowerCase()))];

  // Fetch author handle for notification text
  const { data: actor } = await supabase
    .from("profiles")
    .select("x_handle")
    .eq("id", params.authorId)
    .single();

  const label = params.type === "chat_mention" ? "le chat" : "le forum";

  // Handle @everyone — notify all approved users
  if (handles.includes("everyone")) {
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("status", "approved")
      .neq("id", params.authorId);

    if (allProfiles && allProfiles.length > 0) {
      await Promise.all(
        allProfiles.map((profile) =>
          createNotification(supabase, {
            userId: profile.id,
            actorId: params.authorId,
            type: params.type,
            title: `@${actor?.x_handle ?? "?"} a mentionné @everyone dans ${label}`,
            body: params.content.slice(0, 200),
            link: params.link,
          })
        )
      );
    }
    return;
  }

  // Look up all mentioned profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, x_handle")
    .in("x_handle", handles);

  if (!profiles || profiles.length === 0) return;

  await Promise.all(
    profiles.map((profile) =>
      createNotification(supabase, {
        userId: profile.id,
        actorId: params.authorId,
        type: params.type,
        title: `@${actor?.x_handle ?? "?"} vous a mentionné dans ${label}`,
        body: params.content.slice(0, 200),
        link: params.link,
      })
    )
  );
}

/**
 * Notify a sponsor when someone requests sponsorship.
 */
export async function notifySponsorRequest(
  supabase: SupabaseClient,
  params: { sponsorId: string; requesterId: string }
) {
  const { data: requester } = await supabase
    .from("profiles")
    .select("x_handle")
    .eq("id", params.requesterId)
    .single();

  await createNotification(supabase, {
    userId: params.sponsorId,
    actorId: params.requesterId,
    type: "sponsor_request",
    title: `@${requester?.x_handle ?? "?"} demande votre parrainage`,
    link: "/parrainages",
  });
}
