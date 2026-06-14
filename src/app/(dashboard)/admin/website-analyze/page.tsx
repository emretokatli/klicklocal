'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { WebAnalyzeReport } from '@/components/admin/website-analyze/WebAnalyzeReport';
import { WebsiteAnalyzeHistory } from '@/components/admin/website-analyze/WebsiteAnalyzeHistory';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { de } from '@/lib/i18n/de';
import { ApiClientError } from '@/services/api-client';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/store/auth-context';
import type { WebAnalyzeRun } from '@/types/api';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRunning(status: WebAnalyzeRun['status']) {
  return status === 'pending' || status === 'processing';
}

export default function AdminWebsiteAnalyzePage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [website, setWebsite] = useState('');
  const [run, setRun] = useState<WebAnalyzeRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRunId, setLoadingRunId] = useState<string | null>(null);
  const pollAbortRef = useRef(false);
  const initialRunLoaded = useRef(false);

  const historyQuery = useQuery({
    queryKey: ['admin', 'website-analyze', 'history'],
    queryFn: () => adminService.websiteAnalyzeRuns(),
    enabled: hasPermission('manage_ai_prompts'),
  });

  const setRunInUrl = useCallback(
    (runId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (runId) {
        params.set('run', runId);
      } else {
        params.delete('run');
      }
      const query = params.toString();
      router.replace(query ? `/admin/website-analyze?${query}` : '/admin/website-analyze');
    },
    [router, searchParams],
  );

  // Re-fetches the run every few seconds until it leaves pending/processing
  const pollUntilFinished = useCallback(async (initial: WebAnalyzeRun) => {
    let latest = initial;
    while (!pollAbortRef.current && isRunning(latest.status)) {
      await sleep(3000);
      latest = await adminService.websiteAnalyzeRun(initial.id);
      setRun(latest);
    }
    return latest;
  }, []);

  const loadRun = useCallback(
    async (runId: string) => {
      pollAbortRef.current = false;
      setLoadingRunId(runId);
      setError(null);

      try {
        const initial = await adminService.websiteAnalyzeRun(runId);
        setRun(initial);
        setRunInUrl(runId);
        // the report renders above the history table — bring it into view
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const latest = await pollUntilFinished(initial);

        if (latest.status === 'failed' && !latest.result?.report_markdown) {
          setError(latest.error_message ?? de.admin.websiteAnalyze.failed);
        }

        void queryClient.invalidateQueries({ queryKey: ['admin', 'website-analyze', 'history'] });
      } catch (e) {
        setError(
          e instanceof ApiClientError ? e.message : de.admin.websiteAnalyze.failed,
        );
      } finally {
        setLoadingRunId(null);
      }
    },
    [pollUntilFinished, queryClient, setRunInUrl],
  );

  useEffect(() => {
    pollAbortRef.current = false;
    return () => {
      pollAbortRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (initialRunLoaded.current || !hasPermission('manage_ai_prompts')) return;

    const runId = searchParams.get('run');
    if (!runId) {
      initialRunLoaded.current = true;
      return;
    }

    initialRunLoaded.current = true;
    // defer so the effect itself doesn't set state synchronously
    queueMicrotask(() => void loadRun(runId));
  }, [hasPermission, loadRun, searchParams]);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      pollAbortRef.current = false;
      const initialRun = await adminService.analyzeWebsite(url);
      setRun(initialRun);
      setRunInUrl(initialRun.id);

      return pollUntilFinished(initialRun);
    },
    onSuccess: (finishedRun) => {
      setRun(finishedRun);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'website-analyze', 'history'] });

      if (finishedRun.status === 'failed') {
        setError(finishedRun.error_message ?? de.admin.websiteAnalyze.failed);
      } else {
        setError(null);
      }
    },
    onError: (e: Error) => {
      setRun(null);
      setRunInUrl(null);
      setError(
        e instanceof ApiClientError ? e.message : de.admin.websiteAnalyze.failed,
      );
    },
  });

  if (!hasPermission('manage_ai_prompts')) {
    return <p className="text-sm text-on-surface-variant">{de.common.noData}</p>;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = website.trim();
    if (!trimmed) return;
    setError(null);
    analyzeMutation.mutate(trimmed);
  };

  const result = run?.result ?? null;
  const isPending =
    analyzeMutation.isPending ||
    (run !== null && isRunning(run.status) && !loadingRunId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={de.admin.websiteAnalyze.title}
        description={de.admin.websiteAnalyze.description}
      />

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/90 via-primary to-violet-600 text-on-primary shadow-lg">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {de.admin.websiteAnalyze.heroTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
            {de.admin.websiteAnalyze.heroSubtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <Input
              type="url"
              inputMode="url"
              placeholder={de.admin.websiteAnalyze.urlPlaceholder}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isPending}
              className="h-12 flex-1 border-white/20 bg-white text-on-surface shadow-sm"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !website.trim()}
              className="h-12 gap-2 bg-white text-primary hover:bg-white/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isPending
                ? de.admin.websiteAnalyze.analyzing
                : de.admin.websiteAnalyze.analyze}
            </Button>
          </form>

          {isPending && (
            <div className="mt-4 space-y-1 text-sm text-white/80">
              <p>{de.admin.websiteAnalyze.longRunningHint}</p>
              {run && (
                <p>
                  {de.admin.websiteAnalyze.statusLabel}:{' '}
                  {run.status === 'processing'
                    ? de.admin.websiteAnalyze.statusProcessing
                    : de.admin.websiteAnalyze.statusQueued}
                </p>
              )}
              <p className="text-xs text-white/70">
                {de.admin.websiteAnalyze.queueHint}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingRunId && !result?.report_markdown && (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" />
          {de.admin.websiteAnalyze.history.loadingRun}
        </div>
      )}

      {error && (
        <Card className="border-error/30 bg-error-container/20">
          <CardContent className="space-y-2 pt-6 text-sm text-error">
            <p>{error}</p>
            {run?.partial && result?.report_markdown && (
              <p className="text-on-surface-variant">
                {de.admin.websiteAnalyze.partialHint}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {result?.report_markdown && (
        <WebAnalyzeReport result={result} run={run} />
      )}

      <WebsiteAnalyzeHistory
        runs={historyQuery.data ?? []}
        isLoading={historyQuery.isLoading}
        selectedId={run?.id ?? null}
        loadingId={loadingRunId}
        onSelect={(id) => void loadRun(id)}
      />
    </div>
  );
}
