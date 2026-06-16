'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { de } from '@/lib/i18n/de';
import { formatMoney } from '@/lib/format-money';
import { getStoredWorkspaceId } from '@/lib/token';
import type { PaywallReason } from '@/lib/paywall-bus';
import { billingService } from '@/services/billing.service';
import type { Plan } from '@/types/api';

type PaywallModalProps = {
  open: boolean;
  reason: PaywallReason;
  onClose: () => void;
};

function reasonLine(reason: PaywallReason): string {
  const r = de.paywall.reasons;
  switch (reason) {
    case 'publish':
      return r.publish;
    case 'ai':
      return r.ai;
    case 'media':
      return r.media;
    default:
      return r.default;
  }
}

function PlanRow({ plan }: { plan: Plan }) {
  return (
    <div className="glass-card flex items-center justify-between gap-3 rounded-2xl border border-outline-soft px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-on-surface">
          {plan.name}
        </p>
        {plan.trial_days > 0 && (
          <p className="text-xs text-on-surface-variant">
            {de.paywall.trialSuffix(plan.trial_days)}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-base font-bold text-on-surface">
          {formatMoney(plan.monthly_price)}
        </span>{' '}
        <span className="text-xs text-on-surface-variant">
          {de.paywall.perMonth}
        </span>
      </div>
    </div>
  );
}

/**
 * Central subscription paywall. Rendered once globally (via PaywallProvider) and
 * opened by any 402 anywhere in the app. Plan prices come from the ungated
 * `GET /billing → available_plans`; if that is still loading or fails the modal
 * still renders the benefits + a working "Plan wählen" button to /billing.
 */
export function PaywallModal({ open, reason, onClose }: PaywallModalProps) {
  const router = useRouter();
  const workspaceId = getStoredWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => billingService.overview(workspaceId!),
    enabled: open && workspaceId !== null,
    staleTime: 60_000,
  });

  const plans = data?.available_plans ?? [];

  const goToBilling = () => {
    onClose();
    router.push('/billing');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="chip-primary mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {de.paywall.eyebrow}
          </p>
          <DialogTitle className="text-gradient-brand text-2xl font-extrabold">
            {de.paywall.title}
          </DialogTitle>
          <p className="text-sm text-on-surface-variant">{reasonLine(reason)}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-outline-soft bg-fill-soft p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {de.paywall.benefitsTitle}
            </p>
            <ul className="space-y-2">
              {de.paywall.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-on-surface"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {de.paywall.plansTitle}
            </p>
            {plans.length > 0 ? (
              plans.map((plan) => <PlanRow key={plan.id} plan={plan} />)
            ) : (
              <p className="text-sm text-on-surface-variant">
                {isLoading ? de.paywall.plansLoading : de.paywall.plansFallback}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button className="w-full" onClick={goToBilling}>
            {de.paywall.choosePlan}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {de.paywall.dismiss}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
