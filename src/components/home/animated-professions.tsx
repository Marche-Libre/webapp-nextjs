"use client";

import { FadeIn } from "@/components/ui/motion";

const categories: { label: string; professions: string[] }[] = [
  {
    label: "Santé",
    professions: [
      "Médecin généraliste", "Médecin spécialiste", "Chirurgien", "Dentiste", "Orthodontiste",
      "Kinésithérapeute", "Ostéopathe", "Podologue", "Orthophoniste", "Orthoptiste",
      "Sage-femme", "Infirmier libéral", "Psychologue", "Psychiatre", "Psychomotricien",
      "Diététicien", "Ergothérapeute", "Chiropracteur", "Ophtalmologue", "Dermatologue",
      "Cardiologue", "Radiologue", "Pharmacien", "Biologiste médical", "Vétérinaire",
      "Audioprothésiste", "Opticien", "Prothésiste dentaire", "Naturopathe", "Sophrologue",
      "Hypnothérapeute", "Acupuncteur",
    ],
  },
  {
    label: "Droit & Justice",
    professions: [
      "Avocat", "Avocat d'affaires", "Avocat pénaliste", "Avocat fiscaliste", "Avocat en droit social",
      "Avocat en droit immobilier", "Avocat en droit de la famille", "Notaire", "Huissier de justice",
      "Commissaire de justice", "Mandataire judiciaire", "Administrateur judiciaire",
      "Médiateur", "Arbitre", "Juriste indépendant", "Conseil juridique",
      "Greffier indépendant", "Avocat en propriété intellectuelle", "Avocat en droit du numérique",
    ],
  },
  {
    label: "Finance & Comptabilité",
    professions: [
      "Expert-comptable", "Commissaire aux comptes", "Conseiller en gestion de patrimoine",
      "Courtier en assurances", "Courtier en crédit", "Analyste financier", "Contrôleur de gestion",
      "DAF externalisé", "Trésorier indépendant", "Fiscaliste", "Auditeur indépendant",
      "Conseiller en investissement", "Gestionnaire de patrimoine", "Actuaire",
      "Courtier en bourse", "Conseiller financier", "Expert en fusion-acquisition",
    ],
  },
  {
    label: "Tech & Digital",
    professions: [
      "Développeur web", "Développeur mobile", "Développeur full-stack", "Développeur back-end",
      "Développeur front-end", "Data scientist", "Data analyst", "Data engineer",
      "DevOps", "Ingénieur cloud", "Architecte logiciel", "CTO freelance",
      "UX Designer", "UI Designer", "Product Designer", "Directeur artistique digital",
      "Chef de projet digital", "Product Manager", "Scrum Master", "Consultant IT",
      "Expert cybersécurité", "Administrateur système", "Consultant ERP", "Consultant CRM",
      "Intégrateur web", "Webmaster", "SEO freelance", "Growth hacker",
      "Consultant data", "Ingénieur IA", "Développeur blockchain", "QA Engineer",
    ],
  },
  {
    label: "Conseil & Stratégie",
    professions: [
      "Consultant en stratégie", "Consultant en management", "Consultant en organisation",
      "Consultant en transformation digitale", "Consultant en conduite du changement",
      "Consultant RH", "Coach professionnel", "Coach en leadership", "Consultant en recrutement",
      "Chasseur de têtes", "Consultant en communication", "Consultant en marketing",
      "Consultant en RSE", "Consultant en développement durable", "Consultant en innovation",
      "Facilitateur", "Formateur professionnel", "Consultant en supply chain",
      "Consultant en achats", "Consultant en qualité",
    ],
  },
  {
    label: "Architecture & Immobilier",
    professions: [
      "Architecte", "Architecte d'intérieur", "Architecte DPLG", "Urbaniste",
      "Paysagiste", "Géomètre-expert", "Diagnostiqueur immobilier",
      "Expert immobilier", "Maître d'œuvre", "Économiste de la construction",
      "Décorateur d'intérieur", "Home stager", "Agent immobilier indépendant",
      "Chasseur immobilier", "Mandataire immobilier", "BET Structure",
      "BET Fluides", "Thermicien", "Acousticien",
    ],
  },
  {
    label: "Communication & Création",
    professions: [
      "Graphiste", "Directeur artistique", "Illustrateur", "Photographe",
      "Vidéaste", "Monteur vidéo", "Motion designer", "Animateur 3D",
      "Rédacteur web", "Copywriter", "Journaliste indépendant", "Attaché de presse",
      "Chargé de communication", "Community manager", "Social media manager",
      "Consultant en relations publiques", "Traducteur", "Interprète",
      "Correcteur-relecteur", "Concepteur-rédacteur", "Voix off",
      "Podcaster", "Influenceur professionnel", "Brand strategist",
    ],
  },
  {
    label: "Ingénierie & Industrie",
    professions: [
      "Ingénieur conseil", "Ingénieur structure", "Ingénieur génie civil",
      "Ingénieur environnement", "Ingénieur qualité", "Ingénieur sécurité",
      "Ingénieur procédés", "Ingénieur mécanique", "Ingénieur électronique",
      "Bureau d'études", "Expert technique", "Consultant industriel",
      "Responsable QHSE freelance", "Ergonome", "Ingénieur son",
      "Ingénieur agroalimentaire", "Métrologue",
    ],
  },
  {
    label: "Formation & Éducation",
    professions: [
      "Formateur indépendant", "Coach scolaire", "Tuteur privé",
      "Consultant en ingénierie pédagogique", "Concepteur e-learning",
      "Professeur particulier", "Enseignant vacataire", "Mentor professionnel",
      "Consultant en orientation", "Formateur en langues", "Préparateur concours",
      "Consultant en formation professionnelle",
    ],
  },
  {
    label: "Artisanat & Services",
    professions: [
      "Ébéniste", "Tapissier", "Relieur", "Restaurateur d'art", "Céramiste",
      "Bijoutier-joaillier", "Horloger", "Couturier", "Styliste",
      "Chef cuisinier freelance", "Traiteur", "Sommelier", "Boulanger artisanal",
      "Fleuriste événementiel", "Wedding planner", "Organisateur d'événements",
      "Personal shopper", "Concierge privé",
    ],
  },
  {
    label: "Sport & Bien-être",
    professions: [
      "Coach sportif", "Préparateur physique", "Nutritionniste du sport",
      "Professeur de yoga", "Professeur de pilates", "Réflexologue",
      "Praticien en médecine chinoise", "Masseur bien-être",
      "Professeur de méditation", "Coach en développement personnel",
      "Thérapeute holistique", "Aromathérapeute",
    ],
  },
];

