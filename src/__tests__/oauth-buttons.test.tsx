import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RejoindrePage from "@/app/rejoindre/page";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

type ProfileResult = {
  status: string;
  onboarding_completed: boolean;
} | null;

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  insertNotification: vi.fn(),
  insertSponsorshipRequest: vi.fn(),
  createReferralSponsorshipRequest: vi.fn(),
  replace: vi.fn(),
  searchParams: "",
  signInWithOAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/app/rejoindre/actions", () => ({
  createReferralSponsorshipRequest: mocks.createReferralSponsorshipRequest,
}));

function mockSupabaseClient(
  userId: string | null,
  profile: ProfileResult,
  userError: Error | null = null,
  sponsorshipOptions: {
    existingRequests?: unknown[];
    requesterHandle?: string;
    sponsor?: { id: string; x_handle: string };
  } = {},
) {
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn((columns: string) => {
          if (columns === "id, x_handle") {
            return {
              eq: vi.fn(() => ({
                ilike: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => ({
                      data: sponsorshipOptions.sponsor ?? null,
                      error: null,
                    })),
                  })),
                })),
              })),
            };
          }

          if (columns === "x_handle") {
            return {
              eq: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: {
                    x_handle: sponsorshipOptions.requesterHandle ?? "candidate",
                  },
                })),
              })),
            };
          }

          return {
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({ data: profile, error: null })),
            })),
          };
        }),
      };
    }

    if (table === "sponsorship_requests") {
      return {
        insert: mocks.insertSponsorshipRequest,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({
              data: sponsorshipOptions.existingRequests ?? [],
              error: null,
            })),
          })),
        })),
      };
    }

    if (table === "notifications") {
      return {
        insert: mocks.insertNotification,
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  mocks.getUser.mockResolvedValue({
    data: {
      user: userId ? { id: userId } : null,
    },
    error: userError,
  });
  mocks.signInWithOAuth.mockResolvedValue({
    data: {
      url: "https://x.com/i/oauth2/authorize?client_id=123",
    },
    error: null,
  });
  mocks.createClient.mockReturnValue({
    auth: {
      getUser: mocks.getUser,
      signInWithOAuth: mocks.signInWithOAuth,
    },
    from,
  });

  return { from };
}

function renderOAuthButtons() {
  return renderElement(<OAuthButtons />);
}

function renderRejoindrePage() {
  return renderElement(<RejoindrePage />);
}

function renderElement(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.append(container);
  let root: Root | null = null;

  act(() => {
    root = createRoot(container);
    root.render(element);
  });

  const button = container.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("OAuth button was not rendered");
  }

  return {
    button,
    unmount: () => {
      act(() => root?.unmount());
    },
  };
}

async function clickButton(button: HTMLButtonElement) {
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mocks.createClient.mockReset();
  mocks.getUser.mockReset();
  mocks.insertNotification.mockReset();
  mocks.insertNotification.mockResolvedValue({ error: null });
  mocks.insertSponsorshipRequest.mockReset();
  mocks.insertSponsorshipRequest.mockResolvedValue({ error: null });
  mocks.createReferralSponsorshipRequest.mockReset();
  mocks.createReferralSponsorshipRequest.mockResolvedValue({
    success: true,
    message: "Demande de parrainage envoyee.",
  });
  mocks.replace.mockReset();
  mocks.searchParams = "";
  mocks.signInWithOAuth.mockReset();
  document.body.innerHTML = "";
  document.cookie = "ml-referral=;path=/;max-age=0";
});

describe("OAuthButtons", () => {
  it("starts X OAuth for logged-out users", async () => {
    mockSupabaseClient(null, null, new AuthSessionMissingError());

    const { button, unmount } = renderOAuthButtons();

    await clickButton(button);

    expect(mocks.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    expect(mocks.replace).toHaveBeenCalledWith("/auth/x/continue");

    unmount();
  });

  it("routes approved and onboarded users to chat without X OAuth", async () => {
    mockSupabaseClient("user-1", {
      status: "approved",
      onboarding_completed: true,
    });

    const { button, unmount } = renderOAuthButtons();

    await clickButton(button);

    expect(mocks.replace).toHaveBeenCalledWith("/chat");
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();

    unmount();
  });

  it("routes connected non-members to waiting without X OAuth", async () => {
    mockSupabaseClient("user-1", {
      status: "pending",
      onboarding_completed: false,
    });

    const { button, unmount } = renderOAuthButtons();

    await clickButton(button);

    expect(mocks.replace).toHaveBeenCalledWith("/en-attente");
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();

    unmount();
  });
});

describe("RejoindrePage auth entry", () => {
  it("keeps referral storage and starts X OAuth for logged-out users", async () => {
    mocks.searchParams = "ref=@alice";
    mockSupabaseClient(null, null, new AuthSessionMissingError());

    const { button, unmount } = renderRejoindrePage();

    await clickButton(button);

    expect(document.cookie).toContain("ml-referral=alice");
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    expect(mocks.replace).toHaveBeenCalledWith("/auth/x/continue");

    unmount();
  });

  it("routes connected approved users without onboarding to chat and skips X OAuth", async () => {
    mocks.searchParams = "ref=@alice";
    mockSupabaseClient("user-1", {
      status: "approved",
      onboarding_completed: false,
    });

    const { button, unmount } = renderRejoindrePage();

    await clickButton(button);

    expect(document.cookie).not.toContain("ml-referral=alice");
    expect(mocks.replace).toHaveBeenCalledWith("/chat");
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();

    unmount();
  });

  it("creates a sponsorship request for connected pending users with a referral", async () => {
    mocks.searchParams = "ref=@Alice";
    mockSupabaseClient(
      "user-1",
      {
        status: "pending",
        onboarding_completed: false,
      },
      null,
      {
        requesterHandle: "candidate",
        sponsor: { id: "sponsor-1", x_handle: "alice" },
      },
    );

    const { button, unmount } = renderRejoindrePage();

    await clickButton(button);

    expect(mocks.createReferralSponsorshipRequest).toHaveBeenCalledWith("Alice");
    expect(mocks.replace).toHaveBeenCalledWith("/en-attente");
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();

    unmount();
  });
});
