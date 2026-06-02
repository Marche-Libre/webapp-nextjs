import { existsSync, readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

describe("pending sponsorship gate", () => {
  it("keeps the pending boundary focused on sponsorship only", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");
    const onboardingPage = source("src/app/onboarding/page.tsx");

    expect(waitingPage).toContain("WaitingPageClient");
    expect(waitingPage).toContain("SignOutButton");
    expect(waitingPage).toContain("sponsorship_requests");
    expect(waitingPage).toContain("En attente de parrainage");
    expect(waitingPage).toContain("Compte X detecte");
    expect(waitingPage).not.toContain("Indiquez l&apos;identifiant X");
    expect(waitingPage).not.toContain("espaces membres reste bloque");
    expect(waitingPage).not.toContain("AdmissionProfileForm");
    expect(waitingPage).not.toContain("specialty_categories");
    expect(waitingPage).not.toContain("specialties(*)");
    expect(waitingPage).not.toContain("Formulaire indisponible");
    expect(onboardingPage).toContain(
      'if (profile.status !== "approved") redirect("/en-attente")',
    );
  });

  it("uses a real sign out action instead of linking to the login route", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");
    const signOutButton = source("src/components/auth/sign-out-button.tsx");

    expect(waitingPage).not.toContain('href="/connexion"');
    expect(signOutButton).toContain("supabase.auth.signOut()");
    expect(signOutButton).toContain('router.replace("/?auth=access")');
  });

  it("removes the pending profile form implementation", () => {
    expect(
      existsSync(path.join(root, "src/components/auth/admission-profile-form.tsx")),
    ).toBe(false);
    expect(
      existsSync(path.join(root, "src/lib/admission-profile-state.ts")),
    ).toBe(false);
  });

  it("creates sponsorship requests through an authenticated server action", () => {
    const action = source("src/app/(auth)/en-attente/actions.ts");
    const sponsorForm = source("src/components/sponsorship/sponsor-request-form.tsx");

    expect(action).toContain('"use server"');
    expect(action).toContain("export async function submitSponsorshipRequest");
    expect(action).toContain("createClient()");
    expect(action).toContain("supabase.auth.getUser()");
    expect(action).toContain('profile.status !== "pending"');
    expect(action).toContain("createSponsorshipRequestForHandle");
    expect(action).toContain('revalidatePath("/en-attente")');
    expect(sponsorForm).toContain("submitSponsorshipRequest");
    expect(sponsorForm).not.toContain("createSponsorshipRequestForHandle");
    expect(sponsorForm).not.toContain("requesterId");
  });

  it("does not offer a no-sponsor admin-review branch", () => {
    const waitingClient = source(
      "src/components/sponsorship/waiting-page-client.tsx",
    );
    const sponsorForm = source("src/components/sponsorship/sponsor-request-form.tsx");
    const requestHelper = source("src/lib/sponsorship/requests.ts");

    expect(waitingClient).toContain("SponsorRequestForm");
    expect(waitingClient).not.toContain("Je ne connais personne");
    expect(waitingClient).not.toContain("Un administrateur examinera");
    expect(sponsorForm).not.toContain("admin finalisera");
    expect(sponsorForm).not.toContain("validation par un administrateur");
    expect(sponsorForm).not.toContain("Tentative");
    expect(sponsorForm).not.toContain('Badge variant="warning"');
    expect(requestHelper).not.toContain("administrateur examinera");
    expect(requestHelper).not.toContain("max_attempts");
  });

  it("keeps confirmed sponsorship separate from final admission approval", () => {
    const migration = source(
      "supabase/migrations/20260522152018_enforce_confirmed_sponsor_before_admin_approval.sql",
    );
    const functionText = migration.slice(
      migration.indexOf(
        "CREATE OR REPLACE FUNCTION private.confirm_sponsorship_request()",
      ),
      migration.indexOf(
        "CREATE OR REPLACE FUNCTION private.prevent_profile_approval_without_confirmed_sponsor()",
      ),
    );

    expect(functionText).toContain("sponsor_approved = TRUE");
    expect(functionText).not.toMatch(/,\s*status\s*=\s*'approved'/i);
    expect(migration).toContain(
      "profile_approval_requires_confirmed_sponsor",
    );
  });
});
