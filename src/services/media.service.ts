import { apiGet, apiUpload } from '@/services/api-client';
import type { MediaWithUrl } from '@/types/api';

export const mediaService = {
  list(workspaceId: number) {
    return apiGet<{ items: MediaWithUrl[] }>(
      `/media?workspace_id=${workspaceId}`,
    ).then((d) => d.items);
  },

  upload(workspaceId: number, file: File, onProgress?: (pct: number) => void) {
    const form = new FormData();
    form.append('workspace_id', String(workspaceId));
    form.append('file', file);

    return import('@/services/api-client').then(({ apiClient }) =>
      apiClient
        .post<{ success: boolean; data: MediaWithUrl }>(
          '/media/upload',
          form,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
              if (e.total && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
              }
            },
          },
        )
        .then((res) => res.data.data),
    );
  },
};
