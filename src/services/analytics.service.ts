import { apiGet } from '@/services/api-client';

export interface KpiData {
  impressions: number;
  reach: number;
  engagement_rate: number;
  published_posts: number;
  is_estimated: boolean;
}

export const analyticsService = {
  kpi(workspaceId: number) {
    return apiGet<{ kpi: KpiData }>(`/analytics/kpi?workspace_id=${workspaceId}`)
      .then((d) => d.kpi);
  },
};
