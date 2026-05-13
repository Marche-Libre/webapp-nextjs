import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
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

function mockSupabaseClient(userId: string | null, profile: ProfileResult) {
  const single = vi.fn(async () => ({ data: profile, error: null }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  mocks.getUser.mockResolvedValue({
    data: {
      user: userId ? { id: userId } : null,
    },
  });
  mocks.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
  mocks.createClient.mockReturnValue({
    auth: {
      getUser: mocks.getUser,
      signInWithOAuth: mocks.signInWithOAuth,
    },
    from,
  });

  return { eq, from, select, single };
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
  mocks.replace.mockReset();
  mocks.searchParams = "";
  mocks.signInWithOAuth.mockReset();
  document.body.innerHTML = "";
  document.cookie = "ml-referral=;path=/;max-age=0";
});

describe("OAuthButtons", () => {
  it("starts X OAuth for logged-out users", async () => {
    mockSupabaseClient(null, null);

    const { button, unmount } = renderOAuthButtons();

    await clickButton(button);

    expect(mocks.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    expect(mocks.replace).not.toHaveBeenCalled();

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
    mockSupabaseClient(null, null);

    const { button, unmount } = renderRejoindrePage();

    await clickButton(button);

    expect(document.cookie).toContain("ml-referral=alice");
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    expect(mocks.replace).not.toHaveBeenCalled();

    unmount();
  });

  it("routes connected approved users without onboarding and skips X OAuth", async () => {
    mocks.searchParams = "ref=@alice";
    mockSupabaseClient("user-1", {
      status: "approved",
      onboarding_completed: false,
    });

    const { button, unmount } = renderRejoindrePage();

    await clickButton(button);

    expect(document.cookie).not.toContain("ml-referral=alice");
    expect(mocks.replace).toHaveBeenCalledWith("/onboarding");
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled();

    unmount();
  });
});
