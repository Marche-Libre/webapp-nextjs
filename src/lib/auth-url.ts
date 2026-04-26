const DEFAULT_PUBLIC_SITE_URL = "https://le-marche-libre.vercel.app";

function withProtocol(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function getPublicSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(withProtocol(configuredUrl)).origin;
    } catch {
      // Fall back to the browser origin if the configured value is malformed.
    }
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;

    if (
      process.env.NODE_ENV === "development" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return origin;
    }
  }

  return new URL(DEFAULT_PUBLIC_SITE_URL).origin;
}

export function getAuthCallbackUrl() {
  const origin = getPublicSiteOrigin();
  return origin ? `${origin}/auth/callback` : "/auth/callback";
}