// Flatten all professions for the marquee
const allProfessions = categories.flatMap((c) => c.professions);

// Split into 4 rows for the scrolling effect
function chunkArray<T>(arr: T[], chunks: number): T[][] {
  const result: T[][] = Array.from({ length: chunks }, () => []);
  arr.forEach((item, i) => result[i % chunks].push(item));
  return result;
}

const rows = chunkArray(allProfessions, 4);

export function AnimatedProfessions() {
  return (
    <section className="py-20 bg-base-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-sm font-bold text-accent tracking-wide uppercase mb-3">
              Tous les métiers
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
              Des centaines de <span className="highlight">professions</span> représentées
            </h2>
            <p className="mt-4 text-base-content/50 text-sm leading-relaxed max-w-lg mx-auto">
              Avocats, développeurs, architectes, médecins, consultants, designers…
              <br />
              Quel que soit votre métier, vous trouverez des pairs vérifiés.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Scrolling rows */}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="relative">
            <div
              className="flex gap-3 w-max animate-[marquee_90s_linear_infinite]"
              style={{
                animationDirection: i % 2 === 0 ? "normal" : "reverse",
                animationDuration: `${140 + i * 20}s`,
              }}
            >
              {/* Duplicate for seamless loop */}
              {[...row, ...row].map((profession, j) => (
                <span
                  key={`${i}-${j}`}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-base-200 border border-base-300 text-[13px] text-base-content/70 font-medium whitespace-nowrap hover:bg-base-300 hover:text-base-content transition-colors duration-150"
                >
                  {profession}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
