import { apiGet, apiPost } from '@/services/api-client';
import type { BillingOverview, Invoice, Subscription } from '@/types/api';

function withWorkspace(workspaceId: number, path: string) {
  return `${path}?workspace_id=${workspaceId}`;
}

export const billingService = {
  overview(workspaceId: number) {
    return apiGet<BillingOverview>(withWorkspace(workspaceId, '/billing'));
  },

  subscription(workspaceId: number) {
    return apiGet<{ subscription: Subscription | null }>(
      withWorkspace(workspaceId, '/subscription'),
    ).then((d) => d.subscription);
  },

  subscribe(workspaceId: number, planId: number, billingCycle = 'monthly') {
    return apiPost<{ subscription: Subscription }>(
      withWorkspace(workspaceId, '/subscription'),
      { plan_id: planId, billing_cycle: billingCycle },
    ).then((d) => d.subscription);
  },

  cancel(workspaceId: number) {
    return apiPost<{ subscription: Subscription }>(
      withWorkspace(workspaceId, '/subscription/cancel'),
    ).then((d) => d.subscription);
  },

  usage(workspaceId: number) {
    return apiGet<{ usage: BillingOverview['usage'] }>(
      withWorkspace(workspaceId, '/usage'),
    ).then((d) => d.usage);
  },

  invoices(workspaceId: number) {
    return apiGet<{ invoices: Invoice[] }>(
      withWorkspace(workspaceId, '/invoices'),
    ).then((d) => d.invoices);
  },
};
