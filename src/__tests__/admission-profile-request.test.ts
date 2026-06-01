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
      existsSync(path.join(root, "src/app/(auth)/en-attente/actions.ts")),
    ).toBe(false);
    expect(
      existsSync(path.join(root, "src/components/auth/admission-profile-form.tsx")),
    ).toBe(false);
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
  });

  it("keeps sponsor approval as the approval boundary in the database trigger", () => {
    const sponsorshipApprovalMigration = source(
      "supabase/migrations/20260520192812_approve_profile_on_sponsorship_request_approval.sql",
    );
    const triggerMigration = source(
      "supabase/migrations/20260503065247_harden_authorization_boundaries.sql",
    );

    expect(sponsorshipApprovalMigration).toContain("sponsor_approved = TRUE");
    expect(sponsorshipApprovalMigration).toContain("status = 'approved'");
    expect(triggerMigration).toContain(
      "CREATE TRIGGER confirm_sponsorship_request",
    );
  });
});
