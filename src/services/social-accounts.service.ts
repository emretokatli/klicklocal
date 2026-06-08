import { apiGet, apiPost } from '@/services/api-client';
import type {
  InstagramConnectionStatus,
  TikTokConnectionStatus,
} from '@/types/api';

function withWorkspace(workspaceId: number, path: string) {
  return `${path}?workspace_id=${workspaceId}`;
}

export const socialAccountsService = {
  instagramConnect(workspaceId: number) {
    return apiGet<{ authorization_url: string }>(
      withWorkspace(workspaceId, '/social-accounts/instagram/connect'),
    ).then((d) => d.authorization_url);
  },

  instagramStatus(workspaceId: number) {
    return apiGet<InstagramConnectionStatus>(
      withWorkspace(workspaceId, '/social-accounts/instagram/status'),
    );
  },

  instagramDisconnect(workspaceId: number) {
    return apiPost<null>(
      withWorkspace(workspaceId, '/social-accounts/instagram/disconnect'),
    );
  },

  tiktokConnect(workspaceId: number) {
    return apiGet<{ authorization_url: string }>(
      withWorkspace(workspaceId, '/social-accounts/tiktok/connect'),
    ).then((d) => d.authorization_url);
  },

  tiktokStatus(workspaceId: number) {
    return apiGet<TikTokConnectionStatus>(
      withWorkspace(workspaceId, '/social-accounts/tiktok/status'),
    );
  },

  tiktokDisconnect(workspaceId: number) {
    return apiPost<null>(
      withWorkspace(workspaceId, '/social-accounts/tiktok/disconnect'),
    );
  },
};
