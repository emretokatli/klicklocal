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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { de } from '@/lib/i18n/de';
import { formatMoney } from '@/lib/format-money';
import { ApiClientError } from '@/services/api-client';
import { billingService } from '@/services/billing.service';
import { useWorkspace } from '@/store/workspace-context';
import { cn } from '@/lib/utils';

type Tab = 'subscription' | 'invoices' | 'transactions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'subscription', label: 'Abonnement' },
  { id: 'invoices',     label: de.nav.invoices },
  { id: 'transactions', label: de.nav.transactions },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'succeeded' || status === 'paid' || status === 'completed'
      ? 'bg-green-500/15 text-green-400'
      : status === 'failed'
      ? 'bg-red-500/15 text-red-400'
      : status === 'refunded'
      ? 'bg-blue-500/15 text-blue-400'
      : 'bg-yellow-500/15 text-yellow-400';

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

function SubscriptionTab({ workspaceId, workspace }: { workspaceId: number; workspace: { name: string } | null }) {
  const queryClient = useQueryClient();
  const [planId, setPlanId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [topupNotice, setTopupNotice] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => billingService.overview(workspaceId),
    enabled: true,
  });

  const packagesQuery = useQuery({
    queryKey: ['topup-packages', workspaceId],
    queryFn: () => billingService.topupPackages(workspaceId),
    enabled: true,
  });

  const topupMutation = useMutation({
    mutationFn: (packageKey: string) => billingService.purchaseTopup(workspaceId, packageKey),
    onSuccess: () => {
      setTopupNotice(de.billing.topup.success);
      void queryClient.invalidateQueries({ queryKey: ['usage', workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
    },
    onError: () => setTopupNotice(de.billing.topup.error),
  });

  const subscribeMutation = useMutation({
    mutationFn: () => billingService.subscribe(workspaceId, Number(planId)),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (e: Error) => {
      setError(e instanceof ApiClientError ? e.message : de.billing.errors.subscribe);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingService.cancel(workspaceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
    },
    onError: (e: Error) => {
      setError(e instanceof ApiClientError ? e.message : de.billing.errors.cancel);
    },
  });

  const sub = query.data?.subscription;
  const plan = query.data?.plan;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-error">{error}</p>}

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
                      {' '}· {plan.trial_days} {de.admin.plans.trialDays}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-on-surface-variant">{de.billing.noSubscription}</p>
            )}
            {sub && (
              <div className="space-y-1 border-t border-white/10 pt-3 text-on-surface-variant">
                <p>{de.billing.status}: <span className="text-on-surface">{sub.status}</span></p>
                <p>{de.billing.provider}: {sub.provider}</p>
                {sub.trial_ends_at && (
                  <p>{de.billing.trialEnds}: {new Date(sub.trial_ends_at).toLocaleDateString('de-DE')}</p>
                )}
                {sub.renewal_at && (
                  <p>{de.billing.renewal}: {new Date(sub.renewal_at).toLocaleDateString('de-DE')}</p>
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
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
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
                    if (confirm(de.billing.cancelConfirm)) cancelMutation.mutate();
                  }}
                >
                  {de.billing.cancelPlan}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {query.data?.usage && <UsageMeters usage={query.data.usage} />}
      </div>

      {packagesQuery.data && packagesQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{de.billing.topup.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topupNotice && (
              <p className={`text-sm ${topupNotice === de.billing.topup.success ? 'text-primary' : 'text-error'}`}>
                {topupNotice}
              </p>
            )}
            {packagesQuery.data.map((pkg) => (
              <div
                key={pkg.key}
                className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{pkg.label}</p>
                  <p className="text-xs text-on-surface-variant">{formatMoney(pkg.price)}</p>
                </div>
                <Button
                  size="sm"
                  disabled={topupMutation.isPending}
                  onClick={() => {
                    if (confirm(de.billing.topup.confirm(pkg.label))) {
                      setTopupNotice(null);
                      topupMutation.mutate(pkg.key);
                    }
                  }}
                >
                  {de.billing.topup.buyButton}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvoicesTab({ workspaceId }: { workspaceId: number }) {
  const query = useQuery({
    queryKey: ['invoices', workspaceId],
    queryFn: () => billingService.invoices(workspaceId),
    enabled: true,
  });

  if (!query.data?.length && !query.isLoading) {
    return <EmptyState title={de.billing.noInvoices} description="" />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{de.billing.invoiceNumber}</TableHead>
              <TableHead>{de.billing.amount}</TableHead>
              <TableHead>{de.common.status}</TableHead>
              <TableHead>{de.billing.paidAt}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                <TableCell>{formatMoney(inv.amount, inv.currency)}</TableCell>
                <TableCell>{inv.status}</TableCell>
                <TableCell>
                  {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('de-DE') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TransactionsTab({ workspaceId }: { workspaceId: number }) {
  const query = useQuery({
    queryKey: ['transactions', workspaceId],
    queryFn: () => billingService.transactions(workspaceId),
    enabled: true,
  });

  if (!query.data?.length && !query.isLoading) {
    return <EmptyState title={de.billing.noTransactions} description="" />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{de.billing.transactionDate}</TableHead>
              <TableHead>{de.billing.transactionDesc}</TableHead>
              <TableHead>{de.billing.amount}</TableHead>
              <TableHead>{de.common.status}</TableHead>
              <TableHead>{de.billing.transactionProvider}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {new Date(tx.created_at).toLocaleDateString('de-DE')}
                </TableCell>
                <TableCell className="font-mono text-xs text-on-surface-variant">
                  {tx.provider_transaction_id ?? '—'}
                </TableCell>
                <TableCell>{formatMoney(tx.amount, tx.currency)}</TableCell>
                <TableCell><StatusBadge status={tx.status} /></TableCell>
                <TableCell className="text-sm">{tx.provider}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<Tab>('subscription');

  if (!workspaceId) {
    return (
      <EmptyState
        title={de.billing.noWorkspace}
        description={de.dashboard.selectWorkspace}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={de.billing.title}
        description={`${de.billing.description} — ${workspace?.name ?? ''}`}
      />

      {/* Tab Bar */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white/5 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'subscription' && (
        <SubscriptionTab workspaceId={workspaceId} workspace={workspace} />
      )}
      {activeTab === 'invoices' && (
        <InvoicesTab workspaceId={workspaceId} />
      )}
      {activeTab === 'transactions' && (
        <TransactionsTab workspaceId={workspaceId} />
      )}
    </div>
  );
}
