'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { FaqSection } from '@/components/landing/FaqSection';
import { HeroMockup } from '@/components/landing/HeroMockup';
import {
  EXTRA_FEATURES,
  HERO_STATS,
  INTEGRATIONS,
  OPERATIONS,
  PILLARS,
  SOCIAL_PROOF,
  WORKFLOW_STEPS,
} from '@/components/landing/landing-data';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MobilePreviewShowcase } from '@/components/landing/MobilePreviewShowcase';

/** Cutout screenshots from www/images/cutout — served via /public/images */
const CUTOUT = {
  welcome: '/images/cutout/welcome.png',
  insight: '/images/cutout/Insight.png',
} as const;

const LOGO_STRIP = [
  '🍕 Bella Pizza',
  '💪 Studio Nord',
  '🌿 GreenMarket',
  '✂️ HairCraft',
  '📚 BuchHaus',
  '☕ Café Morgen',
  '🎨 DesignStudio',
];

const FEATURES = [
  {
    icon: 'auto_awesome',
    color: 'text-primary',
    title: 'KI-Content-Studio',
    desc: 'Beschreibe deine Idee – die KI schreibt Posts, Captions und Hashtags und schlägt passende Visuals vor.',
  },
  {
    icon: 'calendar_month',
    color: 'text-secondary',
    title: 'Content-Kalender',
    desc: 'Plane und terminiere Beiträge für alle Kanäle und veröffentliche automatisch zur besten Zeit.',
  },
  {
    icon: 'forum',
    color: 'text-tertiary',
    title: 'Vereinter Posteingang',
    desc: 'Kommentare und Direktnachrichten aus Instagram, TikTok und Facebook an einem Ort – mit KI-Antworten.',
  },
  {
    icon: 'insights',
    color: 'text-primary-container',
    title: 'Insights & Analytics',
    desc: 'Reichweite, Follower-Wachstum und Engagement verständlich aufbereitet – ohne Tabellen-Chaos.',
  },
  {
    icon: 'hub',
    color: 'text-secondary-container',
    title: 'Multi-Plattform',
    desc: 'Verbinde Instagram, TikTok und Facebook und verwalte alle Kanäle aus einer einzigen App.',
  },
  {
    icon: 'brush',
    color: 'text-on-surface',
    title: 'Deine Markenstimme',
    desc: 'Die KI lernt deinen Tonfall, sodass jeder Beitrag klingt, als hättest du ihn selbst geschrieben.',
  },
];

function MaterialIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className ?? ''}`}>{name}</span>
  );
}

export function LandingPage() {
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const onAnchorClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth' });
    };
    anchors.forEach((a) => a.addEventListener('click', onAnchorClick));

    return () => {
      observer.disconnect();
      anchors.forEach((a) => a.removeEventListener('click', onAnchorClick));
    };
  }, []);

  const proPrice = annual ? '33,25 €' : '39,99 €';
  const agencyPrice = annual ? '58,25 €' : '69,99 €';
  const proNote = annual ? '399 € jährlich abgerechnet' : '';
  const agencyNote = annual ? '699 € jährlich abgerechnet' : '';

  return (
    <div className="landing-page relative font-sans text-base text-on-surface">
      <MarketingHeader />

      <main className="relative overflow-x-clip">
        <div className="liquid-bg" aria-hidden />

        {/* Hero */}
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 pt-32 text-center md:px-10">
          <div
            className="hero-anim glow-pill mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-on-primary"
            style={{ animationDelay: '0ms' }}
          >
            Neu: KI-Veröffentlichungs-Workflows
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-[40px] leading-tight font-bold text-on-surface md:text-5xl">
            <span className="hero-word" style={{ animationDelay: '150ms' }}>
              Social
            </span>{' '}
            <span className="hero-word" style={{ animationDelay: '250ms' }}>
              Media,
            </span>
            <br />
            <span
              className="hero-word bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent"
              style={{ animationDelay: '350ms' }}
            >
              auf
            </span>{' '}
            <span
              className="hero-word bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent"
              style={{ animationDelay: '450ms' }}
            >
              Autopilot.
            </span>
          </h1>

          <p
            className="hero-anim mx-auto mb-10 max-w-2xl text-base text-on-surface-variant"
            style={{ animationDelay: '350ms' }}
          >
            Dein KI-Copilot für Content, Planung und Antworten – über Instagram,
            TikTok und Facebook. Entwickelt für kleine und mittlere Unternehmen,
            die online wachsen wollen, ohne Stunden zu verlieren.
          </p>

          <div
            className="hero-anim flex flex-col justify-center gap-4 md:flex-row"
            style={{ animationDelay: '450ms' }}
          >
            <Link
              href="/login"
              className="pulse-ring glow-pill flex items-center justify-center gap-2 rounded-full px-10 py-4 text-lg font-bold text-on-primary"
            >
              Kostenlos starten
              <MaterialIcon name="arrow_forward" />
            </Link>
            <a
              href="#features"
              className="glass-card rounded-full px-10 py-4 text-lg text-on-surface hover:bg-white/5"
            >
              Funktionen ansehen
            </a>
          </div>

          <div
            className="hero-anim mt-10 grid w-full max-w-2xl grid-cols-3 gap-4 border-y border-white/10 py-8"
            style={{ animationDelay: '500ms' }}
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-on-surface md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant md:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <HeroMockup />

          <div
            className="hero-anim mt-20 w-full max-w-5xl"
            style={{ animationDelay: '700ms' }}
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
              Vertraut von Unternehmen wie deinem
            </p>
            <div className="logo-track w-full">
              <div className="logo-inner text-lg font-bold tracking-tight text-on-surface-variant/70">
                {[...LOGO_STRIP, ...LOGO_STRIP].map((label, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pillars — Stackposts-style visibility / AI / team */}
        <section className="relative z-10 px-5 py-16 md:px-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="glass-card reveal p-8"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <MaterialIcon
                  name={p.icon}
                  className="mb-4 text-3xl text-primary"
                />
                <h3 className="mb-3 text-xl font-semibold">{p.title}</h3>
                <p className="text-sm text-on-surface-variant">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="relative z-10 bg-gradient-to-b from-transparent to-surface-container-lowest px-5 py-16 md:px-10">
          <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
            <div className="reveal">
              <h2 className="mb-6 text-3xl font-semibold">
                Social Media frisst deine Zeit
              </h2>
              <p className="mb-6 text-base text-on-surface-variant">
                Als kleines Unternehmen jonglierst du Instagram, TikTok und
                Facebook neben deinem eigentlichen Geschäft. Posten, planen,
                antworten – das kostet Stunden, die du nicht hast.
              </p>
              <ul className="space-y-4">
                {[
                  ['schedule', 'Keine Zeit: Content-Erstellung und Captions verschlingen jede Woche viele Stunden.'],
                  ['lightbulb', 'Ideen-Stau: Dir fehlen frische Post-Ideen und ein roter Faden für deinen Kanal.'],
                  ['forum', 'Verpasste Nachrichten: Kommentare und DMs über mehrere Plattformen gehen unter.'],
                ].map(([icon, text]) => (
                  <li key={icon} className="flex items-start gap-3">
                    <MaterialIcon name={icon} className="text-error" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal relative flex justify-center">
              <div className="absolute inset-0 bg-primary opacity-10 blur-[100px]" />
              <Image
                src={CUTOUT.welcome}
                alt="Klicklocal Onboarding – KI erstellt deinen Content"
                width={280}
                height={600}
                className="relative h-auto w-[240px] drop-shadow-[0_20px_60px_rgba(94,233,181,0.22)] md:w-[280px]"
              />
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="relative z-10 overflow-hidden px-5 py-16 md:px-10">
          <div className="mx-auto mb-16 flex max-w-7xl flex-col items-center text-center">
            <div className="reveal">
              <h2 className="mb-6 text-3xl font-semibold">
                Dein Copilot für alles Soziale
              </h2>
              <p className="max-w-2xl text-base text-on-surface-variant">
                Klicklocal erledigt die Fleißarbeit. Beschreibe dein Business
                einmal – die KI übernimmt Content, Planung und Antworten in deiner
                Tonalität, damit du Klicklocal bleibst.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: 'auto_awesome', bg: 'bg-secondary/20', color: 'text-secondary', title: 'Content', desc: 'Posts, Captions und Hashtags per Knopfdruck – passend zu deiner Marke und deiner Zielgruppe.' },
              { icon: 'calendar_month', bg: 'bg-primary/20', color: 'text-primary', title: 'Planung', desc: 'Plane Wochen im Voraus und veröffentliche automatisch zur besten Zeit – auf allen Kanälen.' },
              { icon: 'mark_chat_read', bg: 'bg-tertiary/20', color: 'text-tertiary', title: 'Antworten', desc: 'Kommentare und DMs aus allen Netzwerken in einem Posteingang – mit KI-Antwortvorschlägen.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass-card reveal p-8"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                >
                  <MaterialIcon name={item.icon} />
                </div>
                <h3 className="mb-4 text-xl font-medium">{item.title}</h3>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Operations matrix — content, scheduling, workspace, reporting */}
        <section className="relative z-10 bg-surface-container-low px-5 py-16 md:px-10">
          <div className="reveal mx-auto mb-14 max-w-7xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Feature-Matrix
            </p>
            <h2 className="mb-4 text-3xl font-semibold">
              Alles, was dein Team für Content-Ops braucht
            </h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              Von Entwurf und Planung bis Assets, Freigaben und Reporting –
              jedes Modul unterstützt den Alltag deines Teams.
            </p>
          </div>
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
            {OPERATIONS.map((block, i) => (
              <div
                key={block.title}
                className="glass-card reveal p-8 md:p-10"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {block.tag}
                </span>
                <div className="mt-4 mb-4 flex items-start gap-4">
                  <MaterialIcon
                    name={block.icon}
                    className={`text-4xl ${block.accent}`}
                  />
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
                    <p className="text-sm text-on-surface-variant">{block.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 border-t border-white/10 pt-4">
                  {block.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-on-surface-variant"
                    >
                      <MaterialIcon name="check_circle" className="text-sm text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* App showcase — sticky mobile preview reacting to scroll */}
        <MobilePreviewShowcase />

        {/* Features */}
        <section
          id="features"
          className="relative z-10 px-5 py-16 md:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="reveal mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary">
                Produktmodule
              </p>
              <h2 className="text-3xl font-semibold">
                Gebaut für den Publishing-Alltag
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...FEATURES, ...EXTRA_FEATURES].map((f) => (
                <div key={f.title} className="glass-card reveal group p-8">
                  <MaterialIcon
                    name={f.icon}
                    className={`mb-6 block text-[40px] transition-transform group-hover:scale-110 ${f.color}`}
                  />
                  <h4 className="mb-3 text-lg font-medium">{f.title}</h4>
                  <p className="text-sm text-on-surface-variant">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow — 4 steps */}
        <section
          id="workflow"
          className="relative z-10 px-5 py-16 md:px-10"
        >
          <div className="reveal mx-auto mb-14 max-w-7xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-tertiary">
              So läuft es ab
            </p>
            <h2 className="mb-4 text-3xl font-semibold">
              In unter einer Minute verstanden
            </h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              Von der Idee bis zur Messung – ohne generische Feature-Liste,
              sondern als klarer Ablauf.
            </p>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={step.step}
                className="glass-card reveal relative p-8"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-4xl font-bold text-primary/30">
                  {step.step}
                </span>
                <h3 className="mt-4 mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Integrations */}
        <section className="relative z-10 border-y border-white/5 bg-surface-container-lowest px-5 py-16 md:px-10">
          <div className="reveal mx-auto max-w-7xl text-center">
            <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
              Verbunden mit den Kanälen, die du bereits nutzt
            </h2>
            <p className="mb-10 text-on-surface-variant">
              Instagram, TikTok, Facebook und mehr – aus einem System steuern.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {INTEGRATIONS.map((ch) => (
                <div
                  key={ch.name}
                  className="glass-card flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                >
                  <span aria-hidden>{ch.emoji}</span>
                  {ch.name}
                </div>
              ))}
              <div className="glass-card rounded-full px-5 py-3 text-sm text-on-surface-variant">
                Und mehr …
              </div>
            </div>
          </div>
        </section>

        {/* Tech */}
        <section
          id="tech"
          className="relative z-10 bg-surface-container-low px-5 py-16 md:px-10"
        >
          <div className="glass-card relative mx-auto max-w-7xl overflow-hidden p-8 md:p-12">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="reveal">
                <h2 className="mb-6 text-3xl font-semibold">
                  Spar dir Stunden – Woche für Woche
                </h2>
                <p className="mb-8 text-base text-on-surface-variant">
                  Unternehmen, die mit Klicklocal arbeiten, posten regelmäßiger,
                  antworten schneller und sehen endlich, was wirklich funktioniert.
                </p>
                <div className="space-y-8">
                  {[
                    { label: 'Weniger Zeitaufwand für Content', value: '−80 %', pct: 80, color: 'bg-primary' },
                    { label: 'Mehr Reichweite in 90 Tagen', value: '+24 %', pct: 60, color: 'bg-secondary' },
                    { label: 'Schnellere Antwortzeit', value: '3,5x', pct: 70, color: 'bg-tertiary' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest text-on-surface">
                          {bar.label}
                        </span>
                        <span className={`font-bold ${bar.color.replace('bg-', 'text-')}`}>
                          {bar.value}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${bar.color}`}
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal flex justify-center p-4">
                <Image
                  src={CUTOUT.insight}
                  alt="Klicklocal Insights-Dashboard"
                  width={270}
                  height={580}
                  className="h-auto w-[240px] drop-shadow-[0_20px_60px_rgba(94,233,181,0.25)] md:w-[270px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social proof stats */}
        <section className="relative z-10 px-5 py-12 md:px-10">
          <div className="reveal mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {SOCIAL_PROOF.map((s, i) => (
              <div
                key={s.label}
                className="glass-card p-8 text-center"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="text-gradient-brand text-4xl font-bold">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          className="relative z-10 px-5 py-16 md:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="reveal mb-12 text-center text-3xl font-semibold">
              Von kleinen Unternehmen geliebt
            </h2>
            <div className="flex flex-col gap-8 md:flex-row">
              {[
                { initials: 'LK', name: 'Thomas Kern', role: 'Inhaber, KERNE - Marketing & Kommunikation', color: 'text-primary', quote: 'Früher habe ich sonntags zwei Stunden für Posts geopfert. Heute beschreibe ich kurz die Idee und Klicklocal erledigt den Rest – inklusive Planung. Endlich poste ich regelmäßig.' },
                { initials: 'MR', name: 'Marco Rossi', role: 'Gründer, Studio Nord Fitness', color: 'text-secondary', quote: 'Instagram, TikTok und Facebook in einer App – und die KI antwortet sogar auf DMs in meinem Tonfall. Unsere Reichweite ist in drei Monaten spürbar gewachsen.' },
              ].map((t, i) => (
                <div
                  key={t.initials}
                  className="glass-card reveal flex-1 p-8"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-bright font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-xl font-medium text-on-surface">{t.name}</p>
                      <p className={`text-xs font-semibold uppercase tracking-widest ${t.color}`}>
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="relative z-10 px-5 py-16 md:px-10">
          <div className="reveal mx-auto mb-10 max-w-7xl text-center">
            <h2 className="mb-4 text-3xl font-semibold">Wähle deinen Modus</h2>
            <p className="mx-auto max-w-xl text-on-surface-variant">
              Beide Modi eignen sich für alle Unternehmen. Teste Pro Mode 14 Tage
              kostenlos – jederzeit kündbar, keine versteckten Kosten.
            </p>
          </div>

          <div className="reveal mb-12 flex items-center justify-center gap-4">
            <span
              className={`text-base ${!annual ? 'text-on-surface' : 'text-on-surface-variant'}`}
            >
              Monatlich
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Abrechnung umschalten"
              onClick={() => setAnnual((v) => !v)}
              className="relative h-9 w-16 rounded-full border border-white/10 bg-surface-variant transition-colors"
            >
              <span
                className="absolute top-1 left-1 h-7 w-7 rounded-full bg-primary transition-transform duration-300"
                style={{ transform: annual ? 'translateX(28px)' : 'translateX(0)' }}
              />
            </button>
            <span
              className={`text-base ${annual ? 'text-on-surface' : 'text-on-surface-variant'}`}
            >
              Jährlich
            </span>
            <span className="ml-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              2 MONATE GRATIS
            </span>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="glass-card reveal relative flex flex-col items-center border-primary/40 bg-surface-variant/50 p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-on-primary">
                AM BELIEBTESTEN
              </div>
              <h3 className="mb-2 text-xl font-medium">Pro Mode</h3>
              <div className="text-5xl font-bold text-on-surface">
                {proPrice}
                <span className="text-lg font-normal text-on-surface-variant">
                  /Monat
                </span>
              </div>
              <p className="mb-1 h-5 text-sm text-on-surface-variant">{proNote}</p>
              <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-primary">
                14 TAGE KOSTENLOS TESTEN
              </p>
              <ul className="mb-10 w-full space-y-4 text-left text-sm text-on-surface-variant">
                {[
                  '3 Posts/Reels pro Woche',
                  'Für Instagram & TikTok',
                  'KI-Content, Captions & Hashtags',
                  'Auto-Scheduling (automatische Planung)',
                  'Für 1 Unternehmen / 1 Nutzer',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <MaterialIcon name="check" className="text-sm text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="glow-pill w-full rounded-full py-4 text-center font-bold text-on-primary"
              >
                14 Tage kostenlos testen
              </Link>
            </div>

            <div
              className="glass-card reveal flex flex-col items-center p-10"
              style={{ transitionDelay: '100ms' }}
            >
              <h3 className="mb-2 text-xl font-medium">Agency Mode</h3>
              <div className="text-5xl font-bold text-on-surface">
                {agencyPrice}
                <span className="text-lg font-normal text-on-surface-variant">
                  /Monat
                </span>
              </div>
              <p className="mb-1 h-5 text-sm text-on-surface-variant">{agencyNote}</p>
              <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-secondary">
                UNBEGRENZTER CONTENT
              </p>
              <ul className="mb-10 w-full space-y-4 text-left text-sm text-on-surface-variant">
                {[
                  'Unbegrenzte Posts, Reels & Videos',
                  'Für Instagram, TikTok & Facebook',
                  'Auto-Scheduling (automatische Planung)',
                  'Erweiterte Analysen & Algorithmus-Insights für mehr Reichweite',
                  'Für 1 Unternehmen / 1 Nutzer',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <MaterialIcon name="check" className="text-sm text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="w-full rounded-full border border-white/10 py-4 text-center font-bold transition-colors hover:bg-white/5"
              >
                Agency Mode starten
              </Link>
            </div>
          </div>
        </section>

        <FaqSection />

        {/* Final CTA */}
        <section
          id="contact"
          className="relative z-10 flex flex-col items-center px-5 py-24 text-center md:px-10"
        >
          <div className="reveal">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Bereit für Social Media auf Autopilot?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base text-on-surface-variant">
              Schließe deine Kanäle an und lass deinen KI-Copilot loslegen – in
              unter 5 Minuten.
            </p>
            <Link
              href="/login"
              className="glow-pill inline-block rounded-full px-12 py-5 text-lg font-bold text-on-primary"
            >
              Klicklocal kostenlos starten
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 md:flex-row md:px-10">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-xl font-bold text-on-surface">Klicklocal</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { href: '#features', label: 'Funktionen' },
              { href: '#pricing', label: 'Preise' },
              { href: '#faq', label: 'FAQ' },
              { href: '#contact', label: 'Kontakt' },
              { href: '/impressum', label: 'Impressum' },
              { href: '/datenschutz', label: 'Datenschutz' },
              { href: '/agb', label: 'AGB' },
              { href: '/widerruf', label: 'Widerruf' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-on-surface-variant opacity-80 transition-colors hover:text-primary hover:opacity-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-on-surface-variant">
            © 2026 Klicklocal. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
