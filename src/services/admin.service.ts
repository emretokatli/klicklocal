import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api-client';
import type {
  AdminUser,
  AiPromptTemplate,
  Coupon,
  Invoice,
  Plan,
  PlatformSettings,
  Subscription,
  SubscriptionUsageRow,
  Transaction,
  InstagramProviderSettings,
  SocialProviderKey,
  SocialProviderSettings,
  UpdateSocialProviderPayload,
  UsageRecord,
  WebAnalyzeResult,
  WebAnalyzeRun,
  WebAnalyzeRunSummary,
  Workspace,
} from '@/types/api';

export const adminService = {
  users() {
    return apiGet<{ users: AdminUser[] }>('/admin/users').then((d) => d.users);
  },

  updateUserRoles(id: number, roles: string[]) {
    return apiPut<{ user: AdminUser }>(`/admin/users/${id}/roles`, { roles }).then(
      (d) => d.user,
    );
  },

  workspaces() {
    return apiGet<{ workspaces: Workspace[] }>('/admin/workspaces').then(
      (d) => d.workspaces,
    );
  },

  plans() {
    return apiGet<{ plans: Plan[] }>('/admin/plans').then((d) => d.plans);
  },

  featureKeys() {
    return apiGet<{ keys: string[] }>('/admin/plans/feature-keys').then(
      (d) => d.keys,
    );
  },

  subscriptions() {
    return apiGet<{ subscriptions: Subscription[] }>('/admin/subscriptions').then(
      (d) => d.subscriptions,
    );
  },

  assignSubscription(workspaceId: number, planId: number, billingCycle = 'monthly') {
    return apiPost<{ subscription: Subscription }>('/admin/subscriptions', {
      workspace_id: workspaceId,
      plan_id: planId,
      billing_cycle: billingCycle,
    }).then((d) => d.subscription);
  },

  cancelSubscription(id: number) {
    return apiDelete<null>(`/admin/subscriptions/${id}`);
  },

  grantDemo(workspaceId: number, days: number) {
    return apiPost<{ subscription: Subscription }>('/admin/subscriptions/demo', {
      workspace_id: workspaceId,
      days,
    }).then((d) => d.subscription);
  },

  transactions(limit = 100) {
    return apiGet<{ transactions: Transaction[] }>(
      `/admin/transactions?limit=${limit}`,
    ).then((d) => d.transactions);
  },

  coupons() {
    return apiGet<{ coupons: Coupon[] }>('/admin/coupons').then((d) => d.coupons);
  },

  createCoupon(payload: {
    code: string;
    name: string;
    type: string;
    value: number;
    max_redemptions?: number;
    is_active?: boolean;
  }) {
    return apiPost<{ coupon: Coupon }>('/admin/coupons', payload).then(
      (d) => d.coupon,
    );
  },

  updateCoupon(id: number, payload: Partial<Coupon>) {
    return apiPut<{ coupon: Coupon }>(`/admin/coupons/${id}`, payload).then(
      (d) => d.coupon,
    );
  },

  settings() {
    return apiGet<{ settings: PlatformSettings }>('/admin/settings').then(
      (d) => d.settings,
    );
  },

  updateSettings(payload: Partial<PlatformSettings>) {
    return apiPut<{ settings: PlatformSettings }>('/admin/settings', payload).then(
      (d) => d.settings,
    );
  },

  aiPrompts(params?: { category?: string; active_only?: boolean }) {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.active_only) q.set('active_only', '1');
    const suffix = q.toString() ? `?${q}` : '';
    return apiGet<{ prompts: AiPromptTemplate[] }>(`/admin/ai-prompts${suffix}`).then(
      (d) => d.prompts,
    );
  },

  setAiPromptActive(id: number, isActive: boolean) {
    return apiPatch<{ prompt: AiPromptTemplate }>(
      `/admin/ai-prompts/${id}/active`,
      { is_active: isActive },
    ).then((d) => d.prompt);
  },

  analyzeWebsite(website: string) {
    return apiPost<{ run: WebAnalyzeRun }>(
      '/admin/website-analyze',
      { website },
      { timeout: 30_000 },
    ).then((d) => d.run);
  },

  websiteAnalyzeRuns(limit = 30) {
    return apiGet<{ runs: WebAnalyzeRunSummary[] }>(
      `/admin/website-analyze?limit=${limit}`,
    ).then((d) => d.runs);
  },

  websiteAnalyzeRun(id: string) {
    return apiGet<{ run: WebAnalyzeRun }>(`/admin/website-analyze/${id}`).then(
      (d) => d.run,
    );
  },

  providers() {
    return apiGet<{ providers: SocialProviderSettings[] }>(
      '/admin/providers',
    ).then((d) => d.providers);
  },

  updateProvider(provider: SocialProviderKey, payload: UpdateSocialProviderPayload) {
    return apiPut<{ provider: SocialProviderSettings }>(
      `/admin/providers/${provider}`,
      payload,
    ).then((d) => d.provider);
  },

  updateInstagramProvider(payload: UpdateSocialProviderPayload) {
    return this.updateProvider('instagram', payload);
  },

  usage(params?: { workspace_id?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.workspace_id) q.set('workspace_id', String(params.workspace_id));
    if (params?.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return apiGet<{
      summary?: Record<string, number>;
      subscription_usage?: Record<string, number>;
      billing_summary?: unknown;
      analytics_records?: UsageRecord[];
      subscription_usage_rows?: SubscriptionUsageRow[];
    }>(`/admin/usage${suffix}`);
  },
};
