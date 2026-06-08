import { apiGet, apiPost } from '@/services/api-client';
import type { AiGeneration } from '@/types/api';

export const aiService = {
  generate(
    workspaceId: number,
    payload: { media_id?: number | null; prompt?: string | null },
  ) {
    return apiPost<{ generation: AiGeneration }>('/ai/generate', {
      workspace_id: workspaceId,
      ...payload,
    }).then((d) => d.generation);
  },

  history(workspaceId: number) {
    return apiGet<{ generations: AiGeneration[] }>(
      `/ai/generations?workspace_id=${workspaceId}`,
    ).then((d) => d.generations);
  },
};
