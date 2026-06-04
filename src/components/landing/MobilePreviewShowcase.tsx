'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type PreviewSlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  desc: string;
};

const SLIDES: PreviewSlide[] = [
  {
    src: '/images/cutout/Studio.png',
    alt: 'KI-Studio: Content erstellen',
    eyebrow: 'KI-Studio',
    title: 'Content erstellen',
    desc: 'Beschreibe deine Idee – die KI schreibt Posts, Captions und Hashtags und schlägt passende Visuals vor.',
  },
  {
    src: '/images/cutout/Plan.png',
    alt: 'Content-Kalender: Beiträge planen',
    eyebrow: 'Kalender',
    title: 'Beiträge planen',
    desc: 'Plane Wochen im Voraus und veröffentliche automatisch zur besten Zeit – auf allen Kanälen.',
  },
  {
    src: '/images/cutout/Inbox.png',
    alt: 'Posteingang: Nachrichten beantworten',
    eyebrow: 'Posteingang',
    title: 'Nachrichten beantworten',
    desc: 'Kommentare und DMs aus Instagram, TikTok und Facebook an einem Ort – mit KI-Antwortvorschlägen.',
  },
  {
    src: '/images/cutout/Insight.png',
    alt: 'Insights: Erfolg messen',
    eyebrow: 'Insights',
    title: 'Erfolg messen',
    desc: 'Reichweite, Follower-Wachstum und Engagement verständlich aufbereitet – ohne Tabellen-Chaos.',
  },
];

export function MobilePreviewShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setActive(0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = scrolled / total;
      const index = Math.min(
        SLIDES.length - 1,
        Math.floor(progress * SLIDES.length),
      );
      setActive(index);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const activeSlide = SLIDES[active];

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="preview-section relative z-10"
      style={{ height: `${(SLIDES.length + 1) * 100}svh` }}
    >
      <div className="preview-sticky">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left — active feature copy (desktop) */}
          <div className="hidden lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Alles in einer App
            </p>
            {SLIDES.map((slide, i) => (
              <div
                key={slide.title}
                className={`preview-copy ${i === active ? 'is-active' : ''}`}
                aria-hidden={i !== active}
              >
                <h2 className="mb-4 text-4xl font-semibold leading-tight">
                  {slide.title}
                </h2>
                <p className="max-w-md text-base text-on-surface-variant">
                  {slide.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Center — sticky phone preview */}
          <div className="preview-phone">
            {SLIDES.map((slide, i) => (
              <Image
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                width={360}
                height={780}
                priority={i === 0}
                className={`preview-phone-img ${i === active ? 'is-active' : ''}`}
              />
            ))}
            <div className="preview-glow" aria-hidden />
          </div>

          {/* Right — step navigation (desktop) */}
          <ol className="hidden lg:block lg:justify-self-end">
            {SLIDES.map((slide, i) => (
              <li
                key={slide.eyebrow}
                className={`preview-step ${i === active ? 'is-active' : ''}`}
              >
                <span className="preview-step-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="preview-step-label">{slide.eyebrow}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile — caption + dots under the phone */}
        <div className="mt-8 px-6 text-center lg:hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {activeSlide.eyebrow}
          </p>
          <h2 className="mb-3 text-2xl font-semibold">{activeSlide.title}</h2>
          <p className="mx-auto max-w-md text-sm text-on-surface-variant">
            {activeSlide.desc}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            {SLIDES.map((slide, i) => (
              <span
                key={slide.title}
                className={`preview-dot ${i === active ? 'is-active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
