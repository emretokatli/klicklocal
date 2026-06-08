import type { Metadata } from 'next';

import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = { title: 'Impressum – Klicklocal' };

export default function ImpressumPage() {
  return (
    <LegalPageShell title="Impressum">
      <p className="text-sm text-on-surface-variant">Angaben gemäß § 5 DDG</p>

      <p className="mt-6 font-semibold text-on-surface">Klicklocal</p>

      <div className="mt-4 space-y-1">
        <p className="font-medium text-on-surface">Inhaber:</p>
        <p>klicklocal GmbH</p>
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-medium text-on-surface">Anschrift:</p>
        <p>Reichenbergerstr. 59</p>
        <p>86161 Augsburg</p> 
        <p>Deutschland</p>
      </div>

      <div className="mt-6 space-y-1">
        <p className="font-medium text-on-surface">Kontakt:</p>
        <p>
          E-Mail:{' '}
          <a
            href="mailto:info@klicklocal.app"
            className="text-primary hover:underline"
          >
            info@klicklocal.app
          </a>
        </p>
        <p>
          Website:{' '}
          <a
            href="https://www.klicklocal.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://www.klicklocal.app
          </a>
        </p>
      </div>

      <div className="mt-6 space-y-1">
        <p className="font-medium text-on-surface">Umsatzsteuer-ID:</p>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
        </p>
        <p>DE123123123</p>
      </div>

      <div className="mt-6 space-y-1">
        <p className="font-medium text-on-surface">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
        </p>
        <p>klicklocal GmbH</p>
        <p>Reichenbergerstr. 59</p>
        <p>86161 Augsburg</p>
        <p>Deutschland</p>
      </div>

      <div className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-on-surface">
          Haftung für Inhalte
        </h2>
        <p>
          Als Diensteanbieter sind wir gemäß den allgemeinen Gesetzen für
          eigene Inhalte auf diesen Seiten verantwortlich. Wir übernehmen
          jedoch keine Gewähr für die Aktualität, Vollständigkeit und
          Richtigkeit der bereitgestellten Inhalte.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-on-surface">
          Haftung für Links
        </h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte keine Gewähr übernehmen.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-on-surface">Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser
          Website unterliegen dem deutschen Urheberrecht. Jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechts bedarf der
          schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </div>
    </LegalPageShell>
  );
}
