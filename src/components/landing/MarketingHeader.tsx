import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';

const nav = [
  { href: '#features', label: 'Funktionen' },
  { href: '#workflow', label: "So funktioniert's" },
  { href: '#pricing', label: 'Preise' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Kontakt' },
];

export function MarketingHeader() {
  return (
    <header className="fixed top-6 left-1/2 z-50 flex w-[90%] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-surface/60 px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-8 sm:py-4">
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <Logo size={40} />
        <span className="text-lg font-bold tracking-tight text-on-surface sm:text-xl">
          Klicklocal
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {nav.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-base text-on-surface-variant transition-colors duration-300 hover:text-secondary"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-on-surface transition-colors hover:bg-white/5 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="glow-pill rounded-full px-4 py-2 text-xs font-bold tracking-wide text-on-primary transition-transform active:scale-90 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          Jetzt starten
        </Link>
      </div>
    </header>
  );
}
