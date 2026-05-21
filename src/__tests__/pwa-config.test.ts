import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import packageJson from "../../package.json";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

describe("PWA configuration", () => {
  it("keeps the manifest installable and aligned with the MVP app entry", () => {
    const appManifest = manifest();
    const iconSizes = new Set(appManifest.icons?.map((icon) => icon.sizes));
    const maskableIconSizes = new Set(
      appManifest.icons
        ?.filter((icon) => icon.purpose === "maskable")
        .map((icon) => icon.sizes),
    );

    expect(appManifest.name).toBe("Le Marché Libre");
    expect(appManifest.short_name).toBe("MarchéLibre");
    expect(appManifest.start_url).toBe("/chat");
    expect(appManifest.scope).toBe("/");
    expect(appManifest.display).toBe("standalone");
    expect(appManifest.background_color).toBe("#0F1115");
    expect(appManifest.theme_color).toBe("#0F1115");
    expect(appManifest.prefer_related_applications).toBe(false);
    expect(appManifest.launch_handler).toEqual({ client_mode: "focus-existing" });
    expect(iconSizes).toContain("192x192");
    expect(iconSizes).toContain("512x512");
    expect(maskableIconSizes).toContain("192x192");
    expect(maskableIconSizes).toContain("512x512");
    expect(appManifest.screenshots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ form_factor: "narrow", sizes: "1080x1920" }),
        expect.objectContaining({ form_factor: "wide", sizes: "1280x720" }),
      ]),
    );
    expect(appManifest.shortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Ouvrir le chat", url: "/chat" }),
        expect.objectContaining({ name: "Demander l'accès", url: "/?auth=access" }),
      ]),
    );
  });

  it("keeps the service worker detectable and versioned with package.json", () => {
    const serviceWorker = source("public/sw.js");

    expect(serviceWorker).toContain(`marchelibre-static-v${packageJson.version}`);
    expect(serviceWorker).toContain('self.addEventListener("fetch"');
    expect(serviceWorker).toContain("handleNavigationRequest");
    expect(serviceWorker).toContain("handleStaticRequest");
  });

  it("registers the root-scoped service worker without browser HTTP-cache reuse", () => {
    const runtimeProvider = source("src/components/runtime/app-runtime-provider.tsx");

    expect(runtimeProvider).toContain('navigator.serviceWorker.register("/sw.js"');
    expect(runtimeProvider).toContain('scope: "/"');
    expect(runtimeProvider).toContain('updateViaCache: "none"');
  });
});
