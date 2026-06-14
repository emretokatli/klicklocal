'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { de } from '@/lib/i18n/de';
import { businessProfileService } from '@/services/business-profile.service';
import type {
  WebsiteAnalysisBand,
  WebsiteAnalysisFull,
  WebsiteAnalysisTeaser,
} from '@/types/api';

const t = de.dashboard.analysis;

/** Band → design-token colour (text colour also drives the gauge ring stroke). */
const BAND_COLOR: Record<WebsiteAnalysisBand, string> = {
  Kritisch: 'text-error',
  Ausbaufähig: 'text-tertiary',
  Solide: 'text-secondary',
  Stark: 'text-primary',
};

/** Band → full badge classes (text + background + border). */
const BAND_BADGE: Record<WebsiteAnalysisBand, string> = {
  Kritisch: 'text-error bg-error/10 border-error/30',
  Ausbaufähig: 'text-tertiary bg-tertiary/10 border-tertiary/30',
  Solide: 'text-secondary bg-secondary/10 border-secondary/30',
  Stark: 'text-primary bg-primary/10 border-primary/30',
};

function hostOf(website: string | null): string | null {
  if (!website) return null;
  try {
    return new URL(
      website.startsWith('http') ? website : `https://${website}`,
    ).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

/** Radial score gauge — the card's signature element. */
function ScoreGauge({
  score,
  band,
}: {
  score: number;
  band: WebsiteAnalysisBand;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const color = BAND_COLOR[band];

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="text-fill-strong"
          stroke="currentColor"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={`${color} transition-[stroke-dashoffset] duration-1000 ease-out`}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-sora text-4xl font-bold leading-none ${color}`}
        >
          {clamped}
        </span>
        <span className="mt-1 text-xs text-on-surface-variant">
          {t.scoreOutOf}
        </span>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Sparkles;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-on-surface-variant" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </h4>
      </div>
      {children}
    </div>
  );
}

function FullAnalysis({ a }: { a: WebsiteAnalysisFull }) {
  return (
    <div className="space-y-6">
      {a.services.length > 0 && (
        <Section icon={Sparkles} label={t.servicesLabel}>
          <div className="flex flex-wrap gap-2">
            {a.services.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {a.strengths.length > 0 && (
          <Section icon={CheckCircle2} label={t.strengthsLabel}>
            <ul className="space-y-1.5">
              {a.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-on-surface">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {a.weaknesses.length > 0 && (
          <Section icon={AlertTriangle} label={t.weaknessesLabel}>
            <ul className="space-y-1.5">
              {a.weaknesses.map((w) => (
                <li key={w} className="flex gap-2 text-sm text-on-surface">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {a.seo_assessment && (
        <Section icon={Globe} label={t.seoLabel}>
          <p className="text-sm text-on-surface-variant">{a.seo_assessment}</p>
        </Section>
      )}

      {a.target_audience && (
        <Section icon={Sparkles} label={t.targetAudienceLabel}>
          <p className="text-sm text-on-surface-variant">{a.target_audience}</p>
        </Section>
      )}

      {a.growth_note && (
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t.growthLabel}
            </h4>
          </div>
          <p className="text-sm text-on-surface">{a.growth_note}</p>
        </div>
      )}
    </div>
  );
}

function TeaserAnalysis({ a }: { a: WebsiteAnalysisTeaser }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {t.strengthsCount(a.strengths_count)}
        </Badge>
        <Badge variant="failed">{t.weaknessesCount(a.weaknesses_count)}</Badge>
      </div>

      {/* Locked section: blurred faux content behind an upgrade overlay. The
          real strengths/weaknesses/SEO/growth are never sent to this client. */}
      <div className="relative overflow-hidden rounded-xl border border-outline-soft">
        <div
          className="space-y-3 p-5 blur-sm select-none"
          aria-hidden
        >
          <div className="h-4 w-1/3 rounded bg-fill-strong" />
          <div className="h-3 w-full rounded bg-fill-soft" />
          <div className="h-3 w-5/6 rounded bg-fill-soft" />
          <div className="h-4 w-1/4 rounded bg-fill-strong" />
          <div className="h-3 w-full rounded bg-fill-soft" />
          <div className="h-3 w-2/3 rounded bg-fill-soft" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/40 p-6 text-center backdrop-blur-[2px]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h4 className="text-sm font-semibold text-on-surface">
                {t.locked.title}
              </h4>
              <Badge>{t.locked.badge}</Badge>
            </div>
            <p className="mx-auto max-w-sm text-xs text-on-surface-variant">
              {t.locked.description}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/billing">
              {t.locked.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AnalysisCard({ workspaceId }: { workspaceId: number | null }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['business-analysis', workspaceId],
    queryFn: () => businessProfileService.analysis(),
    enabled: workspaceId !== null,
  });

  if (workspaceId === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary/70" />
          <div>
            <h3 className="text-base font-semibold text-on-surface">
              {t.title}
            </h3>
            <p className="text-xs text-on-surface-variant">{t.subtitle}</p>
          </div>
        </div>
        {data?.available && data.website && (
          <span className="max-w-[40%] truncate text-xs text-on-surface-variant">
            {hostOf(data.website)}
          </span>
        )}
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-6 text-sm text-on-surface-variant">{t.error}</p>
        )}

        {!isLoading && !isError && data && !data.available && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fill-soft">
              <Globe className="h-5 w-5 text-on-surface-variant" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-on-surface">
                {t.empty.title}
              </h4>
              <p className="mx-auto max-w-sm text-xs text-on-surface-variant">
                {t.empty.description}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">{t.empty.cta}</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && data?.available && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <ScoreGauge score={data.analysis.score} band={data.analysis.band} />
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    {t.scoreLabel}
                  </span>
                  <Badge className={BAND_BADGE[data.analysis.band]}>
                    {t.bands[data.analysis.band]}
                  </Badge>
                </div>
                <p className="text-sm text-on-surface">{data.analysis.summary}</p>
                {data.analysis.brand_tone && (
                  <p className="text-xs text-on-surface-variant">
                    <span className="font-semibold">{t.brandToneLabel}:</span>{' '}
                    {data.analysis.brand_tone}
                  </p>
                )}
                {data.analyzed_at && (
                  <p className="text-[11px] text-on-surface-variant/70">
                    {t.analyzedAt(
                      new Date(data.analyzed_at).toLocaleDateString('de-DE'),
                    )}
                  </p>
                )}
              </div>
            </div>

            {data.tier === 'full' ? (
              <FullAnalysis a={data.analysis} />
            ) : (
              <TeaserAnalysis a={data.analysis} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
