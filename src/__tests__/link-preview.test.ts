import { describe, expect, it } from "vitest";
import { assertSafePreviewUrl, extractLinkPreviewMetadata } from "@/lib/link-preview";
import { extractFirstHttpUrl } from "@/lib/link-preview-url";

describe("extractFirstHttpUrl", () => {
  it("extracts the first http URL from message content", () => {
    expect(extractFirstHttpUrl("Regarde https://example.com/article?id=1 merci")).toBe("https://example.com/article?id=1");
  });

  it("trims punctuation commonly placed after URLs", () => {
    expect(extractFirstHttpUrl("Lien: https://example.com/test.")).toBe("https://example.com/test");
  });

  it("ignores non-http links", () => {
    expect(extractFirstHttpUrl("Contact mailto:test@example.com")).toBeNull();
  });
});

describe("assertSafePreviewUrl", () => {
  it("accepts a public http URL", async () => {
    const url = await assertSafePreviewUrl("https://example.com/path#section", async () => [
      { address: "93.184.216.34" },
    ]);

    expect(url.toString()).toBe("https://example.com/path");
  });

  it("rejects localhost hosts", async () => {
    await expect(assertSafePreviewUrl("http://localhost:3000")).rejects.toThrow("blocked_hostname");
  });

  it("rejects private IPv4 literals", async () => {
    await expect(assertSafePreviewUrl("http://192.168.1.2/admin")).rejects.toThrow("blocked_address");
  });

  it("rejects private resolved addresses", async () => {
    await expect(assertSafePreviewUrl("https://example.com", async () => [
      { address: "10.0.0.4" },
    ])).rejects.toThrow("blocked_resolved_address");
  });

  it("rejects unsupported protocols", async () => {
    await expect(assertSafePreviewUrl("file:///etc/passwd")).rejects.toThrow("unsupported_protocol");
  });
});

describe("extractLinkPreviewMetadata", () => {
  it("extracts Open Graph metadata", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Article &amp; titre" />
          <meta property="og:description" content="Résumé court" />
          <meta property="og:image" content="/image.jpg" />
          <meta property="og:site_name" content="Example News" />
        </head>
      </html>
    `;

    expect(extractLinkPreviewMetadata("https://www.example.com/posts/1", html)).toEqual({
      url: "https://www.example.com/posts/1",
      domain: "example.com",
      title: "Article & titre",
      description: "Résumé court",
      imageUrl: "https://www.example.com/image.jpg",
      siteName: "Example News",
    });
  });

  it("falls back to title and description meta tags", () => {
    const html = `
      <html>
        <head>
          <title>Fallback title</title>
          <meta name="description" content="Fallback description" />
        </head>
      </html>
    `;

    expect(extractLinkPreviewMetadata("https://example.com", html)).toMatchObject({
      title: "Fallback title",
      description: "Fallback description",
      imageUrl: null,
      siteName: null,
    });
  });
});
