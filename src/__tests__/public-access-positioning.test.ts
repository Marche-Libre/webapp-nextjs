import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(filePath: string) {
  return readFileSync(path.join(root, filePath), "utf8");
}

describe("public access positioning", () => {
  it("frames public landing access as a private beta with manual review", () => {
    const landingHeader = source("src/components/home/landing-header.tsx");
    const floatingHeader = source("src/components/home/floating-header.tsx");
    const hero = source("src/components/home/animated-hero.tsx");
    const cta = source("src/components/home/animated-cta.tsx");
    const footer = source("src/app/page.tsx");

    const publicCopy = [landingHeader, floatingHeader, hero, cta, footer].join(
      "\n",
    );

    expect(publicCopy).toContain("Demander l’accès");
    expect(publicCopy).toContain("bêta privée");
    expect(publicCopy).toContain("revue manuellement");
    expect(publicCopy).not.toContain("S&apos;inscrire gratuitement");
    expect(publicCopy).not.toContain("Validation sous 24h");
    expect(publicCopy).not.toContain("Créer mon compte");
    expect(footer).not.toContain('href="/chat"');
  });

  it("keeps access entry OAuth copy clear about admission requests", () => {
    const rejoindre = source("src/app/rejoindre/page.tsx");
    const inscription = source("src/app/(auth)/inscription/page.tsx");
    const authLayout = source("src/app/(auth)/layout.tsx");
    const authCopy = `${rejoindre}\n${inscription}\n${authLayout}`;

    expect(authCopy).toContain("Rejoindre avec X");
    expect(authCopy).toContain("demande d’admission");
    expect(authCopy).toContain("revue manuellement");
    expect(authCopy).not.toContain("Chaque professionnel est parrainé");
    expect(authCopy).not.toContain("S&apos;inscrire avec X");
    expect(authCopy).not.toContain("automatiquement rattaché");
    expect(rejoindre).toContain("ml-referral");
    expect(rejoindre).toContain("getAuthCallbackUrl()");
    expect(inscription).toContain("getAuthCallbackUrl()");
  });

  it("does not market parked discovery or marketplace features as current public promises", () => {
    const hero = source("src/components/home/animated-hero.tsx");
    const features = source("src/components/home/animated-features.tsx");
    const professions = source("src/components/home/animated-professions.tsx");
    const metadata = source("src/app/layout.tsx");

    expect(hero).not.toContain("Inscrivez-vous pour voir les profils complets");
    expect(hero).not.toContain("Créez un compte pour y accéder");
    expect(hero).not.toContain("Explorer les profils réservés aux membres approuvés");
    expect(hero).not.toContain("Les profils détaillés sont réservés aux membres approuvés");
    expect(features).not.toContain(
      "Trouvez des professionnels près de chez vous",
    );
    expect(professions).not.toContain("Des centaines de");
    expect(professions).not.toContain("vous trouverez des pairs vérifiés");
    expect(metadata).not.toContain("Trouvez des missions");
    expect(metadata).not.toContain("publiez vos services");
    expect(metadata).toContain("club privé");
    expect(metadata).toContain("admission manuelle");
  });

  it("keeps legal pages public while aligning MVP scope and cookies", () => {
    const cgu = source("src/app/cgu/page.tsx");
    const privacy = source("src/app/confidentialite/page.tsx");
    const cookieBanner = source("src/components/ui/cookie-banner.tsx");
    const middleware = source("src/lib/supabase/middleware.ts");

    expect(cgu).toContain("club privé en bêta fermée");
    expect(cgu).toContain("chat privé entre membres approuvés");
    expect(cgu).not.toContain(
      "La Plateforme propose les fonctionnalités suivantes",
    );
    expect(privacy).toContain("demande d’admission");
    expect(privacy).toContain("chat privé");
    expect(privacy).not.toContain(
      "Annuaire des membres et mise en relation professionnelle",
    );
    expect(privacy).not.toContain("Fonctionnalités de chat et forum");
    expect(cookieBanner).not.toContain("analyser le trafic");
    expect(cookieBanner).toContain("cookies nécessaires");
    expect(cookieBanner).toContain("Compris");
    expect(cookieBanner).not.toContain("Refuser");

    for (const route of ["/mentions-legales", "/confidentialite", "/cgu"]) {
      expect(middleware).toContain(`"${route}"`);
    }
  });
});
