import { apiGet, apiPut } from '@/services/api-client';
import type {
  BusinessProfile,
  BusinessProfileInput,
  WebsiteAnalysisResponse,
} from '@/types/api';

export const businessProfileService = {
  get(workspaceId: number) {
    return apiGet<{ business_profile: BusinessProfile | null }>(
      `/workspaces/${workspaceId}/business-profile`,
    ).then((d) => d.business_profile);
  },

  save(workspaceId: number, payload: BusinessProfileInput) {
    return apiPut<{ business_profile: BusinessProfile }>(
      `/workspaces/${workspaceId}/business-profile`,
      payload,
    ).then((d) => d.business_profile);
  },

  // Workspace is resolved server-side from the X-Workspace-Id header (auto-
  // attached by api-client). The tier (teaser/full) is decided by the backend.
  analysis() {
    return apiGet<WebsiteAnalysisResponse>('/business-profile/analysis');
  },
};
