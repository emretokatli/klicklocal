import { apiGet } from '@/services/api-client';
import type { ContentPlanResponse } from '@/types/api';

export const contentPlanService = {
  // Subscription-gated; workspace resolved server-side from X-Workspace-Id.
  weekly() {
    return apiGet<ContentPlanResponse>('/content-plan/weekly');
  },
};
