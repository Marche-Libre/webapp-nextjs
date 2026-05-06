import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

describe("MVP route cleanup", () => {
  it("routes approved and onboarded defaults to chat", () => {
    expect(source("src/lib/supabase/middleware.ts")).toContain('url.pathname = "/chat"');
    expect(source("src/app/auth/callback/route.ts")).toContain('let redirectPath = "/chat"');
    expect(source("src/app/auth/callback/route.ts")).toContain('profile.onboarding_completed ? "/chat" : "/onboarding"');
  });

  it("routes onboarding, waiting approval, admin fallback, settings, logo, and chat back to chat", () => {
    expect(source("src/app/onboarding/page.tsx")).toContain('redirect("/chat")');
    expect(source("src/components/onboarding/onboarding-wizard.tsx")).toContain('link: "/chat"');
    expect(source("src/components/onboarding/onboarding-wizard.tsx")).toContain('window.location.href = "/chat"');
    expect(source("src/app/(auth)/en-attente/page.tsx")).toContain('profile.onboarding_completed ? "/chat" : "/onboarding"');
    expect(source("src/components/sponsorship/status-poller.tsx")).toContain('router.push("/chat")');
    expect(source("src/app/(app)/admin/layout.tsx")).toContain('redirect("/chat")');
    expect(source("src/components/layout/settings-shell.tsx")).toContain('router.push("/chat")');
    expect(source("src/components/layout/sidebar.tsx")).toContain('href="/chat"');
    expect(source("src/components/chat/channel-list.tsx")).toContain('href="/chat"');
  });

  it("keeps Chat visible while hiding Forum and Annuaire from primary navigation", () => {
    const sidebar = source("src/components/layout/sidebar.tsx");

    expect(sidebar).toContain('{ name: "Chat", href: "/chat"');
    expect(sidebar).not.toContain('{ name: "Forum", href: "/forum"');
    expect(sidebar).not.toContain('{ name: "Annuaire", href: "/membres"');
  });

  it("does not expose public Beta 1 promises for Forum, Annuaire, or offers/jobs", () => {
    const home = source("src/app/page.tsx");
    const authLayout = source("src/app/(auth)/layout.tsx");
    const features = source("src/components/home/animated-features.tsx");
    const steps = source("src/components/home/animated-steps.tsx");

    expect(home).not.toContain('href="/forum"');
    expect(home).not.toContain('href="/membres"');
    expect(authLayout).not.toContain("Annuaire professionnel");
    expect(authLayout).not.toContain("Forum privé");
    expect(features).not.toContain("Annuaire de profils");
    expect(features).not.toContain("Offres d&apos;emploi");
    expect(features).not.toContain("offres d&apos;emploi");
    expect(steps).not.toContain("Annonces, annuaire, offres");
  });

  it("hides channel proposal UI from chat", () => {
    const channelList = source("src/components/chat/channel-list.tsx");

    expect(channelList).not.toContain("channel_proposals");
    expect(channelList).not.toContain("channel_votes");
    expect(channelList).not.toContain("Proposer un salon");
    expect(channelList).not.toContain("Propositions");
  });

  it("uses canonical chat slug links where message search already has a slug", () => {
    const header = source("src/components/layout/header.tsx");

    expect(header).not.toContain("/chat?channel=");
    expect(header).toContain("/chat/${channel.slug}");
  });

  it("does not promote Forum through active global search or onboarding", () => {
    const header = source("src/components/layout/header.tsx");
    const onboardingPage = source("src/app/onboarding/page.tsx");
    const onboardingWizard = source("src/components/onboarding/onboarding-wizard.tsx");

    expect(header).not.toContain("forum_posts");
    expect(header).not.toContain("/forum/posts/");
    expect(header).not.toContain('type: "post"');
    expect(onboardingPage).not.toContain("forum_categories");
    expect(onboardingWizard).not.toContain("forum_posts");
    expect(onboardingWizard).not.toContain("presentationsCategoryId");
    expect(onboardingWizard).not.toContain("espace Pr\u00e9sentations");
  });

  it("shows rejected users an explicit refused state instead of a silent login redirect", () => {
    const appLayout = source("src/app/(app)/layout.tsx");
    const middleware = source("src/lib/supabase/middleware.ts");
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");

    expect(appLayout).toContain('redirect("/en-attente")');
    expect(middleware).toContain('pathname !== "/connexion"');
    expect(waitingPage).toContain('profile.status === "rejected"');
    expect(waitingPage).toContain("Votre demande d&apos;acces n&apos;a pas ete retenue");
    expect(waitingPage).toContain("L&apos;acces aux espaces membres reste indisponible");
    expect(waitingPage).not.toContain('if (profile.status === "rejected") {\n    redirect("/connexion");\n  }');
  });

  it("shows pending users an explicit manual-review boundary while access stays blocked", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");
    const invitationBranch = waitingPage.slice(
      waitingPage.indexOf("Vous avez une invitation !"),
      waitingPage.indexOf(") : ("),
    );

    expect(waitingPage).toContain("Demande en cours d&apos;examen");
    expect(waitingPage).toContain("Validation manuelle");
    expect(waitingPage).toContain("L&apos;acces aux espaces membres reste bloque tant que votre demande n&apos;est pas approuvee");
    expect(invitationBranch).toContain("Validation manuelle");
    expect(invitationBranch).toContain("L&apos;acces aux espaces membres reste bloque tant que votre demande n&apos;est pas approuvee");
  });

  it("keeps public legal pages outside auth and app-home redirects", () => {
    const middleware = source("src/lib/supabase/middleware.ts");
    const fullyOnboardedRedirect = middleware.slice(
      middleware.indexOf("Fully onboarded users"),
      middleware.indexOf("// Security headers"),
    );

    for (const route of ["/mentions-legales", "/confidentialite", "/cgu"]) {
      expect(middleware).toContain(`"${route}"`);
      expect(fullyOnboardedRedirect).not.toContain(`"${route}"`);
    }

    expect(middleware).toContain("const legalRoutes =");
    expect(middleware).toContain("if (user && !isLegalRoute)");
  });
});
