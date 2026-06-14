'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { de } from '@/lib/i18n/de';
import { contentPlanService } from '@/services/content-plan.service';

const t = de.dashboard.plan;
const MAX_SUGGESTIONS = 4;

function platformLabel(platform: string): string {
  return t.platforms[platform] ?? platform;
}

/** Compact upgrade card used as the SubscriptionGate fallback on the dashboard. */
export function PlanUpgradeFallback() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-sm font-semibold text-on-surface">
              {t.locked.title}
            </h3>
            <Badge>{t.locked.badge}</Badge>
          </div>
          <p className="mx-auto max-w-xs text-xs text-on-surface-variant">
            {t.locked.description}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/billing">{t.locked.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlanCard({ workspaceId }: { workspaceId: number | null }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['content-plan', workspaceId],
    queryFn: () => contentPlanService.weekly(),
    enabled: workspaceId !== null,
  });

  if (workspaceId === null) return null;

  const suggestions = (data?.suggestions ?? []).slice(0, MAX_SUGGESTIONS);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <CalendarDays className="h-4 w-4 text-primary/70" />
        <div>
          <h3 className="text-base font-semibold text-on-surface">{t.title}</h3>
          <p className="text-xs text-on-surface-variant">{t.subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-outline-soft p-3"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="py-4 text-sm text-on-surface-variant">{t.error}</p>
        )}

        {!isLoading && !isError && suggestions.length === 0 && (
          <p className="py-4 text-sm text-on-surface-variant">{t.empty}</p>
        )}

        {!isLoading &&
          !isError &&
          suggestions.map((s) => (
            <div
              key={`${s.date}-${s.category}`}
              className="rounded-xl border border-outline-soft p-3 transition-colors hover:border-primary/40"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">
                  {s.day}
                </span>
                <Badge variant="secondary">{s.category_label}</Badge>
                <span className="text-xs text-on-surface-variant">
                  {platformLabel(s.platform)}
                </span>
              </div>
              <p className="mb-3 text-xs text-on-surface-variant">{s.idea}</p>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/ai?category=${encodeURIComponent(
                    s.category,
                  )}&platform=${encodeURIComponent(s.platform)}`}
                >
                  <Sparkles className="h-4 w-4" />
                  {t.createCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
