import { afterEach, describe, expect, it } from "vitest";
import { getAuthCallbackUrl, getPublicSiteOrigin } from "@/lib/auth-url";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("auth URL helpers", () => {
  it("uses NEXT_PUBLIC_SITE_URL for OAuth callbacks", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.marchelibre.test/";

    expect(getPublicSiteOrigin()).toBe("https://app.marchelibre.test");
    expect(getAuthCallbackUrl()).toBe("https://app.marchelibre.test/auth/callback");
  });

  it("adds https when the configured site URL omits a protocol", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "app.marchelibre.test";

    expect(getAuthCallbackUrl()).toBe("https://app.marchelibre.test/auth/callback");
  });

  it("falls back to the canonical Vercel URL outside local development", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getAuthCallbackUrl()).toBe("https://le-marche-libre.vercel.app/auth/callback");
  });
});
