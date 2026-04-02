import { describe, it, expect, vi } from "vitest";
import { createNotification, notifyMentions } from "@/lib/notifications";

// ─── Mock Supabase client ───

function mockSupabase(overrides: Record<string, any> = {}) {
  const insertFn = vi.fn().mockResolvedValue({ error: null });
  const selectFn = vi.fn().mockReturnThis();
  const eqFn = vi.fn().mockReturnThis();
  const inFn = vi.fn().mockReturnThis();
  const singleFn = vi.fn().mockResolvedValue({ data: null });

  const client = {
    from: vi.fn().mockReturnValue({
      insert: insertFn,
      select: selectFn,
      eq: eqFn,
      in: inFn,
      single: singleFn,
    }),
    _insertFn: insertFn,
    _singleFn: singleFn,
    _inFn: inFn,
    ...overrides,
  };

  return client as any;
}

// ─── Tests ───

describe("createNotification", () => {
  it("inserts a notification row", async () => {
    const supabase = mockSupabase();
    await createNotification(supabase, {
      userId: "user-1",
      actorId: "user-2",
      type: "chat_mention",
      title: "You were mentioned",
      body: "Hello @user1",
      link: "/chat",
    });

    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(supabase._insertFn).toHaveBeenCalledWith({
      user_id: "user-1",
      actor_id: "user-2",
      type: "chat_mention",
      title: "You were mentioned",
      body: "Hello @user1",
      link: "/chat",
    });
  });

  it("skips self-notifications", async () => {
    const supabase = mockSupabase();
    await createNotification(supabase, {
      userId: "user-1",
      actorId: "user-1",
      type: "chat_mention",
      title: "Self mention",
    });

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("handles missing optional fields", async () => {
    const supabase = mockSupabase();
    await createNotification(supabase, {
      userId: "user-1",
      actorId: "user-2",
      type: "forum_reply",
      title: "New reply",
    });

    expect(supabase._insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        body: null,
        link: null,
      })
    );
  });
});

describe("notifyMentions", () => {
  it("does nothing when no @mentions in content", async () => {
    const supabase = mockSupabase();
    await notifyMentions(supabase, {
      content: "Hello world, no mentions here",
      authorId: "user-1",
      type: "chat_mention",
    });

    // from() should not be called since no mentions
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("extracts @handles from content", async () => {
    // Create a more realistic mock for this test
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [
                  { id: "user-2", x_handle: "alice" },
                  { id: "user-3", x_handle: "bob" },
                ],
              }),
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { x_handle: "sender" },
                }),
              }),
            }),
          };
        }
        return { insert: insertFn };
      }),
    } as any;

    await notifyMentions(supabase, {
      content: "Hey @alice and @bob check this out",
      authorId: "user-1",
      type: "chat_mention",
      link: "/chat/general",
    });

    // Should have created notifications for both mentioned users
    expect(insertFn).toHaveBeenCalledTimes(2);
  });

  it("deduplicates mentions", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockImplementation((_col: string, handles: string[]) => ({
                data: handles.includes("alice")
                  ? [{ id: "user-2", x_handle: "alice" }]
                  : [],
              })),
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { x_handle: "sender" },
                }),
              }),
            }),
          };
        }
        return { insert: insertFn };
      }),
    } as any;

    await notifyMentions(supabase, {
      content: "@alice hey @alice @alice",
      authorId: "user-1",
      type: "chat_mention",
    });

    // Only one notification despite 3 @alice mentions
    expect(insertFn).toHaveBeenCalledTimes(1);
  });
});
