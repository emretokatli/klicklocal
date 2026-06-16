'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, X } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosts } from '@/hooks/use-posts';
import { de } from '@/lib/i18n/de';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { PostStatus } from '@/types/api';

type GettingStartedChecklistProps = {
  workspaceId: number;
  /** Where "publish first post" sends the user (drafts anchor or /ai). */
  firstPostHref: string;
};

// "Hide for now" is persisted in localStorage, per workspace. localStorage is
// the project's established lightweight-persistence layer (see lib/token.ts,
// theme-context) so no backend field is needed for this soft dismissal.
// Read via useSyncExternalStore — the same SSR-safe pattern theme-context uses.
const dismissListeners = new Set<() => void>();

function subscribeDismiss(listener: () => void): () => void {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
}

function dismissKey(workspaceId: number): string {
  return `klicklocal_checklist_dismissed_${workspaceId}`;
}

function readDismissed(workspaceId: number): boolean {
  try {
    return window.localStorage.getItem(dismissKey(workspaceId)) === '1';
  } catch {
    return false;
  }
}

function persistDismissed(workspaceId: number): void {
  try {
    window.localStorage.setItem(dismissKey(workspaceId), '1');
  } catch {
    // storage unavailable (private mode) — dismissal still applies this session
  }
  dismissListeners.forEach((listener) => listener());
}

// A post counts as "published" for the checklist once it has left the draft
// stage (queued, scheduled, processing or live).
const FIRST_POST_STATUSES: PostStatus[] = [
  'published',
  'processing',
  'scheduled',
];

/**
 * Top-of-dashboard onboarding checklist. Computes its task state entirely from
 * ungated reads (GET /posts + social-accounts status), so it renders for users
 * without a subscription. Disappears when all tasks are done or when dismissed.
 */
export function GettingStartedChecklist({
  workspaceId,
  firstPostHref,
}: GettingStartedChecklistProps) {
  const t = de.dashboard.checklist;

  const dismissed = useSyncExternalStore(
    subscribeDismiss,
    () => readDismissed(workspaceId),
    () => false,
  );

  const postsQuery = usePosts(workspaceId);

  // Reuse the same query keys as the social-accounts page so the cache is shared.
  const instagramStatusQuery = useQuery({
    queryKey: ['instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId),
  });
  const tiktokStatusQuery = useQuery({
    queryKey: ['tiktok', 'status', workspaceId],
    queryFn: () => socialAccountsService.tiktokStatus(workspaceId),
  });
  const facebookStatusQuery = useQuery({
    queryKey: ['facebook', 'status', workspaceId],
    queryFn: () => socialAccountsService.facebookStatus(workspaceId),
  });

  // Wait for the primary posts read to settle to avoid an "all open" flash.
  if (dismissed || postsQuery.isLoading) return null;

  const posts = postsQuery.data ?? [];

  const firstPostDone = posts.some((p) =>
    FIRST_POST_STATUSES.includes(p.status),
  );
  const weekPlanDone = posts.some((p) => p.status === 'scheduled');
  const socialConnected = Boolean(
    instagramStatusQuery.data?.connected ||
      tiktokStatusQuery.data?.connected ||
      facebookStatusQuery.data?.connected,
  );

  const tasks = [
    { label: t.tasks.firstPost, href: firstPostHref, done: firstPostDone },
    { label: t.tasks.weekPlan, href: '/calendar', done: weekPlanDone },
    {
      label: t.tasks.connectSocial,
      href: '/social-accounts',
      done: socialConnected,
    },
  ];

  const doneCount = tasks.filter((task) => task.done).length;

  // All done → the checklist has served its purpose; remove it entirely.
  if (doneCount === tasks.length) return null;

  const handleDismiss = () => {
    persistDismissed(workspaceId);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>{t.title}</CardTitle>
          <p className="text-sm text-on-surface-variant">{t.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
            {t.progress(doneCount, tasks.length)}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex items-center gap-1 text-xs font-medium text-on-surface-variant transition hover:text-on-surface"
          >
            <X className="h-3.5 w-3.5" />
            {t.dismiss}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.href}>
              <Link
                href={task.href}
                className="flex items-center gap-3 rounded-xl border border-outline-soft bg-fill-soft px-4 py-3 transition hover:border-primary/40 hover:bg-fill-strong"
              >
                {task.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-on-surface-variant" />
                )}
                <span
                  className={
                    task.done
                      ? 'text-sm text-on-surface-variant line-through'
                      : 'text-sm font-medium text-on-surface'
                  }
                >
                  {task.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
