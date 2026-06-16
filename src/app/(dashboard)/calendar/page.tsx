'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  CalendarScheduleDialog,
  type ConnectedAccount,
} from '@/components/calendar/CalendarScheduleDialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { de } from '@/lib/i18n/de';
import { postsService } from '@/services/posts.service';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { Post } from '@/types/api';
import { useWorkspace } from '@/store/workspace-context';

const t = de.calendar;

function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CalendarPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const postsQuery = useQuery({
    queryKey: ['posts', workspaceId],
    queryFn: () => postsService.list(workspaceId!),
    enabled: workspaceId !== null,
  });

  const igQuery = useQuery({
    queryKey: ['instagram', 'status', workspaceId],
    queryFn: () => socialAccountsService.instagramStatus(workspaceId!),
    enabled: workspaceId !== null,
  });
  const ttQuery = useQuery({
    queryKey: ['tiktok', 'status', workspaceId],
    queryFn: () => socialAccountsService.tiktokStatus(workspaceId!),
    enabled: workspaceId !== null,
  });
  const fbQuery = useQuery({
    queryKey: ['facebook', 'status', workspaceId],
    queryFn: () => socialAccountsService.facebookStatus(workspaceId!),
    enabled: workspaceId !== null,
  });

  const accounts = useMemo<ConnectedAccount[]>(() => {
    const out: ConnectedAccount[] = [];
    const add = (
      data: { connected: boolean; account: { id: number; provider: string; account_name: string | null; username: string | null } | null } | undefined,
      fallback: string,
    ) => {
      if (data?.connected && data.account) {
        out.push({
          id: data.account.id,
          provider: data.account.provider,
          label: data.account.account_name || data.account.username || fallback,
        });
      }
    };
    add(igQuery.data, 'Instagram');
    add(ttQuery.data, 'TikTok');
    add(fbQuery.data, 'Facebook');
    return out;
  }, [igQuery.data, ttQuery.data, fbQuery.data]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of postsQuery.data ?? []) {
      const when = post.scheduled_at ?? post.published_at;
      if (!when) continue;
      const key = toDateKey(new Date(when));
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return map;
  }, [postsQuery.data]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    // Monday-first offset.
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const result: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(cursor.year, cursor.month, d));
    }
    return result;
  }, [cursor]);

  if (!workspaceId) {
    return <EmptyState title={t.noWorkspace} description={de.dashboard.selectWorkspace} />;
  }

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
  const todayKey = toDateKey(new Date());

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });

  return (
    <div>
      <PageHeader
        title={t.title}
        description={`${t.description} — ${workspace?.name ?? ''}`}
        action={
          <CalendarScheduleDialog
            workspaceId={workspaceId}
            accounts={accounts}
            trigger={<Button>{t.schedulePost}</Button>}
          />
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => shiftMonth(-1)} aria-label={t.prevMonth}>
            ‹
          </Button>
          <span className="min-w-40 text-center font-medium capitalize">{monthLabel}</span>
          <Button variant="outline" onClick={() => shiftMonth(1)} aria-label={t.nextMonth}>
            ›
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const now = new Date();
            setCursor({ year: now.getFullYear(), month: now.getMonth() });
          }}
        >
          {t.today}
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-outline-soft bg-outline-soft">
        {t.weekdays.map((wd) => (
          <div
            key={wd}
            className="bg-surface-container-high px-2 py-2 text-center text-xs font-medium text-on-surface-variant"
          >
            {wd}
          </div>
        ))}
        {cells.map((day, idx) => {
          const key = day ? toDateKey(day) : `blank-${idx}`;
          const dayPosts = day ? (postsByDay.get(key) ?? []) : [];
          const isToday = day && key === todayKey;
          return (
            <div
              key={key}
              className={`min-h-24 bg-surface p-1.5 ${day ? '' : 'opacity-40'}`}
            >
              {day && (
                <CalendarScheduleDialog
                  workspaceId={workspaceId}
                  accounts={accounts}
                  defaultDate={key}
                  trigger={
                    <button
                      type="button"
                      className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  }
                />
              )}
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary"
                    title={post.content ?? ''}
                  >
                    {(t.statusLabels[post.status as keyof typeof t.statusLabels] ?? post.status)}: {post.content ?? post.title ?? '—'}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="px-1.5 text-[11px] text-on-surface-variant">
                    +{dayPosts.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
