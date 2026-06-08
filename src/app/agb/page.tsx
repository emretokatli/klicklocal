import type { Metadata } from 'next';

import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = { title: 'AGB – Klicklocal' };

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

export default function AgbPage() {
  return (
    <LegalPageShell title="Allgemeine Geschäftsbedingungen (AGB)">

      <Section title="1. Geltungsbereich">
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der
          SaaS-Plattform Klicklocal.
        </p>
      </Section>

      <Section title="2. Vertragsgegenstand">
        <p>
          Klicklocal bietet eine cloudbasierte Softwarelösung zur Erstellung,
          Planung und Verwaltung von Social-Media-Inhalten für Unternehmen.
        </p>
      </Section>

      <Section title="3. Registrierung">
        <p>
          Für die Nutzung bestimmter Funktionen ist die Erstellung eines
          Benutzerkontos erforderlich. Der Nutzer verpflichtet sich, korrekte
          und vollständige Angaben zu machen.
        </p>
      </Section>

      <Section title="4. Leistungen">
        <p>Klicklocal stellt Funktionen zur Verfügung, einschließlich:</p>
        <Ul
          items={[
            'KI-gestützte Inhaltserstellung',
            'Social-Media-Planung',
            'Veröffentlichung von Beiträgen',
            'Analyse- und Verwaltungsfunktionen',
          ]}
        />
        <p>
          Der konkrete Leistungsumfang ergibt sich aus dem jeweils gebuchten
          Tarif.
        </p>
      </Section>

      <Section title="5. Preise und Zahlungsbedingungen">
        <p>
          Die Nutzung kostenpflichtiger Tarife erfolgt gegen die jeweils auf
          der Website angegebenen Preise.
        </p>
        <p>Die Abrechnung erfolgt monatlich oder jährlich im Voraus.</p>
      </Section>

      <Section title="6. Laufzeit und Kündigung">
        <p>
          Abonnements verlängern sich automatisch um die jeweilige Laufzeit,
          sofern sie nicht vor Ablauf gekündigt werden.
        </p>
        <p>
          Die Kündigung kann jederzeit über die Kontoeinstellungen oder
          schriftlich erfolgen.
        </p>
      </Section>

      <Section title="7. Verfügbarkeit">
        <p>
          Wir bemühen uns um eine möglichst unterbrechungsfreie Verfügbarkeit
          der Plattform. Eine permanente Verfügbarkeit kann jedoch nicht
          garantiert werden.
        </p>
      </Section>

      <Section title="8. Haftung">
        <p>
          Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit.
        </p>
        <p>
          Bei leichter Fahrlässigkeit haften wir nur bei Verletzung
          wesentlicher Vertragspflichten und beschränkt auf den vorhersehbaren
          Schaden.
        </p>
      </Section>

      <Section title="9. Inhalte der Nutzer">
        <p>
          Der Nutzer bleibt allein verantwortlich für die von ihm erstellten,
          hochgeladenen oder veröffentlichten Inhalte.
        </p>
      </Section>

      <Section title="10. Datenschutz">
        <p>
          Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{' '}
          <a href="/datenschutz" className="text-primary hover:underline">
            Datenschutzerklärung
          </a>
          .
        </p>
      </Section>

      <Section title="11. Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts.
        </p>
        <p>
          Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des
          Anbieters.
        </p>
      </Section>

    </LegalPageShell>
  );
}
