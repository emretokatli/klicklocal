'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { Logo } from '@/components/brand/Logo';

const VISUAL = {
  signIn: {
    image: '/images/signin.png',
    imageAlt: 'Klicklocal Anmeldung',
    fallback: '/images/cutout/welcome.png',
    headline: 'Social Media auf Autopilot',
    subline:
      'Plane, erstelle und veröffentliche Inhalte mit KI – alles in einem Dashboard.',
    badge: 'Willkommen zurück',
  },
  register: {
    image: '/images/SignUp.png',
    imageAlt: 'Klicklocal Registrierung',
    fallback: '/images/cutout/Studio.png',
    headline: 'Starte in wenigen Minuten',
    subline:
      'Konto anlegen, Workspace erstellen und deinen ersten Beitrag planen.',
    badge: 'Kostenlos testen',
  },
} as const;

export function AuthShell({
  isRegister,
  children,
}: {
  isRegister: boolean;
  children: ReactNode;
}) {
  const v = isRegister ? VISUAL.register : VISUAL.signIn;

  return (
    <main className="auth-page relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Decorative panel — desktop */}
      <aside
        className="auth-visual relative hidden flex-col justify-between overflow-hidden border-r border-white/5 p-10 xl:p-14 lg:flex"
      >
        <div className="auth-mesh" aria-hidden />
        <div className="auth-grid" aria-hidden />
        <div className="auth-noise" aria-hidden />
        <div className="auth-orb auth-orb-1" aria-hidden />
        <div className="auth-orb auth-orb-2" aria-hidden />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo size={40} />
            <span className="text-lg font-bold tracking-tight text-on-surface">
              Klicklocal
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="glow-pill mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-primary">
            {v.badge}
          </span>
          <h1 className="text-3xl font-bold leading-tight text-on-surface xl:text-4xl">
            {v.headline}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            {v.subline}
          </p>
        </div>

        <div className="relative z-10 flex flex-1 items-end justify-center pb-4 pt-8">
          <div className="auth-mockup-glow" aria-hidden />
          <div className="relative w-[min(100%,280px)] drop-shadow-[0_24px_80px_rgba(54,224,166,0.25)] xl:w-[300px]">
            <AuthMockupImage
              key={isRegister ? 'register' : 'signin'}
              primary={v.image}
              fallback={v.fallback}
              alt={v.imageAlt}
            />
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="auth-form-panel relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="auth-mobile-bg lg:hidden" aria-hidden />
        <div className="liquid-bg lg:hidden" aria-hidden />

        <div className="relative z-10 mb-6 flex flex-col items-center gap-2 lg:hidden">
          <Link href="/">
            <Logo size={44} />
          </Link>
          <span className="text-sm font-medium text-on-surface-variant">
            Klicklocal
          </span>
        </div>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}

function AuthMockupImage({
  primary,
  fallback,
  alt,
}: {
  primary: string;
  fallback: string;
  alt: string;
}) {
  const [src, setSrc] = useState(primary);

  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={640}
      className="h-auto w-full object-contain"
      priority
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}
