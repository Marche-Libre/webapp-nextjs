import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { PREVIEW_IMAGES, createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Mentions légales",
  description:
    "Mentions légales de MarchéLibre : éditeur, hébergeurs, propriété intellectuelle, données personnelles et contact.",
  path: "/mentions-legales",
  images: PREVIEW_IMAGES.mentionsLegales,
  imageAlt: "Mentions légales MarchéLibre",
});

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales" lastUpdated="2 avril 2026">
      <section>
        <h2>1. Éditeur du site</h2>
        <p>Le site <strong>marchelibre.fr</strong> (ci-après « le Site ») est un projet personnel édité par :</p>
        <ul>
          <li><strong>Nom du projet :</strong> MarchéLibre</li>
          <li><strong>Nature :</strong> projet personnel à but non lucratif</li>
          <li><strong>Directeur de la publication :</strong> Libre Max</li>
          <li><strong>Contact :</strong> via X (Twitter) — <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a></li>
        </ul>
      </section>

      <section>
        <h2>2. Hébergeur</h2>
        <p>Le Site est hébergé par :</p>
        <ul>
          <li><strong>Vercel Inc.</strong></li>
          <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
          <li>Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
        </ul>
        <p>Les données sont hébergées par :</p>
        <ul>
          <li><strong>Supabase Inc.</strong></li>
          <li>970 Toa Payoh North #07-04, Singapore 318992</li>
          <li>Région des données : <strong>eu-west-1</strong> (Union européenne)</li>
          <li>Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
        </ul>
      </section>

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du contenu du Site (textes, images, graphismes, logo, icônes, code source, base de données) est la propriété de ses créateurs et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du Site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans autorisation écrite préalable.
        </p>
        <p>
          Toute exploitation non autorisée du Site ou de son contenu sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.
        </p>
      </section>

      <section>
        <h2>4. Protection des données personnelles</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés » du 6 janvier 1978, vous disposez de droits sur vos données personnelles.
        </p>
        <p>
          Pour plus d&apos;informations sur la collecte et le traitement de vos données, consultez notre <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
        <p>
          <strong>Responsable des données personnelles :</strong> Libre Max, joignable via <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a> sur X
        </p>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>
          Le Site utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de thème). Aucun cookie publicitaire ou de suivi n&apos;est utilisé.
        </p>
        <p>
          Pour plus de détails, consultez la section « Cookies » de notre <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>6. Limitation de responsabilité</h2>
        <p>
          MarchéLibre s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le Site. Toutefois, MarchéLibre ne peut garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations disponibles sur le Site.
        </p>
        <p>
          MarchéLibre décline toute responsabilité :
        </p>
        <ul>
          <li>Pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le Site</li>
          <li>Pour tous dommages résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant entraîné une modification des informations mises à disposition sur le Site</li>
          <li>Pour tout dommage, direct ou indirect, quelles qu&apos;en soient les causes, origines, natures ou conséquences, provoqué en raison de l&apos;accès de quiconque au Site ou de l&apos;impossibilité d&apos;y accéder</li>
          <li>Pour toute interruption du Site, survenance de bugs ou tout dommage résultant d&apos;actes de tiers</li>
        </ul>
      </section>

      <section>
        <h2>7. Liens hypertextes</h2>
        <p>
          Le Site peut contenir des liens hypertextes vers d&apos;autres sites internet. MarchéLibre n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leurs pratiques en matière de protection des données ou leur disponibilité.
        </p>
        <p>
          La mise en place d&apos;un lien hypertexte vers le Site nécessite une autorisation préalable de MarchéLibre.
        </p>
      </section>

      <section>
        <h2>8. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l&apos;utilisation du Site sera soumis à la compétence exclusive des tribunaux de Paris, sauf dispositions légales contraires.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Pour toute question concernant les présentes mentions légales, contactez-nous sur X : <a href="https://x.com/libremax_off" target="_blank" rel="noopener noreferrer">@libremax_off</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
