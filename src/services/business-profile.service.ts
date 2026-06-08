import { apiGet, apiPut } from '@/services/api-client';
import type { BusinessProfile, BusinessProfileInput } from '@/types/api';

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
};
