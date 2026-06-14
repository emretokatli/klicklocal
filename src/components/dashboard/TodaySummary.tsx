'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { de } from '@/lib/i18n/de';
import { contentPlanService } from '@/services/content-plan.service';
import { trendsService } from '@/services/trends.service';

const t = de.dashboard.today;
const platforms = de.dashboard.plan.platforms;

function platformLabel(platform: string): string {
  return platforms[platform] ?? platform;
}

/**
 * One-line "what to do today" derived from the weekly plan + top fitting trend.
 * Both sources are optional: the plan is subscription-gated (its query may fail
 * with 402) and trends may be empty — in every combination a friendly line is
 * shown, so this never renders blank.
 */
export function TodaySummary({ workspaceId }: { workspaceId: number | null }) {
  const trendsQuery = useQuery({
    queryKey: ['trends', workspaceId],
    queryFn: () => trendsService.list(),
    enabled: workspaceId !== null,
  });

  // Plan is gated; a non-subscriber gets a 402. Don't retry, treat as "no plan".
  const planQuery = useQuery({
    queryKey: ['content-plan', workspaceId],
    queryFn: () => contentPlanService.weekly(),
    enabled: workspaceId !== null,
    retry: false,
  });

  if (workspaceId === null) return null;

  const loading = trendsQuery.isLoading || planQuery.isLoading;

  const topTrend = trendsQuery.data?.trends.find((trend) => trend.fit) ?? null;

  const suggestions = planQuery.data?.suggestions ?? [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSuggestion =
    suggestions.find((s) => s.date === todayStr) ??
    suggestions.find((s) => s.date >= todayStr) ??
    suggestions[0] ??
    null;

  let line: string;
  if (todaysSuggestion && topTrend) {
    line = t.planAndTrend(
      todaysSuggestion.category_label,
      platformLabel(todaysSuggestion.platform),
      topTrend.title,
    );
  } else if (todaysSuggestion) {
    line = t.planLine(
      todaysSuggestion.category_label,
      platformLabel(todaysSuggestion.platform),
    );
  } else if (topTrend) {
    line = t.trendLine(topTrend.title);
  } else {
    line = t.fallback;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-surface to-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t.greeting}
          </p>
          {loading ? (
            <Skeleton className="mt-1.5 h-6 w-3/4" />
          ) : (
            <p className="font-sora text-lg font-semibold leading-snug text-on-surface">
              {line}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
