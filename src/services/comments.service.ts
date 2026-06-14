import { apiGet, apiPost } from '@/services/api-client';
import type { Comment, CommentStats } from '@/types/api';

export const commentsService = {
  list(workspaceId: number, filters?: { platform?: string; sentiment?: string }) {
    const params = new URLSearchParams({ workspace_id: String(workspaceId) });
    if (filters?.platform) params.set('platform', filters.platform);
    if (filters?.sentiment) params.set('sentiment', filters.sentiment);
    return apiGet<{ comments: Comment[] }>(`/comments?${params}`).then((d) => d.comments);
  },

  stats(workspaceId: number, filters?: { platform?: string }) {
    const params = new URLSearchParams({ workspace_id: String(workspaceId) });
    if (filters?.platform) params.set('platform', filters.platform);
    return apiGet<{ stats: CommentStats }>(`/comments/stats?${params}`).then((d) => d.stats);
  },

  suggestReply(commentId: number) {
    return apiPost<{ comment: Comment }>(`/comments/${commentId}/suggest-reply`).then(
      (d) => d.comment,
    );
  },

  reply(commentId: number, replyText: string) {
    return apiPost<{ comment: Comment }>(`/comments/${commentId}/reply`, {
      reply_text: replyText,
    }).then((d) => d.comment);
  },

  create(workspaceId: number, payload: {
    platform: string;
    author: string;
    text: string;
    sentiment?: string;
  }) {
    return apiPost<{ comment: Comment }>('/comments', {
      workspace_id: workspaceId,
      ...payload,
    }).then((d) => d.comment);
  },
};
