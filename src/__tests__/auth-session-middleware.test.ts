import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ProfileState = {
  status: string;
  onboarding_completed: boolean;
};

let mockUserId: string | null = "user-1";
let mockProfile: ProfileState | null = {
  status: "approved",
  onboarding_completed: true,
};
let mockProfileError: { message: string } | null = null;

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
          single: async () => ({ data: mockProfile, error: mockProfileError }),
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
  expect(response.headers.get("location")).toBe(`https://example.test${location}`);
}

async function expectAccessModalRedirect(pathname: string) {
  await expectRedirect(pathname, "/?auth=access");
}

async function expectAllowed(pathname: string) {
  const response = await updateSession(requestFor(pathname));
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
  mockUserId = "user-1";
  mockProfile = { status: "approved", onboarding_completed: true };
  mockProfileError = null;
});

const legalRoutes = ["/mentions-legales", "/confidentialite", "/cgu"];
const memberRoutes = [
  "/chat",
  "/chat/general",
  "/profil",
  "/notifications",
  "/membres",
  "/forum",
  "/tableau-de-bord",
  "/parrainages",
];
const adminRoutes = ["/admin", "/admin/users"];

describe("auth session middleware routing matrix", () => {
  it("keeps public routes and public non-private route handlers accessible when logged out", async () => {
    mockUserId = null;

    const publicRoutes = [
      "/",
      "/?auth=access",
      "/acces-prive",
      "/landing1",
      "/landing2",
      "/landing3",
      "/connexion",
      "/inscription",
      "/rejoindre",
      "/en-attente",
      "/auth/callback",
      "/api/geo/cities?q=par",
      ...legalRoutes,
    ];

    await Promise.all(publicRoutes.map((route) => expectAllowed(route)));
  });

  it("redirects logged-out users away from onboarding, member, and admin routes", async () => {
    mockUserId = null;

    const privateRoutes = ["/onboarding", ...memberRoutes, ...adminRoutes];
    await Promise.all(privateRoutes.map((route) => expectAccessModalRedirect(route)));
  });

  it("keeps auth entry routes loop-free when profile rows are missing", async () => {
    mockProfile = null;

    await expectAllowed("/");
    await expectAllowed("/?auth=access");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/connexion");
    await expectAllowed("/inscription");
    await expectAllowed("/rejoindre");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const blockedRoutes = [
      "/en-attente",
      "/onboarding",
      ...memberRoutes,
      ...adminRoutes,
    ];

    await Promise.all(blockedRoutes.map((route) => expectAccessModalRedirect(route)));
  });

  it("keeps auth entry routes loop-free on profile fetch errors", async () => {
    mockProfile = { status: "approved", onboarding_completed: true };
    mockProfileError = { message: "boom" };

    await expectAllowed("/");
    await expectAllowed("/?auth=access");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/connexion");
    await expectAllowed("/inscription");
    await expectAllowed("/rejoindre");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const blockedRoutes = ["/en-attente", "/onboarding", ...memberRoutes, ...adminRoutes];
    await Promise.all(blockedRoutes.map((route) => expectAccessModalRedirect(route)));
  });

  it("treats unknown statuses as non-member and routes to /en-attente", async () => {
    mockProfile = { status: "mystery", onboarding_completed: false };

    await expectAllowed("/");
    await expectRedirect("/?auth=access", "/en-attente");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/en-attente");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const nonMemberRoutes = [
      "/connexion",
      "/inscription",
      "/rejoindre",
      "/onboarding",
      ...memberRoutes,
      ...adminRoutes,
    ];
    await Promise.all(
      nonMemberRoutes.map((route) => expectRedirect(route, "/en-attente")),
    );
  });

  it("keeps pending users on /en-attente and out of member/admin routes", async () => {
    mockProfile = { status: "pending", onboarding_completed: false };

    await expectAllowed("/");
    await expectRedirect("/?auth=access", "/en-attente");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/en-attente");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const blockedRoutes = [
      "/connexion",
      "/inscription",
      "/rejoindre",
      "/onboarding",
      ...memberRoutes,
      ...adminRoutes,
    ];
    await Promise.all(
      blockedRoutes.map((route) => expectRedirect(route, "/en-attente")),
    );
  });

  it("keeps rejected users on explicit status routes while blocking member/admin routes", async () => {
    mockProfile = { status: "rejected", onboarding_completed: false };

    await expectAllowed("/");
    await expectRedirect("/?auth=access", "/en-attente");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/connexion");
    await expectAllowed("/en-attente");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const blockedRoutes = [
      "/inscription",
      "/rejoindre",
      "/onboarding",
      ...memberRoutes,
      ...adminRoutes,
    ];
    await Promise.all(
      blockedRoutes.map((route) => expectRedirect(route, "/en-attente")),
    );
  });

  it("routes approved but not onboarded users from auth/status routes to /chat while keeping app routes open", async () => {
    mockProfile = { status: "approved", onboarding_completed: false };

    await expectAllowed("/");
    await expectRedirect("/?auth=access", "/chat");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
    await expectAllowed("/onboarding");
    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const chatEntryRedirectRoutes = [
      "/connexion",
      "/inscription",
      "/rejoindre",
      "/en-attente",
    ];
    await Promise.all(
      chatEntryRedirectRoutes.map((route) => expectRedirect(route, "/chat")),
    );

    const allowedRoutes = [...memberRoutes, ...adminRoutes];
    await Promise.all(allowedRoutes.map((route) => expectAllowed(route)));
  });

  it("keeps the landing page accessible for approved and onboarded users", async () => {
    mockProfile = { status: "approved", onboarding_completed: true };

    await expectAllowed("/");
    await expectRedirect("/?auth=access", "/chat");
    await expectAllowed("/acces-prive");
    await expectAllowed("/landing1");
    await expectAllowed("/landing2");
    await expectAllowed("/landing3");
  });

  it("routes approved and onboarded users from auth/status routes to /chat", async () => {
    mockProfile = { status: "approved", onboarding_completed: true };

    const chatEntryRedirectRoutes = [
      "/?auth=access",
      "/connexion",
      "/inscription",
      "/rejoindre",
      "/en-attente",
    ];
    await Promise.all(
      chatEntryRedirectRoutes.map((route) => expectRedirect(route, "/chat")),
    );
  });

  it("keeps /onboarding manually accessible for approved users", async () => {
    mockProfile = { status: "approved", onboarding_completed: false };
    await expectAllowed("/onboarding");

    mockProfile = { status: "approved", onboarding_completed: true };
    await expectAllowed("/onboarding");
  });

  it("allows approved and onboarded users on member/admin routes and public handlers", async () => {
    mockProfile = { status: "approved", onboarding_completed: true };

    await expectAllowed("/api/geo/cities?q=par");
    await Promise.all(legalRoutes.map((route) => expectAllowed(route)));

    const allowedRoutes = [...memberRoutes, ...adminRoutes];
    await Promise.all(allowedRoutes.map((route) => expectAllowed(route)));
  });
});
