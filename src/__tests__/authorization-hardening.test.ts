import { readFileSync, readdirSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

function migrationSources() {
  const dir = path.join(root, "supabase/migrations");
  return readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => ({
      fileName,
      text: readFileSync(path.join(dir, fileName), "utf8"),
    }));
}

describe("authorization hardening", () => {
  it("prevents sponsor UI from approving profiles directly", () => {
    const authCallback = source("src/app/auth/callback/route.ts");
    const parrainagesTabs = source("src/components/sponsorship/parrainages-tabs.tsx");
    const invitationCard = source("src/components/sponsorship/invitation-card.tsx");

    expect(authCallback).toContain("createSponsorshipRequestForHandle");
    expect(authCallback).not.toContain(".update({ sponsored_by");
    expect(parrainagesTabs).not.toContain('status: "approved"');
    expect(parrainagesTabs).not.toContain("sponsored_by");
    expect(parrainagesTabs).not.toContain("sponsor_approved");
    expect(invitationCard).not.toContain('from("profiles")');
    expect(invitationCard).not.toContain("sponsored_by");
    expect(invitationCard).not.toContain("sponsor_approved");
  });

  it("adds local database guards for profile admission and access-sensitive fields", () => {
    const hardeningMigration = migrationSources().find(({ text }) =>
      text.includes("prevent_sensitive_profile_update"),
    );

    const migrationText = hardeningMigration?.text ?? "";

    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles',
    );
    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Sponsors can approve their sponsored users" ON public.profiles',
    );

    for (const field of [
      "status",
      "is_admin",
      "chat_banned",
      "chat_muted_until",
      "sponsored_by",
      "sponsor_approved",
    ]) {
      expect(migrationText).toContain(field);
    }

    expect(migrationText).toContain("app.trusted_sponsorship_update");
    expect(migrationText).toContain("private.confirm_sponsorship_request");
    expect(migrationText).toContain("private.confirm_invitation_acceptance");
  });

  it("allows sponsors to view requester profiles for addressed requests", () => {
    const visibilityMigration = migrationSources().find(({ fileName }) =>
      fileName.includes("allow_sponsor_requester_profile_visibility"),
    );

    const migrationText = visibilityMigration?.text ?? "";

    expect(migrationText).toContain("ON public.profiles FOR SELECT");
    expect(migrationText).toContain("public.sponsorship_requests");
    expect(migrationText).toContain("sr.requester_id = profiles.id");
    expect(migrationText).toContain("sr.sponsor_id = (SELECT auth.uid())");
  });

  it("freezes trusted sponsorship and invitation transition identity fields", () => {
    const hardeningMigration = migrationSources().find(({ text }) =>
      text.includes("prevent_sensitive_profile_update"),
    );

    const migrationText = hardeningMigration?.text ?? "";

    expect(migrationText).toContain("private.prevent_sponsorship_request_identity_change");
    expect(migrationText).toContain("NEW.requester_id IS DISTINCT FROM OLD.requester_id");
    expect(migrationText).toContain("NEW.sponsor_id IS DISTINCT FROM OLD.sponsor_id");
    expect(migrationText).toContain("NEW.sponsor_handle IS DISTINCT FROM OLD.sponsor_handle");
    expect(migrationText).toContain("NEW.attempt_number IS DISTINCT FROM OLD.attempt_number");
    expect(migrationText).toContain("WHERE id = OLD.requester_id");
    expect(migrationText).toContain("SET sponsored_by = OLD.sponsor_id");

    expect(migrationText).toContain("private.prevent_invitation_identity_change");
    expect(migrationText).toContain("NEW.inviter_id IS DISTINCT FROM OLD.inviter_id");
    expect(migrationText).toContain("NEW.invited_x_handle IS DISTINCT FROM OLD.invited_x_handle");
    expect(migrationText).toContain("invited.x_handle = OLD.invited_x_handle");
    expect(migrationText).toContain("SET sponsored_by = OLD.inviter_id");
  });

  it("adds explicit channel read and write permission checks", () => {
    const hardeningMigration = migrationSources().find(({ text }) =>
      text.includes("prevent_sensitive_profile_update"),
    );

    const migrationText = hardeningMigration?.text ?? "";

    expect(migrationText).toContain("ADD COLUMN IF NOT EXISTS read_permission");
    expect(migrationText).toContain("ADD COLUMN IF NOT EXISTS write_permission");
    expect(migrationText).toContain("CHECK (read_permission IN ('all', 'admin_only'))");
    expect(migrationText).toContain("CHECK (write_permission IN ('all', 'admin_only'))");
    expect(migrationText).toContain("c.read_permission = 'all'");
    expect(migrationText).toContain("c.write_permission = 'all'");
  });

  it("enforces the US3 canonical launch channel taxonomy", () => {
    const taxonomyMigration = migrationSources().find(({ fileName }) =>
      fileName.includes("us3_launch_channel_taxonomy"),
    );
    const migrationText = taxonomyMigration?.text ?? "";

    expect(migrationText).toContain("'general'");
    expect(migrationText).toContain("'business'");
    expect(migrationText).toContain("'politique'");
    expect(migrationText).toContain("'divers'");
    expect(migrationText).toContain("'jobs'");
    expect(migrationText).toContain("'admin_only'");
    expect(migrationText).toContain("('recrutement', 'jobs')");
    expect(migrationText).toContain("('random', 'divers')");
    expect(migrationText).toContain("slug IN ('recrutement', 'aide', 'random')");
  });

  it("adds local database guards for chat writes and private channel membership", () => {
    const hardeningMigration = migrationSources().find(({ text }) =>
      text.includes("prevent_sensitive_profile_update"),
    );
    const migrationText = hardeningMigration?.text ?? "";

    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Approved users can send messages" ON public.messages',
    );
    expect(migrationText).toContain("COALESCE(p.chat_banned, FALSE) = FALSE");
    expect(migrationText).toContain("chat_muted_until IS NULL");
    expect(migrationText).toContain("is_private = FALSE");
    expect(migrationText).toContain("public.channel_members");
    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Users can update own messages" ON public.messages',
    );
    expect(migrationText).toContain('CREATE POLICY "Users can update own messages"');
    expect(migrationText).toContain("private.prevent_message_unsafe_update");
    expect(migrationText).toContain("NEW.channel_id IS DISTINCT FROM OLD.channel_id");
    expect(migrationText).toContain("NEW.author_id IS DISTINCT FROM OLD.author_id");
    expect(migrationText).toContain("NEW.image_url IS DISTINCT FROM OLD.image_url");

    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Approved users can create private channels" ON public.channels',
    );
    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Approved users can create channel memberships" ON public.channel_members',
    );
    expect(migrationText).toContain('CREATE POLICY "Admins can create channel memberships"');
  });

  it("stores chat images with private signed media paths", () => {
    const messageInput = source("src/components/chat/message-input.tsx");
    const messageBubble = source("src/components/chat/message-bubble.tsx");
    const migrationText = migrationSources()
      .map(({ text }) => text)
      .join("\n");

    expect(messageInput).toContain('const CHAT_MEDIA_BUCKET = "medias"');
    expect(messageInput).toContain(".from(CHAT_MEDIA_BUCKET)");
    expect(messageInput).toContain("MESSAGE_WITH_AUTHOR_SELECT");
    expect(messageInput).toContain("mapMessageRowToMessageWithAuthor(insertedMessage as MessageRow)");
    expect(messageInput).toContain("ImagePlus");
    expect(messageInput).toContain("handleImageFileSelected");
    expect(messageInput).toContain("handlePaste");
    expect(messageInput).toContain("setError(`Échec du téléversement de l'image");
    expect(messageBubble).toContain(".from(\"medias\")");
    expect(messageBubble).toContain("createSignedUrl");
    expect(migrationText).toContain('CREATE POLICY "Users can upload chat media"');
    expect(migrationText).toContain('CREATE POLICY "Users can read chat media"');
    expect(migrationText).toContain("private.can_current_user_access_chat_media_path");
    expect(migrationText).toContain("COALESCE(c.write_permission, 'all') = 'all'");
    expect(migrationText).toContain("COALESCE(c.read_permission, 'all') = 'all'");
    expect(migrationText).toContain("split_part(image_url, '/', 1) = 'chat'");
    expect(migrationText).toContain('CREATE POLICY "Approved users can send messages to allowed channels"');
    expect(migrationText).toContain("bucket_id = 'medias'");
  });

  it("supports admin-only chat message pinning", () => {
    const messageBubble = source("src/components/chat/message-bubble.tsx");
    const messageArea = source("src/components/chat/message-area.tsx");
    const migrationText = migrationSources()
      .map(({ text }) => text)
      .join("\n");

    expect(migrationText).toContain("ADD COLUMN IF NOT EXISTS is_pinned");
    expect(migrationText).toContain("idx_messages_channel_pinned_created");
    expect(migrationText).toContain("idx_messages_one_pinned_per_channel");
    expect(migrationText).toContain("NEW.is_pinned IS DISTINCT FROM OLD.is_pinned");
    expect(migrationText).toContain("message_pin_admin_only");
    expect(messageBubble).toContain("if (!isAdmin) return;");
    expect(messageBubble).toContain('.eq("channel_id", channelId)');
    expect(messageBubble).toContain("Failed to clear existing pinned message");
    expect(messageBubble).toContain("Failed to update message pin state");
    expect(messageBubble).toContain("Impossible de modifier l'épinglage");
    expect(messageArea).toContain("Message épinglé");
    expect(messageArea).toContain("PinnedMessageBanner");
    expect(messageArea).toContain("data-message-id={msg.id}");
    expect(messageArea).toContain("document.getElementById(getMessageDomId(messageId))");
    expect(messageArea).toContain("scrollIntoView({ behavior: \"smooth\", block: \"center\" })");
    expect(messageArea).toContain("MESSAGE_HIGHLIGHT_CLASSNAMES");
    expect(messageArea).toContain("scheduleScrollToMessage(pinnedMessage.id)");
  });

  it("supports chat message replies with same-channel database guards and pinned-message scrolling", () => {
    const chatMessages = source("src/lib/chat/messages.ts");
    const messageInput = source("src/components/chat/message-input.tsx");
    const messageBubble = source("src/components/chat/message-bubble.tsx");
    const messageArea = source("src/components/chat/message-area.tsx");
    const chatStore = source("src/components/chat/chat-store.tsx");
    const chatLayoutPage = source("src/app/(app)/chat/layout.tsx");
    const migrationText = migrationSources()
      .map(({ text }) => text)
      .join("\n");

    expect(migrationText).toContain("ADD COLUMN IF NOT EXISTS reply_to_message_id");
    expect(migrationText).toContain("messages_reply_to_message_id_fkey");
    expect(migrationText).toContain("messages_reply_to_not_self_check");
    expect(migrationText).toContain("private.enforce_message_reply_channel");
    expect(migrationText).toContain("message_reply_cross_channel");
    expect(migrationText).toContain("message_reply_target_immutable");
    expect(migrationText).toContain("idx_messages_channel_reply_to");
    expect(chatMessages).toContain("collectReplyToMessageIds");
    expect(chatMessages).toContain("attachReplyTargets");
    expect(chatMessages).toContain("function normalizeReplyToMessage");
    expect(chatMessages).toContain("export type ReplyToMessage = Pick");
    expect(chatStore).toContain("mapMessageRowsToMessagesWithAuthor");
    expect(chatStore).toContain("async function hydrateReplyTargets");
    expect(chatStore).toContain("reply_to_message_id: replyTarget?.id ?? null");
    expect(chatStore).toContain("optimisticMessage.reply_to_message_id === incomingMessage.reply_to_message_id");
    expect(chatLayoutPage).toContain(".select(MESSAGE_WITH_AUTHOR_SELECT)");
    expect(messageInput).toContain("insertPayload.reply_to_message_id = replyTarget.id");
    expect(messageInput).toContain("Réponse à @{replyTarget.author.x_handle}");
    expect(messageInput).toContain("onCancelReply?.()");
    expect(messageBubble).toContain("Répondre");
    expect(messageBubble).toContain("REPLY_SWIPE_THRESHOLD_PX");
    expect(messageBubble).toContain("onPointerMove={handlePointerMove}");
    expect(messageBubble).toContain("touch-pan-y");
    expect(messageBubble).toContain("isReplyable || Boolean(isAdmin)");
    expect(messageBubble).toContain("onReplyClick?.(replyToMessageId)");
    expect(messageArea).toContain("const [replyTarget, setReplyTarget] = useState<ReplyToMessage | null>(null)");
    expect(messageArea).toContain("store.jumpToMessage(channelId, messageId)");
    expect(messageArea).toContain("scheduleScrollToMessage(messageId)");
    expect(messageArea).toContain("replyTarget={activeReplyTarget}");
  });

  it("loads message context before jumping to unloaded chat messages", () => {
    const chatStore = source("src/components/chat/chat-store.tsx");

    expect(chatStore).toContain("const MESSAGE_JUMP_CONTEXT_LIMIT = 25");
    expect(chatStore).toContain("async function jumpToMessage");
    expect(chatStore).toContain(".lt(\"created_at\", targetMessage.created_at)");
    expect(chatStore).toContain(".gt(\"created_at\", targetMessage.created_at)");
    expect(chatStore).toContain(".limit(MESSAGE_JUMP_CONTEXT_LIMIT)");
    expect(chatStore).toContain("messages: mergeMessages(prev.messages, windowMessages)");
    expect(chatStore).toContain("pinnedMessage: FullMessage | null");
  });

  it("adds a floating shortcut back to the latest chat messages", () => {
    const messageArea = source("src/components/chat/message-area.tsx");

    expect(messageArea).toContain("const CHAT_BOTTOM_THRESHOLD_PX = 100");
    expect(messageArea).toContain("const [showScrollToLatest, setShowScrollToLatest] = useState(false)");
    expect(messageArea).toContain("function resolveIsAtBottom");
    expect(messageArea).toContain("function resolveScrollToLatestPosition");
    expect(messageArea).toContain("const composerLaneRef = useRef<HTMLDivElement>(null)");
    expect(messageArea).toContain("window.innerWidth - composerLaneRect.right + SCROLL_TO_LATEST_COMPOSER_GAP_PX");
    expect(messageArea).toContain("window.innerHeight - composerLaneRect.top + SCROLL_TO_LATEST_COMPOSER_GAP_PX");
    expect(messageArea).toContain("pointer-events-none fixed z-20");
    expect(messageArea).toContain("aria-label={scrollToLatestAriaLabel}");
    expect(messageArea).toContain("<ArrowDown className=\"h-[16px] w-[16px]\" />");
    expect(messageArea).toContain("bottomRef.current?.scrollIntoView({ behavior: \"smooth\", block: \"end\" })");
    expect(messageArea).toContain("const [hasNewLatestMessage, setHasNewLatestMessage] = useState(false)");
    expect(messageArea).toContain("const latestMessageIdRef = useRef<string | null>(null)");
    expect(messageArea).toContain("const latestMessageNotificationEffect");
    expect(messageArea).toContain("const latestMessageId = useMemo(() => {");
    expect(messageArea).toContain("setShowScrollToLatest(true);");
    expect(messageArea).toContain("setHasNewLatestMessage(true)");
    expect(messageArea).toContain("Aller aux nouveaux messages");
    expect(messageArea).toContain("h-[8px] w-[8px] rounded-full");
  });

  it("replaces recursive channel member visibility with a private RLS helper", () => {
    const migrationText = migrationSources()
      .map(({ text }) => text)
      .join("\n");

    expect(migrationText).toContain("private.is_current_user_channel_member");
    expect(migrationText).toContain("SECURITY DEFINER");
    expect(migrationText).toContain("GRANT USAGE ON SCHEMA private TO authenticated");
    expect(migrationText).toContain(
      "GRANT EXECUTE ON FUNCTION private.is_current_user_channel_member(UUID) TO authenticated",
    );
    expect(migrationText).toContain(
      'DROP POLICY IF EXISTS "Users can view co-members in their channels"',
    );
    expect(migrationText).toContain(
      "USING ((SELECT private.is_current_user_channel_member(channel_id)))",
    );
  });

  it("does not expose client-side private DM creation from member profiles", () => {
    const memberProfile = source("src/components/membres/member-profile.tsx");

    expect(memberProfile).not.toContain('from("channels")');
    expect(memberProfile).not.toContain("is_private: true");
    expect(memberProfile).not.toContain('from("channel_members").insert');
    expect(memberProfile).not.toContain("SendDmButton");
  });

  it("requires approved and onboarded admin state for server-side admin mutations", () => {
    const adminActions = source("src/app/(app)/admin/actions.ts");

    expect(adminActions).toContain('select("is_admin, status, onboarding_completed")');
    expect(adminActions).toContain('profile?.status === "approved"');
    expect(adminActions).toContain("profile.onboarding_completed === true");
    expect(adminActions).toContain("if (!profile?.is_admin || !hasMemberBoundary)");
  });

  it("only notifies mentions after a successful message insert", () => {
    const messageInput = source("src/components/chat/message-input.tsx");
    const insertErrorStart = messageInput.indexOf("if (insertError)");
    const insertElseIndex = messageInput.indexOf("} else {", insertErrorStart);
    const sendResultBlock = messageInput.slice(insertErrorStart);
    const [errorBranch, successBranch] = insertElseIndex === -1
      ? [sendResultBlock, ""]
      : sendResultBlock.split("} else {");

    expect(errorBranch).not.toContain("notifyMentions");
    expect(successBranch).toContain("notifyMentions");
  });

  it("uses canonical chat slug links for chat mention notifications", () => {
    const messageInput = source("src/components/chat/message-input.tsx");
    const notificationProvider = source("src/components/notifications/notification-provider.tsx");

    expect(messageInput).toContain("const mentionNotificationLink = useMemo(() => {");
    expect(messageInput).toContain("if (channelSlug) return `/chat/${channelSlug}`;");
    expect(messageInput).toContain("link: mentionNotificationLink");
    expect(notificationProvider).toContain("resolveChatLinkTarget");
    expect(notificationProvider).toContain("kind: \"channel_slug\"");
    expect(notificationProvider).toContain(".eq(\"slug\", channelTarget.value)");
  });

  it("blocks the composer UI when the active channel is not writable", () => {
    const chatLayout = source("src/components/chat/chat-layout.tsx");
    const messageArea = source("src/components/chat/message-area.tsx");
    const messageInput = source("src/components/chat/message-input.tsx");

    expect(chatLayout).toContain("const activeChannelCanWrite = useMemo(() => {");
    expect(chatLayout).toContain("activeChannel.write_permission === \"all\" || Boolean(isAdmin)");
    expect(chatLayout).toContain("Seuls les admins peuvent publier dans Jobs.");
    expect(chatLayout).toContain("canWrite={activeChannelCanWrite}");
    expect(messageArea).toContain("canWrite: boolean;");
    expect(messageInput).toContain("if (!canWrite) return;");
    expect(messageInput).toContain("const inputDisabled = isBusy || !canWrite || isOffline;");
    expect(messageInput).toContain("if (!canWrite && noPermissionMessage) return noPermissionMessage;");
  });

  it("filters global message search to canonical launch chat channels", () => {
    const chatLayoutPage = source("src/app/(app)/chat/layout.tsx");
    const header = source("src/components/layout/header.tsx");

    expect(chatLayoutPage).toContain("LAUNCH_CHAT_CHANNEL_SLUGS");
    expect(chatLayoutPage).toContain(".in(\"slug\", [...LAUNCH_CHAT_CHANNEL_SLUGS])");
    expect(header).toContain("LAUNCH_CHAT_CHANNEL_SLUGS");
    expect(header).toContain('.from("channels")');
    expect(header).toContain(".in(\"slug\", [...LAUNCH_CHAT_CHANNEL_SLUGS])");
    expect(header).toContain(".in(\"channel_id\", launchChannelIds)");
  });

  it("prevents users from reacting to their own chat messages", () => {
    const messageArea = source("src/components/chat/message-area.tsx");
    const chatStore = source("src/components/chat/chat-store.tsx");
    const migrationText = migrationSources()
      .map(({ text }) => text)
      .join("\n");

    expect(messageArea).toContain("msg.author_id === userId");
    expect(messageArea).toContain("? undefined");
    expect(chatStore).toContain("message.author_id === userId");
    expect(chatStore).toContain("messageAuthorIds.get(r.message_id) === r.user_id");
    expect(chatStore).toContain("newAuthorIds.get(r.message_id) === r.user_id");
    expect(migrationText).toContain('DROP POLICY IF EXISTS "Users can add reactions"');
    expect(migrationText).toContain("m.author_id <> (SELECT auth.uid())");
  });
});
