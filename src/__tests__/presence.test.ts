import { readFileSync, readdirSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { formatLastActivityLabel } from "@/lib/presence";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

function migrationSources() {
  const dir = path.join(root, "supabase/migrations");
  return readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => ({
      fileName,
      text: readFileSync(path.join(dir, fileName), "utf8"),
    }));
}

describe("presence labels", () => {
  const now = new Date("2026-05-20T15:00:00.000Z");

  it("formats recent activity without exact time", () => {
    expect(formatLastActivityLabel("2026-05-20T14:30:00.000Z", now)).toBe("Derniere activite recemment");
  });

  it("formats same-day activity without exact time", () => {
    expect(formatLastActivityLabel("2026-05-20T08:00:00.000Z", now)).toBe("Derniere activite aujourd'hui");
  });

  it("formats week activity without exact time", () => {
    expect(formatLastActivityLabel("2026-05-17T15:00:00.000Z", now)).toBe("Derniere activite cette semaine");
  });

  it("formats older activity without exact time", () => {
    expect(formatLastActivityLabel("2026-05-01T15:00:00.000Z", now)).toBe(
      "Derniere activite il y a plus d'une semaine",
    );
  });

  it("hides missing or invalid activity", () => {
    expect(formatLastActivityLabel(null, now)).toBeNull();
    expect(formatLastActivityLabel("not-a-date", now)).toBeNull();
  });
});

describe("presence implementation boundaries", () => {
  it("adds user_presence without touching profile updated_at semantics", () => {
    const presenceMigration = migrationSources().find(({ fileName }) => fileName.includes("add_user_presence"));
    const migrationText = presenceMigration?.text ?? "";

    expect(migrationText).toContain("create table if not exists public.user_presence");
    expect(migrationText).toContain("last_seen_at timestamptz not null default now()");
    expect(migrationText).toContain("last_heartbeat_at timestamptz not null default now()");
    expect(migrationText).not.toContain("updated_at");
    expect(migrationText).not.toContain("alter table public.profiles");
    expect(migrationText).not.toContain("profiles_public");
  });

  it("protects presence table and Realtime channel for approved onboarded members", () => {
    const presenceMigration = migrationSources().find(({ fileName }) => fileName.includes("add_user_presence"));
    const migrationText = presenceMigration?.text ?? "";

    expect(migrationText).toContain("alter table public.user_presence enable row level security");
    expect(migrationText).toContain("viewer.status = 'approved'");
    expect(migrationText).toContain("viewer.onboarding_completed = true");
    expect(migrationText).toContain("user_id = (select auth.uid())");
    expect(migrationText).toContain("on realtime.messages");
    expect(migrationText).toContain("(select realtime.topic()) = 'presence:members'");
    expect(migrationText).toContain("realtime.messages.extension = 'presence'");
  });

  it("keeps persisted presence reads out of chat list and hover card surfaces", () => {
    expect(source("src/app/(app)/chat/layout.tsx")).not.toContain("user_presence");
    expect(source("src/components/chat/user-hover-card.tsx")).not.toContain("useIsMemberOnline");
  });

  it("shows live presence in the chat member list without reading presence timestamps", () => {
    const memberList = source("src/components/chat/member-list.tsx");

    expect(memberList).toContain("useIsMemberOnline(member.id)");
    expect(memberList).toContain("bg-emerald-500");
    expect(memberList).not.toContain("fetchUserPresence");
    expect(memberList).not.toContain("last_seen_at");
  });

  it("places provider in AppShell above the member drawer provider", () => {
    const appShell = source("src/components/layout/app-shell.tsx");
    const presenceProviderIndex = appShell.indexOf("<PresenceProvider");
    const drawerProviderIndex = appShell.indexOf("<MemberProfileDrawerProvider>");

    expect(presenceProviderIndex).toBeGreaterThanOrEqual(0);
    expect(drawerProviderIndex).toBeGreaterThan(presenceProviderIndex);
  });

  it("clears stale online members when the Realtime channel disconnects", () => {
    const provider = source("src/components/presence/presence-provider.tsx");

    expect(provider).toContain("DISCONNECTED_SUBSCRIBE_STATUSES");
    expect(provider).toContain('"CHANNEL_ERROR"');
    expect(provider).toContain('"TIMED_OUT"');
    expect(provider).toContain('"CLOSED"');
    expect(provider).toContain("clearOnlineIds();");
  });

  it("marks the current user online after Presence tracking succeeds", () => {
    const provider = source("src/components/presence/presence-provider.tsx");

    expect(provider).toContain("const addOnlineId = useCallback");
    expect(provider).toContain("addOnlineId(currentUserId);");
  });

  it("keeps declared availability separate from live presence in the drawer", () => {
    const drawer = source("src/components/membres/member-profile-drawer.tsx");

    expect(drawer).toContain("Disponibilité déclarée");
    expect(drawer).toContain("Actuellement en ligne");
    expect(drawer).toContain("fetchUserPresence");
    expect(drawer).toContain("loadRequestIdRef");
    expect(drawer).not.toContain("last_seen_at,");
  });
});
