'use client';

import { CalendarClock, CheckCircle2, FileText, XCircle } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosts } from '@/hooks/use-posts';
import { de } from '@/lib/i18n/de';
import { postsService } from '@/services/posts.service';
import { useWorkspace } from '@/store/workspace-context';

const statCards = [
  { key: 'total', label: de.dashboard.stats.total, icon: FileText },
  { key: 'scheduled', label: de.dashboard.stats.scheduled, icon: CalendarClock },
  { key: 'published', label: de.dashboard.stats.published, icon: CheckCircle2 },
  { key: 'failed', label: de.dashboard.stats.failed, icon: XCircle },
] as const;

export default function DashboardPage() {
  const { workspaceId, workspace } = useWorkspace();
  const postsQuery = usePosts(workspaceId);

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

      {!workspaceId && !postsQuery.isLoading && (
        <p className="text-sm text-on-surface-variant">
          {de.dashboard.createWorkspaceHint}
        </p>
      )}
    </div>
  );
}
