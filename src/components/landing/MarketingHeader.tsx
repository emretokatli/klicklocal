'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';

const nav = [
  { href: '#features', label: 'Funktionen' },
  { href: '#workflow', label: "So funktioniert's" },
  { href: '#pricing', label: 'Preise' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Kontakt' },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Menü schließen"
          onClick={closeMenu}
        />
      ) : null}

      <div className="fixed top-6 left-1/2 z-50 w-[90%] max-w-7xl -translate-x-1/2">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-surface/60 px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-8 sm:py-4">
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
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-on-surface transition-colors hover:bg-white/5 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined text-xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link
            href="/login"
            className="hidden rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold tracking-wide text-on-surface transition-colors hover:bg-white/5 md:inline-flex"
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

        {menuOpen ? (
          <nav
            id="mobile-nav"
            className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl md:hidden"
            aria-label="Mobile Navigation"
          >
            <ul className="flex flex-col p-2">
              {nav.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-on-surface-variant transition-colors hover:bg-white/5 hover:text-secondary"
                    onClick={closeMenu}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </>
  );
}
