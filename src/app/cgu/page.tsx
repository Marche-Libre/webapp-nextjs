import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | MarchéLibre",
};

export default function CGUPage() {
  return (
    <LegalPageLayout title="Conditions Générales d'Utilisation" lastUpdated="2 avril 2026">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») définissent les modalités et conditions d&apos;accès et d&apos;utilisation de la plateforme <strong>MarchéLibre</strong> (ci-après « la Plateforme »), accessible à l&apos;adresse <strong>marchelibre.fr</strong>.
        </p>
        <p>
          En déposant une demande d&apos;admission puis, le cas échéant, en utilisant la Plateforme après approbation, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.
        </p>
      </section>

      <section>
        <h2>2. Description du service</h2>
        <p>
          MarchéLibre est un club privé en bêta fermée destiné aux <strong>professionnels indépendants et libéraux</strong> vérifiés en France. L&apos;accès est soumis à une admission manuelle par l&apos;administration.
        </p>
        <ul>
          <li><strong>chat privé entre membres approuvés :</strong> messagerie organisée autour de salons thématiques disponibles dans la bêta</li>
          <li><strong>Identité X :</strong> authentification et identification des candidats et membres via un compte X valide</li>
          <li><strong>Revue manuelle :</strong> chaque demande est examinée avant l&apos;ouverture d&apos;un accès membre</li>
          <li><strong>Parrainage :</strong> le contexte de parrainage peut être pris en compte dans la revue, sans garantir l&apos;admission</li>
        </ul>
      </section>

      <section>
        <h2>3. Inscription et accès</h2>

        <h3>3.1 Conditions de candidature</h3>
        <p>La demande d&apos;admission sur la Plateforme est soumise aux conditions suivantes :</p>
        <ul>
          <li>Être une personne physique majeure (18 ans ou plus) ou une personne morale valablement représentée</li>
          <li>Exercer une activité professionnelle indépendante ou libérale</li>
          <li>Disposer d&apos;un compte X (Twitter) valide pour l&apos;authentification</li>
          <li>Fournir un contexte de parrainage ou d&apos;invitation lorsque celui-ci existe</li>
        </ul>

        <h3>3.2 Processus d&apos;admission</h3>
        <ol>
          <li>Démarrage de la demande via authentification X (OAuth)</li>
          <li>Complétion des informations utiles à la revue (nom, spécialité, localisation)</li>
          <li>Examen du contexte de parrainage ou d&apos;invitation lorsqu&apos;il existe</li>
          <li>Approbation ou refus par l&apos;administration de la Plateforme</li>
        </ol>
        <p>
          L&apos;accès complet à la Plateforme n&apos;est accordé qu&apos;après approbation du profil. MarchéLibre se réserve le droit de refuser toute demande d&apos;admission sans avoir à motiver sa décision.
        </p>

        <h3>3.3 Sécurité du compte</h3>
        <p>
          Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité réalisée depuis votre compte. En cas d&apos;utilisation non autorisée, vous vous engagez à nous en informer immédiatement via <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a> sur X.
        </p>
      </section>

      <section>
        <h2>4. Obligations des utilisateurs</h2>
        <p>En utilisant la Plateforme, vous vous engagez à :</p>
        <ul>
          <li>Fournir des informations exactes, complètes et à jour dans votre profil</li>
          <li>Utiliser la Plateforme dans le respect des lois et réglementations en vigueur</li>
          <li>Respecter les autres membres et maintenir un comportement professionnel</li>
          <li>Ne pas publier de contenus à caractère diffamatoire, injurieux, discriminatoire, violent, pornographique, ou contraire à l&apos;ordre public et aux bonnes m&oelig;urs</li>
          <li>Ne pas utiliser la Plateforme à des fins de prospection commerciale non sollicitée (spam)</li>
          <li>Ne pas tenter de contourner les mesures de sécurité de la Plateforme</li>
          <li>Ne pas collecter les données des autres membres à des fins non autorisées</li>
          <li>Ne pas usurper l&apos;identité d&apos;une autre personne</li>
        </ul>
      </section>

      <section>
        <h2>5. Contenus des utilisateurs</h2>

        <h3>5.1 Propriété</h3>
        <p>
          Vous conservez l&apos;intégralité des droits de propriété intellectuelle sur les contenus que vous publiez sur la Plateforme (messages, biographie, informations de profil, etc.).
        </p>

        <h3>5.2 Licence accordée</h3>
        <p>
          En publiant du contenu sur la Plateforme, vous accordez à MarchéLibre une licence non exclusive, gratuite, mondiale et pour la durée de votre inscription, aux fins d&apos;afficher, distribuer et rendre accessible votre contenu aux autres membres dans le cadre du fonctionnement de la Plateforme.
        </p>

        <h3>5.3 Modération</h3>
        <p>
          MarchéLibre se réserve le droit de supprimer tout contenu contraire aux présentes CGU ou à la loi, sans préavis et sans que cela n&apos;ouvre droit à une quelconque indemnisation. Les membres peuvent signaler les contenus ou comportements inappropriés via le système de signalement intégré.
        </p>
      </section>

      <section>
        <h2>6. Système de parrainage</h2>
        <p>
          Le parrainage est un élément de contexte pour la revue manuelle des candidatures et la confiance au sein de la communauté :
        </p>
        <ul>
          <li>Un candidat peut mentionner l&apos;invitation ou le parrainage d&apos;un membre existant et approuvé</li>
          <li>Le parrain s&apos;engage à ne parrainer que des professionnels qu&apos;il connaît et dont il peut attester du sérieux</li>
          <li>Le parrainage ne garantit pas l&apos;admission, qui reste soumise à approbation administrative</li>
          <li>MarchéLibre se réserve le droit de limiter le nombre de parrainages par membre</li>
        </ul>
      </section>

      <section>
        <h2>7. Signalements et blocages</h2>
        <p>
          MarchéLibre peut traiter les signalements et comportements abusifs afin de protéger le club privé :
        </p>
        <ul>
          <li><strong>Signalement :</strong> tout membre peut signaler un comportement ou contenu inapproprié. Les signalements sont examinés par l&apos;équipe de modération</li>
          <li><strong>Mesures de protection :</strong> MarchéLibre peut limiter ou suspendre les interactions d&apos;un membre en cas d&apos;abus</li>
        </ul>
        <p>
          L&apos;abus du système de signalement (signalements abusifs ou malveillants) est passible de sanctions.
        </p>
      </section>

      <section>
        <h2>8. Propriété intellectuelle</h2>
        <p>
          La Plateforme, son design, son code source, ses logos et l&apos;ensemble des éléments la composant sont la propriété de ses créateurs et sont protégés par les lois relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie de ces éléments est strictement interdite.
        </p>
      </section>

      <section>
        <h2>9. Limitation de responsabilité</h2>
        <ul>
          <li>MarchéLibre est un intermédiaire technique et ne saurait être tenu responsable des contenus publiés par les utilisateurs</li>
          <li>La Plateforme est fournie « en l&apos;état ». MarchéLibre ne garantit pas un fonctionnement ininterrompu ou exempt d&apos;erreurs</li>
          <li>MarchéLibre ne peut être tenu responsable des relations professionnelles nouées entre membres via la Plateforme</li>
          <li>MarchéLibre ne vérifie pas les qualifications professionnelles déclarées par les membres au-delà du système de parrainage</li>
          <li>En aucun cas MarchéLibre ne pourra être tenu responsable de dommages indirects, perte de données, perte de chiffre d&apos;affaires ou perte de chance</li>
        </ul>
      </section>

      <section>
        <h2>10. Suspension et résiliation</h2>

        <h3>10.1 Suspension par MarchéLibre</h3>
        <p>
          MarchéLibre se réserve le droit de suspendre ou de supprimer un compte en cas de :
        </p>
        <ul>
          <li>Violation des présentes CGU</li>
          <li>Comportement nuisible envers la communauté</li>
          <li>Informations de profil fausses ou trompeuses</li>
          <li>Inactivité prolongée (supérieure à 12 mois)</li>
        </ul>

        <h3>10.2 Résiliation par l&apos;utilisateur</h3>
        <p>
          Vous pouvez à tout moment demander la suppression de votre compte en nous contactant via <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a> sur X. La suppression entraînera l&apos;effacement de vos données personnelles dans les conditions décrites dans notre <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>11. Gratuité</h2>
        <p>
          L&apos;accès à la bêta privée est actuellement <strong>gratuit</strong> pour les membres approuvés. MarchéLibre se réserve le droit d&apos;introduire des offres ou fonctionnalités payantes à l&apos;avenir, qui seront soumises à des conditions distinctes. Les membres seront informés de tout changement avec un préavis raisonnable.
        </p>
      </section>

      <section>
        <h2>12. Modifications des CGU</h2>
        <p>
          MarchéLibre se réserve le droit de modifier les présentes CGU à tout moment. Toute modification sera notifiée aux membres par un bandeau sur la Plateforme et/ou par e-mail. L&apos;utilisation continue de la Plateforme après notification vaut acceptation des CGU modifiées.
        </p>
      </section>

      <section>
        <h2>13. Droit applicable et juridiction</h2>
        <p>
          Les présentes CGU sont régies par le <strong>droit français</strong>. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, tout litige relatif à l&apos;interprétation ou l&apos;exécution des présentes CGU sera soumis aux <strong>tribunaux compétents de Paris</strong>.
        </p>
        <p>
          Conformément à l&apos;article L.612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un litige.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU, contactez-nous sur X : <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
