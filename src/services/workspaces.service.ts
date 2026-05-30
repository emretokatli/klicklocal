import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api-client';
import type { Workspace } from '@/types/api';

export const workspacesService = {
  list() {
    return apiGet<{ workspaces: Workspace[] }>('/workspaces').then(
      (d) => d.workspaces,
    );
  },

  create(name: string, timezone = 'UTC') {
    return apiPost<{ workspace: Workspace }>('/workspaces', {
      name,
      timezone,
    }).then((d) => d.workspace);
  },

  update(id: number, payload: { name?: string; timezone?: string }) {
    return apiPut<{ workspace: Workspace }>(`/workspaces/${id}`, payload).then(
      (d) => d.workspace,
    );
  },

  remove(id: number) {
    return apiDelete<null>(`/workspaces/${id}`);
  },
};
