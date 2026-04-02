import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MarchéLibre",
};

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout title="Politique de confidentialité" lastUpdated="2 avril 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>
          La présente Politique de confidentialité décrit la manière dont <strong>MarchéLibre</strong> (ci-après « nous », « notre » ou « la Plateforme ») collecte, utilise, stocke et protège vos données personnelles lorsque vous utilisez notre plateforme accessible à l&apos;adresse <strong>marchelibre.fr</strong>.
        </p>
        <p>
          Nous nous engageons à respecter le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> (Règlement UE 2016/679) ainsi que la <strong>loi n° 78-17 du 6 janvier 1978</strong> relative à l&apos;informatique, aux fichiers et aux libertés (« Loi Informatique et Libertés »).
        </p>
      </section>

      <section>
        <h2>2. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles est :
        </p>
        <ul>
          <li><strong>Projet :</strong> MarchéLibre (projet personnel à but non lucratif)</li>
          <li><strong>Responsable :</strong> Libre Max</li>
          <li><strong>Contact :</strong> via X (Twitter) — <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a></li>
        </ul>
      </section>

      <section>
        <h2>3. Données collectées</h2>
        <p>Nous collectons les catégories de données suivantes :</p>

        <h3>3.1 Données fournies directement par l&apos;utilisateur</h3>
        <ul>
          <li><strong>Données d&apos;identification :</strong> nom complet, identifiant X (Twitter), adresse e-mail</li>
          <li><strong>Données professionnelles :</strong> spécialité/expertise, catégorie professionnelle, sous-spécialité, localisation géographique, biographie, liens professionnels</li>
          <li><strong>Données de contact :</strong> numéro de téléphone (facultatif)</li>
          <li><strong>Contenus générés :</strong> messages dans le chat, publications et réponses sur le forum, annonces</li>
        </ul>

        <h3>3.2 Données collectées automatiquement</h3>
        <ul>
          <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, système d&apos;exploitation, pages consultées, dates et heures de connexion</li>
          <li><strong>Cookies :</strong> cookies techniques nécessaires au fonctionnement de la plateforme et cookies de préférences (thème clair/sombre)</li>
        </ul>

        <h3>3.3 Données provenant de tiers</h3>
        <ul>
          <li><strong>Authentification OAuth :</strong> lorsque vous vous connectez via X (Twitter), nous recevons votre identifiant public, votre nom d&apos;affichage et votre photo de profil</li>
        </ul>
      </section>

      <section>
        <h2>4. Finalités et bases légales du traitement</h2>
        <table className="w-full text-[13px] border-collapse [&_td]:border [&_td]:border-border-subtle [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border-subtle [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-bg-surface [&_th]:text-text-primary [&_th]:font-semibold">
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion de votre compte</td>
              <td>Exécution du contrat (art. 6.1.b RGPD)</td>
            </tr>
            <tr>
              <td>Annuaire des membres et mise en relation professionnelle</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Fonctionnalités de chat et forum</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Système de parrainage et validation des membres</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Notifications (mentions, réponses, demandes de parrainage)</td>
              <td>Intérêt légitime (art. 6.1.f RGPD)</td>
            </tr>
            <tr>
              <td>Modération et lutte contre les abus (signalements, blocages)</td>
              <td>Intérêt légitime</td>
            </tr>
            <tr>
              <td>Amélioration de la plateforme et statistiques anonymisées</td>
              <td>Intérêt légitime</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>5. Destinataires des données</h2>
        <p>Vos données personnelles sont accessibles :</p>
        <ul>
          <li><strong>Aux autres membres approuvés</strong> de la plateforme : votre profil public (identifiant X, spécialité, localisation, biographie) est visible dans l&apos;annuaire</li>
          <li><strong>À notre hébergeur et sous-traitant technique :</strong> Supabase Inc. (hébergement des données, authentification), dont les serveurs sont situés dans l&apos;Union européenne (région eu-west-1)</li>
          <li><strong>À nos administrateurs</strong> pour la modération et la gestion de la plateforme</li>
        </ul>
        <p>
          Nous ne vendons, ne louons et ne partageons pas vos données personnelles avec des tiers à des fins commerciales ou publicitaires.
        </p>
      </section>

      <section>
        <h2>6. Transferts hors UE</h2>
        <p>
          Nos données sont hébergées au sein de l&apos;Union européenne. En cas de transfert vers un pays tiers (par exemple via des sous-traitants techniques), celui-ci sera encadré par des <strong>clauses contractuelles types</strong> approuvées par la Commission européenne ou toute autre garantie appropriée prévue par le RGPD.
        </p>
      </section>

      <section>
        <h2>7. Durée de conservation</h2>
        <ul>
          <li><strong>Données de compte :</strong> conservées pendant toute la durée d&apos;existence de votre compte, puis 3 ans après la suppression du compte</li>
          <li><strong>Messages et contenus du forum :</strong> conservés pendant toute la durée d&apos;existence de votre compte ; pseudonymisés après suppression du compte</li>
          <li><strong>Données de connexion :</strong> 12 mois conformément à la réglementation applicable</li>
          <li><strong>Signalements et blocages :</strong> conservés 2 ans après la résolution</li>
        </ul>
      </section>

      <section>
        <h2>8. Vos droits</h2>
        <p>Conformément au RGPD et à la Loi Informatique et Libertés, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d&apos;accès :</strong> obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
          <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes (directement depuis votre profil ou sur demande)</li>
          <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données dans les cas prévus par la loi</li>
          <li><strong>Droit à la limitation :</strong> obtenir la limitation du traitement dans certaines circonstances</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré, couramment utilisé et lisible par machine</li>
          <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement fondé sur l&apos;intérêt légitime</li>
          <li><strong>Droit de retirer votre consentement :</strong> à tout moment, sans affecter la licéité du traitement antérieur</li>
        </ul>
        <p>
          Pour exercer vos droits, contactez-nous par message privé sur X : <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a>. Nous répondrons dans un délai d&apos;un mois.
        </p>
        <p>
          Vous avez également le droit d&apos;introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>La plateforme utilise des cookies strictement nécessaires :</p>
        <ul>
          <li><strong>Cookies d&apos;authentification :</strong> maintien de votre session de connexion (Supabase Auth)</li>
          <li><strong>Cookie de préférences :</strong> sauvegarde de votre choix de thème (clair/sombre) et de vos favoris</li>
        </ul>
        <p>
          Ces cookies sont exemptés de consentement conformément aux recommandations de la CNIL car ils sont strictement nécessaires au fonctionnement du service. Nous n&apos;utilisons aucun cookie publicitaire ni outil de pistage tiers.
        </p>
      </section>

      <section>
        <h2>10. Sécurité</h2>
        <p>
          Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation, notamment :
        </p>
        <ul>
          <li>Chiffrement des données en transit (HTTPS/TLS)</li>
          <li>Chiffrement des données au repos (AES-256)</li>
          <li>Authentification sécurisée via OAuth 2.0</li>
          <li>Contrôle d&apos;accès par politiques Row Level Security (RLS) au niveau de la base de données</li>
          <li>Système de parrainage limitant l&apos;accès aux seuls membres vérifiés</li>
        </ul>
      </section>

      <section>
        <h2>11. Modifications</h2>
        <p>
          Nous pouvons modifier la présente Politique à tout moment. Toute modification substantielle vous sera notifiée par un bandeau sur la plateforme ou par e-mail. La date de dernière mise à jour figure en haut de cette page.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Pour toute question relative à la protection de vos données personnelles, contactez-nous sur X : <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
