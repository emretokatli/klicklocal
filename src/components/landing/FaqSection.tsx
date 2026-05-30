'use client';

import { useState } from 'react';

import { FAQ_ITEMS } from '@/components/landing/landing-data';

function MaterialIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className ?? ''}`}>{name}</span>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="reveal mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Häufige Fragen
          </p>
          <h2 className="mb-4 text-3xl font-semibold">
            Klare Antworten vor dem Start
          </h2>
          <p className="text-on-surface-variant">
            Setup, Planung, Kanäle, Workflow und Support – die wichtigsten
            Punkte auf einen Blick.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className="reveal glass-card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="font-medium text-on-surface">{item.q}</span>
                  <MaterialIcon
                    name={open ? 'expand_less' : 'expand_more'}
                    className="shrink-0 text-primary"
                  />
                </button>
                {open && (
                  <div className="border-t border-white/10 px-6 pb-5 pt-0">
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="reveal glass-card mt-10 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-on-surface">Noch Fragen?</p>
            <p className="text-sm text-on-surface-variant">
              Wir helfen dir, den passenden Setup für dein Team zu finden.
            </p>
          </div>
          <a
            href="#contact"
            className="glow-pill shrink-0 rounded-full px-6 py-3 text-sm font-bold text-on-primary"
          >
            Kontakt aufnehmen
          </a>
        </div>
      </div>
    </section>
  );
}
