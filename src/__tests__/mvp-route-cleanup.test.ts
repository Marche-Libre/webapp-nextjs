import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

describe("MVP route cleanup", () => {
  it("routes approved defaults to chat", () => {
    expect(source("src/lib/supabase/middleware.ts")).toContain('url.pathname = "/chat"');
    expect(source("src/app/auth/callback/route.ts")).toContain('let redirectPath = "/chat"');
    expect(source("src/app/auth/callback/route.ts")).not.toContain('"/onboarding"');
  });

  it("keeps /onboarding manually accessible while routing waiting approval, admin fallback, settings, and logo to chat", () => {
    expect(source("src/app/onboarding/page.tsx")).not.toContain(
      'if (profile.onboarding_completed) redirect("/chat")',
    );
    expect(source("src/components/onboarding/onboarding-wizard.tsx")).toContain('link: "/chat"');
    expect(source("src/components/onboarding/onboarding-wizard.tsx")).toContain('window.location.href = "/chat"');
    expect(source("src/app/(auth)/en-attente/page.tsx")).toContain('redirect("/chat")');
    expect(source("src/components/sponsorship/status-poller.tsx")).toContain('router.push("/chat")');
    expect(source("src/app/(app)/admin/layout.tsx")).toContain('redirect("/chat")');
    expect(source("src/components/layout/settings-shell.tsx")).toContain('router.push("/chat")');
    expect(source("src/components/layout/sidebar.tsx")).toContain('href="/chat"');
  });

  it("keeps settings routes while rendering a vertical mobile account nav with install priority", () => {
    const appShell = source("src/components/layout/app-shell.tsx");
    const settingsShell = source("src/components/layout/settings-shell.tsx");
    const installPanel = source("src/components/runtime/app-install-update-panel.tsx");

    expect(appShell).toContain("<SettingsShell profile={profile}>{children}</SettingsShell>");
    expect(settingsShell).not.toContain("overflow-x-auto scrollbar-hide");
    expect(settingsShell).toContain(">Compte</p>");
    expect(settingsShell).toContain('<AppInstallUpdatePanel variant="priority" hideWhenIdle />');
    expect(installPanel).toContain('hideWhenIdle && !hasAction');
    expect(settingsShell).toContain('label: "Mon profil"');
    expect(settingsShell).toContain('href: "/profil"');
    expect(settingsShell).toContain('label: "Notifications"');
    expect(settingsShell).toContain('href: "/notifications"');
    expect(settingsShell).toContain('label: "Parrainages"');
    expect(settingsShell).toContain('href: "/parrainages"');
  });

  it("removes the deprecated channel-list back affordance from chat", () => {
    const channelList = source("src/components/chat/channel-list.tsx");

    expect(channelList).not.toContain('href="/chat"');
    expect(channelList).not.toContain("ArrowLeft");
    expect(channelList).not.toContain('title="Retour"');
  });

  it("default-denies protected app rendering unless the profile is approved", () => {
    const appLayout = source("src/app/(app)/layout.tsx");
    const renderShellBlock = appLayout.slice(
      appLayout.indexOf('profile.status !== "approved"'),
      appLayout.indexOf("return <AppShell"),
    );

    expect(renderShellBlock).toContain('redirect("/en-attente")');
    expect(renderShellBlock).not.toContain('profile.onboarding_completed !== true');
    expect(renderShellBlock).not.toContain('redirect("/onboarding")');
  });

  it("explains approved-user onboarding as setup work rather than an access error", () => {
    const onboardingWizard = source("src/components/onboarding/onboarding-wizard.tsx");

    expect(onboardingWizard).toContain("Finalisez votre profil");
    expect(onboardingWizard).toContain("identité, expertise, localisation et présentation");
    expect(onboardingWizard).not.toContain("Acces refuse");
    expect(onboardingWizard).not.toContain("Demande en cours d&apos;examen");
  });

  it("finishes onboarding from search without an invite step", () => {
    const onboardingWizard = source("src/components/onboarding/onboarding-wizard.tsx");

    expect(onboardingWizard).toContain("const TOTAL_STEPS = 7");
    expect(onboardingWizard).toContain('label: "Recherche"');
    expect(onboardingWizard).toContain("Accéder au réseau");
    expect(onboardingWizard).not.toContain('label: "Inviter"');
    expect(onboardingWizard).not.toContain("Invitez un professionnel");
    expect(onboardingWizard).not.toContain("rejoindre?ref=");
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

  it("redirects direct Forum and publication routes to chat", () => {
    for (const routeFile of [
      "src/app/(app)/forum/page.tsx",
      "src/app/(app)/forum/[categorySlug]/page.tsx",
      "src/app/(app)/forum/posts/[postId]/page.tsx",
      "src/app/(app)/forum/posts/nouveau/page.tsx",
    ]) {
      const routeSource = source(routeFile);

      expect(routeSource).toContain('import { redirect } from "next/navigation"');
      expect(routeSource).toContain('redirect("/chat")');
      expect(routeSource).not.toContain("forum_posts");
      expect(routeSource).not.toContain("forum_categories");
      expect(routeSource).not.toContain("NewPostForm");
    }
  });

  it("does not expose publications through member profiles, chat embeds, or dashboard widgets", () => {
    const memberProfileDrawer = source("src/components/membres/member-profile-drawer.tsx");
    const memberProfile = source("src/components/membres/member-profile.tsx");
    const messageBubble = source("src/components/chat/message-bubble.tsx");
    const postEmbed = source("src/components/chat/post-embed.tsx");
    const dashboard = source("src/app/(app)/tableau-de-bord/page.tsx");

    expect(memberProfileDrawer).not.toContain("forum_posts");
    expect(memberProfileDrawer).not.toContain("fetchRecentPosts");
    expect(memberProfileDrawer).not.toContain("Publications récentes");
    expect(memberProfile).not.toContain("Publications récentes");
    expect(memberProfile).not.toContain('href={`/forum/posts/${post.id}`}');
    expect(messageBubble).not.toContain("PostEmbed");
    expect(messageBubble).not.toContain("FORUM_LINK_REGEX");
    expect(postEmbed).not.toContain("forum_posts");
    expect(postEmbed).toContain("return null");
    expect(dashboard).not.toContain("forum_posts");
    expect(dashboard).not.toContain("Derniers posts du forum");
    expect(dashboard).not.toContain('href="/forum"');
  });

  it("keeps public member profile identity linked to the X profile", () => {
    const memberProfileDrawer = source("src/components/membres/member-profile-drawer.tsx");
    const memberProfile = source("src/components/membres/member-profile.tsx");

    expect(memberProfileDrawer).toContain("https://x.com/");
    expect(memberProfileDrawer).toContain("xProfileUrl");
    expect(memberProfile).toContain("https://x.com/");
    expect(memberProfile).toContain("xProfileUrl");
  });

  it("does not expose member report or block controls", () => {
    const memberProfileDrawer = source("src/components/membres/member-profile-drawer.tsx");
    const memberProfile = source("src/components/membres/member-profile.tsx");
    const membersContent = source("src/components/membres/membres-content.tsx");

    for (const profileSource of [memberProfileDrawer, memberProfile, membersContent]) {
      expect(profileSource).not.toContain("ReportBlockMenu");
      expect(profileSource).not.toContain("MemberMenu");
      expect(profileSource).not.toContain("Signaler");
      expect(profileSource).not.toContain("Bloquer");
      expect(profileSource).not.toContain("user_reports");
      expect(profileSource).not.toContain("user_blocks");
    }
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

  it("shows pending users an explicit sponsorship boundary while access stays blocked", () => {
    const waitingPage = source("src/app/(auth)/en-attente/page.tsx");

    expect(waitingPage).toContain("En attente de parrainage");
    expect(waitingPage).toContain("WaitingPageClient");
    expect(waitingPage).toContain("sponsorship_requests");
    expect(waitingPage).not.toContain("Demande en cours d&apos;examen");
    expect(waitingPage).not.toContain("Validation manuelle");
    expect(waitingPage).not.toContain("Vous avez une invitation !");
  });

  it("keeps public legal and acquisition pages outside auth and app-home redirects", () => {
    const middleware = source("src/lib/supabase/middleware.ts");
    const approvedRedirect = middleware.slice(
      middleware.indexOf(
        "Approved members can access the app even when onboarding is incomplete.",
      ),
      middleware.indexOf("return withSecurityHeaders(supabaseResponse);"),
    );

    for (const route of ["/mentions-legales", "/confidentialite", "/cgu"]) {
      expect(middleware).toContain(`"${route}"`);
      expect(approvedRedirect).not.toContain(`"${route}"`);
    }

    expect(middleware).toContain("const legalRoutes =");
    expect(middleware).toContain("const acquisitionRoutes =");
    expect(middleware).toContain('"/acces-prive"');
    expect(middleware).toContain('"/landing1"');
    expect(middleware).toContain('"/landing3"');
    expect(middleware).toContain("!isAcquisitionRoute");
    expect(approvedRedirect).not.toContain('"/acces-prive"');
    expect(approvedRedirect).not.toContain('"/landing1"');
    expect(approvedRedirect).not.toContain('"/landing3"');
  });

  it("keeps public non-private route handlers outside admission-state redirects", () => {
    const middleware = source("src/lib/supabase/middleware.ts");

    expect(middleware).toContain('const publicNonPrivateRouteHandlers = ["/api/geo/cities"]');
    expect(middleware).toContain("!isPublicNonPrivateRouteHandler");
  });
});
