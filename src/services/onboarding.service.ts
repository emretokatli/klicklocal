import { apiPatch } from '@/services/api-client';
import type { Workspace } from '@/types/api';

export const onboardingService = {
  update(
    workspaceId: number,
    payload: { step?: number; completed?: boolean },
  ) {
    return apiPatch<{ workspace: Workspace }>(
      `/workspaces/${workspaceId}/onboarding`,
      payload,
    ).then((d) => d.workspace);
  },
};
