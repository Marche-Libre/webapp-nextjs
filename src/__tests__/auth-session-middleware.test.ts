import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ProfileState = {
  status: "approved" | "pending" | "rejected";
  onboarding_completed: boolean;
};

let mockUserId: string | null = "user-1";
let mockProfile: ProfileState = {
  status: "approved",
  onboarding_completed: true,
};

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: mockUserId ? { id: mockUserId } : null,
        },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockProfile }),
        }),
      }),
    }),
  }),
}));

import { updateSession } from "@/lib/supabase/middleware";

function requestFor(pathname: string) {
  return new NextRequest(`https://example.test${pathname}`);
}

async function expectRedirect(pathname: string, location: string) {
  const response = await updateSession(requestFor(pathname));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe(location);
}

beforeEach(() => {
  mockUserId = "user-1";
  mockProfile = { status: "approved", onboarding_completed: true };
});

describe("auth session middleware routing", () => {
  it("routes approved and onboarded users from /rejoindre to /chat", async () => {
    await expectRedirect("/rejoindre", "https://example.test/chat");
  });

  it("routes approved and onboarded users from all auth entry routes to /chat", async () => {
    const entryRoutes = ["/", "/connexion", "/inscription", "/en-attente"];
    await Promise.all(
      entryRoutes.map((route) =>
        expectRedirect(route, "https://example.test/chat"),
      ),
    );
  });

  it("routes approved but not onboarded users from /rejoindre to /onboarding", async () => {
    mockProfile = { status: "approved", onboarding_completed: false };
    await expectRedirect("/rejoindre", "https://example.test/onboarding");
  });

  it("routes approved but not onboarded users from chat and protected routes to /onboarding", async () => {
    mockProfile = { status: "approved", onboarding_completed: false };

    const protectedRoutes = ["/chat", "/chat/general", "/profil"];
    await Promise.all(
      protectedRoutes.map((route) =>
        expectRedirect(route, "https://example.test/onboarding"),
      ),
    );
  });

  it("routes pending users from /rejoindre to /en-attente", async () => {
    mockProfile = { status: "pending", onboarding_completed: false };
    await expectRedirect("/rejoindre", "https://example.test/en-attente");
  });

  it("routes rejected users from /rejoindre to /en-attente", async () => {
    mockProfile = { status: "rejected", onboarding_completed: false };
    await expectRedirect("/rejoindre", "https://example.test/en-attente");
  });

  it("blocks pending users from protected routes", async () => {
    mockProfile = { status: "pending", onboarding_completed: false };
    await expectRedirect("/chat", "https://example.test/en-attente");
  });

  it("blocks rejected users from protected routes", async () => {
    mockProfile = { status: "rejected", onboarding_completed: false };
    await expectRedirect("/chat", "https://example.test/en-attente");
  });

  it("allows approved and onboarded users on protected routes", async () => {
    const response = await updateSession(requestFor("/chat"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("keeps /rejoindre public for signed-out users", async () => {
    mockUserId = null;
    const response = await updateSession(requestFor("/rejoindre"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects signed-out users from protected routes to /connexion", async () => {
    mockUserId = null;
    await expectRedirect("/chat", "https://example.test/connexion");
  });
});
