'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { postsService } from '@/services/posts.service';

const t = de.calendar.dialog;

export type ConnectedAccount = {
  id: number;
  provider: string;
  label: string;
};

type Props = {
  workspaceId: number;
  accounts: ConnectedAccount[];
  /** Pre-fill the date (yyyy-mm-dd) when opening from a calendar day. */
  defaultDate?: string;
  onScheduled?: () => void;
  trigger: React.ReactNode;
};

function defaultDateTimeLocal(date?: string): string {
  const base = date ? new Date(`${date}T10:00`) : new Date(Date.now() + 60 * 60 * 1000);
  // Format to yyyy-MM-ddThh:mm in local time for <input type="datetime-local">.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`;
}

export function CalendarScheduleDialog({
  workspaceId,
  accounts,
  defaultDate,
  onScheduled,
  trigger,
}: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState(defaultDateTimeLocal(defaultDate));
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      postsService.scheduleMulti(workspaceId, {
        content: content.trim(),
        scheduled_at: new Date(scheduledAt).toISOString(),
        social_account_ids: selected,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts', workspaceId] });
      setOpen(false);
      setContent('');
      setSelected([]);
      setError(null);
      onScheduled?.();
    },
    onError: (e: Error) => {
      setError(e instanceof ApiClientError ? e.message : t.errorGeneric);
    },
  });

  const submit = () => {
    setError(null);
    if (content.trim() === '') {
      setError(t.errorNoContent);
      return;
    }
    if (selected.length === 0) {
      setError(t.errorNoPlatform);
      return;
    }
    mutation.mutate();
  };

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-on-surface-variant" htmlFor="cal-content">
              {t.content}
            </label>
            <Textarea
              id="cal-content"
              rows={4}
              value={content}
              placeholder={t.contentPlaceholder}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-on-surface-variant" htmlFor="cal-when">
              {t.scheduledAt}
            </label>
            <input
              id="cal-when"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-outline-soft bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-on-surface-variant">{t.platforms}</p>
            {accounts.length === 0 ? (
              <p className="text-xs text-on-surface-variant">{t.noPlatforms}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => {
                  const active = selected.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        active
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-outline-soft text-on-surface-variant'
                      }`}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">{de.common.cancel}</Button>
            </DialogClose>
            <Button
              disabled={mutation.isPending || accounts.length === 0}
              onClick={submit}
            >
              {mutation.isPending ? t.submitting : t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
