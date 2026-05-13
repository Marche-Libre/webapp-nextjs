import { describe, expect, it } from "vitest";
import { resolveMediaEmbed } from "@/lib/media-embed";

describe("resolveMediaEmbed", () => {
  it("builds a privacy-friendly YouTube embed URL", () => {
    expect(resolveMediaEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m5s")).toMatchObject({
      provider: "youtube",
      kind: "video",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=65",
      aspectRatio: "16 / 9",
    });
  });

  it("supports short YouTube links", () => {
    expect(resolveMediaEmbed("https://youtu.be/dQw4w9WgXcQ")).toMatchObject({
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
  });

  it("builds Dailymotion embeds", () => {
    expect(resolveMediaEmbed("https://www.dailymotion.com/video/x8abcde_title")).toMatchObject({
      provider: "dailymotion",
      kind: "video",
      embedUrl: "https://www.dailymotion.com/embed/video/x8abcde",
    });
  });

  it("builds Spotify track embeds", () => {
    expect(resolveMediaEmbed("https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl?si=test")).toMatchObject({
      provider: "spotify",
      kind: "audio",
      embedUrl: "https://open.spotify.com/embed/track/11dFghVXANMlKmJXsNCbNl",
      height: 152,
    });
  });

  it("builds Spotify embeds with locale-prefixed paths", () => {
    expect(resolveMediaEmbed("https://open.spotify.com/intl-fr/playlist/37i9dQZF1DXcBWIGoYBM5M")).toMatchObject({
      provider: "spotify",
      embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
      height: 352,
    });
  });

  it("builds Deezer embeds with locale-prefixed paths", () => {
    expect(resolveMediaEmbed("https://www.deezer.com/fr/album/302127")).toMatchObject({
      provider: "deezer",
      kind: "audio",
      embedUrl: "https://widget.deezer.com/widget/dark/album/302127",
    });
  });

  it("builds SoundCloud player embeds from public links", () => {
    const embed = resolveMediaEmbed("https://soundcloud.com/forss/flickermood");

    expect(embed).toMatchObject({
      provider: "soundcloud",
      kind: "audio",
      height: 166,
    });
    expect(embed?.embedUrl).toContain("https://w.soundcloud.com/player/");
    expect(embed?.embedUrl).toContain("url=https%3A%2F%2Fsoundcloud.com%2Fforss%2Fflickermood");
  });

  it("ignores unsupported or malformed URLs", () => {
    expect(resolveMediaEmbed("https://example.com/video/1")).toBeNull();
    expect(resolveMediaEmbed("javascript:alert(1)")).toBeNull();
    expect(resolveMediaEmbed("not a url")).toBeNull();
  });
});
