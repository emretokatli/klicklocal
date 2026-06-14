'use client';

import { useQuery } from '@tanstack/react-query';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { de } from '@/lib/i18n/de';
import { trendsService } from '@/services/trends.service';

const t = de.dashboard.trends;
const MAX_TRENDS = 4;

export function TrendsCard({ workspaceId }: { workspaceId: number | null }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trends', workspaceId],
    queryFn: () => trendsService.list(),
    enabled: workspaceId !== null,
  });

  if (workspaceId === null) return null;

  // Backend already sorts fitting trends first; show the fitting ones.
  const fitting = (data?.trends ?? [])
    .filter((trend) => trend.fit)
    .slice(0, MAX_TRENDS);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Flame className="h-4 w-4 text-primary/70" />
        <div>
          <h3 className="text-base font-semibold text-on-surface">{t.title}</h3>
          <p className="text-xs text-on-surface-variant">{t.subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-outline-soft p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-4 text-sm text-on-surface-variant">{t.error}</p>
        )}

        {!isLoading && !isError && fitting.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fill-soft">
              <Sparkles className="h-5 w-5 text-on-surface-variant" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-on-surface">
                {t.empty.title}
              </h4>
              <p className="mx-auto max-w-xs text-xs text-on-surface-variant">
                {t.empty.description}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">{t.empty.cta}</Link>
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          fitting.map((trend) => (
            <div
              key={trend.id}
              className="rounded-xl border border-outline-soft p-3 transition-colors hover:border-primary/40 hover:bg-fill-soft"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-on-surface">
                  {trend.title}
                </h4>
                <span className="flex shrink-0 items-center gap-1 text-xs text-primary">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t.fitBadge}
                </span>
              </div>
              <p className="mb-2 text-xs text-on-surface-variant">
                {trend.comment}
              </p>
              <Badge variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                {trend.suggestion}
              </Badge>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
