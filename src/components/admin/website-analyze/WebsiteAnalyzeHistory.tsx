'use client';

import { Loader2 } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { de } from '@/lib/i18n/de';
import { cn } from '@/lib/utils';
import type { WebAnalyzeRunSummary } from '@/types/api';

type Props = {
  runs: WebAnalyzeRunSummary[];
  isLoading: boolean;
  selectedId: string | null;
  loadingId: string | null;
  onSelect: (id: string) => void;
};

function statusLabel(status: WebAnalyzeRunSummary['status']) {
  switch (status) {
    case 'completed':
      return de.admin.websiteAnalyze.history.statusCompleted;
    case 'failed':
      return de.admin.websiteAnalyze.history.statusFailed;
    case 'processing':
      return de.admin.websiteAnalyze.history.statusProcessing;
    default:
      return de.admin.websiteAnalyze.history.statusPending;
  }
}

function statusClass(status: WebAnalyzeRunSummary['status']) {
  switch (status) {
    case 'completed':
      return 'text-primary';
    case 'failed':
      return 'text-error';
    case 'processing':
      return 'text-amber-500';
    default:
      return 'text-on-surface-variant';
  }
}

function formatWhen(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function displayHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function WebsiteAnalyzeHistory({
  runs,
  isLoading,
  selectedId,
  loadingId,
  onSelect,
}: Props) {
  return (
    <Card className="border-outline-soft bg-surface-container-high">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{de.admin.websiteAnalyze.history.title}</CardTitle>
        <p className="text-sm text-on-surface-variant">
          {de.admin.websiteAnalyze.history.description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && (
          <div className="flex items-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" />
            {de.common.loading}
          </div>
        )}

        {!isLoading && runs.length === 0 && (
          <EmptyState
            title={de.admin.websiteAnalyze.history.empty}
            description=""
          />
        )}

        {!isLoading && runs.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{de.admin.websiteAnalyze.history.date}</TableHead>
                  <TableHead>{de.admin.websiteAnalyze.history.website}</TableHead>
                  <TableHead>{de.admin.websiteAnalyze.history.score}</TableHead>
                  <TableHead>{de.admin.websiteAnalyze.history.status}</TableHead>
                  <TableHead className="text-right">{de.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((item) => {
                  const isSelected = selectedId === item.id;
                  const isOpening = loadingId === item.id;

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(isSelected && 'bg-primary/5')}
                    >
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatWhen(item.completed_at ?? item.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px] truncate font-medium text-on-surface">
                          {displayHost(item.website)}
                        </div>
                        <div className="max-w-[220px] truncate text-xs text-on-surface-variant">
                          {item.website}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.score !== null ? (
                          <span className="font-semibold tabular-nums text-on-surface">
                            {item.score}
                            <span className="text-on-surface-variant">/100</span>
                          </span>
                        ) : (
                          '—'
                        )}
                        {item.band && (
                          <p className="text-xs text-on-surface-variant">{item.band}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn('text-sm font-medium', statusClass(item.status))}>
                          {statusLabel(item.status)}
                          {item.partial ? ` · ${de.admin.websiteAnalyze.history.partial}` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={!item.has_report && item.status === 'failed'}
                          onClick={() => onSelect(item.id)}
                        >
                          {isOpening ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            de.admin.websiteAnalyze.history.open
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
