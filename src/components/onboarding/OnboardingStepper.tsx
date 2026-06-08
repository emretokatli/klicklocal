'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export function OnboardingStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-3">
      {steps.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                done && 'bg-primary text-on-primary',
                active && 'bg-primary/20 text-primary ring-2 ring-primary',
                !done && !active && 'bg-white/10 text-on-surface-variant',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step}
            </span>
            <span
              className={cn(
                'text-sm',
                active ? 'font-medium text-on-surface' : 'text-on-surface-variant',
              )}
            >
              {label}
            </span>
            {step < steps.length && (
              <span className="mx-1 hidden h-px w-6 bg-white/15 sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
