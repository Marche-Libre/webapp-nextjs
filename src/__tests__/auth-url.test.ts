import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthCallbackUrl, getPublicSiteOrigin } from "@/lib/auth-url";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();

  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("auth URL helpers", () => {
  it("prefers the local browser origin on local hosts", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_SITE_URL = "https://le-marche-libre.vercel.app";

    expect(getPublicSiteOrigin()).toBe(window.location.origin);
    expect(getAuthCallbackUrl()).toBe(`${window.location.origin}/auth/callback`);
  });

  it("uses NEXT_PUBLIC_SITE_URL for OAuth callbacks", () => {
    vi.stubGlobal("window", undefined);
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.marchelibre.test/";

    expect(getPublicSiteOrigin()).toBe("https://app.marchelibre.test");
    expect(getAuthCallbackUrl()).toBe("https://app.marchelibre.test/auth/callback");
  });

  it("adds https when the configured site URL omits a protocol", () => {
    vi.stubGlobal("window", undefined);
    process.env.NEXT_PUBLIC_SITE_URL = "app.marchelibre.test";

    expect(getAuthCallbackUrl()).toBe("https://app.marchelibre.test/auth/callback");
  });

  it("falls back to the canonical Vercel URL outside local development", () => {
    vi.stubGlobal("window", undefined);
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getAuthCallbackUrl()).toBe("https://le-marche-libre.vercel.app/auth/callback");
  });
});
