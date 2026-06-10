'use client';

import { CalendarClock, CheckCircle2, Eye, FileText, TrendingUp, Users, XCircle } from 'lucide-react';
import Link from 'next/link';

import { UsageSummaryWidget } from '@/components/dashboard/UsageSummaryWidget';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKpi } from '@/hooks/use-analytics';
import { usePosts } from '@/hooks/use-posts';
import { de } from '@/lib/i18n/de';
import { postsService } from '@/services/posts.service';
import { useAuth } from '@/store/auth-context';
import { useWorkspace } from '@/store/workspace-context';

const statCards = [
  { key: 'total', label: de.dashboard.stats.total, icon: FileText },
  { key: 'scheduled', label: de.dashboard.stats.scheduled, icon: CalendarClock },
  { key: 'published', label: de.dashboard.stats.published, icon: CheckCircle2 },
  { key: 'failed', label: de.dashboard.stats.failed, icon: XCircle },
] as const;

export default function DashboardPage() {
  const { session } = useAuth();
  const { workspaceId, workspace } = useWorkspace();
  const postsQuery = usePosts(workspaceId);
  const kpiQuery = useKpi(workspaceId);

  const stats = postsQuery.data
    ? postsService.computeStats(postsQuery.data)
    : null;

  return (
    <div>
      <PageHeader
        title={de.dashboard.title}
        description={
          workspace
            ? de.dashboard.overviewFor(workspace.name)
            : de.dashboard.selectWorkspace
        }
      />

      {session && !session.onboarding_completed && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-on-surface">
          <strong>Profil nicht vollständig.</strong> Für bessere KI-Inhalte{' '}
          <Link href="/settings" className="underline">
            Einstellungen
          </Link>{' '}
          aufrufen und Unternehmensprofil ergänzen.
        </div>
      )}

      {kpiQuery.data && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-medium text-on-surface-variant">Analytics</p>
            {kpiQuery.data.is_estimated && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-on-surface-variant">
                Geschätzt
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-on-surface-variant">Impressionen</CardTitle>
                <Eye className="h-4 w-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{kpiQuery.data.impressions.toLocaleString('de-DE')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-on-surface-variant">Reichweite</CardTitle>
                <Users className="h-4 w-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{kpiQuery.data.reach.toLocaleString('de-DE')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-on-surface-variant">Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{kpiQuery.data.engagement_rate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {postsQuery.isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-on-surface-variant">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {stats[key as keyof typeof stats]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <UsageSummaryWidget workspaceId={workspaceId} />
      </div>

      {!workspaceId && !postsQuery.isLoading && (
        <p className="text-sm text-on-surface-variant">
          {de.dashboard.createWorkspaceHint}
        </p>
      )}
    </div>
  );
}
