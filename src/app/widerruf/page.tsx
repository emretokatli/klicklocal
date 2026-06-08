import type { Metadata } from 'next';

import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = { title: 'Widerrufsbelehrung – Klicklocal' };

export default function WiderrufPage() {
  return (
    <LegalPageShell title="Widerrufsbelehrung">
      <div className="space-y-4">
        <p>
          Klicklocal richtet sich ausschließlich an Unternehmer im Sinne von
          § 14 BGB.
        </p>
        <p>
          Ein gesetzliches Widerrufsrecht für Verbraucher gemäß § 355 BGB
          besteht daher nicht.
        </p>
        <p>
          Mit der Registrierung und Nutzung von Klicklocal bestätigt der
          Nutzer, dass er die Leistungen im Rahmen seiner gewerblichen oder
          selbstständigen beruflichen Tätigkeit in Anspruch nimmt.
        </p>
        <p>
          Sollte in Ausnahmefällen ein Vertrag mit einem Verbraucher zustande
          kommen, gelten die gesetzlichen Widerrufsrechte gemäß den
          Bestimmungen des Bürgerlichen Gesetzbuches.
        </p>
      </div>
    </LegalPageShell>
  );
}
