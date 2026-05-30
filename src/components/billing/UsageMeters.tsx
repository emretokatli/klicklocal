'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { de } from '@/lib/i18n/de';
import type { MeteredUsageItem } from '@/types/api';

const LABELS: Record<string, string> = {
  ai_monthly_tokens: de.billing.features.aiTokens,
  storage_limit_mb: de.billing.features.storage,
  scheduled_posts_monthly: de.billing.features.scheduledPosts,
  media_uploads_monthly: de.billing.features.mediaUploads,
  api_calls_monthly: de.billing.features.apiCalls,
};

function pct(used: number, limit: number | boolean | null): number {
  if (limit === null || typeof limit === 'boolean') return 0;
  if (limit < 0) return 5;
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function UsageMeters({
  usage,
  title = de.billing.usageTitle,
}: {
  usage: Record<string, MeteredUsageItem>;
  title?: string;
}) {
  const entries = Object.entries(usage);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map(([key, row]) => {
          const unlimited = typeof row.limit === 'number' && row.limit < 0;
          const label = LABELS[key] ?? key;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="text-on-surface-variant">
                  {row.used}
                  {unlimited
                    ? ` / ${de.billing.unlimited}`
                    : row.limit !== null && typeof row.limit === 'number'
                      ? ` / ${row.limit}`
                      : ''}
                </span>
              </div>
              {!unlimited && typeof row.limit === 'number' && row.limit >= 0 && (
                <Progress value={pct(row.used, row.limit)} className="h-2" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
