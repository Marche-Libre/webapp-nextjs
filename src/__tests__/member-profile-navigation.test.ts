import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("member profile navigation", () => {
  it("removes the member profile detail route in favor of the drawer", () => {
    expect(existsSync("src/app/(app)/membres/[id]/page.tsx")).toBe(false);
    expect(existsSync("src/app/(app)/membres/[id]/loading.tsx")).toBe(false);
  });

  it("keeps member profile triggers in a drawer instead of linking to the old detail route", () => {
    const content = source("src/components/membres/membres-content.tsx");
    const hoverCard = source("src/components/chat/user-hover-card.tsx");
    const header = source("src/components/layout/header.tsx");

    expect(content).not.toContain("href={`/membres/${m.id}`}");
    expect(hoverCard).not.toContain("href={`/membres/${authorId}`}");
    expect(header).not.toContain("href: `/membres/${m.id}`");
    expect(content).toContain("MemberProfileTrigger");
    expect(hoverCard).not.toContain("MemberProfileTrigger");
    expect(hoverCard).toContain("HoverCardProfileAction");
    expect(header).toContain("MemberProfileTrigger");
  });

  it("keeps Voir profil actions available", () => {
    const content = source("src/components/membres/membres-content.tsx");
    const hoverCard = source("src/components/chat/user-hover-card.tsx");

    expect(content).toContain("Voir profil");
    expect(hoverCard).toContain("Voir le profil");
  });

  it("filters filled member profiles with specialty_ids instead of the removed specialty_id column", () => {
    const listPage = source("src/app/(app)/membres/page.tsx");

    expect(listPage).toContain("Array.isArray(m.specialty_ids)");
    expect(listPage).not.toMatch(/m\.specialty_id\b/);
  });
});
