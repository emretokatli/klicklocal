import type { Metadata } from 'next';

import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = { title: 'Datenschutzerklärung – Klicklocal' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
      {children}
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function DatenschutzPage() {
  return (
    <LegalPageShell title="Datenschutzerklärung">

      <Section title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <div className="space-y-1">
          <p className="font-medium text-on-surface">Klicklocal</p>
          <p>klicklocal GmbH</p>
          <p>Reichenbergerstr. 59</p>
          <p>86161 Augsburg</p>
          <p>Deutschland</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:datenschutz@klicklocal.app"
              className="text-primary hover:underline"
            >
              datenschutz@klicklocal.app
            </a>
          </p>
        </div>
      </Section>

      <Section title="2. Erhebung und Verarbeitung personenbezogener Daten">
        <p>
          Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der
          gesetzlichen Vorschriften der Datenschutz-Grundverordnung (DSGVO).
        </p>
        <p>Folgende Daten können verarbeitet werden:</p>
        <Ul
          items={[
            'Name',
            'E-Mail-Adresse',
            'Unternehmensinformationen',
            'Zahlungsinformationen',
            'Nutzungsdaten',
            'IP-Adresse',
            'Social-Media-Kontoinformationen',
          ]}
        />
      </Section>

      <Section title="3. Zweck der Verarbeitung">
        <p>Die Verarbeitung erfolgt zur:</p>
        <Ul
          items={[
            'Bereitstellung unserer SaaS-Plattform',
            'Erstellung von Benutzerkonten',
            'Durchführung von Zahlungen',
            'Erstellung KI-gestützter Inhalte',
            'Veröffentlichung und Planung von Social-Media-Beiträgen',
            'Verbesserung unserer Dienstleistungen',
            'Kommunikation mit Kunden',
          ]}
        />
      </Section>

      <Section title="4. Rechtsgrundlagen">
        <p>
          Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 DSGVO auf Basis:
        </p>
        <Ul
          items={[
            'Ihrer Einwilligung',
            'Vertragserfüllung',
            'Gesetzlicher Verpflichtungen',
            'Berechtigter Interessen',
          ]}
        />
      </Section>

      <Section title="5. Zahlungsdienstleister">
        <p>
          Für die Zahlungsabwicklung nutzen wir externe Zahlungsanbieter
          (z. B. Stripe). Dabei werden erforderliche Zahlungsdaten an den
          jeweiligen Anbieter übermittelt.
        </p>
      </Section>

      <Section title="6. KI-Dienste">
        <p>
          Zur Generierung von Inhalten können Anfragen an KI-Dienstleister
          übermittelt werden. Hierbei können Texteingaben und
          Unternehmensinformationen verarbeitet werden, soweit dies zur
          Bereitstellung der Funktion erforderlich ist.
        </p>
      </Section>

      <Section title="7. Social-Media-Integrationen">
        <p>
          Wenn Sie Ihr Social-Media-Konto mit Klicklocal verbinden, erhalten
          wir Zugriff auf die von Ihnen freigegebenen Informationen und
          Berechtigungen.
        </p>
      </Section>

      <Section title="8. Speicherdauer">
        <p>
          Personenbezogene Daten werden nur so lange gespeichert, wie dies zur
          Erfüllung der jeweiligen Zwecke oder gesetzlicher
          Aufbewahrungspflichten erforderlich ist.
        </p>
      </Section>

      <Section title="9. Ihre Rechte">
        <p>Sie haben das Recht auf:</p>
        <Ul
          items={[
            'Auskunft',
            'Berichtigung',
            'Löschung',
            'Einschränkung der Verarbeitung',
            'Datenübertragbarkeit',
            'Widerspruch',
            'Widerruf einer Einwilligung',
          ]}
        />
      </Section>

      <Section title="10. Kontakt">
        <p>Anfragen zum Datenschutz richten Sie bitte an:</p>
        <a
          href="mailto:datenschutz@klicklocal.app"
          className="text-primary hover:underline"
        >
          datenschutz@klicklocal.app
        </a>
      </Section>

    </LegalPageShell>
  );
}
