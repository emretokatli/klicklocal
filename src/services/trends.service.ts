import { apiGet } from '@/services/api-client';
import type { TrendsResponse } from '@/types/api';

export const trendsService = {
  // Workspace is resolved server-side from the X-Workspace-Id header.
  list() {
    return apiGet<TrendsResponse>('/trends');
  },
};
