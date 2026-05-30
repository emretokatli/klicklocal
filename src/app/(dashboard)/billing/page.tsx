'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { UsageMeters } from '@/components/billing/UsageMeters';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { de } from '@/lib/i18n/de';
import { formatMoney } from '@/lib/format-money';
import { ApiClientError } from '@/services/api-client';
import { billingService } from '@/services/billing.service';
import { useWorkspace } from '@/store/workspace-context';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const { workspaceId, workspace } = useWorkspace();
  const [planId, setPlanId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => billingService.overview(workspaceId!),
    enabled: workspaceId !== null,
  });

  const subscribeMutation = useMutation({
    mutationFn: () =>
      billingService.subscribe(workspaceId!, Number(planId)),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.billing.errors.subscribe,
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancel(workspaceId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
    },
    onError: (e: Error) => {
      setError(
        e instanceof ApiClientError ? e.message : de.billing.errors.cancel,
      );
    },
  });

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.billing.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  const sub = query.data?.subscription;
  const plan = query.data?.plan;

  return (
    <div>
      <PageHeader
        title={de.billing.title}
        description={`${de.billing.description} — ${workspace?.name ?? ''}`}
      />

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{de.billing.currentPlan}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {plan ? (
              <>
                <p className="text-lg font-semibold">{plan.name}</p>
                <p className="text-on-surface-variant">{plan.description}</p>
                <p>
                  {formatMoney(plan.monthly_price)} / {de.admin.plans.monthly}
                  {plan.trial_days > 0 && (
                    <span className="text-on-surface-variant">
                      {' '}
                      · {plan.trial_days} {de.admin.plans.trialDays}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-on-surface-variant">{de.billing.noSubscription}</p>
            )}
            {sub && (
              <div className="space-y-1 border-t border-white/10 pt-3 text-on-surface-variant">
                <p>
                  {de.billing.status}: <span className="text-on-surface">{sub.status}</span>
                </p>
                <p>
                  {de.billing.provider}: {sub.provider}
                </p>
                {sub.trial_ends_at && (
                  <p>
                    {de.billing.trialEnds}:{' '}
                    {new Date(sub.trial_ends_at).toLocaleDateString('de-DE')}
                  </p>
                )}
                {sub.renewal_at && (
                  <p>
                    {de.billing.renewal}:{' '}
                    {new Date(sub.renewal_at).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {!sub && (
                <>
                  <Select value={planId} onValueChange={setPlanId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={de.billing.selectPlan} />
                    </SelectTrigger>
                    <SelectContent>
                      {query.data?.available_plans?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!planId || subscribeMutation.isPending}
                    onClick={() => subscribeMutation.mutate()}
                  >
                    {de.billing.subscribe}
                  </Button>
                </>
              )}
              {sub && ['active', 'trialing'].includes(sub.status) && (
                <Button
                  variant="outline"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (confirm(de.billing.cancelConfirm)) {
                      cancelMutation.mutate();
                    }
                  }}
                >
                  {de.billing.cancelPlan}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {query.data?.usage && (
          <UsageMeters usage={query.data.usage} />
        )}
      </div>
    </div>
  );
}
