'use client';

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  EyeOff,
  FileDown,
  History,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquareQuote,
  Search,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import {
  buildReportPdfFilename,
  exportReportToPdf,
} from '@/lib/web-analyze/export-report-pdf';
import {
  formatEuro,
  mergeReportWithApi,
  parseWebAnalyzeReport,
} from '@/lib/web-analyze/parse-report';
import { cn } from '@/lib/utils';
import type { WebAnalyzeResult } from '@/types/api';
import type { WebAnalyzeRun } from '@/types/api';

type Props = {
  result: WebAnalyzeResult;
  run: WebAnalyzeRun | null;
};

function scoreStyles(score: number) {
  if (score < 40) {
    return {
      ring: 'from-error/80 to-amber-600',
      text: 'text-amber-500',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
  }
  if (score < 60) {
    return {
      ring: 'from-amber-500 to-primary',
      text: 'text-amber-500',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
  }
  if (score < 80) {
    return {
      ring: 'from-primary to-secondary',
      text: 'text-primary',
      badge: 'bg-primary/15 text-primary border-primary/30',
    };
  }
  return {
    ring: 'from-emerald-500 to-primary',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };
}

function categoryBarColor(ratio: number) {
  if (ratio >= 0.7) return 'bg-primary';
  if (ratio >= 0.4) return 'bg-amber-500';
  return 'bg-error';
}

function ListSection({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
  variant: 'success' | 'warning' | 'neutral';
}) {
  if (!items.length) return null;

  const styles = {
    success: 'border-primary/20 bg-primary/5',
    warning: 'border-error/20 bg-error/5',
    neutral: 'border-outline-soft bg-surface-container-high',
  }[variant];

  const iconColor = {
    success: 'text-primary',
    warning: 'text-error',
    neutral: 'text-tertiary',
  }[variant];

  return (
    <Card className={cn('border', styles)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-5 w-5', iconColor)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm leading-relaxed text-on-surface">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
            <p>{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function WebAnalyzeReport({ result, run }: Props) {
  const [exporting, setExporting] = useState<'customer' | 'internal' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const report = useMemo(() => {
    const parsed = parseWebAnalyzeReport(result.report_markdown);
    return mergeReportWithApi(
      parsed,
      result.score,
      result.band,
      result.website,
    );
  }, [result]);

  const styles = report.score !== null ? scoreStyles(report.score) : null;
  const maxRevenue = report.growthForecast.reduce(
    (max, row) => Math.max(max, row.revenueMax ?? 0),
    0,
  );

  const handleExportPdf = async (internal: boolean) => {
    if (exporting) return;

    setExporting(internal ? 'internal' : 'customer');
    setExportError(null);

    try {
      await exportReportToPdf(
        report,
        {
          model: result.model,
          durationMs: result.duration_ms,
          totalCostUsd: run?.total_cost_usd ?? result.total_cost_usd ?? null,
        },
        buildReportPdfFilename(report.businessName, internal),
        { internal },
      );
    } catch {
      setExportError(de.admin.websiteAnalyze.report.pdfFailed);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={exporting !== null}
          onClick={() => void handleExportPdf(true)}
          className="gap-2 text-on-surface-variant"
        >
          {exporting === 'internal' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {exporting === 'internal'
            ? de.admin.websiteAnalyze.report.pdfExporting
            : de.admin.websiteAnalyze.report.downloadInternalPdf}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={exporting !== null}
          onClick={() => void handleExportPdf(false)}
          className="gap-2"
        >
          {exporting === 'customer' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {exporting === 'customer'
            ? de.admin.websiteAnalyze.report.pdfExporting
            : de.admin.websiteAnalyze.report.downloadPdf}
        </Button>
      </div>

      {exportError && (
        <p className="text-sm text-error">{exportError}</p>
      )}

      <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-outline-soft bg-surface-container">
        <CardContent className="p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {de.admin.websiteAnalyze.report.leadAnalysis}
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                {report.businessName}
              </h2>
              {report.url && (
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  {report.url}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {report.band && (
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-3 py-1 text-sm font-medium',
                      styles?.badge,
                    )}
                  >
                    {report.band}
                  </span>
                )}
                {result.cached && (
                  <span
                    title={de.admin.websiteAnalyze.report.cached}
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline-soft bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant"
                  >
                    <History className="h-3.5 w-3.5" />
                    {de.admin.websiteAnalyze.report.cached}
                  </span>
                )}
              </div>
            </div>

            {report.score !== null && styles && (
              <div className="flex flex-col items-center justify-center">
                <div
                  className={cn(
                    'relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br p-[3px] shadow-lg',
                    styles.ring,
                  )}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface-container-high">
                    <span className={cn('text-4xl font-bold tabular-nums', styles.text)}>
                      {report.score}
                    </span>
                    <span className="text-xs font-medium text-on-surface-variant">/ 100</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {de.admin.websiteAnalyze.report.overallScore}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth forecast — hero metrics */}
      {report.growthForecast.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-on-surface">
              {de.admin.websiteAnalyze.report.growthForecast}
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {report.growthForecast.map((row) => (
              <Card
                key={row.horizon}
                className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-surface-container-high to-tertiary/5"
              >
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-on-surface-variant">
                    {row.horizon}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">{row.growth}</p>
                  <p className="mt-4 text-xs uppercase tracking-wide text-on-surface-variant">
                    {de.admin.websiteAnalyze.report.revenuePotential}
                  </p>
                  {row.revenueMin !== undefined && row.revenueMax !== undefined ? (
                    <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-on-surface sm:text-4xl">
                      {formatEuro(row.revenueMin)}
                      <span className="mx-2 text-lg font-normal text-on-surface-variant">
                        –
                      </span>
                      {formatEuro(row.revenueMax)}
                    </p>
                  ) : (
                    <p className="mt-1 text-2xl font-bold text-on-surface">{row.revenue}</p>
                  )}
                  {maxRevenue > 0 && row.revenueMax !== undefined && (
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-outline-soft">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(row.revenueMax / maxRevenue) * 100}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {(report.growthAssumptions || report.growthDisclaimer) && (
            <div className="rounded-xl border border-outline-soft bg-surface-container-high px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
              {report.growthAssumptions && (
                <p>
                  <span className="font-semibold text-on-surface">
                    {de.admin.websiteAnalyze.report.assumptions}:{' '}
                  </span>
                  {report.growthAssumptions}
                </p>
              )}
              {report.growthDisclaimer && (
                <p className="mt-2 italic">{report.growthDisclaimer}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Category scores */}
      {report.categories.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-on-surface">
            {de.admin.websiteAnalyze.report.categoryScores}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.categories.map((cat) => {
              const ratio = cat.max > 0 ? cat.points / cat.max : 0;
              return (
                <Card key={cat.name} className="border-outline-soft bg-surface-container-high">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-on-surface">
                        {cat.name}
                      </p>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-on-surface">
                        {cat.points}
                        <span className="font-normal text-on-surface-variant">/{cat.max}</span>
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-outline-soft">
                      <div
                        className={cn('h-full rounded-full transition-all', categoryBarColor(ratio))}
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-right text-xs text-on-surface-variant">
                      {Math.round(ratio * 100)}%
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Talking points — sales hooks */}
      {report.talkingPoints.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-tertiary" />
            <h3 className="text-lg font-semibold text-on-surface">
              {de.admin.websiteAnalyze.report.talkingPoints}
            </h3>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {report.talkingPoints.map((point, i) => (
              <Card
                key={i}
                className="border-tertiary/25 bg-gradient-to-r from-tertiary/10 to-transparent"
              >
                <CardContent className="flex gap-4 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary/20 text-sm font-bold text-tertiary">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-on-surface">{point}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Strengths & weaknesses */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ListSection
          title={de.admin.websiteAnalyze.report.strengths}
          icon={CheckCircle2}
          items={report.strengths}
          variant="success"
        />
        <ListSection
          title={de.admin.websiteAnalyze.report.weaknesses}
          icon={AlertTriangle}
          items={report.weaknesses}
          variant="warning"
        />
      </div>

      {/* Social audit + Google visibility (v2) */}
      {(report.socialAudit || report.googleVisibility) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {report.socialAudit && (
            <Card className="border-outline-soft bg-surface-container-high">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="h-5 w-5 text-tertiary" />
                  {de.admin.websiteAnalyze.report.socialAudit}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
                  {report.socialAudit}
                </p>
              </CardContent>
            </Card>
          )}
          {report.googleVisibility && (
            <Card className="border-outline-soft bg-surface-container-high">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-5 w-5 text-primary" />
                  {de.admin.websiteAnalyze.report.googleVisibility}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
                  {report.googleVisibility}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Improvements */}
      {report.improvements.length > 0 && (
        <Card className="border-outline-soft bg-surface-container-high">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              {de.admin.websiteAnalyze.report.improvements}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {report.improvements.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-outline-soft bg-surface-container p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <p className="flex-1 text-sm leading-relaxed text-on-surface">{item}</p>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Klicklocal pitch mapping (v2) */}
      {report.klicklocalPitch.length > 0 && (
        <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-surface-container-high to-tertiary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              {de.admin.websiteAnalyze.report.klicklocalPitch}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {report.klicklocalPitch.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed text-on-surface">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="whitespace-pre-line">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CRM + Market */}
      <div className="grid gap-4 lg:grid-cols-2">
        {report.crm.length > 0 && (
          <Card className="border-outline-soft bg-surface-container-high">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-secondary" />
                {de.admin.websiteAnalyze.report.crm}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
              {report.crm.map((field) => (
                <div key={field.label} className="rounded-lg bg-surface-container p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-on-surface break-words">
                    {field.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {report.marketPotential && (
          <Card className="border-outline-soft bg-surface-container-high">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-primary" />
                {de.admin.websiteAnalyze.report.marketPotential}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed text-on-surface">
                {report.marketPotential}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SEO */}
      {report.seoAssessment && (
        <Card className="border-outline-soft bg-surface-container-high">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {de.admin.websiteAnalyze.report.seoAssessment}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-on-surface">{report.seoAssessment}</p>
          </CardContent>
        </Card>
      )}

      {/* Internal notes (v2) — never part of the customer deliverable */}
      {report.internalNotes && (
        <details className="group rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-on-surface">
            <EyeOff className="h-4 w-4 text-amber-500" />
            {de.admin.websiteAnalyze.report.internalNotes}
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
              {de.admin.websiteAnalyze.report.internalNotesHint}
            </span>
            <ChevronRight className="ml-auto h-4 w-4 text-on-surface-variant transition-transform group-open:rotate-90" />
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
            {report.internalNotes}
          </p>
        </details>
      )}

      {/* Meta footer */}
      <p className="text-xs text-on-surface-variant">
        {[
          result.model ? `${de.admin.websiteAnalyze.model}: ${result.model}` : null,
          result.duration_ms !== null
            ? `${de.admin.websiteAnalyze.duration}: ${Math.round(result.duration_ms / 1000)}s`
            : null,
          run?.total_cost_usd != null
            ? `${de.admin.websiteAnalyze.cost}: $${run.total_cost_usd.toFixed(2)}`
            : null,
          run?.num_turns != null
            ? `${de.admin.websiteAnalyze.turns}: ${run.num_turns}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      </div>
    </div>
  );
}
