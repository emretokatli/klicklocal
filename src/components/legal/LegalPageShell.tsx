import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/Logo';

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      <header className="border-b border-white/5 bg-surface-container-lowest px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={28} />
            <span className="text-lg font-bold">Klicklocal</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 md:px-10">
        <h1 className="mb-6 text-3xl font-bold">{title}</h1>

        <div className="prose prose-invert max-w-none text-on-surface-variant">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/5 px-5 py-6 text-center text-sm text-on-surface-variant md:px-10">
        © 2026 Klicklocal.{' '}
        <Link href="/impressum" className="hover:text-primary">Impressum</Link>
        {' · '}
        <Link href="/datenschutz" className="hover:text-primary">Datenschutz</Link>
        {' · '}
        <Link href="/agb" className="hover:text-primary">AGB</Link>
        {' · '}
        <Link href="/widerruf" className="hover:text-primary">Widerruf</Link>
      </footer>
    </div>
  );
}
