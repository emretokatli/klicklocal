'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { de } from '@/lib/i18n/de';
import { billingService } from '@/services/billing.service';
import type { MeteredUsageItem } from '@/types/api';

const FEATURED_KEYS = [
  'scheduled_posts_monthly',
  'ai_monthly_tokens',
  'media_uploads_monthly',
] as const;

function limitLabel(limit: MeteredUsageItem['limit']): string {
  if (typeof limit === 'number' && limit < 0) return '∞';
  if (typeof limit === 'number') return String(limit);
  return '∞';
}

function usedPct(used: number, limit: MeteredUsageItem['limit']): number {
  if (typeof limit !== 'number' || limit < 0 || limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function UsageSummaryWidget({
  workspaceId,
}: {
  workspaceId: number | null;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['usage', workspaceId],
    queryFn: () => billingService.usage(workspaceId!),
    enabled: workspaceId !== null,
  });

  const rows = FEATURED_KEYS.map((key) => ({
    key,
    label: de.dashboard.usageSummary.features[key],
    item: data?.[key] ?? null,
  }));

  const hasData = rows.some((r) => r.item !== null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {de.dashboard.usageSummary.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {FEATURED_KEYS.map((k) => (
              <div key={k} className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-fill-strong" />
                <div className="h-1.5 w-full animate-pulse rounded-full bg-fill-strong" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !hasData && (
          <p className="text-sm text-on-surface-variant">
            {de.dashboard.usageSummary.noSubscription}
          </p>
        )}

        {!isLoading &&
          hasData &&
          rows.map(({ key, label, item }) => {
            if (!item) return null;
            const unlimited =
              typeof item.limit === 'number' && item.limit < 0;
            const pct = usedPct(item.used, item.limit);

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-on-surface-variant">
                    {de.dashboard.usageSummary.used(
                      item.used,
                      limitLabel(item.limit),
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  {!unlimited && (
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}

        <div className="pt-1">
          <Link
            href="/usage"
            className="text-xs text-primary hover:underline"
          >
            {de.dashboard.usageSummary.detailsLink}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
