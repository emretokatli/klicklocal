import { apiGet, apiPost } from '@/services/api-client';
import type { AiGeneration } from '@/types/api';

export type GenerateImageResult = {
  image_url: string;
  model: string;
  revised_prompt: string;
};

export const aiService = {
  generate(
    workspaceId: number,
    payload: {
      media_id?: number | null;
      prompt?: string | null;
      platform?: string | null;
      content_type?: string | null;
      seo_focus?: string | null;
    },
  ) {
    return apiPost<{ generation: AiGeneration }>('/ai/generate', {
      workspace_id: workspaceId,
      ...payload,
    }).then((d) => d.generation);
  },

  generateImage(
    workspaceId: number,
    payload: {
      prompt?: string;
      platform?: string;
      content_type?: string;
      generation_id?: number;
    },
  ) {
    return apiPost<GenerateImageResult>('/ai/generate-image', {
      workspace_id: workspaceId,
      ...payload,
    });
  },

  history(workspaceId: number) {
    return apiGet<{ generations: AiGeneration[] }>(
      `/ai/generations?workspace_id=${workspaceId}`,
    ).then((d) => d.generations);
  },
};
