'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/Logo';

type OnboardingShellProps = {
  children: ReactNode;
  wide?: boolean;
  stepIndex: number;
  totalSteps: number;
  footer?: ReactNode;
};

export function OnboardingShell({
  children,
  wide = false,
  stepIndex,
  totalSteps,
  footer,
}: OnboardingShellProps) {
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <main className="onboarding-page flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-3xl px-5 pt-6 sm:px-8">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 opacity-80 transition hover:opacity-100">
            <Logo size={28} />
            <span className="text-sm font-semibold text-on-surface">Klicklocal</span>
          </Link>
          <span className="text-xs tabular-nums text-on-surface-variant">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
        <div className="onboarding-progress-track">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>{children}</div>
      </div>

      {footer && (
        <footer className="mx-auto w-full max-w-3xl px-5 pb-8 pt-2 sm:px-8">
          <div className={`mx-auto w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
            {footer}
          </div>
        </footer>
      )}
    </main>
  );
}
